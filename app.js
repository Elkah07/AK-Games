const state = {
  history: [],
  mode: null,
  adult: false,
  alcohol: false,
  players: [],
  draftPlayer: { name: "", avatarId: null },
  currentCategory: null,
  quiDeNous: null
};

const avatars = [
  { id: "frog", emoji: "🐸", name: "Grenouille" },
  { id: "otter", emoji: "🦦", name: "Loutre" },
  { id: "panda", emoji: "🐼", name: "Panda" },
  { id: "dog", emoji: "🐶", name: "Chien" },
  { id: "crow", emoji: "🐦‍⬛", name: "Corbeau" },
  { id: "fox", emoji: "🦊", name: "Renard" },
  { id: "duck", emoji: "🦆", name: "Canard" },
  { id: "ghost", emoji: "👻", name: "Fantôme" },
  { id: "dino", emoji: "🦖", name: "Dinosaure" },
  { id: "cat", emoji: "🐱", name: "Chat" },
  { id: "penguin", emoji: "🐧", name: "Pingouin" },
  { id: "fish", emoji: "🐠", name: "Poisson rouge" },
  { id: "elephant", emoji: "🐘", name: "Éléphant" },
  { id: "cactus", emoji: "🌵", name: "Cactus" },
  { id: "bear", emoji: "🧸", name: "Ourson" },
  { id: "rabbit", emoji: "🐰", name: "Lapin" },
  { id: "octopus", emoji: "🐙", name: "Pieuvre" }
];

const categories = [
  {
    id: "ambiance", emoji: "🎉", name: "Jeux d’ambiance",
    description: "Votes, débats et révélations entre potes.",
    games: ["Action ou Vérité", "Qui de nous ?", "Je n’ai jamais", "Tu préfères", "Roulette de défis", "Même cerveau", "Minorité", "Tu me connais ou pas ?", "Le Classement secret"]
  },
  {
    id: "rire", emoji: "😂", name: "Rire",
    description: "Impro, duels et fous rires.",
    games: ["Mime", "Imitation", "Le premier qui rit a perdu", "Plaide ta cause", "Le Faux Expert", "La Bombe"]
  },
  {
    id: "quiz", emoji: "🧠", name: "Quiz",
    description: "Teste tes connaissances sur plein de thèmes.",
    games: ["Culture générale", "Cinéma", "Séries", "Musique", "Jeux vidéo", "Sport", "Histoire", "Géographie", "Devine le logo", "Vrai ou Faux"]
  },
  {
    id: "rapide", emoji: "⚡", name: "Jeux rapides",
    description: "Des parties courtes à lancer en quelques secondes.",
    games: ["Devinettes", "Qui suis-je ?", "La Bombe", "Trouve l’intrus", "Mini défis chrono", "Blind Test"]
  },
  {
    id: "bluff", emoji: "🕵️", name: "Bluff & Secrets",
    description: "Mensonges, soupçons et réponses anonymes.",
    games: ["Qui ment le mieux ?", "L’Imposteur sait presque tout", "Qui a répondu ça ?", "Le Faux Expert", "Fake ou Réel ?"]
  },
  {
    id: "scenario", emoji: "🎬", name: "Histoires & Scénarios",
    description: "Des choix collectifs qui font évoluer l’histoire.",
    games: ["Alerte Rouge"]
  },
  {
    id: "adulte", emoji: "🔞", name: "Adulte",
    description: "Contenu osé et variantes réservées aux adultes.",
    adultOnly: true,
    games: ["Action ou Vérité +18", "Je n’ai jamais +18", "Questions osées", "Tu préfères +18", "Qui de nous ? +18", "Roulette adulte", "Jeux à boire"]
  }
];

const whoUsCategoryLabels = {
  drole: "😂 Drôle",
  chaos: "💥 Chaos",
  dossiers: "👀 Dossiers",
  amitie: "🫶 Amitié",
  soiree: "🎉 Soirée",
  relations: "💘 Relations & crush",
  adulte: "🔞 Osé"
};

const screen = document.querySelector("#screen");
const title = document.querySelector("#screenTitle");
const backBtn = document.querySelector("#backBtn");
const settingsBtn = document.querySelector("#settingsBtn");

function avatarById(id) {
  return avatars.find(a => a.id === id) || avatars[0];
}

function pushScreen(name) {
  state.history.push(name);
}

