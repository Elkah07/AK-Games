const state = {
  history: [],
  mode: null,
  adult: false,
  alcohol: false,
  players: [],
  draftPlayer: { name: "", avatarId: null },
  currentCategory: null
};

const avatars = [
  { id: "frog", emoji: "🐸", name: "Grenouille" },
  { id: "ghost", emoji: "👻", name: "Fantôme" },
  { id: "dino", emoji: "🦖", name: "Dinosaure" },
  { id: "cat", emoji: "🐱", name: "Chat" },
  { id: "duck", emoji: "🦆", name: "Canard" },
  { id: "panda", emoji: "🐼", name: "Panda" },
  { id: "fox", emoji: "🦊", name: "Renard" },
  { id: "penguin", emoji: "🐧", name: "Pingouin" },
  { id: "robot", emoji: "🤖", name: "Robot" },
  { id: "alien", emoji: "👽", name: "Alien" },
  { id: "mushroom", emoji: "🍄", name: "Champignon" },
  { id: "octopus", emoji: "🐙", name: "Pieuvre" },
  { id: "bear", emoji: "🧸", name: "Ourson" },
  { id: "rabbit", emoji: "🐰", name: "Lapin" },
  { id: "cactus", emoji: "🌵", name: "Cactus" },
  { id: "dragon", emoji: "🐲", name: "Dragon" }
];

