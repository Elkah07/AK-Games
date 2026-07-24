(function () {
  "use strict";

  const firebaseConfig = {
    apiKey: "AIzaSyB0k4jrbmlMa-nFWXiVTKayscEnwMU8gT8",
    authDomain: "ak-games-4a2cd.firebaseapp.com",
    databaseURL: "https://ak-games-4a2cd-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "ak-games-4a2cd",
    storageBucket: "ak-games-4a2cd.firebasestorage.app",
    messagingSenderId: "675954325961",
    appId: "1:675954325961:web:ad01001a6a3cf8aaca5018",
    measurementId: "G-J6FPW7T4ZE"
  };

  if (!window.firebase) {
    console.error("Firebase SDK introuvable.");
    return;
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const auth = firebase.auth();
  const db = firebase.database();
  let currentUser = null;
  let serverTimeOffset = 0;

  db.ref(".info/serverTimeOffset").on(
    "value",
    snapshot => {
      serverTimeOffset = Number(snapshot.val() || 0);
    },
    () => {
      serverTimeOffset = 0;
    }
  );

  const readyPromise = new Promise((resolve, reject) => {
    auth.onAuthStateChanged(async user => {
      try {
        if (user) {
          currentUser = user;
          resolve(user);
          return;
        }

        const credential = await auth.signInAnonymously();
        currentUser = credential.user;
        resolve(currentUser);
      } catch (error) {
        reject(error);
      }
    });
  });

  const serverTimestamp = () => firebase.database.ServerValue.TIMESTAMP;
  const now = () => Date.now() + serverTimeOffset;

  const HOST_TAKEOVER_GRACE_MS = 12000;

  function cloneValue(value) {
    if (value === undefined || value === null) return value;
    return JSON.parse(JSON.stringify(value));
  }

  function gameMinimumPlayers(type) {
    if (["best-liar", "who-answered", "almost-impostor", "fake-expert"].includes(type)) {
      return 3;
    }
    return 2;
  }

  function replaceRemovedInOrder(order, removedUid, remainingIds) {
    if (!Array.isArray(order)) return order;
    if (!remainingIds.length) return [];

    return order.map((uid, index) => (
      uid === removedUid ? remainingIds[index % remainingIds.length] : uid
    ));
  }

  function removeFromShortOrder(order, removedUid) {
    if (!Array.isArray(order)) return order;
    return order.filter(uid => uid !== removedUid);
  }

  function deleteMapEntry(map, uid) {
    if (!map || typeof map !== "object" || Array.isArray(map)) return map;
    const copy = { ...map };
    delete copy[uid];
    return copy;
  }

  function repairGameAfterPlayerRemoval(game, removedUid, remainingPlayers, removedPlayer = null) {
    if (!game?.state) return game || null;

    const remainingIds = Object.keys(remainingPlayers || {});
    const originalState = game.state;
    const type = originalState.type;

    if (remainingIds.length < gameMinimumPlayers(type)) {
      return null;
    }

    const repaired = cloneValue(game);
    const state = repaired.state || {};
    const firstId = remainingIds[0] || null;
    const currentIndex = Number(state.currentIndex || state.currentRound || 0);
    const replacementAt = index => remainingIds[Math.abs(Number(index || 0)) % remainingIds.length] || firstId;

    repaired.answers = null;
    repaired.votes = null;
    repaired.actions = null;

    state.scores = deleteMapEntry(state.scores, removedUid);
    state.lives = deleteMapEntry(state.lives, removedUid);
    state.rounds = state.rounds || {};
    state.currentResult = null;
    state.lastResult = null;
    state.secretAnswer = null;
    state.secretRanking = null;
    state.currentJoke = null;
    state.punchlineVisible = false;
    state.finishedAt = null;
    state.updatedAt = now();
    state.recoveryNotice = {
      id: `recovery_${now()}_${removedUid}`,
      removedUid,
      removedName: removedPlayer?.name || "Un joueur",
      message: `${removedPlayer?.name || "Un joueur"} a été retiré de la partie. La manche reprend proprement.`,
      at: now()
    };

    state.playerOrder = removeFromShortOrder(state.playerOrder, removedUid);
    state.authorOrder = removeFromShortOrder(state.authorOrder, removedUid);
    state.answerOrder = removeFromShortOrder(state.answerOrder, removedUid);
    state.winnerIds = removeFromShortOrder(state.winnerIds, removedUid);

    state.speakerOrder = replaceRemovedInOrder(state.speakerOrder, removedUid, remainingIds);
    state.guesserOrder = replaceRemovedInOrder(state.guesserOrder, removedUid, remainingIds);
    state.impostorOrder = replaceRemovedInOrder(state.impostorOrder, removedUid, remainingIds);

    const chooseExisting = (value, fallback = firstId) => (
      remainingIds.includes(value) ? value : fallback
    );

    state.currentPlayerId = chooseExisting(state.currentPlayerId, replacementAt(currentIndex));
    state.currentTurnId = chooseExisting(state.currentTurnId, replacementAt(currentIndex));
    state.targetId = chooseExisting(state.targetId, replacementAt(currentIndex));
    state.speakerId = chooseExisting(
      state.speakerId,
      state.speakerOrder?.[currentIndex] || replacementAt(currentIndex)
    );
    state.guesserId = chooseExisting(
      state.guesserId,
      state.guesserOrder?.[currentIndex] || replacementAt(currentIndex)
    );
    state.mysteryAuthorId = chooseExisting(
      state.mysteryAuthorId,
      state.authorOrder?.[currentIndex % Math.max(1, state.authorOrder?.length || 1)] || replacementAt(currentIndex)
    );
    state.impostorId = chooseExisting(
      state.impostorId,
      state.impostorOrder?.[currentIndex] || replacementAt(currentIndex)
    );

    if (type === "laugh-duel") {
      const removedWasDuelist = state.player1Id === removedUid || state.player2Id === removedUid;

      if (removedWasDuelist) {
        const survivingDuelist = [state.player1Id, state.player2Id]
          .find(uid => uid && uid !== removedUid && remainingIds.includes(uid));

        state.phase = "final";
        state.winnerId = survivingDuelist || firstId;
        state.loserId = removedUid;
        state.currentTurnId = state.winnerId;
        state.currentJoke = null;
        state.punchlineVisible = false;
        state.finishedAt = now();
        state.recoveryNotice.message = `${removedPlayer?.name || "Un joueur"} a quitté le duel. La victoire revient à la personne encore présente.`;
        return repaired;
      }

      state.currentTurnId = chooseExisting(state.currentTurnId, state.player1Id || firstId);
      return repaired;
    }

    const restartPhaseByType = {
      "who-us": "question",
      "best-liar": "answering",
      "action-truth": "prompt",
      "never-have-i-ever": "voting",
      "would-you-rather": "voting",
      "same-brain": "answering",
      "minority": "voting",
      "who-answered": "answering",
      "almost-impostor": "roles",
      "fake-expert": "brief",
      "who-am-i": "reveal",
      "mega-turn": "turn",
      "mega-quiz": "voting",
      "mega-scenario": "voting",
      "mega-know": "target",
      "mega-ranking": "target",
      "mega-bomb": "playing"
    };

    state.phase = restartPhaseByType[type] || state.phase;
    state.answerOrder = null;
    state.mysteryAuthorId = type === "who-answered" ? null : state.mysteryAuthorId;
    state.discussionEndsAt = null;
    state.speechEndsAt = null;
    state.roundEndsAt = null;

    if (type === "almost-impostor") {
      state.impostorId = state.impostorOrder?.[currentIndex] || replacementAt(currentIndex);
    }

    if (type === "fake-expert") {
      state.speakerId = state.speakerOrder?.[currentIndex] || replacementAt(currentIndex);
      state.role = state.roleOrder?.[currentIndex] || "fake";
    }

    if (type === "who-am-i") {
      state.guesserId = state.guesserOrder?.[currentIndex] || replacementAt(currentIndex);
    }

    if (type === "mega-bomb") {
      state.currentPlayerId = chooseExisting(state.currentPlayerId, replacementAt(currentIndex));
      state.bombEndsAt = now() + Number(state.settings?.durationSeconds || 25) * 1000;
    }

    if (type === "mega-turn" && state.settings?.durationSeconds) {
      state.turnEndsAt = now() + Number(state.settings.durationSeconds || 45) * 1000;
    }

    return repaired;
  }


  function normalizeCode(value) {
    return String(value || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "")
      .replace(/^AK-?/, "");
  }

  function displayCode(value) {
    const code = normalizeCode(value);
    return code ? `AK-${code}` : "";
  }

  function randomRoomCode() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i += 1) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return code;
  }

  async function ensureUniqueRoomCode() {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const code = randomRoomCode();
      const snapshot = await db.ref(`rooms/${code}/meta`).once("value");
      if (!snapshot.exists()) return code;
    }
    throw new Error("Impossible de générer un code de salon unique.");
  }

  async function ready() {
    return readyPromise;
  }

  function attachPresence(code, uid) {
    const ref = db.ref(`rooms/${normalizeCode(code)}/players/${uid}`);

    ref.update({
      online: true,
      lastSeen: serverTimestamp()
    }).catch(() => {});

    ref.onDisconnect().update({
      online: false,
      lastSeen: serverTimestamp()
    });
  }

  async function createRoom({ name, avatarId, adult, alcohol }) {
    const user = await ready();
    const code = await ensureUniqueRoomCode();

    const updates = {};
    updates[`rooms/${code}/meta`] = {
      hostUid: user.uid,
      adult: Boolean(adult),
      alcohol: Boolean(alcohol),
      status: "lobby",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    updates[`rooms/${code}/players/${user.uid}`] = {
      name,
      avatarId,
      online: true,
      joinedAt: serverTimestamp(),
      lastSeen: serverTimestamp()
    };

    await db.ref().update(updates);
    attachPresence(code, user.uid);

    return { code: displayCode(code), key: code, uid: user.uid };
  }

  async function getRoomMeta(code) {
    await ready();
    const key = normalizeCode(code);
    if (!key) return null;

    const snapshot = await db.ref(`rooms/${key}/meta`).once("value");
    return snapshot.exists() ? snapshot.val() : null;
  }

  async function joinRoom(code, { name, avatarId }) {
    const user = await ready();
    const key = normalizeCode(code);
    const meta = await getRoomMeta(key);

    if (!meta) {
      throw new Error("Ce salon n'existe pas ou n'est plus disponible.");
    }

    if (meta.status && meta.status !== "lobby") {
      throw new Error("Une partie est déjà en cours dans ce salon. Rejoins-le à la prochaine manche.");
    }

    await db.ref(`rooms/${key}/players/${user.uid}`).set({
      name,
      avatarId,
      online: true,
      joinedAt: serverTimestamp(),
      lastSeen: serverTimestamp()
    });

    attachPresence(key, user.uid);

    return { code: displayCode(key), key, uid: user.uid, meta };
  }

  async function loadRoom(code) {
    const user = await ready();
    const key = normalizeCode(code);
    if (!key) return null;

    const snapshot = await db.ref(`rooms/${key}`).once("value");
    if (!snapshot.exists()) return null;

    const room = snapshot.val();
    if (!room.players || !room.players[user.uid]) return null;

    attachPresence(key, user.uid);
    return { code: displayCode(key), key, uid: user.uid, room };
  }

  function mergePrivateSubmissions(room, privateSubmissions, ownUid) {
    if (!room?.game) return room;

    const merged = cloneValue(room);
    const status = merged.game.submissionStatus || {};
    const revealedAnswers = merged.game.revealedAnswers || {};
    const collections = ["answers", "votes", "actions"];

    collections.forEach(collection => {
      const visible = {};
      Object.keys(status[collection] || {}).forEach(uid => {
        visible[uid] = true;
      });

      Object.entries(privateSubmissions || {}).forEach(([uid, entries]) => {
        if (entries && Object.prototype.hasOwnProperty.call(entries, collection)) {
          visible[uid] = entries[collection];
        }
      });

      if (collection === "answers") {
        Object.entries(revealedAnswers).forEach(([uid, answer]) => {
          visible[uid] = answer;
        });
      }

      merged.game[collection] = visible;
    });

    return merged;
  }

  function listenRoom(code, callback, onError) {
    const key = normalizeCode(code);
    const roomRef = db.ref(`rooms/${key}`);
    let roomValue = null;
    let privateValue = {};
    let privateRef = null;
    let privateHandler = null;
    let currentPrivatePath = "";

    const emit = () => {
      callback(roomValue ? mergePrivateSubmissions(roomValue, privateValue, currentUser?.uid) : null);
    };

    const bindPrivate = room => {
      if (!currentUser || !room?.meta) return;
      const isHost = room.meta.hostUid === currentUser.uid;
      const nextPath = isHost
        ? `roomSecrets/${key}/submissions`
        : `roomSecrets/${key}/submissions/${currentUser.uid}`;

      if (nextPath === currentPrivatePath) return;
      if (privateRef && privateHandler) privateRef.off("value", privateHandler);

      currentPrivatePath = nextPath;
      privateValue = {};
      privateRef = db.ref(nextPath);
      privateHandler = snapshot => {
        if (isHost) {
          privateValue = snapshot.val() || {};
        } else {
          privateValue = snapshot.exists() ? { [currentUser.uid]: snapshot.val() } : {};
        }
        emit();
      };
      privateRef.on("value", privateHandler, onError || console.error);
    };

    const roomHandler = snapshot => {
      roomValue = snapshot.exists() ? snapshot.val() : null;
      bindPrivate(roomValue);
      emit();
    };

    roomRef.on("value", roomHandler, onError || console.error);
    return () => {
      roomRef.off("value", roomHandler);
      if (privateRef && privateHandler) privateRef.off("value", privateHandler);
    };
  }

  async function leaveRoom(code, isHost) {
    const user = await ready();
    const key = normalizeCode(code);

    if (isHost) {
      const updates = {};
      updates[`rooms/${key}`] = null;
      updates[`roomSecrets/${key}`] = null;
      await db.ref().update(updates);
    } else {
      const updates = {};
      updates[`rooms/${key}/players/${user.uid}`] = null;
      updates[`roomSecrets/${key}/submissions/${user.uid}`] = null;
      await db.ref().update(updates);
    }
  }

  async function assertRoomCanStart(code, gameType) {
    const user = await ready();
    const key = normalizeCode(code);
    const snapshot = await db.ref(`rooms/${key}`).once("value");

    if (!snapshot.exists()) {
      throw new Error("Le salon n'existe plus.");
    }

    const room = snapshot.val() || {};

    if (room.meta?.hostUid !== user.uid) {
      throw new Error("Seul l'hôte peut lancer une partie.");
    }

    if (room.meta?.status && room.meta.status !== "lobby") {
      throw new Error("Une partie est déjà en cours.");
    }

    const players = Object.values(room.players || {});
    const offlineCount = players.filter(player => player?.online === false).length;
    const onlineCount = players.filter(player => player?.online !== false).length;

    if (offlineCount > 0) {
      throw new Error("Un joueur est déconnecté. Retire-le du salon ou attends sa reconnexion avant de lancer.");
    }

    if (onlineCount < gameMinimumPlayers(gameType)) {
      throw new Error(`Ce jeu nécessite au moins ${gameMinimumPlayers(gameType)} joueurs en ligne.`);
    }

    return room;
  }


  async function claimHost(code) {
    const user = await ready();
    const key = normalizeCode(code);
    const roomSnapshot = await db.ref(`rooms/${key}`).once("value");

    if (!roomSnapshot.exists()) return false;

    const room = roomSnapshot.val() || {};
    const currentHostUid = room.meta?.hostUid;
    const currentHost = room.players?.[currentHostUid] || null;
    const me = room.players?.[user.uid] || null;

    if (!me || me.online === false) return false;
    if (currentHostUid === user.uid) return true;

    const hostUnavailable = !currentHost
      || (
        currentHost.online === false
        && Number(currentHost.lastSeen || 0) <= now() - HOST_TAKEOVER_GRACE_MS
      );

    if (!hostUnavailable) return false;

    const candidates = Object.entries(room.players || {})
      .filter(([, player]) => player?.online !== false)
      .sort(([, a], [, b]) => Number(a?.joinedAt || 0) - Number(b?.joinedAt || 0));

    if (candidates[0]?.[0] !== user.uid) return false;

    const metaRef = db.ref(`rooms/${key}/meta`);
    const result = await metaRef.transaction(currentMeta => {
      if (!currentMeta || currentMeta.hostUid !== currentHostUid) return;

      return {
        ...currentMeta,
        hostUid: user.uid,
        updatedAt: now(),
        recoveryNotice: {
          id: `host_${now()}_${user.uid}`,
          message: `${me.name || "Un joueur"} reprend le rôle d'hôte.`,
          at: now()
        }
      };
    }, undefined, false);

    return Boolean(result.committed);
  }

  async function removeDisconnectedPlayer(code, targetUid) {
    const user = await ready();
    const key = normalizeCode(code);
    const roomRef = db.ref(`rooms/${key}`);
    let outcome = null;
    let abortReason = "Le salon a changé. Réessaie dans un instant.";

    const transaction = await roomRef.transaction(currentRoom => {
      if (!currentRoom) {
        abortReason = "Le salon n'existe plus.";
        return;
      }

      if (currentRoom.meta?.hostUid !== user.uid) {
        abortReason = "Seul l'hôte peut retirer un joueur déconnecté.";
        return;
      }

      const removedPlayer = currentRoom.players?.[targetUid];

      if (!removedPlayer) {
        outcome = { removed: false, returnedToLobby: false };
        return;
      }

      if (removedPlayer.online !== false) {
        abortReason = "Ce joueur est de nouveau en ligne.";
        return;
      }

      const remainingPlayers = { ...(currentRoom.players || {}) };
      delete remainingPlayers[targetUid];

      const repairedGame = repairGameAfterPlayerRemoval(
        currentRoom.game || null,
        targetUid,
        remainingPlayers,
        removedPlayer
      );

      const notice = {
        id: `remove_${now()}_${targetUid}`,
        message: repairedGame
          ? `${removedPlayer.name || "Un joueur"} a été retiré. La manche a été relancée sans ses anciennes réponses.`
          : `${removedPlayer.name || "Un joueur"} a été retiré. Retour au salon faute de joueurs suffisants.`,
        at: now()
      };

      const nextRoom = cloneValue(currentRoom);
      nextRoom.players = remainingPlayers;
      nextRoom.game = repairedGame;
      nextRoom.meta = {
        ...(nextRoom.meta || {}),
        status: repairedGame ? "playing" : "lobby",
        updatedAt: now(),
        recoveryNotice: notice
      };

      outcome = {
        removed: true,
        returnedToLobby: !repairedGame,
        notice
      };

      return nextRoom;
    }, undefined, false);

    if (!transaction.committed) {
      if (outcome?.removed === false) return outcome;
      throw new Error(abortReason);
    }

    return outcome || { removed: false, returnedToLobby: false };
  }


  async function startWhoUsGame(code, payload) {
    const key = normalizeCode(code);
    await assertRoomCanStart(key, "who-us");
    const updates = {};

    updates[`rooms/${key}/game`] = {
      state: {
        type: "who-us",
        phase: "question",
        sessionGameId: payload.sessionGameId,
        questions: payload.questions,
        currentIndex: 0,
        settings: payload.settings,
        rounds: {},
        currentResult: null,
        startedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      votes: {}
    };
    updates[`rooms/${key}/meta/status`] = "playing";
    updates[`rooms/${key}/meta/updatedAt`] = serverTimestamp();

    await db.ref().update(updates);
  }

  async function castWhoUsVote(code, targetUid) {
    const user = await ready();
    const key = normalizeCode(code);
    await db.ref(`rooms/${key}/game/votes/${user.uid}`).set(targetUid);
  }

  async function revealWhoUsResults(code, roundIndex, result) {
    const key = normalizeCode(code);
    const updates = {};

    updates[`rooms/${key}/game/state/phase`] = "results";
    updates[`rooms/${key}/game/state/currentResult`] = result;
    updates[`rooms/${key}/game/state/rounds/${roundIndex}`] = result;
    updates[`rooms/${key}/game/state/updatedAt`] = serverTimestamp();

    await db.ref().update(updates);
  }

  async function nextWhoUsQuestion(code, nextIndex, isFinished) {
    const key = normalizeCode(code);
    const updates = {};

    updates[`rooms/${key}/game/state/phase`] = isFinished ? "final" : "question";
    updates[`rooms/${key}/game/state/currentIndex`] = nextIndex;
    updates[`rooms/${key}/game/state/currentResult`] = null;
    updates[`rooms/${key}/game/state/finishedAt`] = isFinished ? serverTimestamp() : null;
    updates[`rooms/${key}/game/state/updatedAt`] = serverTimestamp();
    updates[`rooms/${key}/game/votes`] = null;

    await db.ref().update(updates);
  }

  async function returnToLobby(code) {
    const key = normalizeCode(code);
    const updates = {};

    updates[`rooms/${key}/game`] = null;
    updates[`roomSecrets/${key}`] = null;
    updates[`rooms/${key}/meta/status`] = "lobby";
    updates[`rooms/${key}/meta/updatedAt`] = serverTimestamp();

    await db.ref().update(updates);
  }

  async function recordSessionResult(code, summary) {
    const user = await ready();
    const key = normalizeCode(code);

    if (!summary?.id) {
      throw new Error("Résultat de soirée invalide.");
    }

    const roomMetaSnapshot = await db.ref(`rooms/${key}/meta`).once("value");
    const roomMeta = roomMetaSnapshot.val();

    if (!roomMeta || roomMeta.hostUid !== user.uid) {
      throw new Error("Seul l'hôte peut enregistrer le score de la soirée.");
    }

    const sessionRef = db.ref(`rooms/${key}/session`);
    const transaction = await sessionRef.transaction(currentValue => {
      const session = currentValue || {};
      const history = { ...(session.history || {}) };

      if (history[summary.id]) {
        return;
      }

      const scores = { ...(session.scores || {}) };
      Object.entries(summary.points || {}).forEach(([uid, value]) => {
        scores[uid] = Number(scores[uid] || 0) + Number(value || 0);
      });

      history[summary.id] = {
        id: summary.id,
        gameType: summary.gameType,
        gameName: summary.gameName,
        icon: summary.icon,
        endedAt: Number(summary.endedAt || now()),
        points: summary.points || {},
        winnerIds: summary.winnerIds || [],
        detail: summary.detail || "Partie terminée",
        players: summary.players || {}
      };

      return {
        ...session,
        scores,
        history,
        gamesPlayed: Number(session.gamesPlayed || 0) + 1,
        lastGame: summary.replay || null,
        updatedAt: now()
      };
    }, undefined, false);

    if (transaction.committed) {
      return true;
    }

    const existingSnapshot = await sessionRef.child(`history/${summary.id}`).once("value");
    return existingSnapshot.exists();
  }


  async function setGame(code, payload) {
    const key = normalizeCode(code);
    const updates = {};

    if (payload?.state?.type) {
      await assertRoomCanStart(key, payload.state.type);
    }

    const publicPayload = payload ? cloneValue(payload) : null;
    if (publicPayload) {
      publicPayload.answers = null;
      publicPayload.votes = null;
      publicPayload.actions = null;
      publicPayload.submissionStatus = { answers: {}, votes: {}, actions: {} };
      publicPayload.revealedAnswers = null;
    }

    updates[`rooms/${key}/game`] = publicPayload;
    updates[`roomSecrets/${key}`] = null;
    updates[`rooms/${key}/meta/status`] = payload ? "playing" : "lobby";
    updates[`rooms/${key}/meta/updatedAt`] = serverTimestamp();

    await db.ref().update(updates);
  }

  async function updateGame(code, updates) {
    const key = normalizeCode(code);
    const prefixedUpdates = {};
    const collectionsToClear = Object.entries(updates || {})
      .filter(([path, value]) => ["answers", "votes", "actions"].includes(path) && value === null)
      .map(([path]) => path);

    if (collectionsToClear.length) {
      const playersSnapshot = await db.ref(`rooms/${key}/players`).once("value");
      const playerIds = Object.keys(playersSnapshot.val() || {});
      collectionsToClear.forEach(collection => {
        playerIds.forEach(uid => {
          prefixedUpdates[`roomSecrets/${key}/submissions/${uid}/${collection}`] = null;
        });
        prefixedUpdates[`rooms/${key}/game/submissionStatus/${collection}`] = null;
        if (collection === "answers") {
          prefixedUpdates[`rooms/${key}/game/revealedAnswers`] = null;
        }
      });
    }

    Object.entries(updates || {}).forEach(([path, value]) => {
      if (["answers", "votes", "actions"].includes(path)) return;
      prefixedUpdates[`rooms/${key}/game/${path}`] = value;
    });

    await db.ref().update(prefixedUpdates);
  }

  async function writeOwnGameEntry(code, collection, value) {
    const allowedCollections = new Set(["answers", "votes", "actions"]);

    if (!allowedCollections.has(collection)) {
      throw new Error("Collection de jeu non autorisée.");
    }

    const user = await ready();
    const key = normalizeCode(code);
    const updates = {};
    updates[`roomSecrets/${key}/submissions/${user.uid}/${collection}`] = value;
    updates[`rooms/${key}/game/submissionStatus/${collection}/${user.uid}`] = true;
    await db.ref().update(updates);
  }

  async function clearOwnGameEntry(code, collection) {
    const allowedCollections = new Set(["answers", "votes", "actions"]);

    if (!allowedCollections.has(collection)) {
      throw new Error("Collection de jeu non autorisée.");
    }

    const user = await ready();
    const key = normalizeCode(code);
    const updates = {};
    updates[`roomSecrets/${key}/submissions/${user.uid}/${collection}`] = null;
    updates[`rooms/${key}/game/submissionStatus/${collection}/${user.uid}`] = null;
    await db.ref().update(updates);
  }

  window.AKFirebase = {
    ready,
    auth,
    db,
    normalizeCode,
    displayCode,
    createRoom,
    getRoomMeta,
    joinRoom,
    loadRoom,
    listenRoom,
    leaveRoom,
    claimHost,
    removeDisconnectedPlayer,
    repairGameAfterPlayerRemoval,
    assertRoomCanStart,
    startWhoUsGame,
    castWhoUsVote,
    revealWhoUsResults,
    nextWhoUsQuestion,
    returnToLobby,
    recordSessionResult,
    setGame,
    updateGame,
    writeOwnGameEntry,
    clearOwnGameEntry,
    now,
    getCurrentUser: () => currentUser
  };
})();