function setBackVisible(visible) {
  backBtn.classList.toggle("hidden", !visible);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function shuffleArray(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function renderHome() {
  state.history = [];
  title.textContent = "La soirée commence ici";
  setBackVisible(false);

  screen.innerHTML = `
    <section class="hero">
      <h2>AK'<br>Games</h2>
      <p>Une seule appli, plein de mini-jeux, et assez de chaos pour occuper toute une soirée.</p>
    </section>

    <section class="grid grid-3">
      <button class="card action-card" data-home-action="create">
        <strong>🎮 Créer une partie</strong>
        <span>Prépare une room pour jouer chacun sur son téléphone.</span>
      </button>
      <button class="card action-card" data-home-action="join">
        <strong>🔗 Rejoindre une partie</strong>
        <span>Entre un code de salon pour rejoindre tes amis.</span>
      </button>
      <button class="card action-card" data-home-action="single">
        <strong>📱 Jouer sur ce téléphone</strong>
        <span>Ajoute tous les joueurs et passez-vous le téléphone.</span>
      </button>
    </section>

    <div class="notice">V0.2 : « Qui de nous ? » est maintenant jouable sur un seul téléphone.</div>
  `;

  document.querySelectorAll("[data-home-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.homeAction;

      if (action === "single") {
        state.mode = "single";
        pushScreen("home");
        renderSetup();
      } else if (action === "create") {
        state.mode = "multi-host";
        pushScreen("home");
        renderSetup();
      } else {
        pushScreen("home");
        renderJoin();
      }
    });
  });
}

function renderSetup() {
  title.textContent = "Configure la soirée";
  setBackVisible(true);

  screen.innerHTML = `
    <section class="card">
      <h2 class="section-title">Options de la partie</h2>
      <p class="helper">Le contenu adulte et le mode alcool restent séparés.</p>
    </section>

    <label class="option-card">
      <input id="adultToggle" type="checkbox" ${state.adult ? "checked" : ""}>
      <span><strong>🔞 Contenu adulte</strong><br><span class="helper">Affiche les variantes +18 et les jeux osés.</span></span>
    </label>

    <label class="option-card">
      <input id="alcoholToggle" type="checkbox" ${state.alcohol ? "checked" : ""}>
      <span><strong>🍻 Mode alcool</strong><br><span class="helper">Ajoute les règles à boire dans les jeux compatibles.</span></span>
    </label>

    <button id="continueSetup" class="primary-btn full">Continuer</button>
  `;

  document.querySelector("#adultToggle").addEventListener("change", e => state.adult = e.target.checked);
  document.querySelector("#alcoholToggle").addEventListener("change", e => state.alcohol = e.target.checked);

  document.querySelector("#continueSetup").addEventListener("click", () => {
    pushScreen("setup");
    renderPlayerForm();
  });
}

function renderPlayerForm() {
  title.textContent = "Crée ton joueur";
  setBackVisible(true);

  screen.innerHTML = `
    <section class="card">
      <div class="form-group">
        <label for="playerName">Ton prénom</label>
        <input id="playerName" class="text-input" maxlength="20" placeholder="Ex. Kathie" value="${escapeHtml(state.draftPlayer.name)}">
      </div>
    </section>

    <section class="card">
      <h2 class="section-title">Choisis ton personnage</h2>
      <p class="helper">Les emojis sont temporaires, en attendant les personnages officiels.</p>
      <div class="spacer"></div>
      <div class="avatar-grid">
        ${avatars.map(a => `
          <button class="avatar-card ${state.draftPlayer.avatarId === a.id ? "selected" : ""}" data-avatar="${a.id}">
            <span class="avatar-emoji">${a.emoji}</span>
            <span class="avatar-name">${a.name}</span>
          </button>
        `).join("")}
      </div>
    </section>

    <button id="savePlayer" class="primary-btn full">Ajouter le joueur</button>
  `;

  document.querySelector("#playerName").addEventListener("input", e => state.draftPlayer.name = e.target.value);

  document.querySelectorAll("[data-avatar]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.draftPlayer.avatarId = btn.dataset.avatar;
      renderPlayerForm();
    });
  });

  document.querySelector("#savePlayer").addEventListener("click", () => {
    const name = state.draftPlayer.name.trim();

    if (!name || !state.draftPlayer.avatarId) {
      alert("Entre un prénom et choisis un personnage.");
      return;
    }

    state.players.push({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      name,
      avatarId: state.draftPlayer.avatarId
    });

    state.draftPlayer = { name: "", avatarId: null };
    pushScreen("player-form");
    renderLobby();
  });
}

