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
    for (let i = 0; i < 4; i += 1) {
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

  function listenRoom(code, callback, onError) {
    const key = normalizeCode(code);
    const ref = db.ref(`rooms/${key}`);

    const handler = snapshot => {
      callback(snapshot.exists() ? snapshot.val() : null);
    };

    ref.on("value", handler, onError || console.error);
    return () => ref.off("value", handler);
  }

  async function leaveRoom(code, isHost) {
    const user = await ready();
    const key = normalizeCode(code);

    if (isHost) {
      await db.ref(`rooms/${key}`).remove();
    } else {
      await db.ref(`rooms/${key}/players/${user.uid}`).remove();
    }
  }

  async function startWhoUsGame(code, payload) {
    const key = normalizeCode(code);

    await db.ref(`rooms/${key}/game`).set({
      state: {
        type: "who-us",
        phase: "question",
        questions: payload.questions,
        currentIndex: 0,
        settings: payload.settings,
        rounds: {},
        currentResult: null,
        startedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      votes: {}
    });
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
    updates[`rooms/${key}/game/state/updatedAt`] = serverTimestamp();
    updates[`rooms/${key}/game/votes`] = null;

    await db.ref().update(updates);
  }

  async function returnToLobby(code) {
    await db.ref(`rooms/${normalizeCode(code)}/game`).remove();
  }


  async function setGame(code, payload) {
    const key = normalizeCode(code);
    await db.ref(`rooms/${key}/game`).set(payload);
  }

  async function updateGame(code, updates) {
    const key = normalizeCode(code);
    const prefixedUpdates = {};

    Object.entries(updates || {}).forEach(([path, value]) => {
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
    await db.ref(`rooms/${key}/game/${collection}/${user.uid}`).set(value);
  }

  async function clearOwnGameEntry(code, collection) {
    const allowedCollections = new Set(["answers", "votes", "actions"]);

    if (!allowedCollections.has(collection)) {
      throw new Error("Collection de jeu non autorisée.");
    }

    const user = await ready();
    const key = normalizeCode(code);
    await db.ref(`rooms/${key}/game/${collection}/${user.uid}`).remove();
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
    startWhoUsGame,
    castWhoUsVote,
    revealWhoUsResults,
    nextWhoUsQuestion,
    returnToLobby,
    setGame,
    updateGame,
    writeOwnGameEntry,
    clearOwnGameEntry,
    getCurrentUser: () => currentUser
  };
})();
