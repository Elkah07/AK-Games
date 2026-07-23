
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

  const SESSION_KEY = "akgames_multiplayer_session_v1";

  const localRenderPlayerForm = renderPlayerForm;
  const localRenderLobby = renderLobby;
  const localRenderGames = renderGames;
  const localStartWhoUsGame = startWhoUsGame;

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

        if (state.mode === "multi-guest" || state.multiView === "lobby" || state.multiView === "who-us-game") {
          state.multiView = "lobby";
          state.multiRenderKey = null;
          state.quiDeNous = null;
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

      ${state.isHost ? `
        <button id="openMultiplayerGames" class="primary-btn full" ${state.players.length < 2 ? "disabled" : ""}>
          ${state.players.length < 2 ? "En attente d'au moins un autre joueur…" : "Choisir un jeu"}
        </button>
      ` : `
        <section class="waiting-host-card">
          <div class="waiting-pulse">🎮</div>
          <h2>En attente de l'hôte</h2>
          <p>La partie démarrera automatiquement sur ton téléphone.</p>
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
          const multiReady = game === "Qui de nous ?";
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
                ${locallyReady && !multiReady ? `<span class="badge">📱 un téléphone</span>` : ""}
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
        questions,
        settings: {
          alcoholIntensity: game.alcoholIntensity,
          includeAdult: game.includeAdult
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

      ${state.isHost ? `
        <button id="multiBackToLobby" class="primary-btn full">Retourner au salon</button>
      ` : `
        <section class="waiting-host-card">
          <div class="waiting-pulse">🎮</div>
          <h2>La partie est terminée</h2>
          <p>L'hôte peut maintenant vous ramener au salon pour choisir un autre jeu.</p>
        </section>
      `}
    `;

    const lobbyButton = document.querySelector("#multiBackToLobby");

    if (lobbyButton) {
      lobbyButton.addEventListener("click", async () => {
        lobbyButton.disabled = true;

        try {
          await AKFirebase.returnToLobby(state.roomCode);
        } catch (error) {
          console.error(error);
          lobbyButton.disabled = false;
          alert("Impossible de retourner au salon.");
        }
      });
    }
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