function renderLobby() {
  title.textContent = state.mode === "single" ? "Votre groupe" : "Salon AK'Games";
  setBackVisible(true);

  screen.innerHTML = `
    <section class="card">
      <div class="badges">
        <span class="badge">${state.mode === "single" ? "📱 Un téléphone" : "📲 Plusieurs téléphones"}</span>
        ${state.adult ? `<span class="badge orange">🔞 Adulte</span>` : ""}
        ${state.alcohol ? `<span class="badge green">🍻 Alcool</span>` : ""}
      </div>
      ${state.mode !== "single" ? `<h2>AK-5824</h2><p class="helper">Le vrai salon multijoueur sera connecté ensuite.</p>` : ""}
    </section>

    <section>
      <h2 class="section-title">Joueurs (${state.players.length})</h2>
      <div class="player-list">
        ${state.players.map(p => {
          const avatar = avatarById(p.avatarId);
          return `
            <div class="player-card">
              <div class="player-main">
                <div class="player-avatar">${avatar.emoji}</div>
                <div><strong>${escapeHtml(p.name)}</strong><div class="helper">${avatar.name}</div></div>
              </div>
              <button class="danger-btn" data-remove-player="${p.id}">Supprimer</button>
            </div>
          `;
        }).join("") || `<div class="notice">Aucun joueur pour le moment.</div>`}
      </div>
    </section>

    <div class="toolbar">
      <button id="addAnother" class="secondary-btn">+ Ajouter un joueur</button>
      <button id="openGames" class="primary-btn">Choisir les jeux</button>
    </div>
  `;

  document.querySelector("#addAnother").addEventListener("click", () => {
    pushScreen("lobby");
    renderPlayerForm();
  });

  document.querySelector("#openGames").addEventListener("click", () => {
    if (state.players.length < 2) {
      alert("Ajoute au moins 2 joueurs.");
      return;
    }

    pushScreen("lobby");
    renderPlayChoice();
  });

  document.querySelectorAll("[data-remove-player]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.players = state.players.filter(p => p.id !== btn.dataset.removePlayer);
      renderLobby();
    });
  });
}

function renderPlayChoice() {
  title.textContent = "À quoi vous voulez jouer ?";
  setBackVisible(true);

  screen.innerHTML = `
    <section class="grid grid-2">
      <button id="chooseGame" class="card action-card">
        <strong>🎮 Choisir un jeu</strong>
        <span>Parcours les catégories et lance un jeu précis.</span>
      </button>
      <button id="mixMode" class="card action-card">
        <strong>🎲 Mode Mix</strong>
        <span>Une playlist de plusieurs jeux pour toute la soirée.</span>
      </button>
    </section>

    <div class="notice">Le mode Mix sera automatisé après l’intégration de plusieurs jeux.</div>
  `;

  document.querySelector("#chooseGame").addEventListener("click", () => {
    pushScreen("play-choice");
    renderCategories();
  });

  document.querySelector("#mixMode").addEventListener("click", () => {
    alert("Le mode Mix est réservé à une prochaine version.");
  });
}

function renderCategories() {
  title.textContent = "Choisis une catégorie";
  setBackVisible(true);

  const visibleCategories = categories.filter(c => !c.adultOnly || state.adult);

  screen.innerHTML = `
    <section class="category-grid">
      ${visibleCategories.map(c => `
        <button class="category-card" data-category="${c.id}">
          <span class="emoji">${c.emoji}</span>
          <strong>${c.name}</strong>
          <span>${c.description}</span>
        </button>
      `).join("")}
    </section>
  `;

  document.querySelectorAll("[data-category]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.currentCategory = btn.dataset.category;
      pushScreen("categories");
      renderGames();
    });
  });
}

function renderGames() {
  const category = categories.find(c => c.id === state.currentCategory);
  title.textContent = category.name;
  setBackVisible(true);

  screen.innerHTML = `
    <section class="game-list">
      ${category.games.map(game => {
        const disabled = game === "Blind Test";
        const ready = game === "Qui de nous ?";

        return `
          <button class="game-card ${disabled ? "disabled" : ""}" ${disabled ? "disabled" : ""} data-game="${escapeHtml(game)}">
            <strong>${game}</strong>
            <span class="helper">${disabled ? "Bientôt disponible" : ready ? "Jouable maintenant" : "À intégrer"}</span>
            <div class="game-meta">
              ${ready ? `<span class="badge green">✓ disponible</span>` : ""}
              ${state.alcohol && ready ? `<span class="badge green">🍻 compatible</span>` : ""}
              ${category.adultOnly ? `<span class="badge orange">🔞 adulte</span>` : ""}
            </div>
          </button>
        `;
      }).join("")}
    </section>
  `;

  document.querySelectorAll("[data-game]:not([disabled])").forEach(btn => {
    btn.addEventListener("click", () => {
      const game = btn.dataset.game;

      if (game === "Qui de nous ?") {
        if (state.mode !== "single") {
          pushScreen("games");
          renderMultiNotReady(game);
          return;
        }

        pushScreen("games");
        resetWhoUsState();
        renderWhoUsSetup();
        return;
      }

      renderGamePlaceholder(game);
    });
  });
}

