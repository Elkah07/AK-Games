const state = {
  history: [],
  mode: null,
  adult: false,
  alcohol: false,
  players: [],
  draftPlayer: { name: "", avatarId: null },
  currentCategory: null,
  quiDeNous: null,
  laughDuel: null,
  bestLiar: null
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

const laughCategoryLabels = {
  nulles: "🥴 Blagues nulles",
  absurdes: "🌀 Absurdes",
  devinettes: "❓ Devinettes",
  observation: "👀 Vie quotidienne",
  adulte: "🔞 Adulte"
};

const liarCategoryLabels = {
  excuses: "🧾 Excuses",
  improbable: "🛸 Improbable",
  quotidien: "🏠 Quotidien",
  dossiers: "👀 Dossiers",
  chaos: "💥 Chaos",
  adulte: "🔞 Adulte"
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

    <div class="notice">V0.6 : salon persistant, score cumulé, historique et soirée continue.</div>
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

  const readyGames = new Set([
    "Qui de nous ?",
    "Le premier qui rit a perdu",
    "Qui ment le mieux ?"
  ]);

  screen.innerHTML = `
    <section class="game-list">
      ${category.games.map(game => {
        const disabled = game === "Blind Test";
        const ready = readyGames.has(game);

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

      if (readyGames.has(game) && state.mode !== "single") {
        pushScreen("games");
        renderMultiNotReady(game);
        return;
      }

      if (game === "Qui de nous ?") {
        pushScreen("games");
        resetWhoUsState();
        renderWhoUsSetup();
        return;
      }

      if (game === "Le premier qui rit a perdu") {
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

        pushScreen("games");
        resetBestLiarState();
        renderBestLiarSetup();
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



/* =========================================================
   LE PREMIER QUI RIT A PERDU
   ========================================================= */

function resetLaughDuelState() {
  state.laughDuel = {
    player1Id: state.players[0]?.id || null,
    player2Id: state.players[1]?.id || null,
    mode: "sudden",
    categories: ["nulles", "absurdes", "devinettes", "observation"],
    includeAdult: false,
    jokePool: [],
    usedJokeIds: [],
    currentTurnId: null,
    currentJoke: null,
    punchlineVisible: false,
    lives: {}
  };
}

function renderLaughDuelSetup() {
  if (!state.laughDuel) resetLaughDuelState();
  const game = state.laughDuel;

  title.textContent = "Le premier qui rit a perdu";
  setBackVisible(true);

  screen.innerHTML = `
    <section class="hero compact-hero">
      <h2>😂 Le premier qui rit a perdu</h2>
      <p>Deux joueurs face à face. À tour de rôle, l’un raconte une blague. Le premier qui rigole perd.</p>
    </section>

    <section class="card">
      <h2 class="section-title">Choisissez les deux adversaires</h2>

      <div class="duel-player-select">
        <div>
          <label class="helper" for="laughPlayer1">Joueur 1</label>
          <select id="laughPlayer1" class="text-input">
            ${state.players.map(player => `
              <option value="${player.id}" ${game.player1Id === player.id ? "selected" : ""}>
                ${avatarById(player.avatarId).emoji} ${escapeHtml(player.name)}
              </option>
            `).join("")}
          </select>
        </div>

        <div class="duel-vs">VS</div>

        <div>
          <label class="helper" for="laughPlayer2">Joueur 2</label>
          <select id="laughPlayer2" class="text-input">
            ${state.players.map(player => `
              <option value="${player.id}" ${game.player2Id === player.id ? "selected" : ""}>
                ${avatarById(player.avatarId).emoji} ${escapeHtml(player.name)}
              </option>
            `).join("")}
          </select>
        </div>
      </div>
    </section>

    <section class="card">
      <h2 class="section-title">Règle du duel</h2>
      <div class="stacked-choice">
        <label class="option-card mini-option">
          <input type="radio" name="laughMode" value="sudden" ${game.mode === "sudden" ? "checked" : ""}>
          <span>
            <strong>⚡ Mort subite</strong><br>
            <span class="helper">Le premier rire met immédiatement fin au duel.</span>
          </span>
        </label>

        <label class="option-card mini-option">
          <input type="radio" name="laughMode" value="lives" ${game.mode === "lives" ? "checked" : ""}>
          <span>
            <strong>❤️ 3 vies</strong><br>
            <span class="helper">Chaque rire fait perdre une vie. Le premier à zéro perd.</span>
          </span>
        </label>
      </div>
    </section>

    <section class="card">
      <h2 class="section-title">Types de blagues</h2>
      <div class="check-grid">
        ${["nulles", "absurdes", "devinettes", "observation"].map(cat => `
          <label class="option-card mini-option">
            <input type="checkbox" data-laugh-cat="${cat}" ${game.categories.includes(cat) ? "checked" : ""}>
            <span><strong>${laughCategoryLabels[cat]}</strong></span>
          </label>
        `).join("")}
      </div>
    </section>

    ${state.adult ? `
      <section class="card">
        <label class="option-card">
          <input id="laughAdultToggle" type="checkbox" ${game.includeAdult ? "checked" : ""}>
          <span>
            <strong>🔞 Ajouter l’humour adulte</strong><br>
            <span class="helper">Ajoute des blagues plus suggestives au tirage.</span>
          </span>
        </label>
      </section>
    ` : ""}

    <button id="startLaughDuel" class="primary-btn full">Lancer le duel</button>
  `;

  document.querySelector("#laughPlayer1").addEventListener("change", e => game.player1Id = e.target.value);
  document.querySelector("#laughPlayer2").addEventListener("change", e => game.player2Id = e.target.value);

  document.querySelectorAll('input[name="laughMode"]').forEach(input => {
    input.addEventListener("change", e => game.mode = e.target.value);
  });

  document.querySelectorAll("[data-laugh-cat]").forEach(input => {
    input.addEventListener("change", () => {
      const cat = input.dataset.laughCat;
      if (input.checked && !game.categories.includes(cat)) game.categories.push(cat);
      if (!input.checked) game.categories = game.categories.filter(c => c !== cat);
    });
  });

  const adultToggle = document.querySelector("#laughAdultToggle");
  if (adultToggle) {
    adultToggle.addEventListener("change", e => game.includeAdult = e.target.checked);
  }

  document.querySelector("#startLaughDuel").addEventListener("click", startLaughDuel);
}

async function startLaughDuel() {
  const game = state.laughDuel;

  if (!game.player1Id || !game.player2Id || game.player1Id === game.player2Id) {
    alert("Choisis deux joueurs différents.");
    return;
  }

  if (!game.categories.length && !game.includeAdult) {
    alert("Choisis au moins un type de blague.");
    return;
  }

  screen.innerHTML = `<div class="notice">Préparation du duel…</div>`;

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

    game.jokePool = shuffleArray(pool);
    game.usedJokeIds = [];
    game.currentTurnId = Math.random() < 0.5 ? game.player1Id : game.player2Id;
    game.currentJoke = null;
    game.punchlineVisible = false;
    game.lives = {
      [game.player1Id]: game.mode === "lives" ? 3 : 1,
      [game.player2Id]: game.mode === "lives" ? 3 : 1
    };

    state.history = [];
    renderLaughDuelIntro();
  } catch (error) {
    screen.innerHTML = `
      <div class="notice">
        <strong>Impossible de lancer le duel.</strong><br>
        ${escapeHtml(error.message)}
      </div>
      <button id="retryLaugh" class="primary-btn full">Réessayer</button>
    `;

    document.querySelector("#retryLaugh").addEventListener("click", startLaughDuel);
  }
}

function getLaughPlayers() {
  const game = state.laughDuel;
  const player1 = state.players.find(player => player.id === game.player1Id);
  const player2 = state.players.find(player => player.id === game.player2Id);
  return { player1, player2 };
}

function getOtherLaughPlayer(playerId) {
  const { player1, player2 } = getLaughPlayers();
  return player1.id === playerId ? player2 : player1;
}

function renderLaughDuelIntro() {
  const game = state.laughDuel;
  const teller = state.players.find(player => player.id === game.currentTurnId);
  const listener = getOtherLaughPlayer(teller.id);

  title.textContent = "Le duel commence";
  setBackVisible(false);

  screen.innerHTML = `
    <section class="duel-stage">
      <div class="duel-faces">
        <div class="duel-face-card active">
          <span>${avatarById(teller.avatarId).emoji}</span>
          <strong>${escapeHtml(teller.name)}</strong>
          <small>Commence à faire rire</small>
        </div>

        <div class="duel-vs big">VS</div>

        <div class="duel-face-card">
          <span>${avatarById(listener.avatarId).emoji}</span>
          <strong>${escapeHtml(listener.name)}</strong>
          <small>Garde ton sérieux</small>
        </div>
      </div>

      <h2>Ne riez surtout pas.</h2>
      <p>${game.mode === "lives" ? "Vous avez 3 vies chacun." : "Le premier rire met fin au duel."}</p>
    </section>

    <button id="beginLaughTurn" class="primary-btn full">Commencer</button>
  `;

  document.querySelector("#beginLaughTurn").addEventListener("click", renderLaughTurnChoice);
}

function renderLaughLives() {
  const game = state.laughDuel;
  const { player1, player2 } = getLaughPlayers();

  if (game.mode !== "lives") return "";

  return `
    <div class="lives-row">
      <span>${avatarById(player1.avatarId).emoji} ${escapeHtml(player1.name)} : ${"❤️".repeat(game.lives[player1.id])}${"🖤".repeat(3 - game.lives[player1.id])}</span>
      <span>${avatarById(player2.avatarId).emoji} ${escapeHtml(player2.name)} : ${"❤️".repeat(game.lives[player2.id])}${"🖤".repeat(3 - game.lives[player2.id])}</span>
    </div>
  `;
}

function renderLaughTurnChoice() {
  const game = state.laughDuel;
  const teller = state.players.find(player => player.id === game.currentTurnId);
  const listener = getOtherLaughPlayer(teller.id);

  title.textContent = `${teller.name}, à toi`;
  setBackVisible(false);

  screen.innerHTML = `
    ${renderLaughLives()}

    <section class="question-stage laugh-turn-stage">
      <div class="giant-avatar">${avatarById(teller.avatarId).emoji}</div>
      <span class="category-chip">À toi de faire rire ${escapeHtml(listener.name)}</span>
      <h2>${escapeHtml(teller.name)}, choisis ton arme.</h2>
      <p>Tu peux utiliser une blague de l’application ou raconter la tienne.</p>
    </section>

    <div class="grid grid-2">
      <button id="giveJoke" class="card action-card">
        <strong>🎲 Donne-moi une blague</strong>
        <span>L’application t’en tire une au hasard.</span>
      </button>

      <button id="ownJoke" class="card action-card">
        <strong>😏 J’en ai une</strong>
        <span>Raconte ta propre blague.</span>
      </button>
    </div>
  `;

  document.querySelector("#giveJoke").addEventListener("click", drawLaughJoke);
  document.querySelector("#ownJoke").addEventListener("click", renderOwnLaughJoke);
}

function drawLaughJoke() {
  const game = state.laughDuel;
  let available = game.jokePool.filter(joke => !game.usedJokeIds.includes(joke.id));

  if (!available.length) {
    game.usedJokeIds = [];
    available = [...game.jokePool];
  }

  game.currentJoke = available[Math.floor(Math.random() * available.length)];
  game.usedJokeIds.push(game.currentJoke.id);
  game.punchlineVisible = false;

  renderLaughJokeCard();
}

function renderLaughJokeCard() {
  const game = state.laughDuel;
  const teller = state.players.find(player => player.id === game.currentTurnId);
  const listener = getOtherLaughPlayer(teller.id);
  const joke = game.currentJoke;

  title.textContent = "Fais-le/la craquer";
  setBackVisible(false);

  screen.innerHTML = `
    ${renderLaughLives()}

    <section class="joke-card">
      <span class="category-chip">${laughCategoryLabels[joke.category] || "😂 Blague"}</span>
      <h2>${escapeHtml(joke.setup)}</h2>

      ${game.punchlineVisible ? `
        <div class="punchline">${escapeHtml(joke.punchline)}</div>
      ` : `
        <button id="revealPunchline" class="secondary-btn">Révéler la chute</button>
      `}
    </section>

    ${game.punchlineVisible ? renderLaughOutcomeButtons(teller, listener) : ""}
  `;

  const revealBtn = document.querySelector("#revealPunchline");
  if (revealBtn) {
    revealBtn.addEventListener("click", () => {
      game.punchlineVisible = true;
      renderLaughJokeCard();
    });
  }

  bindLaughOutcomeButtons();
}

function renderOwnLaughJoke() {
  const game = state.laughDuel;
  const teller = state.players.find(player => player.id === game.currentTurnId);
  const listener = getOtherLaughPlayer(teller.id);

  title.textContent = "Ta blague, ton moment";
  setBackVisible(false);

  screen.innerHTML = `
    ${renderLaughLives()}

    <section class="question-stage laugh-turn-stage">
      <div class="giant-avatar">${avatarById(teller.avatarId).emoji}</div>
      <span class="category-chip">Blague personnelle</span>
      <h2>Vas-y ${escapeHtml(teller.name)}.</h2>
      <p>Fais rire ${escapeHtml(listener.name)}. Quand tu as terminé, indique ce qu’il s’est passé.</p>
    </section>

    ${renderLaughOutcomeButtons(teller, listener)}
  `;

  bindLaughOutcomeButtons();
}

function renderLaughOutcomeButtons(teller, listener) {
  return `
    <section class="laugh-outcomes">
      <button class="primary-btn laugh-result-btn" data-laugh-result="listener">
        😂 ${escapeHtml(listener.name)} a ri
      </button>

      <button class="danger-btn laugh-result-btn" data-laugh-result="teller">
        🤦 ${escapeHtml(teller.name)} a ri à sa propre blague
      </button>

      <button class="secondary-btn laugh-result-btn" data-laugh-result="none">
        😐 Personne n’a ri
      </button>
    </section>
  `;
}

function bindLaughOutcomeButtons() {
  document.querySelectorAll("[data-laugh-result]").forEach(btn => {
    btn.addEventListener("click", () => handleLaughResult(btn.dataset.laughResult));
  });
}

function handleLaughResult(resultType) {
  const game = state.laughDuel;
  const teller = state.players.find(player => player.id === game.currentTurnId);
  const listener = getOtherLaughPlayer(teller.id);

  if (resultType === "none") {
    game.currentTurnId = listener.id;
    game.currentJoke = null;
    game.punchlineVisible = false;
    renderLaughTurnTransition(teller, listener, null);
    return;
  }

  const laughingPlayer = resultType === "listener" ? listener : teller;
  game.lives[laughingPlayer.id] -= 1;

  if (game.lives[laughingPlayer.id] <= 0) {
    const winner = getOtherLaughPlayer(laughingPlayer.id);
    renderLaughDuelEnd(winner, laughingPlayer);
    return;
  }

  const nextTeller = listener;
  game.currentTurnId = nextTeller.id;
  game.currentJoke = null;
  game.punchlineVisible = false;

  renderLaughTurnTransition(teller, nextTeller, laughingPlayer);
}

function renderLaughTurnTransition(previousTeller, nextTeller, laughingPlayer) {
  title.textContent = laughingPlayer ? "Un rire de moins" : "Toujours sérieux";
  setBackVisible(false);

  const alcoholText = state.alcohol && laughingPlayer
    ? `<div class="alcohol-callout">🍻 ${escapeHtml(laughingPlayer.name)} prend une petite gorgée pour ce rire.</div>`
    : "";

  screen.innerHTML = `
    <section class="handoff-stage">
      <div class="success-mark">${laughingPlayer ? "😂" : "😐"}</div>
      <h2>${laughingPlayer ? `${escapeHtml(laughingPlayer.name)} a craqué !` : "Personne n’a ri."}</h2>
      <p>C’est maintenant à <strong>${escapeHtml(nextTeller.name)}</strong> de tenter sa chance.</p>
    </section>

    ${alcoholText}

    <button id="nextLaughTurn" class="primary-btn full">Tour suivant</button>
  `;

  document.querySelector("#nextLaughTurn").addEventListener("click", renderLaughTurnChoice);
}

function renderLaughDuelEnd(winner, loser) {
  title.textContent = "Fin du duel";
  setBackVisible(false);

  screen.innerHTML = `
    <section class="winner-stage">
      <div class="winner-crown">👑</div>
      <div class="giant-avatar">${avatarById(winner.avatarId).emoji}</div>
      <h2>${escapeHtml(winner.name)} gagne le duel !</h2>
      <p>${escapeHtml(loser.name)} a été la première personne à craquer.</p>
    </section>

    ${state.alcohol ? `<div class="alcohol-callout">🍻 ${escapeHtml(loser.name)} prend une gorgée de défaite.</div>` : ""}

    <div class="toolbar">
      <button id="laughRematch" class="secondary-btn">Revanche</button>
      <button id="laughOtherGame" class="primary-btn">Choisir un autre jeu</button>
    </div>
  `;

  document.querySelector("#laughRematch").addEventListener("click", () => {
    const game = state.laughDuel;
    game.currentTurnId = Math.random() < 0.5 ? game.player1Id : game.player2Id;
    game.currentJoke = null;
    game.punchlineVisible = false;
    game.usedJokeIds = [];
    game.lives = {
      [game.player1Id]: game.mode === "lives" ? 3 : 1,
      [game.player2Id]: game.mode === "lives" ? 3 : 1
    };
    renderLaughDuelIntro();
  });

  document.querySelector("#laughOtherGame").addEventListener("click", () => {
    state.laughDuel = null;
    renderPlayChoice();
  });
}

/* =========================================================
   QUI MENT LE MIEUX ?
   ========================================================= */

function resetBestLiarState() {
  state.bestLiar = {
    roundCount: 5,
    categories: ["excuses", "improbable", "quotidien", "dossiers", "chaos"],
    includeAdult: false,
    prompts: [],
    currentRound: 0,
    currentWriterIndex: 0,
    currentVoterIndex: 0,
    currentAnswers: [],
    currentVotes: {},
    scores: Object.fromEntries(state.players.map(player => [player.id, 0])),
    rounds: []
  };
}

function renderBestLiarSetup() {
  if (!state.bestLiar) resetBestLiarState();
  const game = state.bestLiar;

  title.textContent = "Qui ment le mieux ?";
  setBackVisible(true);

  screen.innerHTML = `
    <section class="hero compact-hero">
      <h2>🤥 Qui ment le mieux ?</h2>
      <p>Tout le monde invente un mensonge. Les réponses sont mélangées, puis le groupe vote pour la plus convaincante.</p>
    </section>

    <section class="card">
      <h2 class="section-title">Nombre de manches</h2>
      <div class="choice-row">
        ${[3, 5, 10].map(n => `
          <button class="choice-pill ${game.roundCount === n ? "active" : ""}" data-liar-rounds="${n}">${n}</button>
        `).join("")}
      </div>

      <div class="form-group top-gap">
        <label for="customLiarRounds">Personnalisé</label>
        <input id="customLiarRounds" class="text-input" type="number" min="1" max="30" value="${game.roundCount}">
      </div>
    </section>

    <section class="card">
      <h2 class="section-title">Types de situations</h2>
      <div class="check-grid">
        ${["excuses", "improbable", "quotidien", "dossiers", "chaos"].map(cat => `
          <label class="option-card mini-option">
            <input type="checkbox" data-liar-cat="${cat}" ${game.categories.includes(cat) ? "checked" : ""}>
            <span><strong>${liarCategoryLabels[cat]}</strong></span>
          </label>
        `).join("")}
      </div>
    </section>

    ${state.adult ? `
      <section class="card">
        <label class="option-card">
          <input id="liarAdultToggle" type="checkbox" ${game.includeAdult ? "checked" : ""}>
          <span>
            <strong>🔞 Ajouter les situations adultes</strong><br>
            <span class="helper">Ajoute des scénarios de crush, ex et rendez-vous plus osés.</span>
          </span>
        </label>
      </section>
    ` : ""}

    <section class="notice">
      Minimum : 3 joueurs. Il est impossible de voter pour son propre mensonge.
    </section>

    <button id="startBestLiar" class="primary-btn full">Lancer la partie</button>
  `;

  document.querySelectorAll("[data-liar-rounds]").forEach(btn => {
    btn.addEventListener("click", () => {
      game.roundCount = Number(btn.dataset.liarRounds);
      renderBestLiarSetup();
    });
  });

  document.querySelector("#customLiarRounds").addEventListener("input", e => {
    game.roundCount = Math.max(1, Math.min(30, Number(e.target.value) || 1));
  });

  document.querySelectorAll("[data-liar-cat]").forEach(input => {
    input.addEventListener("change", () => {
      const cat = input.dataset.liarCat;
      if (input.checked && !game.categories.includes(cat)) game.categories.push(cat);
      if (!input.checked) game.categories = game.categories.filter(c => c !== cat);
    });
  });

  const adultToggle = document.querySelector("#liarAdultToggle");
  if (adultToggle) {
    adultToggle.addEventListener("change", e => game.includeAdult = e.target.checked);
  }

  document.querySelector("#startBestLiar").addEventListener("click", startBestLiarGame);
}

async function startBestLiarGame() {
  const game = state.bestLiar;

  if (state.players.length < 3) {
    alert("Ajoute au moins 3 joueurs.");
    return;
  }

  if (!game.categories.length && !game.includeAdult) {
    alert("Choisis au moins une catégorie.");
    return;
  }

  screen.innerHTML = `<div class="notice">Préparation du concours de mythos…</div>`;

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

    game.prompts = shuffleArray(pool).slice(0, Math.min(game.roundCount, pool.length));
    game.roundCount = game.prompts.length;
    game.currentRound = 0;
    game.currentWriterIndex = 0;
    game.currentVoterIndex = 0;
    game.currentAnswers = [];
    game.currentVotes = {};
    game.scores = Object.fromEntries(state.players.map(player => [player.id, 0]));
    game.rounds = [];

    state.history = [];
    renderBestLiarRoundIntro();
  } catch (error) {
    screen.innerHTML = `
      <div class="notice">
        <strong>Impossible de lancer le jeu.</strong><br>
        ${escapeHtml(error.message)}
      </div>
      <button id="retryBestLiar" class="primary-btn full">Réessayer</button>
    `;

    document.querySelector("#retryBestLiar").addEventListener("click", startBestLiarGame);
  }
}

function currentBestLiarPrompt() {
  return state.bestLiar.prompts[state.bestLiar.currentRound];
}

function renderBestLiarRoundIntro() {
  const game = state.bestLiar;
  const prompt = currentBestLiarPrompt();

  game.currentWriterIndex = 0;
  game.currentVoterIndex = 0;
  game.currentAnswers = [];
  game.currentVotes = {};

  title.textContent = `Manche ${game.currentRound + 1}/${game.roundCount}`;
  setBackVisible(false);

  screen.innerHTML = `
    <section class="game-progress">
      <span>Manche ${game.currentRound + 1}/${game.roundCount}</span>
      <div class="progress-track">
        <div class="progress-fill" style="width:${((game.currentRound + 1) / game.roundCount) * 100}%"></div>
      </div>
    </section>

    <section class="question-stage liar-prompt-stage">
      <span class="category-chip">${liarCategoryLabels[prompt.category] || "🤥 Mensonge"}</span>
      <h2>${escapeHtml(prompt.prompt)}</h2>
      <p>Inventez chacun votre meilleure réponse. Plus elle semble crédible, plus vous avez de chances de piéger le groupe.</p>
    </section>

    <button id="startWritingLies" class="primary-btn full">Commencer les réponses</button>
  `;

  document.querySelector("#startWritingLies").addEventListener("click", renderBestLiarWriterGate);
}

function renderBestLiarWriterGate() {
  const game = state.bestLiar;
  const writer = state.players[game.currentWriterIndex];

  title.textContent = "Réponse secrète";

  screen.innerHTML = `
    <section class="handoff-stage">
      <div class="giant-avatar">${avatarById(writer.avatarId).emoji}</div>
      <h2>${escapeHtml(writer.name)}, à toi d’inventer.</h2>
      <p>Prends le téléphone sans montrer ta réponse aux autres.</p>
    </section>

    <button id="readyToLie" class="primary-btn full">Je suis prêt(e)</button>
  `;

  document.querySelector("#readyToLie").addEventListener("click", renderBestLiarWriterForm);
}

function renderBestLiarWriterForm() {
  const game = state.bestLiar;
  const writer = state.players[game.currentWriterIndex];
  const prompt = currentBestLiarPrompt();

  title.textContent = `${writer.name} invente`;

  screen.innerHTML = `
    <section class="card">
      <span class="category-chip">${liarCategoryLabels[prompt.category] || "🤥"}</span>
      <h2>${escapeHtml(prompt.prompt)}</h2>
    </section>

    <section class="card">
      <div class="form-group">
        <label for="lieAnswer">Ton mensonge</label>
        <textarea id="lieAnswer" class="text-input text-area" maxlength="280" placeholder="Écris une réponse suffisamment crédible pour tromper les autres…"></textarea>
        <span id="lieCounter" class="helper">0/280</span>
      </div>
    </section>

    <button id="saveLieAnswer" class="primary-btn full">Valider ma réponse</button>
  `;

  const textarea = document.querySelector("#lieAnswer");
  const counter = document.querySelector("#lieCounter");

  textarea.addEventListener("input", () => {
    counter.textContent = `${textarea.value.length}/280`;
  });

  document.querySelector("#saveLieAnswer").addEventListener("click", () => {
    const answer = textarea.value.trim();

    if (answer.length < 3) {
      alert("Écris une réponse un peu plus complète.");
      return;
    }

    game.currentAnswers.push({
      id: `answer_${game.currentRound}_${writer.id}`,
      playerId: writer.id,
      text: answer
    });

    game.currentWriterIndex += 1;

    if (game.currentWriterIndex < state.players.length) {
      renderBestLiarAnswerSaved();
    } else {
      game.currentAnswers = shuffleArray(game.currentAnswers);
      renderBestLiarRevealAnswers();
    }
  });
}

function renderBestLiarAnswerSaved() {
  const nextWriter = state.players[state.bestLiar.currentWriterIndex];

  title.textContent = "Réponse enregistrée";

  screen.innerHTML = `
    <section class="handoff-stage">
      <div class="success-mark">✓</div>
      <h2>Mensonge enregistré.</h2>
      <p>Passe maintenant le téléphone à <strong>${escapeHtml(nextWriter.name)}</strong>.</p>
    </section>

    <button id="nextLieWriter" class="primary-btn full">Continuer</button>
  `;

  document.querySelector("#nextLieWriter").addEventListener("click", renderBestLiarWriterGate);
}

function renderBestLiarRevealAnswers() {
  const game = state.bestLiar;
  const prompt = currentBestLiarPrompt();

  title.textContent = "Les mensonges sont prêts";
  setBackVisible(false);

  screen.innerHTML = `
    <section class="card centered-card">
      <span class="category-chip">${liarCategoryLabels[prompt.category] || "🤥"}</span>
      <h2>${escapeHtml(prompt.prompt)}</h2>
      <p class="helper">Lisez toutes les réponses à voix haute. Les auteurs restent secrets jusqu’aux résultats.</p>
    </section>

    <section class="anonymous-answer-list">
      ${game.currentAnswers.map((answer, index) => `
        <article class="anonymous-answer-card">
          <span class="answer-number">${index + 1}</span>
          <p>${escapeHtml(answer.text)}</p>
        </article>
      `).join("")}
    </section>

    <button id="startLieVotes" class="primary-btn full">Passer aux votes</button>
  `;

  document.querySelector("#startLieVotes").addEventListener("click", () => {
    game.currentVoterIndex = 0;
    renderBestLiarVoterGate();
  });
}

function renderBestLiarVoterGate() {
  const game = state.bestLiar;
  const voter = state.players[game.currentVoterIndex];

  title.textContent = "Vote secret";

  screen.innerHTML = `
    <section class="handoff-stage">
      <div class="giant-avatar">${avatarById(voter.avatarId).emoji}</div>
      <h2>${escapeHtml(voter.name)}, choisis le meilleur mensonge.</h2>
      <p>Tu ne pourras pas voter pour ta propre réponse.</p>
    </section>

    <button id="readyToVoteLie" class="primary-btn full">Je suis prêt(e)</button>
  `;

  document.querySelector("#readyToVoteLie").addEventListener("click", renderBestLiarVoteChoice);
}

function renderBestLiarVoteChoice() {
  const game = state.bestLiar;
  const voter = state.players[game.currentVoterIndex];

  title.textContent = `${voter.name} vote`;

  const availableAnswers = game.currentAnswers.filter(answer => answer.playerId !== voter.id);

  screen.innerHTML = `
    <section class="card centered-card">
      <span class="category-chip">Vote secret</span>
      <h2>Quel mensonge mérite ton vote ?</h2>
      <p class="helper">Choisis la réponse la plus drôle, crédible ou brillamment inventée.</p>
    </section>

    <section class="anonymous-answer-list">
      ${availableAnswers.map(answer => {
        const originalIndex = game.currentAnswers.findIndex(item => item.id === answer.id);

        return `
          <button class="anonymous-answer-card vote-answer-card" data-lie-vote="${answer.id}">
            <span class="answer-number">${originalIndex + 1}</span>
            <p>${escapeHtml(answer.text)}</p>
          </button>
        `;
      }).join("")}
    </section>
  `;

  document.querySelectorAll("[data-lie-vote]").forEach(btn => {
    btn.addEventListener("click", () => {
      game.currentVotes[voter.id] = btn.dataset.lieVote;
      game.currentVoterIndex += 1;

      if (game.currentVoterIndex < state.players.length) {
        renderBestLiarVoteSaved();
      } else {
        renderBestLiarResults();
      }
    });
  });
}

function renderBestLiarVoteSaved() {
  const nextVoter = state.players[state.bestLiar.currentVoterIndex];

  title.textContent = "Vote enregistré";

  screen.innerHTML = `
    <section class="handoff-stage">
      <div class="success-mark">✓</div>
      <h2>Vote enregistré.</h2>
      <p>Passe maintenant le téléphone à <strong>${escapeHtml(nextVoter.name)}</strong>.</p>
    </section>

    <button id="nextLieVoter" class="primary-btn full">Continuer</button>
  `;

  document.querySelector("#nextLieVoter").addEventListener("click", renderBestLiarVoterGate);
}

function calculateBestLiarResults() {
  const game = state.bestLiar;
  const counts = Object.fromEntries(game.currentAnswers.map(answer => [answer.id, 0]));

  Object.values(game.currentVotes).forEach(answerId => {
    counts[answerId] += 1;
  });

  const resultRows = game.currentAnswers
    .map(answer => {
      const author = state.players.find(player => player.id === answer.playerId);
      return {
        ...answer,
        author,
        votes: counts[answer.id]
      };
    })
    .sort((a, b) => b.votes - a.votes);

  const maxVotes = Math.max(...resultRows.map(row => row.votes));
  const winners = resultRows.filter(row => row.votes === maxVotes);

  return { resultRows, winners, maxVotes };
}

function renderBestLiarResults() {
  const game = state.bestLiar;
  const prompt = currentBestLiarPrompt();
  const result = calculateBestLiarResults();

  result.resultRows.forEach(row => {
    game.scores[row.playerId] += row.votes;
  });

  game.rounds.push({
    prompt,
    answers: game.currentAnswers.map(answer => ({ ...answer })),
    votes: { ...game.currentVotes },
    winners: result.winners.map(row => row.playerId)
  });

  title.textContent = "Les masques tombent";

  const alcoholText = state.alcohol && result.winners.length
    ? `<div class="alcohol-callout">🍻 ${result.winners.map(row => escapeHtml(row.author.name)).join(" et ")} ${result.winners.length > 1 ? "distribuent" : "distribue"} 2 petites gorgées.</div>`
    : "";

  screen.innerHTML = `
    <section class="card centered-card">
      <span class="category-chip">${liarCategoryLabels[prompt.category] || "🤥"}</span>
      <h2>${escapeHtml(prompt.prompt)}</h2>
    </section>

    ${result.winners.length > 1 ? `
      <section class="special-event tie">
        <strong>⚔️ Égalité parfaite.</strong>
        <p>${result.winners.map(row => escapeHtml(row.author.name)).join(" et ")} remportent cette manche.</p>
      </section>
    ` : `
      <section class="special-event unanimity">
        <strong>🤥 Meilleur mensonge de la manche</strong>
        <p>${escapeHtml(result.winners[0].author.name)} remporte ${result.maxVotes} vote${result.maxVotes > 1 ? "s" : ""}.</p>
      </section>
    `}

    <section class="liar-results-list">
      ${result.resultRows.map((row, index) => {
        const percentage = Math.round((row.votes / state.players.length) * 100);

        return `
          <article class="liar-result-card ${index === 0 ? "winner" : ""}">
            <div class="liar-result-header">
              <span class="result-avatar">${avatarById(row.author.avatarId).emoji}</span>
              <div>
                <strong>${escapeHtml(row.author.name)}</strong>
                <span>${row.votes} vote${row.votes > 1 ? "s" : ""} · ${percentage}%</span>
              </div>
            </div>

            <p>« ${escapeHtml(row.text)} »</p>
          </article>
        `;
      }).join("")}
    </section>

    ${alcoholText}

    <section class="score-strip">
      ${[...state.players]
        .sort((a, b) => game.scores[b.id] - game.scores[a.id])
        .map(player => `
          <span>${avatarById(player.avatarId).emoji} ${escapeHtml(player.name)} <strong>${game.scores[player.id]}</strong></span>
        `).join("")}
    </section>

    <button id="nextLiarRound" class="primary-btn full">
      ${game.currentRound + 1 >= game.roundCount ? "Voir le classement final" : "Manche suivante"}
    </button>
  `;

  document.querySelector("#nextLiarRound").addEventListener("click", () => {
    if (game.currentRound + 1 >= game.roundCount) {
      renderBestLiarEnd();
    } else {
      game.currentRound += 1;
      renderBestLiarRoundIntro();
    }
  });
}

function renderBestLiarEnd() {
  const game = state.bestLiar;
  const ranking = [...state.players].sort((a, b) => game.scores[b.id] - game.scores[a.id]);
  const topScore = game.scores[ranking[0].id];
  const champions = ranking.filter(player => game.scores[player.id] === topScore);

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
            <small>${game.scores[player.id]} votes gagnés</small>
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
          <span>${game.scores[player.id]} pts</span>
        </div>
      `).join("")}
    </section>

    <div class="toolbar">
      <button id="replayBestLiar" class="secondary-btn">Rejouer</button>
      <button id="otherGameBestLiar" class="primary-btn">Choisir un autre jeu</button>
    </div>
  `;

  document.querySelector("#replayBestLiar").addEventListener("click", () => {
    resetBestLiarState();
    renderBestLiarSetup();
  });

  document.querySelector("#otherGameBestLiar").addEventListener("click", () => {
    state.bestLiar = null;
    renderPlayChoice();
  });
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
    state.laughDuel = null;
    state.bestLiar = null;

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
  const whoUsActive = state.quiDeNous && state.quiDeNous.questions.length;
  const laughActive = state.laughDuel && state.laughDuel.jokePool.length;
  const liarActive = state.bestLiar && state.bestLiar.prompts.length;

  if (whoUsActive || laughActive || liarActive) return;
  renderSettings();
});

renderHome();

/* =========================================================
   AK'GAMES V0.7 — PACK AMBIANCE + REFONTE VISUELLE
   ========================================================= */

state.actionTruth = null;
state.ambiancePoll = null;

const V07_READY_GAMES = new Set([
  "Qui de nous ?",
  "Le premier qui rit a perdu",
  "Qui ment le mieux ?",
  "Action ou Vérité",
  "Action ou Vérité +18",
  "Je n’ai jamais",
  "Je n’ai jamais +18",
  "Tu préfères",
  "Tu préfères +18"
]);

const V07_GAME_ICONS = {
  "Action ou Vérité": "🎭",
  "Action ou Vérité +18": "🌶️",
  "Je n’ai jamais": "🙋",
  "Je n’ai jamais +18": "🔥",
  "Tu préfères": "⚖️",
  "Tu préfères +18": "💋",
  "Qui de nous ?": "👥",
  "Le premier qui rit a perdu": "😂",
  "Qui ment le mieux ?": "🤥"
};

renderHome = function () {
  state.history = [];
  title.textContent = "La soirée commence ici";
  setBackVisible(false);

  screen.innerHTML = `
    <section class="home-hero-v07">
      <div class="home-logo-shell">
        <img src="icons/icon-192.png" alt="" class="home-logo-v07">
      </div>
      <div class="home-hero-copy">
        <span class="home-kicker">LA BOÎTE À JEUX QUI TIENT DANS UNE POCHE</span>
        <h2>Une soirée.<br><em>Zéro temps mort.</em></h2>
        <p>Crée un salon, rassemble la bande et enchaîne les jeux sans jamais quitter la partie.</p>
        <div class="home-stat-row">
          <span>🎮 6 jeux complets</span>
          <span>📲 1 ou plusieurs téléphones</span>
          <span>⚡ lancement express</span>
        </div>
      </div>
      <div class="hero-orb hero-orb-one"></div>
      <div class="hero-orb hero-orb-two"></div>
    </section>

    <section class="home-action-stack">
      <button class="home-action-card home-action-primary" data-home-action="create">
        <span class="home-action-icon">✦</span>
        <span class="home-action-copy">
          <small>MODE SOIRÉE</small>
          <strong>Créer une partie</strong>
          <span>Ouvre un salon et joue chacun sur son téléphone.</span>
        </span>
        <span class="home-action-arrow">→</span>
      </button>

      <div class="home-action-grid">
        <button class="home-action-card home-action-secondary" data-home-action="join">
          <span class="home-action-icon">⌁</span>
          <span class="home-action-copy">
            <small>J’AI UN CODE</small>
            <strong>Rejoindre</strong>
            <span>Retrouve tes amis en quelques secondes.</span>
          </span>
          <span class="home-action-arrow">→</span>
        </button>

        <button class="home-action-card home-action-secondary home-action-phone" data-home-action="single">
          <span class="home-action-icon">▣</span>
          <span class="home-action-copy">
            <small>PASS & PLAY</small>
            <strong>Un téléphone</strong>
            <span>Ajoutez les joueurs puis passez-vous l’écran.</span>
          </span>
          <span class="home-action-arrow">→</span>
        </button>
      </div>
    </section>

    <section class="home-feature-strip">
      <article><span>🎭</span><div><strong>Pack Ambiance</strong><small>Action ou Vérité, Je n’ai jamais, Tu préfères</small></div></article>
      <article><span>🏆</span><div><strong>Soirée continue</strong><small>Score cumulé et historique conservés</small></div></article>
      <article><span>🌙</span><div><strong>Mode nuit premium</strong><small>Une interface pensée pour le téléphone</small></div></article>
    </section>
  `;

  document.querySelectorAll("[data-home-action]").forEach(button => {
    button.addEventListener("click", () => {
      const action = button.dataset.homeAction;
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
};

renderGames = function () {
  const category = categories.find(item => item.id === state.currentCategory);
  title.textContent = category.name;
  setBackVisible(true);

  screen.innerHTML = `
    <section class="catalog-intro">
      <span>${category.emoji}</span>
      <div>
        <small>CATÉGORIE</small>
        <strong>${escapeHtml(category.name)}</strong>
        <p>${escapeHtml(category.description)}</p>
      </div>
    </section>

    <section class="game-list game-list-v07">
      ${category.games.map(game => {
        const disabled = game === "Blind Test";
        const ready = V07_READY_GAMES.has(game);
        const icon = V07_GAME_ICONS[game] || "🎲";

        return `
          <button class="game-card game-card-v07 ${disabled ? "disabled" : ""}" ${disabled ? "disabled" : ""} data-game="${escapeHtml(game)}">
            <span class="game-card-icon">${icon}</span>
            <span class="game-card-copy">
              <strong>${escapeHtml(game)}</strong>
              <span class="helper">${disabled ? "Bientôt disponible" : ready ? "Prêt à lancer" : "À intégrer"}</span>
              <span class="game-meta">
                ${ready ? `<span class="badge green">✓ disponible</span>` : `<span class="badge">bientôt</span>`}
                ${state.alcohol && ready ? `<span class="badge green">🍻 option alcool</span>` : ""}
                ${game.includes("+18") ? `<span class="badge orange">🔞 adulte</span>` : ""}
              </span>
            </span>
            <span class="game-card-chevron">›</span>
          </button>
        `;
      }).join("")}
    </section>
  `;

  document.querySelectorAll("[data-game]:not([disabled])").forEach(button => {
    button.addEventListener("click", () => {
      const game = button.dataset.game;

      if (game === "Qui de nous ?") {
        pushScreen("games");
        resetWhoUsState();
        renderWhoUsSetup();
        return;
      }
      if (game === "Le premier qui rit a perdu") {
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
        pushScreen("games");
        resetBestLiarState();
        renderBestLiarSetup();
        return;
      }
      if (game === "Action ou Vérité" || game === "Action ou Vérité +18") {
        pushScreen("games");
        resetActionTruthState(game.includes("+18"));
        renderActionTruthSetup();
        return;
      }
      if (game === "Je n’ai jamais" || game === "Je n’ai jamais +18") {
        pushScreen("games");
        resetAmbiancePollState("never", game.includes("+18"));
        renderAmbiancePollSetup();
        return;
      }
      if (game === "Tu préfères" || game === "Tu préfères +18") {
        pushScreen("games");
        resetAmbiancePollState("would", game.includes("+18"));
        renderAmbiancePollSetup();
        return;
      }

      renderGamePlaceholder(game);
    });
  });
};

function resetActionTruthState(forceAdult = false) {
  state.actionTruth = {
    roundCount: 12,
    mode: "mix",
    includeAdult: Boolean(forceAdult),
    forceAdult: Boolean(forceAdult),
    prompts: [],
    currentIndex: 0,
    scores: Object.fromEntries(state.players.map(player => [player.id, 0])),
    results: []
  };
}

function renderActionTruthSetup() {
  if (!state.actionTruth) resetActionTruthState(false);
  const game = state.actionTruth;

  title.textContent = "Action ou Vérité";
  setBackVisible(true);

  screen.innerHTML = `
    <section class="game-cover game-cover-action">
      <span class="game-cover-icon">🎭</span>
      <div><small>PACK AMBIANCE</small><h2>Action ou Vérité</h2><p>Des confessions, de l’impro et juste assez de pression sociale.</p></div>
    </section>

    <section class="card setup-card-v07">
      <div class="form-group">
        <label for="actionTruthRounds">Nombre de tours</label>
        <select id="actionTruthRounds" class="text-input">
          ${[8, 12, 16, 20].map(value => `<option value="${value}" ${game.roundCount === value ? "selected" : ""}>${value} tours</option>`).join("")}
        </select>
      </div>
      <div class="form-group top-gap">
        <label for="actionTruthMode">Contenu</label>
        <select id="actionTruthMode" class="text-input">
          <option value="mix" ${game.mode === "mix" ? "selected" : ""}>Actions + Vérités</option>
          <option value="action" ${game.mode === "action" ? "selected" : ""}>Actions uniquement</option>
          <option value="truth" ${game.mode === "truth" ? "selected" : ""}>Vérités uniquement</option>
        </select>
      </div>
    </section>

    ${state.adult ? `
      <label class="option-card premium-toggle">
        <input id="actionTruthAdult" type="checkbox" ${game.includeAdult ? "checked" : ""} ${game.forceAdult ? "disabled" : ""}>
        <span><strong>🌶️ Ajouter les cartes adultes</strong><br><span class="helper">Plus osé, mais toujours fait pour jouer en groupe.</span></span>
      </label>
    ` : ""}

    <button id="startActionTruth" class="primary-btn full">Lancer la partie</button>
  `;

  document.querySelector("#actionTruthRounds").addEventListener("change", event => game.roundCount = Number(event.target.value));
  document.querySelector("#actionTruthMode").addEventListener("change", event => game.mode = event.target.value);
  document.querySelector("#actionTruthAdult")?.addEventListener("change", event => game.includeAdult = event.target.checked);
  document.querySelector("#startActionTruth").addEventListener("click", startActionTruthGame);
}

async function loadJsonFile(path, errorText) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(errorText);
  return response.json();
}

async function startActionTruthGame() {
  const game = state.actionTruth;
  screen.innerHTML = `<div class="notice">Mélange des cartes…</div>`;

  try {
    let pool = await loadJsonFile("data/action-verite.json", "Impossible de charger les cartes.");
    if (state.adult && game.includeAdult) {
      pool = pool.concat(await loadJsonFile("data/action-verite-adulte.json", "Impossible de charger les cartes adultes."));
    }
    if (game.mode !== "mix") pool = pool.filter(item => item.type === game.mode);
    game.prompts = shuffleArray(pool).slice(0, Math.min(game.roundCount, pool.length));
    game.currentIndex = 0;
    game.scores = Object.fromEntries(state.players.map(player => [player.id, 0]));
    game.results = [];
    renderActionTruthRound();
  } catch (error) {
    alert(error.message);
    renderActionTruthSetup();
  }
}

function renderActionTruthRound() {
  const game = state.actionTruth;
  if (game.currentIndex >= game.prompts.length) {
    renderActionTruthEnd();
    return;
  }

  const player = state.players[game.currentIndex % state.players.length];
  const prompt = game.prompts[game.currentIndex];
  const isAction = prompt.type === "action";
  title.textContent = isAction ? "À toi de jouer" : "Moment de vérité";
  setBackVisible(false);

  screen.innerHTML = `
    <section class="game-progress">
      <span>Tour ${game.currentIndex + 1}/${game.prompts.length}</span>
      <div class="progress-track"><div class="progress-fill" style="width:${((game.currentIndex + 1) / game.prompts.length) * 100}%"></div></div>
    </section>

    <section class="prompt-stage ${isAction ? "prompt-action" : "prompt-truth"}">
      <div class="prompt-player">
        <span>${avatarById(player.avatarId).emoji}</span>
        <div><small>C’EST AU TOUR DE</small><strong>${escapeHtml(player.name)}</strong></div>
      </div>
      <span class="prompt-type-chip">${isAction ? "⚡ ACTION" : "◉ VÉRITÉ"}</span>
      <h2>${escapeHtml(prompt.text)}</h2>
    </section>

    <section class="decision-grid">
      <button id="actionTruthDone" class="primary-btn">✓ C’est fait</button>
      <button id="actionTruthSkip" class="secondary-btn">Passer</button>
    </section>
    ${state.alcohol ? `<div class="alcohol-callout">🍻 Une carte passée = une petite gorgée. Doucement, la soirée est longue.</div>` : ""}
  `;

  document.querySelector("#actionTruthDone").addEventListener("click", () => finishActionTruthRound(true));
  document.querySelector("#actionTruthSkip").addEventListener("click", () => finishActionTruthRound(false));
}

function finishActionTruthRound(completed) {
  const game = state.actionTruth;
  const player = state.players[game.currentIndex % state.players.length];
  if (completed) game.scores[player.id] = Number(game.scores[player.id] || 0) + 1;
  game.results.push({ playerId: player.id, completed, promptId: game.prompts[game.currentIndex].id });
  game.currentIndex += 1;
  renderActionTruthRound();
}

function renderActionTruthEnd() {
  const game = state.actionTruth;
  const ranking = [...state.players].sort((a, b) => Number(game.scores[b.id] || 0) - Number(game.scores[a.id] || 0));
  title.textContent = "Fin de la partie";
  setBackVisible(false);

  screen.innerHTML = `
    <section class="winner-stage winner-stage-v07">
      <div class="winner-crown">🎭</div>
      <h2>${game.results.filter(item => item.completed).length} défis relevés</h2>
      <p>La dignité est peut-être partie, mais le groupe est encore là.</p>
    </section>
    <section class="final-ranking">
      ${ranking.map((player, index) => `<div class="ranking-row"><span class="ranking-position">${index + 1}</span><span class="result-avatar">${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong><span>${Number(game.scores[player.id] || 0)} pts</span></div>`).join("")}
    </section>
    <div class="toolbar"><button id="replayActionTruth" class="secondary-btn">Rejouer</button><button id="otherActionTruth" class="primary-btn">Autre jeu</button></div>
  `;
  document.querySelector("#replayActionTruth").addEventListener("click", () => { const adult = game.forceAdult; resetActionTruthState(adult); renderActionTruthSetup(); });
  document.querySelector("#otherActionTruth").addEventListener("click", () => { state.actionTruth = null; renderPlayChoice(); });
}

function resetAmbiancePollState(type, forceAdult = false) {
  state.ambiancePoll = {
    type,
    roundCount: 10,
    includeAdult: Boolean(forceAdult),
    forceAdult: Boolean(forceAdult),
    items: [],
    currentIndex: 0,
    currentVoterIndex: 0,
    votes: {},
    scores: Object.fromEntries(state.players.map(player => [player.id, 0])),
    rounds: []
  };
}

function pollGameMeta(type) {
  return type === "never"
    ? { title: "Je n’ai jamais", icon: "🙋", description: "Réponds en secret, puis découvre qui a déjà franchi la ligne.", classic: "data/je-nai-jamais.json", adult: "data/je-nai-jamais-adulte.json" }
    : { title: "Tu préfères", icon: "⚖️", description: "Deux options impossibles. Aucun bouton pour fuir.", classic: "data/tu-preferes.json", adult: "data/tu-preferes-adulte.json" };
}

function renderAmbiancePollSetup() {
  const game = state.ambiancePoll;
  const meta = pollGameMeta(game.type);
  title.textContent = meta.title;
  setBackVisible(true);

  screen.innerHTML = `
    <section class="game-cover ${game.type === "never" ? "game-cover-never" : "game-cover-would"}">
      <span class="game-cover-icon">${meta.icon}</span>
      <div><small>PACK AMBIANCE</small><h2>${meta.title}</h2><p>${meta.description}</p></div>
    </section>
    <section class="card setup-card-v07">
      <div class="form-group"><label for="pollRounds">Nombre de questions</label><select id="pollRounds" class="text-input">${[8, 10, 15, 20].map(value => `<option value="${value}" ${game.roundCount === value ? "selected" : ""}>${value} questions</option>`).join("")}</select></div>
    </section>
    ${state.adult ? `<label class="option-card premium-toggle"><input id="pollAdult" type="checkbox" ${game.includeAdult ? "checked" : ""} ${game.forceAdult ? "disabled" : ""}><span><strong>🌶️ Ajouter les cartes adultes</strong><br><span class="helper">Des choix et révélations plus épicés.</span></span></label>` : ""}
    <button id="startPollGame" class="primary-btn full">Lancer la partie</button>
  `;

  document.querySelector("#pollRounds").addEventListener("change", event => game.roundCount = Number(event.target.value));
  document.querySelector("#pollAdult")?.addEventListener("change", event => game.includeAdult = event.target.checked);
  document.querySelector("#startPollGame").addEventListener("click", startAmbiancePollGame);
}

async function startAmbiancePollGame() {
  const game = state.ambiancePoll;
  const meta = pollGameMeta(game.type);
  screen.innerHTML = `<div class="notice">Préparation des questions…</div>`;
  try {
    let pool = await loadJsonFile(meta.classic, "Impossible de charger les questions.");
    if (state.adult && game.includeAdult) pool = pool.concat(await loadJsonFile(meta.adult, "Impossible de charger les questions adultes."));
    game.items = shuffleArray(pool).slice(0, Math.min(game.roundCount, pool.length));
    game.currentIndex = 0;
    game.currentVoterIndex = 0;
    game.votes = {};
    game.scores = Object.fromEntries(state.players.map(player => [player.id, 0]));
    game.rounds = [];
    renderAmbiancePollGate();
  } catch (error) {
    alert(error.message);
    renderAmbiancePollSetup();
  }
}

function renderAmbiancePollGate() {
  const game = state.ambiancePoll;
  if (game.currentIndex >= game.items.length) {
    renderAmbiancePollEnd();
    return;
  }
  if (game.currentVoterIndex >= state.players.length) {
    renderAmbiancePollReveal();
    return;
  }

  const player = state.players[game.currentVoterIndex];
  const meta = pollGameMeta(game.type);
  title.textContent = `Vote secret · ${meta.title}`;
  setBackVisible(false);

  screen.innerHTML = `
    <section class="game-progress"><span>Question ${game.currentIndex + 1}/${game.items.length}</span><div class="progress-track"><div class="progress-fill" style="width:${((game.currentIndex + 1) / game.items.length) * 100}%"></div></div></section>
    <section class="handoff-stage handoff-v07">
      <div class="giant-avatar">${avatarById(player.avatarId).emoji}</div>
      <span class="category-chip">ÉCRAN PRIVÉ</span>
      <h2>Passe le téléphone à ${escapeHtml(player.name)}</h2>
      <p>Les autres ne regardent pas. Promis, juré, téléphone retourné.</p>
      <button id="openPrivateVote" class="primary-btn">Je suis ${escapeHtml(player.name)}</button>
    </section>
  `;
  document.querySelector("#openPrivateVote").addEventListener("click", renderAmbiancePollVote);
}

function renderAmbiancePollVote() {
  const game = state.ambiancePoll;
  const item = game.items[game.currentIndex];
  const meta = pollGameMeta(game.type);
  const player = state.players[game.currentVoterIndex];
  title.textContent = meta.title;

  screen.innerHTML = game.type === "never" ? `
    <section class="poll-question-stage poll-never-stage"><span class="prompt-type-chip">🙋 JE N’AI JAMAIS</span><h2>${escapeHtml(item.text.replace(/^Je n[’']ai jamais\s*/i, ""))}</h2><p>Alors ${escapeHtml(player.name)}, jamais… ou déjà ?</p></section>
    <section class="poll-choice-grid"><button class="poll-choice poll-choice-a" data-poll-vote="never"><strong>Jamais</strong><span>Pas moi. Innocence totale.</span></button><button class="poll-choice poll-choice-b" data-poll-vote="done"><strong>Déjà</strong><span>Oui, et j’assume presque.</span></button></section>
  ` : `
    <section class="poll-question-stage poll-would-stage"><span class="prompt-type-chip">⚖️ TU PRÉFÈRES</span><h2>Choisis ton camp</h2><p>${escapeHtml(player.name)}, impossible de répondre “ça dépend”.</p></section>
    <section class="poll-choice-grid"><button class="poll-choice poll-choice-a" data-poll-vote="A"><small>OPTION A</small><strong>${escapeHtml(item.optionA)}</strong></button><button class="poll-choice poll-choice-b" data-poll-vote="B"><small>OPTION B</small><strong>${escapeHtml(item.optionB)}</strong></button></section>
  `;

  document.querySelectorAll("[data-poll-vote]").forEach(button => button.addEventListener("click", () => {
    game.votes[player.id] = button.dataset.pollVote;
    game.currentVoterIndex += 1;
    renderAmbiancePollGate();
  }));
}

function calculatePollResult(game) {
  const values = Object.values(game.votes);
  const labels = game.type === "never" ? ["never", "done"] : ["A", "B"];
  const counts = Object.fromEntries(labels.map(label => [label, values.filter(value => value === label).length]));
  const minority = counts[labels[0]] === counts[labels[1]] ? null : (counts[labels[0]] < counts[labels[1]] ? labels[0] : labels[1]);
  const minorityIds = minority ? Object.entries(game.votes).filter(([, value]) => value === minority).map(([id]) => id) : [];
  return { counts, minority, minorityIds };
}

function renderAmbiancePollReveal() {
  const game = state.ambiancePoll;
  const item = game.items[game.currentIndex];
  const result = calculatePollResult(game);
  const meta = pollGameMeta(game.type);
  const optionLabel = value => game.type === "never" ? (value === "never" ? "Jamais" : "Déjà") : (value === "A" ? item.optionA : item.optionB);
  result.minorityIds.forEach(id => game.scores[id] = Number(game.scores[id] || 0) + 1);
  game.rounds.push({ itemId: item.id, votes: { ...game.votes }, minorityIds: result.minorityIds });

  title.textContent = "Le groupe a parlé";
  setBackVisible(false);
  screen.innerHTML = `
    <section class="reveal-stage reveal-v07">
      <span class="game-cover-icon">${meta.icon}</span>
      <h2>${game.type === "never" ? escapeHtml(item.text) : "Le verdict est tombé"}</h2>
      ${game.type === "would" ? `<div class="reveal-dilemma"><span>${escapeHtml(item.optionA)}</span><b>VS</b><span>${escapeHtml(item.optionB)}</span></div>` : ""}
    </section>
    <section class="poll-results-grid">
      ${state.players.map(player => `<article class="poll-result-person"><span>${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong><small>${escapeHtml(optionLabel(game.votes[player.id]))}</small>${result.minorityIds.includes(player.id) ? `<em>+1 pt minorité</em>` : ""}</article>`).join("")}
    </section>
    ${state.alcohol && game.type === "never" ? `<div class="alcohol-callout">🍻 Les personnes qui ont répondu “Déjà” prennent une petite gorgée.</div>` : ""}
    <button id="nextPollRound" class="primary-btn full">${game.currentIndex + 1 >= game.items.length ? "Voir le classement" : "Question suivante"}</button>
  `;

  document.querySelector("#nextPollRound").addEventListener("click", () => {
    game.currentIndex += 1;
    game.currentVoterIndex = 0;
    game.votes = {};
    renderAmbiancePollGate();
  });
}

function renderAmbiancePollEnd() {
  const game = state.ambiancePoll;
  const meta = pollGameMeta(game.type);
  const ranking = [...state.players].sort((a, b) => Number(game.scores[b.id] || 0) - Number(game.scores[a.id] || 0));
  title.textContent = "Classement final";
  setBackVisible(false);
  screen.innerHTML = `
    <section class="winner-stage winner-stage-v07"><div class="winner-crown">${meta.icon}🏆</div><h2>Les esprits libres sont devant</h2><p>Un point était gagné à chaque réponse minoritaire.</p></section>
    <section class="final-ranking">${ranking.map((player, index) => `<div class="ranking-row"><span class="ranking-position">${index + 1}</span><span class="result-avatar">${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong><span>${Number(game.scores[player.id] || 0)} pts</span></div>`).join("")}</section>
    <div class="toolbar"><button id="replayPoll" class="secondary-btn">Rejouer</button><button id="otherPoll" class="primary-btn">Autre jeu</button></div>
  `;
  document.querySelector("#replayPoll").addEventListener("click", () => { const { type, forceAdult } = game; resetAmbiancePollState(type, forceAdult); renderAmbiancePollSetup(); });
  document.querySelector("#otherPoll").addEventListener("click", () => { state.ambiancePoll = null; renderPlayChoice(); });
}

settingsBtn.addEventListener("click", event => {
  const ambianceActive = Boolean(state.actionTruth?.prompts?.length || state.ambiancePoll?.items?.length);
  if (!ambianceActive) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}, true);

renderHome();

/* =========================================================
   AK'GAMES V0.8 — CONNEXION & SECRETS
   Même cerveau · Minorité · Qui a répondu ça ?
   ========================================================= */

state.sameBrain = null;
state.minorityGame = null;
state.whoAnswered = null;

const V08_NEW_GAMES = new Set([
  "Même cerveau",
  "Minorité",
  "Qui a répondu ça ?"
]);

const V08_READY_GAMES = new Set([...V07_READY_GAMES, ...V08_NEW_GAMES]);
const V08_GAME_ICONS = {
  ...V07_GAME_ICONS,
  "Même cerveau": "🧠",
  "Minorité": "🪩",
  "Qui a répondu ça ?": "🕵️"
};

renderHome = function () {
  state.history = [];
  title.textContent = "La soirée commence ici";
  setBackVisible(false);

  screen.innerHTML = `
    <section class="home-hero-v07 home-hero-v08">
      <div class="home-logo-shell">
        <img src="icons/icon-192.png" alt="" class="home-logo-v07">
      </div>
      <div class="home-hero-copy">
        <span class="home-kicker">LA BOÎTE À JEUX QUI TIENT DANS UNE POCHE</span>
        <h2>Une soirée.<br><em>Zéro temps mort.</em></h2>
        <p>Crée un salon, rassemble la bande et enchaîne les jeux sans jamais quitter la partie.</p>
        <div class="home-stat-row">
          <span>🎮 9 jeux complets</span>
          <span>📲 1 ou plusieurs téléphones</span>
          <span>⚡ lancement express</span>
        </div>
      </div>
      <div class="hero-orb hero-orb-one"></div>
      <div class="hero-orb hero-orb-two"></div>
    </section>

    <section class="home-action-stack">
      <button class="home-action-card home-action-primary" data-home-action="create">
        <span class="home-action-icon">✦</span>
        <span class="home-action-copy">
          <small>MODE SOIRÉE</small>
          <strong>Créer une partie</strong>
          <span>Ouvre un salon et joue chacun sur son téléphone.</span>
        </span>
        <span class="home-action-arrow">→</span>
      </button>

      <div class="home-action-grid">
        <button class="home-action-card home-action-secondary" data-home-action="join">
          <span class="home-action-icon">⌁</span>
          <span class="home-action-copy">
            <small>J’AI UN CODE</small>
            <strong>Rejoindre</strong>
            <span>Retrouve tes amis en quelques secondes.</span>
          </span>
          <span class="home-action-arrow">→</span>
        </button>

        <button class="home-action-card home-action-secondary home-action-phone" data-home-action="single">
          <span class="home-action-icon">▣</span>
          <span class="home-action-copy">
            <small>PASS & PLAY</small>
            <strong>Un téléphone</strong>
            <span>Ajoutez les joueurs puis passez-vous l’écran.</span>
          </span>
          <span class="home-action-arrow">→</span>
        </button>
      </div>
    </section>

    <section class="home-feature-strip">
      <article><span>🧠</span><div><strong>Connexion & Secrets</strong><small>Même cerveau, Minorité, Qui a répondu ça ?</small></div></article>
      <article><span>🏆</span><div><strong>Soirée continue</strong><small>Score cumulé et historique conservés</small></div></article>
      <article><span>🌙</span><div><strong>9 jeux complets</strong><small>Ambiance, bluff, rire et révélations</small></div></article>
    </section>
  `;

  document.querySelectorAll("[data-home-action]").forEach(button => {
    button.addEventListener("click", () => {
      const action = button.dataset.homeAction;
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
};

renderGames = function () {
  const category = categories.find(item => item.id === state.currentCategory);
  title.textContent = category.name;
  setBackVisible(true);

  screen.innerHTML = `
    <section class="catalog-intro">
      <span>${category.emoji}</span>
      <div>
        <small>CATÉGORIE</small>
        <strong>${escapeHtml(category.name)}</strong>
        <p>${escapeHtml(category.description)}</p>
      </div>
    </section>

    <section class="game-list game-list-v07">
      ${category.games.map(game => {
        const disabled = game === "Blind Test";
        const ready = V08_READY_GAMES.has(game);
        const isNew = V08_NEW_GAMES.has(game);
        const icon = V08_GAME_ICONS[game] || "🎲";

        return `
          <button class="game-card game-card-v07 ${disabled ? "disabled" : ""} ${isNew ? "game-card-new" : ""}" ${disabled ? "disabled" : ""} data-game="${escapeHtml(game)}">
            <span class="game-card-icon">${icon}</span>
            <span class="game-card-copy">
              <strong>${escapeHtml(game)} ${isNew ? `<span class="new-ribbon">NOUVEAU</span>` : ""}</strong>
              <span class="helper">${disabled ? "Bientôt disponible" : ready ? "Prêt à lancer" : "À intégrer"}</span>
              <span class="game-meta">
                ${ready ? `<span class="badge green">✓ disponible</span>` : `<span class="badge">bientôt</span>`}
                ${state.alcohol && ready ? `<span class="badge green">🍻 option alcool</span>` : ""}
                ${game.includes("+18") ? `<span class="badge orange">🔞 adulte</span>` : ""}
              </span>
            </span>
            <span class="game-card-chevron">›</span>
          </button>
        `;
      }).join("")}
    </section>
  `;

  document.querySelectorAll("[data-game]:not([disabled])").forEach(button => {
    button.addEventListener("click", () => {
      const game = button.dataset.game;

      if (game === "Qui de nous ?") {
        pushScreen("games");
        resetWhoUsState();
        renderWhoUsSetup();
        return;
      }
      if (game === "Le premier qui rit a perdu") {
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
        pushScreen("games");
        resetBestLiarState();
        renderBestLiarSetup();
        return;
      }
      if (game === "Action ou Vérité" || game === "Action ou Vérité +18") {
        pushScreen("games");
        resetActionTruthState(game.includes("+18"));
        renderActionTruthSetup();
        return;
      }
      if (game === "Je n’ai jamais" || game === "Je n’ai jamais +18") {
        pushScreen("games");
        resetAmbiancePollState("never", game.includes("+18"));
        renderAmbiancePollSetup();
        return;
      }
      if (game === "Tu préfères" || game === "Tu préfères +18") {
        pushScreen("games");
        resetAmbiancePollState("would", game.includes("+18"));
        renderAmbiancePollSetup();
        return;
      }
      if (game === "Même cerveau") {
        pushScreen("games");
        resetSameBrainState();
        renderSameBrainSetup();
        return;
      }
      if (game === "Minorité") {
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
        pushScreen("games");
        resetWhoAnsweredState();
        renderWhoAnsweredSetup();
        return;
      }

      renderGamePlaceholder(game);
    });
  });
};

function normalizeBrainAnswer(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(un|une|le|la|les|des|du|de|l|d)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function scoreRanking(scores) {
  return [...state.players].sort((a, b) => Number(scores[b.id] || 0) - Number(scores[a.id] || 0));
}

function renderV08Final({ icon, titleText, description, scores, replayId, otherId, replay, other }) {
  const ranking = scoreRanking(scores);
  title.textContent = "Classement final";
  setBackVisible(false);
  screen.innerHTML = `
    <section class="winner-stage winner-stage-v07 v08-final-stage">
      <div class="winner-crown">${icon}🏆</div>
      <h2>${escapeHtml(titleText)}</h2>
      <p>${escapeHtml(description)}</p>
    </section>
    <section class="final-ranking">
      ${ranking.map((player, index) => `
        <div class="ranking-row">
          <span class="ranking-position">${index + 1}</span>
          <span class="result-avatar">${avatarById(player.avatarId).emoji}</span>
          <strong>${escapeHtml(player.name)}</strong>
          <span>${Number(scores[player.id] || 0)} pts</span>
        </div>
      `).join("")}
    </section>
    <div class="toolbar"><button id="${replayId}" class="secondary-btn">Rejouer</button><button id="${otherId}" class="primary-btn">Autre jeu</button></div>
  `;
  document.querySelector(`#${replayId}`).addEventListener("click", replay);
  document.querySelector(`#${otherId}`).addEventListener("click", other);
}

/* ---------- MÊME CERVEAU ---------- */

function resetSameBrainState() {
  state.sameBrain = {
    roundCount: 10,
    includeAdult: false,
    items: [],
    currentIndex: 0,
    currentWriterIndex: 0,
    answers: {},
    scores: Object.fromEntries(state.players.map(player => [player.id, 0])),
    rounds: []
  };
}

function renderSameBrainSetup() {
  if (!state.sameBrain) resetSameBrainState();
  const game = state.sameBrain;
  title.textContent = "Même cerveau";
  setBackVisible(true);
  screen.innerHTML = `
    <section class="game-cover game-cover-brain">
      <span class="game-cover-icon">🧠</span>
      <div><small>CONNEXION & SECRETS</small><h2>Même cerveau</h2><p>Écrivez sans vous concerter. Les réponses identiques font grimper le score.</p></div>
    </section>
    <section class="card setup-card-v07">
      <div class="form-group"><label for="brainRounds">Nombre de questions</label><select id="brainRounds" class="text-input">${[6, 8, 10, 15].map(value => `<option value="${value}" ${game.roundCount === value ? "selected" : ""}>${value} questions</option>`).join("")}</select></div>
    </section>
    ${state.adult ? `<label class="option-card premium-toggle"><input id="brainAdult" type="checkbox" ${game.includeAdult ? "checked" : ""}><span><strong>🌶️ Ajouter les cartes adultes</strong><br><span class="helper">Crushs, rendez-vous et petits dossiers.</span></span></label>` : ""}
    <div class="notice">Une réponse courte fonctionne mieux : un mot ou une petite expression.</div>
    <button id="startSameBrain" class="primary-btn full">Synchroniser les cerveaux</button>
  `;
  document.querySelector("#brainRounds").addEventListener("change", event => game.roundCount = Number(event.target.value));
  document.querySelector("#brainAdult")?.addEventListener("change", event => game.includeAdult = event.target.checked);
  document.querySelector("#startSameBrain").addEventListener("click", startSameBrainGame);
}

async function startSameBrainGame() {
  const game = state.sameBrain;
  screen.innerHTML = `<div class="notice">Connexion des neurones…</div>`;
  try {
    let pool = await loadJsonFile("data/meme-cerveau.json", "Impossible de charger les questions de Même cerveau.");
    if (state.adult && game.includeAdult) pool = pool.concat(await loadJsonFile("data/meme-cerveau-adulte.json", "Impossible de charger les questions adultes."));
    game.items = shuffleArray(pool).slice(0, Math.min(game.roundCount, pool.length));
    game.currentIndex = 0;
    game.currentWriterIndex = 0;
    game.answers = {};
    game.rounds = [];
    game.scores = Object.fromEntries(state.players.map(player => [player.id, 0]));
    renderSameBrainGate();
  } catch (error) {
    alert(error.message);
    renderSameBrainSetup();
  }
}

function renderSameBrainGate() {
  const game = state.sameBrain;
  if (game.currentIndex >= game.items.length) {
    renderSameBrainEnd();
    return;
  }
  if (game.currentWriterIndex >= state.players.length) {
    renderSameBrainReveal();
    return;
  }
  const player = state.players[game.currentWriterIndex];
  title.textContent = "Réponse secrète";
  setBackVisible(false);
  screen.innerHTML = `
    ${renderV08Progress(game.currentIndex + 1, game.items.length, "Question")}
    <section class="handoff-stage handoff-v07">
      <div class="giant-avatar">${avatarById(player.avatarId).emoji}</div>
      <span class="category-chip">ÉCRAN PRIVÉ</span>
      <h2>Passe le téléphone à ${escapeHtml(player.name)}</h2>
      <p>Un mot, pas de concertation, et surtout pas de regard par-dessus l’épaule.</p>
      <button id="openBrainAnswer" class="primary-btn">Je suis ${escapeHtml(player.name)}</button>
    </section>
  `;
  document.querySelector("#openBrainAnswer").addEventListener("click", renderSameBrainAnswer);
}

function renderV08Progress(current, total, label) {
  return `<section class="game-progress"><span>${escapeHtml(label)} ${current}/${total}</span><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, (current / Math.max(1, total)) * 100)}%"></div></div></section>`;
}

function renderSameBrainAnswer() {
  const game = state.sameBrain;
  const item = game.items[game.currentIndex];
  const player = state.players[game.currentWriterIndex];
  title.textContent = "Même cerveau";
  screen.innerHTML = `
    ${renderV08Progress(game.currentIndex + 1, game.items.length, "Question")}
    <section class="v08-question-card brain-question-card"><span>🧠</span><small>RÉPONDS DU PREMIER COUP</small><h2>${escapeHtml(item.prompt)}</h2></section>
    <section class="card"><div class="form-group"><label for="brainAnswer">Ta réponse, ${escapeHtml(player.name)}</label><input id="brainAnswer" class="text-input v08-answer-input" maxlength="45" autocomplete="off" placeholder="Un mot ou une courte expression"></div></section>
    <button id="saveBrainAnswer" class="primary-btn full">Verrouiller ma réponse</button>
  `;
  const input = document.querySelector("#brainAnswer");
  input.focus();
  const save = () => {
    const value = input.value.trim();
    if (!value) return alert("Écris une réponse avant de continuer.");
    game.answers[player.id] = value;
    game.currentWriterIndex += 1;
    renderSameBrainGate();
  };
  document.querySelector("#saveBrainAnswer").addEventListener("click", save);
  input.addEventListener("keydown", event => { if (event.key === "Enter") save(); });
}

function calculateSameBrainRound(game) {
  const groups = {};
  Object.entries(game.answers).forEach(([id, answer]) => {
    const key = normalizeBrainAnswer(answer) || `unique_${id}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(id);
  });
  const matchedIds = [];
  const points = {};
  Object.values(groups).forEach(ids => {
    const amount = ids.length >= 2 ? Math.min(3, ids.length - 1) : 0;
    ids.forEach(id => {
      points[id] = amount;
      if (amount) {
        game.scores[id] = Number(game.scores[id] || 0) + amount;
        matchedIds.push(id);
      }
    });
  });
  return { groups, points, matchedIds };
}

function renderSameBrainReveal() {
  const game = state.sameBrain;
  const item = game.items[game.currentIndex];
  const result = calculateSameBrainRound(game);
  game.rounds.push({ itemId: item.id, answers: { ...game.answers }, points: result.points });
  title.textContent = result.matchedIds.length ? "Connexion détectée" : "Cerveaux indépendants";
  setBackVisible(false);
  screen.innerHTML = `
    <section class="reveal-stage reveal-v07 brain-reveal"><span class="game-cover-icon">${result.matchedIds.length ? "⚡" : "🧠"}</span><h2>${result.matchedIds.length ? "Des cerveaux se sont connectés !" : "Aucun match cette fois"}</h2><p>${escapeHtml(item.prompt)}</p></section>
    <section class="brain-answer-wall">
      ${state.players.map(player => {
        const points = Number(result.points[player.id] || 0);
        return `<article class="brain-answer-tile ${points ? "matched" : ""}"><span>${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong><p>${escapeHtml(game.answers[player.id])}</p>${points ? `<em>+${points} pt${points > 1 ? "s" : ""}</em>` : `<small>réponse unique</small>`}</article>`;
      }).join("")}
    </section>
    ${state.alcohol && !result.matchedIds.length ? `<div class="alcohol-callout">🍻 Aucun match : tout le monde prend une petite gorgée de désynchronisation.</div>` : ""}
    <button id="nextBrainRound" class="primary-btn full">${game.currentIndex + 1 >= game.items.length ? "Voir le classement" : "Question suivante"}</button>
  `;
  document.querySelector("#nextBrainRound").addEventListener("click", () => {
    game.currentIndex += 1;
    game.currentWriterIndex = 0;
    game.answers = {};
    renderSameBrainGate();
  });
}

function renderSameBrainEnd() {
  const game = state.sameBrain;
  renderV08Final({
    icon: "🧠",
    titleText: "Vos cerveaux ont rendu leur verdict",
    description: "Les réponses identiques rapportaient jusqu’à trois points.",
    scores: game.scores,
    replayId: "replaySameBrain",
    otherId: "otherSameBrain",
    replay: () => { resetSameBrainState(); renderSameBrainSetup(); },
    other: () => { state.sameBrain = null; renderPlayChoice(); }
  });
}

/* ---------- MINORITÉ ---------- */

function resetMinorityState() {
  state.minorityGame = {
    roundCount: 10,
    includeAdult: false,
    items: [],
    currentIndex: 0,
    currentVoterIndex: 0,
    votes: {},
    scores: Object.fromEntries(state.players.map(player => [player.id, 0])),
    rounds: []
  };
}

function renderMinoritySetup() {
  if (!state.minorityGame) resetMinorityState();
  const game = state.minorityGame;
  title.textContent = "Minorité";
  setBackVisible(true);
  screen.innerHTML = `
    <section class="game-cover game-cover-minority"><span class="game-cover-icon">🪩</span><div><small>CONNEXION & SECRETS</small><h2>Minorité</h2><p>Trois choix. Un seul objectif : ne surtout pas penser comme tout le monde.</p></div></section>
    <section class="card setup-card-v07"><div class="form-group"><label for="minorityRounds">Nombre de questions</label><select id="minorityRounds" class="text-input">${[6, 8, 10, 15].map(value => `<option value="${value}" ${game.roundCount === value ? "selected" : ""}>${value} questions</option>`).join("")}</select></div></section>
    ${state.adult ? `<label class="option-card premium-toggle"><input id="minorityAdult" type="checkbox" ${game.includeAdult ? "checked" : ""}><span><strong>🌶️ Ajouter les cartes adultes</strong><br><span class="helper">Relations, flirt et préférences plus personnelles.</span></span></label>` : ""}
    <div class="notice">Le ou les choix les moins populaires rapportent un point. Une égalité parfaite ne rapporte rien.</div>
    <button id="startMinority" class="primary-btn full">Entrer dans la minorité</button>
  `;
  document.querySelector("#minorityRounds").addEventListener("change", event => game.roundCount = Number(event.target.value));
  document.querySelector("#minorityAdult")?.addEventListener("change", event => game.includeAdult = event.target.checked);
  document.querySelector("#startMinority").addEventListener("click", startMinorityGame);
}

async function startMinorityGame() {
  const game = state.minorityGame;
  screen.innerHTML = `<div class="notice">Préparation des choix impossibles…</div>`;
  try {
    let pool = await loadJsonFile("data/minorite.json", "Impossible de charger les questions de Minorité.");
    if (state.adult && game.includeAdult) pool = pool.concat(await loadJsonFile("data/minorite-adulte.json", "Impossible de charger les questions adultes."));
    game.items = shuffleArray(pool).slice(0, Math.min(game.roundCount, pool.length));
    game.currentIndex = 0;
    game.currentVoterIndex = 0;
    game.votes = {};
    game.rounds = [];
    game.scores = Object.fromEntries(state.players.map(player => [player.id, 0]));
    renderMinorityGate();
  } catch (error) {
    alert(error.message);
    renderMinoritySetup();
  }
}

function renderMinorityGate() {
  const game = state.minorityGame;
  if (game.currentIndex >= game.items.length) return renderMinorityEnd();
  if (game.currentVoterIndex >= state.players.length) return renderMinorityReveal();
  const player = state.players[game.currentVoterIndex];
  title.textContent = "Vote secret";
  setBackVisible(false);
  screen.innerHTML = `
    ${renderV08Progress(game.currentIndex + 1, game.items.length, "Question")}
    <section class="handoff-stage handoff-v07"><div class="giant-avatar">${avatarById(player.avatarId).emoji}</div><span class="category-chip">ÉCRAN PRIVÉ</span><h2>Passe le téléphone à ${escapeHtml(player.name)}</h2><p>Choisis avec ton instinct. Ou tente de deviner l’instinct des autres.</p><button id="openMinorityVote" class="primary-btn">Je suis ${escapeHtml(player.name)}</button></section>
  `;
  document.querySelector("#openMinorityVote").addEventListener("click", renderMinorityVote);
}

function renderMinorityVote() {
  const game = state.minorityGame;
  const item = game.items[game.currentIndex];
  title.textContent = "Minorité";
  screen.innerHTML = `
    ${renderV08Progress(game.currentIndex + 1, game.items.length, "Question")}
    <section class="v08-question-card minority-question-card"><span>🪩</span><small>CHOISIS TA VOIE</small><h2>${escapeHtml(item.question)}</h2></section>
    <section class="minority-choice-grid">${item.options.map((option, index) => `<button class="minority-choice" data-minority-vote="${index}"><small>OPTION ${String.fromCharCode(65 + index)}</small><strong>${escapeHtml(option)}</strong></button>`).join("")}</section>
  `;
  document.querySelectorAll("[data-minority-vote]").forEach(button => button.addEventListener("click", () => {
    const player = state.players[game.currentVoterIndex];
    game.votes[player.id] = Number(button.dataset.minorityVote);
    game.currentVoterIndex += 1;
    renderMinorityGate();
  }));
}

function calculateMinorityRound(game) {
  const item = game.items[game.currentIndex];
  const counts = item.options.map((_, index) => Object.values(game.votes).filter(value => Number(value) === index).length);
  const positive = counts.filter(value => value > 0);
  const allEqual = positive.length <= 1 || new Set(positive).size === 1;
  const minPositive = positive.length ? Math.min(...positive) : 0;
  const minorityOptions = allEqual ? [] : counts.map((count, index) => count === minPositive && count > 0 ? index : null).filter(index => index !== null);
  const winnerIds = Object.entries(game.votes).filter(([, choice]) => minorityOptions.includes(Number(choice))).map(([id]) => id);
  winnerIds.forEach(id => game.scores[id] = Number(game.scores[id] || 0) + 1);
  return { counts, minorityOptions, winnerIds };
}

function renderMinorityReveal() {
  const game = state.minorityGame;
  const item = game.items[game.currentIndex];
  const result = calculateMinorityRound(game);
  game.rounds.push({ itemId: item.id, votes: { ...game.votes }, ...result });
  title.textContent = result.winnerIds.length ? "La minorité gagne" : "Égalité totale";
  setBackVisible(false);
  screen.innerHTML = `
    <section class="reveal-stage reveal-v07 minority-reveal"><span class="game-cover-icon">🪩</span><h2>${result.winnerIds.length ? "Les esprits rares prennent le point" : "Impossible de départager le groupe"}</h2><p>${escapeHtml(item.question)}</p></section>
    <section class="minority-results">${item.options.map((option, index) => `<article class="minority-result ${result.minorityOptions.includes(index) ? "winner" : ""}"><div><small>OPTION ${String.fromCharCode(65 + index)}</small><strong>${escapeHtml(option)}</strong></div><span>${result.counts[index]} vote${result.counts[index] > 1 ? "s" : ""}</span></article>`).join("")}</section>
    <section class="poll-results-grid">${state.players.map(player => `<article class="poll-result-person"><span>${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong><small>${escapeHtml(item.options[game.votes[player.id]])}</small>${result.winnerIds.includes(player.id) ? `<em>+1 pt minorité</em>` : ""}</article>`).join("")}</section>
    ${state.alcohol && result.winnerIds.length ? `<div class="alcohol-callout">🍻 La majorité prend une petite gorgée. La minorité savoure sa victoire.</div>` : ""}
    <button id="nextMinorityRound" class="primary-btn full">${game.currentIndex + 1 >= game.items.length ? "Voir le classement" : "Question suivante"}</button>
  `;
  document.querySelector("#nextMinorityRound").addEventListener("click", () => {
    game.currentIndex += 1;
    game.currentVoterIndex = 0;
    game.votes = {};
    renderMinorityGate();
  });
}

function renderMinorityEnd() {
  const game = state.minorityGame;
  renderV08Final({
    icon: "🪩",
    titleText: "Les électrons libres sont devant",
    description: "Chaque choix réellement minoritaire rapportait un point.",
    scores: game.scores,
    replayId: "replayMinority",
    otherId: "otherMinority",
    replay: () => { resetMinorityState(); renderMinoritySetup(); },
    other: () => { state.minorityGame = null; renderPlayChoice(); }
  });
}

/* ---------- QUI A RÉPONDU ÇA ? ---------- */

function resetWhoAnsweredState() {
  state.whoAnswered = {
    roundCount: Math.max(6, state.players.length),
    includeAdult: false,
    items: [],
    currentIndex: 0,
    currentWriterIndex: 0,
    currentVoterIndex: 0,
    answers: {},
    votes: {},
    authorOrder: shuffleArray(state.players.map(player => player.id)),
    scores: Object.fromEntries(state.players.map(player => [player.id, 0])),
    rounds: []
  };
}

function renderWhoAnsweredSetup() {
  if (!state.whoAnswered) resetWhoAnsweredState();
  const game = state.whoAnswered;
  title.textContent = "Qui a répondu ça ?";
  setBackVisible(true);
  screen.innerHTML = `
    <section class="game-cover game-cover-who"><span class="game-cover-icon">🕵️</span><div><small>CONNEXION & SECRETS</small><h2>Qui a répondu ça ?</h2><p>Tout le monde répond. Une réponse devient mystérieuse. À vous de retrouver son auteur.</p></div></section>
    <section class="card setup-card-v07"><div class="form-group"><label for="whoAnsweredRounds">Nombre de manches</label><select id="whoAnsweredRounds" class="text-input">${[Math.max(6, state.players.length), 8, 10, 15].filter((value, index, array) => array.indexOf(value) === index).map(value => `<option value="${value}" ${game.roundCount === value ? "selected" : ""}>${value} manches</option>`).join("")}</select></div></section>
    ${state.adult ? `<label class="option-card premium-toggle"><input id="whoAnsweredAdult" type="checkbox" ${game.includeAdult ? "checked" : ""}><span><strong>🌶️ Ajouter les cartes adultes</strong><br><span class="helper">Crushs, relations et réponses plus révélatrices.</span></span></label>` : ""}
    <div class="notice">Bonne réponse : +1 point. L’auteur gagne un point pour chaque personne trompée.</div>
    <button id="startWhoAnswered" class="primary-btn full">Ouvrir l’enquête</button>
  `;
  document.querySelector("#whoAnsweredRounds").addEventListener("change", event => game.roundCount = Number(event.target.value));
  document.querySelector("#whoAnsweredAdult")?.addEventListener("change", event => game.includeAdult = event.target.checked);
  document.querySelector("#startWhoAnswered").addEventListener("click", startWhoAnsweredGame);
}

async function startWhoAnsweredGame() {
  const game = state.whoAnswered;
  screen.innerHTML = `<div class="notice">Distribution des carnets secrets…</div>`;
  try {
    let pool = await loadJsonFile("data/qui-a-repondu.json", "Impossible de charger les questions.");
    if (state.adult && game.includeAdult) pool = pool.concat(await loadJsonFile("data/qui-a-repondu-adulte.json", "Impossible de charger les questions adultes."));
    game.items = shuffleArray(pool).slice(0, Math.min(game.roundCount, pool.length));
    game.currentIndex = 0;
    game.currentWriterIndex = 0;
    game.currentVoterIndex = 0;
    game.answers = {};
    game.votes = {};
    game.authorOrder = shuffleArray(state.players.map(player => player.id));
    game.scores = Object.fromEntries(state.players.map(player => [player.id, 0]));
    game.rounds = [];
    renderWhoAnsweredWriteGate();
  } catch (error) {
    alert(error.message);
    renderWhoAnsweredSetup();
  }
}

function currentMysteryAuthorId(game) {
  return game.authorOrder[game.currentIndex % game.authorOrder.length];
}

function eligibleWhoAnsweredVoters(game) {
  const authorId = currentMysteryAuthorId(game);
  return state.players.filter(player => player.id !== authorId);
}

function renderWhoAnsweredWriteGate() {
  const game = state.whoAnswered;
  if (game.currentIndex >= game.items.length) return renderWhoAnsweredEnd();
  if (game.currentWriterIndex >= state.players.length) {
    game.currentVoterIndex = 0;
    return renderWhoAnsweredVoteGate();
  }
  const player = state.players[game.currentWriterIndex];
  title.textContent = "Réponse anonyme";
  setBackVisible(false);
  screen.innerHTML = `
    ${renderV08Progress(game.currentIndex + 1, game.items.length, "Enquête")}
    <section class="handoff-stage handoff-v07"><div class="giant-avatar">${avatarById(player.avatarId).emoji}</div><span class="category-chip">ÉCRAN PRIVÉ</span><h2>Passe le téléphone à ${escapeHtml(player.name)}</h2><p>Réponds sincèrement ou brillamment. Ton identité sera cachée.</p><button id="openWhoAnswer" class="primary-btn">Je suis ${escapeHtml(player.name)}</button></section>
  `;
  document.querySelector("#openWhoAnswer").addEventListener("click", renderWhoAnsweredWrite);
}

function renderWhoAnsweredWrite() {
  const game = state.whoAnswered;
  const item = game.items[game.currentIndex];
  const player = state.players[game.currentWriterIndex];
  title.textContent = "Qui a répondu ça ?";
  screen.innerHTML = `
    ${renderV08Progress(game.currentIndex + 1, game.items.length, "Enquête")}
    <section class="v08-question-card who-question-card"><span>🕵️</span><small>RÉPONSE ANONYME</small><h2>${escapeHtml(item.prompt)}</h2></section>
    <section class="card"><div class="form-group"><label for="whoAnswer">Ta réponse, ${escapeHtml(player.name)}</label><textarea id="whoAnswer" class="text-input text-area multi-answer-textarea" maxlength="180" placeholder="Écris une réponse courte et reconnaissable…"></textarea></div></section>
    <button id="saveWhoAnswer" class="primary-btn full">Déposer anonymement</button>
  `;
  const input = document.querySelector("#whoAnswer");
  input.focus();
  document.querySelector("#saveWhoAnswer").addEventListener("click", () => {
    const value = input.value.trim();
    if (!value) return alert("Écris une réponse avant de continuer.");
    game.answers[player.id] = value;
    game.currentWriterIndex += 1;
    renderWhoAnsweredWriteGate();
  });
}

function renderWhoAnsweredVoteGate() {
  const game = state.whoAnswered;
  const voters = eligibleWhoAnsweredVoters(game);
  if (game.currentVoterIndex >= voters.length) return renderWhoAnsweredReveal();
  const voter = voters[game.currentVoterIndex];
  title.textContent = "Enquête secrète";
  setBackVisible(false);
  screen.innerHTML = `
    ${renderV08Progress(game.currentIndex + 1, game.items.length, "Enquête")}
    <section class="handoff-stage handoff-v07"><div class="giant-avatar">${avatarById(voter.avatarId).emoji}</div><span class="category-chip">À TOI D’ENQUÊTER</span><h2>Passe le téléphone à ${escapeHtml(voter.name)}</h2><p>Une réponse a été choisie. Retrouve son auteur sans te faire influencer.</p><button id="openWhoVote" class="primary-btn">Je suis ${escapeHtml(voter.name)}</button></section>
  `;
  document.querySelector("#openWhoVote").addEventListener("click", renderWhoAnsweredVote);
}

function renderWhoAnsweredVote() {
  const game = state.whoAnswered;
  const item = game.items[game.currentIndex];
  const authorId = currentMysteryAuthorId(game);
  const voter = eligibleWhoAnsweredVoters(game)[game.currentVoterIndex];
  const candidates = state.players.filter(player => player.id !== voter.id);
  title.textContent = "Qui a répondu ça ?";
  screen.innerHTML = `
    ${renderV08Progress(game.currentIndex + 1, game.items.length, "Enquête")}
    <section class="mystery-answer-card"><small>${escapeHtml(item.prompt)}</small><blockquote>« ${escapeHtml(game.answers[authorId])} »</blockquote><span>QUI A ÉCRIT ÇA ?</span></section>
    <section class="suspect-grid">${candidates.map(player => `<button class="suspect-card" data-who-vote="${player.id}"><span>${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong></button>`).join("")}</section>
  `;
  document.querySelectorAll("[data-who-vote]").forEach(button => button.addEventListener("click", () => {
    game.votes[voter.id] = button.dataset.whoVote;
    game.currentVoterIndex += 1;
    renderWhoAnsweredVoteGate();
  }));
}

function calculateWhoAnsweredRound(game) {
  const authorId = currentMysteryAuthorId(game);
  const correctIds = Object.entries(game.votes).filter(([, guess]) => guess === authorId).map(([id]) => id);
  const fooledIds = Object.entries(game.votes).filter(([, guess]) => guess !== authorId).map(([id]) => id);
  correctIds.forEach(id => game.scores[id] = Number(game.scores[id] || 0) + 1);
  game.scores[authorId] = Number(game.scores[authorId] || 0) + fooledIds.length;
  return { authorId, correctIds, fooledIds };
}

function renderWhoAnsweredReveal() {
  const game = state.whoAnswered;
  const item = game.items[game.currentIndex];
  const result = calculateWhoAnsweredRound(game);
  const author = state.players.find(player => player.id === result.authorId);
  game.rounds.push({ itemId: item.id, answers: { ...game.answers }, votes: { ...game.votes }, ...result });
  title.textContent = "Identité révélée";
  setBackVisible(false);
  screen.innerHTML = `
    <section class="reveal-stage reveal-v07 who-reveal"><span class="game-cover-icon">${avatarById(author.avatarId).emoji}</span><h2>C’était ${escapeHtml(author.name)} !</h2><p>« ${escapeHtml(game.answers[result.authorId])} »</p></section>
    <section class="who-vote-results">${eligibleWhoAnsweredVoters(game).map(voter => {
      const guessed = state.players.find(player => player.id === game.votes[voter.id]);
      const correct = result.correctIds.includes(voter.id);
      return `<article class="who-vote-row ${correct ? "correct" : "fooled"}"><span>${avatarById(voter.avatarId).emoji}</span><strong>${escapeHtml(voter.name)}</strong><small>a choisi ${escapeHtml(guessed?.name || "?")}</small><em>${correct ? "+1 pt" : `trompé·e`}</em></article>`;
    }).join("")}</section>
    <details class="answer-wall-details"><summary>Voir toutes les réponses</summary><div class="anonymous-answer-list">${state.players.map(player => `<article class="anonymous-answer-card"><span class="answer-number">${avatarById(player.avatarId).emoji}</span><p><strong>${escapeHtml(player.name)}</strong><br>${escapeHtml(game.answers[player.id])}</p></article>`).join("")}</div></details>
    ${result.fooledIds.length ? `<div class="special-event"><strong>🕵️ ${escapeHtml(author.name)} a trompé ${result.fooledIds.length} personne${result.fooledIds.length > 1 ? "s" : ""}</strong><p>+${result.fooledIds.length} point${result.fooledIds.length > 1 ? "s" : ""} d’auteur mystérieux.</p></div>` : `<div class="notice">Tout le monde a retrouvé l’auteur. Couverture grillée.</div>`}
    ${state.alcohol && result.fooledIds.length ? `<div class="alcohol-callout">🍻 Les enquêteurs trompés prennent une petite gorgée.</div>` : ""}
    <button id="nextWhoAnswered" class="primary-btn full">${game.currentIndex + 1 >= game.items.length ? "Voir le classement" : "Enquête suivante"}</button>
  `;
  document.querySelector("#nextWhoAnswered").addEventListener("click", () => {
    game.currentIndex += 1;
    game.currentWriterIndex = 0;
    game.currentVoterIndex = 0;
    game.answers = {};
    game.votes = {};
    renderWhoAnsweredWriteGate();
  });
}

function renderWhoAnsweredEnd() {
  const game = state.whoAnswered;
  renderV08Final({
    icon: "🕵️",
    titleText: "L’enquête est classée",
    description: "Les bons détectives et les auteurs les plus trompeurs ont marqué des points.",
    scores: game.scores,
    replayId: "replayWhoAnswered",
    otherId: "otherWhoAnswered",
    replay: () => { resetWhoAnsweredState(); renderWhoAnsweredSetup(); },
    other: () => { state.whoAnswered = null; renderPlayChoice(); }
  });
}

settingsBtn.addEventListener("click", event => {
  const v08Active = Boolean(
    state.sameBrain?.items?.length
    || state.minorityGame?.items?.length
    || state.whoAnswered?.items?.length
  );
  if (!v08Active) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}, true);

renderHome();