const categories = [
  {
    id: "ambiance", emoji: "🎉", name: "Jeux d’ambiance",
    description: "Votes, débats et révélations entre potes.",
    games: [
      "Action ou Vérité", "Qui de nous ?", "Je n’ai jamais", "Tu préfères",
      "Roulette de défis", "Même cerveau", "Minorité",
      "Tu me connais ou pas ?", "Le Classement secret"
    ]
  },
  {
    id: "rire", emoji: "😂", name: "Rire",
    description: "Impro, duels et fous rires.",
    games: [
      "Mime", "Imitation", "Le premier qui rit a perdu",
      "Plaide ta cause", "Le Faux Expert", "La Bombe"
    ]
  },
  {
    id: "quiz", emoji: "🧠", name: "Quiz",
    description: "Teste tes connaissances sur plein de thèmes.",
    games: [
      "Culture générale", "Cinéma", "Séries", "Musique", "Jeux vidéo",
      "Sport", "Histoire", "Géographie", "Devine le logo", "Vrai ou Faux"
    ]
  },
  {
    id: "rapide", emoji: "⚡", name: "Jeux rapides",
    description: "Des parties courtes à lancer en quelques secondes.",
    games: [
      "Devinettes", "Qui suis-je ?", "La Bombe", "Trouve l’intrus",
      "Mini défis chrono", "Blind Test"
    ]
  },
  {
    id: "bluff", emoji: "🕵️", name: "Bluff & Secrets",
    description: "Mensonges, soupçons et réponses anonymes.",
    games: [
      "Qui ment le mieux ?", "L’Imposteur sait presque tout",
      "Qui a répondu ça ?", "Le Faux Expert", "Fake ou Réel ?"
    ]
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
    games: [
      "Action ou Vérité +18", "Je n’ai jamais +18", "Questions osées",
      "Tu préfères +18", "Qui de nous ? +18", "Roulette adulte", "Jeux à boire"
    ]
  }
];

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

    <div class="notice">
      V0.1 : le mode local fonctionne. Le multijoueur en ligne est déjà prévu dans l’interface et sera branché ensuite.
    </div>
  `;

  screen.querySelectorAll("[data-home-action]").forEach(btn => {
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
      <span>
        <strong>🔞 Contenu adulte</strong><br>
        <span class="helper">Affiche les variantes +18 et les jeux osés.</span>
      </span>
    </label>

    <label class="option-card">
      <input id="alcoholToggle" type="checkbox" ${state.alcohol ? "checked" : ""}>
      <span>
        <strong>🍻 Mode alcool</strong><br>
        <span class="helper">Ajoute les règles à boire dans les jeux compatibles.</span>
      </span>
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

  const selected = state.draftPlayer.avatarId;

  screen.innerHTML = `
    <section class="card">
      <div class="form-group">
        <label for="playerName">Ton prénom</label>
        <input id="playerName" class="text-input" maxlength="20" placeholder="Ex. Kathie" value="${escapeHtml(state.draftPlayer.name)}">
      </div>
    </section>

    <section class="card">
      <h2 class="section-title">Choisis ton personnage</h2>
      <p class="helper">Les illustrations définitives viendront remplacer ces avatars de base.</p>
      <div class="spacer"></div>
      <div class="avatar-grid">
        ${avatars.map(a => `
          <button class="avatar-card ${selected === a.id ? "selected" : ""}" data-avatar="${a.id}">
            <span class="avatar-emoji">${a.emoji}</span>
            <span class="avatar-name">${a.name}</span>
          </button>
        `).join("")}
      </div>
    </section>

    <button id="savePlayer" class="primary-btn full">Ajouter le joueur</button>
  `;

  const nameInput = document.querySelector("#playerName");
  nameInput.addEventListener("input", e => state.draftPlayer.name = e.target.value);

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

  const roomCode = "AK-5824";

  screen.innerHTML = `
    <section class="card">
      <div class="badges">
        <span class="badge">${state.mode === "single" ? "📱 Un téléphone" : "📲 Plusieurs téléphones"}</span>
        ${state.adult ? `<span class="badge orange">🔞 Adulte</span>` : ""}
        ${state.alcohol ? `<span class="badge green">🍻 Alcool</span>` : ""}
      </div>

      ${state.mode !== "single" ? `
        <h2>${roomCode}</h2>
        <p class="helper">Le code est simulé dans cette V0.1. La synchronisation réseau sera ajoutée ensuite.</p>
      ` : ""}
    </section>

    <section>
      <h2 class="section-title">Joueurs (${state.players.length})</h2>
      <div class="player-list">
        ${state.players.map((p, index) => {
          const avatar = avatarById(p.avatarId);
          return `
            <div class="player-card">
              <div class="player-main">
                <div class="player-avatar">${avatar.emoji}</div>
                <div>
                  <strong>${escapeHtml(p.name)}</strong>
                  <div class="helper">${avatar.name}</div>
                </div>
              </div>
              <button class="danger-btn" data-remove-player="${p.id}" aria-label="Supprimer ${escapeHtml(p.name)}">Supprimer</button>
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

    <div class="notice">
      Le mode Mix sera réellement automatisé après l’intégration des premiers jeux.
    </div>
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
        return `
          <button class="game-card ${disabled ? "disabled" : ""}" ${disabled ? "disabled" : ""} data-game="${escapeHtml(game)}">
            <strong>${game}</strong>
            <span class="helper">${disabled ? "Bientôt disponible" : "Prêt à être intégré"}</span>
            <div class="game-meta">
              ${state.alcohol ? `<span class="badge green">🍻 mode alcool</span>` : ""}
              ${category.adultOnly ? `<span class="badge orange">🔞 adulte</span>` : ""}
            </div>
          </button>
        `;
      }).join("")}
    </section>
  `;

  document.querySelectorAll("[data-game]:not([disabled])").forEach(btn => {
    btn.addEventListener("click", () => renderGamePlaceholder(btn.dataset.game));
  });
}

function renderGamePlaceholder(gameName) {
  pushScreen("games");
  title.textContent = gameName;
  setBackVisible(true);

  screen.innerHTML = `
    <section class="hero">
      <h2 style="font-size:clamp(2rem,6vw,4rem)">${escapeHtml(gameName)}</h2>
      <p>Le jeu est déjà placé dans l’application. Sa mécanique complète sera branchée dans les prochaines versions.</p>
    </section>

    <section class="card">
      <div class="badges">
        <span class="badge">👥 ${state.players.length} joueurs</span>
        ${state.alcohol ? `<span class="badge green">🍻 Alcool activé</span>` : ""}
        ${state.adult ? `<span class="badge orange">🔞 Adulte activé</span>` : ""}
      </div>
    </section>

    <button id="backToGames" class="primary-btn full">Retour aux jeux</button>
  `;

  document.querySelector("#backToGames").addEventListener("click", renderGames);
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

    <div class="notice">
      La connexion à une vraie room sera ajoutée avec la couche multijoueur.
    </div>
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
    renderHome();
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

settingsBtn.addEventListener("click", renderSettings);

renderHome();