function renderGamePlaceholder(gameName) {
  pushScreen("games");
  title.textContent = gameName;
  setBackVisible(true);

  screen.innerHTML = `
    <section class="hero compact-hero">
      <h2>${escapeHtml(gameName)}</h2>
      <p>Le jeu est placé dans l’application. Sa mécanique complète sera branchée dans une prochaine version.</p>
    </section>
    <button id="backToGames" class="primary-btn full">Retour aux jeux</button>
  `;

  document.querySelector("#backToGames").addEventListener("click", renderGames);
}

function renderMultiNotReady(gameName) {
  title.textContent = gameName;
  setBackVisible(true);

  screen.innerHTML = `
    <section class="hero compact-hero">
      <h2>📲 Multijoueur en préparation</h2>
      <p>« ${escapeHtml(gameName)} » est déjà jouable sur un seul téléphone. La synchronisation chacun sur son téléphone sera branchée avec la vraie room multijoueur.</p>
    </section>
    <button id="backToGames" class="primary-btn full">Retour aux jeux</button>
  `;

  document.querySelector("#backToGames").addEventListener("click", renderGames);
}


function resetWhoUsState() {
  state.quiDeNous = {
    questionCount: 10,
    categories: ["drole", "chaos", "dossiers", "amitie", "soiree", "relations"],
    includeAdult: false,
    alcoholIntensity: "normal",
    questions: [],
    currentIndex: 0,
    currentVoterIndex: 0,
    currentVotes: {},
    rounds: []
  };
}

function renderWhoUsSetup() {
  if (!state.quiDeNous) resetWhoUsState();
  const game = state.quiDeNous;

  title.textContent = "Qui de nous ?";
  setBackVisible(true);

  screen.innerHTML = `
    <section class="hero compact-hero">
      <h2>👥 Qui de nous ?</h2>
      <p>Votez secrètement pour la personne qui correspond le mieux à chaque situation, puis découvrez ce que le groupe pense vraiment.</p>
    </section>

    <section class="card">
      <h2 class="section-title">Nombre de questions</h2>
      <div class="choice-row">
        ${[5, 10, 20].map(n => `
          <button class="choice-pill ${game.questionCount === n ? "active" : ""}" data-qcount="${n}">${n}</button>
        `).join("")}
      </div>

      <div class="form-group top-gap">
        <label for="customCount">Personnalisé</label>
        <input id="customCount" class="text-input" type="number" min="1" max="100" value="${game.questionCount}">
      </div>
    </section>

    <section class="card">
      <h2 class="section-title">Catégories</h2>
      <div class="check-grid">
        ${["drole", "chaos", "dossiers", "amitie", "soiree", "relations"].map(cat => `
          <label class="option-card mini-option">
            <input type="checkbox" data-who-cat="${cat}" ${game.categories.includes(cat) ? "checked" : ""}>
            <span><strong>${whoUsCategoryLabels[cat]}</strong></span>
          </label>
        `).join("")}
      </div>

      <button id="selectAllCats" class="secondary-btn full top-gap">Tout sélectionner</button>
    </section>

    ${state.adult ? `
      <section class="card">
        <label class="option-card">
          <input id="adultWhoToggle" type="checkbox" ${game.includeAdult ? "checked" : ""}>
          <span>
            <strong>🔞 Ajouter les questions osées</strong><br>
            <span class="helper">Mélange les questions +18 avec les autres catégories choisies.</span>
          </span>
        </label>
      </section>
    ` : ""}

    ${state.alcohol ? `
      <section class="card">
        <h2 class="section-title">🍻 Intensité du mode alcool</h2>
        <div class="stacked-choice">
          <label class="option-card mini-option">
            <input type="radio" name="alcoholIntensity" value="light" ${game.alcoholIntensity === "light" ? "checked" : ""}>
            <span><strong>Léger</strong><br><span class="helper">Environ une règle toutes les 5 manches.</span></span>
          </label>
          <label class="option-card mini-option">
            <input type="radio" name="alcoholIntensity" value="normal" ${game.alcoholIntensity === "normal" ? "checked" : ""}>
            <span><strong>Normal</strong><br><span class="helper">Environ une règle toutes les 3 manches.</span></span>
          </label>
          <label class="option-card mini-option">
            <input type="radio" name="alcoholIntensity" value="chaos" ${game.alcoholIntensity === "chaos" ? "checked" : ""}>
            <span><strong>Chaotique</strong><br><span class="helper">Une règle à presque chaque manche.</span></span>
          </label>
        </div>
      </section>
    ` : ""}

    <button id="startWhoUs" class="primary-btn full">Lancer la partie</button>
  `;

  document.querySelectorAll("[data-qcount]").forEach(btn => {
    btn.addEventListener("click", () => {
      game.questionCount = Number(btn.dataset.qcount);
      renderWhoUsSetup();
    });
  });

  document.querySelector("#customCount").addEventListener("input", e => {
    game.questionCount = Math.max(1, Math.min(100, Number(e.target.value) || 1));
  });

  document.querySelectorAll("[data-who-cat]").forEach(input => {
    input.addEventListener("change", () => {
      const cat = input.dataset.whoCat;
      if (input.checked && !game.categories.includes(cat)) game.categories.push(cat);
      if (!input.checked) game.categories = game.categories.filter(c => c !== cat);
    });
  });

  document.querySelector("#selectAllCats").addEventListener("click", () => {
    game.categories = ["drole", "chaos", "dossiers", "amitie", "soiree", "relations"];
    renderWhoUsSetup();
  });

  const adultToggle = document.querySelector("#adultWhoToggle");
  if (adultToggle) {
    adultToggle.addEventListener("change", e => {
      game.includeAdult = e.target.checked;
    });
  }

  document.querySelectorAll('input[name="alcoholIntensity"]').forEach(input => {
    input.addEventListener("change", e => {
      game.alcoholIntensity = e.target.value;
    });
  });

  document.querySelector("#startWhoUs").addEventListener("click", startWhoUsGame);
}

