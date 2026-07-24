
(function () {
  "use strict";

  if (!window.AKFirebase) {
    console.error("AKFirebase n'est pas chargé.");
    return;
  }

  state.roomCode = null;
  state.currentUid = null;
  state.isHost = false;
  state.pendingJoinCode = null;
  state.roomUnsubscribe = null;
  state.roomData = null;
  state.multiView = null;
  state.multiRenderKey = null;
  state.multiProcessingActionId = null;
  state.multiLobbyTimer = null;
  state.multiSessionRecordingId = null;
  state.multiSessionRecordingPromise = null;
  state.sameBrain = state.sameBrain || null;
  state.minorityGame = state.minorityGame || null;
  state.whoAnswered = state.whoAnswered || null;
  state.almostImpostor = state.almostImpostor || null;
  state.fakeExpert = state.fakeExpert || null;
  state.whoAmI = state.whoAmI || null;
  state.v09MultiTimer = null;
  state.megaGame = state.megaGame || null;
  state.v014MultiTimer = null;
  state.v014MultiTimerToken = 0;
  state.hostRecoveryTimer = null;
  state.hostRecoveryTargetUid = null;
  state.lastRoomRecoveryNoticeId = null;
  state.roomRecoveryUiTimer = null;

  const HOST_RECOVERY_GRACE_MS = 12000;
  const PLAYER_REMOVAL_GRACE_MS = 8000;

  const SESSION_KEY = "akgames_multiplayer_session_v1";

  const localRenderPlayerForm = renderPlayerForm;
  const localRenderLobby = renderLobby;
  const localRenderGames = renderGames;
  const localStartWhoUsGame = startWhoUsGame;
  const localStartLaughDuel = startLaughDuel;
  const localStartBestLiarGame = startBestLiarGame;
  const localRenderActionTruthSetup = renderActionTruthSetup;
  const localStartActionTruthGame = startActionTruthGame;
  const localRenderAmbiancePollSetup = renderAmbiancePollSetup;
  const localStartAmbiancePollGame = startAmbiancePollGame;
  const localRenderSameBrainSetup = renderSameBrainSetup;
  const localStartSameBrainGame = startSameBrainGame;
  const localRenderMinoritySetup = renderMinoritySetup;
  const localStartMinorityGame = startMinorityGame;
  const localRenderWhoAnsweredSetup = renderWhoAnsweredSetup;
  const localStartWhoAnsweredGame = startWhoAnsweredGame;
  const localRenderAlmostImpostorSetup = renderAlmostImpostorSetup;
  const localStartAlmostImpostorGame = startAlmostImpostorGame;
  const localRenderFakeExpertSetup = renderFakeExpertSetup;
  const localStartFakeExpertGame = startFakeExpertGame;
  const localRenderWhoAmISetup = renderWhoAmISetup;
  const localStartWhoAmIGame = startWhoAmIGame;

  function isMultiplayer() {
    return state.mode === "multi-host" || state.mode === "multi-guest";
  }

  function currentPlayer() {
    return state.players.find(player => player.id === state.currentUid) || null;
  }

  function roomPlayersFromObject(playersObject) {
    return Object.entries(playersObject || {})
      .map(([id, value]) => ({
        id,
        name: value.name || "Joueur",
        avatarId: value.avatarId || "frog",
        online: value.online !== false,
        joinedAt: value.joinedAt || 0,
        lastSeen: value.lastSeen || 0
      }))
      .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
  }

  function persistRoomSession() {
    if (!state.roomCode || !state.currentUid) return;

    const me = currentPlayer();

    localStorage.setItem(SESSION_KEY, JSON.stringify({
      roomCode: state.roomCode,
      mode: state.mode,
      isHost: state.isHost,
      name: me?.name || "",
      avatarId: me?.avatarId || "frog"
    }));
  }

  function clearRoomSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function roomDisplayCode() {
    return AKFirebase.displayCode(state.roomCode);
  }

  function stopRoomListener() {
    if (typeof state.roomUnsubscribe === "function") {
      state.roomUnsubscribe();
    }
    state.roomUnsubscribe = null;
    clearHostRecoveryTimer();
    clearRoomRecoveryUiTimer();
    document.querySelector("#roomRecoveryPanel")?.remove();
  }

  function clearHostRecoveryTimer() {
    if (state.hostRecoveryTimer) {
      window.clearTimeout(state.hostRecoveryTimer);
    }
    state.hostRecoveryTimer = null;
    state.hostRecoveryTargetUid = null;
  }

  function clearRoomRecoveryUiTimer() {
    if (state.roomRecoveryUiTimer) {
      window.clearTimeout(state.roomRecoveryUiTimer);
    }
    state.roomRecoveryUiTimer = null;
  }

  function showRoomRecoveryToast(message) {
    if (!message) return;

    document.querySelector("#akRoomRecoveryToast")?.remove();
    const toast = document.createElement("div");
    toast.id = "akRoomRecoveryToast";
    toast.className = "room-recovery-toast";
    toast.setAttribute("role", "status");
    toast.textContent = message;
    document.body.appendChild(toast);

    window.setTimeout(() => toast.classList.add("visible"), 20);
    window.setTimeout(() => {
      toast.classList.remove("visible");
      window.setTimeout(() => toast.remove(), 260);
    }, 3600);
  }

  function processRoomRecoveryNotice(room) {
    const notice = room?.meta?.recoveryNotice || room?.game?.state?.recoveryNotice;
    if (!notice?.id || notice.id === state.lastRoomRecoveryNoticeId) return;

    state.lastRoomRecoveryNoticeId = notice.id;
    showRoomRecoveryToast(notice.message || "La partie a été réparée après une déconnexion.");
  }

  function scheduleHostRecovery(room) {
    const hostUid = room?.meta?.hostUid;
    const hostPlayer = room?.players?.[hostUid] || null;

    if (!hostUid || state.isHost || hostPlayer?.online !== false) {
      clearHostRecoveryTimer();
      return;
    }

    const candidates = roomPlayersFromObject(room.players)
      .filter(player => player.online)
      .sort((a, b) => Number(a.joinedAt || 0) - Number(b.joinedAt || 0));
    const candidate = candidates[0] || null;

    if (!candidate || candidate.id !== state.currentUid) {
      clearHostRecoveryTimer();
      return;
    }

    const elapsed = Math.max(0, AKFirebase.now() - Number(hostPlayer.lastSeen || 0));
    const delay = Math.max(600, HOST_RECOVERY_GRACE_MS - elapsed + 250);

    if (state.hostRecoveryTimer && state.hostRecoveryTargetUid === hostUid) return;

    clearHostRecoveryTimer();
    state.hostRecoveryTargetUid = hostUid;
    state.hostRecoveryTimer = window.setTimeout(async () => {
      state.hostRecoveryTimer = null;

      try {
        const claimed = await AKFirebase.claimHost(state.roomCode);
        if (claimed) {
          showRoomRecoveryToast("L’hôte est parti. Tu reprends automatiquement la soirée 👑");
        } else if (state.roomData) {
          window.setTimeout(() => scheduleHostRecovery(state.roomData), 1500);
        }
      } catch (error) {
        console.error("Reprise du rôle d'hôte impossible :", error);
        if (state.roomData) {
          window.setTimeout(() => scheduleHostRecovery(state.roomData), 1800);
        }
      }
    }, delay);
  }

  function mountRoomRecoveryControls(room) {
    document.querySelector("#roomRecoveryPanel")?.remove();

    if (!state.roomCode || !room || !screen?.isConnected) return;

    const hostUid = room.meta?.hostUid;
    const hostPlayer = room.players?.[hostUid] || null;
    const offlinePlayers = roomPlayersFromObject(room.players)
      .filter(player => player.online === false && player.id !== state.currentUid)
      .map(player => ({
        ...player,
        offlineFor: Math.max(0, AKFirebase.now() - Number(player.lastSeen || 0))
      }));

    if (!state.isHost && hostPlayer?.online === false) {
      const panel = document.createElement("section");
      panel.id = "roomRecoveryPanel";
      panel.className = "connection-recovery-panel waiting";
      panel.innerHTML = `
        <div class="connection-recovery-icon">📡</div>
        <div>
          <strong>L’hôte est déconnecté</strong>
          <p>AK’Games attend quelques secondes. Le joueur connecté depuis le plus longtemps reprendra ensuite la couronne automatiquement.</p>
        </div>
      `;
      screen.appendChild(panel);
      return;
    }

    if (!state.isHost || !offlinePlayers.length) return;

    const inGame = Boolean(room.game?.state);
    const panel = document.createElement("section");
    panel.id = "roomRecoveryPanel";
    panel.className = "connection-recovery-panel host";
    panel.innerHTML = `
      <div class="connection-recovery-heading">
        <div>
          <span class="room-kicker">CONNEXION INSTABLE</span>
          <h2>${offlinePlayers.length} joueur${offlinePlayers.length > 1 ? "s" : ""} hors ligne</h2>
        </div>
        <span class="connection-recovery-icon">📴</span>
      </div>
      <p class="helper">
        ${inGame
          ? "Tu peux continuer sans eux. La manche actuelle redémarrera proprement et leurs anciennes réponses seront supprimées."
          : "Retire les anciens joueurs déconnectés avant de lancer la prochaine partie."}
      </p>
      <div class="connection-recovery-list">
        ${offlinePlayers.map(player => {
          const canRemove = player.offlineFor >= PLAYER_REMOVAL_GRACE_MS;
          const secondsLeft = Math.max(1, Math.ceil((PLAYER_REMOVAL_GRACE_MS - player.offlineFor) / 1000));
          return `
            <div class="connection-recovery-player">
              <span class="result-avatar">${avatarById(player.avatarId).emoji}</span>
              <div>
                <strong>${escapeHtml(player.name)}</strong>
                <small>${canRemove ? "Déconnecté(e)" : `Reconnexion possible · ${secondsLeft}s`}</small>
              </div>
              <button class="danger-btn compact" data-remove-offline-player="${player.id}" ${canRemove ? "" : "disabled"}>
                ${canRemove ? `Continuer sans ${escapeHtml(player.name)}` : "Attente…"}
              </button>
            </div>
          `;
        }).join("")}
      </div>
    `;
    screen.appendChild(panel);

    const waitingDelays = offlinePlayers
      .map(player => PLAYER_REMOVAL_GRACE_MS - player.offlineFor)
      .filter(delay => delay > 0);

    if (waitingDelays.length) {
      window.setTimeout(() => {
        if (state.roomData === room) mountRoomRecoveryControls(room);
      }, Math.min(...waitingDelays) + 120);
    }

    panel.querySelectorAll("[data-remove-offline-player]").forEach(button => {
      button.addEventListener("click", async () => {
        const targetUid = button.dataset.removeOfflinePlayer;
        const player = offlinePlayers.find(item => item.id === targetUid);
        const message = inGame
          ? `Continuer sans ${player?.name || "ce joueur"} ? La manche actuelle sera relancée.`
          : `Retirer ${player?.name || "ce joueur"} du salon ?`;

        if (!confirm(message)) return;

        button.disabled = true;
        button.textContent = "Nettoyage…";

        try {
          const result = await AKFirebase.removeDisconnectedPlayer(state.roomCode, targetUid);
          if (result?.notice?.message) showRoomRecoveryToast(result.notice.message);
        } catch (error) {
          console.error(error);
          button.disabled = false;
          button.textContent = `Continuer sans ${player?.name || "ce joueur"}`;
          alert(error.message || "Impossible de retirer ce joueur.");
        }
      });
    });
  }

  function scheduleRoomRecoveryUi(room) {
    clearRoomRecoveryUiTimer();
    state.roomRecoveryUiTimer = window.setTimeout(() => {
      state.roomRecoveryUiTimer = null;
      if (state.roomData !== room) return;
      mountRoomRecoveryControls(room);
    }, 0);
  }


  function renderMultiplayerLoading(message) {
    title.textContent = "Connexion";
    setBackVisible(false);

    screen.innerHTML = `
      <section class="handoff-stage">
        <div class="success-mark">⏳</div>
        <h2>${escapeHtml(message)}</h2>
        <p>AK'Games prépare la room.</p>
      </section>
    `;
  }

  function activateRoomListener() {
    stopRoomListener();

    state.roomUnsubscribe = AKFirebase.listenRoom(
      state.roomCode,
      room => {
        if (!room) {
          stopRoomListener();
          clearRoomSession();

          state.roomCode = null;
          state.roomData = null;
          state.players = [];
          state.isHost = false;
          state.mode = null;

          alert("Le salon a été fermé.");
          renderHome();
          return;
        }

        state.roomData = room;

        if (room.meta) {
          state.adult = Boolean(room.meta.adult);
          state.alcohol = Boolean(room.meta.alcohol);
          state.isHost = room.meta.hostUid === state.currentUid;
          state.mode = state.isHost ? "multi-host" : "multi-guest";
        }

        state.players = roomPlayersFromObject(room.players);
        persistRoomSession();
        processRoomRecoveryNotice(room);
        scheduleHostRecovery(room);
        scheduleRoomRecoveryUi(room);

        const gameState = room.game?.state || null;

        if (gameState?.type === "who-us") {
          state.multiView = "who-us-game";
          syncMultiWhoUs(room);
          return;
        }

        if (gameState?.type === "best-liar") {
          state.multiView = "best-liar-game";
          syncMultiBestLiar(room);
          return;
        }

        if (gameState?.type === "laugh-duel") {
          state.multiView = "laugh-duel-game";
          syncMultiLaughDuel(room);
          return;
        }

        if (["action-truth", "never-have-i-ever", "would-you-rather"].includes(gameState?.type)) {
          state.multiView = "ambiance-game";
          syncMultiAmbianceGame(room);
          return;
        }

        if (["same-brain", "minority", "who-answered"].includes(gameState?.type)) {
          state.multiView = "v08-game";
          syncMultiV08Game(room);
          return;
        }

        if (["almost-impostor", "fake-expert", "who-am-i"].includes(gameState?.type)) {
          state.multiView = "v09-game";
          syncMultiV09Game(room);
          return;
        }

        if (String(gameState?.type || "").startsWith("mega-")) {
          state.multiView = "mega-game";
          syncMultiMegaGame(room);
          return;
        }

        if (
          state.mode === "multi-guest"
          || state.multiView === "lobby"
          || state.multiView === "who-us-game"
          || state.multiView === "best-liar-game"
          || state.multiView === "laugh-duel-game"
          || state.multiView === "ambiance-game"
          || state.multiView === "v08-game"
          || state.multiView === "v09-game"
          || state.multiView === "mega-game"
        ) {
          clearMultiLobbyTimer();
          state.multiView = "lobby";
          state.multiRenderKey = null;
          state.quiDeNous = null;
          state.bestLiar = null;
          state.laughDuel = null;
          state.actionTruth = null;
          state.ambiancePoll = null;
          state.sameBrain = null;
          state.minorityGame = null;
          state.whoAnswered = null;
          state.almostImpostor = null;
          state.fakeExpert = null;
          state.whoAmI = null;
          state.megaGame = null;
          clearV09MultiTimer();
          clearV014MultiTimer();
          renderLobby();
        }
      },
      error => {
        console.error("Erreur du salon :", error);
        screen.innerHTML = `
          <div class="notice">
            <strong>Impossible de synchroniser le salon.</strong><br>
            Vérifie que les règles Realtime Database ont bien été déployées.
          </div>
        `;
      }
    );
  }

  renderPlayerForm = function () {
    if (!isMultiplayer()) {
      return localRenderPlayerForm();
    }

    title.textContent = state.mode === "multi-host" ? "Crée ton joueur" : "Rejoins le salon";
    setBackVisible(true);

    screen.innerHTML = `
      ${state.mode === "multi-guest" ? `
        <section class="notice">
          Tu rejoins le salon <strong>${escapeHtml(AKFirebase.displayCode(state.pendingJoinCode))}</strong>.
        </section>
      ` : ""}

      <section class="card">
        <div class="form-group">
          <label for="playerName">Ton prénom</label>
          <input id="playerName" class="text-input" maxlength="20" placeholder="Ex. Kathie" value="${escapeHtml(state.draftPlayer.name)}">
        </div>
      </section>

      <section class="card">
        <h2 class="section-title">Choisis ton personnage</h2>
        <p class="helper">Les emojis restent temporaires jusqu'à la fin de la création des personnages officiels.</p>
        <div class="spacer"></div>

        <div class="avatar-grid">
          ${avatars.map(avatar => `
            <button class="avatar-card ${state.draftPlayer.avatarId === avatar.id ? "selected" : ""}" data-avatar="${avatar.id}">
              <span class="avatar-emoji">${avatar.emoji}</span>
              <span class="avatar-name">${avatar.name}</span>
            </button>
          `).join("")}
        </div>
      </section>

      <button id="saveMultiplayerPlayer" class="primary-btn full">
        ${state.mode === "multi-host" ? "Créer le salon" : "Rejoindre la partie"}
      </button>
    `;

    document.querySelector("#playerName").addEventListener("input", event => {
      state.draftPlayer.name = event.target.value;
    });

    document.querySelectorAll("[data-avatar]").forEach(button => {
      button.addEventListener("click", () => {
        state.draftPlayer.avatarId = button.dataset.avatar;
        renderPlayerForm();
      });
    });

    document.querySelector("#saveMultiplayerPlayer").addEventListener("click", async () => {
      const name = state.draftPlayer.name.trim();
      const avatarId = state.draftPlayer.avatarId;

      if (!name || !avatarId) {
        alert("Entre un prénom et choisis un personnage.");
        return;
      }

      try {
        renderMultiplayerLoading(state.mode === "multi-host" ? "Création du salon…" : "Connexion au salon…");

        let result;

        if (state.mode === "multi-host") {
          result = await AKFirebase.createRoom({
            name,
            avatarId,
            adult: state.adult,
            alcohol: state.alcohol
          });
        } else {
          result = await AKFirebase.joinRoom(state.pendingJoinCode, { name, avatarId });
          state.adult = Boolean(result.meta.adult);
          state.alcohol = Boolean(result.meta.alcohol);
        }

        state.roomCode = result.key;
        state.currentUid = result.uid;
        state.isHost = state.mode === "multi-host";
        state.multiView = "lobby";
        state.draftPlayer = { name: "", avatarId: null };
        state.history = [];

        persistRoomSession();
        activateRoomListener();
      } catch (error) {
        console.error(error);
        alert(error.message || "Impossible de rejoindre le salon.");
        renderPlayerForm();
      }
    });
  };

  renderLobby = function () {
    if (!isMultiplayer()) {
      return localRenderLobby();
    }

    state.multiView = "lobby";
    title.textContent = "Salon AK'Games";
    setBackVisible(false);

    const onlineCount = state.players.filter(player => player.online).length;
    const eveningSession = state.roomData?.session || {};
    const eveningScores = eveningSession.scores || {};
    const eveningLeaderboard = [...state.players].sort(
      (a, b) => Number(eveningScores[b.id] || 0) - Number(eveningScores[a.id] || 0)
    );
    const eveningHistory = Object.values(eveningSession.history || {})
      .sort((a, b) => Number(b.endedAt || 0) - Number(a.endedAt || 0))
      .slice(0, 8);

    screen.innerHTML = `
      <section class="room-code-card">
        <span class="room-kicker">CODE DU SALON</span>
        <strong>${escapeHtml(roomDisplayCode())}</strong>
        <p>Envoie ce code aux autres joueurs pour qu'ils rejoignent la partie.</p>
        <button id="copyRoomCode" class="secondary-btn">📋 Copier le code</button>
      </section>

      <section class="card">
        <div class="badges">
          <span class="badge">📲 Plusieurs téléphones</span>
          ${state.isHost ? `<span class="badge green">👑 Hôte</span>` : ""}
          ${state.adult ? `<span class="badge orange">🔞 Adulte</span>` : ""}
          ${state.alcohol ? `<span class="badge green">🍻 Alcool</span>` : ""}
        </div>
      </section>

      <section>
        <div class="room-section-heading">
          <h2 class="section-title">Joueurs (${state.players.length})</h2>
          <span class="online-count">${onlineCount} en ligne</span>
        </div>

        <div class="player-list">
          ${state.players.map(player => {
            const avatar = avatarById(player.avatarId);
            const isMe = player.id === state.currentUid;
            const isRoomHost = state.roomData?.meta?.hostUid === player.id;

            return `
              <div class="player-card">
                <div class="player-main">
                  <div class="player-avatar">${avatar.emoji}</div>
                  <div>
                    <strong>
                      ${escapeHtml(player.name)}
                      ${isMe ? `<span class="you-label">toi</span>` : ""}
                    </strong>
                    <div class="helper">
                      ${isRoomHost ? "👑 Hôte · " : ""}
                      <span class="presence-dot ${player.online ? "online" : "offline"}"></span>
                      ${player.online ? "En ligne" : "Déconnecté(e)"}
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </section>

      <section class="evening-panel">
        <div class="room-section-heading">
          <div>
            <span class="room-kicker">SCORE DE LA SOIRÉE</span>
            <h2 class="section-title">${Number(eveningSession.gamesPlayed || 0)} partie${Number(eveningSession.gamesPlayed || 0) > 1 ? "s" : ""} terminée${Number(eveningSession.gamesPlayed || 0) > 1 ? "s" : ""}</h2>
          </div>
          <span class="badge">🏆 Cumul</span>
        </div>

        <div class="evening-leaderboard">
          ${eveningLeaderboard.map((player, index) => `
            <div class="evening-score-row ${index === 0 && Number(eveningSession.gamesPlayed || 0) > 0 ? "leader" : ""}">
              <span class="ranking-position">${index + 1}</span>
              <span class="result-avatar">${avatarById(player.avatarId).emoji}</span>
              <strong>${escapeHtml(player.name)}</strong>
              <span class="evening-score">${Number(eveningScores[player.id] || 0)} pts</span>
            </div>
          `).join("")}
        </div>
      </section>

      <section class="evening-panel">
        <div class="room-section-heading">
          <h2 class="section-title">Historique de la soirée</h2>
          <span class="online-count">${eveningHistory.length ? `${eveningHistory.length} récente${eveningHistory.length > 1 ? "s" : ""}` : "Aucune partie"}</span>
        </div>

        ${eveningHistory.length ? `
          <div class="evening-history-list">
            ${eveningHistory.map(entry => `
              <article class="evening-history-item">
                <span class="evening-history-icon">${entry.icon || "🎮"}</span>
                <div>
                  <strong>${escapeHtml(entry.gameName || "Jeu")}</strong>
                  <span>${escapeHtml(entry.detail || "Partie terminée")}</span>
                </div>
                <time>${formatEveningTime(entry.endedAt)}</time>
              </article>
            `).join("")}
          </div>
        ` : `
          <div class="notice">Le premier résultat de la soirée apparaîtra ici.</div>
        `}
      </section>

      ${state.isHost ? `
        <section class="evening-action-grid">
          <button id="openMultiplayerGames" class="primary-btn" ${onlineCount < 2 ? "disabled" : ""}>
            ${onlineCount < 2 ? "En attente d'un autre joueur en ligne…" : "🎮 Choisir un jeu"}
          </button>
          <button id="randomMultiplayerGame" class="secondary-btn" ${onlineCount < 2 ? "disabled" : ""}>
            🎲 Jeu aléatoire
          </button>
        </section>
      ` : `
        <section class="waiting-host-card">
          <div class="waiting-pulse">🎮</div>
          <h2>En attente de l'hôte</h2>
          <p>La prochaine partie démarrera automatiquement sur ton téléphone, sans ressaisir le code.</p>
        </section>
      `}

      <button id="leaveMultiplayerRoom" class="danger-btn full">
        ${state.isHost ? "Fermer le salon" : "Quitter le salon"}
      </button>
    `;

    document.querySelector("#copyRoomCode").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(roomDisplayCode());
        document.querySelector("#copyRoomCode").textContent = "✓ Code copié";
      } catch {
        alert(`Code du salon : ${roomDisplayCode()}`);
      }
    });

    const openGamesButton = document.querySelector("#openMultiplayerGames");
    if (openGamesButton) {
      openGamesButton.addEventListener("click", () => {
        if (onlineCount < 2) return;
        state.multiView = "browse";
        state.history = ["lobby"];
        renderPlayChoice();
      });
    }

    document.querySelector("#randomMultiplayerGame")?.addEventListener("click", async event => {
      if (onlineCount < 2) return;
      event.currentTarget.disabled = true;

      try {
        await launchRandomMultiplayerGame();
      } catch (error) {
        console.error(error);
        event.currentTarget.disabled = false;
        alert(error.message || "Impossible de lancer un jeu aléatoire.");
      }
    });

    document.querySelector("#leaveMultiplayerRoom").addEventListener("click", async () => {
      const message = state.isHost ? "Fermer ce salon pour tout le monde ?" : "Quitter ce salon ?";
      if (!confirm(message)) return;

      try {
        await AKFirebase.leaveRoom(state.roomCode, state.isHost);
      } catch (error) {
        console.error(error);
      }

      stopRoomListener();
      clearRoomSession();

      state.roomCode = null;
      state.currentUid = null;
      state.roomData = null;
      state.players = [];
      state.isHost = false;
      state.mode = null;
      state.multiView = null;

      renderHome();
    });
  };


  renderJoin = function () {
    title.textContent = "Rejoindre une partie";
    setBackVisible(true);

    screen.innerHTML = `
      <section class="hero compact-hero">
        <h2>🔗 Rejoins la room</h2>
        <p>Entre le code affiché sur le téléphone de l'hôte.</p>
      </section>

      <section class="card">
        <div class="form-group">
          <label for="roomCode">Code du salon</label>
          <input id="roomCode" class="text-input room-code-input" maxlength="9" autocomplete="off" placeholder="AK-7F3K9Q">
        </div>
      </section>

      <button id="joinBtn" class="primary-btn full">Continuer</button>
    `;

    const input = document.querySelector("#roomCode");

    input.addEventListener("input", () => {
      let value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, "");

      if (value.startsWith("AK")) {
        value = value.slice(2);
      }

      input.value = value.length ? `AK-${value.slice(0, 6)}` : "";
    });

    document.querySelector("#joinBtn").addEventListener("click", async () => {
      const code = input.value;

      if (AKFirebase.normalizeCode(code).length !== 6) {
        alert("Entre un code de salon complet.");
        return;
      }

      try {
        renderMultiplayerLoading("Recherche du salon…");

        const meta = await AKFirebase.getRoomMeta(code);

        if (!meta) {
          alert("Ce salon n'existe pas ou a été fermé.");
          renderJoin();
          return;
        }

        if (meta.status && meta.status !== "lobby") {
          alert("Une partie est déjà en cours. Réessaie quand le groupe sera revenu au salon.");
          renderJoin();
          return;
        }

        state.mode = "multi-guest";
        state.pendingJoinCode = code;
        state.adult = Boolean(meta.adult);
        state.alcohol = Boolean(meta.alcohol);
        state.draftPlayer = { name: "", avatarId: null };

        renderPlayerForm();
      } catch (error) {
        console.error(error);
        alert("Impossible de vérifier ce salon.");
        renderJoin();
      }
    });
  };

  renderGames = function () {
    if (!isMultiplayer()) {
      return localRenderGames();
    }

    const category = categories.find(c => c.id === state.currentCategory);
    title.textContent = category.name;
    setBackVisible(true);

    const localReadyGames = new Set([
      "Qui de nous ?",
      "Le premier qui rit a perdu",
      "Qui ment le mieux ?",
      "Action ou Vérité",
      "Action ou Vérité +18",
      "Je n’ai jamais",
      "Je n’ai jamais +18",
      "Tu préfères",
      "Tu préfères +18",
      "Même cerveau",
      "Minorité",
      "Qui a répondu ça ?"
    ]);

    screen.innerHTML = `
      <section class="game-list">
        ${category.games.map(game => {
          const disabled = game === "Blind Test";
          const multiReady = localReadyGames.has(game);
          const locallyReady = localReadyGames.has(game);

          return `
            <button class="game-card ${disabled ? "disabled" : ""}" ${disabled ? "disabled" : ""} data-game="${escapeHtml(game)}">
              <strong>${game}</strong>
              <span class="helper">
                ${
                  disabled
                    ? "Bientôt disponible"
                    : multiReady
                      ? "Jouable chacun sur son téléphone"
                      : locallyReady
                        ? "Disponible pour le mode un seul téléphone"
                        : "À intégrer"
                }
              </span>

              <div class="game-meta">
                ${multiReady ? `<span class="badge green">📲 multijoueur</span>` : ""}
              </div>
            </button>
          `;
        }).join("")}
      </section>
    `;

    document.querySelectorAll("[data-game]:not([disabled])").forEach(button => {
      button.addEventListener("click", () => {
        const game = button.dataset.game;

        if (game === "Qui de nous ?") {
          state.multiView = "who-us-setup";
          pushScreen("games");
          resetWhoUsState();
          renderWhoUsSetup();
          return;
        }

        if (game === "Le premier qui rit a perdu") {
          if (state.players.length < 2) {
            alert("Ce duel nécessite au moins 2 joueurs.");
            return;
          }

          state.multiView = "laugh-duel-setup";
          pushScreen("games");
          resetLaughDuelState();
          renderLaughDuelSetup();
          return;
        }

        if (game === "Qui ment le mieux ?") {
          if (state.players.length < 3) {
            alert("« Qui ment le mieux ? » nécessite au moins 3 joueurs.");
            return;
          }

          state.multiView = "best-liar-setup";
          pushScreen("games");
          resetBestLiarState();
          renderBestLiarSetup();
          return;
        }

        if (game === "Action ou Vérité" || game === "Action ou Vérité +18") {
          state.multiView = "action-truth-setup";
          pushScreen("games");
          resetActionTruthState(game.includes("+18"));
          renderActionTruthSetup();
          return;
        }

        if (game === "Je n’ai jamais" || game === "Je n’ai jamais +18") {
          state.multiView = "ambiance-poll-setup";
          pushScreen("games");
          resetAmbiancePollState("never", game.includes("+18"));
          renderAmbiancePollSetup();
          return;
        }

        if (game === "Tu préfères" || game === "Tu préfères +18") {
          state.multiView = "ambiance-poll-setup";
          pushScreen("games");
          resetAmbiancePollState("would", game.includes("+18"));
          renderAmbiancePollSetup();
          return;
        }

        if (game === "Même cerveau") {
          state.multiView = "same-brain-setup";
          pushScreen("games");
          resetSameBrainState();
          renderSameBrainSetup();
          return;
        }

        if (game === "Minorité") {
          state.multiView = "minority-setup";
          pushScreen("games");
          resetMinorityState();
          renderMinoritySetup();
          return;
        }

        if (game === "Qui a répondu ça ?") {
          if (state.players.length < 3) {
            alert("« Qui a répondu ça ? » nécessite au moins 3 joueurs.");
            return;
          }
          state.multiView = "who-answered-setup";
          pushScreen("games");
          resetWhoAnsweredState();
          renderWhoAnsweredSetup();
          return;
        }

        renderMultiNotReady(game);
      });
    });
  };

  startWhoUsGame = async function () {
    if (!isMultiplayer()) {
      return localStartWhoUsGame();
    }

    if (!state.isHost) return;

    const game = state.quiDeNous;

    if (!game.categories.length && !game.includeAdult) {
      alert("Choisis au moins une catégorie.");
      return;
    }

    screen.innerHTML = `<div class="notice">Synchronisation de la partie…</div>`;

    try {
      const baseResponse = await fetch("data/qui-de-nous.json");

      if (!baseResponse.ok) {
        throw new Error("Impossible de charger les questions classiques.");
      }

      const baseQuestions = await baseResponse.json();
      let pool = baseQuestions.filter(question => game.categories.includes(question.category));

      if (state.adult && game.includeAdult) {
        const adultResponse = await fetch("data/qui-de-nous-adulte.json");

        if (!adultResponse.ok) {
          throw new Error("Impossible de charger les questions adultes.");
        }

        const adultQuestions = await adultResponse.json();
        pool = pool.concat(adultQuestions);
      }

      if (!pool.length) {
        throw new Error("Aucune question ne correspond aux catégories choisies.");
      }

      const questions = shuffleArray(pool).slice(
        0,
        Math.min(game.questionCount, pool.length)
      );

      await AKFirebase.startWhoUsGame(state.roomCode, {
        sessionGameId: createSessionGameId("who-us"),
        questions,
        settings: {
          categories: [...game.categories],
          questionCount: Number(game.questionCount || questions.length),
          alcoholIntensity: game.alcoholIntensity,
          includeAdult: Boolean(game.includeAdult)
        }
      });

      state.multiView = "who-us-game";
    } catch (error) {
      console.error(error);
      alert(error.message || "Impossible de lancer la partie.");
      renderWhoUsSetup();
    }
  };

  function calculateMultiWhoUsResult(votes, players) {
    const counts = Object.fromEntries(players.map(player => [player.id, 0]));

    Object.values(votes || {}).forEach(targetId => {
      if (Object.prototype.hasOwnProperty.call(counts, targetId)) {
        counts[targetId] += 1;
      }
    });

    const sorted = players
      .map(player => ({
        ...player,
        votes: counts[player.id] || 0
      }))
      .sort((a, b) => b.votes - a.votes);

    const maxVotes = sorted.length ? sorted[0].votes : 0;
    const winners = sorted.filter(player => player.votes === maxVotes && maxVotes > 0);

    return {
      counts,
      sorted,
      maxVotes,
      winnerIds: winners.map(player => player.id),
      totalVotes: Object.keys(votes || {}).length
    };
  }

  function getMultiWhoUsEvent(result, votes) {
    const total = state.players.length;

    if (result.maxVotes === total && result.winnerIds.length === 1) {
      const winner = state.players.find(player => player.id === result.winnerIds[0]);

      return {
        type: "unanimity",
        title: "C'EST OFFICIEL.",
        text: `${total} personnes sur ${total} ont voté pour ${winner.name}. À ce stade, ce n'est plus une opinion.`
      };
    }

    if (result.winnerIds.length > 1) {
      const names = result.winnerIds
        .map(id => state.players.find(player => player.id === id)?.name)
        .filter(Boolean);

      return {
        type: "tie",
        title: "⚔️ Le groupe est divisé.",
        text: `${names.join(" et ")} terminent à égalité.`
      };
    }

    const winnerId = result.winnerIds[0];

    if (winnerId && votes?.[winnerId] === winnerId && result.maxVotes > 1) {
      const winner = state.players.find(player => player.id === winnerId);

      return {
        type: "self",
        title: "🪞 Au moins, c'est assumé.",
        text: `${winner.name} a voté pour soi-même… et le groupe est plutôt d'accord.`
      };
    }

    return null;
  }

  function getMultiAlcoholRule(gameState, result) {
    if (!state.alcohol || !result.winnerIds.length) return null;

    const roundNumber = Number(gameState.currentIndex || 0) + 1;
    const intensity = gameState.settings?.alcoholIntensity || "normal";
    const frequency = intensity === "light" ? 5 : intensity === "normal" ? 3 : 1;

    if (roundNumber % frequency !== 0) return null;

    const names = result.winnerIds
      .map(id => state.players.find(player => player.id === id)?.name)
      .filter(Boolean);

    if (names.length > 1) {
      return `🍻 ${names.join(" et ")} trinquent et prennent une gorgée.`;
    }

    if (result.maxVotes === state.players.length) {
      return `🍻 Unanimité ! ${names[0]} distribue 3 petites gorgées.`;
    }

    return `🍻 ${names[0]}, la personne la plus désignée, prend une gorgée.`;
  }

  function syncMultiWhoUs(room) {
    const gameState = room.game?.state;
    const votes = room.game?.votes || {};

    if (!gameState || gameState.type !== "who-us") return;

    state.quiDeNous = {
      ...(state.quiDeNous || {}),
      questions: gameState.questions || [],
      currentIndex: Number(gameState.currentIndex || 0),
      rounds: gameState.rounds || {},
      currentVotes: votes,
      alcoholIntensity: gameState.settings?.alcoholIntensity || "normal"
    };

    const ownVote = votes[state.currentUid] || "";
    const renderKey = [
      gameState.phase,
      gameState.currentIndex,
      Object.keys(votes).length,
      ownVote,
      JSON.stringify(gameState.currentResult || {})
    ].join("|");

    if (state.multiRenderKey === renderKey) return;

    state.multiRenderKey = renderKey;

    if (gameState.phase === "question") {
      renderMultiWhoUsQuestion(gameState, votes);
      return;
    }

    if (gameState.phase === "results") {
      renderMultiWhoUsResults(gameState);
      return;
    }

    if (gameState.phase === "final") {
      renderMultiWhoUsFinal(gameState);
    }
  }


  function renderMultiWhoUsQuestion(gameState, votes) {
    const question = gameState.questions?.[gameState.currentIndex];
    if (!question) return;

    const myVote = votes[state.currentUid] || null;
    const voteCount = Object.keys(votes).length;
    const totalPlayers = state.players.length;

    title.textContent = "Qui de nous ?";
    setBackVisible(false);

    screen.innerHTML = `
      <section class="game-progress">
        <span>Question ${gameState.currentIndex + 1}/${gameState.questions.length}</span>
        <div class="progress-track">
          <div class="progress-fill" style="width:${((gameState.currentIndex + 1) / gameState.questions.length) * 100}%"></div>
        </div>
      </section>

      <section class="question-stage multi-question-stage">
        <span class="category-chip">${whoUsCategoryLabels[question.category] || "👥 Qui de nous ?"}</span>
        <h2>${escapeHtml(question.question)}</h2>
        <p>Vote directement depuis ton téléphone. Les choix restent secrets jusqu'aux résultats.</p>
      </section>

      ${myVote ? `
        <section class="multiplayer-wait-card">
          <div class="success-mark">✓</div>
          <h2>Ton vote est enregistré</h2>
          <p><strong>${voteCount}/${totalPlayers}</strong> joueurs ont voté.</p>
          <div class="waiting-bar">
            <div style="width:${Math.min(100, (voteCount / Math.max(totalPlayers, 1)) * 100)}%"></div>
          </div>
        </section>
      ` : `
        <section class="vote-grid">
          ${state.players.map(player => {
            const avatar = avatarById(player.avatarId);

            return `
              <button class="vote-player" data-multi-vote-target="${player.id}">
                <span class="vote-avatar">${avatar.emoji}</span>
                <strong>${escapeHtml(player.name)}</strong>
              </button>
            `;
          }).join("")}
        </section>
      `}

      ${state.isHost ? `
        <section class="host-control-card">
          <div>
            <strong>👑 Contrôle de l'hôte</strong>
            <span>${voteCount}/${totalPlayers} votes reçus</span>
          </div>

          <button id="revealMultiWhoUs" class="primary-btn" ${voteCount === 0 ? "disabled" : ""}>
            ${voteCount >= totalPlayers ? "Révéler les résultats" : "Révéler maintenant"}
          </button>
        </section>
      ` : ""}
    `;

    document.querySelectorAll("[data-multi-vote-target]").forEach(button => {
      button.addEventListener("click", async () => {
        if (votes[state.currentUid]) return;

        try {
          button.disabled = true;
          await AKFirebase.castWhoUsVote(state.roomCode, button.dataset.multiVoteTarget);
        } catch (error) {
          console.error(error);
          button.disabled = false;
          alert("Ton vote n'a pas pu être envoyé.");
        }
      });
    });

    const revealButton = document.querySelector("#revealMultiWhoUs");

    if (revealButton) {
      revealButton.addEventListener("click", async () => {
        const liveVotes = state.roomData?.game?.votes || {};
        if (!Object.keys(liveVotes).length) return;

        const result = calculateMultiWhoUsResult(liveVotes, state.players);

        const storedResult = {
          question,
          votes: liveVotes,
          counts: result.counts,
          winnerIds: result.winnerIds,
          maxVotes: result.maxVotes,
          totalVotes: result.totalVotes
        };

        revealButton.disabled = true;

        try {
          await AKFirebase.revealWhoUsResults(
            state.roomCode,
            gameState.currentIndex,
            storedResult
          );
        } catch (error) {
          console.error(error);
          revealButton.disabled = false;
          alert("Impossible de révéler les résultats.");
        }
      });
    }
  }

  function renderMultiWhoUsResults(gameState) {
    const result = gameState.currentResult || gameState.rounds?.[gameState.currentIndex];
    if (!result) return;

    const question = result.question || gameState.questions?.[gameState.currentIndex];
    const calculated = calculateMultiWhoUsResult(result.votes || {}, state.players);
    const event = getMultiWhoUsEvent(calculated, result.votes || {});
    const alcoholRule = getMultiAlcoholRule(gameState, calculated);

    title.textContent = "Le groupe a parlé";
    setBackVisible(false);

    screen.innerHTML = `
      <section class="card centered-card">
        <span class="category-chip">${whoUsCategoryLabels[question.category] || ""}</span>
        <h2 class="result-question">${escapeHtml(question.question)}</h2>
      </section>

      ${event ? `
        <section class="special-event ${event.type}">
          <strong>${escapeHtml(event.title)}</strong>
          <p>${escapeHtml(event.text)}</p>
        </section>
      ` : ""}

      <section class="results-list">
        ${calculated.sorted.map((player, index) => {
          const avatar = avatarById(player.avatarId);
          const denominator = Math.max(result.totalVotes || state.players.length, 1);
          const percentage = Math.round((player.votes / denominator) * 100);

          return `
            <div class="result-row ${index === 0 && player.votes > 0 ? "winner" : ""}">
              <div class="result-player">
                <span class="result-avatar">${avatar.emoji}</span>
                <div>
                  <strong>${escapeHtml(player.name)}</strong>
                  <span>${player.votes} vote${player.votes > 1 ? "s" : ""} · ${percentage}%</span>
                </div>
              </div>

              <div class="result-bar-track">
                <div class="result-bar-fill" style="width:${percentage}%"></div>
              </div>
            </div>
          `;
        }).join("")}
      </section>

      ${alcoholRule ? `<section class="alcohol-callout">${escapeHtml(alcoholRule)}</section>` : ""}

      ${state.isHost ? `
        <button id="nextMultiWhoUs" class="primary-btn full">
          ${gameState.currentIndex + 1 >= gameState.questions.length ? "Voir le bilan" : "Question suivante"}
        </button>
      ` : `
        <section class="waiting-host-card">
          <div class="waiting-pulse">👑</div>
          <h2>En attente de l'hôte</h2>
          <p>La suite apparaîtra automatiquement.</p>
        </section>
      `}
    `;

    const nextButton = document.querySelector("#nextMultiWhoUs");

    if (nextButton) {
      nextButton.addEventListener("click", async () => {
        const nextIndex = gameState.currentIndex + 1;
        const isFinished = nextIndex >= gameState.questions.length;

        nextButton.disabled = true;

        try {
          await AKFirebase.nextWhoUsQuestion(
            state.roomCode,
            isFinished ? gameState.currentIndex : nextIndex,
            isFinished
          );
        } catch (error) {
          console.error(error);
          nextButton.disabled = false;
          alert("Impossible de passer à la suite.");
        }
      });
    }
  }

  function calculateMultiFinalAwards(gameState) {
    const rounds = Object.values(gameState.rounds || {});

    const stats = Object.fromEntries(
      state.players.map(player => [
        player.id,
        {
          received: 0,
          selfVotes: 0,
          majorityMatches: 0,
          uniqueChoices: 0
        }
      ])
    );

    rounds.forEach(round => {
      Object.entries(round.counts || {}).forEach(([id, count]) => {
        if (stats[id]) {
          stats[id].received += Number(count || 0);
        }
      });

      Object.entries(round.votes || {}).forEach(([voterId, targetId]) => {
        if (!stats[voterId]) return;

        if (voterId === targetId) {
          stats[voterId].selfVotes += 1;
        }

        if ((round.winnerIds || []).includes(targetId)) {
          stats[voterId].majorityMatches += 1;
        }

        if (Number(round.counts?.[targetId] || 0) === 1) {
          stats[voterId].uniqueChoices += 1;
        }
      });
    });

    const sortBy = key => [...state.players].sort(
      (a, b) => Number(stats[b.id]?.[key] || 0) - Number(stats[a.id]?.[key] || 0)
    )[0];

    return {
      stats,
      roundCount: Math.max(rounds.length, 1),
      mostDesignated: sortBy("received"),
      selfReporter: sortBy("selfVotes"),
      peopleVoice: sortBy("majorityMatches"),
      freeSpirit: sortBy("uniqueChoices")
    };
  }

  function renderMultiWhoUsFinal(gameState) {
    const awards = calculateMultiFinalAwards(gameState);
    const { stats } = awards;

    title.textContent = "Bilan de la partie";
    setBackVisible(false);

    screen.innerHTML = `
      <section class="hero compact-hero">
        <h2>Votre soirée en chiffres</h2>
        <p>
          ${Object.keys(gameState.rounds || {}).length} questions,
          ${state.players.length} joueurs et un joli paquet de dossiers.
        </p>
      </section>

      <section class="award-grid">
        ${renderWhoUsAward(
          "👑",
          "La personne la plus désignée",
          awards.mostDesignated,
          `${stats[awards.mostDesignated.id].received} votes reçus`
        )}

        ${renderWhoUsAward(
          "🪞",
          "L’auto-dénonciation",
          awards.selfReporter,
          `${stats[awards.selfReporter.id].selfVotes} vote(s) pour soi-même`
        )}

        ${renderWhoUsAward(
          "🗳️",
          "L’avis du peuple",
          awards.peopleVoice,
          `${Math.round((stats[awards.peopleVoice.id].majorityMatches / awards.roundCount) * 100)}% avec la majorité`
        )}

        ${renderWhoUsAward(
          "🛸",
          "L’esprit libre",
          awards.freeSpirit,
          `${stats[awards.freeSpirit.id].uniqueChoices} choix solitaire(s)`
        )}
      </section>

      ${renderPostGameContinuation(gameState)}
    `;

    ensureEveningResult(gameState);
    bindPostGameContinuation(gameState);
  }


  /* =========================================================
     AK'GAMES V0.5 — DEUX NOUVEAUX JEUX MULTIJOUEURS
     ========================================================= */

  function clearMultiLobbyTimer() {
    if (state.multiLobbyTimer) {
      window.clearTimeout(state.multiLobbyTimer);
    }

    state.multiLobbyTimer = null;
  }

  function scheduleAutomaticLobbyReturn(delay = 12000) {
    if (!state.isHost || state.multiLobbyTimer) return;

    state.multiLobbyTimer = window.setTimeout(async () => {
      state.multiLobbyTimer = null;

      try {
        await AKFirebase.returnToLobby(state.roomCode);
      } catch (error) {
        console.error("Retour automatique au salon impossible :", error);
      }
    }, delay);
  }

  function randomActionId(prefix) {
    return `${prefix}_${AKFirebase.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  async function sendMultiAction(type, payload = {}) {
    await AKFirebase.writeOwnGameEntry(state.roomCode, "actions", {
      id: randomActionId(type),
      type,
      payload,
      createdAt: AKFirebase.now()
    });
  }

  function playerById(id) {
    return state.players.find(player => player.id === id) || null;
  }

  /* =========================================================
     AK'GAMES V0.6 — SOIRÉE CONTINUE
     ========================================================= */

  function createSessionGameId(type) {
    return `${type}_${AKFirebase.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function formatEveningTime(timestamp) {
    const value = Number(timestamp || 0);
    if (!value) return "";

    try {
      return new Date(value).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "";
    }
  }

  function gamePresentation(type) {
    const presentations = {
      "who-us": { name: "Qui de nous ?", icon: "👥" },
      "best-liar": { name: "Qui ment le mieux ?", icon: "🤥" },
      "laugh-duel": { name: "Le premier qui rit a perdu", icon: "😂" },
      "action-truth": { name: "Action ou Vérité", icon: "🎭" },
      "never-have-i-ever": { name: "Je n’ai jamais", icon: "🙋" },
      "would-you-rather": { name: "Tu préfères", icon: "⚖️" },
      "same-brain": { name: "Même cerveau", icon: "🧠" },
      "minority": { name: "Minorité", icon: "🪩" },
      "who-answered": { name: "Qui a répondu ça ?", icon: "🕵️" },
      "almost-impostor": { name: "L’Imposteur sait presque tout", icon: "🕶️" },
      "fake-expert": { name: "Le Faux Expert", icon: "🎓" },
      "who-am-i": { name: "Qui suis-je ?", icon: "❓" }
    };

    return presentations[type] || { name: "Jeu AK'Games", icon: "🎮" };
  }

  function snapshotPlayers() {
    return Object.fromEntries(
      state.players.map(player => [
        player.id,
        {
          name: player.name,
          avatarId: player.avatarId
        }
      ])
    );
  }

  function addEveningPoints(points, ids, amount) {
    (ids || []).forEach(id => {
      if (!id || amount <= 0) return;
      points[id] = Number(points[id] || 0) + Number(amount || 0);
    });
  }

  function topIdsFromStats(stats, key) {
    const rows = state.players.map(player => ({
      id: player.id,
      value: Number(stats?.[player.id]?.[key] || 0)
    }));
    const max = rows.length ? Math.max(...rows.map(row => row.value)) : 0;
    return max > 0 ? rows.filter(row => row.value === max).map(row => row.id) : [];
  }

  function replayDescriptorFromGame(gameState) {
    if (!gameState) return null;

    if (gameState.type === "who-us") {
      return {
        type: "who-us",
        config: {
          questionCount: Number(gameState.settings?.questionCount || gameState.questions?.length || 10),
          categories: [...(gameState.settings?.categories || ["drole", "chaos", "dossiers", "amitie", "soiree", "relations"])],
          includeAdult: Boolean(gameState.settings?.includeAdult),
          alcoholIntensity: gameState.settings?.alcoholIntensity || "normal"
        }
      };
    }

    if (gameState.type === "best-liar") {
      return {
        type: "best-liar",
        config: {
          roundCount: Number(gameState.settings?.roundCount || gameState.prompts?.length || 5),
          categories: [...(gameState.settings?.categories || ["excuses", "improbable", "quotidien", "dossiers", "chaos"])],
          includeAdult: Boolean(gameState.settings?.includeAdult)
        }
      };
    }

    if (gameState.type === "laugh-duel") {
      return {
        type: "laugh-duel",
        config: {
          player1Id: gameState.player1Id,
          player2Id: gameState.player2Id,
          mode: gameState.mode || "sudden",
          categories: [...(gameState.settings?.categories || ["nulles", "absurdes", "devinettes", "observation"])],
          includeAdult: Boolean(gameState.settings?.includeAdult)
        }
      };
    }

    if (gameState.type === "action-truth") {
      return {
        type: "action-truth",
        config: {
          roundCount: Number(gameState.settings?.roundCount || gameState.prompts?.length || 12),
          mode: gameState.settings?.mode || "mix",
          includeAdult: Boolean(gameState.settings?.includeAdult)
        }
      };
    }

    if (gameState.type === "never-have-i-ever" || gameState.type === "would-you-rather") {
      return {
        type: gameState.type,
        config: {
          roundCount: Number(gameState.settings?.roundCount || gameState.items?.length || 10),
          includeAdult: Boolean(gameState.settings?.includeAdult)
        }
      };
    }

    if (["same-brain", "minority", "who-answered"].includes(gameState.type)) {
      return {
        type: gameState.type,
        config: {
          roundCount: Number(gameState.settings?.roundCount || gameState.items?.length || 10),
          includeAdult: Boolean(gameState.settings?.includeAdult)
        }
      };
    }

    if (gameState.type === "almost-impostor") {
      return { type: gameState.type, config: { roundCount: Number(gameState.settings?.roundCount || gameState.items?.length || 6), includeAdult: Boolean(gameState.settings?.includeAdult), discussionSeconds: Number(gameState.settings?.discussionSeconds || 60) } };
    }

    if (gameState.type === "fake-expert") {
      return { type: gameState.type, config: { roundCount: Number(gameState.settings?.roundCount || gameState.items?.length || 6), includeAdult: Boolean(gameState.settings?.includeAdult), speechSeconds: Number(gameState.settings?.speechSeconds || 60) } };
    }

    if (gameState.type === "who-am-i") {
      return { type: gameState.type, config: { roundCount: Number(gameState.settings?.roundCount || gameState.items?.length || 8), includeAdult: Boolean(gameState.settings?.includeAdult), categoryMode: gameState.settings?.categoryMode || "mix", durationSeconds: Number(gameState.settings?.durationSeconds || 60) } };
    }

    if (String(gameState.type || "").startsWith("mega-")) {
      return {
        type: gameState.type,
        config: {
          gameName: gameState.settings?.gameName,
          roundCount: Number(gameState.settings?.roundCount || gameState.items?.length || 10),
          durationSeconds: Number(gameState.settings?.durationSeconds || 45)
        }
      };
    }

    return null;
  }

  function buildWhoUsSessionSummary(gameState) {
    const awards = calculateMultiFinalAwards(gameState);
    const points = {};
    const designatedIds = topIdsFromStats(awards.stats, "received");
    const peopleVoiceIds = topIdsFromStats(awards.stats, "majorityMatches");
    const freeSpiritIds = topIdsFromStats(awards.stats, "uniqueChoices");

    addEveningPoints(points, designatedIds, 3);
    addEveningPoints(points, peopleVoiceIds, 2);
    addEveningPoints(points, freeSpiritIds, 1);

    const names = designatedIds
      .map(id => playerById(id)?.name)
      .filter(Boolean);

    return {
      points,
      winnerIds: designatedIds,
      detail: names.length
        ? `${names.join(" et ")} ${names.length > 1 ? "sont les plus désignés" : "est la personne la plus désignée"}`
        : `${Object.keys(gameState.rounds || {}).length} questions terminées`
    };
  }

  function buildBestLiarSessionSummary(gameState) {
    const rawScores = gameState.scores || {};
    const positiveValues = [...new Set(
      state.players
        .map(player => Number(rawScores[player.id] || 0))
        .filter(value => value > 0)
    )].sort((a, b) => b - a);

    const podiumPoints = [3, 2, 1];
    const points = {};

    positiveValues.slice(0, 3).forEach((scoreValue, index) => {
      const ids = state.players
        .filter(player => Number(rawScores[player.id] || 0) === scoreValue)
        .map(player => player.id);
      addEveningPoints(points, ids, podiumPoints[index]);
    });

    const topScore = positiveValues[0] || 0;
    const winnerIds = topScore > 0
      ? state.players.filter(player => Number(rawScores[player.id] || 0) === topScore).map(player => player.id)
      : [];
    const names = winnerIds.map(id => playerById(id)?.name).filter(Boolean);

    return {
      points,
      winnerIds,
      detail: names.length
        ? `${names.join(" et ")} ${names.length > 1 ? "remportent" : "remporte"} le concours de mythos`
        : "Concours terminé sans vote gagnant"
    };
  }

  function buildLaughSessionSummary(gameState) {
    const winner = playerById(gameState.winnerId);
    const points = {};
    addEveningPoints(points, winner ? [winner.id] : [], 3);

    return {
      points,
      winnerIds: winner ? [winner.id] : [],
      detail: winner
        ? `${winner.name} remporte le duel`
        : "Duel terminé"
    };
  }

  function buildEveningSessionSummary(gameState) {
    if (!gameState) return null;

    const presentation = String(gameState.type || "").startsWith("mega-")
      ? { name: gameState.settings?.gameName || "Mega Pack", icon: gameState.settings?.icon || "🎮" }
      : gamePresentation(gameState.type);
    const resultId = gameState.sessionGameId || `${gameState.type}_${Number(gameState.startedAt || 0)}`;
    let result;

    if (gameState.type === "who-us") {
      result = buildWhoUsSessionSummary(gameState);
    } else if (gameState.type === "best-liar") {
      result = buildBestLiarSessionSummary(gameState);
    } else if (gameState.type === "laugh-duel") {
      result = buildLaughSessionSummary(gameState);
    } else if (["action-truth", "never-have-i-ever", "would-you-rather", "same-brain", "minority", "who-answered", "almost-impostor", "fake-expert", "who-am-i"].includes(gameState.type) || String(gameState.type || "").startsWith("mega-")) {
      result = buildAmbianceSessionSummary(gameState);
    } else {
      return null;
    }

    return {
      id: resultId,
      gameType: gameState.type,
      gameName: presentation.name,
      icon: presentation.icon,
      endedAt: Number(gameState.finishedAt || AKFirebase.now()),
      points: result.points,
      winnerIds: result.winnerIds,
      detail: result.detail,
      players: snapshotPlayers(),
      replay: replayDescriptorFromGame(gameState)
    };
  }

  function ensureEveningResult(gameState) {
    if (!state.isHost) return Promise.resolve(false);

    const summary = buildEveningSessionSummary(gameState);
    if (!summary) return Promise.resolve(false);

    const existing = state.roomData?.session?.history?.[summary.id];
    if (existing) return Promise.resolve(true);

    if (
      state.multiSessionRecordingId === summary.id
      && state.multiSessionRecordingPromise
    ) {
      return state.multiSessionRecordingPromise;
    }

    state.multiSessionRecordingId = summary.id;
    state.multiSessionRecordingPromise = AKFirebase.recordSessionResult(state.roomCode, summary)
      .catch(error => {
        console.error("Impossible d'enregistrer le résultat de la soirée :", error);
        return false;
      })
      .finally(() => {
        if (state.multiSessionRecordingId === summary.id) {
          state.multiSessionRecordingId = null;
          state.multiSessionRecordingPromise = null;
        }
      });

    return state.multiSessionRecordingPromise;
  }

  function sessionScoresIncludingCurrent(gameState) {
    const summary = buildEveningSessionSummary(gameState);
    const session = state.roomData?.session || {};
    const scores = { ...(session.scores || {}) };
    const alreadyRecorded = summary && Boolean(session.history?.[summary.id]);

    state.players.forEach(player => {
      scores[player.id] = Number(scores[player.id] || 0);
    });

    if (summary && !alreadyRecorded) {
      Object.entries(summary.points || {}).forEach(([id, value]) => {
        scores[id] = Number(scores[id] || 0) + Number(value || 0);
      });
    }

    return { summary, scores };
  }

  function renderPostGameContinuation(gameState) {
    const { summary, scores } = sessionScoresIncludingCurrent(gameState);
    const ranking = [...state.players].sort(
      (a, b) => Number(scores[b.id] || 0) - Number(scores[a.id] || 0)
    );
    const pointRows = Object.entries(summary?.points || {})
      .filter(([, value]) => Number(value || 0) > 0)
      .sort((a, b) => Number(b[1]) - Number(a[1]));

    return `
      <section class="evening-panel post-game-evening">
        <div class="room-section-heading">
          <div>
            <span class="room-kicker">SOIRÉE CONTINUE</span>
            <h2 class="section-title">Classement général</h2>
          </div>
          <span class="badge green">🏆 Score cumulé</span>
        </div>

        ${pointRows.length ? `
          <div class="points-earned">
            ${pointRows.map(([id, value]) => {
              const player = playerById(id);
              return `
                <span>
                  ${avatarById(player?.avatarId).emoji}
                  ${escapeHtml(player?.name || "Joueur")}
                  <strong>+${Number(value)} pt${Number(value) > 1 ? "s" : ""}</strong>
                </span>
              `;
            }).join("")}
          </div>
        ` : `
          <div class="notice">Aucun point de soirée n’est ajouté pour cette partie.</div>
        `}

        <div class="evening-leaderboard">
          ${ranking.map((player, index) => `
            <div class="evening-score-row ${index === 0 ? "leader" : ""}">
              <span class="ranking-position">${index + 1}</span>
              <span class="result-avatar">${avatarById(player.avatarId).emoji}</span>
              <strong>${escapeHtml(player.name)}</strong>
              <span class="evening-score">${Number(scores[player.id] || 0)} pts</span>
            </div>
          `).join("")}
        </div>
      </section>

      ${state.isHost ? `
        <section class="post-game-controls">
          <button id="eveningReplayGame" class="primary-btn">🔁 Rejouer</button>
          <button id="eveningRandomGame" class="secondary-btn">🎲 Jeu aléatoire</button>
          <button id="eveningChooseGame" class="secondary-btn">🎮 Choisir un autre jeu</button>
          <button id="eveningReturnLobby" class="secondary-btn">🏠 Retour au salon</button>
        </section>
      ` : `
        <section class="waiting-host-card">
          <div class="waiting-pulse">🎮</div>
          <h2>La soirée continue</h2>
          <p>L’hôte choisit la prochaine partie. Tu restes dans le même salon.</p>
        </section>
      `}
    `;
  }

  function setPostGameButtonsDisabled(disabled) {
    [
      "#eveningReplayGame",
      "#eveningRandomGame",
      "#eveningChooseGame",
      "#eveningReturnLobby"
    ].forEach(selector => {
      const button = document.querySelector(selector);
      if (button) button.disabled = disabled;
    });
  }

  async function launchReplayDescriptor(descriptor) {
    if (!state.isHost || !descriptor?.type) return;

    state.multiRenderKey = null;

    if (descriptor.type === "who-us") {
      const config = descriptor.config || {};
      state.quiDeNous = {
        questionCount: Number(config.questionCount || 10),
        categories: [...(config.categories || ["drole", "chaos", "dossiers", "amitie", "soiree", "relations"])],
        includeAdult: Boolean(state.adult && config.includeAdult),
        alcoholIntensity: config.alcoholIntensity || "normal",
        questions: [],
        currentIndex: 0,
        currentVoterIndex: 0,
        currentVotes: {},
        rounds: []
      };
      await startWhoUsGame();
      return;
    }

    if (descriptor.type === "best-liar") {
      if (state.players.length < 3) {
        throw new Error("« Qui ment le mieux ? » nécessite au moins 3 joueurs.");
      }

      const config = descriptor.config || {};
      state.bestLiar = {
        roundCount: Number(config.roundCount || 5),
        categories: [...(config.categories || ["excuses", "improbable", "quotidien", "dossiers", "chaos"])],
        includeAdult: Boolean(state.adult && config.includeAdult),
        prompts: [],
        currentRound: 0,
        currentWriterIndex: 0,
        currentVoterIndex: 0,
        currentAnswers: [],
        currentVotes: {},
        scores: Object.fromEntries(state.players.map(player => [player.id, 0])),
        rounds: []
      };
      await startBestLiarGame();
      return;
    }

    if (descriptor.type === "action-truth") {
      const config = descriptor.config || {};
      state.actionTruth = {
        roundCount: Number(config.roundCount || 12),
        mode: config.mode || "mix",
        includeAdult: Boolean(state.adult && config.includeAdult),
        forceAdult: false,
        prompts: [],
        currentIndex: 0,
        scores: Object.fromEntries(state.players.map(player => [player.id, 0])),
        results: []
      };
      await startActionTruthGame();
      return;
    }

    if (descriptor.type === "never-have-i-ever" || descriptor.type === "would-you-rather") {
      const config = descriptor.config || {};
      const type = descriptor.type === "never-have-i-ever" ? "never" : "would";
      state.ambiancePoll = {
        type,
        roundCount: Number(config.roundCount || 10),
        includeAdult: Boolean(state.adult && config.includeAdult),
        forceAdult: false,
        items: [],
        currentIndex: 0,
        currentVoterIndex: 0,
        votes: {},
        scores: Object.fromEntries(state.players.map(player => [player.id, 0])),
        rounds: []
      };
      await startAmbiancePollGame();
      return;
    }

    if (descriptor.type === "same-brain") {
      const config = descriptor.config || {};
      state.sameBrain = { roundCount: Number(config.roundCount || 10), includeAdult: Boolean(state.adult && config.includeAdult), items: [], currentIndex: 0, currentWriterIndex: 0, answers: {}, scores: Object.fromEntries(state.players.map(player => [player.id, 0])), rounds: [] };
      await startSameBrainGame();
      return;
    }

    if (descriptor.type === "minority") {
      const config = descriptor.config || {};
      state.minorityGame = { roundCount: Number(config.roundCount || 10), includeAdult: Boolean(state.adult && config.includeAdult), items: [], currentIndex: 0, currentVoterIndex: 0, votes: {}, scores: Object.fromEntries(state.players.map(player => [player.id, 0])), rounds: [] };
      await startMinorityGame();
      return;
    }

    if (descriptor.type === "who-answered") {
      if (state.players.length < 3) throw new Error("« Qui a répondu ça ? » nécessite au moins 3 joueurs.");
      const config = descriptor.config || {};
      state.whoAnswered = { roundCount: Number(config.roundCount || Math.max(6, state.players.length)), includeAdult: Boolean(state.adult && config.includeAdult), items: [], currentIndex: 0, currentWriterIndex: 0, currentVoterIndex: 0, answers: {}, votes: {}, authorOrder: shuffleArray(state.players.map(player => player.id)), scores: Object.fromEntries(state.players.map(player => [player.id, 0])), rounds: [] };
      await startWhoAnsweredGame();
      return;
    }

    if (descriptor.type === "almost-impostor") {
      if (state.players.length < 3) throw new Error("Ce jeu nécessite au moins 3 joueurs.");
      const config = descriptor.config || {};
      state.almostImpostor = { roundCount: Number(config.roundCount || 6), includeAdult: Boolean(state.adult && config.includeAdult), discussionSeconds: Number(config.discussionSeconds || 60), items: [], currentIndex: 0, roleOrder: [], roleViewIndex: 0, impostorId: null, votes: {}, currentVoterIndex: 0, scores: Object.fromEntries(state.players.map(player => [player.id, 0])), currentResult: null, rounds: [] };
      await startAlmostImpostorGame();
      return;
    }

    if (descriptor.type === "fake-expert") {
      if (state.players.length < 3) throw new Error("Ce jeu nécessite au moins 3 joueurs.");
      const config = descriptor.config || {};
      state.fakeExpert = { roundCount: Number(config.roundCount || Math.max(5, state.players.length)), includeAdult: Boolean(state.adult && config.includeAdult), speechSeconds: Number(config.speechSeconds || 60), items: [], currentIndex: 0, speakerOrder: shuffleArray(state.players.map(player => player.id)), speakerId: null, role: null, votes: {}, currentVoterIndex: 0, scores: Object.fromEntries(state.players.map(player => [player.id, 0])), rounds: [] };
      await startFakeExpertGame();
      return;
    }

    if (descriptor.type === "who-am-i") {
      const config = descriptor.config || {};
      state.whoAmI = { roundCount: Number(config.roundCount || Math.max(6, state.players.length)), includeAdult: Boolean(state.adult && config.includeAdult), categoryMode: config.categoryMode || "mix", durationSeconds: Number(config.durationSeconds || 60), items: [], currentIndex: 0, guesserOrder: shuffleArray(state.players.map(player => player.id)), scores: Object.fromEntries(state.players.map(player => [player.id, 0])), rounds: [] };
      await startWhoAmIGame();
      return;
    }

    if (String(descriptor.type || "").startsWith("mega-")) {
      const config = descriptor.config || {};
      if (!config.gameName || !V014_GAME_CONFIGS[config.gameName]) {
        throw new Error("Jeu du Mega Pack introuvable.");
      }
      resetMegaGame(config.gameName, {
        roundCount: Number(config.roundCount || V014_GAME_CONFIGS[config.gameName].defaultRounds || 10),
        durationSeconds: Number(config.durationSeconds || V014_GAME_CONFIGS[config.gameName].timer || 45)
      });
      await startMegaGame();
      return;
    }

    if (descriptor.type === "laugh-duel") {
      const config = descriptor.config || {};
      const availableIds = state.players.map(player => player.id);
      let player1Id = availableIds.includes(config.player1Id) ? config.player1Id : availableIds[0];
      let player2Id = availableIds.includes(config.player2Id) ? config.player2Id : availableIds[1];

      if (!player1Id || !player2Id || player1Id === player2Id) {
        const shuffled = shuffleArray(availableIds);
        [player1Id, player2Id] = shuffled;
      }

      state.laughDuel = {
        player1Id,
        player2Id,
        mode: config.mode || "sudden",
        categories: [...(config.categories || ["nulles", "absurdes", "devinettes", "observation"])],
        includeAdult: Boolean(state.adult && config.includeAdult),
        jokePool: [],
        usedJokeIds: [],
        currentTurnId: null,
        currentJoke: null,
        punchlineVisible: false,
        lives: {}
      };
      await startLaughDuel();
    }
  }

  async function launchRandomMultiplayerGame() {
    if (!state.isHost || state.players.length < 2) return;

    const availableTypes = ["who-us", "laugh-duel", "action-truth", "never-have-i-ever", "would-you-rather", "same-brain", "minority", "who-am-i"];
    if (state.players.length >= 3) {
      availableTypes.push("best-liar", "who-answered", "almost-impostor", "fake-expert");
    }

    const lastType = state.roomData?.session?.lastGame?.type;
    const choices = availableTypes.length > 1
      ? availableTypes.filter(type => type !== lastType)
      : availableTypes;
    const selectedType = choices[Math.floor(Math.random() * choices.length)];

    if (selectedType === "who-us") {
      await launchReplayDescriptor({
        type: "who-us",
        config: {
          questionCount: 10,
          categories: ["drole", "chaos", "dossiers", "amitie", "soiree", "relations"],
          includeAdult: false,
          alcoholIntensity: "normal"
        }
      });
      return;
    }

    if (selectedType === "best-liar") {
      await launchReplayDescriptor({
        type: "best-liar",
        config: {
          roundCount: 5,
          categories: ["excuses", "improbable", "quotidien", "dossiers", "chaos"],
          includeAdult: false
        }
      });
      return;
    }

    if (selectedType === "action-truth") {
      await launchReplayDescriptor({ type: "action-truth", config: { roundCount: 12, mode: "mix", includeAdult: false } });
      return;
    }

    if (selectedType === "never-have-i-ever") {
      await launchReplayDescriptor({ type: "never-have-i-ever", config: { roundCount: 10, includeAdult: false } });
      return;
    }

    if (selectedType === "would-you-rather") {
      await launchReplayDescriptor({ type: "would-you-rather", config: { roundCount: 10, includeAdult: false } });
      return;
    }

    if (selectedType === "same-brain") {
      await launchReplayDescriptor({ type: "same-brain", config: { roundCount: 10, includeAdult: false } });
      return;
    }

    if (selectedType === "minority") {
      await launchReplayDescriptor({ type: "minority", config: { roundCount: 10, includeAdult: false } });
      return;
    }

    if (selectedType === "who-answered") {
      await launchReplayDescriptor({ type: "who-answered", config: { roundCount: Math.max(6, state.players.length), includeAdult: false } });
      return;
    }

    if (selectedType === "almost-impostor") {
      await launchReplayDescriptor({ type: "almost-impostor", config: { roundCount: 6, includeAdult: false, discussionSeconds: 60 } });
      return;
    }

    if (selectedType === "fake-expert") {
      await launchReplayDescriptor({ type: "fake-expert", config: { roundCount: Math.max(5, state.players.length), includeAdult: false, speechSeconds: 60 } });
      return;
    }

    if (selectedType === "who-am-i") {
      await launchReplayDescriptor({ type: "who-am-i", config: { roundCount: Math.max(6, state.players.length), includeAdult: false, categoryMode: "mix", durationSeconds: 60 } });
      return;
    }

    const shuffledPlayers = shuffleArray(state.players);
    await launchReplayDescriptor({
      type: "laugh-duel",
      config: {
        player1Id: shuffledPlayers[0]?.id,
        player2Id: shuffledPlayers[1]?.id,
        mode: "sudden",
        categories: ["nulles", "absurdes", "devinettes", "observation"],
        includeAdult: false
      }
    });
  }

  async function handlePostGameAction(action, gameState) {
    if (!state.isHost) return;

    setPostGameButtonsDisabled(true);
    const resultRecorded = await ensureEveningResult(gameState);

    if (!resultRecorded) {
      setPostGameButtonsDisabled(false);
      alert("Le score de la soirée n’a pas pu être enregistré. Réessaie dans un instant.");
      return;
    }

    try {
      if (action === "replay") {
        const descriptor = replayDescriptorFromGame(gameState);
        if (!descriptor) throw new Error("Cette partie ne peut pas être rejouée.");
        await launchReplayDescriptor(descriptor);
        return;
      }

      if (action === "random") {
        await launchRandomMultiplayerGame();
        return;
      }

      clearMultiLobbyTimer();
      await AKFirebase.returnToLobby(state.roomCode);

      if (action === "choose") {
        state.multiView = "browse";
        state.multiRenderKey = null;
        state.history = ["lobby"];
        renderPlayChoice();
        return;
      }

      state.multiView = "lobby";
      state.multiRenderKey = null;
      renderLobby();
    } catch (error) {
      console.error(error);
      setPostGameButtonsDisabled(false);
      alert(error.message || "Impossible de préparer la suite de la soirée.");
    }
  }

  function bindPostGameContinuation(gameState) {
    document.querySelector("#eveningReplayGame")?.addEventListener("click", () => {
      handlePostGameAction("replay", gameState);
    });

    document.querySelector("#eveningRandomGame")?.addEventListener("click", () => {
      handlePostGameAction("random", gameState);
    });

    document.querySelector("#eveningChooseGame")?.addEventListener("click", () => {
      handlePostGameAction("choose", gameState);
    });

    document.querySelector("#eveningReturnLobby")?.addEventListener("click", () => {
      handlePostGameAction("lobby", gameState);
    });
  }

  function renderMultiProgress(current, total, label = "Manche") {
    const safeTotal = Math.max(Number(total || 0), 1);
    const safeCurrent = Math.min(Math.max(Number(current || 1), 1), safeTotal);

    return `
      <section class="game-progress">
        <span>${escapeHtml(label)} ${safeCurrent}/${safeTotal}</span>
        <div class="progress-track">
          <div class="progress-fill" style="width:${(safeCurrent / safeTotal) * 100}%"></div>
        </div>
      </section>
    `;
  }

  function renderMultiWaiting(titleText, text, emoji = "⏳") {
    return `
      <section class="multiplayer-wait-card">
        <div class="waiting-pulse">${emoji}</div>
        <h2>${escapeHtml(titleText)}</h2>
        <p>${escapeHtml(text)}</p>
      </section>
    `;
  }

  function renderPlayerSubmissionStatus(collection, doneLabel, waitingLabel) {
    return `
      <section class="submission-status-grid">
        ${state.players.map(player => {
          const done = Boolean(collection?.[player.id]);
          const avatar = avatarById(player.avatarId);

          return `
            <div class="submission-status ${done ? "done" : "waiting"}">
              <span>${avatar.emoji}</span>
              <strong>${escapeHtml(player.name)}</strong>
              <small>${done ? escapeHtml(doneLabel) : escapeHtml(waitingLabel)}</small>
            </div>
          `;
        }).join("")}
      </section>
    `;
  }

  /* -------------------------
     QUI MENT LE MIEUX ?
     ------------------------- */

  startBestLiarGame = async function () {
    if (!isMultiplayer()) {
      return localStartBestLiarGame();
    }

    if (!state.isHost) return;

    const game = state.bestLiar;

    if (state.players.length < 3) {
      alert("Ajoute au moins 3 joueurs.");
      return;
    }

    if (!game.categories.length && !game.includeAdult) {
      alert("Choisis au moins une catégorie.");
      return;
    }

    screen.innerHTML = `<div class="notice">Synchronisation du concours de mythos…</div>`;

    try {
      const classicResponse = await fetch("data/qui-ment-prompts.json");
      if (!classicResponse.ok) throw new Error("Impossible de charger les situations.");

      const classicPrompts = await classicResponse.json();
      let pool = classicPrompts.filter(prompt => game.categories.includes(prompt.category));

      if (state.adult && game.includeAdult) {
        const adultResponse = await fetch("data/qui-ment-prompts-adulte.json");
        if (!adultResponse.ok) throw new Error("Impossible de charger les situations adultes.");
        const adultPrompts = await adultResponse.json();
        pool = pool.concat(adultPrompts);
      }

      if (!pool.length) throw new Error("Aucune situation disponible avec ces réglages.");

      const prompts = shuffleArray(pool).slice(0, Math.min(game.roundCount, pool.length));
      const scores = Object.fromEntries(state.players.map(player => [player.id, 0]));

      await AKFirebase.setGame(state.roomCode, {
        state: {
          type: "best-liar",
          phase: "answering",
          sessionGameId: createSessionGameId("best-liar"),
          prompts,
          currentRound: 0,
          settings: {
            categories: [...game.categories],
            roundCount: Number(game.roundCount || prompts.length),
            includeAdult: Boolean(game.includeAdult)
          },
          scores,
          rounds: {},
          currentResult: null,
          answerOrder: null,
          startedAt: AKFirebase.now(),
          updatedAt: AKFirebase.now()
        }
      });

      state.multiView = "best-liar-game";
    } catch (error) {
      console.error(error);
      alert(error.message || "Impossible de lancer la partie.");
      renderBestLiarSetup();
    }
  };

  function syncMultiBestLiar(room) {
    const gameState = room.game?.state;
    const answers = room.game?.answers || {};
    const votes = room.game?.votes || {};

    if (!gameState || gameState.type !== "best-liar") return;

    if (gameState.phase !== "final") {
      clearMultiLobbyTimer();
    }

    state.bestLiar = {
      ...(state.bestLiar || {}),
      prompts: gameState.prompts || [],
      currentRound: Number(gameState.currentRound || 0),
      scores: gameState.scores || {},
      rounds: gameState.rounds || {},
      currentAnswers: answers,
      currentVotes: votes
    };

    const renderKey = [
      "best-liar",
      gameState.phase,
      gameState.currentRound,
      Object.keys(answers).length,
      Object.keys(votes).length,
      Boolean(answers[state.currentUid]),
      votes[state.currentUid] || "",
      JSON.stringify(gameState.currentResult || {}),
      JSON.stringify(gameState.scores || {})
    ].join("|");

    if (state.multiRenderKey === renderKey) return;
    state.multiRenderKey = renderKey;

    if (gameState.phase === "answering") {
      renderMultiBestLiarAnswering(gameState, answers);
      return;
    }

    if (gameState.phase === "voting") {
      renderMultiBestLiarVoting(gameState, answers, votes);
      return;
    }

    if (gameState.phase === "results") {
      renderMultiBestLiarResults(gameState);
      return;
    }

    if (gameState.phase === "final") {
      renderMultiBestLiarFinal(gameState);
    }
  }

  function renderMultiBestLiarAnswering(gameState, answers) {
    const prompt = gameState.prompts?.[gameState.currentRound];
    if (!prompt) return;

    const ownAnswer = answers[state.currentUid] || null;
    const answerCount = Object.keys(answers).length;
    const totalPlayers = state.players.length;

    title.textContent = "Qui ment le mieux ?";
    setBackVisible(false);

    screen.innerHTML = `
      ${renderMultiProgress(gameState.currentRound + 1, gameState.prompts.length)}

      <section class="card centered-card">
        <span class="category-chip">${liarCategoryLabels[prompt.category] || "🤥 Mensonge"}</span>
        <h2>${escapeHtml(prompt.prompt)}</h2>
        <p class="helper">Invente une réponse crédible, drôle ou délicieusement douteuse.</p>
      </section>

      ${ownAnswer ? `
        ${renderMultiWaiting(
          "Ton mensonge est enregistré",
          `${answerCount}/${totalPlayers} joueurs ont répondu. Les auteurs resteront secrets.`,
          "🤐"
        )}
      ` : `
        <section class="card">
          <div class="form-group">
            <label for="multiLieAnswer">Ton mensonge secret</label>
            <textarea
              id="multiLieAnswer"
              class="text-input text-area multi-answer-textarea"
              maxlength="280"
              placeholder="Écris une réponse suffisamment crédible pour tromper le groupe…"
            ></textarea>
            <span id="multiLieCounter" class="helper">0/280</span>
          </div>
        </section>

        <button id="submitMultiLie" class="primary-btn full">Valider mon mensonge</button>
      `}

      ${state.isHost ? `
        <section class="host-control-card">
          <div>
            <strong>👑 Contrôle de l'hôte</strong>
            <span>${answerCount}/${totalPlayers} réponses reçues</span>
          </div>
          <button id="beginMultiLieVotes" class="primary-btn" ${answerCount < totalPlayers ? "disabled" : ""}>
            Passer aux votes
          </button>
        </section>
      ` : ""}

      ${renderPlayerSubmissionStatus(answers, "Réponse prête", "Réfléchit encore")}
    `;

    const textarea = document.querySelector("#multiLieAnswer");
    const counter = document.querySelector("#multiLieCounter");

    textarea?.addEventListener("input", () => {
      counter.textContent = `${textarea.value.length}/280`;
    });

    document.querySelector("#submitMultiLie")?.addEventListener("click", async event => {
      const text = textarea.value.trim();

      if (text.length < 3) {
        alert("Écris une réponse un peu plus complète.");
        return;
      }

      event.currentTarget.disabled = true;

      try {
        await AKFirebase.writeOwnGameEntry(state.roomCode, "answers", {
          id: randomActionId("answer"),
          playerId: state.currentUid,
          text,
          submittedAt: AKFirebase.now()
        });
      } catch (error) {
        console.error(error);
        event.currentTarget.disabled = false;
        alert("Ton mensonge n'a pas pu être envoyé.");
      }
    });

    document.querySelector("#beginMultiLieVotes")?.addEventListener("click", async event => {
      const liveAnswers = state.roomData?.game?.answers || {};

      if (Object.keys(liveAnswers).length < state.players.length) return;

      event.currentTarget.disabled = true;

      try {
        await AKFirebase.updateGame(state.roomCode, {
          "state/phase": "voting",
          "state/answerOrder": shuffleArray(Object.keys(liveAnswers)),
          "state/currentResult": null,
          "state/updatedAt": AKFirebase.now(),
          revealedAnswers: liveAnswers,
          votes: null
        });
      } catch (error) {
        console.error(error);
        event.currentTarget.disabled = false;
        alert("Impossible de lancer les votes.");
      }
    });
  }

  function renderMultiBestLiarVoting(gameState, answers, votes) {
    const prompt = gameState.prompts?.[gameState.currentRound];
    if (!prompt) return;

    const answerOrder = Array.isArray(gameState.answerOrder)
      ? gameState.answerOrder
      : Object.keys(answers);

    const availableAnswerIds = answerOrder.filter(answerUid => answerUid !== state.currentUid && answers[answerUid]);
    const ownVote = votes[state.currentUid] || null;
    const voteCount = Object.keys(votes).length;
    const totalPlayers = state.players.length;

    title.textContent = "Vote secret";
    setBackVisible(false);

    screen.innerHTML = `
      ${renderMultiProgress(gameState.currentRound + 1, gameState.prompts.length)}

      <section class="card centered-card">
        <span class="category-chip">Vote anonyme</span>
        <h2>${escapeHtml(prompt.prompt)}</h2>
        <p class="helper">Choisis le mensonge le plus convaincant. Ta propre réponse est masquée.</p>
      </section>

      ${ownVote ? `
        ${renderMultiWaiting(
          "Ton vote est enregistré",
          `${voteCount}/${totalPlayers} joueurs ont voté.`,
          "🗳️"
        )}
      ` : `
        <section class="anonymous-answer-list">
          ${availableAnswerIds.map((answerUid, index) => `
            <button class="anonymous-answer-card vote-answer-card" data-multi-lie-vote="${answerUid}">
              <span class="answer-number">${index + 1}</span>
              <p>${escapeHtml(answers[answerUid].text)}</p>
            </button>
          `).join("")}
        </section>
      `}

      ${state.isHost ? `
        <section class="host-control-card">
          <div>
            <strong>👑 Contrôle de l'hôte</strong>
            <span>${voteCount}/${totalPlayers} votes reçus</span>
          </div>
          <button id="revealMultiLieResults" class="primary-btn" ${voteCount === 0 ? "disabled" : ""}>
            ${voteCount >= totalPlayers ? "Révéler les résultats" : "Révéler maintenant"}
          </button>
        </section>
      ` : ""}

      ${renderPlayerSubmissionStatus(votes, "A voté", "Choisit encore")}
    `;

    document.querySelectorAll("[data-multi-lie-vote]").forEach(button => {
      button.addEventListener("click", async () => {
        if (votes[state.currentUid]) return;

        button.disabled = true;

        try {
          await AKFirebase.writeOwnGameEntry(
            state.roomCode,
            "votes",
            button.dataset.multiLieVote
          );
        } catch (error) {
          console.error(error);
          button.disabled = false;
          alert("Ton vote n'a pas pu être envoyé.");
        }
      });
    });

    document.querySelector("#revealMultiLieResults")?.addEventListener("click", async event => {
      const liveAnswers = state.roomData?.game?.answers || {};
      const liveVotes = state.roomData?.game?.votes || {};
      const voteValues = Object.values(liveVotes);

      if (!voteValues.length) return;

      const counts = Object.fromEntries(Object.keys(liveAnswers).map(uid => [uid, 0]));
      voteValues.forEach(uid => {
        if (Object.prototype.hasOwnProperty.call(counts, uid)) counts[uid] += 1;
      });

      const rows = Object.entries(liveAnswers)
        .map(([uid, answer]) => ({
          playerId: uid,
          answerId: answer.id,
          text: answer.text,
          votes: counts[uid] || 0
        }))
        .sort((a, b) => b.votes - a.votes);

      const maxVotes = rows.length ? rows[0].votes : 0;
      const winnerIds = rows.filter(row => row.votes === maxVotes && maxVotes > 0).map(row => row.playerId);
      const scores = { ...(gameState.scores || {}) };

      rows.forEach(row => {
        scores[row.playerId] = Number(scores[row.playerId] || 0) + Number(row.votes || 0);
      });

      const result = {
        prompt,
        rows,
        votes: liveVotes,
        winnerIds,
        maxVotes,
        totalVotes: voteValues.length
      };

      event.currentTarget.disabled = true;

      try {
        await AKFirebase.updateGame(state.roomCode, {
          "state/phase": "results",
          "state/currentResult": result,
          [`state/rounds/${gameState.currentRound}`]: result,
          "state/scores": scores,
          "state/updatedAt": AKFirebase.now()
        });
      } catch (error) {
        console.error(error);
        event.currentTarget.disabled = false;
        alert("Impossible de révéler les résultats.");
      }
    });
  }

  function renderMultiBestLiarResults(gameState) {
    const result = gameState.currentResult || gameState.rounds?.[gameState.currentRound];
    if (!result) return;

    const winnerNames = (result.winnerIds || [])
      .map(id => playerById(id)?.name)
      .filter(Boolean);

    title.textContent = "Les masques tombent";
    setBackVisible(false);

    screen.innerHTML = `
      ${renderMultiProgress(gameState.currentRound + 1, gameState.prompts.length)}

      <section class="card centered-card">
        <span class="category-chip">${liarCategoryLabels[result.prompt?.category] || "🤥"}</span>
        <h2>${escapeHtml(result.prompt?.prompt || "")}</h2>
      </section>

      <section class="special-event ${winnerNames.length > 1 ? "tie" : "unanimity"}">
        <strong>${winnerNames.length > 1 ? "⚔️ Égalité parfaite" : "🤥 Meilleur mensonge de la manche"}</strong>
        <p>${escapeHtml(winnerNames.join(" et ") || "Personne")} ${winnerNames.length > 1 ? "remportent" : "remporte"} cette manche.</p>
      </section>

      <section class="liar-results-list">
        ${(result.rows || []).map((row, index) => {
          const author = playerById(row.playerId);
          const denominator = Math.max(Number(result.totalVotes || 0), 1);
          const percentage = Math.round((Number(row.votes || 0) / denominator) * 100);

          return `
            <article class="liar-result-card ${index === 0 && row.votes > 0 ? "winner" : ""}">
              <div class="liar-result-header">
                <span class="result-avatar">${avatarById(author?.avatarId).emoji}</span>
                <div>
                  <strong>${escapeHtml(author?.name || "Joueur")}</strong>
                  <span>${row.votes} vote${row.votes > 1 ? "s" : ""} · ${percentage}%</span>
                </div>
              </div>
              <p>« ${escapeHtml(row.text)} »</p>
            </article>
          `;
        }).join("")}
      </section>

      ${state.alcohol && winnerNames.length ? `
        <div class="alcohol-callout">🍻 ${escapeHtml(winnerNames.join(" et "))} ${winnerNames.length > 1 ? "distribuent" : "distribue"} 2 petites gorgées.</div>
      ` : ""}

      <section class="score-strip">
        ${[...state.players]
          .sort((a, b) => Number(gameState.scores?.[b.id] || 0) - Number(gameState.scores?.[a.id] || 0))
          .map(player => `
            <span>${avatarById(player.avatarId).emoji} ${escapeHtml(player.name)} <strong>${Number(gameState.scores?.[player.id] || 0)}</strong></span>
          `).join("")}
      </section>

      ${state.isHost ? `
        <button id="nextMultiLieRound" class="primary-btn full">
          ${gameState.currentRound + 1 >= gameState.prompts.length ? "Voir le classement final" : "Manche suivante"}
        </button>
      ` : renderMultiWaiting("En attente de l'hôte", "La prochaine manche apparaîtra automatiquement.", "👑")}
    `;

    document.querySelector("#nextMultiLieRound")?.addEventListener("click", async event => {
      const nextRound = gameState.currentRound + 1;
      const finished = nextRound >= gameState.prompts.length;
      event.currentTarget.disabled = true;

      try {
        await AKFirebase.updateGame(state.roomCode, {
          "state/phase": finished ? "final" : "answering",
          "state/currentRound": finished ? gameState.currentRound : nextRound,
          "state/currentResult": null,
          "state/answerOrder": null,
          "state/finishedAt": finished ? AKFirebase.now() : null,
          "state/updatedAt": AKFirebase.now(),
          answers: null,
          votes: null
        });
      } catch (error) {
        console.error(error);
        event.currentTarget.disabled = false;
        alert("Impossible de passer à la suite.");
      }
    });
  }

  function renderMultiBestLiarFinal(gameState) {
    const ranking = [...state.players].sort(
      (a, b) => Number(gameState.scores?.[b.id] || 0) - Number(gameState.scores?.[a.id] || 0)
    );
    const topScore = ranking.length ? Number(gameState.scores?.[ranking[0].id] || 0) : 0;
    const champions = ranking.filter(player => Number(gameState.scores?.[player.id] || 0) === topScore);

    title.textContent = "Classement final";
    setBackVisible(false);

    screen.innerHTML = `
      <section class="winner-stage">
        <div class="winner-crown">🤥👑</div>
        <h2>${champions.length === 1 ? "Le Mytho suprême est…" : "Les Mythos suprêmes sont…"}</h2>
        <div class="champion-row">
          ${champions.map(player => `
            <div class="champion-card">
              <span>${avatarById(player.avatarId).emoji}</span>
              <strong>${escapeHtml(player.name)}</strong>
              <small>${Number(gameState.scores?.[player.id] || 0)} votes gagnés</small>
            </div>
          `).join("")}
        </div>
      </section>

      <section class="final-ranking">
        ${ranking.map((player, index) => `
          <div class="ranking-row">
            <span class="ranking-position">${index + 1}</span>
            <span class="result-avatar">${avatarById(player.avatarId).emoji}</span>
            <strong>${escapeHtml(player.name)}</strong>
            <span>${Number(gameState.scores?.[player.id] || 0)} pts</span>
          </div>
        `).join("")}
      </section>

      ${renderPostGameContinuation(gameState)}
    `;

    ensureEveningResult(gameState);
    bindPostGameContinuation(gameState);
  }

  /* -------------------------
     LE PREMIER QUI RIT A PERDU
     ------------------------- */

  startLaughDuel = async function () {
    if (!isMultiplayer()) {
      return localStartLaughDuel();
    }

    if (!state.isHost) return;

    const game = state.laughDuel;

    if (!game.player1Id || !game.player2Id || game.player1Id === game.player2Id) {
      alert("Choisis deux joueurs différents.");
      return;
    }

    if (!game.categories.length && !game.includeAdult) {
      alert("Choisis au moins un type de blague.");
      return;
    }

    screen.innerHTML = `<div class="notice">Synchronisation du duel…</div>`;

    try {
      const classicResponse = await fetch("data/blagues.json");
      if (!classicResponse.ok) throw new Error("Impossible de charger les blagues.");

      const classicJokes = await classicResponse.json();
      let pool = classicJokes.filter(joke => game.categories.includes(joke.category));

      if (state.adult && game.includeAdult) {
        const adultResponse = await fetch("data/blagues-adulte.json");
        if (!adultResponse.ok) throw new Error("Impossible de charger les blagues adultes.");
        const adultJokes = await adultResponse.json();
        pool = pool.concat(adultJokes);
      }

      if (!pool.length) throw new Error("Aucune blague disponible avec ces réglages.");

      const jokes = shuffleArray(pool).slice(0, Math.min(pool.length, 45));
      const currentTurnId = Math.random() < 0.5 ? game.player1Id : game.player2Id;
      const lifeCount = game.mode === "lives" ? 3 : 1;

      await AKFirebase.setGame(state.roomCode, {
        state: {
          type: "laugh-duel",
          phase: "turn-choice",
          sessionGameId: createSessionGameId("laugh-duel"),
          player1Id: game.player1Id,
          player2Id: game.player2Id,
          mode: game.mode,
          settings: {
            categories: [...game.categories],
            includeAdult: Boolean(game.includeAdult)
          },
          jokes,
          usedJokeIds: [],
          currentTurnId,
          currentJoke: null,
          jokeSource: null,
          punchlineVisible: false,
          lives: {
            [game.player1Id]: lifeCount,
            [game.player2Id]: lifeCount
          },
          turnNumber: 1,
          lastResult: null,
          winnerId: null,
          loserId: null,
          startedAt: AKFirebase.now(),
          updatedAt: AKFirebase.now()
        }
      });

      state.multiView = "laugh-duel-game";
    } catch (error) {
      console.error(error);
      alert(error.message || "Impossible de lancer le duel.");
      renderLaughDuelSetup();
    }
  };

  function multiLaughPlayers(gameState) {
    const player1 = playerById(gameState.player1Id);
    const player2 = playerById(gameState.player2Id);
    const teller = playerById(gameState.currentTurnId);
    const listener = teller?.id === player1?.id ? player2 : player1;

    return { player1, player2, teller, listener };
  }

  function renderMultiLaughLives(gameState) {
    if (gameState.mode !== "lives") return "";

    const { player1, player2 } = multiLaughPlayers(gameState);

    return `
      <div class="lives-row">
        <span>${avatarById(player1?.avatarId).emoji} ${escapeHtml(player1?.name || "Joueur 1")} : ${"❤️".repeat(Number(gameState.lives?.[player1?.id] || 0))}${"🖤".repeat(Math.max(0, 3 - Number(gameState.lives?.[player1?.id] || 0)))}</span>
        <span>${avatarById(player2?.avatarId).emoji} ${escapeHtml(player2?.name || "Joueur 2")} : ${"❤️".repeat(Number(gameState.lives?.[player2?.id] || 0))}${"🖤".repeat(Math.max(0, 3 - Number(gameState.lives?.[player2?.id] || 0)))}</span>
      </div>
    `;
  }

  function syncMultiLaughDuel(room) {
    const gameState = room.game?.state;
    const actions = room.game?.actions || {};

    if (!gameState || gameState.type !== "laugh-duel") return;

    if (gameState.phase !== "final") {
      clearMultiLobbyTimer();
    }

    state.laughDuel = {
      ...(state.laughDuel || {}),
      ...gameState,
      jokePool: gameState.jokes || []
    };

    if (state.isHost) {
      processMultiLaughAction(gameState, actions);
    }

    const actionIds = Object.values(actions).map(action => action?.id).filter(Boolean).sort().join(",");
    const renderKey = [
      "laugh-duel",
      gameState.phase,
      gameState.currentTurnId,
      gameState.turnNumber,
      gameState.punchlineVisible,
      gameState.currentJoke?.id || "",
      JSON.stringify(gameState.lives || {}),
      JSON.stringify(gameState.lastResult || {}),
      actionIds
    ].join("|");

    if (state.multiRenderKey === renderKey) return;
    state.multiRenderKey = renderKey;

    if (gameState.phase === "turn-choice") {
      renderMultiLaughTurnChoice(gameState);
      return;
    }

    if (gameState.phase === "joke") {
      renderMultiLaughJoke(gameState);
      return;
    }

    if (gameState.phase === "transition") {
      renderMultiLaughTransition(gameState);
      return;
    }

    if (gameState.phase === "final") {
      renderMultiLaughFinal(gameState);
    }
  }

  async function processMultiLaughAction(gameState, actions) {
    const actionEntries = Object.entries(actions || {})
      .filter(([, action]) => action?.id)
      .sort((a, b) => Number(a[1].createdAt || 0) - Number(b[1].createdAt || 0));

    if (!actionEntries.length) return;

    const [actorUid, action] = actionEntries[0];
    if (state.multiProcessingActionId === action.id) return;

    const { teller, listener } = multiLaughPlayers(gameState);
    if (!teller || !listener || actorUid !== teller.id) {
      state.multiProcessingActionId = action.id;
      try {
        await AKFirebase.updateGame(state.roomCode, { [`actions/${actorUid}`]: null });
      } finally {
        state.multiProcessingActionId = null;
      }
      return;
    }

    state.multiProcessingActionId = action.id;

    try {
      if (gameState.phase === "turn-choice" && (action.type === "draw-joke" || action.type === "own-joke")) {
        if (action.type === "own-joke") {
          await AKFirebase.updateGame(state.roomCode, {
            "state/phase": "joke",
            "state/jokeSource": "own",
            "state/currentJoke": null,
            "state/punchlineVisible": true,
            "state/updatedAt": AKFirebase.now(),
            actions: null
          });
          return;
        }

        const jokes = gameState.jokes || [];
        let available = jokes.filter(joke => !(gameState.usedJokeIds || []).includes(joke.id));
        let usedJokeIds = [...(gameState.usedJokeIds || [])];

        if (!available.length) {
          available = [...jokes];
          usedJokeIds = [];
        }

        const joke = available[Math.floor(Math.random() * available.length)];

        await AKFirebase.updateGame(state.roomCode, {
          "state/phase": "joke",
          "state/jokeSource": "app",
          "state/currentJoke": joke,
          "state/punchlineVisible": false,
          "state/usedJokeIds": [...usedJokeIds, joke.id],
          "state/updatedAt": AKFirebase.now(),
          actions: null
        });
        return;
      }

      if (gameState.phase === "joke" && action.type === "reveal-punchline") {
        await AKFirebase.updateGame(state.roomCode, {
          "state/punchlineVisible": true,
          "state/updatedAt": AKFirebase.now(),
          actions: null
        });
        return;
      }

      if (gameState.phase === "joke" && action.type === "laugh-result") {
        const resultType = action.payload?.result;
        const lives = { ...(gameState.lives || {}) };
        let laughingId = null;

        if (resultType === "listener") laughingId = listener.id;
        if (resultType === "teller") laughingId = teller.id;

        if (laughingId) {
          lives[laughingId] = Math.max(0, Number(lives[laughingId] || 0) - 1);
        }

        const lastResult = {
          resultType: ["listener", "teller", "none"].includes(resultType) ? resultType : "none",
          tellerId: teller.id,
          listenerId: listener.id,
          laughingId,
          previousTurnId: teller.id,
          nextTurnId: listener.id
        };

        if (laughingId && lives[laughingId] <= 0) {
          const winnerId = laughingId === teller.id ? listener.id : teller.id;

          await AKFirebase.updateGame(state.roomCode, {
            "state/phase": "final",
            "state/lives": lives,
            "state/lastResult": lastResult,
            "state/winnerId": winnerId,
            "state/loserId": laughingId,
            "state/finishedAt": AKFirebase.now(),
            "state/updatedAt": AKFirebase.now(),
            actions: null
          });
          return;
        }

        await AKFirebase.updateGame(state.roomCode, {
          "state/phase": "transition",
          "state/lives": lives,
          "state/currentTurnId": listener.id,
          "state/currentJoke": null,
          "state/jokeSource": null,
          "state/punchlineVisible": false,
          "state/lastResult": lastResult,
          "state/turnNumber": Number(gameState.turnNumber || 1) + 1,
          "state/updatedAt": AKFirebase.now(),
          actions: null
        });
        return;
      }

      await AKFirebase.updateGame(state.roomCode, { [`actions/${actorUid}`]: null });
    } catch (error) {
      console.error("Action du duel impossible :", error);
    } finally {
      state.multiProcessingActionId = null;
    }
  }

  function renderMultiLaughDuelHeader(gameState) {
    const { player1, player2, teller } = multiLaughPlayers(gameState);

    return `
      ${renderMultiLaughLives(gameState)}
      <section class="duel-stage compact-multi-duel">
        <div class="duel-faces">
          <div class="duel-face-card ${teller?.id === player1?.id ? "active" : ""}">
            <span>${avatarById(player1?.avatarId).emoji}</span>
            <strong>${escapeHtml(player1?.name || "Joueur 1")}</strong>
            <small>${teller?.id === player1?.id ? "Fait rire" : "Garde son sérieux"}</small>
          </div>
          <div class="duel-vs big">VS</div>
          <div class="duel-face-card ${teller?.id === player2?.id ? "active" : ""}">
            <span>${avatarById(player2?.avatarId).emoji}</span>
            <strong>${escapeHtml(player2?.name || "Joueur 2")}</strong>
            <small>${teller?.id === player2?.id ? "Fait rire" : "Garde son sérieux"}</small>
          </div>
        </div>
      </section>
    `;
  }

  function renderMultiLaughTurnChoice(gameState) {
    const { teller, listener } = multiLaughPlayers(gameState);
    const isTeller = state.currentUid === teller?.id;
    const isListener = state.currentUid === listener?.id;
    const pendingAction = state.roomData?.game?.actions?.[state.currentUid] || null;

    title.textContent = `Tour ${Number(gameState.turnNumber || 1)}`;
    setBackVisible(false);

    screen.innerHTML = `
      ${renderMultiLaughDuelHeader(gameState)}

      ${isTeller && pendingAction ? `
        ${renderMultiWaiting("Action envoyée", "Le téléphone de l'hôte synchronise le duel…", "📡")}
      ` : isTeller ? `
        <section class="question-stage laugh-turn-stage laugh-phone-stage">
          <div class="giant-avatar">${avatarById(teller.avatarId).emoji}</div>
          <span class="category-chip">À toi de faire rire ${escapeHtml(listener.name)}</span>
          <h2>${escapeHtml(teller.name)}, choisis ton arme.</h2>
          <p>La blague apparaîtra uniquement sur ton écran.</p>
        </section>
        <div class="grid grid-2">
          <button id="multiDrawJoke" class="card action-card">
            <strong>🎲 Donne-moi une blague</strong>
            <span>L’application t’en tire une au hasard.</span>
          </button>
          <button id="multiOwnJoke" class="card action-card">
            <strong>😏 J’en ai une</strong>
            <span>Raconte ta propre blague.</span>
          </button>
        </div>
      ` : isListener ? `
        ${renderMultiWaiting(
          `${teller.name} prépare son attaque`,
          "Regarde ton adversaire et garde ton visage le plus sérieux possible.",
          "😐"
        )}
      ` : `
        ${renderMultiWaiting(
          `${teller.name} va tenter de faire rire ${listener.name}`,
          "Les autres joueurs deviennent le public officiel du duel.",
          "👀"
        )}
      `}
    `;

    document.querySelector("#multiDrawJoke")?.addEventListener("click", async event => {
      event.currentTarget.disabled = true;
      document.querySelector("#multiOwnJoke").disabled = true;

      try {
        await sendMultiAction("draw-joke");
      } catch (error) {
        console.error(error);
        event.currentTarget.disabled = false;
        document.querySelector("#multiOwnJoke").disabled = false;
        alert("Impossible de tirer une blague.");
      }
    });

    document.querySelector("#multiOwnJoke")?.addEventListener("click", async event => {
      event.currentTarget.disabled = true;
      document.querySelector("#multiDrawJoke").disabled = true;

      try {
        await sendMultiAction("own-joke");
      } catch (error) {
        console.error(error);
        event.currentTarget.disabled = false;
        document.querySelector("#multiDrawJoke").disabled = false;
        alert("Impossible de commencer ton tour.");
      }
    });
  }

  function renderMultiLaughOutcomeButtons(teller, listener) {
    return `
      <section class="laugh-outcomes">
        <button class="primary-btn laugh-result-btn" data-multi-laugh-result="listener">😂 ${escapeHtml(listener.name)} a ri</button>
        <button class="danger-btn laugh-result-btn" data-multi-laugh-result="teller">🤦 ${escapeHtml(teller.name)} a ri à sa propre blague</button>
        <button class="secondary-btn laugh-result-btn" data-multi-laugh-result="none">😐 Personne n’a ri</button>
      </section>
    `;
  }

  function renderMultiLaughJoke(gameState) {
    const { teller, listener } = multiLaughPlayers(gameState);
    const isTeller = state.currentUid === teller?.id;
    const isListener = state.currentUid === listener?.id;
    const pendingAction = state.roomData?.game?.actions?.[state.currentUid] || null;
    const joke = gameState.currentJoke;
    const canReport = gameState.jokeSource === "own" || gameState.punchlineVisible;

    title.textContent = "Le duel est lancé";
    setBackVisible(false);

    screen.innerHTML = `
      ${renderMultiLaughDuelHeader(gameState)}

      ${isTeller && pendingAction ? `
        ${renderMultiWaiting("Résultat envoyé", "Le duel se met à jour sur tous les téléphones…", "📡")}
      ` : isTeller ? `
        ${gameState.jokeSource === "app" && joke ? `
          <section class="joke-card private-joke-card">
            <span class="category-chip">${laughCategoryLabels[joke.category] || "😂 Blague"}</span>
            <h2>${escapeHtml(joke.setup)}</h2>
            ${gameState.punchlineVisible ? `
              <div class="punchline">${escapeHtml(joke.punchline)}</div>
            ` : `
              <button id="multiRevealPunchline" class="secondary-btn">Révéler la chute</button>
            `}
          </section>
        ` : `
          <section class="question-stage laugh-turn-stage laugh-phone-stage">
            <div class="giant-avatar">${avatarById(teller.avatarId).emoji}</div>
            <span class="category-chip">Blague personnelle</span>
            <h2>Vas-y ${escapeHtml(teller.name)}.</h2>
            <p>Fais rire ${escapeHtml(listener.name)}, puis indique ce qu’il s’est passé.</p>
          </section>
        `}
        ${canReport ? renderMultiLaughOutcomeButtons(teller, listener) : ""}
      ` : isListener ? `
        ${renderMultiWaiting(
          `${teller.name} essaie de te faire rire`,
          "Ne lis pas son écran. Regarde-le/la droit dans les yeux et tiens bon.",
          "😶"
        )}
      ` : `
        ${renderMultiWaiting(
          `Duel en cours`,
          `${teller.name} tente de faire rire ${listener.name}. Le public surveille tout.`,
          "🍿"
        )}
      `}
    `;

    document.querySelector("#multiRevealPunchline")?.addEventListener("click", async event => {
      event.currentTarget.disabled = true;

      try {
        await sendMultiAction("reveal-punchline");
      } catch (error) {
        console.error(error);
        event.currentTarget.disabled = false;
        alert("Impossible de révéler la chute.");
      }
    });

    document.querySelectorAll("[data-multi-laugh-result]").forEach(button => {
      button.addEventListener("click", async () => {
        document.querySelectorAll("[data-multi-laugh-result]").forEach(item => item.disabled = true);

        try {
          await sendMultiAction("laugh-result", { result: button.dataset.multiLaughResult });
        } catch (error) {
          console.error(error);
          document.querySelectorAll("[data-multi-laugh-result]").forEach(item => item.disabled = false);
          alert("Le résultat n'a pas pu être envoyé.");
        }
      });
    });
  }

  function renderMultiLaughTransition(gameState) {
    const result = gameState.lastResult || {};
    const laughingPlayer = result.laughingId ? playerById(result.laughingId) : null;
    const nextTeller = playerById(gameState.currentTurnId);

    title.textContent = laughingPlayer ? "Un rire de moins" : "Toujours sérieux";
    setBackVisible(false);

    screen.innerHTML = `
      ${renderMultiLaughLives(gameState)}
      <section class="handoff-stage">
        <div class="success-mark">${laughingPlayer ? "😂" : "😐"}</div>
        <h2>${laughingPlayer ? `${escapeHtml(laughingPlayer.name)} a craqué !` : "Personne n’a ri."}</h2>
        <p>C’est maintenant à <strong>${escapeHtml(nextTeller?.name || "l'autre joueur")}</strong> de tenter sa chance.</p>
      </section>

      ${state.alcohol && laughingPlayer ? `<div class="alcohol-callout">🍻 ${escapeHtml(laughingPlayer.name)} prend une petite gorgée pour ce rire.</div>` : ""}

      ${state.isHost ? `
        <button id="nextMultiLaughTurn" class="primary-btn full">Tour suivant</button>
      ` : renderMultiWaiting("En attente de l'hôte", "Le prochain tour apparaîtra automatiquement.", "👑")}
    `;

    document.querySelector("#nextMultiLaughTurn")?.addEventListener("click", async event => {
      event.currentTarget.disabled = true;

      try {
        await AKFirebase.updateGame(state.roomCode, {
          "state/phase": "turn-choice",
          "state/lastResult": null,
          "state/updatedAt": AKFirebase.now(),
          actions: null
        });
      } catch (error) {
        console.error(error);
        event.currentTarget.disabled = false;
        alert("Impossible de lancer le tour suivant.");
      }
    });
  }

  function renderMultiLaughFinal(gameState) {
    const winner = playerById(gameState.winnerId);
    const loser = playerById(gameState.loserId);

    title.textContent = "Fin du duel";
    setBackVisible(false);

    screen.innerHTML = `
      <section class="winner-stage">
        <div class="winner-crown">👑</div>
        <div class="giant-avatar">${avatarById(winner?.avatarId).emoji}</div>
        <h2>${escapeHtml(winner?.name || "Le gagnant")} remporte le duel !</h2>
        <p>${escapeHtml(loser?.name || "L'autre joueur")} a été la première personne à craquer.</p>
      </section>

      ${state.alcohol && loser ? `<div class="alcohol-callout">🍻 ${escapeHtml(loser.name)} prend une gorgée de défaite.</div>` : ""}

      ${renderPostGameContinuation(gameState)}
    `;

    ensureEveningResult(gameState);
    bindPostGameContinuation(gameState);
  }


  /* =========================================================
     AK'GAMES V0.7 — PACK AMBIANCE MULTIJOUEUR
     ========================================================= */

  function buildAmbianceSessionSummary(gameState) {
    const rawScores = gameState.scores || {};
    const values = [...new Set(
      state.players.map(player => Number(rawScores[player.id] || 0)).filter(value => value > 0)
    )].sort((a, b) => b - a);
    const points = {};
    [3, 2, 1].forEach((amount, index) => {
      const score = values[index];
      if (!score) return;
      addEveningPoints(points, state.players.filter(player => Number(rawScores[player.id] || 0) === score).map(player => player.id), amount);
    });
    const top = values[0] || 0;
    const winnerIds = top > 0 ? state.players.filter(player => Number(rawScores[player.id] || 0) === top).map(player => player.id) : [];
    const names = winnerIds.map(id => playerById(id)?.name).filter(Boolean);
    return {
      points,
      winnerIds,
      detail: names.length ? `${names.join(" et ")} ${names.length > 1 ? "terminent en tête" : "termine en tête"}` : "Partie ambiance terminée"
    };
  }

  renderActionTruthSetup = function () {
    if (!isMultiplayer()) return localRenderActionTruthSetup();
    if (!state.actionTruth) resetActionTruthState(false);
    const game = state.actionTruth;
    title.textContent = "Action ou Vérité";
    setBackVisible(true);
    screen.innerHTML = `
      <section class="game-cover game-cover-action"><span class="game-cover-icon">🎭</span><div><small>MULTIJOUEUR SYNCHRONISÉ</small><h2>Action ou Vérité</h2><p>Chaque défi apparaît sur tous les écrans. La personne désignée décide si elle relève le défi.</p></div></section>
      <section class="card setup-card-v07">
        <div class="form-group"><label for="multiActionRounds">Nombre de tours</label><select id="multiActionRounds" class="text-input">${[8,12,16,20].map(value => `<option value="${value}" ${game.roundCount === value ? "selected" : ""}>${value} tours</option>`).join("")}</select></div>
        <div class="form-group top-gap"><label for="multiActionMode">Contenu</label><select id="multiActionMode" class="text-input"><option value="mix" ${game.mode === "mix" ? "selected" : ""}>Actions + Vérités</option><option value="action" ${game.mode === "action" ? "selected" : ""}>Actions uniquement</option><option value="truth" ${game.mode === "truth" ? "selected" : ""}>Vérités uniquement</option></select></div>
      </section>
      ${state.adult ? `<label class="option-card premium-toggle"><input id="multiActionAdult" type="checkbox" ${game.includeAdult ? "checked" : ""} ${game.forceAdult ? "disabled" : ""}><span><strong>🌶️ Ajouter les cartes adultes</strong><br><span class="helper">Plus osé, toujours jouable en groupe.</span></span></label>` : ""}
      ${state.isHost ? `<button id="startMultiAction" class="primary-btn full">Lancer sur tous les téléphones</button>` : renderMultiWaiting("En attente de l’hôte", "L’hôte règle la partie puis la lancera.", "👑")}
    `;
    document.querySelector("#multiActionRounds")?.addEventListener("change", event => game.roundCount = Number(event.target.value));
    document.querySelector("#multiActionMode")?.addEventListener("change", event => game.mode = event.target.value);
    document.querySelector("#multiActionAdult")?.addEventListener("change", event => game.includeAdult = event.target.checked);
    document.querySelector("#startMultiAction")?.addEventListener("click", startActionTruthGame);
  };

  startActionTruthGame = async function () {
    if (!isMultiplayer()) return localStartActionTruthGame();
    if (!state.isHost) return;
    const game = state.actionTruth;
    screen.innerHTML = `<div class="notice">Synchronisation des cartes…</div>`;
    try {
      let pool = await loadJsonFile("data/action-verite.json", "Impossible de charger les cartes.");
      if (state.adult && game.includeAdult) pool = pool.concat(await loadJsonFile("data/action-verite-adulte.json", "Impossible de charger les cartes adultes."));
      if (game.mode !== "mix") pool = pool.filter(item => item.type === game.mode);
      const prompts = shuffleArray(pool).slice(0, Math.min(game.roundCount, pool.length));
      const scores = Object.fromEntries(state.players.map(player => [player.id, 0]));
      await AKFirebase.setGame(state.roomCode, { state: {
        type: "action-truth", phase: "prompt", sessionGameId: createSessionGameId("action-truth"), prompts,
        currentIndex: 0, currentPlayerId: state.players[0]?.id, scores, results: {},
        settings: { roundCount: prompts.length, mode: game.mode, includeAdult: Boolean(game.includeAdult) },
        startedAt: AKFirebase.now(), updatedAt: AKFirebase.now()
      }});
      state.multiView = "ambiance-game";
    } catch (error) {
      console.error(error); alert(error.message || "Impossible de lancer la partie."); renderActionTruthSetup();
    }
  };

  renderAmbiancePollSetup = function () {
    if (!isMultiplayer()) return localRenderAmbiancePollSetup();
    const game = state.ambiancePoll;
    const meta = pollGameMeta(game.type);
    title.textContent = meta.title;
    setBackVisible(true);
    screen.innerHTML = `
      <section class="game-cover ${game.type === "never" ? "game-cover-never" : "game-cover-would"}"><span class="game-cover-icon">${meta.icon}</span><div><small>MULTIJOUEUR SYNCHRONISÉ</small><h2>${meta.title}</h2><p>Tout le monde vote en même temps sur son téléphone, puis les réponses sont révélées.</p></div></section>
      <section class="card setup-card-v07"><div class="form-group"><label for="multiPollRounds">Nombre de questions</label><select id="multiPollRounds" class="text-input">${[8,10,15,20].map(value => `<option value="${value}" ${game.roundCount === value ? "selected" : ""}>${value} questions</option>`).join("")}</select></div></section>
      ${state.adult ? `<label class="option-card premium-toggle"><input id="multiPollAdult" type="checkbox" ${game.includeAdult ? "checked" : ""} ${game.forceAdult ? "disabled" : ""}><span><strong>🌶️ Ajouter les cartes adultes</strong><br><span class="helper">Des choix et révélations plus épicés.</span></span></label>` : ""}
      ${state.isHost ? `<button id="startMultiPoll" class="primary-btn full">Lancer sur tous les téléphones</button>` : renderMultiWaiting("En attente de l’hôte", "La partie commencera automatiquement.", "👑")}
    `;
    document.querySelector("#multiPollRounds")?.addEventListener("change", event => game.roundCount = Number(event.target.value));
    document.querySelector("#multiPollAdult")?.addEventListener("change", event => game.includeAdult = event.target.checked);
    document.querySelector("#startMultiPoll")?.addEventListener("click", startAmbiancePollGame);
  };

  startAmbiancePollGame = async function () {
    if (!isMultiplayer()) return localStartAmbiancePollGame();
    if (!state.isHost) return;
    const game = state.ambiancePoll;
    const meta = pollGameMeta(game.type);
    screen.innerHTML = `<div class="notice">Synchronisation des questions…</div>`;
    try {
      let pool = await loadJsonFile(meta.classic, "Impossible de charger les questions.");
      if (state.adult && game.includeAdult) pool = pool.concat(await loadJsonFile(meta.adult, "Impossible de charger les questions adultes."));
      const items = shuffleArray(pool).slice(0, Math.min(game.roundCount, pool.length));
      const scores = Object.fromEntries(state.players.map(player => [player.id, 0]));
      const type = game.type === "never" ? "never-have-i-ever" : "would-you-rather";
      await AKFirebase.setGame(state.roomCode, { state: {
        type, phase: "voting", sessionGameId: createSessionGameId(type), items, currentIndex: 0,
        scores, rounds: {}, currentResult: null,
        settings: { roundCount: items.length, includeAdult: Boolean(game.includeAdult) },
        startedAt: AKFirebase.now(), updatedAt: AKFirebase.now()
      }, votes: {} });
      state.multiView = "ambiance-game";
    } catch (error) {
      console.error(error); alert(error.message || "Impossible de lancer la partie."); renderAmbiancePollSetup();
    }
  };

  function syncMultiAmbianceGame(room) {
    const gameState = room.game?.state;
    if (!gameState) return;
    if (gameState.phase !== "final") clearMultiLobbyTimer();

    if (gameState.type === "action-truth") {
      processMultiActionTruth(room);
      const action = room.game?.actions?.[gameState.currentPlayerId] || null;
      const renderKey = [gameState.type, gameState.phase, gameState.currentIndex, gameState.currentPlayerId, action?.id || "", JSON.stringify(gameState.scores || {})].join("|");
      if (state.multiRenderKey === renderKey) return;
      state.multiRenderKey = renderKey;
      if (gameState.phase === "final") renderMultiAmbianceFinal(gameState);
      else renderMultiActionTruthRound(gameState, action);
      return;
    }

    const votes = room.game?.votes || {};
    processMultiPollVotes(gameState, votes);
    const renderKey = [gameState.type, gameState.phase, gameState.currentIndex, Object.keys(votes).length, votes[state.currentUid] || "", JSON.stringify(gameState.currentResult || {}), JSON.stringify(gameState.scores || {})].join("|");
    if (state.multiRenderKey === renderKey) return;
    state.multiRenderKey = renderKey;
    if (gameState.phase === "final") renderMultiAmbianceFinal(gameState);
    else if (gameState.phase === "results") renderMultiPollResults(gameState);
    else renderMultiPollVote(gameState, votes);
  }

  function processMultiActionTruth(room) {
    if (!state.isHost) return;
    const gameState = room.game?.state;
    const action = room.game?.actions?.[gameState.currentPlayerId];
    if (!action?.id || state.multiProcessingActionId === action.id) return;
    state.multiProcessingActionId = action.id;
    const completed = action.type === "ambiance-completed";
    const scores = { ...(gameState.scores || {}) };
    if (completed) scores[gameState.currentPlayerId] = Number(scores[gameState.currentPlayerId] || 0) + 1;
    const nextIndex = Number(gameState.currentIndex || 0) + 1;
    const finished = nextIndex >= (gameState.prompts || []).length;
    const nextPlayer = state.players[nextIndex % state.players.length];
    AKFirebase.updateGame(state.roomCode, {
      "state/phase": finished ? "final" : "prompt",
      "state/currentIndex": finished ? gameState.currentIndex : nextIndex,
      "state/currentPlayerId": finished ? gameState.currentPlayerId : nextPlayer?.id,
      "state/scores": scores,
      [`state/results/${gameState.currentIndex}`]: { playerId: gameState.currentPlayerId, completed, promptId: gameState.prompts?.[gameState.currentIndex]?.id || "" },
      "state/finishedAt": finished ? AKFirebase.now() : null,
      "state/updatedAt": AKFirebase.now(), actions: null
    }).catch(console.error).finally(() => { state.multiProcessingActionId = null; });
  }

  function renderMultiActionTruthRound(gameState, pendingAction) {
    const player = playerById(gameState.currentPlayerId);
    const prompt = gameState.prompts?.[gameState.currentIndex];
    const isCurrent = state.currentUid === gameState.currentPlayerId;
    const isAction = prompt?.type === "action";
    title.textContent = isAction ? "Action" : "Vérité";
    setBackVisible(false);
    screen.innerHTML = `
      ${renderMultiProgress(Number(gameState.currentIndex || 0) + 1, gameState.prompts?.length || 1, "Tour")}
      <section class="prompt-stage ${isAction ? "prompt-action" : "prompt-truth"}"><div class="prompt-player"><span>${avatarById(player?.avatarId).emoji}</span><div><small>C’EST AU TOUR DE</small><strong>${escapeHtml(player?.name || "Joueur")}</strong></div></div><span class="prompt-type-chip">${isAction ? "⚡ ACTION" : "◉ VÉRITÉ"}</span><h2>${escapeHtml(prompt?.text || "Prépare-toi…")}</h2></section>
      ${isCurrent ? (pendingAction ? renderMultiWaiting("Réponse envoyée", "Le prochain tour se prépare…", "📡") : `<section class="decision-grid"><button class="primary-btn" data-ambiance-action="ambiance-completed">✓ C’est fait</button><button class="secondary-btn" data-ambiance-action="ambiance-skipped">Passer</button></section>`) : renderMultiWaiting(`C’est à ${player?.name || "la personne désignée"}`, "Regarde son courage en direct. La partie avancera automatiquement.", "👀")}
      ${state.alcohol ? `<div class="alcohol-callout">🍻 Une carte passée = une petite gorgée.</div>` : ""}
    `;
    document.querySelectorAll("[data-ambiance-action]").forEach(button => button.addEventListener("click", async () => {
      document.querySelectorAll("[data-ambiance-action]").forEach(item => item.disabled = true);
      try { await sendMultiAction(button.dataset.ambianceAction); } catch (error) { console.error(error); alert("Impossible d’envoyer la réponse."); }
    }));
  }

  function processMultiPollVotes(gameState, votes) {
    if (!state.isHost || gameState.phase !== "voting" || Object.keys(votes).length < state.players.length) return;
    const processingId = `${gameState.type}_${gameState.currentIndex}_${Object.keys(votes).length}`;
    if (state.multiProcessingActionId === processingId) return;
    state.multiProcessingActionId = processingId;
    const item = gameState.items?.[gameState.currentIndex];
    const labels = gameState.type === "never-have-i-ever" ? ["never", "done"] : ["A", "B"];
    const values = Object.values(votes);
    const counts = Object.fromEntries(labels.map(label => [label, values.filter(value => value === label).length]));
    const minority = counts[labels[0]] === counts[labels[1]] ? null : (counts[labels[0]] < counts[labels[1]] ? labels[0] : labels[1]);
    const minorityIds = minority ? Object.entries(votes).filter(([, value]) => value === minority).map(([id]) => id) : [];
    const scores = { ...(gameState.scores || {}) };
    minorityIds.forEach(id => scores[id] = Number(scores[id] || 0) + 1);
    AKFirebase.updateGame(state.roomCode, {
      "state/phase": "results", "state/currentResult": { votes, counts, minority, minorityIds, itemId: item?.id || "" },
      "state/scores": scores, [`state/rounds/${gameState.currentIndex}`]: { votes, counts, minorityIds }, "state/updatedAt": AKFirebase.now()
    }).catch(console.error).finally(() => { state.multiProcessingActionId = null; });
  }

  function renderMultiPollVote(gameState, votes) {
    const item = gameState.items?.[gameState.currentIndex];
    const isNever = gameState.type === "never-have-i-ever";
    const ownVote = votes[state.currentUid];
    title.textContent = isNever ? "Je n’ai jamais" : "Tu préfères";
    setBackVisible(false);
    screen.innerHTML = `
      ${renderMultiProgress(Number(gameState.currentIndex || 0) + 1, gameState.items?.length || 1, "Question")}
      ${ownVote ? renderMultiWaiting("Vote enregistré", `${Object.keys(votes).length}/${state.players.length} réponses reçues.`, "🔒") : isNever ? `<section class="poll-question-stage poll-never-stage"><span class="prompt-type-chip">🙋 JE N’AI JAMAIS</span><h2>${escapeHtml((item?.text || "").replace(/^Je n[’']ai jamais\s*/i, ""))}</h2><p>Ta réponse reste secrète jusqu’au résultat.</p></section><section class="poll-choice-grid"><button class="poll-choice poll-choice-a" data-multi-poll="never"><strong>Jamais</strong><span>Innocence totale.</span></button><button class="poll-choice poll-choice-b" data-multi-poll="done"><strong>Déjà</strong><span>J’assume presque.</span></button></section>` : `<section class="poll-question-stage poll-would-stage"><span class="prompt-type-chip">⚖️ TU PRÉFÈRES</span><h2>Choisis ton camp</h2><p>Impossible de répondre “ça dépend”.</p></section><section class="poll-choice-grid"><button class="poll-choice poll-choice-a" data-multi-poll="A"><small>OPTION A</small><strong>${escapeHtml(item?.optionA || "")}</strong></button><button class="poll-choice poll-choice-b" data-multi-poll="B"><small>OPTION B</small><strong>${escapeHtml(item?.optionB || "")}</strong></button></section>`}
      ${renderPlayerSubmissionStatus(votes, "A voté", "Réfléchit…")}
    `;
    document.querySelectorAll("[data-multi-poll]").forEach(button => button.addEventListener("click", async () => {
      document.querySelectorAll("[data-multi-poll]").forEach(itemButton => itemButton.disabled = true);
      try { await AKFirebase.writeOwnGameEntry(state.roomCode, "votes", button.dataset.multiPoll); } catch (error) { console.error(error); alert("Le vote n’a pas pu être envoyé."); }
    }));
  }

  function renderMultiPollResults(gameState) {
    const item = gameState.items?.[gameState.currentIndex];
    const result = gameState.currentResult || {};
    const isNever = gameState.type === "never-have-i-ever";
    const optionLabel = value => isNever ? (value === "never" ? "Jamais" : "Déjà") : (value === "A" ? item?.optionA : item?.optionB);
    title.textContent = "Le groupe a parlé";
    setBackVisible(false);
    screen.innerHTML = `
      <section class="reveal-stage reveal-v07"><span class="game-cover-icon">${isNever ? "🙋" : "⚖️"}</span><h2>${isNever ? escapeHtml(item?.text || "") : "Le verdict est tombé"}</h2>${!isNever ? `<div class="reveal-dilemma"><span>${escapeHtml(item?.optionA || "")}</span><b>VS</b><span>${escapeHtml(item?.optionB || "")}</span></div>` : ""}</section>
      <section class="poll-results-grid">${state.players.map(player => `<article class="poll-result-person"><span>${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong><small>${escapeHtml(optionLabel(result.votes?.[player.id]))}</small>${result.minorityIds?.includes(player.id) ? `<em>+1 pt minorité</em>` : ""}</article>`).join("")}</section>
      ${state.alcohol && isNever ? `<div class="alcohol-callout">🍻 Les personnes qui ont répondu “Déjà” prennent une petite gorgée.</div>` : ""}
      ${state.isHost ? `<button id="nextMultiPoll" class="primary-btn full">${Number(gameState.currentIndex || 0) + 1 >= (gameState.items || []).length ? "Voir le classement" : "Question suivante"}</button>` : renderMultiWaiting("En attente de l’hôte", "La suite apparaîtra automatiquement.", "👑")}
    `;
    document.querySelector("#nextMultiPoll")?.addEventListener("click", async event => {
      event.currentTarget.disabled = true;
      const next = Number(gameState.currentIndex || 0) + 1;
      const finished = next >= (gameState.items || []).length;
      try { await AKFirebase.updateGame(state.roomCode, { "state/phase": finished ? "final" : "voting", "state/currentIndex": finished ? gameState.currentIndex : next, "state/currentResult": null, "state/finishedAt": finished ? AKFirebase.now() : null, "state/updatedAt": AKFirebase.now(), votes: null }); }
      catch (error) { console.error(error); event.currentTarget.disabled = false; alert("Impossible de passer à la suite."); }
    });
  }

  function renderMultiAmbianceFinal(gameState) {
    const ranking = [...state.players].sort((a, b) => Number(gameState.scores?.[b.id] || 0) - Number(gameState.scores?.[a.id] || 0));
    const presentation = gamePresentation(gameState.type);
    title.textContent = "Classement final";
    setBackVisible(false);
    screen.innerHTML = `
      <section class="winner-stage winner-stage-v07"><div class="winner-crown">${presentation.icon}🏆</div><h2>La manche est terminée</h2><p>Le score rejoint maintenant le classement général de la soirée.</p></section>
      <section class="final-ranking">${ranking.map((player, index) => `<div class="ranking-row"><span class="ranking-position">${index + 1}</span><span class="result-avatar">${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong><span>${Number(gameState.scores?.[player.id] || 0)} pts</span></div>`).join("")}</section>
      ${renderPostGameContinuation(gameState)}
    `;
    ensureEveningResult(gameState);
    bindPostGameContinuation(gameState);
  }


  /* =========================================================
     AK'GAMES V0.8 — CONNEXION & SECRETS MULTIJOUEUR
     ========================================================= */

  renderSameBrainSetup = function () {
    if (!isMultiplayer()) return localRenderSameBrainSetup();
    if (!state.sameBrain) resetSameBrainState();
    const game = state.sameBrain;
    title.textContent = "Même cerveau";
    setBackVisible(true);
    screen.innerHTML = `
      <section class="game-cover game-cover-brain"><span class="game-cover-icon">🧠</span><div><small>MULTIJOUEUR SYNCHRONISÉ</small><h2>Même cerveau</h2><p>Tout le monde répond en même temps. Les réponses identiques connectent les cerveaux.</p></div></section>
      <section class="card setup-card-v07"><div class="form-group"><label for="multiBrainRounds">Nombre de questions</label><select id="multiBrainRounds" class="text-input">${[6,8,10,15].map(value => `<option value="${value}" ${game.roundCount === value ? "selected" : ""}>${value} questions</option>`).join("")}</select></div></section>
      ${state.adult ? `<label class="option-card premium-toggle"><input id="multiBrainAdult" type="checkbox" ${game.includeAdult ? "checked" : ""}><span><strong>🌶️ Ajouter les cartes adultes</strong><br><span class="helper">Crushs, rendez-vous et petits dossiers.</span></span></label>` : ""}
      <div class="notice">Un mot ou une courte expression. Plus la réponse est spontanée, plus le match est savoureux.</div>
      ${state.isHost ? `<button id="startMultiBrain" class="primary-btn full">Connecter tous les cerveaux</button>` : renderMultiWaiting("En attente de l’hôte", "La partie commencera sur tous les écrans.", "👑")}
    `;
    document.querySelector("#multiBrainRounds")?.addEventListener("change", event => game.roundCount = Number(event.target.value));
    document.querySelector("#multiBrainAdult")?.addEventListener("change", event => game.includeAdult = event.target.checked);
    document.querySelector("#startMultiBrain")?.addEventListener("click", startSameBrainGame);
  };

  startSameBrainGame = async function () {
    if (!isMultiplayer()) return localStartSameBrainGame();
    if (!state.isHost) return;
    const game = state.sameBrain;
    screen.innerHTML = `<div class="notice">Connexion des neurones…</div>`;
    try {
      let pool = await loadJsonFile("data/meme-cerveau.json", "Impossible de charger les questions de Même cerveau.");
      if (state.adult && game.includeAdult) pool = pool.concat(await loadJsonFile("data/meme-cerveau-adulte.json", "Impossible de charger les questions adultes."));
      const items = shuffleArray(pool).slice(0, Math.min(game.roundCount, pool.length));
      const scores = Object.fromEntries(state.players.map(player => [player.id, 0]));
      await AKFirebase.setGame(state.roomCode, {
        state: {
          type: "same-brain", phase: "answering", sessionGameId: createSessionGameId("same-brain"),
          items, currentIndex: 0, scores, rounds: {}, currentResult: null,
          settings: { roundCount: items.length, includeAdult: Boolean(game.includeAdult) },
          startedAt: AKFirebase.now(), updatedAt: AKFirebase.now()
        },
        answers: {}
      });
      state.multiView = "v08-game";
    } catch (error) {
      console.error(error);
      alert(error.message || "Impossible de lancer la partie.");
      renderSameBrainSetup();
    }
  };

  renderMinoritySetup = function () {
    if (!isMultiplayer()) return localRenderMinoritySetup();
    if (!state.minorityGame) resetMinorityState();
    const game = state.minorityGame;
    title.textContent = "Minorité";
    setBackVisible(true);
    screen.innerHTML = `
      <section class="game-cover game-cover-minority"><span class="game-cover-icon">🪩</span><div><small>MULTIJOUEUR SYNCHRONISÉ</small><h2>Minorité</h2><p>Trois choix secrets. Le ou les camps les moins populaires prennent le point.</p></div></section>
      <section class="card setup-card-v07"><div class="form-group"><label for="multiMinorityRounds">Nombre de questions</label><select id="multiMinorityRounds" class="text-input">${[6,8,10,15].map(value => `<option value="${value}" ${game.roundCount === value ? "selected" : ""}>${value} questions</option>`).join("")}</select></div></section>
      ${state.adult ? `<label class="option-card premium-toggle"><input id="multiMinorityAdult" type="checkbox" ${game.includeAdult ? "checked" : ""}><span><strong>🌶️ Ajouter les cartes adultes</strong><br><span class="helper">Relations, flirt et préférences plus personnelles.</span></span></label>` : ""}
      ${state.isHost ? `<button id="startMultiMinority" class="primary-btn full">Lancer le vote secret</button>` : renderMultiWaiting("En attente de l’hôte", "La partie commencera automatiquement.", "👑")}
    `;
    document.querySelector("#multiMinorityRounds")?.addEventListener("change", event => game.roundCount = Number(event.target.value));
    document.querySelector("#multiMinorityAdult")?.addEventListener("change", event => game.includeAdult = event.target.checked);
    document.querySelector("#startMultiMinority")?.addEventListener("click", startMinorityGame);
  };

  startMinorityGame = async function () {
    if (!isMultiplayer()) return localStartMinorityGame();
    if (!state.isHost) return;
    const game = state.minorityGame;
    screen.innerHTML = `<div class="notice">Ouverture du scrutin…</div>`;
    try {
      let pool = await loadJsonFile("data/minorite.json", "Impossible de charger les questions de Minorité.");
      if (state.adult && game.includeAdult) pool = pool.concat(await loadJsonFile("data/minorite-adulte.json", "Impossible de charger les questions adultes."));
      const items = shuffleArray(pool).slice(0, Math.min(game.roundCount, pool.length));
      const scores = Object.fromEntries(state.players.map(player => [player.id, 0]));
      await AKFirebase.setGame(state.roomCode, {
        state: {
          type: "minority", phase: "voting", sessionGameId: createSessionGameId("minority"),
          items, currentIndex: 0, scores, rounds: {}, currentResult: null,
          settings: { roundCount: items.length, includeAdult: Boolean(game.includeAdult) },
          startedAt: AKFirebase.now(), updatedAt: AKFirebase.now()
        },
        votes: {}
      });
      state.multiView = "v08-game";
    } catch (error) {
      console.error(error);
      alert(error.message || "Impossible de lancer la partie.");
      renderMinoritySetup();
    }
  };

  renderWhoAnsweredSetup = function () {
    if (!isMultiplayer()) return localRenderWhoAnsweredSetup();
    if (!state.whoAnswered) resetWhoAnsweredState();
    const game = state.whoAnswered;
    title.textContent = "Qui a répondu ça ?";
    setBackVisible(true);
    const minimum = Math.max(6, state.players.length);
    const choices = [minimum, 8, 10, 15].filter((value, index, array) => array.indexOf(value) === index);
    screen.innerHTML = `
      <section class="game-cover game-cover-who"><span class="game-cover-icon">🕵️</span><div><small>MULTIJOUEUR SYNCHRONISÉ</small><h2>Qui a répondu ça ?</h2><p>Tout le monde écrit sur son téléphone. Une réponse devient mystérieuse et le groupe enquête.</p></div></section>
      <section class="card setup-card-v07"><div class="form-group"><label for="multiWhoRounds">Nombre de manches</label><select id="multiWhoRounds" class="text-input">${choices.map(value => `<option value="${value}" ${game.roundCount === value ? "selected" : ""}>${value} manches</option>`).join("")}</select></div></section>
      ${state.adult ? `<label class="option-card premium-toggle"><input id="multiWhoAdult" type="checkbox" ${game.includeAdult ? "checked" : ""}><span><strong>🌶️ Ajouter les cartes adultes</strong><br><span class="helper">Crushs, relations et réponses plus révélatrices.</span></span></label>` : ""}
      <div class="notice">Les bons détectives gagnent 1 point. L’auteur gagne 1 point par personne trompée.</div>
      ${state.isHost ? `<button id="startMultiWho" class="primary-btn full">Ouvrir l’enquête</button>` : renderMultiWaiting("En attente de l’hôte", "Les carnets secrets vont bientôt s’ouvrir.", "👑")}
    `;
    document.querySelector("#multiWhoRounds")?.addEventListener("change", event => game.roundCount = Number(event.target.value));
    document.querySelector("#multiWhoAdult")?.addEventListener("change", event => game.includeAdult = event.target.checked);
    document.querySelector("#startMultiWho")?.addEventListener("click", startWhoAnsweredGame);
  };

  startWhoAnsweredGame = async function () {
    if (!isMultiplayer()) return localStartWhoAnsweredGame();
    if (!state.isHost) return;
    if (state.players.length < 3) {
      alert("« Qui a répondu ça ? » nécessite au moins 3 joueurs.");
      return;
    }
    const game = state.whoAnswered;
    screen.innerHTML = `<div class="notice">Distribution des carnets secrets…</div>`;
    try {
      let pool = await loadJsonFile("data/qui-a-repondu.json", "Impossible de charger les questions.");
      if (state.adult && game.includeAdult) pool = pool.concat(await loadJsonFile("data/qui-a-repondu-adulte.json", "Impossible de charger les questions adultes."));
      const items = shuffleArray(pool).slice(0, Math.min(game.roundCount, pool.length));
      const scores = Object.fromEntries(state.players.map(player => [player.id, 0]));
      const authorOrder = shuffleArray(state.players.map(player => player.id));
      await AKFirebase.setGame(state.roomCode, {
        state: {
          type: "who-answered", phase: "answering", sessionGameId: createSessionGameId("who-answered"),
          items, currentIndex: 0, authorOrder, scores, rounds: {}, currentResult: null,
          settings: { roundCount: items.length, includeAdult: Boolean(game.includeAdult) },
          startedAt: AKFirebase.now(), updatedAt: AKFirebase.now()
        },
        answers: {}, votes: {}
      });
      state.multiView = "v08-game";
    } catch (error) {
      console.error(error);
      alert(error.message || "Impossible de lancer la partie.");
      renderWhoAnsweredSetup();
    }
  };

  function syncMultiV08Game(room) {
    const gameState = room.game?.state;
    if (!gameState) return;
    if (gameState.phase !== "final") clearMultiLobbyTimer();

    if (gameState.type === "same-brain") {
      const answers = room.game?.answers || {};
      processMultiSameBrain(gameState, answers);
      const renderKey = [gameState.type, gameState.phase, gameState.currentIndex, Object.keys(answers).length, answers[state.currentUid]?.text || "", JSON.stringify(gameState.currentResult || {}), JSON.stringify(gameState.scores || {})].join("|");
      if (state.multiRenderKey === renderKey) return;
      state.multiRenderKey = renderKey;
      if (gameState.phase === "final") renderMultiV08Final(gameState);
      else if (gameState.phase === "results") renderMultiSameBrainResults(gameState);
      else renderMultiSameBrainAnswer(gameState, answers);
      return;
    }

    if (gameState.type === "minority") {
      const votes = room.game?.votes || {};
      processMultiMinority(gameState, votes);
      const renderKey = [gameState.type, gameState.phase, gameState.currentIndex, Object.keys(votes).length, votes[state.currentUid], JSON.stringify(gameState.currentResult || {}), JSON.stringify(gameState.scores || {})].join("|");
      if (state.multiRenderKey === renderKey) return;
      state.multiRenderKey = renderKey;
      if (gameState.phase === "final") renderMultiV08Final(gameState);
      else if (gameState.phase === "results") renderMultiMinorityResults(gameState);
      else renderMultiMinorityVote(gameState, votes);
      return;
    }

    if (gameState.type === "who-answered") {
      const answers = room.game?.answers || {};
      const votes = room.game?.votes || {};
      processMultiWhoAnswered(gameState, answers, votes);
      const renderKey = [gameState.type, gameState.phase, gameState.currentIndex, Object.keys(answers).length, Object.keys(votes).length, answers[state.currentUid]?.text || "", votes[state.currentUid] || "", gameState.mysteryAuthorId || "", JSON.stringify(gameState.currentResult || {}), JSON.stringify(gameState.scores || {})].join("|");
      if (state.multiRenderKey === renderKey) return;
      state.multiRenderKey = renderKey;
      if (gameState.phase === "final") renderMultiV08Final(gameState);
      else if (gameState.phase === "results") renderMultiWhoAnsweredResults(gameState);
      else if (gameState.phase === "voting") renderMultiWhoAnsweredVote(gameState, votes);
      else renderMultiWhoAnsweredAnswer(gameState, answers);
    }
  }

  function processMultiSameBrain(gameState, answers) {
    if (!state.isHost || gameState.phase !== "answering" || Object.keys(answers).length < state.players.length) return;
    const processingId = `same-brain_${gameState.currentIndex}_${Object.keys(answers).length}`;
    if (state.multiProcessingActionId === processingId) return;
    state.multiProcessingActionId = processingId;
    const groups = {};
    Object.entries(answers).forEach(([id, entry]) => {
      const key = normalizeBrainAnswer(entry?.text || "") || `unique_${id}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(id);
    });
    const points = {};
    const scores = { ...(gameState.scores || {}) };
    Object.values(groups).forEach(ids => {
      const amount = ids.length >= 2 ? Math.min(3, ids.length - 1) : 0;
      ids.forEach(id => {
        points[id] = amount;
        scores[id] = Number(scores[id] || 0) + amount;
      });
    });
    AKFirebase.updateGame(state.roomCode, {
      "state/phase": "results",
      "state/currentResult": { answers, points, itemId: gameState.items?.[gameState.currentIndex]?.id || "" },
      "state/scores": scores,
      [`state/rounds/${gameState.currentIndex}`]: { answers, points },
      "state/updatedAt": AKFirebase.now()
    }).catch(console.error).finally(() => { state.multiProcessingActionId = null; });
  }

  function renderMultiSameBrainAnswer(gameState, answers) {
    const item = gameState.items?.[gameState.currentIndex];
    const own = answers[state.currentUid];
    title.textContent = "Même cerveau";
    setBackVisible(false);
    screen.innerHTML = `
      ${renderMultiProgress(Number(gameState.currentIndex || 0) + 1, gameState.items?.length || 1, "Question")}
      ${own ? renderMultiWaiting("Réponse verrouillée", `${Object.keys(answers).length}/${state.players.length} cerveaux connectés.`, "🔒") : `
        <section class="v08-question-card brain-question-card"><span>🧠</span><small>RÉPONDS DU PREMIER COUP</small><h2>${escapeHtml(item?.prompt || "")}</h2></section>
        <section class="card"><div class="form-group"><label for="multiBrainAnswer">Ta réponse</label><input id="multiBrainAnswer" class="text-input v08-answer-input" maxlength="45" autocomplete="off" placeholder="Un mot ou une courte expression"></div></section>
        <button id="sendMultiBrain" class="primary-btn full">Verrouiller ma réponse</button>
      `}
      ${renderPlayerSubmissionStatus(answers, "A répondu", "Réfléchit…")}
    `;
    document.querySelector("#sendMultiBrain")?.addEventListener("click", async event => {
      const input = document.querySelector("#multiBrainAnswer");
      const text = input?.value.trim();
      if (!text) return alert("Écris une réponse avant de continuer.");
      event.currentTarget.disabled = true;
      try { await AKFirebase.writeOwnGameEntry(state.roomCode, "answers", { text, submittedAt: AKFirebase.now() }); }
      catch (error) { console.error(error); event.currentTarget.disabled = false; alert("La réponse n’a pas pu être envoyée."); }
    });
  }

  function renderMultiSameBrainResults(gameState) {
    const item = gameState.items?.[gameState.currentIndex];
    const result = gameState.currentResult || {};
    const matched = Object.values(result.points || {}).some(value => Number(value) > 0);
    title.textContent = matched ? "Connexion détectée" : "Cerveaux indépendants";
    setBackVisible(false);
    screen.innerHTML = `
      <section class="reveal-stage reveal-v07 brain-reveal"><span class="game-cover-icon">${matched ? "⚡" : "🧠"}</span><h2>${matched ? "Des cerveaux se sont connectés !" : "Aucun match cette fois"}</h2><p>${escapeHtml(item?.prompt || "")}</p></section>
      <section class="brain-answer-wall">${state.players.map(player => {
        const points = Number(result.points?.[player.id] || 0);
        return `<article class="brain-answer-tile ${points ? "matched" : ""}"><span>${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong><p>${escapeHtml(result.answers?.[player.id]?.text || "")}</p>${points ? `<em>+${points} pt${points > 1 ? "s" : ""}</em>` : `<small>réponse unique</small>`}</article>`;
      }).join("")}</section>
      ${state.alcohol && !matched ? `<div class="alcohol-callout">🍻 Aucun match : tout le monde prend une petite gorgée de désynchronisation.</div>` : ""}
      ${state.isHost ? `<button id="nextMultiBrain" class="primary-btn full">${Number(gameState.currentIndex || 0) + 1 >= (gameState.items || []).length ? "Voir le classement" : "Question suivante"}</button>` : renderMultiWaiting("En attente de l’hôte", "La suite apparaîtra automatiquement.", "👑")}
    `;
    document.querySelector("#nextMultiBrain")?.addEventListener("click", event => advanceMultiV08Round(event, gameState, "answering", "answers"));
  }

  function processMultiMinority(gameState, votes) {
    if (!state.isHost || gameState.phase !== "voting" || Object.keys(votes).length < state.players.length) return;
    const processingId = `minority_${gameState.currentIndex}_${Object.keys(votes).length}`;
    if (state.multiProcessingActionId === processingId) return;
    state.multiProcessingActionId = processingId;
    const item = gameState.items?.[gameState.currentIndex];
    const counts = (item?.options || []).map((_, index) => Object.values(votes).filter(value => Number(value) === index).length);
    const positive = counts.filter(value => value > 0);
    const allEqual = positive.length <= 1 || new Set(positive).size === 1;
    const minPositive = positive.length ? Math.min(...positive) : 0;
    const minorityOptions = allEqual ? [] : counts.map((count, index) => count === minPositive && count > 0 ? index : null).filter(index => index !== null);
    const winnerIds = Object.entries(votes).filter(([, value]) => minorityOptions.includes(Number(value))).map(([id]) => id);
    const scores = { ...(gameState.scores || {}) };
    winnerIds.forEach(id => scores[id] = Number(scores[id] || 0) + 1);
    AKFirebase.updateGame(state.roomCode, {
      "state/phase": "results",
      "state/currentResult": { votes, counts, minorityOptions, winnerIds, itemId: item?.id || "" },
      "state/scores": scores,
      [`state/rounds/${gameState.currentIndex}`]: { votes, counts, minorityOptions, winnerIds },
      "state/updatedAt": AKFirebase.now()
    }).catch(console.error).finally(() => { state.multiProcessingActionId = null; });
  }

  function renderMultiMinorityVote(gameState, votes) {
    const item = gameState.items?.[gameState.currentIndex];
    const ownVote = votes[state.currentUid];
    title.textContent = "Minorité";
    setBackVisible(false);
    screen.innerHTML = `
      ${renderMultiProgress(Number(gameState.currentIndex || 0) + 1, gameState.items?.length || 1, "Question")}
      ${ownVote !== undefined && ownVote !== null ? renderMultiWaiting("Vote enregistré", `${Object.keys(votes).length}/${state.players.length} réponses reçues.`, "🔒") : `
        <section class="v08-question-card minority-question-card"><span>🪩</span><small>CHOISIS TA VOIE</small><h2>${escapeHtml(item?.question || "")}</h2></section>
        <section class="minority-choice-grid">${(item?.options || []).map((option, index) => `<button class="minority-choice" data-multi-minority="${index}"><small>OPTION ${String.fromCharCode(65 + index)}</small><strong>${escapeHtml(option)}</strong></button>`).join("")}</section>
      `}
      ${renderPlayerSubmissionStatus(votes, "A voté", "Réfléchit…")}
    `;
    document.querySelectorAll("[data-multi-minority]").forEach(button => button.addEventListener("click", async () => {
      document.querySelectorAll("[data-multi-minority]").forEach(itemButton => itemButton.disabled = true);
      try { await AKFirebase.writeOwnGameEntry(state.roomCode, "votes", Number(button.dataset.multiMinority)); }
      catch (error) { console.error(error); alert("Le vote n’a pas pu être envoyé."); }
    }));
  }

  function renderMultiMinorityResults(gameState) {
    const item = gameState.items?.[gameState.currentIndex];
    const result = gameState.currentResult || {};
    title.textContent = result.winnerIds?.length ? "La minorité gagne" : "Égalité totale";
    setBackVisible(false);
    screen.innerHTML = `
      <section class="reveal-stage reveal-v07 minority-reveal"><span class="game-cover-icon">🪩</span><h2>${result.winnerIds?.length ? "Les esprits rares prennent le point" : "Impossible de départager le groupe"}</h2><p>${escapeHtml(item?.question || "")}</p></section>
      <section class="minority-results">${(item?.options || []).map((option, index) => `<article class="minority-result ${result.minorityOptions?.includes(index) ? "winner" : ""}"><div><small>OPTION ${String.fromCharCode(65 + index)}</small><strong>${escapeHtml(option)}</strong></div><span>${Number(result.counts?.[index] || 0)} vote${Number(result.counts?.[index] || 0) > 1 ? "s" : ""}</span></article>`).join("")}</section>
      <section class="poll-results-grid">${state.players.map(player => `<article class="poll-result-person"><span>${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong><small>${escapeHtml(item?.options?.[Number(result.votes?.[player.id])] || "")}</small>${result.winnerIds?.includes(player.id) ? `<em>+1 pt minorité</em>` : ""}</article>`).join("")}</section>
      ${state.alcohol && result.winnerIds?.length ? `<div class="alcohol-callout">🍻 La majorité prend une petite gorgée. La minorité savoure.</div>` : ""}
      ${state.isHost ? `<button id="nextMultiMinority" class="primary-btn full">${Number(gameState.currentIndex || 0) + 1 >= (gameState.items || []).length ? "Voir le classement" : "Question suivante"}</button>` : renderMultiWaiting("En attente de l’hôte", "La suite apparaîtra automatiquement.", "👑")}
    `;
    document.querySelector("#nextMultiMinority")?.addEventListener("click", event => advanceMultiV08Round(event, gameState, "voting", "votes"));
  }

  function processMultiWhoAnswered(gameState, answers, votes) {
    if (!state.isHost) return;
    if (gameState.phase === "answering" && Object.keys(answers).length >= state.players.length) {
      const processingId = `who-answering_${gameState.currentIndex}_${Object.keys(answers).length}`;
      if (state.multiProcessingActionId === processingId) return;
      state.multiProcessingActionId = processingId;
      const authorId = gameState.authorOrder?.[Number(gameState.currentIndex || 0) % (gameState.authorOrder?.length || 1)];
      AKFirebase.updateGame(state.roomCode, {
        "state/phase": "voting",
        "state/mysteryAuthorId": authorId,
        "state/answerSnapshot": { text: answers?.[authorId]?.text || "" },
        "state/updatedAt": AKFirebase.now(),
        votes: null
      }).catch(console.error).finally(() => { state.multiProcessingActionId = null; });
      return;
    }

    if (gameState.phase === "voting") {
      const needed = Math.max(0, state.players.length - 1);
      if (Object.keys(votes).length < needed) return;
      const processingId = `who-voting_${gameState.currentIndex}_${Object.keys(votes).length}`;
      if (state.multiProcessingActionId === processingId) return;
      state.multiProcessingActionId = processingId;
      const authorId = gameState.mysteryAuthorId;
      const validVotes = Object.fromEntries(Object.entries(votes).filter(([id]) => id !== authorId));
      const correctIds = Object.entries(validVotes).filter(([, guess]) => guess === authorId).map(([id]) => id);
      const fooledIds = Object.entries(validVotes).filter(([, guess]) => guess !== authorId).map(([id]) => id);
      const scores = { ...(gameState.scores || {}) };
      correctIds.forEach(id => scores[id] = Number(scores[id] || 0) + 1);
      scores[authorId] = Number(scores[authorId] || 0) + fooledIds.length;
      const result = { authorId, correctIds, fooledIds, votes: validVotes, answers, itemId: gameState.items?.[gameState.currentIndex]?.id || "" };
      AKFirebase.updateGame(state.roomCode, {
        "state/phase": "results",
        "state/currentResult": result,
        "state/scores": scores,
        [`state/rounds/${gameState.currentIndex}`]: result,
        "state/updatedAt": AKFirebase.now()
      }).catch(console.error).finally(() => { state.multiProcessingActionId = null; });
    }
  }

  function renderMultiWhoAnsweredAnswer(gameState, answers) {
    const item = gameState.items?.[gameState.currentIndex];
    const own = answers[state.currentUid];
    title.textContent = "Qui a répondu ça ?";
    setBackVisible(false);
    screen.innerHTML = `
      ${renderMultiProgress(Number(gameState.currentIndex || 0) + 1, gameState.items?.length || 1, "Enquête")}
      ${own ? renderMultiWaiting("Réponse déposée", `${Object.keys(answers).length}/${state.players.length} carnets remplis.`, "🔒") : `
        <section class="v08-question-card who-question-card"><span>🕵️</span><small>RÉPONSE ANONYME</small><h2>${escapeHtml(item?.prompt || "")}</h2></section>
        <section class="card"><div class="form-group"><label for="multiWhoAnswer">Ta réponse</label><textarea id="multiWhoAnswer" class="text-input text-area multi-answer-textarea" maxlength="180" placeholder="Écris une réponse courte et reconnaissable…"></textarea></div></section>
        <button id="sendMultiWhoAnswer" class="primary-btn full">Déposer anonymement</button>
      `}
      ${renderPlayerSubmissionStatus(answers, "A répondu", "Écrit…")}
    `;
    document.querySelector("#sendMultiWhoAnswer")?.addEventListener("click", async event => {
      const text = document.querySelector("#multiWhoAnswer")?.value.trim();
      if (!text) return alert("Écris une réponse avant de continuer.");
      event.currentTarget.disabled = true;
      try { await AKFirebase.writeOwnGameEntry(state.roomCode, "answers", { text, submittedAt: AKFirebase.now() }); }
      catch (error) { console.error(error); event.currentTarget.disabled = false; alert("La réponse n’a pas pu être envoyée."); }
    });
  }

  function renderMultiWhoAnsweredVote(gameState, votes) {
    const item = gameState.items?.[gameState.currentIndex];
    const authorId = gameState.mysteryAuthorId;
    const isAuthor = state.currentUid === authorId;
    const ownVote = votes[state.currentUid];
    const ownPlayer = playerById(state.currentUid);
    const candidates = state.players.filter(player => player.id !== state.currentUid);
    title.textContent = "Qui a répondu ça ?";
    setBackVisible(false);
    screen.innerHTML = `
      ${renderMultiProgress(Number(gameState.currentIndex || 0) + 1, gameState.items?.length || 1, "Enquête")}
      <section class="mystery-answer-card"><small>${escapeHtml(item?.prompt || "")}</small><blockquote>« ${escapeHtml(gameState.answerSnapshot?.text || "") } »</blockquote><span>QUI A ÉCRIT ÇA ?</span></section>
      ${isAuthor ? renderMultiWaiting("Tu connais déjà la réponse", "Essaie de garder ton meilleur visage innocent.", avatarById(ownPlayer?.avatarId).emoji) : ownVote ? renderMultiWaiting("Soupçon enregistré", `${Object.keys(votes).length}/${Math.max(1, state.players.length - 1)} enquêteurs ont voté.`, "🔒") : `<section class="suspect-grid">${candidates.map(player => `<button class="suspect-card" data-multi-who-vote="${player.id}"><span>${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong></button>`).join("")}</section>`}
      ${renderPlayerSubmissionStatus({ ...votes, [authorId]: "author" }, "Prêt", "Cherche…")}
    `;
    document.querySelectorAll("[data-multi-who-vote]").forEach(button => button.addEventListener("click", async () => {
      document.querySelectorAll("[data-multi-who-vote]").forEach(itemButton => itemButton.disabled = true);
      try { await AKFirebase.writeOwnGameEntry(state.roomCode, "votes", button.dataset.multiWhoVote); }
      catch (error) { console.error(error); alert("Le soupçon n’a pas pu être envoyé."); }
    }));
  }

  function renderMultiWhoAnsweredResults(gameState) {
    const item = gameState.items?.[gameState.currentIndex];
    const result = gameState.currentResult || {};
    const author = playerById(result.authorId);
    title.textContent = "Identité révélée";
    setBackVisible(false);
    screen.innerHTML = `
      <section class="reveal-stage reveal-v07 who-reveal"><span class="game-cover-icon">${avatarById(author?.avatarId).emoji}</span><h2>C’était ${escapeHtml(author?.name || "un joueur")} !</h2><p>« ${escapeHtml(result.answers?.[result.authorId]?.text || "") } »</p></section>
      <section class="who-vote-results">${state.players.filter(player => player.id !== result.authorId).map(voter => {
        const guessed = playerById(result.votes?.[voter.id]);
        const correct = result.correctIds?.includes(voter.id);
        return `<article class="who-vote-row ${correct ? "correct" : "fooled"}"><span>${avatarById(voter.avatarId).emoji}</span><strong>${escapeHtml(voter.name)}</strong><small>a choisi ${escapeHtml(guessed?.name || "?")}</small><em>${correct ? "+1 pt" : "trompé·e"}</em></article>`;
      }).join("")}</section>
      <details class="answer-wall-details"><summary>Voir toutes les réponses</summary><div class="anonymous-answer-list">${state.players.map(player => `<article class="anonymous-answer-card"><span class="answer-number">${avatarById(player.avatarId).emoji}</span><p><strong>${escapeHtml(player.name)}</strong><br>${escapeHtml(result.answers?.[player.id]?.text || "")}</p></article>`).join("")}</div></details>
      ${result.fooledIds?.length ? `<div class="special-event"><strong>🕵️ ${escapeHtml(author?.name || "L’auteur")} a trompé ${result.fooledIds.length} personne${result.fooledIds.length > 1 ? "s" : ""}</strong><p>+${result.fooledIds.length} point${result.fooledIds.length > 1 ? "s" : ""} de couverture parfaite.</p></div>` : `<div class="notice">Tout le monde a retrouvé l’auteur. Couverture grillée.</div>`}
      ${state.alcohol && result.fooledIds?.length ? `<div class="alcohol-callout">🍻 Les enquêteurs trompés prennent une petite gorgée.</div>` : ""}
      ${state.isHost ? `<button id="nextMultiWho" class="primary-btn full">${Number(gameState.currentIndex || 0) + 1 >= (gameState.items || []).length ? "Voir le classement" : "Enquête suivante"}</button>` : renderMultiWaiting("En attente de l’hôte", "La prochaine enquête apparaîtra automatiquement.", "👑")}
    `;
    document.querySelector("#nextMultiWho")?.addEventListener("click", event => advanceMultiV08Round(event, gameState, "answering", "answers,votes"));
  }

  async function advanceMultiV08Round(event, gameState, nextPhase, collections) {
    event.currentTarget.disabled = true;
    const next = Number(gameState.currentIndex || 0) + 1;
    const finished = next >= (gameState.items || []).length;
    const updates = {
      "state/phase": finished ? "final" : nextPhase,
      "state/currentIndex": finished ? gameState.currentIndex : next,
      "state/currentResult": null,
      "state/mysteryAuthorId": null,
      "state/answerSnapshot": null,
      "state/finishedAt": finished ? AKFirebase.now() : null,
      "state/updatedAt": AKFirebase.now()
    };
    String(collections || "").split(",").filter(Boolean).forEach(collection => { updates[collection] = null; });
    try { await AKFirebase.updateGame(state.roomCode, updates); }
    catch (error) { console.error(error); event.currentTarget.disabled = false; alert("Impossible de passer à la suite."); }
  }

  function renderMultiV08Final(gameState) {
    const ranking = [...state.players].sort((a, b) => Number(gameState.scores?.[b.id] || 0) - Number(gameState.scores?.[a.id] || 0));
    const presentation = gamePresentation(gameState.type);
    title.textContent = "Classement final";
    setBackVisible(false);
    screen.innerHTML = `
      <section class="winner-stage winner-stage-v07 v08-final-stage"><div class="winner-crown">${presentation.icon}🏆</div><h2>La manche est terminée</h2><p>Les points rejoignent maintenant le classement général de la soirée.</p></section>
      <section class="final-ranking">${ranking.map((player, index) => `<div class="ranking-row"><span class="ranking-position">${index + 1}</span><span class="result-avatar">${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong><span>${Number(gameState.scores?.[player.id] || 0)} pts</span></div>`).join("")}</section>
      ${renderPostGameContinuation(gameState)}
    `;
    ensureEveningResult(gameState);
    bindPostGameContinuation(gameState);
  }

  /* =========================================================
     AK'GAMES V0.9 — IMPOSTEURS & DÉDUCTION MULTIJOUEUR
     ========================================================= */

  function clearV09MultiTimer() {
    if (state.v09MultiTimer) window.clearInterval(state.v09MultiTimer);
    state.v09MultiTimer = null;
  }

  function startV09MultiCountdown(endsAt, onExpire) {
    clearV09MultiTimer();
    const tick = () => {
      const left = Math.max(0, Math.ceil((Number(endsAt || 0) - AKFirebase.now()) / 1000));
      const node = document.querySelector("#v09MultiCountdown");
      const ring = document.querySelector("#v09MultiTimerRing");
      if (node) node.textContent = String(left);
      if (ring) {
        const total = Math.max(1, Number(ring.dataset.total || left || 1));
        ring.style.setProperty("--timer-progress", `${Math.max(0, Math.min(1, left / total)) * 360}deg`);
      }
      if (left <= 0) {
        clearV09MultiTimer();
        onExpire?.();
      }
    };
    tick();
    state.v09MultiTimer = window.setInterval(tick, 250);
  }

  function renderMultiV09Timer({ endsAt, total, kicker, heading, text, icon = "⏱️" }) {
    const left = Math.max(0, Math.ceil((Number(endsAt || 0) - AKFirebase.now()) / 1000));
    return `
      <section class="timer-stage v09-timer-stage">
        <span class="category-chip">${escapeHtml(kicker)}</span>
        <div id="v09MultiTimerRing" data-total="${Number(total || 60)}" class="v09-timer-ring"><strong id="v09MultiCountdown">${left}</strong><small>secondes</small></div>
        <h2>${icon} ${escapeHtml(heading)}</h2>
        <p>${escapeHtml(text)}</p>
      </section>
    `;
  }

  renderGames = function () {
    if (!isMultiplayer()) return localRenderGames();
    clearV09MultiTimer();
    const category = categories.find(item => item.id === state.currentCategory);
    title.textContent = category.name;
    setBackVisible(true);

    const multiReady = new Set([
      "Qui de nous ?", "Le premier qui rit a perdu", "Qui ment le mieux ?",
      "Action ou Vérité", "Action ou Vérité +18", "Je n’ai jamais", "Je n’ai jamais +18",
      "Tu préfères", "Tu préfères +18", "Même cerveau", "Minorité", "Qui a répondu ça ?",
      "L’Imposteur sait presque tout", "Le Faux Expert", "Qui suis-je ?"
    ]);

    screen.innerHTML = `
      <section class="catalog-intro"><span>${category.emoji}</span><div><small>CATÉGORIE</small><strong>${escapeHtml(category.name)}</strong><p>${escapeHtml(category.description)}</p></div></section>
      <section class="game-list game-list-v07">
        ${category.games.map(game => {
          const disabled = game === "Blind Test";
          const ready = multiReady.has(game);
          const isNew = V09_NEW_GAMES.has(game);
          const icon = V09_GAME_ICONS[game] || "🎲";
          return `
            <button class="game-card game-card-v07 ${disabled ? "disabled" : ""} ${isNew ? "game-card-new" : ""}" ${disabled ? "disabled" : ""} data-game="${escapeHtml(game)}">
              <span class="game-card-icon">${icon}</span>
              <span class="game-card-copy"><strong>${escapeHtml(game)} ${isNew ? `<span class="new-ribbon">NOUVEAU</span>` : ""}</strong><span class="helper">${disabled ? "Bientôt disponible" : ready ? "Jouable chacun sur son téléphone" : "À intégrer"}</span><span class="game-meta">${ready ? `<span class="badge green">📲 multijoueur</span>` : `<span class="badge">bientôt</span>`}${state.alcohol && ready ? `<span class="badge green">🍻 option alcool</span>` : ""}</span></span>
              <span class="game-card-chevron">›</span>
            </button>
          `;
        }).join("")}
      </section>
    `;

    document.querySelectorAll("[data-game]:not([disabled])").forEach(button => button.addEventListener("click", () => {
      const game = button.dataset.game;
      if (game === "Qui de nous ?") { state.multiView = "who-us-setup"; pushScreen("games"); resetWhoUsState(); renderWhoUsSetup(); return; }
      if (game === "Le premier qui rit a perdu") { if (state.players.length < 2) return alert("Ce duel nécessite au moins 2 joueurs."); state.multiView = "laugh-duel-setup"; pushScreen("games"); resetLaughDuelState(); renderLaughDuelSetup(); return; }
      if (game === "Qui ment le mieux ?") { if (state.players.length < 3) return alert("« Qui ment le mieux ? » nécessite au moins 3 joueurs."); state.multiView = "best-liar-setup"; pushScreen("games"); resetBestLiarState(); renderBestLiarSetup(); return; }
      if (game === "Action ou Vérité" || game === "Action ou Vérité +18") { state.multiView = "action-truth-setup"; pushScreen("games"); resetActionTruthState(game.includes("+18")); renderActionTruthSetup(); return; }
      if (game === "Je n’ai jamais" || game === "Je n’ai jamais +18") { state.multiView = "ambiance-poll-setup"; pushScreen("games"); resetAmbiancePollState("never", game.includes("+18")); renderAmbiancePollSetup(); return; }
      if (game === "Tu préfères" || game === "Tu préfères +18") { state.multiView = "ambiance-poll-setup"; pushScreen("games"); resetAmbiancePollState("would", game.includes("+18")); renderAmbiancePollSetup(); return; }
      if (game === "Même cerveau") { state.multiView = "same-brain-setup"; pushScreen("games"); resetSameBrainState(); renderSameBrainSetup(); return; }
      if (game === "Minorité") { state.multiView = "minority-setup"; pushScreen("games"); resetMinorityState(); renderMinoritySetup(); return; }
      if (game === "Qui a répondu ça ?") { if (state.players.length < 3) return alert("« Qui a répondu ça ? » nécessite au moins 3 joueurs."); state.multiView = "who-answered-setup"; pushScreen("games"); resetWhoAnsweredState(); renderWhoAnsweredSetup(); return; }
      if (game === "L’Imposteur sait presque tout") { if (state.players.length < 3) return alert("Ce jeu nécessite au moins 3 joueurs."); state.multiView = "almost-impostor-setup"; pushScreen("games"); resetAlmostImpostorState(); renderAlmostImpostorSetup(); return; }
      if (game === "Le Faux Expert") { if (state.players.length < 3) return alert("Ce jeu nécessite au moins 3 joueurs."); state.multiView = "fake-expert-setup"; pushScreen("games"); resetFakeExpertState(); renderFakeExpertSetup(); return; }
      if (game === "Qui suis-je ?") { if (state.players.length < 2) return alert("Ce jeu nécessite au moins 2 joueurs."); state.multiView = "who-am-i-setup"; pushScreen("games"); resetWhoAmIState(); renderWhoAmISetup(); return; }
      renderMultiNotReady(game);
    }));
  };

  renderAlmostImpostorSetup = function () {
    if (!isMultiplayer()) return localRenderAlmostImpostorSetup();
    if (!state.almostImpostor) resetAlmostImpostorState();
    const game = state.almostImpostor;
    title.textContent = "L’Imposteur sait presque tout";
    setBackVisible(true);
    screen.innerHTML = `
      <section class="game-cover game-cover-impostor"><span class="game-cover-icon">🕶️</span><div><small>MULTIJOUEUR SYNCHRONISÉ</small><h2>L’Imposteur sait presque tout</h2><p>Chaque rôle apparaît en privé. L’imposteur ne reçoit qu’un indice.</p></div></section>
      <section class="card setup-card-v07"><div class="form-group"><label for="multiImpostorRounds">Nombre de manches</label><select id="multiImpostorRounds" class="text-input">${[4,6,8,10].map(v => `<option value="${v}" ${game.roundCount === v ? "selected" : ""}>${v} manches</option>`).join("")}</select></div><div class="form-group top-gap"><label for="multiImpostorTimer">Discussion</label><select id="multiImpostorTimer" class="text-input">${[45,60,90].map(v => `<option value="${v}" ${game.discussionSeconds === v ? "selected" : ""}>${v} secondes</option>`).join("")}</select></div></section>
      ${state.adult ? `<label class="option-card premium-toggle"><input id="multiImpostorAdult" type="checkbox" ${game.includeAdult ? "checked" : ""}><span><strong>🌶️ Ajouter les cartes adultes</strong><br><span class="helper">Crushs, relations et dossiers.</span></span></label>` : ""}
      ${state.isHost ? `<button id="startMultiImpostor" class="primary-btn full">Distribuer les rôles</button>` : renderMultiWaiting("En attente de l’hôte", "Les rôles vont apparaître sur chaque écran.", "👑")}
    `;
    document.querySelector("#multiImpostorRounds")?.addEventListener("change", e => game.roundCount = Number(e.target.value));
    document.querySelector("#multiImpostorTimer")?.addEventListener("change", e => game.discussionSeconds = Number(e.target.value));
    document.querySelector("#multiImpostorAdult")?.addEventListener("change", e => game.includeAdult = e.target.checked);
    document.querySelector("#startMultiImpostor")?.addEventListener("click", startAlmostImpostorGame);
  };

  startAlmostImpostorGame = async function () {
    if (!isMultiplayer()) return localStartAlmostImpostorGame();
    if (!state.isHost) return;
    const game = state.almostImpostor;
    screen.innerHTML = `<div class="notice">Distribution des rôles secrets…</div>`;
    try {
      let pool = await loadJsonFile("data/imposteur.json", "Impossible de charger les mots.");
      if (state.adult && game.includeAdult) pool = pool.concat(await loadJsonFile("data/imposteur-adulte.json", "Impossible de charger les cartes adultes."));
      const items = shuffleArray(pool).slice(0, Math.min(game.roundCount, pool.length));
      const playerIds = state.players.map(player => player.id);
      const impostorOrder = items.map(() => playerIds[Math.floor(Math.random() * playerIds.length)]);
      const scores = Object.fromEntries(playerIds.map(id => [id, 0]));
      await AKFirebase.setGame(state.roomCode, { state: {
        type: "almost-impostor", phase: "roles", sessionGameId: createSessionGameId("almost-impostor"), items,
        currentIndex: 0, impostorOrder, impostorId: impostorOrder[0], scores, rounds: {}, currentResult: null,
        settings: { roundCount: items.length, includeAdult: Boolean(game.includeAdult), discussionSeconds: Number(game.discussionSeconds || 60) },
        startedAt: AKFirebase.now(), updatedAt: AKFirebase.now()
      }, answers: {}, votes: {}, actions: {} });
      state.multiView = "v09-game";
    } catch (error) {
      console.error(error); alert(error.message || "Impossible de lancer la partie."); renderAlmostImpostorSetup();
    }
  };

  renderFakeExpertSetup = function () {
    if (!isMultiplayer()) return localRenderFakeExpertSetup();
    if (!state.fakeExpert) resetFakeExpertState();
    const game = state.fakeExpert;
    title.textContent = "Le Faux Expert";
    setBackVisible(true);
    const minimum = Math.max(5, state.players.length);
    screen.innerHTML = `
      <section class="game-cover game-cover-expert"><span class="game-cover-icon">🎓</span><div><small>MULTIJOUEUR SYNCHRONISÉ</small><h2>Le Faux Expert</h2><p>L’orateur reçoit un vrai dossier ou un brief de bluff sur son téléphone.</p></div></section>
      <section class="card setup-card-v07"><div class="form-group"><label for="multiExpertRounds">Nombre de passages</label><select id="multiExpertRounds" class="text-input">${[minimum,8,10,12].filter((v,i,a)=>a.indexOf(v)===i).map(v => `<option value="${v}" ${game.roundCount === v ? "selected" : ""}>${v} passages</option>`).join("")}</select></div><div class="form-group top-gap"><label for="multiExpertTimer">Présentation</label><select id="multiExpertTimer" class="text-input">${[45,60,90].map(v => `<option value="${v}" ${game.speechSeconds === v ? "selected" : ""}>${v} secondes</option>`).join("")}</select></div></section>
      ${state.adult ? `<label class="option-card premium-toggle"><input id="multiExpertAdult" type="checkbox" ${game.includeAdult ? "checked" : ""}><span><strong>🌶️ Ajouter les sujets adultes</strong><br><span class="helper">Relations, dates et séduction.</span></span></label>` : ""}
      ${state.isHost ? `<button id="startMultiExpert" class="primary-btn full">Ouvrir la conférence</button>` : renderMultiWaiting("En attente de l’hôte", "Le premier orateur va recevoir son brief.", "👑")}
    `;
    document.querySelector("#multiExpertRounds")?.addEventListener("change", e => game.roundCount = Number(e.target.value));
    document.querySelector("#multiExpertTimer")?.addEventListener("change", e => game.speechSeconds = Number(e.target.value));
    document.querySelector("#multiExpertAdult")?.addEventListener("change", e => game.includeAdult = e.target.checked);
    document.querySelector("#startMultiExpert")?.addEventListener("click", startFakeExpertGame);
  };

  startFakeExpertGame = async function () {
    if (!isMultiplayer()) return localStartFakeExpertGame();
    if (!state.isHost) return;
    const game = state.fakeExpert;
    screen.innerHTML = `<div class="notice">Préparation des diplômes douteux…</div>`;
    try {
      let pool = await loadJsonFile("data/faux-expert.json", "Impossible de charger les sujets.");
      if (state.adult && game.includeAdult) pool = pool.concat(await loadJsonFile("data/faux-expert-adulte.json", "Impossible de charger les sujets adultes."));
      const items = shuffleArray(pool).slice(0, Math.min(game.roundCount, pool.length));
      const playerIds = state.players.map(player => player.id);
      const speakerOrder = Array.from({ length: items.length }, (_, index) => playerIds[index % playerIds.length]);
      const shuffledSpeakers = shuffleArray(speakerOrder);
      const roleOrder = items.map(() => Math.random() < 0.5 ? "real" : "fake");
      const scores = Object.fromEntries(playerIds.map(id => [id, 0]));
      await AKFirebase.setGame(state.roomCode, { state: {
        type: "fake-expert", phase: "brief", sessionGameId: createSessionGameId("fake-expert"), items,
        currentIndex: 0, speakerOrder: shuffledSpeakers, roleOrder, speakerId: shuffledSpeakers[0], role: roleOrder[0],
        scores, rounds: {}, currentResult: null,
        settings: { roundCount: items.length, includeAdult: Boolean(game.includeAdult), speechSeconds: Number(game.speechSeconds || 60) },
        startedAt: AKFirebase.now(), updatedAt: AKFirebase.now()
      }, answers: {}, votes: {}, actions: {} });
      state.multiView = "v09-game";
    } catch (error) {
      console.error(error); alert(error.message || "Impossible de lancer la partie."); renderFakeExpertSetup();
    }
  };

  renderWhoAmISetup = function () {
    if (!isMultiplayer()) return localRenderWhoAmISetup();
    if (!state.whoAmI) resetWhoAmIState();
    const game = state.whoAmI;
    title.textContent = "Qui suis-je ?";
    setBackVisible(true);
    const minimum = Math.max(6, state.players.length);
    screen.innerHTML = `
      <section class="game-cover game-cover-whoami"><span class="game-cover-icon">❓</span><div><small>MULTIJOUEUR SYNCHRONISÉ</small><h2>Qui suis-je ?</h2><p>L’identité est visible sur tous les téléphones sauf celui de la personne qui devine.</p></div></section>
      <section class="card setup-card-v07"><div class="form-group"><label for="multiWhoAmIRounds">Nombre de tours</label><select id="multiWhoAmIRounds" class="text-input">${[minimum,8,10,15].filter((v,i,a)=>a.indexOf(v)===i).map(v => `<option value="${v}" ${game.roundCount === v ? "selected" : ""}>${v} tours</option>`).join("")}</select></div><div class="form-group top-gap"><label for="multiWhoAmICategory">Catégories</label><select id="multiWhoAmICategory" class="text-input"><option value="mix" ${game.categoryMode === "mix" ? "selected" : ""}>Mélange complet</option><option value="classic" ${game.categoryMode === "classic" ? "selected" : ""}>Objets, animaux et métiers</option><option value="culture" ${game.categoryMode === "culture" ? "selected" : ""}>Culture pop</option></select></div><div class="form-group top-gap"><label for="multiWhoAmITimer">Chronomètre</label><select id="multiWhoAmITimer" class="text-input">${[45,60,90].map(v => `<option value="${v}" ${game.durationSeconds === v ? "selected" : ""}>${v} secondes</option>`).join("")}</select></div></section>
      ${state.adult ? `<label class="option-card premium-toggle"><input id="multiWhoAmIAdult" type="checkbox" ${game.includeAdult ? "checked" : ""}><span><strong>🌶️ Ajouter les identités adultes</strong><br><span class="helper">Crushs, ex et situations de date.</span></span></label>` : ""}
      ${state.isHost ? `<button id="startMultiWhoAmI" class="primary-btn full">Distribuer les identités</button>` : renderMultiWaiting("En attente de l’hôte", "Les identités vont être distribuées.", "👑")}
    `;
    document.querySelector("#multiWhoAmIRounds")?.addEventListener("change", e => game.roundCount = Number(e.target.value));
    document.querySelector("#multiWhoAmICategory")?.addEventListener("change", e => game.categoryMode = e.target.value);
    document.querySelector("#multiWhoAmITimer")?.addEventListener("change", e => game.durationSeconds = Number(e.target.value));
    document.querySelector("#multiWhoAmIAdult")?.addEventListener("change", e => game.includeAdult = e.target.checked);
    document.querySelector("#startMultiWhoAmI")?.addEventListener("click", startWhoAmIGame);
  };

  startWhoAmIGame = async function () {
    if (!isMultiplayer()) return localStartWhoAmIGame();
    if (!state.isHost) return;
    const game = state.whoAmI;
    screen.innerHTML = `<div class="notice">Préparation des identités secrètes…</div>`;
    try {
      let pool = await loadJsonFile("data/qui-suis-je.json", "Impossible de charger les identités.");
      if (game.categoryMode === "classic") pool = pool.filter(item => item.category !== "culture");
      if (game.categoryMode === "culture") pool = pool.filter(item => item.category === "culture");
      if (state.adult && game.includeAdult) pool = pool.concat(await loadJsonFile("data/qui-suis-je-adulte.json", "Impossible de charger les identités adultes."));
      const items = shuffleArray(pool).slice(0, Math.min(game.roundCount, pool.length));
      const playerIds = state.players.map(player => player.id);
      const guesserOrder = Array.from({ length: items.length }, (_, index) => playerIds[index % playerIds.length]);
      const shuffledGuessers = shuffleArray(guesserOrder);
      const scores = Object.fromEntries(playerIds.map(id => [id, 0]));
      await AKFirebase.setGame(state.roomCode, { state: {
        type: "who-am-i", phase: "reveal", sessionGameId: createSessionGameId("who-am-i"), items,
        currentIndex: 0, guesserOrder: shuffledGuessers, guesserId: shuffledGuessers[0], scores, rounds: {}, currentResult: null,
        settings: { roundCount: items.length, includeAdult: Boolean(game.includeAdult), categoryMode: game.categoryMode, durationSeconds: Number(game.durationSeconds || 60) },
        startedAt: AKFirebase.now(), updatedAt: AKFirebase.now()
      }, answers: {}, votes: {}, actions: {} });
      state.multiView = "v09-game";
    } catch (error) {
      console.error(error); alert(error.message || "Impossible de lancer la partie."); renderWhoAmISetup();
    }
  };

  function syncMultiV09Game(room) {
    const gameState = room.game?.state;
    if (!gameState) return;
    if (gameState.phase !== "final") clearMultiLobbyTimer();
    const answers = room.game?.answers || {};
    const votes = room.game?.votes || {};
    const actions = room.game?.actions || {};

    if (gameState.type === "almost-impostor") {
      processMultiAlmostImpostor(gameState, answers, votes, actions);
      const key = [gameState.type, gameState.phase, gameState.currentIndex, Object.keys(answers).length, Object.keys(votes).length, Object.keys(actions).length, answers[state.currentUid]?.seen || "", votes[state.currentUid] || "", actions[state.currentUid]?.id || "", gameState.discussionEndsAt || "", JSON.stringify(gameState.currentResult || {}), JSON.stringify(gameState.scores || {})].join("|");
      if (state.multiRenderKey === key) return;
      state.multiRenderKey = key;
      if (gameState.phase === "final") renderMultiV08Final(gameState);
      else if (gameState.phase === "roles") renderMultiAlmostImpostorRole(gameState, answers);
      else if (gameState.phase === "discussion") renderMultiAlmostImpostorDiscussion(gameState);
      else if (gameState.phase === "voting") renderMultiAlmostImpostorVote(gameState, votes);
      else if (gameState.phase === "guessing") renderMultiAlmostImpostorGuess(gameState, actions);
      else renderMultiAlmostImpostorResults(gameState);
      return;
    }

    if (gameState.type === "fake-expert") {
      processMultiFakeExpert(gameState, votes, actions);
      const key = [gameState.type, gameState.phase, gameState.currentIndex, Object.keys(votes).length, Object.keys(actions).length, votes[state.currentUid] || "", actions[state.currentUid]?.id || "", gameState.speechEndsAt || "", JSON.stringify(gameState.currentResult || {}), JSON.stringify(gameState.scores || {})].join("|");
      if (state.multiRenderKey === key) return;
      state.multiRenderKey = key;
      if (gameState.phase === "final") renderMultiV08Final(gameState);
      else if (gameState.phase === "brief") renderMultiFakeExpertBrief(gameState, actions);
      else if (gameState.phase === "speaking") renderMultiFakeExpertSpeaking(gameState);
      else if (gameState.phase === "voting") renderMultiFakeExpertVote(gameState, votes);
      else renderMultiFakeExpertResults(gameState);
      return;
    }

    if (gameState.type === "who-am-i") {
      processMultiWhoAmI(gameState, answers, actions);
      const key = [gameState.type, gameState.phase, gameState.currentIndex, Object.keys(answers).length, Object.keys(actions).length, answers[state.currentUid]?.seen || "", actions[state.currentUid]?.id || "", gameState.roundEndsAt || "", JSON.stringify(gameState.currentResult || {}), JSON.stringify(gameState.scores || {})].join("|");
      if (state.multiRenderKey === key) return;
      state.multiRenderKey = key;
      if (gameState.phase === "final") renderMultiV08Final(gameState);
      else if (gameState.phase === "reveal") renderMultiWhoAmIReveal(gameState, answers);
      else if (gameState.phase === "playing") renderMultiWhoAmIPlaying(gameState, actions);
      else renderMultiWhoAmIResults(gameState);
    }
  }

  function processMultiAlmostImpostor(gameState, answers, votes, actions) {
    if (!state.isHost) return;
    const round = Number(gameState.currentIndex || 0);
    if (gameState.phase === "roles" && Object.keys(answers).length >= state.players.length) {
      const id = `v09_imp_roles_${round}`;
      if (state.multiProcessingActionId === id) return;
      state.multiProcessingActionId = id;
      AKFirebase.updateGame(state.roomCode, { "state/phase": "discussion", "state/discussionEndsAt": AKFirebase.now() + Number(gameState.settings?.discussionSeconds || 60) * 1000, answers: null, "state/updatedAt": AKFirebase.now() }).finally(() => { state.multiProcessingActionId = null; });
      return;
    }
    if (gameState.phase === "discussion" && Number(gameState.discussionEndsAt || 0) <= AKFirebase.now()) {
      const id = `v09_imp_timer_${round}`;
      if (state.multiProcessingActionId === id) return;
      state.multiProcessingActionId = id;
      AKFirebase.updateGame(state.roomCode, { "state/phase": "voting", votes: null, "state/updatedAt": AKFirebase.now() }).finally(() => { state.multiProcessingActionId = null; });
      return;
    }
    if (gameState.phase === "voting" && Object.keys(votes).length >= state.players.length) {
      const id = `v09_imp_votes_${round}_${Object.keys(votes).length}`;
      if (state.multiProcessingActionId === id) return;
      state.multiProcessingActionId = id;
      const counts = {};
      Object.values(votes).forEach(target => counts[target] = Number(counts[target] || 0) + 1);
      const max = Math.max(0, ...Object.values(counts));
      const topIds = Object.keys(counts).filter(playerId => counts[playerId] === max);
      const caught = topIds.length === 1 && topIds[0] === gameState.impostorId;
      const correctIds = Object.entries(votes).filter(([, target]) => target === gameState.impostorId).map(([id]) => id);
      const scores = { ...(gameState.scores || {}) };
      correctIds.forEach(id2 => scores[id2] = Number(scores[id2] || 0) + 1);
      if (!caught) scores[gameState.impostorId] = Number(scores[gameState.impostorId] || 0) + 2;
      const result = { caught, topIds, counts, correctIds, votes, guess: null, guessCorrect: false, impostorId: gameState.impostorId, itemId: gameState.items?.[round]?.id || "" };
      AKFirebase.updateGame(state.roomCode, { "state/phase": caught ? "guessing" : "results", "state/currentResult": result, "state/scores": scores, votes: null, actions: null, [`state/rounds/${round}`]: result, "state/updatedAt": AKFirebase.now() }).finally(() => { state.multiProcessingActionId = null; });
      return;
    }
    if (gameState.phase === "guessing") {
      const action = actions[gameState.impostorId];
      if (!action?.payload?.guess) return;
      const id = `v09_imp_guess_${round}_${action.id}`;
      if (state.multiProcessingActionId === id) return;
      state.multiProcessingActionId = id;
      const card = gameState.items?.[round];
      const correct = action.payload.guess === card?.word;
      const scores = { ...(gameState.scores || {}) };
      if (correct) scores[gameState.impostorId] = Number(scores[gameState.impostorId] || 0) + 1;
      const result = { ...(gameState.currentResult || {}), guess: action.payload.guess, guessCorrect: correct };
      AKFirebase.updateGame(state.roomCode, { "state/phase": "results", "state/currentResult": result, "state/scores": scores, [`state/rounds/${round}`]: result, actions: null, "state/updatedAt": AKFirebase.now() }).finally(() => { state.multiProcessingActionId = null; });
    }
  }

  function renderMultiAlmostImpostorRole(gameState, answers) {
    clearV09MultiTimer();
    const card = gameState.items?.[gameState.currentIndex];
    const me = playerById(state.currentUid);
    const seen = answers[state.currentUid]?.seen;
    const isImpostor = state.currentUid === gameState.impostorId;
    title.textContent = "Rôle secret";
    setBackVisible(false);
    screen.innerHTML = `
      ${renderMultiProgress(Number(gameState.currentIndex || 0) + 1, gameState.items?.length || 1, "Manche")}
      ${seen ? renderMultiWaiting("Rôle mémorisé", `${Object.keys(answers).length}/${state.players.length} joueurs prêts.`, "🔒") : `
        <section class="secret-role-card ${isImpostor ? "impostor" : "civil"}"><span>${isImpostor ? "🕶️" : "🔐"}</span><small>${isImpostor ? "IMPOSTEUR" : "ÉQUIPE INFORMÉE"}</small><h2>${isImpostor ? "Tu ne connais pas le mot" : escapeHtml(card?.word || "")}</h2><p><strong>Indice :</strong> ${escapeHtml(card?.hint || "")}</p><em>${isImpostor ? "Écoute les autres et reste crédible." : "Donne un indice utile sans révéler le mot."}</em></section>
        <button id="seenMultiImpostorRole" class="primary-btn full">J’ai mémorisé</button>
      `}
      ${renderPlayerSubmissionStatus(answers, "Prêt", "Lit son rôle…")}
    `;
    document.querySelector("#seenMultiImpostorRole")?.addEventListener("click", async event => {
      event.currentTarget.disabled = true;
      try { await AKFirebase.writeOwnGameEntry(state.roomCode, "answers", { seen: true, submittedAt: AKFirebase.now() }); }
      catch (error) { console.error(error); event.currentTarget.disabled = false; }
    });
  }

  function renderMultiAlmostImpostorDiscussion(gameState) {
    const card = gameState.items?.[gameState.currentIndex];
    title.textContent = "Discussion";
    setBackVisible(false);
    screen.innerHTML = `
      ${renderMultiProgress(Number(gameState.currentIndex || 0) + 1, gameState.items?.length || 1, "Manche")}
      ${renderMultiV09Timer({ endsAt: gameState.discussionEndsAt, total: Number(gameState.settings?.discussionSeconds || 60), kicker: String(card?.category || "mystère").toUpperCase(), heading: "Donnez chacun un indice", text: "Interdiction de prononcer le mot. Observez les hésitations.", icon: "🕶️" })}
      ${state.isHost ? `<button id="multiImpostorVoteNow" class="secondary-btn full">Passer aux votes</button>` : ""}
    `;
    const expire = async () => {
      if (!state.isHost) return;
      const id = `v09_imp_expire_${gameState.currentIndex}`;
      if (state.multiProcessingActionId === id) return;
      state.multiProcessingActionId = id;
      try { await AKFirebase.updateGame(state.roomCode, { "state/phase": "voting", votes: null, "state/updatedAt": AKFirebase.now() }); }
      finally { state.multiProcessingActionId = null; }
    };
    document.querySelector("#multiImpostorVoteNow")?.addEventListener("click", expire);
    startV09MultiCountdown(gameState.discussionEndsAt, expire);
  }

  function renderMultiAlmostImpostorVote(gameState, votes) {
    clearV09MultiTimer();
    const own = votes[state.currentUid];
    const candidates = state.players.filter(player => player.id !== state.currentUid);
    title.textContent = "Qui est l’imposteur ?";
    setBackVisible(false);
    screen.innerHTML = `
      ${renderMultiProgress(Number(gameState.currentIndex || 0) + 1, gameState.items?.length || 1, "Manche")}
      ${own ? renderMultiWaiting("Vote enregistré", `${Object.keys(votes).length}/${state.players.length} votes reçus.`, "🔒") : `<section class="suspect-grid">${candidates.map(player => `<button class="suspect-card" data-multi-impostor-vote="${player.id}"><span>${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong></button>`).join("")}</section>`}
      ${renderPlayerSubmissionStatus(votes, "A voté", "Réfléchit…")}
    `;
    document.querySelectorAll("[data-multi-impostor-vote]").forEach(button => button.addEventListener("click", async () => {
      document.querySelectorAll("[data-multi-impostor-vote]").forEach(item => item.disabled = true);
      try { await AKFirebase.writeOwnGameEntry(state.roomCode, "votes", button.dataset.multiImpostorVote); }
      catch (error) { console.error(error); alert("Le vote n’a pas pu être envoyé."); }
    }));
  }

  function renderMultiAlmostImpostorGuess(gameState, actions) {
    clearV09MultiTimer();
    const card = gameState.items?.[gameState.currentIndex];
    const isImpostor = state.currentUid === gameState.impostorId;
    const own = actions[state.currentUid];
    title.textContent = "Dernière chance";
    setBackVisible(false);
    screen.innerHTML = `
      ${isImpostor ? (own ? renderMultiWaiting("Réponse envoyée", "Le mot va être révélé.", "🔒") : `<section class="v09-question-card"><span>🕶️</span><small>IMPOSTEUR DÉMASQUÉ</small><h2>${escapeHtml(card?.hint || "")}</h2></section><section class="v09-option-grid">${shuffleArray([card?.word, ...(card?.decoys || [])]).map(option => `<button class="v09-choice-card" data-multi-impostor-guess="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join("")}</section>`) : renderMultiWaiting("L’imposteur tente le mot", "Tout le groupe découvrira bientôt sa réponse.", "🕶️")}
    `;
    document.querySelectorAll("[data-multi-impostor-guess]").forEach(button => button.addEventListener("click", async () => {
      document.querySelectorAll("[data-multi-impostor-guess]").forEach(item => item.disabled = true);
      try { await sendMultiAction("impostor-guess", { guess: button.dataset.multiImpostorGuess }); }
      catch (error) { console.error(error); alert("La réponse n’a pas pu être envoyée."); }
    }));
  }

  function renderMultiAlmostImpostorResults(gameState) {
    clearV09MultiTimer();
    const card = gameState.items?.[gameState.currentIndex];
    const result = gameState.currentResult || {};
    const impostor = playerById(result.impostorId || gameState.impostorId);
    title.textContent = "Révélation";
    setBackVisible(false);
    screen.innerHTML = `
      <section class="reveal-stage reveal-v07 impostor-reveal"><span class="game-cover-icon">${avatarById(impostor?.avatarId).emoji}</span><h2>${escapeHtml(impostor?.name || "Un joueur")} était l’imposteur</h2><p>Le mot était <strong>${escapeHtml(card?.word || "")}</strong>.</p></section>
      <section class="vote-breakdown">${state.players.map(player => { const target = playerById(result.votes?.[player.id]); const correct = result.votes?.[player.id] === result.impostorId; return `<article class="who-vote-row ${correct ? "correct" : "fooled"}"><span>${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong><small>a voté ${escapeHtml(target?.name || "?")}</small><em>${correct ? "+1 pt" : "raté"}</em></article>`; }).join("")}</section>
      <div class="special-event ${result.caught ? "" : "tie"}"><strong>${result.caught ? "🔍 Imposteur démasqué" : "🕶️ L’imposteur s’échappe"}</strong><p>${result.caught ? (result.guessCorrect ? "Le mot a été retrouvé : +1 point imposteur." : "Le groupe remporte l’enquête.") : "+2 points pour la couverture parfaite."}</p></div>
      ${state.alcohol ? `<div class="alcohol-callout">🍻 ${result.caught ? "L’imposteur prend une petite gorgée." : "Les votes ratés prennent une petite gorgée."}</div>` : ""}
      ${state.isHost ? `<button id="nextMultiImpostor" class="primary-btn full">${Number(gameState.currentIndex || 0) + 1 >= (gameState.items || []).length ? "Voir le classement" : "Manche suivante"}</button>` : renderMultiWaiting("En attente de l’hôte", "La prochaine manche apparaîtra automatiquement.", "👑")}
    `;
    document.querySelector("#nextMultiImpostor")?.addEventListener("click", event => advanceMultiV09Round(event, gameState, "roles", "answers,votes,actions", { impostorId: gameState.impostorOrder?.[Number(gameState.currentIndex || 0) + 1] || null }));
  }

  function processMultiFakeExpert(gameState, votes, actions) {
    if (!state.isHost) return;
    const round = Number(gameState.currentIndex || 0);
    if (gameState.phase === "brief") {
      const action = actions[gameState.speakerId];
      if (!action || action.type !== "expert-ready") return;
      const id = `v09_exp_ready_${round}_${action.id}`;
      if (state.multiProcessingActionId === id) return;
      state.multiProcessingActionId = id;
      AKFirebase.updateGame(state.roomCode, { "state/phase": "speaking", "state/speechEndsAt": AKFirebase.now() + Number(gameState.settings?.speechSeconds || 60) * 1000, actions: null, "state/updatedAt": AKFirebase.now() }).finally(() => { state.multiProcessingActionId = null; });
      return;
    }
    if (gameState.phase === "speaking" && Number(gameState.speechEndsAt || 0) <= AKFirebase.now()) {
      const id = `v09_exp_timer_${round}`;
      if (state.multiProcessingActionId === id) return;
      state.multiProcessingActionId = id;
      AKFirebase.updateGame(state.roomCode, { "state/phase": "voting", votes: null, "state/updatedAt": AKFirebase.now() }).finally(() => { state.multiProcessingActionId = null; });
      return;
    }
    const expected = Math.max(0, state.players.length - 1);
    if (gameState.phase === "voting" && Object.keys(votes).length >= expected) {
      const id = `v09_exp_votes_${round}_${Object.keys(votes).length}`;
      if (state.multiProcessingActionId === id) return;
      state.multiProcessingActionId = id;
      const correctIds = Object.entries(votes).filter(([, vote]) => vote === gameState.role).map(([id2]) => id2);
      const fooledIds = Object.entries(votes).filter(([, vote]) => vote !== gameState.role).map(([id2]) => id2);
      const scores = { ...(gameState.scores || {}) };
      correctIds.forEach(id2 => scores[id2] = Number(scores[id2] || 0) + 1);
      scores[gameState.speakerId] = Number(scores[gameState.speakerId] || 0) + Math.min(3, fooledIds.length);
      const result = { speakerId: gameState.speakerId, role: gameState.role, votes, correctIds, fooledIds, itemId: gameState.items?.[round]?.id || "" };
      AKFirebase.updateGame(state.roomCode, { "state/phase": "results", "state/currentResult": result, "state/scores": scores, [`state/rounds/${round}`]: result, votes: null, "state/updatedAt": AKFirebase.now() }).finally(() => { state.multiProcessingActionId = null; });
    }
  }

  function renderMultiFakeExpertBrief(gameState, actions) {
    clearV09MultiTimer();
    const card = gameState.items?.[gameState.currentIndex];
    const speaker = playerById(gameState.speakerId);
    const isSpeaker = state.currentUid === gameState.speakerId;
    const ready = actions[state.currentUid]?.type === "expert-ready";
    const isReal = gameState.role === "real";
    title.textContent = "Brief confidentiel";
    setBackVisible(false);
    screen.innerHTML = `
      ${renderMultiProgress(Number(gameState.currentIndex || 0) + 1, gameState.items?.length || 1, "Passage")}
      ${isSpeaker ? (ready ? renderMultiWaiting("Brief mémorisé", "La conférence démarre dans un instant.", "🔒") : `<section class="secret-role-card expert-role ${isReal ? "civil" : "impostor"}"><span>${isReal ? "🎓" : "🎭"}</span><small>${isReal ? "VRAI EXPERT" : "FAUX EXPERT"}</small><h2>${escapeHtml(card?.topic || "")}</h2>${isReal ? `<ul class="expert-fact-list">${(card?.facts || []).map(fact => `<li>${escapeHtml(fact)}</li>`).join("")}</ul>` : `<p>${escapeHtml(card?.fakeTip || "")}</p><em>Improviser avec aplomb.</em>`}</section><button id="multiExpertReady" class="primary-btn full">Je suis prêt·e à parler</button>`) : renderMultiWaiting(`${escapeHtml(speaker?.name || "L’orateur")} prépare son exposé`, "Le sujet sera bientôt visible sur tous les écrans.", "🎓")}
    `;
    document.querySelector("#multiExpertReady")?.addEventListener("click", async event => {
      event.currentTarget.disabled = true;
      try { await sendMultiAction("expert-ready", {}); }
      catch (error) { console.error(error); event.currentTarget.disabled = false; }
    });
  }

  function renderMultiFakeExpertSpeaking(gameState) {
    const card = gameState.items?.[gameState.currentIndex];
    const speaker = playerById(gameState.speakerId);
    title.textContent = "Conférence express";
    setBackVisible(false);
    screen.innerHTML = `
      ${renderMultiProgress(Number(gameState.currentIndex || 0) + 1, gameState.items?.length || 1, "Passage")}
      ${renderMultiV09Timer({ endsAt: gameState.speechEndsAt, total: Number(gameState.settings?.speechSeconds || 60), kicker: `${avatarById(speaker?.avatarId).emoji} ${speaker?.name || "Orateur"}`, heading: card?.topic || "Sujet mystère", text: "Posez une ou deux questions. L’orateur doit rester convaincant.", icon: "🎓" })}
      ${state.isHost ? `<button id="multiExpertVoteNow" class="secondary-btn full">Passer au verdict</button>` : ""}
    `;
    const expire = async () => {
      if (!state.isHost) return;
      const id = `v09_exp_expire_${gameState.currentIndex}`;
      if (state.multiProcessingActionId === id) return;
      state.multiProcessingActionId = id;
      try { await AKFirebase.updateGame(state.roomCode, { "state/phase": "voting", votes: null, "state/updatedAt": AKFirebase.now() }); }
      finally { state.multiProcessingActionId = null; }
    };
    document.querySelector("#multiExpertVoteNow")?.addEventListener("click", expire);
    startV09MultiCountdown(gameState.speechEndsAt, expire);
  }

  function renderMultiFakeExpertVote(gameState, votes) {
    clearV09MultiTimer();
    const isSpeaker = state.currentUid === gameState.speakerId;
    const own = votes[state.currentUid];
    const speaker = playerById(gameState.speakerId);
    title.textContent = "Vrai ou faux expert ?";
    setBackVisible(false);
    const status = { ...votes, [gameState.speakerId]: "speaker" };
    screen.innerHTML = `
      ${renderMultiProgress(Number(gameState.currentIndex || 0) + 1, gameState.items?.length || 1, "Passage")}
      <section class="v09-question-card"><span>${avatarById(speaker?.avatarId).emoji}</span><small>${escapeHtml(speaker?.name || "ORATEUR").toUpperCase()}</small><h2>${escapeHtml(gameState.items?.[gameState.currentIndex]?.topic || "")}</h2></section>
      ${isSpeaker ? renderMultiWaiting("Tu connais ton rôle", "Observe le verdict du jury.", "🎭") : own ? renderMultiWaiting("Verdict enregistré", `${Object.keys(votes).length}/${Math.max(1, state.players.length - 1)} votes reçus.`, "🔒") : `<section class="v09-binary-grid"><button class="v09-choice-card credible" data-multi-expert-vote="real">🎓 Vrai expert</button><button class="v09-choice-card suspicious" data-multi-expert-vote="fake">🎭 Faux expert</button></section>`}
      ${renderPlayerSubmissionStatus(status, "Prêt", "Juge…")}
    `;
    document.querySelectorAll("[data-multi-expert-vote]").forEach(button => button.addEventListener("click", async () => {
      document.querySelectorAll("[data-multi-expert-vote]").forEach(item => item.disabled = true);
      try { await AKFirebase.writeOwnGameEntry(state.roomCode, "votes", button.dataset.multiExpertVote); }
      catch (error) { console.error(error); alert("Le verdict n’a pas pu être envoyé."); }
    }));
  }

  function renderMultiFakeExpertResults(gameState) {
    clearV09MultiTimer();
    const card = gameState.items?.[gameState.currentIndex];
    const result = gameState.currentResult || {};
    const speaker = playerById(result.speakerId || gameState.speakerId);
    title.textContent = "Diplôme révélé";
    setBackVisible(false);
    screen.innerHTML = `
      <section class="reveal-stage reveal-v07 expert-reveal"><span class="game-cover-icon">${result.role === "real" ? "🎓" : "🎭"}</span><h2>${escapeHtml(speaker?.name || "L’orateur")} était ${result.role === "real" ? "un vrai expert" : "un faux expert"}</h2><p>${escapeHtml(card?.topic || "")}</p></section>
      <section class="who-vote-results">${state.players.filter(player => player.id !== result.speakerId).map(voter => { const correct = result.correctIds?.includes(voter.id); return `<article class="who-vote-row ${correct ? "correct" : "fooled"}"><span>${avatarById(voter.avatarId).emoji}</span><strong>${escapeHtml(voter.name)}</strong><small>a voté ${result.votes?.[voter.id] === "real" ? "vrai expert" : "faux expert"}</small><em>${correct ? "+1 pt" : "trompé·e"}</em></article>`; }).join("")}</section>
      <details class="answer-wall-details"><summary>Voir les vraies informations</summary><ul class="expert-fact-list">${(card?.facts || []).map(fact => `<li>${escapeHtml(fact)}</li>`).join("")}</ul></details>
      <div class="special-event"><strong>🎤 ${result.fooledIds?.length || 0} personne${(result.fooledIds?.length || 0) > 1 ? "s" : ""} trompée${(result.fooledIds?.length || 0) > 1 ? "s" : ""}</strong><p>+${Math.min(3, result.fooledIds?.length || 0)} point${Math.min(3, result.fooledIds?.length || 0) > 1 ? "s" : ""} pour l’orateur.</p></div>
      ${state.alcohol && result.fooledIds?.length ? `<div class="alcohol-callout">🍻 Les personnes trompées prennent une petite gorgée.</div>` : ""}
      ${state.isHost ? `<button id="nextMultiExpert" class="primary-btn full">${Number(gameState.currentIndex || 0) + 1 >= (gameState.items || []).length ? "Voir le classement" : "Orateur suivant"}</button>` : renderMultiWaiting("En attente de l’hôte", "Le prochain exposé apparaîtra automatiquement.", "👑")}
    `;
    const nextIndex = Number(gameState.currentIndex || 0) + 1;
    document.querySelector("#nextMultiExpert")?.addEventListener("click", event => advanceMultiV09Round(event, gameState, "brief", "answers,votes,actions", { speakerId: gameState.speakerOrder?.[nextIndex] || null, role: gameState.roleOrder?.[nextIndex] || "fake" }));
  }

  function processMultiWhoAmI(gameState, answers, actions) {
    if (!state.isHost) return;
    const round = Number(gameState.currentIndex || 0);
    const expected = Math.max(0, state.players.length - 1);
    if (gameState.phase === "reveal" && Object.keys(answers).length >= expected) {
      const id = `v09_who_ready_${round}_${Object.keys(answers).length}`;
      if (state.multiProcessingActionId === id) return;
      state.multiProcessingActionId = id;
      AKFirebase.updateGame(state.roomCode, { "state/phase": "playing", "state/roundEndsAt": AKFirebase.now() + Number(gameState.settings?.durationSeconds || 60) * 1000, answers: null, actions: null, "state/updatedAt": AKFirebase.now() }).finally(() => { state.multiProcessingActionId = null; });
      return;
    }
    if (gameState.phase !== "playing") return;
    const action = actions[gameState.guesserId];
    const expired = Number(gameState.roundEndsAt || 0) <= AKFirebase.now();
    if (!action?.payload?.found && !expired) return;
    const id = `v09_who_finish_${round}_${action?.id || "timer"}`;
    if (state.multiProcessingActionId === id) return;
    state.multiProcessingActionId = id;
    const found = Boolean(action?.payload?.found) && !expired;
    const scores = { ...(gameState.scores || {}) };
    if (found) {
      scores[gameState.guesserId] = Number(scores[gameState.guesserId] || 0) + 2;
      state.players.filter(player => player.id !== gameState.guesserId).forEach(player => scores[player.id] = Number(scores[player.id] || 0) + 1);
    }
    const result = { guesserId: gameState.guesserId, found, itemId: gameState.items?.[round]?.id || "" };
    AKFirebase.updateGame(state.roomCode, { "state/phase": "results", "state/currentResult": result, "state/scores": scores, [`state/rounds/${round}`]: result, actions: null, "state/updatedAt": AKFirebase.now() }).finally(() => { state.multiProcessingActionId = null; });
  }

  function renderMultiWhoAmIReveal(gameState, answers) {
    clearV09MultiTimer();
    const item = gameState.items?.[gameState.currentIndex];
    const guesser = playerById(gameState.guesserId);
    const isGuesser = state.currentUid === gameState.guesserId;
    const seen = answers[state.currentUid]?.seen;
    title.textContent = "Identité secrète";
    setBackVisible(false);
    const status = { ...answers, [gameState.guesserId]: "guesser" };
    screen.innerHTML = `
      ${renderMultiProgress(Number(gameState.currentIndex || 0) + 1, gameState.items?.length || 1, "Tour")}
      ${isGuesser ? renderMultiWaiting("Ne regarde pas les autres écrans", "Ton identité est visible par tout le groupe.", avatarById(guesser?.avatarId).emoji) : seen ? renderMultiWaiting("Identité mémorisée", `${Object.keys(answers).length}/${Math.max(1, state.players.length - 1)} aides prêtes.`, "🔒") : `<section class="whoami-secret-card"><small>${escapeHtml(item?.category || "mystère").toUpperCase()}</small><span>❓</span><h2>${escapeHtml(item?.label || "")}</h2><ul>${(item?.clues || []).map(clue => `<li>${escapeHtml(clue)}</li>`).join("")}</ul><p>Réponds uniquement par oui, non ou presque.</p></section><button id="multiWhoAmISeen" class="primary-btn full">J’ai mémorisé</button>`}
      ${renderPlayerSubmissionStatus(status, "Prêt", "Découvre…")}
    `;
    document.querySelector("#multiWhoAmISeen")?.addEventListener("click", async event => {
      event.currentTarget.disabled = true;
      try { await AKFirebase.writeOwnGameEntry(state.roomCode, "answers", { seen: true, submittedAt: AKFirebase.now() }); }
      catch (error) { console.error(error); event.currentTarget.disabled = false; }
    });
  }

  function renderMultiWhoAmIPlaying(gameState, actions) {
    const item = gameState.items?.[gameState.currentIndex];
    const guesser = playerById(gameState.guesserId);
    const isGuesser = state.currentUid === gameState.guesserId;
    title.textContent = "Qui suis-je ?";
    setBackVisible(false);
    screen.innerHTML = `
      ${renderMultiProgress(Number(gameState.currentIndex || 0) + 1, gameState.items?.length || 1, "Tour")}
      ${renderMultiV09Timer({ endsAt: gameState.roundEndsAt, total: Number(gameState.settings?.durationSeconds || 60), kicker: `${avatarById(guesser?.avatarId).emoji} ${guesser?.name || "Joueur"}`, heading: isGuesser ? "Pose des questions" : item?.label || "Identité secrète", text: isGuesser ? "Le groupe répond oui, non ou presque." : (item?.clues || []).join(" • "), icon: "❓" })}
      ${isGuesser ? `<button id="multiWhoAmIFound" class="primary-btn full">✅ J’ai trouvé !</button>` : `<div class="notice">Aide ${escapeHtml(guesser?.name || "la personne")} sans prononcer l’identité.</div>`}
    `;
    document.querySelector("#multiWhoAmIFound")?.addEventListener("click", async event => {
      event.currentTarget.disabled = true;
      try { await sendMultiAction("who-am-i-found", { found: true }); }
      catch (error) { console.error(error); event.currentTarget.disabled = false; }
    });
    startV09MultiCountdown(gameState.roundEndsAt, () => processMultiWhoAmI(gameState, {}, actions));
  }

  function renderMultiWhoAmIResults(gameState) {
    clearV09MultiTimer();
    const item = gameState.items?.[gameState.currentIndex];
    const result = gameState.currentResult || {};
    const guesser = playerById(result.guesserId || gameState.guesserId);
    title.textContent = result.found ? "Identité trouvée" : "Temps écoulé";
    setBackVisible(false);
    screen.innerHTML = `
      <section class="reveal-stage reveal-v07 whoami-reveal"><span class="game-cover-icon">${result.found ? "🎉" : "⏱️"}</span><h2>${escapeHtml(guesser?.name || "Le joueur")} était ${escapeHtml(item?.label || "")}</h2><p>${result.found ? "+2 points pour la personne qui devine, +1 pour chaque aide." : "Cette identité n’a pas été trouvée à temps."}</p></section>
      <section class="whoami-clue-wall">${(item?.clues || []).map(clue => `<span>${escapeHtml(clue)}</span>`).join("")}</section>
      ${state.alcohol && !result.found ? `<div class="alcohol-callout">🍻 Petite gorgée de consolation pour ${escapeHtml(guesser?.name || "la personne")}.</div>` : ""}
      ${state.isHost ? `<button id="nextMultiWhoAmI" class="primary-btn full">${Number(gameState.currentIndex || 0) + 1 >= (gameState.items || []).length ? "Voir le classement" : "Identité suivante"}</button>` : renderMultiWaiting("En attente de l’hôte", "La prochaine identité apparaîtra automatiquement.", "👑")}
    `;
    const nextIndex = Number(gameState.currentIndex || 0) + 1;
    document.querySelector("#nextMultiWhoAmI")?.addEventListener("click", event => advanceMultiV09Round(event, gameState, "reveal", "answers,votes,actions", { guesserId: gameState.guesserOrder?.[nextIndex] || null }));
  }

  async function advanceMultiV09Round(event, gameState, nextPhase, collections, extra = {}) {
    event.currentTarget.disabled = true;
    clearV09MultiTimer();
    const next = Number(gameState.currentIndex || 0) + 1;
    const finished = next >= (gameState.items || []).length;
    const updates = {
      "state/phase": finished ? "final" : nextPhase,
      "state/currentIndex": finished ? gameState.currentIndex : next,
      "state/currentResult": null,
      "state/discussionEndsAt": null,
      "state/speechEndsAt": null,
      "state/roundEndsAt": null,
      "state/finishedAt": finished ? AKFirebase.now() : null,
      "state/updatedAt": AKFirebase.now()
    };
    if (!finished) Object.entries(extra || {}).forEach(([key, value]) => updates[`state/${key}`] = value);
    String(collections || "").split(",").filter(Boolean).forEach(collection => updates[collection] = null);
    try { await AKFirebase.updateGame(state.roomCode, updates); }
    catch (error) { console.error(error); event.currentTarget.disabled = false; alert("Impossible de passer à la suite."); }
  }


  async function restoreMultiplayerSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return;

    let saved;

    try {
      saved = JSON.parse(raw);
    } catch {
      clearRoomSession();
      return;
    }

    if (!saved.roomCode) return;

    try {
      renderMultiplayerLoading("Reconnexion au salon…");

      const loaded = await AKFirebase.loadRoom(saved.roomCode);

      if (!loaded) {
        clearRoomSession();
        renderHome();
        return;
      }

      state.roomCode = loaded.key;
      state.currentUid = loaded.uid;
      state.roomData = loaded.room;
      state.players = roomPlayersFromObject(loaded.room.players);
      state.isHost = loaded.room.meta?.hostUid === loaded.uid;
      state.mode = state.isHost ? "multi-host" : "multi-guest";
      state.adult = Boolean(loaded.room.meta?.adult);
      state.alcohol = Boolean(loaded.room.meta?.alcohol);
      state.multiView = "lobby";
      state.history = [];

      activateRoomListener();
    } catch (error) {
      console.error("Restauration du salon impossible :", error);
      clearRoomSession();
      renderHome();
    }
  }

  AKFirebase.ready()
    .then(restoreMultiplayerSession)
    .catch(error => {
      console.error("Firebase n'a pas pu démarrer :", error);
    });
  /* =========================================================
     AK'GAMES V0.14 — MEGA PACK MULTIJOUEUR
     ========================================================= */

  const localRenderMegaSetup = renderMegaSetup;
  const localStartMegaGame = startMegaGame;

  function clearV014MultiTimer() {
    if (state.v014MultiTimer) window.clearInterval(state.v014MultiTimer);
    state.v014MultiTimer = null;
    state.v014MultiTimerToken = Number(state.v014MultiTimerToken || 0) + 1;
  }

  function startV014MultiTimer(endAt, totalSeconds, onDone) {
    clearV014MultiTimer();
    const token = state.v014MultiTimerToken;
    const tick = () => {
      if (token !== state.v014MultiTimerToken) return;
      const left = Math.max(0, Math.ceil((Number(endAt || 0) - AKFirebase.now()) / 1000));
      const node = document.querySelector("#v014MultiCountdown");
      if (node) node.textContent = String(left);
      const fill = document.querySelector("#v014MultiTimerFill");
      if (fill) fill.style.width = `${Math.max(0, Math.min(100, (left / Math.max(1, Number(totalSeconds || 1))) * 100))}%`;
      if (left <= 0) {
        clearV014MultiTimer();
        onDone?.();
      }
    };
    tick();
    state.v014MultiTimer = window.setInterval(tick, 250);
  }

  function megaMultiType(engine) {
    return `mega-${engine}`;
  }

  function megaMultiCurrentItem(gameState) {
    return gameState.items?.[Number(gameState.currentIndex || 0)] || null;
  }

  function megaMultiPlayer(id) {
    return state.players.find(player => player.id === id) || null;
  }

  function megaMultiExpectedVotes(gameState) {
    if (["mega-know", "mega-ranking"].includes(gameState.type)) return Math.max(0, state.players.length - 1);
    return state.players.length;
  }

  function megaMultiSetupControls(game) {
    const config = game.config;
    return `
      <section class="card setup-card-v07">
        <div class="form-group"><label for="multiMegaRounds">Nombre de manches</label><select id="multiMegaRounds" class="text-input">${v014RoundOptions(game.roundCount)}</select></div>
        ${config.engine === "bomb" ? `<div class="form-group top-gap"><label for="multiMegaDuration">Temps de la bombe</label><select id="multiMegaDuration" class="text-input">${[15,20,25,30,40].map(value => `<option value="${value}" ${game.durationSeconds === value ? "selected" : ""}>${value} secondes</option>`).join("")}</select></div>` : config.timer ? `<div class="form-group top-gap"><label for="multiMegaDuration">Chronomètre</label><select id="multiMegaDuration" class="text-input">${[30,45,60,90].map(value => `<option value="${value}" ${game.durationSeconds === value ? "selected" : ""}>${value} secondes</option>`).join("")}</select></div>` : ""}
      </section>`;
  }

  renderMegaSetup = function () {
    if (!isMultiplayer()) return localRenderMegaSetup();
    const game = state.megaGame;
    if (!game) return renderGames();
    clearV014MultiTimer();
    title.textContent = game.gameName;
    setBackVisible(true);
    screen.innerHTML = `
      <section class="game-cover game-cover-mega engine-${game.engine}"><span class="game-cover-icon">${game.config.icon}</span><div><small>MULTIJOUEUR SYNCHRONISÉ</small><h2>${escapeHtml(game.gameName)}</h2><p>${escapeHtml(game.config.description)}</p></div></section>
      ${megaMultiSetupControls(game)}
      ${game.config.drinkingGame ? `<div class="responsible-callout">💧 Petites gorgées seulement, alternatives sans alcool et droit de passer.</div>` : ""}
      ${game.config.adultOnly ? `<div class="notice">🔞 Partie adulte : consentement et droit de passer sans justification.</div>` : ""}
      ${state.isHost ? `<button id="startMultiMega" class="primary-btn full">Lancer sur tous les téléphones</button>` : renderMultiWaiting("En attente de l’hôte", "L’hôte règle la partie puis la lancera.", "👑")}`;
    document.querySelector("#multiMegaRounds")?.addEventListener("change", event => game.roundCount = Number(event.target.value));
    document.querySelector("#multiMegaDuration")?.addEventListener("change", event => game.durationSeconds = Number(event.target.value));
    document.querySelector("#startMultiMega")?.addEventListener("click", startMegaGame);
  };

  startMegaGame = async function () {
    if (!isMultiplayer()) return localStartMegaGame();
    if (!state.isHost || !state.megaGame) return;
    const game = state.megaGame;
    screen.innerHTML = `<div class="notice">Synchronisation de ${escapeHtml(game.gameName)}…</div>`;
    try {
      const pool = await loadJsonFile(game.config.data, `Impossible de charger ${game.gameName}.`);
      const items = shuffleArray(pool).slice(0, Math.min(game.roundCount, pool.length));
      const playerIds = state.players.map(player => player.id);
      const firstPlayerId = playerIds[0] || null;
      const type = megaMultiType(game.engine);
      const baseState = {
        type,
        phase: game.engine === "know" || game.engine === "ranking" ? "target" : game.engine === "bomb" ? "playing" : game.engine === "quiz" || game.engine === "scenario" ? "voting" : "turn",
        sessionGameId: createSessionGameId(type),
        items,
        currentIndex: 0,
        currentPlayerId: game.engine === "bomb" ? playerIds[Math.floor(Math.random() * Math.max(1, playerIds.length))] : firstPlayerId,
        targetId: firstPlayerId,
        scores: Object.fromEntries(playerIds.map(id => [id, 0])),
        rounds: {},
        currentResult: null,
        settings: {
          gameName: game.gameName,
          icon: game.config.icon,
          engine: game.engine,
          roundCount: items.length,
          durationSeconds: game.durationSeconds,
          privatePrompt: Boolean(game.config.privatePrompt),
          questionMode: Boolean(game.config.questionMode),
          drinkingGame: Boolean(game.config.drinkingGame)
        },
        bombEndsAt: game.engine === "bomb" ? AKFirebase.now() + Number(game.durationSeconds || 25) * 1000 : null,
        turnEndsAt: game.engine === "turn" && game.config.timer ? AKFirebase.now() + Number(game.durationSeconds || 45) * 1000 : null,
        startedAt: AKFirebase.now(),
        updatedAt: AKFirebase.now()
      };
      await AKFirebase.setGame(state.roomCode, { state: baseState, votes: null, answers: null, actions: null });
    } catch (error) {
      console.error(error);
      alert(error.message || "Impossible de lancer le jeu.");
      renderMegaSetup();
    }
  };

  function syncMultiMegaGame(room) {
    const gameState = room.game?.state;
    if (!gameState) return;
    const actions = room.game?.actions || {};
    const votes = room.game?.votes || {};
    const answers = room.game?.answers || {};
    clearV09MultiTimer();

    if (gameState.phase === "final") {
      renderMultiMegaFinal(gameState);
      return;
    }

    if (gameState.type === "mega-turn") {
      processMultiMegaTurn(gameState, actions);
      renderMultiMegaTurn(gameState, actions);
      return;
    }
    if (gameState.type === "mega-quiz") {
      processMultiMegaQuiz(gameState, votes);
      gameState.phase === "results" ? renderMultiMegaQuizResult(gameState) : renderMultiMegaQuizVote(gameState, votes);
      return;
    }
    if (gameState.type === "mega-scenario") {
      processMultiMegaScenario(gameState, votes);
      gameState.phase === "results" ? renderMultiMegaScenarioResult(gameState) : renderMultiMegaScenarioVote(gameState, votes);
      return;
    }
    if (gameState.type === "mega-bomb") {
      processMultiMegaBomb(gameState, actions);
      gameState.phase === "results" ? renderMultiMegaBombResult(gameState) : renderMultiMegaBomb(gameState, actions);
      return;
    }
    if (gameState.type === "mega-know") {
      processMultiMegaKnow(gameState, answers, votes);
      if (gameState.phase === "target") renderMultiMegaKnowTarget(gameState, answers);
      else if (gameState.phase === "guessing") renderMultiMegaKnowGuess(gameState, votes);
      else renderMultiMegaKnowResult(gameState);
      return;
    }
    if (gameState.type === "mega-ranking") {
      processMultiMegaRanking(gameState, answers, votes);
      if (gameState.phase === "target") renderMultiMegaRankingTarget(gameState, answers);
      else if (gameState.phase === "guessing") renderMultiMegaRankingGuess(gameState, votes);
      else renderMultiMegaRankingResult(gameState);
    }
  }

  function multiMegaProgress(gameState, label = "Manche") {
    const total = Math.max(1, gameState.items?.length || 1);
    const current = Math.min(total, Number(gameState.currentIndex || 0) + 1);
    return renderMultiProgress(current, total, label);
  }

  function processMultiMegaTurn(gameState, actions) {
    if (!state.isHost || gameState.phase !== "turn") return;
    const action = actions[gameState.currentPlayerId];
    const expired = Number(gameState.turnEndsAt || 0) > 0 && Number(gameState.turnEndsAt) <= AKFirebase.now();
    if (!action && !expired) return;
    const actionId = action?.id || `timer_${gameState.currentIndex}`;
    const lock = `mega_turn_${gameState.currentIndex}_${actionId}`;
    if (state.multiProcessingActionId === lock) return;
    state.multiProcessingActionId = lock;
    const success = Boolean(action?.payload?.success) && !expired;
    const scores = { ...(gameState.scores || {}) };
    if (success) scores[gameState.currentPlayerId] = Number(scores[gameState.currentPlayerId] || 0) + 1;
    const round = Number(gameState.currentIndex || 0);
    const next = round + 1;
    const finished = next >= (gameState.items || []).length;
    const nextPlayer = state.players[next % Math.max(1, state.players.length)]?.id || gameState.currentPlayerId;
    AKFirebase.updateGame(state.roomCode, {
      "state/phase": finished ? "final" : "turn",
      "state/currentIndex": finished ? round : next,
      "state/currentPlayerId": nextPlayer,
      "state/scores": scores,
      [`state/rounds/${round}`]: { playerId: gameState.currentPlayerId, success, itemId: megaMultiCurrentItem(gameState)?.id || "" },
      "state/turnEndsAt": finished ? null : gameState.settings?.durationSeconds && V014_GAME_CONFIGS[gameState.settings?.gameName]?.timer ? AKFirebase.now() + Number(gameState.settings.durationSeconds) * 1000 : null,
      "state/finishedAt": finished ? AKFirebase.now() : null,
      "state/updatedAt": AKFirebase.now(),
      actions: null
    }).finally(() => { state.multiProcessingActionId = null; });
  }

  function renderMultiMegaTurn(gameState, actions) {
    const item = megaMultiCurrentItem(gameState);
    const player = megaMultiPlayer(gameState.currentPlayerId);
    const isCurrent = state.currentUid === gameState.currentPlayerId;
    const privatePrompt = Boolean(gameState.settings?.privatePrompt);
    const pending = actions[state.currentUid];
    title.textContent = gameState.settings?.gameName || "Défi";
    setBackVisible(false);
    const prompt = item?.text || item?.question || item?.title || "Défi surprise";
    screen.innerHTML = `
      ${multiMegaProgress(gameState)}
      <section class="prompt-stage mega-prompt-stage">
        <div class="prompt-player"><span>${avatarById(player?.avatarId).emoji}</span><div><small>C’EST AU TOUR DE</small><strong>${escapeHtml(player?.name || "Joueur")}</strong></div></div>
        <span class="prompt-type-chip">${escapeHtml(gameState.settings?.icon || "🎯")} ${escapeHtml(gameState.settings?.gameName || "DÉFI").toUpperCase()}</span>
        <h2>${privatePrompt && !isCurrent ? "Sujet privé sur le téléphone du joueur" : escapeHtml(prompt)}</h2>
        ${gameState.turnEndsAt ? `<div class="mega-mini-timer"><strong id="v014MultiCountdown">${Math.max(0, Math.ceil((Number(gameState.turnEndsAt) - AKFirebase.now()) / 1000))}</strong><span>secondes</span><div class="progress-track"><div id="v014MultiTimerFill" class="progress-fill"></div></div></div>` : ""}
      </section>
      ${isCurrent ? pending ? renderMultiWaiting("Réponse envoyée", "Le tour suivant arrive automatiquement.", "✓") : `<section class="decision-grid"><button id="multiMegaSuccess" class="primary-btn">✓ Réussi</button><button id="multiMegaSkip" class="secondary-btn">Passer</button></section>` : renderMultiWaiting(`Tour de ${player?.name || "la personne"}`, privatePrompt ? "Le sujet reste privé jusqu’à la fin du tour." : "Encouragez, observez et décidez ensemble.", avatarById(player?.avatarId).emoji)}
      ${state.alcohol && !gameState.settings?.drinkingGame ? `<div class="alcohol-callout">🍻 Une carte passée peut valoir une petite gorgée, sans pression.</div>` : ""}`;
    document.querySelector("#multiMegaSuccess")?.addEventListener("click", async event => { event.currentTarget.disabled = true; await sendMultiAction("mega-turn", { success: true }).catch(() => event.currentTarget.disabled = false); });
    document.querySelector("#multiMegaSkip")?.addEventListener("click", async event => { event.currentTarget.disabled = true; await sendMultiAction("mega-turn", { success: false }).catch(() => event.currentTarget.disabled = false); });
    if (gameState.turnEndsAt) startV014MultiTimer(gameState.turnEndsAt, gameState.settings?.durationSeconds || 45, () => processMultiMegaTurn(gameState, actions));
  }

  function processMultiMegaQuiz(gameState, votes) {
    if (!state.isHost || gameState.phase !== "voting" || Object.keys(votes).length < state.players.length) return;
    const lock = `mega_quiz_${gameState.currentIndex}_${Object.keys(votes).length}`;
    if (state.multiProcessingActionId === lock) return;
    state.multiProcessingActionId = lock;
    const item = megaMultiCurrentItem(gameState);
    const correct = Number(item?.answer);
    const scores = { ...(gameState.scores || {}) };
    state.players.forEach(player => { if (Number(votes[player.id]) === correct) scores[player.id] = Number(scores[player.id] || 0) + 1; });
    const result = { itemId: item?.id || "", correct, votes: { ...votes } };
    AKFirebase.updateGame(state.roomCode, { "state/phase": "results", "state/currentResult": result, "state/scores": scores, [`state/rounds/${gameState.currentIndex}`]: result, "state/updatedAt": AKFirebase.now() }).finally(() => { state.multiProcessingActionId = null; });
  }

  function renderMultiMegaQuizVote(gameState, votes) {
    const item = megaMultiCurrentItem(gameState);
    const ownVote = votes[state.currentUid];
    title.textContent = gameState.settings?.gameName || "Quiz";
    setBackVisible(false);
    screen.innerHTML = `
      ${multiMegaProgress(gameState, "Question")}
      <section class="quiz-question-card"><span class="category-chip">${escapeHtml(gameState.settings?.icon || "🧠")} QUESTION</span><h2>${escapeHtml(item?.question || "")}</h2></section>
      ${ownVote !== undefined ? renderMultiWaiting("Réponse enregistrée", `${Object.keys(votes).length}/${state.players.length} réponses reçues.`, "🔒") : `<section class="mega-option-grid">${(item?.options || []).map((option, index) => `<button class="mega-option-btn" data-multi-mega-vote="${index}"><span>${String.fromCharCode(65 + index)}</span><strong>${escapeHtml(option)}</strong></button>`).join("")}</section>`}
      ${renderPlayerSubmissionStatus(votes, "A voté", "Réfléchit…")}`;
    document.querySelectorAll("[data-multi-mega-vote]").forEach(button => button.addEventListener("click", async () => {
      document.querySelectorAll("[data-multi-mega-vote]").forEach(node => node.disabled = true);
      try { await AKFirebase.writeOwnGameEntry(state.roomCode, "votes", Number(button.dataset.multiMegaVote)); }
      catch (error) { console.error(error); document.querySelectorAll("[data-multi-mega-vote]").forEach(node => node.disabled = false); }
    }));
  }

  function renderMultiMegaQuizResult(gameState) {
    const item = megaMultiCurrentItem(gameState);
    const result = gameState.currentResult || {};
    const correct = Number(result.correct);
    title.textContent = "Réponse";
    setBackVisible(false);
    screen.innerHTML = `
      ${multiMegaProgress(gameState, "Question")}
      <section class="reveal-stage reveal-v07"><span class="game-cover-icon">✅</span><h2>${escapeHtml(item?.options?.[correct] || "Réponse")}</h2><p>${escapeHtml(item?.explanation || "Réponse révélée.")}</p></section>
      <section class="answer-chip-wall">${state.players.map(player => `<span class="${Number(result.votes?.[player.id]) === correct ? "correct" : "wrong"}">${avatarById(player.avatarId).emoji} ${escapeHtml(player.name)} · ${escapeHtml(item?.options?.[result.votes?.[player.id]] || "-")}</span>`).join("")}</section>
      ${state.isHost ? `<button id="nextMultiMegaQuiz" class="primary-btn full">${Number(gameState.currentIndex || 0) + 1 >= (gameState.items || []).length ? "Voir le classement" : "Question suivante"}</button>` : renderMultiWaiting("En attente de l’hôte", "La prochaine question apparaîtra automatiquement.", "👑")}`;
    document.querySelector("#nextMultiMegaQuiz")?.addEventListener("click", event => advanceMultiMegaRound(event, gameState, "voting", ["votes", "answers", "actions"]));
  }

  function processMultiMegaScenario(gameState, votes) {
    if (!state.isHost || gameState.phase !== "voting" || Object.keys(votes).length < state.players.length) return;
    const lock = `mega_scenario_${gameState.currentIndex}_${Object.keys(votes).length}`;
    if (state.multiProcessingActionId === lock) return;
    state.multiProcessingActionId = lock;
    const counts = {};
    Object.values(votes).forEach(value => counts[value] = Number(counts[value] || 0) + 1);
    const max = Math.max(...Object.values(counts), 0);
    const winners = Object.keys(counts).map(Number).filter(index => counts[index] === max);
    const chosen = winners[Math.floor(Math.random() * Math.max(1, winners.length))] ?? 0;
    const scores = { ...(gameState.scores || {}) };
    state.players.forEach(player => { if (Number(votes[player.id]) === chosen) scores[player.id] = Number(scores[player.id] || 0) + 1; });
    const result = { itemId: megaMultiCurrentItem(gameState)?.id || "", chosen, counts, votes: { ...votes } };
    AKFirebase.updateGame(state.roomCode, { "state/phase": "results", "state/currentResult": result, "state/scores": scores, [`state/rounds/${gameState.currentIndex}`]: result, "state/updatedAt": AKFirebase.now() }).finally(() => { state.multiProcessingActionId = null; });
  }

  function renderMultiMegaScenarioVote(gameState, votes) {
    const item = megaMultiCurrentItem(gameState);
    const ownVote = votes[state.currentUid];
    title.textContent = "Alerte Rouge";
    setBackVisible(false);
    screen.innerHTML = `
      ${multiMegaProgress(gameState, "Scénario")}
      <section class="scenario-card"><span>🚨</span><small>${escapeHtml(item?.title || "ALERTE").toUpperCase()}</small><h2>${escapeHtml(item?.text || "")}</h2></section>
      ${ownVote !== undefined ? renderMultiWaiting("Décision verrouillée", `${Object.keys(votes).length}/${state.players.length} décisions reçues.`, "🔒") : `<section class="mega-option-grid">${(item?.options || []).map((option, index) => `<button class="mega-option-btn scenario-option" data-multi-scenario="${index}"><span>${index + 1}</span><strong>${escapeHtml(option.label)}</strong></button>`).join("")}</section>`}
      ${renderPlayerSubmissionStatus(votes, "A choisi", "Décide…")}`;
    document.querySelectorAll("[data-multi-scenario]").forEach(button => button.addEventListener("click", async () => {
      document.querySelectorAll("[data-multi-scenario]").forEach(node => node.disabled = true);
      try { await AKFirebase.writeOwnGameEntry(state.roomCode, "votes", Number(button.dataset.multiScenario)); }
      catch (error) { console.error(error); document.querySelectorAll("[data-multi-scenario]").forEach(node => node.disabled = false); }
    }));
  }

  function renderMultiMegaScenarioResult(gameState) {
    const item = megaMultiCurrentItem(gameState);
    const result = gameState.currentResult || {};
    title.textContent = "Conséquence";
    screen.innerHTML = `
      ${multiMegaProgress(gameState, "Scénario")}
      <section class="reveal-stage reveal-v07 scenario-reveal"><span class="game-cover-icon">🚨</span><h2>${escapeHtml(item?.options?.[result.chosen]?.label || "Décision prise")}</h2><p>${escapeHtml(item?.options?.[result.chosen]?.outcome || "L’histoire continue.")}</p></section>
      <section class="vote-distribution">${(item?.options || []).map((option, index) => `<div><strong>${escapeHtml(option.label)}</strong><span>${Number(result.counts?.[index] || 0)} vote${Number(result.counts?.[index] || 0) > 1 ? "s" : ""}</span></div>`).join("")}</section>
      ${state.isHost ? `<button id="nextMultiScenario" class="primary-btn full">${Number(gameState.currentIndex || 0) + 1 >= (gameState.items || []).length ? "Voir le classement" : "Scénario suivant"}</button>` : renderMultiWaiting("En attente de l’hôte", "La suite va apparaître.", "👑")}`;
    document.querySelector("#nextMultiScenario")?.addEventListener("click", event => advanceMultiMegaRound(event, gameState, "voting", ["votes", "answers", "actions"]));
  }

  function processMultiMegaBomb(gameState, actions) {
    if (!state.isHost || gameState.phase !== "playing") return;
    const action = actions[gameState.currentPlayerId];
    const expired = Number(gameState.bombEndsAt || 0) <= AKFirebase.now();
    if (!action && !expired) return;
    const lock = `mega_bomb_${gameState.currentIndex}_${action?.id || "timer"}`;
    if (state.multiProcessingActionId === lock) return;
    state.multiProcessingActionId = lock;
    if (action?.payload?.pass && !expired) {
      const index = state.players.findIndex(player => player.id === gameState.currentPlayerId);
      const next = state.players[(index + 1) % Math.max(1, state.players.length)]?.id || gameState.currentPlayerId;
      AKFirebase.updateGame(state.roomCode, { "state/currentPlayerId": next, "state/updatedAt": AKFirebase.now(), actions: null }).finally(() => { state.multiProcessingActionId = null; });
      return;
    }
    const loserId = gameState.currentPlayerId;
    const scores = { ...(gameState.scores || {}) };
    state.players.filter(player => player.id !== loserId).forEach(player => scores[player.id] = Number(scores[player.id] || 0) + 1);
    const result = { loserId, itemId: megaMultiCurrentItem(gameState)?.id || "" };
    AKFirebase.updateGame(state.roomCode, { "state/phase": "results", "state/currentResult": result, "state/scores": scores, [`state/rounds/${gameState.currentIndex}`]: result, "state/bombEndsAt": null, "state/updatedAt": AKFirebase.now(), actions: null }).finally(() => { state.multiProcessingActionId = null; });
  }

  function renderMultiMegaBomb(gameState, actions) {
    const item = megaMultiCurrentItem(gameState);
    const player = megaMultiPlayer(gameState.currentPlayerId);
    const isCurrent = state.currentUid === gameState.currentPlayerId;
    const pending = actions[state.currentUid];
    title.textContent = "La Bombe";
    setBackVisible(false);
    screen.innerHTML = `
      ${multiMegaProgress(gameState, "Bombe")}
      <section class="bomb-stage"><div class="bomb-icon">💣</div><div class="bomb-countdown"><strong id="v014MultiCountdown">${Math.max(0, Math.ceil((Number(gameState.bombEndsAt || 0) - AKFirebase.now()) / 1000))}</strong><span>secondes</span></div><span class="category-chip">${avatarById(player?.avatarId).emoji} ${escapeHtml(player?.name || "Joueur").toUpperCase()}</span><h2>${escapeHtml(item?.category || "Catégorie")}</h2><p>${isCurrent ? "Donne une réponse, puis passe la bombe." : `La bombe est chez ${escapeHtml(player?.name || "la personne")}.`}</p><div class="progress-track"><div id="v014MultiTimerFill" class="progress-fill"></div></div></section>
      ${isCurrent ? pending ? renderMultiWaiting("Action envoyée", "La bombe change de téléphone…", "💣") : `<section class="decision-grid"><button id="multiPassBomb" class="primary-btn">Répondu, je passe →</button><button id="multiBoomBomb" class="danger-btn">💥 BOOM</button></section>` : renderMultiWaiting("Reste prêt·e", "Ton téléphone s’activera quand la bombe arrivera chez toi.", "⏳")}`;
    document.querySelector("#multiPassBomb")?.addEventListener("click", async event => { event.currentTarget.disabled = true; await sendMultiAction("mega-bomb", { pass: true }).catch(() => event.currentTarget.disabled = false); });
    document.querySelector("#multiBoomBomb")?.addEventListener("click", async event => { event.currentTarget.disabled = true; await sendMultiAction("mega-bomb", { explode: true }).catch(() => event.currentTarget.disabled = false); });
    startV014MultiTimer(gameState.bombEndsAt, gameState.settings?.durationSeconds || 25, () => processMultiMegaBomb(gameState, actions));
  }

  function renderMultiMegaBombResult(gameState) {
    clearV014MultiTimer();
    const loser = megaMultiPlayer(gameState.currentResult?.loserId);
    title.textContent = "BOOM !";
    screen.innerHTML = `
      ${multiMegaProgress(gameState, "Bombe")}
      <section class="winner-stage bomb-result-stage"><div class="winner-crown">💥</div><div class="giant-avatar">${avatarById(loser?.avatarId).emoji}</div><h2>La bombe explose chez ${escapeHtml(loser?.name || "un joueur")}</h2><p>Toutes les autres personnes marquent un point.</p></section>
      ${state.alcohol ? `<div class="alcohol-callout">🍻 Petite gorgée de consolation, ou une gorgée d’eau.</div>` : ""}
      ${state.isHost ? `<button id="nextMultiBomb" class="primary-btn full">${Number(gameState.currentIndex || 0) + 1 >= (gameState.items || []).length ? "Voir le classement" : "Nouvelle bombe"}</button>` : renderMultiWaiting("En attente de l’hôte", "Une nouvelle bombe va être lancée.", "👑")}`;
    document.querySelector("#nextMultiBomb")?.addEventListener("click", async event => {
      event.currentTarget.disabled = true;
      const next = Number(gameState.currentIndex || 0) + 1;
      const finished = next >= (gameState.items || []).length;
      const ids = state.players.map(player => player.id);
      try { await AKFirebase.updateGame(state.roomCode, {
        "state/phase": finished ? "final" : "playing",
        "state/currentIndex": finished ? gameState.currentIndex : next,
        "state/currentResult": null,
        "state/currentPlayerId": ids[Math.floor(Math.random() * Math.max(1, ids.length))] || null,
        "state/bombEndsAt": finished ? null : AKFirebase.now() + Number(gameState.settings?.durationSeconds || 25) * 1000,
        "state/finishedAt": finished ? AKFirebase.now() : null,
        "state/updatedAt": AKFirebase.now(), actions: null, votes: null, answers: null
      }); } catch (error) { console.error(error); event.currentTarget.disabled = false; }
    });
  }

  function processMultiMegaKnow(gameState, answers, votes) {
    if (!state.isHost) return;
    const targetAnswer = answers[gameState.targetId];
    if (gameState.phase === "target" && targetAnswer !== undefined) {
      const lock = `mega_know_target_${gameState.currentIndex}`;
      if (state.multiProcessingActionId === lock) return;
      state.multiProcessingActionId = lock;
      AKFirebase.updateGame(state.roomCode, { "state/phase": "guessing", "state/secretAnswer": Number(targetAnswer), "state/updatedAt": AKFirebase.now(), votes: null }).finally(() => { state.multiProcessingActionId = null; });
      return;
    }
    if (gameState.phase !== "guessing" || Object.keys(votes).length < megaMultiExpectedVotes(gameState)) return;
    const lock = `mega_know_guess_${gameState.currentIndex}_${Object.keys(votes).length}`;
    if (state.multiProcessingActionId === lock) return;
    state.multiProcessingActionId = lock;
    const secret = Number(gameState.secretAnswer);
    const correctIds = Object.entries(votes).filter(([, value]) => Number(value) === secret).map(([id]) => id);
    const scores = { ...(gameState.scores || {}) };
    correctIds.forEach(id => scores[id] = Number(scores[id] || 0) + 1);
    if (correctIds.length >= Math.ceil(Math.max(1, state.players.length - 1) / 2)) scores[gameState.targetId] = Number(scores[gameState.targetId] || 0) + 1;
    const result = { targetId: gameState.targetId, secretAnswer: secret, correctIds, votes: { ...votes }, itemId: megaMultiCurrentItem(gameState)?.id || "" };
    AKFirebase.updateGame(state.roomCode, { "state/phase": "results", "state/currentResult": result, "state/scores": scores, [`state/rounds/${gameState.currentIndex}`]: result, "state/updatedAt": AKFirebase.now() }).finally(() => { state.multiProcessingActionId = null; });
  }

  function renderMultiMegaKnowTarget(gameState, answers) {
    const item = megaMultiCurrentItem(gameState);
    const target = megaMultiPlayer(gameState.targetId);
    const isTarget = state.currentUid === gameState.targetId;
    const answered = answers[state.currentUid] !== undefined;
    title.textContent = "Tu me connais ou pas ?";
    screen.innerHTML = `
      ${multiMegaProgress(gameState, "Question")}
      ${isTarget ? answered ? renderMultiWaiting("Réponse enregistrée", "Les autres vont maintenant essayer de te deviner.", "🔒") : `<section class="quiz-question-card"><span class="category-chip">💭 TA VRAIE RÉPONSE</span><h2>${escapeHtml(item?.question || "")}</h2></section><section class="mega-option-grid">${(item?.options || []).map((option, index) => `<button class="mega-option-btn" data-multi-know-target="${index}"><span>${index + 1}</span><strong>${escapeHtml(option)}</strong></button>`).join("")}</section>` : renderMultiWaiting(`${target?.name || "La personne"} répond en secret`, "Ton écran s’ouvrira dès que sa réponse sera verrouillée.", avatarById(target?.avatarId).emoji)}`;
    document.querySelectorAll("[data-multi-know-target]").forEach(button => button.addEventListener("click", async () => {
      document.querySelectorAll("[data-multi-know-target]").forEach(node => node.disabled = true);
      try { await AKFirebase.writeOwnGameEntry(state.roomCode, "answers", Number(button.dataset.multiKnowTarget)); }
      catch (error) { console.error(error); document.querySelectorAll("[data-multi-know-target]").forEach(node => node.disabled = false); }
    }));
  }

  function renderMultiMegaKnowGuess(gameState, votes) {
    const item = megaMultiCurrentItem(gameState);
    const target = megaMultiPlayer(gameState.targetId);
    const isTarget = state.currentUid === gameState.targetId;
    const voted = votes[state.currentUid] !== undefined;
    title.textContent = "Tu me connais ou pas ?";
    screen.innerHTML = `
      ${multiMegaProgress(gameState, "Question")}
      ${isTarget ? renderMultiWaiting("Ne donne aucun indice", `${Object.keys(votes).length}/${Math.max(1, state.players.length - 1)} pronostics reçus.`, avatarById(target?.avatarId).emoji) : voted ? renderMultiWaiting("Pronostic verrouillé", `${Object.keys(votes).length}/${Math.max(1, state.players.length - 1)} pronostics reçus.`, "🔒") : `<section class="quiz-question-card"><span class="category-chip">À PROPOS DE ${escapeHtml(target?.name || "LA PERSONNE").toUpperCase()}</span><h2>${escapeHtml(item?.question || "")}</h2></section><section class="mega-option-grid">${(item?.options || []).map((option, index) => `<button class="mega-option-btn" data-multi-know-guess="${index}"><span>${index + 1}</span><strong>${escapeHtml(option)}</strong></button>`).join("")}</section>`}`;
    document.querySelectorAll("[data-multi-know-guess]").forEach(button => button.addEventListener("click", async () => {
      document.querySelectorAll("[data-multi-know-guess]").forEach(node => node.disabled = true);
      try { await AKFirebase.writeOwnGameEntry(state.roomCode, "votes", Number(button.dataset.multiKnowGuess)); }
      catch (error) { console.error(error); document.querySelectorAll("[data-multi-know-guess]").forEach(node => node.disabled = false); }
    }));
  }

  function renderMultiMegaKnowResult(gameState) {
    const item = megaMultiCurrentItem(gameState);
    const result = gameState.currentResult || {};
    const target = megaMultiPlayer(result.targetId || gameState.targetId);
    title.textContent = "Réponse révélée";
    screen.innerHTML = `
      ${multiMegaProgress(gameState, "Question")}
      <section class="reveal-stage reveal-v07"><span class="game-cover-icon">💭</span><h2>${escapeHtml(target?.name || "La personne")} choisit : ${escapeHtml(item?.options?.[result.secretAnswer] || "")}</h2><p>${result.correctIds?.length || 0}/${Math.max(1, state.players.length - 1)} personne${(result.correctIds?.length || 0) > 1 ? "s" : ""} avait vu juste.</p></section>
      <section class="answer-chip-wall">${state.players.filter(player => player.id !== target?.id).map(player => `<span class="${result.correctIds?.includes(player.id) ? "correct" : "wrong"}">${avatarById(player.avatarId).emoji} ${escapeHtml(player.name)} · ${escapeHtml(item?.options?.[result.votes?.[player.id]] || "-")}</span>`).join("")}</section>
      ${state.isHost ? `<button id="nextMultiKnow" class="primary-btn full">${Number(gameState.currentIndex || 0) + 1 >= (gameState.items || []).length ? "Voir le classement" : "Personne suivante"}</button>` : renderMultiWaiting("En attente de l’hôte", "La prochaine personne va répondre.", "👑")}`;
    document.querySelector("#nextMultiKnow")?.addEventListener("click", event => advanceMultiMegaRound(event, gameState, "target", ["votes", "answers", "actions"], { targetId: state.players[(Number(gameState.currentIndex || 0) + 1) % Math.max(1, state.players.length)]?.id || null, secretAnswer: null }));
  }

  function processMultiMegaRanking(gameState, answers, votes) {
    if (!state.isHost) return;
    const targetAnswer = answers[gameState.targetId];
    if (gameState.phase === "target" && Array.isArray(targetAnswer?.ranking) && targetAnswer.ranking.length) {
      const lock = `mega_rank_target_${gameState.currentIndex}`;
      if (state.multiProcessingActionId === lock) return;
      state.multiProcessingActionId = lock;
      AKFirebase.updateGame(state.roomCode, { "state/phase": "guessing", "state/secretRanking": targetAnswer.ranking, "state/updatedAt": AKFirebase.now(), votes: null }).finally(() => { state.multiProcessingActionId = null; });
      return;
    }
    if (gameState.phase !== "guessing" || Object.keys(votes).length < megaMultiExpectedVotes(gameState)) return;
    const lock = `mega_rank_guess_${gameState.currentIndex}_${Object.keys(votes).length}`;
    if (state.multiProcessingActionId === lock) return;
    state.multiProcessingActionId = lock;
    const top = Number(gameState.secretRanking?.[0]);
    const correctIds = Object.entries(votes).filter(([, value]) => Number(value) === top).map(([id]) => id);
    const scores = { ...(gameState.scores || {}) };
    correctIds.forEach(id => scores[id] = Number(scores[id] || 0) + 2);
    if (correctIds.length) scores[gameState.targetId] = Number(scores[gameState.targetId] || 0) + 1;
    const result = { targetId: gameState.targetId, ranking: gameState.secretRanking || [], correctIds, votes: { ...votes }, itemId: megaMultiCurrentItem(gameState)?.id || "" };
    AKFirebase.updateGame(state.roomCode, { "state/phase": "results", "state/currentResult": result, "state/scores": scores, [`state/rounds/${gameState.currentIndex}`]: result, "state/updatedAt": AKFirebase.now() }).finally(() => { state.multiProcessingActionId = null; });
  }

  function renderMultiMegaRankingTarget(gameState, answers) {
    const item = megaMultiCurrentItem(gameState);
    const target = megaMultiPlayer(gameState.targetId);
    const isTarget = state.currentUid === gameState.targetId;
    const answered = answers[state.currentUid]?.ranking;
    title.textContent = "Le Classement secret";
    if (!isTarget) {
      screen.innerHTML = `${multiMegaProgress(gameState, "Classement")}${renderMultiWaiting(`${target?.name || "La personne"} crée son classement`, "Tu devras ensuite deviner son numéro un.", avatarById(target?.avatarId).emoji)}`;
      return;
    }
    if (answered) {
      screen.innerHTML = `${multiMegaProgress(gameState, "Classement")}${renderMultiWaiting("Classement verrouillé", "Les autres vont maintenant faire leur pronostic.", "🔒")}`;
      return;
    }
    const draftKey = `v014_rank_${gameState.sessionGameId}_${gameState.currentIndex}`;
    let draft = [];
    try { draft = JSON.parse(sessionStorage.getItem(draftKey) || "[]"); } catch { draft = []; }
    const available = (item?.items || []).map((_, index) => index).filter(index => !draft.includes(index));
    screen.innerHTML = `
      ${multiMegaProgress(gameState, "Classement")}
      <section class="card"><h2 class="section-title">${escapeHtml(item?.title || "Classement")}</h2><p class="helper">Clique dans l’ordre, de ton numéro un au dernier.</p></section>
      <section class="secret-ranking-builder"><div class="ranking-picked">${draft.map((index, position) => `<div><span>${position + 1}</span><strong>${escapeHtml(item?.items?.[index] || "")}</strong></div>`).join("") || `<div class="notice">Commence par ton numéro un.</div>`}</div><div class="ranking-available">${available.map(index => `<button class="secondary-btn" data-multi-rank-pick="${index}">${escapeHtml(item.items[index])}</button>`).join("")}</div></section>
      <div class="toolbar"><button id="multiRankUndo" class="secondary-btn" ${draft.length ? "" : "disabled"}>↶ Annuler</button><button id="multiRankConfirm" class="primary-btn" ${draft.length === (item?.items || []).length ? "" : "disabled"}>Valider</button></div>`;
    document.querySelectorAll("[data-multi-rank-pick]").forEach(button => button.addEventListener("click", () => { draft.push(Number(button.dataset.multiRankPick)); sessionStorage.setItem(draftKey, JSON.stringify(draft)); renderMultiMegaRankingTarget(gameState, answers); }));
    document.querySelector("#multiRankUndo")?.addEventListener("click", () => { draft.pop(); sessionStorage.setItem(draftKey, JSON.stringify(draft)); renderMultiMegaRankingTarget(gameState, answers); });
    document.querySelector("#multiRankConfirm")?.addEventListener("click", async event => {
      event.currentTarget.disabled = true;
      try { await AKFirebase.writeOwnGameEntry(state.roomCode, "answers", { ranking: draft, submittedAt: AKFirebase.now() }); sessionStorage.removeItem(draftKey); }
      catch (error) { console.error(error); event.currentTarget.disabled = false; }
    });
  }

  function renderMultiMegaRankingGuess(gameState, votes) {
    const item = megaMultiCurrentItem(gameState);
    const target = megaMultiPlayer(gameState.targetId);
    const isTarget = state.currentUid === gameState.targetId;
    const voted = votes[state.currentUid] !== undefined;
    title.textContent = "Devine le numéro un";
    screen.innerHTML = `
      ${multiMegaProgress(gameState, "Classement")}
      ${isTarget ? renderMultiWaiting("Garde ton classement secret", `${Object.keys(votes).length}/${Math.max(1, state.players.length - 1)} pronostics reçus.`, "🤫") : voted ? renderMultiWaiting("Pronostic verrouillé", `${Object.keys(votes).length}/${Math.max(1, state.players.length - 1)} pronostics reçus.`, "🔒") : `<section class="card"><h2 class="section-title">${escapeHtml(item?.title || "Classement")}</h2><p class="helper">Quel est le numéro un de ${escapeHtml(target?.name || "la personne")} ?</p></section><section class="mega-option-grid">${(item?.items || []).map((option, index) => `<button class="mega-option-btn" data-multi-rank-guess="${index}"><span>${index + 1}</span><strong>${escapeHtml(option)}</strong></button>`).join("")}</section>`}`;
    document.querySelectorAll("[data-multi-rank-guess]").forEach(button => button.addEventListener("click", async () => {
      document.querySelectorAll("[data-multi-rank-guess]").forEach(node => node.disabled = true);
      try { await AKFirebase.writeOwnGameEntry(state.roomCode, "votes", Number(button.dataset.multiRankGuess)); }
      catch (error) { console.error(error); document.querySelectorAll("[data-multi-rank-guess]").forEach(node => node.disabled = false); }
    }));
  }

  function renderMultiMegaRankingResult(gameState) {
    const item = megaMultiCurrentItem(gameState);
    const result = gameState.currentResult || {};
    const target = megaMultiPlayer(result.targetId || gameState.targetId);
    title.textContent = "Classement révélé";
    screen.innerHTML = `
      ${multiMegaProgress(gameState, "Classement")}
      <section class="winner-stage winner-stage-v07"><div class="winner-crown">🏅</div><h2>Le classement de ${escapeHtml(target?.name || "la personne")}</h2><p>${result.correctIds?.length || 0} personne${(result.correctIds?.length || 0) > 1 ? "s" : ""} avait deviné le numéro un.</p></section>
      <section class="revealed-ranking">${(result.ranking || []).map((index, position) => `<div class="ranking-row"><span class="ranking-position">${position + 1}</span><strong>${escapeHtml(item?.items?.[index] || "")}</strong>${position === 0 ? `<span class="badge green">favori</span>` : ""}</div>`).join("")}</section>
      ${state.isHost ? `<button id="nextMultiRanking" class="primary-btn full">${Number(gameState.currentIndex || 0) + 1 >= (gameState.items || []).length ? "Voir le classement" : "Classement suivant"}</button>` : renderMultiWaiting("En attente de l’hôte", "Le prochain classement va commencer.", "👑")}`;
    document.querySelector("#nextMultiRanking")?.addEventListener("click", event => advanceMultiMegaRound(event, gameState, "target", ["votes", "answers", "actions"], { targetId: state.players[(Number(gameState.currentIndex || 0) + 1) % Math.max(1, state.players.length)]?.id || null, secretRanking: null }));
  }

  async function advanceMultiMegaRound(event, gameState, nextPhase, collections, extras = {}) {
    event.currentTarget.disabled = true;
    clearV014MultiTimer();
    const next = Number(gameState.currentIndex || 0) + 1;
    const finished = next >= (gameState.items || []).length;
    const updates = {
      "state/phase": finished ? "final" : nextPhase,
      "state/currentIndex": finished ? gameState.currentIndex : next,
      "state/currentResult": null,
      "state/finishedAt": finished ? AKFirebase.now() : null,
      "state/updatedAt": AKFirebase.now()
    };
    if (!finished) Object.entries(extras || {}).forEach(([key, value]) => updates[`state/${key}`] = value);
    (collections || []).forEach(collection => updates[collection] = null);
    try { await AKFirebase.updateGame(state.roomCode, updates); }
    catch (error) { console.error(error); event.currentTarget.disabled = false; alert("Impossible de passer à la suite."); }
  }

  function renderMultiMegaFinal(gameState) {
    clearV014MultiTimer();
    const ranking = [...state.players].sort((a, b) => Number(gameState.scores?.[b.id] || 0) - Number(gameState.scores?.[a.id] || 0));
    const best = Number(gameState.scores?.[ranking[0]?.id] || 0);
    const winners = ranking.filter(player => Number(gameState.scores?.[player.id] || 0) === best && best > 0);
    title.textContent = "Classement final";
    setBackVisible(false);
    screen.innerHTML = `
      <section class="winner-stage winner-stage-v07 mega-final-stage"><div class="winner-crown">${escapeHtml(gameState.settings?.icon || "🎮")}🏆</div><h2>${winners.length ? winners.map(player => escapeHtml(player.name)).join(" et ") : "Partie terminée"}</h2><p>${winners.length ? `${winners.length > 1 ? "terminent" : "termine"} en tête de ${escapeHtml(gameState.settings?.gameName || "la partie")}.` : "Toutes les manches sont terminées."}</p></section>
      <section class="final-ranking">${ranking.map((player, index) => `<div class="ranking-row"><span class="ranking-position">${index + 1}</span><span class="result-avatar">${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong><span>${Number(gameState.scores?.[player.id] || 0)} pts</span></div>`).join("")}</section>
      ${renderPostGameContinuation(gameState)}`;
    ensureEveningResult(gameState);
    bindPostGameContinuation(gameState);
  }

  renderGames = function () {
    if (!isMultiplayer()) return localRenderGames();
    clearV09MultiTimer();
    clearV014MultiTimer();
    const category = categories.find(item => item.id === state.currentCategory);
    title.textContent = category.name;
    setBackVisible(true);
    screen.innerHTML = `
      <section class="catalog-intro catalog-intro-v014"><span>${category.emoji}</span><div><small>CATÉGORIE</small><strong>${escapeHtml(category.name)}</strong><p>${escapeHtml(category.description)}</p></div><b>${category.games.filter(game => V014_READY_GAMES.has(game)).length} jeux</b></section>
      <section class="game-list game-list-v07">${category.games.map(game => {
        const disabled = game === "Blind Test";
        const ready = V014_READY_GAMES.has(game);
        const isNew = V014_NEW_GAMES.has(game);
        const icon = V014_GAME_ICONS[game] || "🎲";
        return `<button class="game-card game-card-v07 ${disabled ? "disabled" : ""} ${isNew ? "game-card-new game-card-mega" : ""}" ${disabled ? "disabled" : ""} data-game="${escapeHtml(game)}"><span class="game-card-icon">${icon}</span><span class="game-card-copy"><strong>${escapeHtml(game)} ${isNew ? `<span class="new-ribbon">MEGA PACK</span>` : ""}</strong><span class="helper">${disabled ? "Audio à intégrer séparément" : ready ? "Jouable chacun sur son téléphone" : "À intégrer"}</span><span class="game-meta">${ready ? `<span class="badge green">📲 multijoueur</span>` : `<span class="badge">bientôt</span>`}${state.alcohol && ready ? `<span class="badge green">🍻 option alcool</span>` : ""}${V014_GAME_CONFIGS[game]?.adultOnly || game.includes("+18") ? `<span class="badge orange">🔞 adulte</span>` : ""}</span></span><span class="game-card-chevron">›</span></button>`;
      }).join("")}</section>`;
    document.querySelectorAll("[data-game]:not([disabled])").forEach(button => button.addEventListener("click", () => {
      const game = button.dataset.game;
      if (V014_GAME_CONFIGS[game]) { if (V014_GAME_CONFIGS[game].adultOnly && !state.adult) return alert("Active le contenu adulte pour ce jeu."); state.multiView = "mega-setup"; pushScreen("games"); resetMegaGame(game); renderMegaSetup(); return; }
      if (game === "Qui de nous ?") { state.multiView = "who-us-setup"; pushScreen("games"); resetWhoUsState(); renderWhoUsSetup(); return; }
      if (game === "Le premier qui rit a perdu") { state.multiView = "laugh-duel-setup"; pushScreen("games"); resetLaughDuelState(); renderLaughDuelSetup(); return; }
      if (game === "Qui ment le mieux ?") { if (state.players.length < 3) return alert("Ce jeu nécessite au moins 3 joueurs."); state.multiView = "best-liar-setup"; pushScreen("games"); resetBestLiarState(); renderBestLiarSetup(); return; }
      if (game === "Action ou Vérité" || game === "Action ou Vérité +18") { state.multiView = "action-truth-setup"; pushScreen("games"); resetActionTruthState(game.includes("+18")); renderActionTruthSetup(); return; }
      if (game === "Je n’ai jamais" || game === "Je n’ai jamais +18") { state.multiView = "ambiance-poll-setup"; pushScreen("games"); resetAmbiancePollState("never", game.includes("+18")); renderAmbiancePollSetup(); return; }
      if (game === "Tu préfères" || game === "Tu préfères +18") { state.multiView = "ambiance-poll-setup"; pushScreen("games"); resetAmbiancePollState("would", game.includes("+18")); renderAmbiancePollSetup(); return; }
      if (game === "Même cerveau") { state.multiView = "same-brain-setup"; pushScreen("games"); resetSameBrainState(); renderSameBrainSetup(); return; }
      if (game === "Minorité") { state.multiView = "minority-setup"; pushScreen("games"); resetMinorityState(); renderMinoritySetup(); return; }
      if (game === "Qui a répondu ça ?") { if (state.players.length < 3) return alert("Ce jeu nécessite au moins 3 joueurs."); state.multiView = "who-answered-setup"; pushScreen("games"); resetWhoAnsweredState(); renderWhoAnsweredSetup(); return; }
      if (game === "L’Imposteur sait presque tout") { if (state.players.length < 3) return alert("Ce jeu nécessite au moins 3 joueurs."); state.multiView = "almost-impostor-setup"; pushScreen("games"); resetAlmostImpostorState(); renderAlmostImpostorSetup(); return; }
      if (game === "Le Faux Expert") { if (state.players.length < 3) return alert("Ce jeu nécessite au moins 3 joueurs."); state.multiView = "fake-expert-setup"; pushScreen("games"); resetFakeExpertState(); renderFakeExpertSetup(); return; }
      if (game === "Qui suis-je ?") { state.multiView = "who-am-i-setup"; pushScreen("games"); resetWhoAmIState(); renderWhoAmISetup(); return; }
      renderMultiNotReady(game);
    }));
  };


  const v014LegacyRandomMultiplayerGame = launchRandomMultiplayerGame;
  launchRandomMultiplayerGame = async function () {
    if (!state.isHost || state.players.length < 2) return;

    const megaChoices = Object.entries(V014_GAME_CONFIGS)
      .filter(([, config]) => !config.adultOnly || state.adult)
      .filter(([, config]) => !config.drinkingGame || state.alcohol)
      .map(([gameName, config]) => ({
        type: megaMultiType(config.engine),
        config: {
          gameName,
          roundCount: Number(config.defaultRounds || 10),
          durationSeconds: Number(config.timer || 45)
        }
      }));

    const lastType = state.roomData?.session?.lastGame?.type;
    const lastName = state.roomData?.session?.lastGame?.gameName;
    const filtered = megaChoices.filter(choice => choice.type !== lastType || choice.config.gameName !== lastName);
    const choices = filtered.length ? filtered : megaChoices;

    // Un tirage sur trois conserve aussi les jeux historiques afin que toute la ludothèque circule.
    if (!choices.length || Math.random() < .34) {
      return v014LegacyRandomMultiplayerGame();
    }

    const selected = choices[Math.floor(Math.random() * choices.length)];
    await launchReplayDescriptor(selected);
  };


})();
