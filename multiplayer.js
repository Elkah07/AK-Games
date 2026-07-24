
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

  const SESSION_KEY = "akgames_multiplayer_session_v1";

  const localRenderPlayerForm = renderPlayerForm;
  const localRenderLobby = renderLobby;
  const localRenderGames = renderGames;
  const localStartWhoUsGame = startWhoUsGame;
  const localStartLaughDuel = startLaughDuel;
  const localStartBestLiarGame = startBestLiarGame;

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
        joinedAt: value.joinedAt || 0
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

        if (
          state.mode === "multi-guest"
          || state.multiView === "lobby"
          || state.multiView === "who-us-game"
          || state.multiView === "best-liar-game"
          || state.multiView === "laugh-duel-game"
        ) {
          clearMultiLobbyTimer();
          state.multiView = "lobby";
          state.multiRenderKey = null;
          state.quiDeNous = null;
          state.bestLiar = null;
          state.laughDuel = null;
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
          <button id="openMultiplayerGames" class="primary-btn" ${state.players.length < 2 ? "disabled" : ""}>
            ${state.players.length < 2 ? "En attente d'un autre joueur…" : "🎮 Choisir un jeu"}
          </button>
          <button id="randomMultiplayerGame" class="secondary-btn" ${state.players.length < 2 ? "disabled" : ""}>
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
        if (state.players.length < 2) return;
        state.multiView = "browse";
        state.history = ["lobby"];
        renderPlayChoice();
      });
    }

    document.querySelector("#randomMultiplayerGame")?.addEventListener("click", async event => {
      if (state.players.length < 2) return;
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
          <input id="roomCode" class="text-input room-code-input" maxlength="7" autocomplete="off" placeholder="AK-7F3K">
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

      input.value = value.length ? `AK-${value.slice(0, 4)}` : "";
    });

    document.querySelector("#joinBtn").addEventListener("click", async () => {
      const code = input.value;

      if (AKFirebase.normalizeCode(code).length !== 4) {
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
      "Qui ment le mieux ?"
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
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  async function sendMultiAction(type, payload = {}) {
    await AKFirebase.writeOwnGameEntry(state.roomCode, "actions", {
      id: randomActionId(type),
      type,
      payload,
      createdAt: Date.now()
    });
  }

  function playerById(id) {
    return state.players.find(player => player.id === id) || null;
  }

  /* =========================================================
     AK'GAMES V0.6 — SOIRÉE CONTINUE
     ========================================================= */

  function createSessionGameId(type) {
    return `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
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
      "laugh-duel": { name: "Le premier qui rit a perdu", icon: "😂" }
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

    const presentation = gamePresentation(gameState.type);
    const resultId = gameState.sessionGameId || `${gameState.type}_${Number(gameState.startedAt || 0)}`;
    let result;

    if (gameState.type === "who-us") {
      result = buildWhoUsSessionSummary(gameState);
    } else if (gameState.type === "best-liar") {
      result = buildBestLiarSessionSummary(gameState);
    } else if (gameState.type === "laugh-duel") {
      result = buildLaughSessionSummary(gameState);
    } else {
      return null;
    }

    return {
      id: resultId,
      gameType: gameState.type,
      gameName: presentation.name,
      icon: presentation.icon,
      endedAt: Number(gameState.finishedAt || Date.now()),
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

    const availableTypes = ["who-us", "laugh-duel"];
    if (state.players.length >= 3) {
      availableTypes.push("best-liar");
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
          startedAt: Date.now(),
          updatedAt: Date.now()
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
          submittedAt: Date.now()
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
          "state/updatedAt": Date.now(),
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
          "state/updatedAt": Date.now()
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
          "state/finishedAt": finished ? Date.now() : null,
          "state/updatedAt": Date.now(),
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
          startedAt: Date.now(),
          updatedAt: Date.now()
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
            "state/updatedAt": Date.now(),
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
          "state/updatedAt": Date.now(),
          actions: null
        });
        return;
      }

      if (gameState.phase === "joke" && action.type === "reveal-punchline") {
        await AKFirebase.updateGame(state.roomCode, {
          "state/punchlineVisible": true,
          "state/updatedAt": Date.now(),
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
            "state/finishedAt": Date.now(),
            "state/updatedAt": Date.now(),
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
          "state/updatedAt": Date.now(),
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
          "state/updatedAt": Date.now(),
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
})();