async function startWhoUsGame() {
  const game = state.quiDeNous;

  if (!game.categories.length && !game.includeAdult) {
    alert("Choisis au moins une catégorie.");
    return;
  }

  screen.innerHTML = `<div class="notice">Chargement des questions…</div>`;

  try {
    const baseResponse = await fetch("data/qui-de-nous.json");
    if (!baseResponse.ok) throw new Error("Impossible de charger les questions classiques.");

    const baseQuestions = await baseResponse.json();
    let pool = baseQuestions.filter(q => game.categories.includes(q.category));

    if (state.adult && game.includeAdult) {
      const adultResponse = await fetch("data/qui-de-nous-adulte.json");
      if (!adultResponse.ok) throw new Error("Impossible de charger les questions adultes.");
      const adultQuestions = await adultResponse.json();
      pool = pool.concat(adultQuestions);
    }

    if (!pool.length) throw new Error("Aucune question ne correspond aux catégories choisies.");

    game.questions = shuffleArray(pool).slice(0, Math.min(game.questionCount, pool.length));
    game.currentIndex = 0;
    game.currentVoterIndex = 0;
    game.currentVotes = {};
    game.rounds = [];

    state.history = [];
    renderWhoUsQuestion();
  } catch (error) {
    screen.innerHTML = `
      <div class="notice">
        <strong>Impossible de charger le jeu.</strong><br>
        ${escapeHtml(error.message)}<br><br>
        Vérifie que le dossier <code>data</code> a bien été ajouté au projet.
      </div>
      <button id="retryWhoUs" class="primary-btn full">Réessayer</button>
    `;

    document.querySelector("#retryWhoUs").addEventListener("click", startWhoUsGame);
  }
}

function currentWhoUsQuestion() {
  return state.quiDeNous.questions[state.quiDeNous.currentIndex];
}

function renderWhoUsQuestion() {
  const game = state.quiDeNous;
  const question = currentWhoUsQuestion();

  title.textContent = "Qui de nous ?";
  setBackVisible(false);

  screen.innerHTML = `
    <section class="game-progress">
      <span>Question ${game.currentIndex + 1}/${game.questions.length}</span>
      <div class="progress-track">
        <div class="progress-fill" style="width:${((game.currentIndex + 1) / game.questions.length) * 100}%"></div>
      </div>
    </section>

    <section class="question-stage">
      <span class="category-chip">${whoUsCategoryLabels[question.category] || "👥 Qui de nous ?"}</span>
      <h2>${escapeHtml(question.question)}</h2>
      <p>Tout le monde a bien lu ? Les votes seront secrets.</p>
    </section>

    <button id="beginVotes" class="primary-btn full">Commencer les votes</button>
  `;

  document.querySelector("#beginVotes").addEventListener("click", () => {
    game.currentVoterIndex = 0;
    game.currentVotes = {};
    renderWhoUsVoterGate();
  });
}

