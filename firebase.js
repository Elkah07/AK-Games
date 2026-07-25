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
  const MAX_ROOM_PLAYERS = 20;
  const MAX_SESSION_HISTORY = 50;
  const ROOM_TTL_MS = 24 * 60 * 60 * 1000;
  const GAME_START_RECOVERY_MS = 15000;

  function createSubmissionRoundId() {
    const randomPart = Math.random().toString(36).slice(2, 10);
    return `round_${now()}_${randomPart}`;
  }

  function roomExpiresAt() {
    return now() + ROOM_TTL_MS;
  }

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

    const privateRoleGame = Number(state.itemCount || 0) > 0
      && ["almost-impostor", "fake-expert", "who-am-i"].includes(type);

    if (privateRoleGame) {
      delete state.items;
      delete state.impostorOrder;
      delete state.impostorId;
      delete state.roleOrder;
      delete state.role;
      delete state.guesserOrder;
      delete state.speakerOrder;
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

  async function reserveRoom({ user, name, avatarId, adult, alcohol }) {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const code = randomRoomCode();
      const createdAt = now();
      const roomRef = db.ref(`rooms/${code}`);
      const transaction = await roomRef.transaction(currentRoom => {
        if (currentRoom !== null) return;

        return {
          meta: {
            hostUid: user.uid,
            adult: Boolean(adult),
            alcohol: Boolean(alcohol),
            status: "lobby",
            createdAt,
            updatedAt: createdAt,
            expiresAt: createdAt + ROOM_TTL_MS
          },
          players: {
            [user.uid]: {
              name,
              avatarId,
              online: true,
              joinedAt: createdAt,
              lastSeen: createdAt
            }
          }
        };
      }, undefined, false);

      if (transaction.committed) return code;
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
    const code = await reserveRoom({ user, name, avatarId, adult, alcohol });

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

  function normalizedPlayerName(value) {
    return String(value || "")
      .trim()
      .replace(/\s+/g, " ")
      .normalize("NFKC")
      .toLocaleLowerCase("fr-FR");
  }

  async function joinRoom(code, { name, avatarId }) {
    const user = await ready();
    const key = normalizeCode(code);
    const [meta, playersSnapshot] = await Promise.all([
      getRoomMeta(key),
      db.ref(`rooms/${key}/players`).once("value")
    ]);

    if (!meta) {
      throw new Error("Ce salon n'existe pas ou n'est plus disponible.");
    }

    if (Number(meta.expiresAt || 0) > 0 && Number(meta.expiresAt) <= now()) {
      throw new Error("Ce salon a expiré. Demande à l'hôte d'en créer un nouveau.");
    }

    if (meta.status && meta.status !== "lobby") {
      throw new Error("Une partie est déjà en cours dans ce salon. Rejoins-le à la prochaine manche.");
    }

    const players = playersSnapshot.val() || {};
    const alreadyMember = Boolean(players[user.uid]);
    if (!alreadyMember && Object.keys(players).length >= MAX_ROOM_PLAYERS) {
      throw new Error(`Ce salon est complet (${MAX_ROOM_PLAYERS} joueurs maximum).`);
    }

    const wantedName = normalizedPlayerName(name);
    const duplicateName = Object.entries(players).some(([uid, player]) => (
      uid !== user.uid
      && normalizedPlayerName(player?.name) === wantedName
    ));
    if (duplicateName) {
      throw new Error("Ce prénom est déjà utilisé dans le salon. Choisis-en un autre pour éviter les confusions.");
    }

    const joinedAt = Number(players[user.uid]?.joinedAt || now());

    try {
      await db.ref(`rooms/${key}/players/${user.uid}`).set({
        name,
        avatarId,
        online: true,
        joinedAt,
        lastSeen: now()
      });
    } catch (error) {
      const latestMeta = await getRoomMeta(key).catch(() => null);
      if (!latestMeta) {
        throw new Error("Ce salon n'existe plus.");
      }
      if (latestMeta.status !== "lobby") {
        throw new Error("La partie vient de commencer. Rejoins le salon à la prochaine manche.");
      }
      throw error;
    }

    attachPresence(key, user.uid);
    return { code: displayCode(key), key, uid: user.uid, meta };
  }

  async function loadRoom(code) {
    const user = await ready();
    const key = normalizeCode(code);
    if (!key) return null;

    const snapshot = await db.ref(`rooms/${key}`).once("value");
    if (!snapshot.exists()) return null;

    let room = snapshot.val();
    if (!room.players || !room.players[user.uid]) return null;

    const stalledStart = room.meta?.hostUid === user.uid
      && room.meta?.status === "playing"
      && !room.game
      && Number(room.meta?.startingAt || 0) > 0
      && Number(room.meta.startingAt) <= now() - GAME_START_RECOVERY_MS;

    if (stalledStart) {
      const repaired = await db.ref(`rooms/${key}`).transaction(currentRoom => {
        if (!currentRoom || currentRoom.meta?.hostUid !== user.uid || currentRoom.game) return;
        if (currentRoom.meta?.status !== "playing") return;
        if (Number(currentRoom.meta?.startingAt || 0) > now() - GAME_START_RECOVERY_MS) return;

        const nextRoom = cloneValue(currentRoom);
        nextRoom.meta.status = "lobby";
        nextRoom.meta.updatedAt = now();
        delete nextRoom.meta.startToken;
        delete nextRoom.meta.startingAt;
        return nextRoom;
      }, undefined, false).catch(() => null);

      if (repaired?.committed) room = repaired.snapshot.val();
    }

    if (Number(room.meta?.expiresAt || 0) > 0 && Number(room.meta.expiresAt) <= now()) {
      if (room.meta?.hostUid === user.uid) {
        const updates = {};
        updates[`rooms/${key}`] = null;
        updates[`roomSecrets/${key}`] = null;
        await db.ref().update(updates).catch(() => {});
      }
      return null;
    }

    attachPresence(key, user.uid);
    return { code: displayCode(key), key, uid: user.uid, room };
  }

  function unwrapSubmission(entry, gameState) {
    if (!entry || typeof entry !== "object" || entry.__akSubmission !== true) {
      return entry;
    }

    if (entry.roundId !== gameState?.submissionRoundId || entry.phase !== gameState?.phase) {
      return undefined;
    }

    return cloneValue(entry.payload);
  }

  function mergePrivateSubmissions(room, privateSubmissions, privateRoles, privateHostState, isHost) {
    if (!room?.game) return room;

    const merged = cloneValue(room);
    const status = merged.game.submissionStatus || {};
    const revealedAnswers = merged.game.revealedAnswers || {};
    const gameState = merged.game.state || {};
    const collections = ["answers", "votes", "actions"];

    collections.forEach(collection => {
      const visible = {};

      if (!isHost) {
        Object.keys(status[collection] || {}).forEach(uid => {
          visible[uid] = true;
        });
      }

      Object.entries(privateSubmissions || {}).forEach(([uid, entries]) => {
        if (!entries || !Object.prototype.hasOwnProperty.call(entries, collection)) return;
        const unwrapped = unwrapSubmission(entries[collection], gameState);
        if (unwrapped !== undefined) visible[uid] = unwrapped;
      });

      if (collection === "answers") {
        Object.entries(revealedAnswers).forEach(([uid, answer]) => {
          visible[uid] = answer;
        });
      }

      merged.game[collection] = visible;
    });

    merged.game.privateRoles = cloneValue(privateRoles || {});
    merged.game.privateHostState = cloneValue(privateHostState || null);
    return merged;
  }

  function listenRoom(code, callback, onError) {
    const key = normalizeCode(code);
    const roomRef = db.ref(`rooms/${key}`);
    let roomValue = null;
    let privateSubmissions = {};
    let privateRoles = {};
    let privateHostState = null;

    let submissionsRef = null;
    let submissionsHandler = null;
    let rolesRef = null;
    let rolesHandler = null;
    let hostStateRef = null;
    let hostStateHandler = null;

    let submissionsPath = "";
    let rolesPath = "";
    let hostStatePath = "";

    const emit = () => {
      callback(
        roomValue
          ? mergePrivateSubmissions(
              roomValue,
              privateSubmissions,
              privateRoles,
              privateHostState,
              roomValue.meta?.hostUid === currentUser?.uid
            )
          : null
      );
    };

    const unbindRef = (ref, handler) => {
      if (ref && handler) ref.off("value", handler);
    };

    const bindSecretRefs = room => {
      if (!currentUser || !room?.meta) return;
      const isHost = room.meta.hostUid === currentUser.uid;

      const nextSubmissionsPath = isHost
        ? `roomSecrets/${key}/submissions`
        : `roomSecrets/${key}/submissions/${currentUser.uid}`;

      if (nextSubmissionsPath !== submissionsPath) {
        unbindRef(submissionsRef, submissionsHandler);
        submissionsPath = nextSubmissionsPath;
        privateSubmissions = {};
        submissionsRef = db.ref(nextSubmissionsPath);
        submissionsHandler = snapshot => {
          privateSubmissions = isHost
            ? (snapshot.val() || {})
            : (snapshot.exists() ? { [currentUser.uid]: snapshot.val() } : {});
          emit();
        };
        submissionsRef.on("value", submissionsHandler, onError || console.error);
      }

      const nextRolesPath = isHost
        ? `roomSecrets/${key}/roles`
        : `roomSecrets/${key}/roles/${currentUser.uid}`;

      if (nextRolesPath !== rolesPath) {
        unbindRef(rolesRef, rolesHandler);
        rolesPath = nextRolesPath;
        privateRoles = {};
        rolesRef = db.ref(nextRolesPath);
        rolesHandler = snapshot => {
          privateRoles = isHost
            ? (snapshot.val() || {})
            : (snapshot.exists() ? { [currentUser.uid]: snapshot.val() } : {});
          emit();
        };
        rolesRef.on("value", rolesHandler, onError || console.error);
      }

      const nextHostStatePath = isHost ? `roomSecrets/${key}/hostState` : "";
      if (nextHostStatePath !== hostStatePath) {
        unbindRef(hostStateRef, hostStateHandler);
        hostStatePath = nextHostStatePath;
        privateHostState = null;
        hostStateRef = null;
        hostStateHandler = null;

        if (nextHostStatePath) {
          hostStateRef = db.ref(nextHostStatePath);
          hostStateHandler = snapshot => {
            privateHostState = snapshot.val() || null;
            emit();
          };
          hostStateRef.on("value", hostStateHandler, onError || console.error);
        }
      }
    };

    const roomHandler = snapshot => {
      roomValue = snapshot.exists() ? snapshot.val() : null;
      bindSecretRefs(roomValue);
      emit();
    };

    roomRef.on("value", roomHandler, onError || console.error);
    return () => {
      roomRef.off("value", roomHandler);
      unbindRef(submissionsRef, submissionsHandler);
      unbindRef(rolesRef, rolesHandler);
      unbindRef(hostStateRef, hostStateHandler);
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
      updates[`roomSecrets/${key}/roles/${user.uid}`] = null;
      ["answers", "votes", "actions"].forEach(collection => {
        updates[`rooms/${key}/game/submissionStatus/${collection}/${user.uid}`] = null;
      });
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


  function buildPrivateRolesForRound(type, round, state, hostState, playerIds) {
    const card = hostState?.items?.[round] || {};
    const base = {
      gameType: type,
      round,
      itemId: card.id || ""
    };
    const roles = {};

    if (type === "almost-impostor") {
      const impostorId = hostState.impostorOrder?.[round];
      const options = [card.word, ...(card.decoys || [])].filter(Boolean);

      playerIds.forEach(uid => {
        const isImpostor = uid === impostorId;
        roles[uid] = {
          ...base,
          isImpostor,
          category: card.category || "mystère",
          hint: card.hint || "",
          word: isImpostor ? null : (card.word || ""),
          guessOptions: isImpostor ? options : null
        };
      });
    }

    if (type === "fake-expert") {
      const speakerId = hostState.speakerOrder?.[round];
      const role = hostState.roleOrder?.[round] || "fake";

      playerIds.forEach(uid => {
        const isSpeaker = uid === speakerId;
        roles[uid] = {
          ...base,
          isSpeaker,
          speakerId,
          topic: card.topic || "",
          role: isSpeaker ? role : null,
          facts: isSpeaker && role === "real" ? (card.facts || []) : null,
          fakeTip: isSpeaker && role === "fake" ? (card.fakeTip || "") : null
        };
      });
    }

    if (type === "who-am-i") {
      const guesserId = hostState.guesserOrder?.[round];

      playerIds.forEach(uid => {
        const isGuesser = uid === guesserId;
        roles[uid] = {
          ...base,
          isGuesser,
          guesserId,
          label: isGuesser ? null : (card.label || ""),
          category: isGuesser ? null : (card.category || "mystère"),
          clues: isGuesser ? null : (card.clues || [])
        };
      });
    }

    return roles;
  }

  async function repairPrivateGameAfterPlayerRemoval(key, targetUid) {
    const [roomSnapshot, hostStateSnapshot] = await Promise.all([
      db.ref(`rooms/${key}`).once("value"),
      db.ref(`roomSecrets/${key}/hostState`).once("value")
    ]);

    const room = roomSnapshot.val() || null;
    const hostState = cloneValue(hostStateSnapshot.val() || null);
    const updates = {
      [`roomSecrets/${key}/submissions/${targetUid}`]: null,
      [`roomSecrets/${key}/roles/${targetUid}`]: null
    };

    if (!room?.game?.state) {
      updates[`roomSecrets/${key}`] = null;
      await db.ref().update(updates);
      return;
    }

    const state = room.game.state;
    const type = state.type;

    if (!hostState || !["almost-impostor", "fake-expert", "who-am-i"].includes(type)) {
      await db.ref().update(updates);
      return;
    }

    const playerIds = Object.keys(room.players || {});
    const round = Number(state.currentIndex || 0);

    if (type === "almost-impostor") {
      hostState.impostorOrder = replaceRemovedInOrder(hostState.impostorOrder, targetUid, playerIds);
    }

    if (type === "fake-expert") {
      hostState.speakerOrder = replaceRemovedInOrder(hostState.speakerOrder, targetUid, playerIds);
      updates[`rooms/${key}/game/state/speakerId`] = hostState.speakerOrder?.[round] || playerIds[0] || null;
      updates[`rooms/${key}/game/state/publicTopic`] = hostState.items?.[round]?.topic || "";
    }

    if (type === "who-am-i") {
      hostState.guesserOrder = replaceRemovedInOrder(hostState.guesserOrder, targetUid, playerIds);
      updates[`rooms/${key}/game/state/guesserId`] = hostState.guesserOrder?.[round] || playerIds[0] || null;
    }

    updates[`roomSecrets/${key}/hostState`] = hostState;
    updates[`roomSecrets/${key}/roles`] = buildPrivateRolesForRound(
      type,
      round,
      state,
      hostState,
      playerIds
    );

    await db.ref().update(updates);
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

    if (outcome?.removed) {
      await repairPrivateGameAfterPlayerRemoval(key, targetUid);
    }

    return outcome || { removed: false, returnedToLobby: false };
  }


  async function startWhoUsGame(code, payload) {
    return setGame(code, {
      state: {
        type: "who-us",
        phase: "question",
        sessionGameId: payload.sessionGameId,
        questions: payload.questions,
        currentIndex: 0,
        settings: payload.settings,
        rounds: {},
        currentResult: null,
        startedAt: now(),
        updatedAt: now()
      },
      votes: null
    });
  }

  async function castWhoUsVote(code, targetUid) {
    return writeOwnGameEntry(code, "votes", targetUid);
  }

  async function revealWhoUsResults(code, roundIndex, result) {
    return updateGame(code, {
      "state/phase": "results",
      "state/currentResult": result,
      [`state/rounds/${roundIndex}`]: result,
      "state/updatedAt": now()
    });
  }

  async function nextWhoUsQuestion(code, nextIndex, isFinished) {
    return updateGame(code, {
      "state/phase": isFinished ? "final" : "question",
      "state/currentIndex": nextIndex,
      "state/currentResult": null,
      "state/finishedAt": isFinished ? now() : null,
      "state/updatedAt": now(),
      votes: null
    });
  }


  async function returnToLobby(code) {
    const key = normalizeCode(code);
    const updates = {};

    updates[`rooms/${key}/game`] = null;
    updates[`roomSecrets/${key}`] = null;
    updates[`rooms/${key}/meta/status`] = "lobby";
    updates[`rooms/${key}/meta/updatedAt`] = now();
    updates[`rooms/${key}/meta/expiresAt`] = roomExpiresAt();

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

      Object.values(history)
        .sort((a, b) => Number(b?.endedAt || 0) - Number(a?.endedAt || 0))
        .slice(MAX_SESSION_HISTORY)
        .forEach(entry => {
          if (entry?.id) delete history[entry.id];
        });

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


  async function setGame(code, payload, secrets = null) {
    const key = normalizeCode(code);
    const gameType = payload?.state?.type || "";

    if (!payload || !gameType) {
      return returnToLobby(key);
    }

    await assertRoomCanStart(key, gameType);

    const startToken = `start_${now()}_${Math.random().toString(36).slice(2, 10)}`;
    const metaRef = db.ref(`rooms/${key}/meta`);
    const lock = await metaRef.transaction(currentMeta => {
      if (!currentMeta || currentMeta.status !== "lobby") return;
      return {
        ...currentMeta,
        status: "playing",
        startToken,
        startingAt: now(),
        updatedAt: now(),
        expiresAt: roomExpiresAt()
      };
    }, undefined, false);

    if (!lock.committed) {
      throw new Error("Une autre partie vient déjà d’être lancée dans ce salon.");
    }

    const publicPayload = cloneValue(payload);
    publicPayload.state = publicPayload.state || {};
    publicPayload.state.submissionRoundId = createSubmissionRoundId();
    publicPayload.answers = null;
    publicPayload.votes = null;
    publicPayload.actions = null;
    publicPayload.submissionStatus = { answers: {}, votes: {}, actions: {} };
    publicPayload.revealedAnswers = null;

    const updates = {};
    updates[`rooms/${key}/game`] = publicPayload;
    updates[`roomSecrets/${key}/submissions`] = null;
    updates[`roomSecrets/${key}/roles`] = secrets?.roles || null;
    updates[`roomSecrets/${key}/hostState`] = secrets?.hostState || null;
    updates[`rooms/${key}/meta/startToken`] = null;
    updates[`rooms/${key}/meta/startingAt`] = null;
    updates[`rooms/${key}/meta/updatedAt`] = now();
    updates[`rooms/${key}/meta/expiresAt`] = roomExpiresAt();

    try {
      await db.ref().update(updates);
    } catch (error) {
      const gameSnapshot = await db.ref(`rooms/${key}/game`).once("value").catch(() => null);
      if (!gameSnapshot?.exists?.()) {
        await metaRef.transaction(currentMeta => {
          if (!currentMeta || currentMeta.startToken !== startToken) return;
          const nextMeta = { ...currentMeta, status: "lobby", updatedAt: now() };
          delete nextMeta.startToken;
          delete nextMeta.startingAt;
          return nextMeta;
        }, undefined, false).catch(() => {});
      }
      throw error;
    }
  }

  async function updateGame(code, updates, secrets = null) {
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
      prefixedUpdates[`rooms/${key}/game/state/submissionRoundId`] = createSubmissionRoundId();
    }

    Object.entries(updates || {}).forEach(([path, value]) => {
      if (["answers", "votes", "actions"].includes(path)) return;
      prefixedUpdates[`rooms/${key}/game/${path}`] = value;
    });

    if (secrets && Object.prototype.hasOwnProperty.call(secrets, "roles")) {
      prefixedUpdates[`roomSecrets/${key}/roles`] = cloneValue(secrets.roles);
    }

    if (secrets && Object.prototype.hasOwnProperty.call(secrets, "hostState")) {
      prefixedUpdates[`roomSecrets/${key}/hostState`] = cloneValue(secrets.hostState);
    }

    prefixedUpdates[`rooms/${key}/meta/updatedAt`] = now();
    prefixedUpdates[`rooms/${key}/meta/expiresAt`] = roomExpiresAt();
    await db.ref().update(prefixedUpdates);
  }

  async function writeOwnGameEntry(code, collection, value) {
    const allowedCollections = new Set(["answers", "votes", "actions"]);

    if (!allowedCollections.has(collection)) {
      throw new Error("Collection de jeu non autorisée.");
    }

    const user = await ready();
    const key = normalizeCode(code);
    const stateSnapshot = await db.ref(`rooms/${key}/game/state`).once("value");
    const gameState = stateSnapshot.val() || null;

    if (!gameState?.submissionRoundId || !gameState?.phase) {
      throw new Error("Cette manche n’accepte plus de réponse. Attends l’écran suivant.");
    }

    const wrappedValue = {
      __akSubmission: true,
      roundId: gameState.submissionRoundId,
      phase: gameState.phase,
      payload: cloneValue(value),
      submittedAt: now()
    };

    const prefixedUpdates = {};
    prefixedUpdates[`roomSecrets/${key}/submissions/${user.uid}/${collection}`] = wrappedValue;
    prefixedUpdates[`rooms/${key}/game/submissionStatus/${collection}/${user.uid}`] = true;
    await db.ref().update(prefixedUpdates);
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