function renderWhoUsVoterGate() {
  const game = state.quiDeNous;
  const voter = state.players[game.currentVoterIndex];
  const avatar = avatarById(voter.avatarId);

  title.textContent = "Vote secret";

  screen.innerHTML = `
    <section class="handoff-stage">
      <div class="giant-avatar">${avatar.emoji}</div>
      <h2>${escapeHtml(voter.name)}, à toi de voter</h2>
      <p>Prends le téléphone et garde ton choix pour toi 👀</p>
    </section>

    <button id="readyToVote" class="primary-btn full">Je suis prêt(e)</button>
  `;

  document.querySelector("#readyToVote").addEventListener("click", renderWhoUsVoteChoice);
}

function renderWhoUsVoteChoice() {
  const game = state.quiDeNous;
  const voter = state.players[game.currentVoterIndex];

  title.textContent = `${voter.name} vote`;

  screen.innerHTML = `
    <section class="card centered-card">
      <span class="category-chip">Vote secret</span>
      <h2>Qui choisis-tu ?</h2>
      <p class="helper">Tu peux aussi voter pour toi-même.</p>
    </section>

    <section class="vote-grid">
      ${state.players.map(player => {
        const avatar = avatarById(player.avatarId);

        return `
          <button class="vote-player" data-vote-target="${player.id}">
            <span class="vote-avatar">${avatar.emoji}</span>
            <strong>${escapeHtml(player.name)}</strong>
          </button>
        `;
      }).join("")}
    </section>
  `;

  document.querySelectorAll("[data-vote-target]").forEach(btn => {
    btn.addEventListener("click", () => {
      game.currentVotes[voter.id] = btn.dataset.voteTarget;
      game.currentVoterIndex += 1;

      if (game.currentVoterIndex < state.players.length) {
        renderWhoUsVoteSaved();
      } else {
        renderWhoUsAllVoted();
      }
    });
  });
}

function renderWhoUsVoteSaved() {
  const nextVoter = state.players[state.quiDeNous.currentVoterIndex];
  const avatar = avatarById(nextVoter.avatarId);

  title.textContent = "Vote enregistré";

  screen.innerHTML = `
    <section class="handoff-stage">
      <div class="success-mark">✓</div>
      <h2>Vote enregistré</h2>
      <p>Passe maintenant le téléphone à <strong>${escapeHtml(nextVoter.name)}</strong> ${avatar.emoji}</p>
    </section>

    <button id="nextVoter" class="primary-btn full">Continuer</button>
  `;

  document.querySelector("#nextVoter").addEventListener("click", renderWhoUsVoterGate);
}

function renderWhoUsAllVoted() {
  title.textContent = "Tout le monde a voté";

  screen.innerHTML = `
    <section class="reveal-stage">
      <div class="reveal-eyes">👀</div>
      <h2>Tout le monde a voté…</h2>
      <p>Posez le téléphone au milieu. Il est temps de voir ce que le groupe pense vraiment.</p>
    </section>

    <button id="revealWhoUs" class="primary-btn full">Révéler les résultats</button>
  `;

  document.querySelector("#revealWhoUs").addEventListener("click", renderWhoUsResults);
}

function calculateWhoUsResults() {
  const game = state.quiDeNous;
  const counts = Object.fromEntries(state.players.map(player => [player.id, 0]));

  Object.values(game.currentVotes).forEach(targetId => {
    counts[targetId] += 1;
  });

  const sorted = state.players
    .map(player => ({ ...player, votes: counts[player.id] }))
    .sort((a, b) => b.votes - a.votes);

  const maxVotes = sorted[0].votes;
  const winners = sorted.filter(player => player.votes === maxVotes);

  return { counts, sorted, maxVotes, winners };
}

function getWhoUsEvent(result) {
  const game = state.quiDeNous;
  const total = state.players.length;

  if (result.maxVotes === total && result.winners.length === 1) {
    return {
      type: "unanimity",
      title: "C'EST OFFICIEL.",
      text: `${total} personne${total > 1 ? "s" : ""} sur ${total} ont voté pour ${result.winners[0].name}. À ce stade, ce n'est plus une opinion.`
    };
  }

  if (result.winners.length > 1 && result.maxVotes > 0) {
    return {
      type: "tie",
      title: "⚔️ Le groupe est divisé.",
      text: `${result.winners.map(player => player.name).join(" et ")} terminent à égalité avec ${result.maxVotes} vote${result.maxVotes > 1 ? "s" : ""}.`
    };
  }

  const winner = result.winners[0];

  if (game.currentVotes[winner.id] === winner.id && result.maxVotes > 1) {
    return {
      type: "self",
      title: "🪞 Au moins, c'est assumé.",
      text: `${winner.name} a voté pour ${winner.name}… et visiblement, le groupe est plutôt d'accord.`
    };
  }

  return null;
}

function getAlcoholRule(result) {
  if (!state.alcohol) return null;

  const game = state.quiDeNous;
  const roundNumber = game.currentIndex + 1;
  const frequency = game.alcoholIntensity === "light" ? 5 : game.alcoholIntensity === "normal" ? 3 : 1;

  if (roundNumber % frequency !== 0) return null;

  if (result.winners.length > 1) {
    return `🍻 ${result.winners.map(player => player.name).join(" et ")} trinquent et prennent une gorgée.`;
  }

  if (result.maxVotes === state.players.length) {
    return `🍻 Unanimité ! ${result.winners[0].name} distribue ${Math.min(3, state.players.length - 1)} gorgée${Math.min(3, state.players.length - 1) > 1 ? "s" : ""}.`;
  }

  return `🍻 ${result.winners[0].name}, la personne la plus désignée, prend une gorgée.`;
}

function renderWhoUsResults() {
  const game = state.quiDeNous;
  const question = currentWhoUsQuestion();
  const result = calculateWhoUsResults();
  const event = getWhoUsEvent(result);
  const alcoholRule = getAlcoholRule(result);

  game.rounds.push({
    question,
    votes: { ...game.currentVotes },
    counts: { ...result.counts },
    winnerIds: result.winners.map(player => player.id),
    maxVotes: result.maxVotes
  });

  title.textContent = "Le groupe a parlé";

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
      ${result.sorted.map((player, index) => {
        const avatar = avatarById(player.avatarId);
        const percentage = Math.round((player.votes / state.players.length) * 100);

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

    <button id="nextWhoUsQuestion" class="primary-btn full">
      ${game.currentIndex + 1 >= game.questions.length ? "Voir le bilan" : "Question suivante"}
    </button>
  `;

  document.querySelector("#nextWhoUsQuestion").addEventListener("click", () => {
    if (game.currentIndex + 1 >= game.questions.length) {
      renderWhoUsEnd();
    } else {
      game.currentIndex += 1;
      game.currentVoterIndex = 0;
      game.currentVotes = {};
      renderWhoUsQuestion();
    }
  });
}

function renderWhoUsEnd() {
  const game = state.quiDeNous;

  const stats = Object.fromEntries(
    state.players.map(player => [player.id, {
      received: 0,
      selfVotes: 0,
      majorityMatches: 0,
      uniqueChoices: 0
    }])
  );

  game.rounds.forEach(round => {
    Object.entries(round.counts).forEach(([id, count]) => {
      stats[id].received += count;
    });

    Object.entries(round.votes).forEach(([voterId, targetId]) => {
      if (voterId === targetId) stats[voterId].selfVotes += 1;
      if (round.winnerIds.includes(targetId)) stats[voterId].majorityMatches += 1;
      if ((round.counts[targetId] || 0) === 1) stats[voterId].uniqueChoices += 1;
    });
  });

  const mostDesignated = [...state.players].sort((a, b) => stats[b.id].received - stats[a.id].received)[0];
  const selfReporter = [...state.players].sort((a, b) => stats[b.id].selfVotes - stats[a.id].selfVotes)[0];
  const peopleVoice = [...state.players].sort((a, b) => stats[b.id].majorityMatches - stats[a.id].majorityMatches)[0];
  const freeSpirit = [...state.players].sort((a, b) => stats[b.id].uniqueChoices - stats[a.id].uniqueChoices)[0];

  title.textContent = "Bilan de la partie";
  setBackVisible(false);

  screen.innerHTML = `
    <section class="hero compact-hero">
      <h2>Votre soirée en chiffres</h2>
      <p>${game.questions.length} questions, ${state.players.length} joueurs et quelques vérités qu'on aurait peut-être préféré ignorer.</p>
    </section>

    <section class="award-grid">
      ${renderWhoUsAward("👑", "La personne la plus désignée", mostDesignated, `${stats[mostDesignated.id].received} votes reçus`)}
      ${renderWhoUsAward("🪞", "L’auto-dénonciation", selfReporter, `${stats[selfReporter.id].selfVotes} vote${stats[selfReporter.id].selfVotes > 1 ? "s" : ""} pour soi-même`)}
      ${renderWhoUsAward("🗳️", "L’avis du peuple", peopleVoice, `${Math.round((stats[peopleVoice.id].majorityMatches / game.rounds.length) * 100)}% avec la majorité`)}
      ${renderWhoUsAward("🛸", "L’esprit libre", freeSpirit, `${stats[freeSpirit.id].uniqueChoices} choix solitaire${stats[freeSpirit.id].uniqueChoices > 1 ? "s" : ""}`)}
    </section>

    <div class="toolbar">
      <button id="replayWhoUs" class="secondary-btn">Rejouer</button>
      <button id="backLobbyWhoUs" class="primary-btn">Choisir un autre jeu</button>
    </div>
  `;

  document.querySelector("#replayWhoUs").addEventListener("click", () => {
    resetWhoUsState();
    renderWhoUsSetup();
  });

  document.querySelector("#backLobbyWhoUs").addEventListener("click", () => {
    state.quiDeNous = null;
    renderPlayChoice();
  });
}

function renderWhoUsAward(icon, label, player, detail) {
  const avatar = avatarById(player.avatarId);

  return `
    <article class="award-card">
      <span class="award-icon">${icon}</span>
      <span class="award-avatar">${avatar.emoji}</span>
      <strong>${escapeHtml(player.name)}</strong>
      <span class="award-label">${label}</span>
      <small>${detail}</small>
    </article>
  `;
}


function renderJoin() {
  title.textContent = "Rejoindre une partie";
  setBackVisible(true);

  screen.innerHTML = `
    <section class="card">
      <div class="form-group">
        <label for="roomCode">Code du salon</label>
        <input id="roomCode" class="text-input" maxlength="7" placeholder="AK-5824">
      </div>
    </section>

    <button id="joinBtn" class="primary-btn full">Rejoindre</button>

    <div class="notice">La connexion à une vraie room sera ajoutée avec la couche multijoueur.</div>
  `;

  document.querySelector("#joinBtn").addEventListener("click", () => {
    alert("Le multijoueur en ligne sera activé dans une prochaine version.");
  });
}

function renderSettings() {
  pushScreen("settings-origin");
  title.textContent = "Paramètres";
  setBackVisible(true);

  screen.innerHTML = `
    <section class="card">
      <h2 class="section-title">État de la session</h2>
      <p class="helper">Ces réglages modifient la partie actuelle.</p>
    </section>

    <label class="option-card">
      <input id="settingsAdult" type="checkbox" ${state.adult ? "checked" : ""}>
      <span><strong>🔞 Contenu adulte</strong></span>
    </label>

    <label class="option-card">
      <input id="settingsAlcohol" type="checkbox" ${state.alcohol ? "checked" : ""}>
      <span><strong>🍻 Mode alcool</strong></span>
    </label>

    <button id="resetApp" class="danger-btn full">Réinitialiser la session</button>
  `;

  document.querySelector("#settingsAdult").addEventListener("change", e => state.adult = e.target.checked);
  document.querySelector("#settingsAlcohol").addEventListener("change", e => state.alcohol = e.target.checked);

  document.querySelector("#resetApp").addEventListener("click", () => {
    if (!confirm("Réinitialiser tous les joueurs et revenir à l’accueil ?")) return;

    state.mode = null;
    state.adult = false;
    state.alcohol = false;
    state.players = [];
    state.draftPlayer = { name: "", avatarId: null };
    state.currentCategory = null;
    state.quiDeNous = null;

    renderHome();
  });
}

backBtn.addEventListener("click", () => {
  const previous = state.history.pop();

  switch (previous) {
    case "home":
      renderHome();
      break;
    case "setup":
      renderSetup();
      break;
    case "player-form":
      renderPlayerForm();
      break;
    case "lobby":
      renderLobby();
      break;
    case "play-choice":
      renderPlayChoice();
      break;
    case "categories":
      renderCategories();
      break;
    case "games":
      renderGames();
      break;
    case "settings-origin":
      renderHome();
      break;
    default:
      renderHome();
  }
});

settingsBtn.addEventListener("click", () => {
  if (state.quiDeNous && state.quiDeNous.questions.length) return;
  renderSettings();
});

renderHome();
