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

const whoUsClassicCategories = [
  "drole",
  "chaos",
  "dossiers",
  "amitie",
  "soiree",
  "relations",
  "quotidien",
  "telephone_reseaux",
  "argent",
  "voyages",
  "travail_etudes",
  "nourriture",
  "personnalite_emotions",
  "crise",
  "survie",
  "futur",
  "valeurs",
  "role_groupe"
];

const whoUsCategoryLabels = {
  drole: "😂 Drôle",
  chaos: "💥 Chaos",
  dossiers: "👀 Dossiers",
  amitie: "🫶 Amitié",
  soiree: "🎉 Soirée",
  relations: "💘 Relations & crush",
  quotidien: "🏠 Quotidien",
  telephone_reseaux: "📱 Téléphone & réseaux",
  argent: "💸 Argent & dépenses",
  voyages: "✈️ Voyages",
  travail_etudes: "💼 Travail & études",
  nourriture: "🍟 Nourriture",
  personnalite_emotions: "🧠 Personnalité & émotions",
  crise: "🚨 Situations de crise",
  survie: "🧟 Survie & absurde",
  futur: "🔮 Futur & ambitions",
  valeurs: "⚖️ Valeurs & décisions",
  role_groupe: "👑 Rôle dans le groupe",
  personnalise: "✍️ Vos questions",
  adulte: "🔞 Osé"
};

const AK_WHO_US_CUSTOM_KEY = "akgames_who_us_custom_questions_v1";

function loadWhoUsCustomQuestions() {
  try {
    const parsed = JSON.parse(localStorage.getItem(AK_WHO_US_CUSTOM_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(item => item && typeof item.question === "string" && item.question.trim())
      .map((item, index) => ({
        id: String(item.id || `qdn_custom_${index}_${Date.now()}`),
        question: item.question.trim(),
        category: "personnalise",
        adult: false,
        custom: true
      }));
  } catch {
    return [];
  }
}

function saveWhoUsCustomQuestions(items) {
  try {
    localStorage.setItem(AK_WHO_US_CUSTOM_KEY, JSON.stringify(items));
  } catch {
    alert("Les questions personnalisées n'ont pas pu être enregistrées sur cet appareil.");
  }
}

function createWhoUsCustomQuestion(value) {
  let question = String(value || "").trim().replace(/\s+/g, " ");
  if (!question) return null;
  if (!/[?!.…]$/.test(question)) question += " ?";

  return {
    id: `qdn_custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    question,
    category: "personnalise",
    adult: false,
    custom: true
  };
}

function selectBalancedWhoUsItems(pool, count, namespace) {
  const safePool = Array.isArray(pool) ? pool.filter(Boolean) : [];
  const limit = Math.min(Math.max(0, Number(count || 0)), safePool.length);
  if (!limit) return [];

  const memory = loadRecentContentMemory();
  const recent = new Set(Array.isArray(memory[namespace]) ? memory[namespace] : []);
  const groups = new Map();

  safePool.forEach((item, index) => {
    const category = item.category || "autre";
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push({ item, id: contentItemId(item, index) });
  });

  groups.forEach((rows, category) => {
    const fresh = shuffleArray(rows.filter(row => !recent.has(row.id)));
    const alreadySeen = shuffleArray(rows.filter(row => recent.has(row.id)));
    groups.set(category, [...fresh, ...alreadySeen]);
  });

  const selected = [];
  let categoryOrder = shuffleArray([...groups.keys()]);

  while (selected.length < limit) {
    let added = false;

    categoryOrder.forEach(category => {
      if (selected.length >= limit) return;
      const rows = groups.get(category);
      if (!rows?.length) return;
      selected.push(rows.shift().item);
      added = true;
    });

    if (!added) break;
    categoryOrder = shuffleArray(categoryOrder.filter(category => groups.get(category)?.length));
  }

  rememberContentItems(namespace, selected, safePool.length);
  return selected;
}

const laughCategoryLabels = {
  nulles: "🥴 Blagues nulles",
  absurdes: "🌀 Absurdes",
  devinettes: "❓ Devinettes",
  observation: "👀 Vie quotidienne",
  adulte: "🔞 Adulte"
};

const liarClassicCategories = [
  "excuses",
  "quotidien",
  "dossiers",
  "improbable",
  "chaos",
  "celebrites",
  "exploits",
  "travail_ecole",
  "voyages",
  "soirees",
  "argent_luxe",
  "enfance_famille",
  "reseaux_tech",
  "relations_crush"
];

const liarCategoryLabels = {
  excuses: "🧾 Excuses",
  quotidien: "🏠 Quotidien",
  dossiers: "👀 Dossiers",
  improbable: "🛸 Improbable",
  chaos: "💥 Chaos",
  celebrites: "🌟 Célébrités",
  exploits: "🏆 Exploits & talents",
  travail_ecole: "💼 Travail & école",
  voyages: "✈️ Voyages",
  soirees: "🎉 Soirées",
  argent_luxe: "💸 Argent & luxe",
  enfance_famille: "🧸 Enfance & famille",
  reseaux_tech: "📱 Réseaux & technologie",
  relations_crush: "💘 Relations & crushs",
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

  if (visible) {
    document.body.classList.remove("ak-home-screen");
    backBtn.disabled = false;
    backBtn.textContent = "←";
    backBtn.removeAttribute("aria-hidden");
    backBtn.setAttribute("aria-label", "Retour");
  }
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

const AK_RECENT_CONTENT_KEY = "akgames_recent_content_v1";

function loadRecentContentMemory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(AK_RECENT_CONTENT_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveRecentContentMemory(memory) {
  try {
    localStorage.setItem(AK_RECENT_CONTENT_KEY, JSON.stringify(memory));
  } catch {
    // Le jeu reste jouable même si le stockage local est indisponible.
  }
}

function contentItemId(item, index = 0) {
  if (item && typeof item === "object" && item.id) return String(item.id);
  return `fallback_${index}_${JSON.stringify(item ?? null)}`;
}

function rememberContentItems(namespace, items, poolSize = 0) {
  if (!namespace || !Array.isArray(items) || !items.length) return;

  const memory = loadRecentContentMemory();
  const previous = Array.isArray(memory[namespace]) ? memory[namespace] : [];
  const selectedIds = items.map(contentItemId);
  const cap = Math.max(24, Math.min(120, Number(poolSize || 0) || selectedIds.length * 6));

  memory[namespace] = [
    ...selectedIds,
    ...previous.filter(id => !selectedIds.includes(id))
  ].slice(0, cap);

  saveRecentContentMemory(memory);
}

function selectFreshItems(pool, count, namespace) {
  const safePool = Array.isArray(pool) ? pool.filter(Boolean) : [];
  const limit = Math.min(Math.max(0, Number(count || 0)), safePool.length);
  if (!limit) return [];

  const memory = loadRecentContentMemory();
  const recent = new Set(Array.isArray(memory[namespace]) ? memory[namespace] : []);
  const fresh = safePool.filter((item, index) => !recent.has(contentItemId(item, index)));
  const selected = shuffleArray(fresh).slice(0, limit);

  if (selected.length < limit) {
    const chosen = new Set(selected.map(contentItemId));
    const fallback = safePool.filter((item, index) => !chosen.has(contentItemId(item, index)));
    selected.push(...shuffleArray(fallback).slice(0, limit - selected.length));
  }

  rememberContentItems(namespace, selected, safePool.length);
  return selected;
}

function selectBalancedLiarPrompts(pool, count, namespace) {
  const safePool = Array.isArray(pool) ? pool.filter(Boolean) : [];
  const safeCount = Math.min(Math.max(0, Number(count || 0)), safePool.length);
  if (!safeCount) return [];

  const grouped = safePool.reduce((acc, item) => {
    const category = item?.category || "autres";
    (acc[category] ||= []).push(item);
    return acc;
  }, {});

  const categoryIds = shuffleArray(Object.keys(grouped));
  const baseQuota = Math.floor(safeCount / categoryIds.length);
  let remainder = safeCount % categoryIds.length;
  const selected = [];

  categoryIds.forEach(category => {
    const quota = baseQuota + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    selected.push(...selectFreshItems(
      grouped[category],
      Math.min(quota, grouped[category].length),
      `${namespace}:${category}`
    ));
  });

  if (selected.length < safeCount) {
    const selectedIds = new Set(selected.map(contentItemId));
    const remaining = safePool.filter((item, index) => !selectedIds.has(contentItemId(item, index)));
    selected.push(...selectFreshItems(
      remaining,
      Math.min(safeCount - selected.length, remaining.length),
      `${namespace}:extra`
    ));
  }

  return shuffleArray(selected).slice(0, safeCount);
}

function chooseFreshItem(pool, namespace) {
  return selectFreshItems(pool, 1, namespace)[0] || null;
}

function isSoloGameRunning() {
  const activeCollections = [
    state.quiDeNous?.questions,
    state.laughDuel?.jokePool,
    state.bestLiar?.prompts,
    state.actionTruth?.prompts,
    state.ambiancePoll?.items,
    state.sameBrain?.items,
    state.minorityGame?.items,
    state.whoAnswered?.items,
    state.almostImpostor?.items,
    state.fakeExpert?.items,
    state.whoAmI?.items,
    state.megaGame?.items
  ];

  return activeCollections.some(collection => Array.isArray(collection) && collection.length > 0);
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

    <div class="notice">33 jeux disponibles · salon persistant · score cumulé · historique · soirée continue.</div>
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
      <span><strong>🍻 Mode alcool</strong><br><span class="helper">Ajoute des variantes de toast facultatives dans les jeux compatibles. Boissons sans alcool toujours possibles.</span></span>
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
        <input id="playerName" class="text-input" maxlength="20" autocomplete="nickname" autocapitalize="words" enterkeyhint="done" placeholder="Ex. Kathie" value="${escapeHtml(state.draftPlayer.name)}">
      </div>
    </section>

    <section class="card">
      <h2 class="section-title">Choisis ton personnage</h2>
      <p class="helper">Chaque mascotte a sa personnalité. Un personnage déjà choisi devient indisponible pour les autres joueurs.</p>
      <div class="spacer"></div>
      <div class="avatar-grid">
        ${avatars.map(a => `
          <button type="button" class="avatar-card ${state.draftPlayer.avatarId === a.id ? "selected" : ""}" data-avatar="${a.id}" aria-label="Choisir ${escapeHtml(a.name)}" aria-pressed="${state.draftPlayer.avatarId === a.id ? "true" : "false"}">
            <span class="avatar-emoji" aria-hidden="true">${a.emoji}</span>
            <span class="avatar-name">${a.name}</span>
          </button>
        `).join("")}
      </div>
    </section>

    <button id="savePlayer" class="primary-btn full">Ajouter le joueur</button>
  `;

  const playerNameInput = document.querySelector("#playerName");
  playerNameInput.addEventListener("input", e => state.draftPlayer.name = e.target.value);
  playerNameInput.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    document.querySelector("#savePlayer")?.click();
  });

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

    const normalizedName = name.toLocaleLowerCase("fr-FR");
    if (state.players.some(player => String(player.name || "").trim().toLocaleLowerCase("fr-FR") === normalizedName)) {
      alert("Ce prénom est déjà utilisé dans la partie. Choisis-en un autre pour éviter les confusions.");
      playerNameInput.focus();
      return;
    }

    if (state.players.some(player => player.avatarId === state.draftPlayer.avatarId)) {
      alert("Ce personnage est déjà utilisé dans la partie. Choisis-en un autre.");
      state.draftPlayer.avatarId = null;
      renderPlayerForm();
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

  const multiplayer = state.mode === "multi-host" || state.mode === "multi-guest";
  const randomDisabled = multiplayer && !state.isHost;

  screen.innerHTML = `
    <section class="grid grid-2">
      <button id="chooseGame" class="card action-card">
        <strong>🎮 Choisir un jeu</strong>
        <span>Parcours les catégories et lance un jeu précis.</span>
      </button>
      <button id="randomGame" class="card action-card" ${randomDisabled ? "disabled" : ""}>
        <strong>🎲 Jeu aléatoire</strong>
        <span>${randomDisabled ? "L’hôte choisit le prochain jeu." : "AK’Games choisit un jeu compatible avec votre groupe."}</span>
      </button>
    </section>

    <div class="notice">Le tirage évite les jeux joués récemment et respecte le nombre de joueurs ainsi que les options de la soirée.</div>
  `;

  document.querySelector("#chooseGame").addEventListener("click", () => {
    pushScreen("play-choice");
    renderCategories();
  });

  document.querySelector("#randomGame")?.addEventListener("click", async event => {
    event.currentTarget.disabled = true;
    try {
      if (multiplayer) {
        if (typeof window.AKGamesMultiplayer?.launchRandomGame !== "function") {
          throw new Error("Le tirage multijoueur n’est pas encore prêt. Réessaie dans un instant.");
        }
        await window.AKGamesMultiplayer.launchRandomGame();
        return;
      }
      launchRandomSoloGame();
    } catch (error) {
      console.error(error);
      event.currentTarget.disabled = false;
      alert(error.message || "Impossible de choisir un jeu aléatoire.");
    }
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


function resetWhoUsState(config = {}) {
  const savedCustomQuestions = loadWhoUsCustomQuestions();

  state.quiDeNous = {
    questionCount: Number(config.questionCount || 10),
    categories: [...(config.categories || whoUsClassicCategories)],
    includeAdult: Boolean(config.includeAdult),
    includeCustom: config.includeCustom !== false,
    customQuestions: savedCustomQuestions,
    alcoholIntensity: config.alcoholIntensity || "normal",
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
  const customCount = game.customQuestions.length;

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
        ${[5, 10, 20, 40, 60, 100].map(n => `
          <button class="choice-pill ${game.questionCount === n ? "active" : ""}" data-qcount="${n}">${n}</button>
        `).join("")}
      </div>

      <div class="form-group top-gap">
        <label for="customCount">Personnalisé, de 3 à 100 questions</label>
        <input id="customCount" class="text-input" type="number" min="3" max="100" value="${game.questionCount}">
      </div>
    </section>

    <section class="card">
      <h2 class="section-title">Choisir les thèmes</h2>
      <p class="helper">Tu peux en sélectionner un seul, plusieurs ou tous. Le mélange sera réparti équitablement.</p>

      <div class="check-grid top-gap">
        ${whoUsClassicCategories.map(cat => `
          <label class="option-card mini-option">
            <input type="checkbox" data-who-cat="${cat}" ${game.categories.includes(cat) ? "checked" : ""}>
            <span><strong>${whoUsCategoryLabels[cat]}</strong></span>
          </label>
        `).join("")}
      </div>

      <div class="toolbar top-gap">
        <button id="selectAllCats" class="secondary-btn">Tout sélectionner</button>
        <button id="clearAllCats" class="secondary-btn">Tout désélectionner</button>
      </div>
    </section>

    <section class="card">
      <h2 class="section-title">✍️ Ajouter vos propres questions</h2>
      <p class="helper">Elles restent enregistrées sur cet appareil. En multijoueur, les questions de l'hôte sont envoyées à toute la room pour cette partie.</p>

      <div class="form-group top-gap">
        <label for="customWhoUsQuestion">Nouvelle question</label>
        <input
          id="customWhoUsQuestion"
          class="text-input"
          type="text"
          maxlength="220"
          placeholder="Qui de nous pourrait disparaître trois jours pour regarder une série ?"
        >
      </div>
      <button id="addWhoUsCustom" class="secondary-btn full">Ajouter la question</button>

      <label class="option-card top-gap ${customCount ? "" : "disabled-option"}">
        <input id="includeCustomWhoToggle" type="checkbox" ${game.includeCustom && customCount ? "checked" : ""} ${customCount ? "" : "disabled"}>
        <span>
          <strong>Inclure mes questions (${customCount})</strong><br>
          <span class="helper">Elles seront mélangées aux thèmes choisis sans remplacer toute la base.</span>
        </span>
      </label>

      ${customCount ? `
        <details class="top-gap">
          <summary>Gérer mes ${customCount} question${customCount > 1 ? "s" : ""}</summary>
          <div class="stacked-choice top-gap">
            ${game.customQuestions.map(item => `
              <div class="option-card mini-option who-us-custom-row">
                <span>${escapeHtml(item.question)}</span>
                <button class="secondary-btn" data-remove-who-custom="${item.id}">Supprimer</button>
              </div>
            `).join("")}
          </div>
        </details>
      ` : ""}
    </section>

    ${state.adult ? `
      <section class="card">
        <label class="option-card">
          <input id="adultWhoToggle" type="checkbox" ${game.includeAdult ? "checked" : ""}>
          <span>
            <strong>🔞 Ajouter les questions osées</strong><br>
            <span class="helper">Ajoute 150 questions adultes aux thèmes classiques sélectionnés.</span>
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
    game.questionCount = Math.max(3, Math.min(100, Number(e.target.value) || 3));
  });

  document.querySelectorAll("[data-who-cat]").forEach(input => {
    input.addEventListener("change", () => {
      const cat = input.dataset.whoCat;
      if (input.checked && !game.categories.includes(cat)) game.categories.push(cat);
      if (!input.checked) game.categories = game.categories.filter(c => c !== cat);
    });
  });

  document.querySelector("#selectAllCats").addEventListener("click", () => {
    game.categories = [...whoUsClassicCategories];
    renderWhoUsSetup();
  });

  document.querySelector("#clearAllCats").addEventListener("click", () => {
    game.categories = [];
    renderWhoUsSetup();
  });

  document.querySelector("#addWhoUsCustom").addEventListener("click", () => {
    const input = document.querySelector("#customWhoUsQuestion");
    const customQuestion = createWhoUsCustomQuestion(input.value);

    if (!customQuestion) {
      alert("Écris d'abord une question.");
      input.focus();
      return;
    }

    const duplicate = game.customQuestions.some(item =>
      item.question.trim().toLocaleLowerCase("fr") === customQuestion.question.trim().toLocaleLowerCase("fr")
    );

    if (duplicate) {
      alert("Cette question personnalisée existe déjà.");
      return;
    }

    game.customQuestions.push(customQuestion);
    game.includeCustom = true;
    saveWhoUsCustomQuestions(game.customQuestions);
    renderWhoUsSetup();
  });

  document.querySelector("#customWhoUsQuestion").addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      document.querySelector("#addWhoUsCustom").click();
    }
  });

  document.querySelectorAll("[data-remove-who-custom]").forEach(button => {
    button.addEventListener("click", () => {
      game.customQuestions = game.customQuestions.filter(item => item.id !== button.dataset.removeWhoCustom);
      if (!game.customQuestions.length) game.includeCustom = false;
      saveWhoUsCustomQuestions(game.customQuestions);
      renderWhoUsSetup();
    });
  });

  const customToggle = document.querySelector("#includeCustomWhoToggle");
  if (customToggle) {
    customToggle.addEventListener("change", event => {
      game.includeCustom = event.target.checked;
    });
  }

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
  const hasCustomQuestions = game.includeCustom && game.customQuestions.length > 0;

  if (!game.categories.length && !game.includeAdult && !hasCustomQuestions) {
    alert("Choisis au moins un thème, active les questions adultes ou ajoute une question personnalisée.");
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

    if (hasCustomQuestions) {
      pool = pool.concat(game.customQuestions);
    }

    if (!pool.length) throw new Error("Aucune question ne correspond aux thèmes choisis.");

    game.questions = selectBalancedWhoUsItems(
      pool,
      Math.min(game.questionCount, pool.length),
      "solo:who-us"
    );
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
    return `🍻 ${result.winners.map(player => player.name).join(" et ")} peuvent trinquer avec la boisson de leur choix.`;
  }

  if (result.maxVotes === state.players.length) {
    return `🍻 Unanimité ! ${result.winners[0].name} peut proposer un toast au groupe, sans obligation de boire.`;
  }

  return `🍻 ${result.winners[0].name}, la personne la plus désignée, peut proposer un toast au groupe.`;
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
    resetWhoUsState({
      questionCount: game.questionCount,
      categories: game.categories,
      includeAdult: game.includeAdult,
      includeCustom: game.includeCustom,
      alcoholIntensity: game.alcoholIntensity
    });
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
                ${escapeHtml(avatarById(player.avatarId).name)} · ${escapeHtml(player.name)}
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
                ${escapeHtml(avatarById(player.avatarId).name)} · ${escapeHtml(player.name)}
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
    ? `<div class="alcohol-callout">🍻 ${escapeHtml(laughingPlayer.name)} peut trinquer avec la boisson de son choix pour ce rire.</div>`
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

    ${state.alcohol ? `<div class="alcohol-callout">🍻 ${escapeHtml(loser.name)} peut faire un toast de défaite avec la boisson de son choix.</div>` : ""}

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

function resetBestLiarState(config = {}) {
  state.bestLiar = {
    roundCount: Number(config.roundCount || 5),
    categories: [...(config.categories || liarClassicCategories)],
    includeAdult: Boolean(config.includeAdult),
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
        ${[3, 5, 10, 20, 30].map(n => `
          <button class="choice-pill ${game.roundCount === n ? "active" : ""}" data-liar-rounds="${n}">${n}</button>
        `).join("")}
      </div>

      <div class="form-group top-gap">
        <label for="customLiarRounds">Personnalisé</label>
        <input id="customLiarRounds" class="text-input" type="number" min="1" max="100" value="${game.roundCount}">
      </div>
    </section>

    <section class="card">
      <div class="section-heading-row">
        <div>
          <h2 class="section-title">Thèmes de mensonges</h2>
          <p class="helper">Choisis un thème, plusieurs ou les 14. Les cartes seront réparties équitablement entre les thèmes cochés.</p>
        </div>
      </div>

      <div class="toolbar compact-toolbar">
        <button id="selectAllLiarCats" class="secondary-btn">Tout sélectionner</button>
        <button id="clearAllLiarCats" class="secondary-btn">Tout enlever</button>
      </div>

      <div class="check-grid top-gap">
        ${liarClassicCategories.map(cat => `
          <label class="option-card mini-option">
            <input type="checkbox" data-liar-cat="${cat}" ${game.categories.includes(cat) ? "checked" : ""}>
            <span><strong>${liarCategoryLabels[cat]}</strong></span>
          </label>
        `).join("")}
      </div>

      <p class="helper top-gap">350 situations classiques disponibles.</p>
    </section>

    ${state.adult ? `
      <section class="card">
        <label class="option-card">
          <input id="liarAdultToggle" type="checkbox" ${game.includeAdult ? "checked" : ""}>
          <span>
            <strong>🔞 Ajouter les situations adultes</strong><br>
            <span class="helper">Ajoute 50 situations de crush, ex, messages et rendez-vous plus osés.</span>
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
    game.roundCount = Math.max(1, Math.min(100, Number(e.target.value) || 1));
  });

  document.querySelectorAll("[data-liar-cat]").forEach(input => {
    input.addEventListener("change", () => {
      const cat = input.dataset.liarCat;
      if (input.checked && !game.categories.includes(cat)) game.categories.push(cat);
      if (!input.checked) game.categories = game.categories.filter(c => c !== cat);
    });
  });

  document.querySelector("#selectAllLiarCats").addEventListener("click", () => {
    game.categories = [...liarClassicCategories];
    renderBestLiarSetup();
  });

  document.querySelector("#clearAllLiarCats").addEventListener("click", () => {
    game.categories = [];
    renderBestLiarSetup();
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

    game.prompts = selectBalancedLiarPrompts(pool, Math.min(game.roundCount, pool.length), "solo:best-liar-v2");
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
    ? `<div class="alcohol-callout">🍻 ${result.winners.map(row => escapeHtml(row.author.name)).join(" et ")} ${result.winners.length > 1 ? "peuvent proposer" : "peut proposer"} un toast au groupe, sans obligation de boire.</div>`
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
          <span>${escapeHtml(avatarById(player.avatarId).name)} · ${escapeHtml(player.name)} <strong>${game.scores[player.id]}</strong></span>
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
    resetBestLiarState({ roundCount: game.roundCount, categories: game.categories, includeAdult: game.includeAdult });
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
        <input id="roomCode" class="text-input" maxlength="9" placeholder="AK-5824QX">
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
    [
      "quiDeNous",
      "laughDuel",
      "bestLiar",
      "actionTruth",
      "ambiancePoll",
      "sameBrain",
      "minorityGame",
      "whoAnswered",
      "almostImpostor",
      "fakeExpert",
      "whoAmI",
      "megaGame"
    ].forEach(key => { state[key] = null; });

    state.history = [];
    renderHome();
  });
}

backBtn.addEventListener("click", () => {
  const previous = state.history.pop();

  switch (previous) {
    case "home":
      renderHome();
      break;
    case "join":
      renderJoin();
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
  if (isSoloGameRunning()) return;
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

function resetActionTruthState(forceAdult = false, config = {}) {
  state.actionTruth = {
    roundCount: Number(config.roundCount || 12),
    mode: config.mode || "mix",
    includeAdult: Boolean(forceAdult || config.includeAdult),
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
    game.prompts = selectFreshItems(pool, Math.min(game.roundCount, pool.length), `solo:action-truth:${game.mode}`);
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
    ${state.alcohol ? `<div class="alcohol-callout">🍻 Passer ne donne aucune pénalité. Si vous avez activé le mode alcool, une gorgée reste toujours facultative, eau comprise.</div>` : ""}
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
  document.querySelector("#replayActionTruth").addEventListener("click", () => {
    resetActionTruthState(game.forceAdult, { roundCount: game.roundCount, mode: game.mode, includeAdult: game.includeAdult });
    renderActionTruthSetup();
  });
  document.querySelector("#otherActionTruth").addEventListener("click", () => { state.actionTruth = null; renderPlayChoice(); });
}

function clearAmbiancePollTimer() {
  if (state.ambiancePollTimer) {
    window.clearInterval(state.ambiancePollTimer);
    state.ambiancePollTimer = null;
  }
}

function startAmbiancePollTimer(deadline, totalSeconds, onExpire) {
  clearAmbiancePollTimer();

  const tick = () => {
    const remainingMs = Math.max(0, Number(deadline || 0) - Date.now());
    const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
    const countdown = document.querySelector("#pollLightningCountdown");
    const fill = document.querySelector("#pollLightningFill");

    if (countdown) countdown.textContent = String(remainingSeconds);
    if (fill) {
      const ratio = Math.max(0, Math.min(1, remainingMs / (Math.max(1, Number(totalSeconds || 15)) * 1000)));
      fill.style.width = `${ratio * 100}%`;
    }

    if (remainingMs <= 0) {
      clearAmbiancePollTimer();
      onExpire();
    }
  };

  tick();
  state.ambiancePollTimer = window.setInterval(tick, 150);
}


const WOULD_SPECIAL_CARDS = {
  double_peine: {
    icon: "🪤",
    label: "Double peine",
    instruction: "Choisis une option, puis prépare-toi à expliquer pourquoi l’autre serait encore pire."
  },
  choix_collectif: {
    icon: "🤝",
    label: "Choix collectif",
    instruction: "Le groupe gagne un point seulement si tout le monde choisit exactement la même option."
  },
  prediction_majorite: {
    icon: "🔮",
    label: "Prédiction",
    instruction: "Avant de voter, prédis mentalement quelle option sera majoritaire."
  },
  changement_autorise: {
    icon: "🔄",
    label: "Changement autorisé",
    instruction: "Après la révélation et le débat, chacun peut annoncer s’il change finalement d’avis."
  },
  qui_choisirait_quoi: {
    icon: "🕵️",
    label: "Qui choisirait quoi ?",
    instruction: "Choisis mentalement une personne du groupe et essaie de deviner sa réponse avant de voter."
  },
  reponse_eclair_extreme: {
    icon: "⚡",
    label: "Éclair extrême",
    instruction: "Seulement cinq secondes pour répondre, même si le mode Réponse éclair est désactivé."
  }
};

function wouldYouRatherSpecialMeta(item) {
  return item?.specialType ? WOULD_SPECIAL_CARDS[item.specialType] || null : null;
}

function renderWouldYouRatherSpecialCard(item) {
  const meta = wouldYouRatherSpecialMeta(item);
  if (!meta) return "";

  return `
    <aside class="would-special-card would-special-${escapeHtml(item.specialType)}">
      <span class="would-special-icon" aria-hidden="true">${meta.icon}</span>
      <div>
        <strong>${escapeHtml(meta.label)}</strong>
        <p>${escapeHtml(meta.instruction)}</p>
      </div>
    </aside>
  `;
}

function renderWouldYouRatherSpecialResult(item, result = {}) {
  const meta = wouldYouRatherSpecialMeta(item);
  if (!meta) return "";

  let message = meta.instruction;

  if (item.specialType === "choix_collectif") {
    message = result.collectiveSuccess
      ? "Mission réussie : tout le monde a choisi la même option. Chaque joueur gagne 1 point."
      : "Mission ratée : le groupe n’était pas unanime. Aucun point collectif n’est attribué.";
  } else if (item.specialType === "prediction_majorite") {
    const countA = Number(result.counts?.A || 0);
    const countB = Number(result.counts?.B || 0);
    message = countA === countB
      ? "La prédiction était piégeuse : le groupe termine sur une égalité."
      : `La majorité a choisi l’option ${countA > countB ? "A" : "B"}. Qui l’avait deviné ?`;
  } else if (item.specialType === "double_peine") {
    message = "Tour de table : explique pourquoi l’option que tu n’as pas choisie serait encore pire.";
  } else if (item.specialType === "changement_autorise") {
    message = "Débattez maintenant. Après les arguments, chacun peut annoncer s’il changerait finalement de camp.";
  } else if (item.specialType === "qui_choisirait_quoi") {
    message = "Révélez maintenant la personne que vous aviez choisie mentalement et vérifiez votre prédiction.";
  } else if (item.specialType === "reponse_eclair_extreme") {
    message = "Cinq secondes, aucune dissertation : vos premiers instincts viennent de parler.";
  }

  return `
    <aside class="would-special-result">
      <span aria-hidden="true">${meta.icon}</span>
      <div><strong>${escapeHtml(meta.label)}</strong><p>${escapeHtml(message)}</p></div>
    </aside>
  `;
}

function selectWouldYouRatherRoundItems(pool, requestedCount, historyKey) {
  const count = Math.max(0, Math.min(Number(requestedCount || 0), pool.length));
  const specialPool = pool.filter(item => Boolean(item?.specialType));
  const regularPool = pool.filter(item => !item?.specialType);

  if (!specialPool.length || count < 2) {
    return selectFreshItems(pool, count, historyKey);
  }

  const specialCount = Math.min(
    specialPool.length,
    count,
    Math.max(1, Math.round(count / 8))
  );
  const regularCount = Math.max(0, count - specialCount);

  const selectedRegular = selectFreshItems(regularPool, regularCount, `${historyKey}:regular`);
  const selectedSpecial = selectFreshItems(specialPool, specialCount, `${historyKey}:special`);
  const result = [...selectedRegular];

  selectedSpecial.forEach((card, index) => {
    const position = Math.min(
      result.length,
      Math.max(1, Math.round(((index + 1) * (result.length + 1)) / (selectedSpecial.length + 1)))
    );
    result.splice(position, 0, card);
  });

  return result.slice(0, count);
}


function resetAmbiancePollState(type, forceAdult = false, config = {}) {
  clearAmbiancePollTimer();
  state.ambiancePoll = {
    type,
    roundCount: Number(config.roundCount || 10),
    includeAdult: Boolean(forceAdult || config.includeAdult),
    forceAdult: Boolean(forceAdult),
    lightningEnabled: type === "would" && Boolean(config.lightningEnabled),
    lightningSeconds: Number(config.lightningSeconds || 15),
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
      ${game.type === "would" ? `
        <label class="option-card lightning-option">
          <input id="pollLightning" type="checkbox" ${game.lightningEnabled ? "checked" : ""}>
          <span><strong>⚡ Réponse éclair</strong><br><span class="helper">Chaque personne doit choisir avant la fin du chrono.</span></span>
        </label>
        <div id="pollLightningDurationWrap" class="form-group top-gap" ${game.lightningEnabled ? "" : "hidden"}>
          <label for="pollLightningSeconds">Temps par personne</label>
          <select id="pollLightningSeconds" class="text-input">
            ${[10, 15, 20].map(value => `<option value="${value}" ${game.lightningSeconds === value ? "selected" : ""}>${value} secondes</option>`).join("")}
          </select>
        </div>
      ` : ""}
    </section>
    ${state.adult ? `<label class="option-card premium-toggle"><input id="pollAdult" type="checkbox" ${game.includeAdult ? "checked" : ""} ${game.forceAdult ? "disabled" : ""}><span><strong>🌶️ Ajouter les cartes adultes</strong><br><span class="helper">Des choix et révélations plus épicés.</span></span></label>` : ""}
    <button id="startPollGame" class="primary-btn full">Lancer la partie</button>
  `;

  document.querySelector("#pollRounds").addEventListener("change", event => game.roundCount = Number(event.target.value));
  document.querySelector("#pollAdult")?.addEventListener("change", event => game.includeAdult = event.target.checked);
  document.querySelector("#pollLightning")?.addEventListener("change", event => {
    game.lightningEnabled = event.target.checked;
    const wrap = document.querySelector("#pollLightningDurationWrap");
    if (wrap) wrap.hidden = !game.lightningEnabled;
  });
  document.querySelector("#pollLightningSeconds")?.addEventListener("change", event => {
    game.lightningSeconds = Number(event.target.value);
  });
  document.querySelector("#startPollGame").addEventListener("click", startAmbiancePollGame);
}

async function startAmbiancePollGame() {
  const game = state.ambiancePoll;
  const meta = pollGameMeta(game.type);
  screen.innerHTML = `<div class="notice">Préparation des questions…</div>`;
  try {
    let pool;
    if (game.forceAdult) {
      pool = await loadJsonFile(meta.adult, "Impossible de charger les questions adultes.");
    } else {
      pool = await loadJsonFile(meta.classic, "Impossible de charger les questions.");
      if (state.adult && game.includeAdult) pool = pool.concat(await loadJsonFile(meta.adult, "Impossible de charger les questions adultes."));
    }
    const historyKey = `solo:${game.type === "never" ? "never-have-i-ever" : "would-you-rather"}${game.forceAdult ? ":adult" : ""}`;
    game.items = game.type === "would"
      ? selectWouldYouRatherRoundItems(pool, Math.min(game.roundCount, pool.length), historyKey)
      : selectFreshItems(pool, Math.min(game.roundCount, pool.length), historyKey);
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
  clearAmbiancePollTimer();
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
  clearAmbiancePollTimer();
  const game = state.ambiancePoll;
  const item = game.items[game.currentIndex];
  const meta = pollGameMeta(game.type);
  const player = state.players[game.currentVoterIndex];
  const extremeLightning = game.type === "would" && item?.specialType === "reponse_eclair_extreme";
  const lightningActive = game.type === "would" && (game.lightningEnabled || extremeLightning);
  const lightningSeconds = extremeLightning ? 5 : Math.max(5, Number(game.lightningSeconds || 15));
  const lightningDeadline = Date.now() + lightningSeconds * 1000;
  title.textContent = meta.title;

  const lightningMarkup = lightningActive ? `
    <section class="lightning-timer" aria-live="polite">
      <div><span>⚡ Réponse éclair</span><strong><b id="pollLightningCountdown">${lightningSeconds}</b> s</strong></div>
      <div class="lightning-track"><div id="pollLightningFill" class="lightning-fill" style="width:100%"></div></div>
    </section>
  ` : "";

  screen.innerHTML = game.type === "never" ? `
    <section class="poll-question-stage poll-never-stage"><span class="prompt-type-chip">🙋 JE N’AI JAMAIS</span><h2>${escapeHtml(item.text.replace(/^Je n[’']ai jamais\s*/i, ""))}</h2><p>Alors ${escapeHtml(player.name)}, jamais… ou déjà ?</p></section>
    <section class="poll-choice-grid"><button class="poll-choice poll-choice-a" data-poll-vote="never"><strong>Jamais</strong><span>Pas moi. Innocence totale.</span></button><button class="poll-choice poll-choice-b" data-poll-vote="done"><strong>Déjà</strong><span>Oui, et j’assume presque.</span></button></section>
  ` : `
    ${lightningMarkup}
    ${renderWouldYouRatherSpecialCard(item)}
    <section class="poll-question-stage poll-would-stage"><span class="prompt-type-chip">⚖️ TU PRÉFÈRES</span><h2>Choisis ton camp</h2><p>${escapeHtml(player.name)}, impossible de répondre “ça dépend”.</p></section>
    <section class="poll-choice-grid"><button class="poll-choice poll-choice-a" data-poll-vote="A"><small>OPTION A</small><strong>${escapeHtml(item.optionA)}</strong></button><button class="poll-choice poll-choice-b" data-poll-vote="B"><small>OPTION B</small><strong>${escapeHtml(item.optionB)}</strong></button></section>
  `;

  let settled = false;
  const submitVote = value => {
    if (settled) return;
    settled = true;
    clearAmbiancePollTimer();
    game.votes[player.id] = value;
    game.currentVoterIndex += 1;
    renderAmbiancePollGate();
  };

  document.querySelectorAll("[data-poll-vote]").forEach(button => {
    button.addEventListener("click", () => submitVote(button.dataset.pollVote));
  });

  if (lightningActive) {
    startAmbiancePollTimer(lightningDeadline, lightningSeconds, () => submitVote("timeout"));
  }
}

function calculatePollResult(game) {
  const item = game.items?.[game.currentIndex];
  const values = Object.values(game.votes);
  const labels = game.type === "never" ? ["never", "done"] : ["A", "B"];
  const counts = Object.fromEntries(labels.map(label => [label, values.filter(value => value === label).length]));
  const minority = counts[labels[0]] === counts[labels[1]] ? null : (counts[labels[0]] < counts[labels[1]] ? labels[0] : labels[1]);
  const minorityIds = minority ? Object.entries(game.votes).filter(([, value]) => value === minority).map(([id]) => id) : [];
  const validVoteIds = Object.entries(game.votes)
    .filter(([, value]) => labels.includes(value))
    .map(([id]) => id);
  const collectiveSuccess = item?.specialType === "choix_collectif"
    && validVoteIds.length === state.players.length
    && new Set(validVoteIds.map(id => game.votes[id])).size === 1;
  const awardedIds = item?.specialType === "choix_collectif"
    ? (collectiveSuccess ? validVoteIds : [])
    : minorityIds;
  return { counts, minority, minorityIds, awardedIds, collectiveSuccess };
}

function renderAmbiancePollReveal() {
  const game = state.ambiancePoll;
  const item = game.items[game.currentIndex];
  const result = calculatePollResult(game);
  const meta = pollGameMeta(game.type);
  const optionLabel = value => {
    if (value === "timeout" || value == null) return "Temps écoulé";
    return game.type === "never" ? (value === "never" ? "Jamais" : "Déjà") : (value === "A" ? item.optionA : item.optionB);
  };
  result.awardedIds.forEach(id => game.scores[id] = Number(game.scores[id] || 0) + 1);
  game.rounds.push({
    itemId: item.id,
    votes: { ...game.votes },
    minorityIds: result.minorityIds,
    awardedIds: result.awardedIds,
    collectiveSuccess: result.collectiveSuccess
  });

  title.textContent = "Le groupe a parlé";
  setBackVisible(false);
  screen.innerHTML = `
    <section class="reveal-stage reveal-v07">
      <span class="game-cover-icon">${meta.icon}</span>
      <h2>${game.type === "never" ? escapeHtml(item.text) : "Le verdict est tombé"}</h2>
      ${game.type === "would" ? `<div class="reveal-dilemma"><span>${escapeHtml(item.optionA)}</span><b>VS</b><span>${escapeHtml(item.optionB)}</span></div>` : ""}
    </section>
    ${game.type === "would" ? renderWouldYouRatherSpecialResult(item, result) : ""}
    <section class="poll-results-grid">
      ${state.players.map(player => {
        const pointLabel = item?.specialType === "choix_collectif" ? "+1 pt collectif" : "+1 pt minorité";
        return `<article class="poll-result-person"><span>${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong><small>${escapeHtml(optionLabel(game.votes[player.id]))}</small>${result.awardedIds.includes(player.id) ? `<em>${pointLabel}</em>` : ""}</article>`;
      }).join("")}
    </section>
    ${state.alcohol && game.type === "never" ? `<div class="alcohol-callout">🍻 Les personnes qui ont répondu “Déjà” peuvent trinquer avec la boisson de leur choix, sans obligation.</div>` : ""}
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
    <section class="winner-stage winner-stage-v07"><div class="winner-crown">${meta.icon}🏆</div><h2>Les esprits libres sont devant</h2><p>Un point était gagné par la minorité, ou par tout le groupe sur une carte collective réussie.</p></section>
    <section class="final-ranking">${ranking.map((player, index) => `<div class="ranking-row"><span class="ranking-position">${index + 1}</span><span class="result-avatar">${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong><span>${Number(game.scores[player.id] || 0)} pts</span></div>`).join("")}</section>
    <div class="toolbar"><button id="replayPoll" class="secondary-btn">Rejouer</button><button id="otherPoll" class="primary-btn">Autre jeu</button></div>
  `;
  document.querySelector("#replayPoll").addEventListener("click", () => {
    resetAmbiancePollState(game.type, game.forceAdult, {
      roundCount: game.roundCount,
      includeAdult: game.includeAdult,
      lightningEnabled: game.lightningEnabled,
      lightningSeconds: game.lightningSeconds
    });
    renderAmbiancePollSetup();
  });
  document.querySelector("#otherPoll").addEventListener("click", () => { state.ambiancePoll = null; renderPlayChoice(); });
}

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

function resetSameBrainState(config = {}) {
  state.sameBrain = {
    roundCount: Number(config.roundCount || 10),
    includeAdult: Boolean(config.includeAdult),
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
    game.items = selectFreshItems(pool, Math.min(game.roundCount, pool.length), "solo:same-brain");
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
    ${state.alcohol && !result.matchedIds.length ? `<div class="alcohol-callout">🍻 Aucun match : le groupe peut trinquer avec la boisson de son choix, sans obligation.</div>` : ""}
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
    replay: () => { resetSameBrainState({ roundCount: game.roundCount, includeAdult: game.includeAdult }); renderSameBrainSetup(); },
    other: () => { state.sameBrain = null; renderPlayChoice(); }
  });
}

/* ---------- MINORITÉ ---------- */

function resetMinorityState(config = {}) {
  state.minorityGame = {
    roundCount: Number(config.roundCount || 10),
    includeAdult: Boolean(config.includeAdult),
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
  const game = ensureMinorityGameConfig(state.minorityGame);
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
    game.items = selectFreshItems(pool, Math.min(game.roundCount, pool.length), "solo:minority");
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
    ${state.alcohol && result.winnerIds.length ? `<div class="alcohol-callout">🍻 La majorité peut trinquer si elle en a envie. La minorité savoure sa victoire.</div>` : ""}
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
    replay: () => { resetMinorityState({ roundCount: game.roundCount, includeAdult: game.includeAdult }); renderMinoritySetup(); },
    other: () => { state.minorityGame = null; renderPlayChoice(); }
  });
}

/* ---------- QUI A RÉPONDU ÇA ? ---------- */

function resetWhoAnsweredState(config = {}) {
  state.whoAnswered = {
    roundCount: Number(config.roundCount || Math.max(6, state.players.length)),
    includeAdult: Boolean(config.includeAdult),
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
    game.items = selectFreshItems(pool, Math.min(game.roundCount, pool.length), "solo:who-answered");
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
    ${state.alcohol && result.fooledIds.length ? `<div class="alcohol-callout">🍻 Les enquêteurs trompés peuvent trinquer avec la boisson de leur choix, sans obligation.</div>` : ""}
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
    replay: () => { resetWhoAnsweredState({ roundCount: game.roundCount, includeAdult: game.includeAdult }); renderWhoAnsweredSetup(); },
    other: () => { state.whoAnswered = null; renderPlayChoice(); }
  });
}

renderHome();

/* =========================================================
   AK'GAMES V0.9 — IMPOSTEURS & DÉDUCTION
   L’Imposteur sait presque tout · Le Faux Expert · Qui suis-je ?
   ========================================================= */

state.almostImpostor = null;
state.fakeExpert = null;
state.whoAmI = null;
state.v09TimerHandle = null;
state.v09TimerToken = 0;

const V09_NEW_GAMES = new Set([
  "L’Imposteur sait presque tout",
  "Le Faux Expert",
  "Qui suis-je ?"
]);

const V09_READY_GAMES = new Set([...V08_READY_GAMES, ...V09_NEW_GAMES]);
const V09_GAME_ICONS = {
  ...V08_GAME_ICONS,
  "L’Imposteur sait presque tout": "🕶️",
  "Le Faux Expert": "🎓",
  "Qui suis-je ?": "❓"
};

function clearV09Timer() {
  if (state.v09TimerHandle) window.clearInterval(state.v09TimerHandle);
  state.v09TimerHandle = null;
  state.v09TimerToken += 1;
}

function startV09Countdown(seconds, onDone) {
  clearV09Timer();
  const token = state.v09TimerToken;
  const endAt = Date.now() + Math.max(1, Number(seconds || 1)) * 1000;

  const tick = () => {
    if (token !== state.v09TimerToken) return;
    const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    const node = document.querySelector("#v09Countdown");
    const ring = document.querySelector("#v09TimerRing");
    if (node) node.textContent = String(left);
    if (ring) {
      const ratio = Math.max(0, Math.min(1, left / Math.max(1, Number(seconds || 1))));
      ring.style.setProperty("--timer-progress", `${ratio * 360}deg`);
    }
    if (left <= 0) {
      clearV09Timer();
      onDone?.();
    }
  };

  tick();
  state.v09TimerHandle = window.setInterval(tick, 250);
}

function renderV09Progress(current, total, label) {
  const safeTotal = Math.max(1, Number(total || 1));
  const safeCurrent = Math.min(safeTotal, Math.max(1, Number(current || 1)));
  return `
    <div class="game-progress v09-progress">
      <span>${escapeHtml(label)} ${safeCurrent}/${safeTotal}</span>
      <div class="progress-track"><div class="progress-fill" style="width:${Math.round((safeCurrent / safeTotal) * 100)}%"></div></div>
    </div>
  `;
}

function renderV09Final({ icon, heading, text, scores, replay, other }) {
  clearV09Timer();
  const ranking = [...state.players].sort((a, b) => Number(scores[b.id] || 0) - Number(scores[a.id] || 0));
  title.textContent = "Classement final";
  setBackVisible(false);
  screen.innerHTML = `
    <section class="winner-stage winner-stage-v07 v09-final-stage">
      <div class="winner-crown">${icon}🏆</div>
      <h2>${escapeHtml(heading)}</h2>
      <p>${escapeHtml(text)}</p>
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
    <div class="toolbar">
      <button id="v09Replay" class="secondary-btn">Rejouer</button>
      <button id="v09Other" class="primary-btn">Autre jeu</button>
    </div>
  `;
  document.querySelector("#v09Replay").addEventListener("click", replay);
  document.querySelector("#v09Other").addEventListener("click", other);
}

renderHome = function () {
  clearV09Timer();
  state.history = [];
  title.textContent = "La soirée commence ici";
  setBackVisible(false);

  screen.innerHTML = `
    <section class="home-hero-v07 home-hero-v08 home-hero-v09">
      <div class="home-logo-shell"><img src="icons/icon-192.png" alt="" class="home-logo-v07"></div>
      <div class="home-hero-copy">
        <span class="home-kicker">LA BOÎTE À JEUX QUI TIENT DANS UNE POCHE</span>
        <h2>Une soirée.<br><em>Zéro temps mort.</em></h2>
        <p>Crée un salon, rassemble la bande et enchaîne les jeux sans jamais quitter la partie.</p>
        <div class="home-stat-row">
          <span>🎮 12 jeux complets</span>
          <span>📲 1 ou plusieurs téléphones</span>
          <span>⚡ lancement express</span>
        </div>
      </div>
      <div class="hero-orb hero-orb-one"></div><div class="hero-orb hero-orb-two"></div>
    </section>

    <section class="home-action-stack">
      <button class="home-action-card home-action-primary" data-home-action="create">
        <span class="home-action-icon">✦</span><span class="home-action-copy"><small>MODE SOIRÉE</small><strong>Créer une partie</strong><span>Ouvre un salon et joue chacun sur son téléphone.</span></span><span class="home-action-arrow">→</span>
      </button>
      <div class="home-action-grid">
        <button class="home-action-card home-action-secondary" data-home-action="join">
          <span class="home-action-icon">⌁</span><span class="home-action-copy"><small>J’AI UN CODE</small><strong>Rejoindre</strong><span>Retrouve tes amis en quelques secondes.</span></span><span class="home-action-arrow">→</span>
        </button>
        <button class="home-action-card home-action-secondary home-action-phone" data-home-action="single">
          <span class="home-action-icon">▣</span><span class="home-action-copy"><small>PASS & PLAY</small><strong>Un téléphone</strong><span>Ajoutez les joueurs puis passez-vous l’écran.</span></span><span class="home-action-arrow">→</span>
        </button>
      </div>
    </section>

    <section class="home-feature-strip">
      <article><span>🕶️</span><div><strong>Imposteurs & Déduction</strong><small>Imposteur, Faux Expert et Qui suis-je ?</small></div></article>
      <article><span>🏆</span><div><strong>Soirée continue</strong><small>Score cumulé et historique conservés</small></div></article>
      <article><span>🌙</span><div><strong>12 jeux complets</strong><small>Ambiance, bluff, rire et révélations</small></div></article>
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
  clearV09Timer();
  const category = categories.find(item => item.id === state.currentCategory);
  title.textContent = category.name;
  setBackVisible(true);

  screen.innerHTML = `
    <section class="catalog-intro">
      <span>${category.emoji}</span>
      <div><small>CATÉGORIE</small><strong>${escapeHtml(category.name)}</strong><p>${escapeHtml(category.description)}</p></div>
    </section>
    <section class="game-list game-list-v07">
      ${category.games.map(game => {
        const disabled = game === "Blind Test";
        const ready = V09_READY_GAMES.has(game);
        const isNew = V09_NEW_GAMES.has(game);
        const icon = V09_GAME_ICONS[game] || "🎲";
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
      if (game === "Qui de nous ?") { pushScreen("games"); resetWhoUsState(); renderWhoUsSetup(); return; }
      if (game === "Le premier qui rit a perdu") { pushScreen("games"); resetLaughDuelState(); renderLaughDuelSetup(); return; }
      if (game === "Qui ment le mieux ?") {
        if (state.players.length < 3) return alert("« Qui ment le mieux ? » nécessite au moins 3 joueurs.");
        pushScreen("games"); resetBestLiarState(); renderBestLiarSetup(); return;
      }
      if (game === "Action ou Vérité" || game === "Action ou Vérité +18") { pushScreen("games"); resetActionTruthState(game.includes("+18")); renderActionTruthSetup(); return; }
      if (game === "Je n’ai jamais" || game === "Je n’ai jamais +18") { pushScreen("games"); resetAmbiancePollState("never", game.includes("+18")); renderAmbiancePollSetup(); return; }
      if (game === "Tu préfères" || game === "Tu préfères +18") { pushScreen("games"); resetAmbiancePollState("would", game.includes("+18")); renderAmbiancePollSetup(); return; }
      if (game === "Même cerveau") { pushScreen("games"); resetSameBrainState(); renderSameBrainSetup(); return; }
      if (game === "Minorité") { pushScreen("games"); resetMinorityState(); renderMinoritySetup(); return; }
      if (game === "Qui a répondu ça ?") {
        if (state.players.length < 3) return alert("« Qui a répondu ça ? » nécessite au moins 3 joueurs.");
        pushScreen("games"); resetWhoAnsweredState(); renderWhoAnsweredSetup(); return;
      }
      if (game === "L’Imposteur sait presque tout") {
        if (state.players.length < 3) return alert("Ce jeu nécessite au moins 3 joueurs.");
        pushScreen("games"); resetAlmostImpostorState(); renderAlmostImpostorSetup(); return;
      }
      if (game === "Le Faux Expert") {
        if (state.players.length < 3) return alert("Ce jeu nécessite au moins 3 joueurs.");
        pushScreen("games"); resetFakeExpertState(); renderFakeExpertSetup(); return;
      }
      if (game === "Qui suis-je ?") {
        if (state.players.length < 2) return alert("Ce jeu nécessite au moins 2 joueurs.");
        pushScreen("games"); resetWhoAmIState(); renderWhoAmISetup(); return;
      }
      renderGamePlaceholder(game);
    });
  });
};

/* ---------- L’IMPOSTEUR SAIT PRESQUE TOUT ---------- */

function resetAlmostImpostorState(config = {}) {
  state.almostImpostor = {
    roundCount: Number(config.roundCount || 6),
    includeAdult: Boolean(config.includeAdult),
    discussionSeconds: Number(config.discussionSeconds || 60),
    items: [],
    currentIndex: 0,
    roleOrder: [],
    roleViewIndex: 0,
    impostorId: null,
    votes: {},
    currentVoterIndex: 0,
    scores: Object.fromEntries(state.players.map(player => [player.id, 0])),
    currentResult: null,
    rounds: []
  };
}

function renderAlmostImpostorSetup() {
  clearV09Timer();
  if (!state.almostImpostor) resetAlmostImpostorState();
  const game = state.almostImpostor;
  title.textContent = "L’Imposteur sait presque tout";
  setBackVisible(true);
  screen.innerHTML = `
    <section class="game-cover game-cover-impostor"><span class="game-cover-icon">🕶️</span><div><small>IMPOSTEURS & DÉDUCTION</small><h2>L’Imposteur sait presque tout</h2><p>Tout le monde connaît le mot. L’imposteur ne reçoit qu’un indice et doit survivre au vote.</p></div></section>
    <section class="card setup-card-v07">
      <div class="form-group"><label for="impostorRounds">Nombre de manches</label><select id="impostorRounds" class="text-input">${[4,6,8,10].map(v => `<option value="${v}" ${game.roundCount === v ? "selected" : ""}>${v} manches</option>`).join("")}</select></div>
      <div class="form-group top-gap"><label for="impostorTimer">Temps de discussion</label><select id="impostorTimer" class="text-input">${[45,60,90].map(v => `<option value="${v}" ${game.discussionSeconds === v ? "selected" : ""}>${v} secondes</option>`).join("")}</select></div>
    </section>
    ${state.adult ? `<label class="option-card premium-toggle"><input id="impostorAdult" type="checkbox" ${game.includeAdult ? "checked" : ""}><span><strong>🌶️ Ajouter les cartes adultes</strong><br><span class="helper">Crushs, relations et dossiers de soirée.</span></span></label>` : ""}
    <div class="notice">Détective correct : +1 point. Imposteur non démasqué : +2 points. Mot deviné après capture : +1 point.</div>
    <button id="startImpostor" class="primary-btn full">Distribuer les rôles</button>
  `;
  document.querySelector("#impostorRounds").addEventListener("change", e => game.roundCount = Number(e.target.value));
  document.querySelector("#impostorTimer").addEventListener("change", e => game.discussionSeconds = Number(e.target.value));
  document.querySelector("#impostorAdult")?.addEventListener("change", e => game.includeAdult = e.target.checked);
  document.querySelector("#startImpostor").addEventListener("click", startAlmostImpostorGame);
}

async function startAlmostImpostorGame() {
  const game = state.almostImpostor;
  screen.innerHTML = `<div class="notice">Mélange des mots et distribution des lunettes noires…</div>`;
  try {
    let pool = await loadJsonFile("data/imposteur.json", "Impossible de charger les mots de l’imposteur.");
    if (state.adult && game.includeAdult) pool = pool.concat(await loadJsonFile("data/imposteur-adulte.json", "Impossible de charger les cartes adultes."));
    game.items = selectFreshItems(pool, Math.min(game.roundCount, pool.length), "solo:almost-impostor");
    game.currentIndex = 0;
    game.scores = Object.fromEntries(state.players.map(player => [player.id, 0]));
    game.rounds = [];
    prepareAlmostImpostorRound();
  } catch (error) {
    alert(error.message);
    renderAlmostImpostorSetup();
  }
}

function prepareAlmostImpostorRound() {
  const game = state.almostImpostor;
  if (game.currentIndex >= game.items.length) return renderAlmostImpostorEnd();
  game.roleOrder = shuffleArray(state.players.map(player => player.id));
  game.roleViewIndex = 0;
  game.impostorId = game.roleOrder[Math.floor(Math.random() * game.roleOrder.length)];
  game.votes = {};
  game.currentVoterIndex = 0;
  game.currentResult = null;
  renderAlmostImpostorRoleGate();
}

function renderAlmostImpostorRoleGate() {
  const game = state.almostImpostor;
  if (game.roleViewIndex >= game.roleOrder.length) return renderAlmostImpostorDiscussion();
  const player = state.players.find(item => item.id === game.roleOrder[game.roleViewIndex]);
  title.textContent = "Rôle secret";
  setBackVisible(false);
  screen.innerHTML = `
    ${renderV09Progress(game.currentIndex + 1, game.items.length, "Manche")}
    <section class="handoff-stage handoff-v07"><div class="giant-avatar">${avatarById(player.avatarId).emoji}</div><span class="category-chip">ÉCRAN PRIVÉ</span><h2>Passe le téléphone à ${escapeHtml(player.name)}</h2><p>Regarde ton rôle puis cache l’écran avant de continuer.</p><button id="openImpostorRole" class="primary-btn">Je suis ${escapeHtml(player.name)}</button></section>
  `;
  document.querySelector("#openImpostorRole").addEventListener("click", renderAlmostImpostorRole);
}

function renderAlmostImpostorRole() {
  const game = state.almostImpostor;
  const card = game.items[game.currentIndex];
  const playerId = game.roleOrder[game.roleViewIndex];
  const isImpostor = playerId === game.impostorId;
  title.textContent = isImpostor ? "Tu es l’imposteur" : "Tu connais le mot";
  screen.innerHTML = `
    ${renderV09Progress(game.currentIndex + 1, game.items.length, "Manche")}
    <section class="secret-role-card ${isImpostor ? "impostor" : "civil"}">
      <span>${isImpostor ? "🕶️" : "🔐"}</span>
      <small>${isImpostor ? "IMPOSTEUR" : "ÉQUIPE INFORMÉE"}</small>
      <h2>${isImpostor ? "Tu ne connais pas le mot" : escapeHtml(card.word)}</h2>
      <p><strong>Indice :</strong> ${escapeHtml(card.hint)}</p>
      ${isImpostor ? `<em>Écoute les autres, donne un indice crédible et évite les soupçons.</em>` : `<em>Donne un indice utile, mais pas trop évident.</em>`}
    </section>
    <button id="hideImpostorRole" class="primary-btn full">J’ai mémorisé</button>
  `;
  document.querySelector("#hideImpostorRole").addEventListener("click", () => {
    game.roleViewIndex += 1;
    renderAlmostImpostorRoleGate();
  });
}

function renderAlmostImpostorDiscussion() {
  const game = state.almostImpostor;
  const card = game.items[game.currentIndex];
  title.textContent = "Discussion";
  setBackVisible(false);
  screen.innerHTML = `
    ${renderV09Progress(game.currentIndex + 1, game.items.length, "Manche")}
    <section class="timer-stage v09-timer-stage">
      <span class="category-chip">${escapeHtml(card.category || "mystère").toUpperCase()}</span>
      <div id="v09TimerRing" class="v09-timer-ring"><strong id="v09Countdown">${game.discussionSeconds}</strong><small>secondes</small></div>
      <h2>Donnez chacun un indice</h2>
      <p>Interdiction de prononcer le mot. Observez les hésitations, les détours et les regards suspects.</p>
    </section>
    <button id="impostorVoteNow" class="secondary-btn full">Passer aux votes</button>
  `;
  const vote = () => { clearV09Timer(); game.currentVoterIndex = 0; renderAlmostImpostorVoteGate(); };
  document.querySelector("#impostorVoteNow").addEventListener("click", vote);
  startV09Countdown(game.discussionSeconds, vote);
}

function renderAlmostImpostorVoteGate() {
  const game = state.almostImpostor;
  if (game.currentVoterIndex >= state.players.length) return resolveAlmostImpostorVotes();
  const voter = state.players[game.currentVoterIndex];
  title.textContent = "Vote secret";
  setBackVisible(false);
  screen.innerHTML = `
    ${renderV09Progress(game.currentIndex + 1, game.items.length, "Manche")}
    <section class="handoff-stage handoff-v07"><div class="giant-avatar">${avatarById(voter.avatarId).emoji}</div><span class="category-chip">VOTE SECRET</span><h2>Passe le téléphone à ${escapeHtml(voter.name)}</h2><p>Choisis la personne qui semble connaître un peu moins que les autres.</p><button id="openImpostorVote" class="primary-btn">Je suis ${escapeHtml(voter.name)}</button></section>
  `;
  document.querySelector("#openImpostorVote").addEventListener("click", renderAlmostImpostorVote);
}

function renderAlmostImpostorVote() {
  const game = state.almostImpostor;
  const voter = state.players[game.currentVoterIndex];
  const candidates = state.players.filter(player => player.id !== voter.id);
  title.textContent = "Qui est l’imposteur ?";
  screen.innerHTML = `
    ${renderV09Progress(game.currentIndex + 1, game.items.length, "Manche")}
    <section class="suspect-grid">${candidates.map(player => `<button class="suspect-card" data-impostor-vote="${player.id}"><span>${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong></button>`).join("")}</section>
  `;
  document.querySelectorAll("[data-impostor-vote]").forEach(button => button.addEventListener("click", () => {
    game.votes[voter.id] = button.dataset.impostorVote;
    game.currentVoterIndex += 1;
    renderAlmostImpostorVoteGate();
  }));
}

function resolveAlmostImpostorVotes() {
  const game = state.almostImpostor;
  const counts = {};
  Object.values(game.votes).forEach(id => counts[id] = Number(counts[id] || 0) + 1);
  const max = Math.max(0, ...Object.values(counts));
  const topIds = Object.keys(counts).filter(id => counts[id] === max);
  const caught = topIds.length === 1 && topIds[0] === game.impostorId;
  const correctVoters = Object.entries(game.votes).filter(([, id]) => id === game.impostorId).map(([id]) => id);
  correctVoters.forEach(id => game.scores[id] = Number(game.scores[id] || 0) + 1);
  game.currentResult = { caught, topIds, counts, correctVoters, guess: null, guessCorrect: false };
  if (!caught) {
    game.scores[game.impostorId] = Number(game.scores[game.impostorId] || 0) + 2;
    renderAlmostImpostorResult();
    return;
  }
  renderAlmostImpostorGuessGate();
}

function renderAlmostImpostorGuessGate() {
  const game = state.almostImpostor;
  const impostor = state.players.find(player => player.id === game.impostorId);
  title.textContent = "Dernière chance";
  screen.innerHTML = `
    <section class="handoff-stage handoff-v07"><div class="giant-avatar">${avatarById(impostor.avatarId).emoji}</div><span class="category-chip">IMPOSTEUR DÉMASQUÉ</span><h2>Passe le téléphone à ${escapeHtml(impostor.name)}</h2><p>Tu peux encore gagner un point en retrouvant le mot exact.</p><button id="openImpostorGuess" class="primary-btn">Tenter le mot</button></section>
  `;
  document.querySelector("#openImpostorGuess").addEventListener("click", renderAlmostImpostorGuess);
}

function renderAlmostImpostorGuess() {
  const game = state.almostImpostor;
  const card = game.items[game.currentIndex];
  const options = shuffleArray([card.word, ...(card.decoys || [])]);
  title.textContent = "Quel était le mot ?";
  screen.innerHTML = `
    <section class="v09-question-card"><span>🕶️</span><small>DERNIÈRE CHANCE</small><h2>${escapeHtml(card.hint)}</h2></section>
    <section class="v09-option-grid">${options.map(option => `<button class="v09-choice-card" data-impostor-guess="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join("")}</section>
  `;
  document.querySelectorAll("[data-impostor-guess]").forEach(button => button.addEventListener("click", () => {
    const guess = button.dataset.impostorGuess;
    game.currentResult.guess = guess;
    game.currentResult.guessCorrect = guess === card.word;
    if (game.currentResult.guessCorrect) game.scores[game.impostorId] = Number(game.scores[game.impostorId] || 0) + 1;
    renderAlmostImpostorResult();
  }));
}

function renderAlmostImpostorResult() {
  const game = state.almostImpostor;
  const card = game.items[game.currentIndex];
  const result = game.currentResult;
  const impostor = state.players.find(player => player.id === game.impostorId);
  game.rounds.push({ itemId: card.id, impostorId: game.impostorId, votes: { ...game.votes }, ...result });
  title.textContent = "Révélation";
  setBackVisible(false);
  screen.innerHTML = `
    <section class="reveal-stage reveal-v07 impostor-reveal"><span class="game-cover-icon">${avatarById(impostor.avatarId).emoji}</span><h2>${escapeHtml(impostor.name)} était l’imposteur</h2><p>Le mot était <strong>${escapeHtml(card.word)}</strong>.</p></section>
    <section class="vote-breakdown">${state.players.map(player => {
      const target = state.players.find(item => item.id === game.votes[player.id]);
      const correct = game.votes[player.id] === game.impostorId;
      return `<article class="who-vote-row ${correct ? "correct" : "fooled"}"><span>${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong><small>a voté ${escapeHtml(target?.name || "?")}</small><em>${correct ? "+1 pt" : "raté"}</em></article>`;
    }).join("")}</section>
    <div class="special-event ${result.caught ? "" : "tie"}"><strong>${result.caught ? "🔍 Imposteur démasqué" : "🕶️ L’imposteur s’échappe"}</strong><p>${result.caught ? (result.guessCorrect ? "Le mot a tout de même été retrouvé : +1 point imposteur." : "Le groupe a gagné cette enquête.") : "+2 points pour la couverture parfaite."}</p></div>
    ${state.alcohol ? `<div class="alcohol-callout">🍻 ${result.caught ? "L’imposteur peut trinquer s’il en a envie." : "Les joueurs ayant raté leur vote peuvent trinquer s’ils en ont envie."}</div>` : ""}
    <button id="nextImpostorRound" class="primary-btn full">${game.currentIndex + 1 >= game.items.length ? "Voir le classement" : "Manche suivante"}</button>
  `;
  document.querySelector("#nextImpostorRound").addEventListener("click", () => { game.currentIndex += 1; prepareAlmostImpostorRound(); });
}

function renderAlmostImpostorEnd() {
  const game = state.almostImpostor;
  renderV09Final({
    icon: "🕶️", heading: "Les masques sont tombés", text: "Détectives précis et imposteurs insaisissables se partagent le podium.", scores: game.scores,
    replay: () => { resetAlmostImpostorState({ roundCount: game.roundCount, includeAdult: game.includeAdult, discussionSeconds: game.discussionSeconds }); renderAlmostImpostorSetup(); },
    other: () => { state.almostImpostor = null; renderPlayChoice(); }
  });
}

/* ---------- LE FAUX EXPERT ---------- */

function resetFakeExpertState(config = {}) {
  state.fakeExpert = {
    roundCount: Number(config.roundCount || Math.max(5, state.players.length)),
    includeAdult: Boolean(config.includeAdult),
    speechSeconds: Number(config.speechSeconds || 60),
    items: [],
    currentIndex: 0,
    speakerOrder: shuffleArray(state.players.map(player => player.id)),
    speakerId: null,
    role: null,
    votes: {},
    currentVoterIndex: 0,
    scores: Object.fromEntries(state.players.map(player => [player.id, 0])),
    rounds: []
  };
}

function renderFakeExpertSetup() {
  clearV09Timer();
  if (!state.fakeExpert) resetFakeExpertState();
  const game = state.fakeExpert;
  title.textContent = "Le Faux Expert";
  setBackVisible(true);
  screen.innerHTML = `
    <section class="game-cover game-cover-expert"><span class="game-cover-icon">🎓</span><div><small>IMPOSTEURS & DÉDUCTION</small><h2>Le Faux Expert</h2><p>Une personne présente un sujet. Elle possède les vraies informations… ou improvise totalement.</p></div></section>
    <section class="card setup-card-v07">
      <div class="form-group"><label for="expertRounds">Nombre de passages</label><select id="expertRounds" class="text-input">${[Math.max(5, state.players.length),8,10,12].filter((v,i,a)=>a.indexOf(v)===i).map(v => `<option value="${v}" ${game.roundCount === v ? "selected" : ""}>${v} passages</option>`).join("")}</select></div>
      <div class="form-group top-gap"><label for="expertTimer">Temps de présentation</label><select id="expertTimer" class="text-input">${[45,60,90].map(v => `<option value="${v}" ${game.speechSeconds === v ? "selected" : ""}>${v} secondes</option>`).join("")}</select></div>
    </section>
    ${state.adult ? `<label class="option-card premium-toggle"><input id="expertAdult" type="checkbox" ${game.includeAdult ? "checked" : ""}><span><strong>🌶️ Ajouter les sujets adultes</strong><br><span class="helper">Relations, séduction et situations de date.</span></span></label>` : ""}
    <div class="notice">Bon verdict : +1 point. L’orateur gagne 1 point par personne trompée, avec un maximum de 3.</div>
    <button id="startExpert" class="primary-btn full">Ouvrir la conférence</button>
  `;
  document.querySelector("#expertRounds").addEventListener("change", e => game.roundCount = Number(e.target.value));
  document.querySelector("#expertTimer").addEventListener("change", e => game.speechSeconds = Number(e.target.value));
  document.querySelector("#expertAdult")?.addEventListener("change", e => game.includeAdult = e.target.checked);
  document.querySelector("#startExpert").addEventListener("click", startFakeExpertGame);
}

async function startFakeExpertGame() {
  const game = state.fakeExpert;
  screen.innerHTML = `<div class="notice">Préparation des diplômes douteux…</div>`;
  try {
    let pool = await loadJsonFile("data/faux-expert.json", "Impossible de charger les sujets.");
    if (state.adult && game.includeAdult) pool = pool.concat(await loadJsonFile("data/faux-expert-adulte.json", "Impossible de charger les sujets adultes."));
    game.items = selectFreshItems(pool, Math.min(game.roundCount, pool.length), "solo:fake-expert");
    game.currentIndex = 0;
    game.speakerOrder = shuffleArray(state.players.map(player => player.id));
    game.scores = Object.fromEntries(state.players.map(player => [player.id, 0]));
    game.rounds = [];
    prepareFakeExpertRound();
  } catch (error) {
    alert(error.message);
    renderFakeExpertSetup();
  }
}

function prepareFakeExpertRound() {
  const game = state.fakeExpert;
  if (game.currentIndex >= game.items.length) return renderFakeExpertEnd();
  game.speakerId = game.speakerOrder[game.currentIndex % game.speakerOrder.length];
  game.role = Math.random() < 0.5 ? "real" : "fake";
  game.votes = {};
  game.currentVoterIndex = 0;
  renderFakeExpertBriefGate();
}

function renderFakeExpertBriefGate() {
  const game = state.fakeExpert;
  const speaker = state.players.find(player => player.id === game.speakerId);
  title.textContent = "Brief confidentiel";
  setBackVisible(false);
  screen.innerHTML = `
    ${renderV09Progress(game.currentIndex + 1, game.items.length, "Passage")}
    <section class="handoff-stage handoff-v07"><div class="giant-avatar">${avatarById(speaker.avatarId).emoji}</div><span class="category-chip">ORATEUR SECRET</span><h2>Passe le téléphone à ${escapeHtml(speaker.name)}</h2><p>Tu vas découvrir si ton diplôme est réel ou totalement imaginaire.</p><button id="openExpertBrief" class="primary-btn">Lire mon brief</button></section>
  `;
  document.querySelector("#openExpertBrief").addEventListener("click", renderFakeExpertBrief);
}

function renderFakeExpertBrief() {
  const game = state.fakeExpert;
  const card = game.items[game.currentIndex];
  const isReal = game.role === "real";
  title.textContent = isReal ? "Vrai expert" : "Faux expert";
  screen.innerHTML = `
    ${renderV09Progress(game.currentIndex + 1, game.items.length, "Passage")}
    <section class="secret-role-card expert-role ${isReal ? "civil" : "impostor"}">
      <span>${isReal ? "🎓" : "🎭"}</span><small>${isReal ? "VRAI EXPERT" : "FAUX EXPERT"}</small><h2>${escapeHtml(card.topic)}</h2>
      ${isReal ? `<ul class="expert-fact-list">${(card.facts || []).map(fact => `<li>${escapeHtml(fact)}</li>`).join("")}</ul>` : `<p>${escapeHtml(card.fakeTip)}</p><em>Parle avec aplomb. Plus c’est précis, plus ça peut sembler vrai.</em>`}
    </section>
    <button id="startExpertSpeech" class="primary-btn full">Je suis prêt·e à parler</button>
  `;
  document.querySelector("#startExpertSpeech").addEventListener("click", renderFakeExpertSpeech);
}

function renderFakeExpertSpeech() {
  const game = state.fakeExpert;
  const card = game.items[game.currentIndex];
  const speaker = state.players.find(player => player.id === game.speakerId);
  title.textContent = "Conférence express";
  screen.innerHTML = `
    ${renderV09Progress(game.currentIndex + 1, game.items.length, "Passage")}
    <section class="timer-stage v09-timer-stage expert-stage">
      <span class="category-chip">${avatarById(speaker.avatarId).emoji} ${escapeHtml(speaker.name)}</span>
      <div id="v09TimerRing" class="v09-timer-ring"><strong id="v09Countdown">${game.speechSeconds}</strong><small>secondes</small></div>
      <h2>${escapeHtml(card.topic)}</h2><p>Les autres peuvent poser une ou deux questions. L’orateur doit rester convaincant.</p>
    </section>
    <button id="expertVoteNow" class="secondary-btn full">Passer au verdict</button>
  `;
  const vote = () => { clearV09Timer(); game.currentVoterIndex = 0; renderFakeExpertVoteGate(); };
  document.querySelector("#expertVoteNow").addEventListener("click", vote);
  startV09Countdown(game.speechSeconds, vote);
}

function fakeExpertVoters(game) {
  return state.players.filter(player => player.id !== game.speakerId);
}

function renderFakeExpertVoteGate() {
  const game = state.fakeExpert;
  const voters = fakeExpertVoters(game);
  if (game.currentVoterIndex >= voters.length) return renderFakeExpertResult();
  const voter = voters[game.currentVoterIndex];
  title.textContent = "Verdict secret";
  screen.innerHTML = `
    <section class="handoff-stage handoff-v07"><div class="giant-avatar">${avatarById(voter.avatarId).emoji}</div><span class="category-chip">VERDICT SECRET</span><h2>Passe le téléphone à ${escapeHtml(voter.name)}</h2><p>L’orateur connaissait-il vraiment son sujet ?</p><button id="openExpertVote" class="primary-btn">Donner mon verdict</button></section>
  `;
  document.querySelector("#openExpertVote").addEventListener("click", renderFakeExpertVote);
}

function renderFakeExpertVote() {
  const game = state.fakeExpert;
  const card = game.items[game.currentIndex];
  const voter = fakeExpertVoters(game)[game.currentVoterIndex];
  title.textContent = "Vrai ou faux expert ?";
  screen.innerHTML = `
    <section class="v09-question-card"><span>🎓</span><small>${escapeHtml(voter.name).toUpperCase()}</small><h2>${escapeHtml(card.topic)}</h2></section>
    <section class="v09-binary-grid"><button class="v09-choice-card credible" data-expert-vote="real">🎓 Vrai expert</button><button class="v09-choice-card suspicious" data-expert-vote="fake">🎭 Faux expert</button></section>
  `;
  document.querySelectorAll("[data-expert-vote]").forEach(button => button.addEventListener("click", () => {
    game.votes[voter.id] = button.dataset.expertVote;
    game.currentVoterIndex += 1;
    renderFakeExpertVoteGate();
  }));
}

function renderFakeExpertResult() {
  const game = state.fakeExpert;
  const card = game.items[game.currentIndex];
  const speaker = state.players.find(player => player.id === game.speakerId);
  const correctIds = Object.entries(game.votes).filter(([, vote]) => vote === game.role).map(([id]) => id);
  const fooledIds = Object.entries(game.votes).filter(([, vote]) => vote !== game.role).map(([id]) => id);
  correctIds.forEach(id => game.scores[id] = Number(game.scores[id] || 0) + 1);
  game.scores[game.speakerId] = Number(game.scores[game.speakerId] || 0) + Math.min(3, fooledIds.length);
  game.rounds.push({ itemId: card.id, speakerId: game.speakerId, role: game.role, votes: { ...game.votes }, correctIds, fooledIds });
  title.textContent = "Diplôme révélé";
  setBackVisible(false);
  screen.innerHTML = `
    <section class="reveal-stage reveal-v07 expert-reveal"><span class="game-cover-icon">${game.role === "real" ? "🎓" : "🎭"}</span><h2>${escapeHtml(speaker.name)} était ${game.role === "real" ? "un vrai expert" : "un faux expert"}</h2><p>${escapeHtml(card.topic)}</p></section>
    <section class="who-vote-results">${fakeExpertVoters(game).map(voter => {
      const correct = correctIds.includes(voter.id);
      return `<article class="who-vote-row ${correct ? "correct" : "fooled"}"><span>${avatarById(voter.avatarId).emoji}</span><strong>${escapeHtml(voter.name)}</strong><small>a voté ${game.votes[voter.id] === "real" ? "vrai expert" : "faux expert"}</small><em>${correct ? "+1 pt" : "trompé·e"}</em></article>`;
    }).join("")}</section>
    <details class="answer-wall-details"><summary>Voir les vraies informations</summary><ul class="expert-fact-list">${(card.facts || []).map(fact => `<li>${escapeHtml(fact)}</li>`).join("")}</ul></details>
    <div class="special-event"><strong>🎤 ${fooledIds.length} personne${fooledIds.length > 1 ? "s" : ""} trompée${fooledIds.length > 1 ? "s" : ""}</strong><p>+${Math.min(3, fooledIds.length)} point${Math.min(3, fooledIds.length) > 1 ? "s" : ""} pour l’orateur.</p></div>
    ${state.alcohol && fooledIds.length ? `<div class="alcohol-callout">🍻 Les personnes trompées peuvent trinquer avec la boisson de leur choix, sans obligation.</div>` : ""}
    <button id="nextExpertRound" class="primary-btn full">${game.currentIndex + 1 >= game.items.length ? "Voir le classement" : "Orateur suivant"}</button>
  `;
  document.querySelector("#nextExpertRound").addEventListener("click", () => { game.currentIndex += 1; prepareFakeExpertRound(); });
}

function renderFakeExpertEnd() {
  const game = state.fakeExpert;
  renderV09Final({
    icon: "🎓", heading: "La conférence est terminée", text: "Les meilleurs bluffeurs et les jurés les plus lucides montent sur scène.", scores: game.scores,
    replay: () => { resetFakeExpertState({ roundCount: game.roundCount, includeAdult: game.includeAdult, speechSeconds: game.speechSeconds }); renderFakeExpertSetup(); },
    other: () => { state.fakeExpert = null; renderPlayChoice(); }
  });
}

/* ---------- QUI SUIS-JE ? ---------- */

function whoAmIPointsForClues(cluesUsed) {
  const used = Math.max(0, Number(cluesUsed || 0));
  if (used === 0) return 3;
  if (used === 1) return 2;
  return 1;
}

function resetWhoAmIState(config = {}) {
  state.whoAmI = {
    roundCount: Number(config.roundCount || Math.max(6, state.players.length)),
    includeAdult: Boolean(config.includeAdult),
    categoryMode: config.categoryMode || "mix",
    durationSeconds: Number(config.durationSeconds || 60),
    items: [],
    currentIndex: 0,
    cluesUsed: 0,
    guesserOrder: shuffleArray(state.players.map(player => player.id)),
    scores: Object.fromEntries(state.players.map(player => [player.id, 0])),
    rounds: []
  };
}

function renderWhoAmISetup() {
  clearV09Timer();
  if (!state.whoAmI) resetWhoAmIState();
  const game = state.whoAmI;
  const minimum = Math.max(6, state.players.length);
  const roundOptions = [minimum, game.roundCount, 10, 15, 20, 30, 50, 100]
    .filter((value, index, values) => value >= minimum && values.indexOf(value) === index);
  title.textContent = "Qui suis-je ?";
  setBackVisible(true);
  screen.innerHTML = `
    <section class="game-cover game-cover-whoami"><span class="game-cover-icon">❓</span><div><small>IMPOSTEURS & DÉDUCTION</small><h2>Qui suis-je ?</h2><p>Tout le monde connaît ton identité sauf toi. Pose des questions, puis débloque des indices seulement si tu bloques.</p></div></section>
    <section class="card setup-card-v07">
      <div class="form-group"><label for="whoAmIRounds">Nombre de tours</label><select id="whoAmIRounds" class="text-input">${roundOptions.map(value => `<option value="${value}" ${game.roundCount === value ? "selected" : ""}>${value} tours</option>`).join("")}</select></div>
      <div class="form-group top-gap"><label for="whoAmICategory">Catégories</label><select id="whoAmICategory" class="text-input"><option value="mix" ${game.categoryMode === "mix" ? "selected" : ""}>Mélange complet</option><option value="classic" ${game.categoryMode === "classic" ? "selected" : ""}>Quotidien, animaux, lieux et métiers</option><option value="culture" ${game.categoryMode === "culture" ? "selected" : ""}>Culture pop</option></select></div>
      <div class="form-group top-gap"><label for="whoAmITimer">Chronomètre</label><select id="whoAmITimer" class="text-input">${[45,60,90,120].map(value => `<option value="${value}" ${game.durationSeconds === value ? "selected" : ""}>${value} secondes</option>`).join("")}</select></div>
    </section>
    ${state.adult ? `<label class="option-card premium-toggle"><input id="whoAmIAdult" type="checkbox" ${game.includeAdult ? "checked" : ""}><span><strong>🌶️ Ajouter les identités adultes</strong><br><span class="helper">Relations, rendez-vous, dossiers et situations intimes.</span></span></label>` : ""}
    <div class="notice whoami-score-notice"><strong>Les indices sont maintenant pour la personne qui devine.</strong><br>Sans indice : 3 points · 1 indice : 2 points · 2 ou 3 indices : 1 point. Chaque aide gagne 1 point si l’identité est trouvée.</div>
    <button id="startWhoAmI" class="primary-btn full">Distribuer les identités</button>
  `;
  document.querySelector("#whoAmIRounds").addEventListener("change", event => game.roundCount = Number(event.target.value));
  document.querySelector("#whoAmICategory").addEventListener("change", event => game.categoryMode = event.target.value);
  document.querySelector("#whoAmITimer").addEventListener("change", event => game.durationSeconds = Number(event.target.value));
  document.querySelector("#whoAmIAdult")?.addEventListener("change", event => game.includeAdult = event.target.checked);
  document.querySelector("#startWhoAmI").addEventListener("click", startWhoAmIGame);
}

async function startWhoAmIGame() {
  const game = state.whoAmI;
  screen.innerHTML = `<div class="notice">Préparation des identités secrètes…</div>`;
  try {
    let pool = await loadJsonFile("data/qui-suis-je.json", "Impossible de charger les identités.");
    if (game.categoryMode === "classic") pool = pool.filter(item => item.category !== "culture");
    if (game.categoryMode === "culture") pool = pool.filter(item => item.category === "culture");
    if (state.adult && game.includeAdult) pool = pool.concat(await loadJsonFile("data/qui-suis-je-adulte.json", "Impossible de charger les identités adultes."));
    game.items = selectFreshItems(pool, Math.min(game.roundCount, pool.length), "solo:who-am-i");
    game.currentIndex = 0;
    game.cluesUsed = 0;
    game.guesserOrder = shuffleArray(state.players.map(player => player.id));
    game.scores = Object.fromEntries(state.players.map(player => [player.id, 0]));
    game.rounds = [];
    renderWhoAmIRevealGate();
  } catch (error) {
    alert(error.message);
    renderWhoAmISetup();
  }
}

function currentWhoAmIGuesser(game) {
  return state.players.find(player => player.id === game.guesserOrder[game.currentIndex % game.guesserOrder.length]);
}

function renderWhoAmIRevealGate() {
  const game = state.whoAmI;
  if (game.currentIndex >= game.items.length) return renderWhoAmIEnd();
  game.cluesUsed = 0;
  const guesser = currentWhoAmIGuesser(game);
  title.textContent = "Identité secrète";
  setBackVisible(false);
  screen.innerHTML = `
    ${renderV09Progress(game.currentIndex + 1, game.items.length, "Tour")}
    <section class="handoff-stage handoff-v07"><div class="giant-avatar">${avatarById(guesser.avatarId).emoji}</div><span class="category-chip">${escapeHtml(guesser.name).toUpperCase()} FERME LES YEUX</span><h2>Donne le téléphone au reste du groupe</h2><p>Tout le monde va voir l’identité secrète sauf ${escapeHtml(guesser.name)}. Les indices resteront cachés pour être débloqués ensuite par la personne qui devine.</p><button id="showWhoAmICard" class="primary-btn">Afficher l’identité</button></section>
  `;
  document.querySelector("#showWhoAmICard").addEventListener("click", renderWhoAmICard);
}

function renderWhoAmICard() {
  const game = state.whoAmI;
  const item = game.items[game.currentIndex];
  const guesser = currentWhoAmIGuesser(game);
  title.textContent = "À faire deviner";
  screen.innerHTML = `
    ${renderV09Progress(game.currentIndex + 1, game.items.length, "Tour")}
    <section class="whoami-secret-card whoami-helper-card"><small>${escapeHtml(item.category || "mystère").toUpperCase()}</small><span>❓</span><h2>${escapeHtml(item.label)}</h2><div class="whoami-helper-note"><strong>Ne lisez aucun indice.</strong><p>Répondez seulement par oui, non ou presque aux questions de ${escapeHtml(guesser.name)}.</p></div></section>
    <button id="startWhoAmIRound" class="primary-btn full">Tout le monde a mémorisé</button>
  `;
  document.querySelector("#startWhoAmIRound").addEventListener("click", renderWhoAmIPlaying);
}

function renderWhoAmIPlaying() {
  const game = state.whoAmI;
  const item = game.items[game.currentIndex];
  const guesser = currentWhoAmIGuesser(game);
  const clues = Array.isArray(item.clues) ? item.clues : [];
  title.textContent = "Qui suis-je ?";
  screen.innerHTML = `
    ${renderV09Progress(game.currentIndex + 1, game.items.length, "Tour")}
    <section class="timer-stage v09-timer-stage whoami-stage">
      <span class="category-chip">${avatarById(guesser.avatarId).emoji} ${escapeHtml(guesser.name)}</span>
      <div id="v09TimerRing" class="v09-timer-ring"><strong id="v09Countdown">${game.durationSeconds}</strong><small>secondes</small></div>
      <h2>Pose des questions</h2><p>Le groupe répond oui, non ou presque. Pas de mime ni de mot de la même famille.</p>
    </section>
    <section class="whoami-guesser-tools">
      <div class="whoami-clue-header"><div><small>AIDE PROGRESSIVE</small><strong>Indices pour ${escapeHtml(guesser.name)}</strong></div><span id="whoAmIClueCounter">0/${clues.length}</span></div>
      <div id="whoAmIClueStack" class="whoami-clue-stack"><p class="whoami-no-clue">Commence sans indice pour tenter de gagner 3 points.</p></div>
      <button id="whoAmIClueButton" class="secondary-btn full" ${clues.length ? "" : "disabled"}>🔎 Débloquer l’indice 1</button>
      <small id="whoAmIClueValue" class="whoami-clue-value">Récompense actuelle : 3 points</small>
    </section>
    <div class="v09-binary-grid"><button id="whoAmIFound" class="primary-btn">✅ Trouvé !</button><button id="whoAmIFailed" class="secondary-btn">⏱️ Temps écoulé</button></div>
  `;

  const clueStack = document.querySelector("#whoAmIClueStack");
  const clueCounter = document.querySelector("#whoAmIClueCounter");
  const clueButton = document.querySelector("#whoAmIClueButton");
  const clueValue = document.querySelector("#whoAmIClueValue");
  const updateClues = () => {
    const visible = clues.slice(0, game.cluesUsed);
    clueStack.innerHTML = visible.length
      ? visible.map((clue, index) => `<article class="whoami-clue-item"><span>${index + 1}</span><p>${escapeHtml(clue)}</p></article>`).join("")
      : `<p class="whoami-no-clue">Commence sans indice pour tenter de gagner 3 points.</p>`;
    clueCounter.textContent = `${game.cluesUsed}/${clues.length}`;
    const points = whoAmIPointsForClues(game.cluesUsed);
    clueValue.textContent = `Récompense actuelle : ${points} point${points > 1 ? "s" : ""}`;
    if (game.cluesUsed >= clues.length) {
      clueButton.disabled = true;
      clueButton.textContent = "Tous les indices sont révélés";
    } else {
      clueButton.disabled = false;
      clueButton.textContent = `🔎 Débloquer l’indice ${game.cluesUsed + 1}`;
    }
  };
  clueButton?.addEventListener("click", () => {
    game.cluesUsed = Math.min(clues.length, Number(game.cluesUsed || 0) + 1);
    updateClues();
  });
  updateClues();

  const finish = found => { clearV09Timer(); renderWhoAmIResult(found); };
  document.querySelector("#whoAmIFound").addEventListener("click", () => finish(true));
  document.querySelector("#whoAmIFailed").addEventListener("click", () => finish(false));
  startV09Countdown(game.durationSeconds, () => finish(false));
}

function renderWhoAmIResult(found) {
  const game = state.whoAmI;
  const item = game.items[game.currentIndex];
  const guesser = currentWhoAmIGuesser(game);
  const cluesUsed = Math.max(0, Number(game.cluesUsed || 0));
  const earned = found ? whoAmIPointsForClues(cluesUsed) : 0;
  if (found) {
    game.scores[guesser.id] = Number(game.scores[guesser.id] || 0) + earned;
    state.players.filter(player => player.id !== guesser.id).forEach(player => game.scores[player.id] = Number(game.scores[player.id] || 0) + 1);
  }
  game.rounds.push({ itemId: item.id, guesserId: guesser.id, found, cluesUsed, points: earned });
  title.textContent = found ? "Identité trouvée" : "Temps écoulé";
  setBackVisible(false);
  screen.innerHTML = `
    <section class="reveal-stage reveal-v07 whoami-reveal"><span class="game-cover-icon">${found ? "🎉" : "⏱️"}</span><h2>${escapeHtml(guesser.name)} était ${escapeHtml(item.label)}</h2><p>${found ? `+${earned} point${earned > 1 ? "s" : ""} pour ${escapeHtml(guesser.name)} avec ${cluesUsed} indice${cluesUsed > 1 ? "s" : ""}, et +1 pour chaque aide.` : `Cette identité n’a pas été trouvée après ${cluesUsed} indice${cluesUsed > 1 ? "s" : ""}.`}</p></section>
    <section class="whoami-clue-wall">${(item.clues || []).map((clue, index) => `<span><strong>${index + 1}</strong>${escapeHtml(clue)}</span>`).join("")}</section>
    ${state.alcohol && !found ? `<div class="alcohol-callout">🍻 ${escapeHtml(guesser.name)} peut trinquer avec la boisson de son choix, sans obligation.</div>` : ""}
    <button id="nextWhoAmI" class="primary-btn full">${game.currentIndex + 1 >= game.items.length ? "Voir le classement" : "Identité suivante"}</button>
  `;
  document.querySelector("#nextWhoAmI").addEventListener("click", () => { game.currentIndex += 1; game.cluesUsed = 0; renderWhoAmIRevealGate(); });
}

function renderWhoAmIEnd() {
  const game = state.whoAmI;
  renderV09Final({
    icon: "❓", heading: "Toutes les identités sont révélées", text: "Les meilleurs enquêteurs sont ceux qui trouvent avant d’ouvrir toute la boîte à indices.", scores: game.scores,
    replay: () => { resetWhoAmIState({ roundCount: game.roundCount, includeAdult: game.includeAdult, categoryMode: game.categoryMode, durationSeconds: game.durationSeconds }); renderWhoAmISetup(); },
    other: () => { state.whoAmI = null; renderPlayChoice(); }
  });
}

renderHome();

/* =========================================================
   AK'GAMES V0.14 — MEGA PACK TOUS LES JEUX
   Défis, quiz, bluff, scénarios, connaissance et pack adulte
   ========================================================= */

state.megaGame = state.megaGame || null;
state.v014Timer = state.v014Timer || null;
state.v014TimerToken = Number(state.v014TimerToken || 0);

const V014_GAME_CONFIGS = {
  "Roulette de défis": { engine: "turn", icon: "🎡", pack: "Défis & performance", data: "data/roulette-defis.json", description: "Une roulette de défis rapides, absurdes et parfaits pour réveiller la soirée.", defaultRounds: 12 },
  "Mime": { engine: "turn", icon: "🎬", pack: "Défis & performance", data: "data/mime.json", description: "Découvre ton mime en privé et fais-le deviner sans parler.", defaultRounds: 10, privatePrompt: true, timer: 45 },
  "Imitation": { engine: "turn", icon: "🎙️", pack: "Défis & performance", data: "data/imitation.json", description: "Voix, personnages et situations : le groupe doit reconnaître ton imitation.", defaultRounds: 10, privatePrompt: true, timer: 45 },
  "La Bombe": { engine: "bomb", icon: "💣", pack: "Jeux rapides", data: "data/bombe.json", description: "Donne une réponse, passe la bombe et évite d’être la personne chez qui elle explose.", defaultRounds: 6, timer: 25 },
  "Culture générale": { engine: "quiz", icon: "🌍", pack: "Quiz", data: "data/quiz-culture.json", description: "Des questions accessibles et variées pour tester toute la table.", defaultRounds: 12 },
  "Cinéma": { engine: "quiz", icon: "🍿", pack: "Quiz", data: "data/quiz-cinema.json", description: "Films cultes, animation, personnages et grandes répliques.", defaultRounds: 12 },
  "Musique": { engine: "quiz", icon: "🎵", pack: "Quiz", data: "data/quiz-musique.json", description: "Artistes, instruments, tubes et culture musicale.", defaultRounds: 12 },
  "Jeux vidéo": { engine: "quiz", icon: "🕹️", pack: "Quiz", data: "data/quiz-jeux-video.json", description: "Nintendo, jeux cultes, personnages et univers incontournables.", defaultRounds: 12 },
  "Devine le logo": { engine: "quiz", icon: "🔎", pack: "Quiz", data: "data/quiz-logos.json", description: "Reconnais la marque grâce à la description de son logo emblématique.", defaultRounds: 12 },
  "Plaide ta cause": { engine: "turn", icon: "⚖️", pack: "Bluff & argumentation", data: "data/plaide-cause.json", description: "Défends une opinion impossible et convaincs le groupe en moins d’une minute.", defaultRounds: 10, timer: 45 },
  "Fake ou Réel ?": { engine: "quiz", icon: "🧪", pack: "Bluff & argumentation", data: "data/fake-reel.json", description: "Une affirmation, deux camps : info réelle ou énorme intox ?", defaultRounds: 12 },
  "Alerte Rouge": { engine: "scenario", icon: "🚨", pack: "Histoires & scénarios", data: "data/alerte-rouge.json", description: "Le groupe vote pour décider quoi faire face à une situation qui dérape.", defaultRounds: 8 },
  "Tu me connais ou pas ?": { engine: "know", icon: "💭", pack: "Connaissance du groupe", data: "data/tu-me-connais.json", description: "Choisis une ambiance, réponds en secret et découvre qui ose miser sur le fait de vraiment te connaître.", defaultRounds: 10 },
  "Le Classement secret": { engine: "ranking", icon: "🏅", pack: "Connaissance du groupe", data: "data/classement-secret.json", description: "Classe cinq options en privé, puis découvre qui connaît vraiment ton numéro un.", defaultRounds: 8 },
  "Devinettes": { engine: "quiz", icon: "🧩", pack: "Jeux rapides", data: "data/devinettes.json", description: "Des énigmes courtes à résoudre avant les autres.", defaultRounds: 12 },
  "Questions osées": { engine: "turn", icon: "🌶️", pack: "Pack adulte", data: "data/questions-osees.json", description: "Des questions intimes et audacieuses, sans obligation de répondre et sans classement.", defaultRounds: 12, adultOnly: true, questionMode: true, scoreless: true },
  "Jeux à boire": { engine: "turn", icon: "🥂", pack: "Pack adulte", data: "data/jeux-a-boire.json", description: "Des règles collectives légères, avec boisson au choix, hydratation et aucun classement.", defaultRounds: 12, adultOnly: true, drinkingGame: true, scoreless: true },
  "Défis adultes": { engine: "turn", icon: "🔥", pack: "Pack adulte", data: "data/defis-adultes.json", description: "Défis de flirt, impro et confidences pour un groupe adulte consentant.", defaultRounds: 12, adultOnly: true }
};

const V014_NEW_GAMES = new Set(Object.keys(V014_GAME_CONFIGS));
const V014_READY_GAMES = new Set([...V09_READY_GAMES, ...V014_NEW_GAMES]);
const V014_GAME_ICONS = {
  ...V09_GAME_ICONS,
  ...Object.fromEntries(Object.entries(V014_GAME_CONFIGS).map(([name, config]) => [name, config.icon]))
};


const V014_KNOW_PACKS = [
  { id: "details", icon: "🔎", label: "Détails minuscules", description: "Manies, réflexes et petits détails du quotidien." },
  { id: "past", icon: "🧸", label: "Mon passé", description: "Souvenirs, nostalgie, école et anciens dossiers." },
  { id: "food", icon: "🍟", label: "Nourriture", description: "Commandes, habitudes et comportements à table." },
  { id: "digital", icon: "📱", label: "Vie numérique", description: "Messages, téléphone, réseaux et algorithmes." },
  { id: "contradictions", icon: "🎭", label: "Mes contradictions", description: "Réactions imprévisibles et petites incohérences." },
  { id: "extreme", icon: "🚨", label: "Situations extrêmes", description: "Imprévus, pression et scénarios complètement absurdes." },
  { id: "intimate", icon: "🤐", label: "Ce que je montre peu", description: "Confiance, limites, émotions et perception de soi." },
  { id: "group", icon: "🫂", label: "Ma place dans le groupe", description: "Amitié, soirées, organisation et vie collective." },
  { id: "ideal", icon: "✨", label: "Ma vie idéale", description: "Voyages, projets, rêves et futur." },
  { id: "dossiers", icon: "🗂️", label: "Dossiers entre proches", description: "Moments gênants, excuses et anecdotes compromettantes." },
  { id: "adult", icon: "🌶️", label: "Dossiers +18", description: "Crushs, séduction, ex, jalousie et intimité.", adult: true }
];

const V014_KNOW_CONFIDENCE = {
  try: { id: "try", icon: "🎲", label: "Je tente", reward: 1, penalty: 0, helper: "+1 si juste · 0 sinon" },
  know: { id: "know", icon: "🧠", label: "Je pense te connaître", reward: 2, penalty: -1, helper: "+2 si juste · −1 sinon" },
  certain: { id: "certain", icon: "🔥", label: "J’en suis certain·e", reward: 3, penalty: -2, helper: "+3 si juste · −2 sinon" }
};

function v014KnowPackMeta(packId) {
  return V014_KNOW_PACKS.find(pack => pack.id === packId) || V014_KNOW_PACKS[0];
}

function v014NormalizeKnowPacks(selectedPacks) {
  let selected = Array.isArray(selectedPacks) ? [...new Set(selectedPacks.filter(Boolean))] : ["mix"];
  if (!state.adult) selected = selected.filter(id => id !== "adult");
  if (!selected.length) selected = ["mix"];
  if (selected.includes("mix")) return ["mix"];
  const valid = selected.filter(id => V014_KNOW_PACKS.some(pack => pack.id === id));
  return valid.length ? valid : ["mix"];
}

function v014ToggleKnowPack(game, packId) {
  if (!game || game.engine !== "know") return;
  if (packId === "mix") {
    game.selectedPacks = ["mix"];
    return;
  }
  let selected = v014NormalizeKnowPacks(game.selectedPacks).filter(id => id !== "mix");
  selected = selected.includes(packId) ? selected.filter(id => id !== packId) : [...selected, packId];
  game.selectedPacks = selected.length ? selected : ["mix"];
}

function v014KnowSetupControls(game) {
  if (!game || game.engine !== "know") return "";
  game.selectedPacks = v014NormalizeKnowPacks(game.selectedPacks);
  const selected = game.selectedPacks;
  const packCards = [
    { id: "mix", icon: "🎲", label: "Mix équilibré", description: "Un mélange de tous les packs classiques." },
    ...V014_KNOW_PACKS.filter(pack => !pack.adult || state.adult)
  ];
  return `
    <section class="card know-pack-section">
      <div class="know-pack-heading"><div><small>AMBIANCE DE LA PARTIE</small><h3>Choisis un ou plusieurs packs</h3></div><span>${selected.includes("mix") ? "Mélange" : `${selected.length} sélectionné${selected.length > 1 ? "s" : ""}`}</span></div>
      <div class="know-pack-grid">${packCards.map(pack => {
        const active = selected.includes(pack.id);
        return `<button type="button" class="know-pack-card ${active ? "active" : ""} ${pack.adult ? "adult" : ""}" data-know-pack="${pack.id}" aria-pressed="${active}"><span>${pack.icon}</span><strong>${escapeHtml(pack.label)}</strong><small>${escapeHtml(pack.description)}</small><b>${active ? "✓" : "+"}</b></button>`;
      }).join("")}</div>
      ${!state.adult ? `<p class="helper know-adult-helper">🌶️ Le pack +18 apparaît lorsque le contenu adulte est activé dans les paramètres.</p>` : ""}
    </section>
    <section class="card know-confidence-toggle">
      <div><span>🎯</span><div><strong>Miser sur sa réponse</strong><small>Plus tu es sûr·e, plus tu peux gagner… ou perdre.</small></div></div>
      <label class="know-switch"><input id="knowConfidenceMode" type="checkbox" ${game.confidenceMode !== false ? "checked" : ""}><span></span></label>
    </section>`;
}

function bindV014KnowSetupControls(game) {
  if (!game || game.engine !== "know") return;
  document.querySelectorAll("[data-know-pack]").forEach(button => button.addEventListener("click", () => {
    v014ToggleKnowPack(game, button.dataset.knowPack);
    renderMegaSetup();
  }));
  document.querySelector("#knowConfidenceMode")?.addEventListener("change", event => {
    game.confidenceMode = Boolean(event.target.checked);
  });
}

function v014FilterKnowPool(pool, game) {
  if (!game || game.engine !== "know") return pool;
  const selected = v014NormalizeKnowPacks(game.selectedPacks);
  const filtered = pool.filter(item => {
    const packId = item.pack || "details";
    if (packId === "adult" && !state.adult) return false;
    if (selected.includes("mix")) return packId !== "adult";
    return selected.includes(packId);
  });
  return filtered.length ? filtered : pool.filter(item => (item.pack || "details") !== "adult");
}

function v014SelectKnowItems(pool, count, historyKey, game) {
  const safeCount = Math.min(Math.max(0, Number(count || 0)), pool.length);
  if (!game || game.engine !== "know") return selectFreshItems(pool, safeCount, historyKey);

  const grouped = Object.groupBy
    ? Object.groupBy(pool, item => item.pack || "details")
    : pool.reduce((result, item) => {
        const packId = item.pack || "details";
        (result[packId] ||= []).push(item);
        return result;
      }, {});
  const packIds = shuffleArray(Object.keys(grouped).filter(packId => grouped[packId]?.length));
  if (!packIds.length) return [];

  const baseQuota = Math.floor(safeCount / packIds.length);
  const extra = safeCount % packIds.length;
  let selected = [];
  packIds.forEach((packId, index) => {
    const quota = baseQuota + (index < extra ? 1 : 0);
    if (!quota) return;
    selected.push(...selectFreshItems(grouped[packId], Math.min(quota, grouped[packId].length), `${historyKey}:${packId}`));
  });

  if (selected.length < safeCount) {
    const selectedIds = new Set(selected.map(item => item.id));
    const remaining = pool.filter(item => !selectedIds.has(item.id));
    selected.push(...selectFreshItems(remaining, Math.min(safeCount - selected.length, remaining.length), `${historyKey}:extra`));
  }
  return shuffleArray(selected).slice(0, safeCount);
}

function v014KnowVoteData(rawVote) {
  if (rawVote && typeof rawVote === "object") {
    return {
      answer: Number(rawVote.answer),
      confidence: V014_KNOW_CONFIDENCE[rawVote.confidence] ? rawVote.confidence : "try"
    };
  }
  return { answer: Number(rawVote), confidence: "try" };
}

function v014KnowScoreDelta(rawVote, isCorrect, confidenceMode = true) {
  const vote = v014KnowVoteData(rawVote);
  if (!confidenceMode) return isCorrect ? 1 : 0;
  const confidence = V014_KNOW_CONFIDENCE[vote.confidence] || V014_KNOW_CONFIDENCE.try;
  return isCorrect ? confidence.reward : confidence.penalty;
}

function v014KnowDeltaLabel(delta) {
  const value = Number(delta || 0);
  return value > 0 ? `+${value}` : String(value).replace("-", "−");
}

function v014SetCategoryGames(id, games) {
  const category = categories.find(item => item.id === id);
  if (category) category.games = games;
}

v014SetCategoryGames("ambiance", [
  "Action ou Vérité", "Qui de nous ?", "Je n’ai jamais", "Tu préfères", "Roulette de défis",
  "Même cerveau", "Minorité", "Tu me connais ou pas ?", "Le Classement secret"
]);
v014SetCategoryGames("rire", ["Mime", "Imitation", "Le premier qui rit a perdu", "Plaide ta cause", "Le Faux Expert", "La Bombe"]);
v014SetCategoryGames("quiz", ["Culture générale", "Cinéma", "Musique", "Jeux vidéo", "Devine le logo", "Fake ou Réel ?"]);
v014SetCategoryGames("rapide", ["Devinettes", "Qui suis-je ?", "La Bombe", "Blind Test"]);
v014SetCategoryGames("bluff", ["Qui ment le mieux ?", "L’Imposteur sait presque tout", "Qui a répondu ça ?", "Le Faux Expert", "Fake ou Réel ?"]);
v014SetCategoryGames("scenario", ["Alerte Rouge"]);
v014SetCategoryGames("adulte", ["Action ou Vérité +18", "Je n’ai jamais +18", "Tu préfères +18", "Questions osées", "Défis adultes", "Jeux à boire"]);

function clearV014Timer() {
  if (state.v014Timer) window.clearInterval(state.v014Timer);
  state.v014Timer = null;
  state.v014TimerToken += 1;
}

function startV014Timer(endAt, selector, onDone, totalSeconds = null) {
  clearV014Timer();
  const token = state.v014TimerToken;
  const safeEndAt = Number(endAt || Date.now());
  const total = Number(totalSeconds || Math.max(1, Math.ceil((safeEndAt - Date.now()) / 1000)));
  const tick = () => {
    if (token !== state.v014TimerToken) return;
    const left = Math.max(0, Math.ceil((safeEndAt - Date.now()) / 1000));
    const node = document.querySelector(selector);
    if (node) node.textContent = String(left);
    const fill = document.querySelector("#v014TimerFill");
    if (fill) fill.style.width = `${Math.max(0, Math.min(100, (left / Math.max(1, total)) * 100))}%`;
    if (left <= 0) {
      clearV014Timer();
      onDone?.();
    }
  };
  tick();
  state.v014Timer = window.setInterval(tick, 200);
}

function v014ScoreMap() {
  return Object.fromEntries(state.players.map(player => [player.id, 0]));
}

function resetMegaGame(gameName, replayConfig = {}) {
  const config = V014_GAME_CONFIGS[gameName];
  if (!config) return;
  state.megaGame = {
    gameName,
    engine: config.engine,
    config,
    roundCount: Number(replayConfig.roundCount || config.defaultRounds || 10),
    durationSeconds: Number(replayConfig.durationSeconds || config.timer || 45),
    items: [],
    currentIndex: 0,
    currentPlayerIndex: 0,
    currentVoterIndex: 0,
    phase: "setup",
    votes: {},
    scores: v014ScoreMap(),
    rounds: [],
    revealed: false,
    targetAnswer: null,
    targetRanking: [],
    rankingDraft: [],
    bombEndsAt: null,
    bombPlayerIndex: 0,
    currentResult: null,
    selectedPacks: v014NormalizeKnowPacks(replayConfig.selectedPacks || ["mix"]),
    confidenceMode: replayConfig.confidenceMode !== false,
    pendingKnowGuess: null
  };
}

function v014RoundOptions(selected) {
  return [6, 8, 10, 12, 15, 20]
    .map(value => `<option value="${value}" ${Number(selected) === value ? "selected" : ""}>${value} manche${value > 1 ? "s" : ""}</option>`)
    .join("");
}

function renderMegaSetup() {
  const game = state.megaGame;
  if (!game) return renderGames();
  const config = game.config;
  clearV014Timer();
  title.textContent = game.gameName;
  setBackVisible(true);

  const timerControls = config.engine === "bomb"
    ? `<div class="form-group top-gap"><label for="megaDuration">Temps de la bombe</label><select id="megaDuration" class="text-input">${[15, 20, 25, 30, 40].map(value => `<option value="${value}" ${game.durationSeconds === value ? "selected" : ""}>${value} secondes</option>`).join("")}</select></div>`
    : config.timer
      ? `<div class="form-group top-gap"><label for="megaDuration">Chronomètre indicatif</label><select id="megaDuration" class="text-input">${[30, 45, 60, 90].map(value => `<option value="${value}" ${game.durationSeconds === value ? "selected" : ""}>${value} secondes</option>`).join("")}</select></div>`
      : "";

  screen.innerHTML = `
    <section class="game-cover game-cover-mega engine-${config.engine}">
      <span class="game-cover-icon">${config.icon}</span>
      <div><small>${escapeHtml(config.pack).toUpperCase()}</small><h2>${escapeHtml(game.gameName)}</h2><p>${escapeHtml(config.description)}</p></div>
    </section>
    <section class="card setup-card-v07">
      <div class="form-group"><label for="megaRounds">Nombre de manches</label><select id="megaRounds" class="text-input">${v014RoundOptions(game.roundCount)}</select></div>
      ${timerControls}
    </section>
    ${v014KnowSetupControls(game)}
    ${config.drinkingGame ? `<div class="responsible-callout">💧 Petites gorgées uniquement, boissons sans alcool possibles, et chacun peut passer sans justification.</div>` : ""}
    ${config.adultOnly ? `<div class="notice">🔞 Jeu réservé à un groupe adulte. Le consentement et le droit de passer restent prioritaires.</div>` : ""}
    <button id="startMegaGame" class="primary-btn full">Lancer ${escapeHtml(game.gameName)}</button>
  `;

  document.querySelector("#megaRounds").addEventListener("change", event => game.roundCount = Number(event.target.value));
  document.querySelector("#megaDuration")?.addEventListener("change", event => game.durationSeconds = Number(event.target.value));
  bindV014KnowSetupControls(game);
  document.querySelector("#startMegaGame").addEventListener("click", startMegaGame);
}

async function startMegaGame() {
  const game = state.megaGame;
  if (!game) return;
  screen.innerHTML = `<div class="notice">Préparation de ${escapeHtml(game.gameName)}…</div>`;
  try {
    const rawPool = await loadJsonFile(game.config.data, `Impossible de charger ${game.gameName}.`);
    const pool = v014FilterKnowPool(rawPool, game);
    game.items = v014SelectKnowItems(pool, Math.min(game.roundCount, pool.length), `solo:mega:${game.gameName}:${v014NormalizeKnowPacks(game.selectedPacks).join("-")}`, game);
    game.currentIndex = 0;
    game.currentPlayerIndex = 0;
    game.currentVoterIndex = 0;
    game.votes = {};
    game.scores = v014ScoreMap();
    game.rounds = [];
    game.revealed = false;
    game.targetAnswer = null;
    game.targetRanking = [];
    game.rankingDraft = [];
    game.bombEndsAt = null;
    game.bombPlayerIndex = Math.floor(Math.random() * Math.max(1, state.players.length));
    game.currentResult = null;
    game.pendingKnowGuess = null;
    renderMegaCurrent();
  } catch (error) {
    console.error(error);
    alert(error.message || "Impossible de lancer le jeu.");
    renderMegaSetup();
  }
}

function renderMegaCurrent() {
  const game = state.megaGame;
  if (!game) return renderGames();
  if (game.currentIndex >= game.items.length) return renderMegaFinal();
  if (game.engine === "turn") return renderMegaTurn();
  if (game.engine === "quiz") return renderMegaQuizGate();
  if (game.engine === "scenario") return renderMegaScenarioGate();
  if (game.engine === "know") return renderMegaKnowTargetGate();
  if (game.engine === "ranking") return renderMegaRankingTargetGate();
  if (game.engine === "bomb") return renderMegaBombRound();
}

function v014Progress(game, label = "Manche") {
  const total = Math.max(1, game.items.length || game.roundCount || 1);
  const current = Math.min(total, Number(game.currentIndex || 0) + 1);
  return `<div class="game-progress"><span>${escapeHtml(label)} ${current}/${total}</span><div class="progress-track"><div class="progress-fill" style="width:${Math.round((current / total) * 100)}%"></div></div></div>`;
}

function renderMegaTurn() {
  const game = state.megaGame;
  const item = game.items[game.currentIndex];
  const player = state.players[game.currentIndex % state.players.length];
  const config = game.config;
  clearV014Timer();
  title.textContent = game.gameName;
  setBackVisible(false);

  if (config.privatePrompt && !game.revealed) {
    screen.innerHTML = `
      ${v014Progress(game)}
      <section class="handoff-stage handoff-v07">
        <div class="giant-avatar">${avatarById(player.avatarId).emoji}</div>
        <span class="category-chip">TOUR DE ${escapeHtml(player.name).toUpperCase()}</span>
        <h2>Écran privé</h2>
        <p>Donnez le téléphone à ${escapeHtml(player.name)}. Le groupe ne doit pas voir le sujet.</p>
        <button id="revealMegaPrompt" class="primary-btn">Voir mon sujet</button>
      </section>`;
    document.querySelector("#revealMegaPrompt").addEventListener("click", () => { game.revealed = true; renderMegaTurn(); });
    return;
  }

  const promptText = item.text || item.question || item.title || "Défi surprise";
  const buttonDone = config.questionMode ? "J’ai répondu" : config.drinkingGame ? "Règle terminée" : "Réussi";
  screen.innerHTML = `
    ${v014Progress(game)}
    <section class="prompt-stage mega-prompt-stage engine-${config.engine}">
      <div class="prompt-player"><span>${avatarById(player.avatarId).emoji}</span><div><small>C’EST AU TOUR DE</small><strong>${escapeHtml(player.name)}</strong></div></div>
      <span class="prompt-type-chip">${config.icon} ${escapeHtml(game.gameName).toUpperCase()}</span>
      <h2>${escapeHtml(promptText)}</h2>
      ${config.timer ? `<div class="mega-mini-timer"><strong id="v014Countdown">${game.durationSeconds}</strong><span>secondes</span><div class="progress-track"><div id="v014TimerFill" class="progress-fill" style="width:100%"></div></div></div>` : ""}
    </section>
    <section class="decision-grid"><button id="megaDone" class="primary-btn">✓ ${buttonDone}</button><button id="megaSkip" class="secondary-btn">Passer</button></section>
    ${state.alcohol && !config.drinkingGame ? `<div class="alcohol-callout">🍻 Passer reste sans pénalité. Si le groupe boit, chacun choisit librement une petite gorgée ou de l’eau.</div>` : ""}
  `;

  document.querySelector("#megaDone").addEventListener("click", () => finishMegaTurn(true));
  document.querySelector("#megaSkip").addEventListener("click", () => finishMegaTurn(false));
  if (config.timer) startV014Timer(Date.now() + game.durationSeconds * 1000, "#v014Countdown", () => finishMegaTurn(false), game.durationSeconds);
}

function finishMegaTurn(success) {
  const game = state.megaGame;
  if (!game) return;
  clearV014Timer();
  const player = state.players[game.currentIndex % state.players.length];
  if (success) game.scores[player.id] = Number(game.scores[player.id] || 0) + 1;
  game.rounds.push({ itemId: game.items[game.currentIndex]?.id, playerId: player.id, success });
  game.currentIndex += 1;
  game.revealed = false;
  renderMegaCurrent();
}

function renderMegaQuizGate() {
  const game = state.megaGame;
  if (game.currentVoterIndex >= state.players.length) return renderMegaQuizReveal();
  const player = state.players[game.currentVoterIndex];
  clearV014Timer();
  title.textContent = `Réponse secrète · ${game.gameName}`;
  setBackVisible(false);
  screen.innerHTML = `
    ${v014Progress(game, "Question")}
    <section class="handoff-stage handoff-v07"><div class="giant-avatar">${avatarById(player.avatarId).emoji}</div><span class="category-chip">${escapeHtml(player.name).toUpperCase()}</span><h2>À toi de répondre</h2><p>Le choix restera secret jusqu’à ce que tout le monde ait voté.</p><button id="openMegaQuiz" class="primary-btn">Afficher la question</button></section>`;
  document.querySelector("#openMegaQuiz").addEventListener("click", renderMegaQuizVote);
}

function renderMegaQuizVote() {
  const game = state.megaGame;
  const item = game.items[game.currentIndex];
  const player = state.players[game.currentVoterIndex];
  title.textContent = game.gameName;
  screen.innerHTML = `
    ${v014Progress(game, "Question")}
    <section class="quiz-question-card"><span class="category-chip">${game.config.icon} ${escapeHtml(player.name)}</span><h2>${escapeHtml(item.question)}</h2></section>
    <section class="mega-option-grid">${(item.options || []).map((option, index) => `<button class="mega-option-btn" data-mega-answer="${index}"><span>${String.fromCharCode(65 + index)}</span><strong>${escapeHtml(option)}</strong></button>`).join("")}</section>`;
  document.querySelectorAll("[data-mega-answer]").forEach(button => button.addEventListener("click", () => {
    game.votes[player.id] = Number(button.dataset.megaAnswer);
    game.currentVoterIndex += 1;
    renderMegaQuizGate();
  }));
}

function renderMegaQuizReveal() {
  const game = state.megaGame;
  const item = game.items[game.currentIndex];
  const correct = Number(item.answer);
  const points = akQuizPointsForItem(item);
  const correctPlayers = state.players.filter(player => Number(game.votes[player.id]) === correct);
  correctPlayers.forEach(player => game.scores[player.id] = Number(game.scores[player.id] || 0) + points);
  game.rounds.push({ itemId: item.id, votes: { ...game.votes }, correct, points });
  title.textContent = "Réponse";
  setBackVisible(false);
  screen.innerHTML = `
    ${v014Progress(game, "Question")}
    <section class="reveal-stage reveal-v07 mega-quiz-reveal"><span class="game-cover-icon">${correctPlayers.length ? "✅" : "🧠"}</span><h2>${escapeHtml(item.options?.[correct] || "Réponse")}</h2><p>${escapeHtml(item.explanation || "Réponse révélée.")} Bonne réponse : +${points} point${points > 1 ? "s" : ""}.</p></section>
    <section class="answer-chip-wall">${state.players.map(player => { const won = Number(game.votes[player.id]) === correct; return `<span class="${won ? "correct" : "wrong"}">${escapeHtml(avatarById(player.avatarId).name)} · ${escapeHtml(player.name)} · ${escapeHtml(item.options?.[game.votes[player.id]] || "-")}${won ? ` · +${points}` : ""}</span>`; }).join("")}</section>
    <button id="nextMegaQuiz" class="primary-btn full">${game.currentIndex + 1 >= game.items.length ? "Voir le classement" : "Question suivante"}</button>`;
  document.querySelector("#nextMegaQuiz").addEventListener("click", () => {
    game.currentIndex += 1;
    game.currentVoterIndex = 0;
    game.votes = {};
    renderMegaCurrent();
  });
}

function renderMegaScenarioGate() {
  const game = state.megaGame;
  if (game.currentVoterIndex >= state.players.length) return renderMegaScenarioReveal();
  const player = state.players[game.currentVoterIndex];
  const item = game.items[game.currentIndex];
  title.textContent = "Alerte Rouge";
  setBackVisible(false);
  screen.innerHTML = `
    ${v014Progress(game, "Scénario")}
    <section class="handoff-stage handoff-v07"><div class="giant-avatar">${avatarById(player.avatarId).emoji}</div><span class="category-chip">VOTE DE ${escapeHtml(player.name).toUpperCase()}</span><h2>${escapeHtml(item.title)}</h2><p>Ta décision restera secrète.</p><button id="openScenarioVote" class="primary-btn">Choisir une option</button></section>`;
  document.querySelector("#openScenarioVote").addEventListener("click", renderMegaScenarioVote);
}

function renderMegaScenarioVote() {
  const game = state.megaGame;
  const item = game.items[game.currentIndex];
  screen.innerHTML = `
    ${v014Progress(game, "Scénario")}
    <section class="scenario-card"><span>🚨</span><small>${escapeHtml(item.title).toUpperCase()}</small><h2>${escapeHtml(item.text)}</h2></section>
    <section class="mega-option-grid">${(item.options || []).map((option, index) => `<button class="mega-option-btn scenario-option" data-scenario-answer="${index}"><span>${index + 1}</span><strong>${escapeHtml(option.label)}</strong></button>`).join("")}</section>`;
  document.querySelectorAll("[data-scenario-answer]").forEach(button => button.addEventListener("click", () => {
    const player = state.players[game.currentVoterIndex];
    game.votes[player.id] = Number(button.dataset.scenarioAnswer);
    game.currentVoterIndex += 1;
    renderMegaScenarioGate();
  }));
}

function renderMegaScenarioReveal() {
  const game = state.megaGame;
  const item = game.items[game.currentIndex];
  const counts = {};
  Object.values(game.votes).forEach(value => counts[value] = Number(counts[value] || 0) + 1);
  const max = Math.max(...Object.values(counts), 0);
  const winning = Object.keys(counts).map(Number).filter(index => counts[index] === max);
  const chosen = winning[Math.floor(Math.random() * Math.max(1, winning.length))] ?? 0;
  state.players.filter(player => Number(game.votes[player.id]) === chosen).forEach(player => game.scores[player.id] = Number(game.scores[player.id] || 0) + 1);
  game.rounds.push({ itemId: item.id, votes: { ...game.votes }, chosen });
  title.textContent = "Conséquence";
  screen.innerHTML = `
    ${v014Progress(game, "Scénario")}
    <section class="reveal-stage reveal-v07 scenario-reveal"><span class="game-cover-icon">🚨</span><h2>${escapeHtml(item.options?.[chosen]?.label || "Décision prise")}</h2><p>${escapeHtml(item.options?.[chosen]?.outcome || "L’histoire continue.")}</p></section>
    <section class="vote-distribution">${(item.options || []).map((option, index) => `<div><strong>${escapeHtml(option.label)}</strong><span>${Number(counts[index] || 0)} vote${Number(counts[index] || 0) > 1 ? "s" : ""}</span></div>`).join("")}</section>
    <button id="nextScenario" class="primary-btn full">${game.currentIndex + 1 >= game.items.length ? "Voir le classement" : "Scénario suivant"}</button>`;
  document.querySelector("#nextScenario").addEventListener("click", () => {
    game.currentIndex += 1;
    game.currentVoterIndex = 0;
    game.votes = {};
    renderMegaCurrent();
  });
}

function v014CurrentTarget(game) {
  return state.players[game.currentIndex % state.players.length];
}

function v014Guessers(game) {
  const target = v014CurrentTarget(game);
  return state.players.filter(player => player.id !== target.id);
}

function renderMegaKnowTargetGate() {
  const game = state.megaGame;
  if (game.targetAnswer !== null) return renderMegaKnowGuesserGate();
  const target = v014CurrentTarget(game);
  const item = game.items[game.currentIndex];
  const pack = v014KnowPackMeta(item.pack);
  title.textContent = "Réponse personnelle";
  setBackVisible(false);
  screen.innerHTML = `
    ${v014Progress(game, "Question")}
    <section class="handoff-stage handoff-v07"><div class="giant-avatar">${avatarById(target.avatarId).emoji}</div><span class="category-chip">${pack.icon} ${escapeHtml(pack.label).toUpperCase()}</span><h2>${escapeHtml(target.name)}, réponds en secret</h2><p>${escapeHtml(item.question)}</p><button id="openKnowTarget" class="primary-btn">Afficher mes choix</button></section>`;
  document.querySelector("#openKnowTarget").addEventListener("click", renderMegaKnowTargetChoice);
}

function renderMegaKnowTargetChoice() {
  const game = state.megaGame;
  const item = game.items[game.currentIndex];
  const pack = v014KnowPackMeta(item.pack);
  screen.innerHTML = `
    ${v014Progress(game, "Question")}
    <section class="quiz-question-card"><span class="category-chip">${pack.icon} ${escapeHtml(pack.label).toUpperCase()}</span><h2>${escapeHtml(item.question)}</h2><p>Choisis ta vraie réponse. Elle restera cachée jusqu’au verdict.</p></section>
    <section class="mega-option-grid">${item.options.map((option, index) => `<button class="mega-option-btn" data-know-target="${index}"><span>${index + 1}</span><strong>${escapeHtml(option)}</strong></button>`).join("")}</section>`;
  document.querySelectorAll("[data-know-target]").forEach(button => button.addEventListener("click", () => {
    game.targetAnswer = Number(button.dataset.knowTarget);
    game.currentVoterIndex = 0;
    game.votes = {};
    game.pendingKnowGuess = null;
    renderMegaKnowGuesserGate();
  }));
}

function renderMegaKnowGuesserGate() {
  const game = state.megaGame;
  const guessers = v014Guessers(game);
  if (game.currentVoterIndex >= guessers.length) return renderMegaKnowReveal();
  const guesser = guessers[game.currentVoterIndex];
  const target = v014CurrentTarget(game);
  const item = game.items[game.currentIndex];
  const pack = v014KnowPackMeta(item.pack);
  title.textContent = "Tu me connais ou pas ?";
  screen.innerHTML = `
    ${v014Progress(game, "Question")}
    <section class="handoff-stage handoff-v07"><div class="giant-avatar">${avatarById(guesser.avatarId).emoji}</div><span class="category-chip">${pack.icon} ${escapeHtml(pack.label).toUpperCase()}</span><h2>Que choisirait ${escapeHtml(target.name)} ?</h2><p>${game.confidenceMode !== false ? "Choisis sa réponse, puis décide combien tu oses miser." : "Fais ton pronostic sans demander d’indice."}</p><button id="openKnowGuess" class="primary-btn">Faire mon choix</button></section>`;
  document.querySelector("#openKnowGuess").addEventListener("click", renderMegaKnowGuess);
}

function renderMegaKnowGuess() {
  const game = state.megaGame;
  const item = game.items[game.currentIndex];
  const target = v014CurrentTarget(game);
  const pack = v014KnowPackMeta(item.pack);
  screen.innerHTML = `
    ${v014Progress(game, "Question")}
    <section class="quiz-question-card"><span class="category-chip">${pack.icon} À PROPOS DE ${escapeHtml(target.name).toUpperCase()}</span><h2>${escapeHtml(item.question)}</h2></section>
    <section class="mega-option-grid">${item.options.map((option, index) => `<button class="mega-option-btn" data-know-guess="${index}"><span>${index + 1}</span><strong>${escapeHtml(option)}</strong></button>`).join("")}</section>`;
  document.querySelectorAll("[data-know-guess]").forEach(button => button.addEventListener("click", () => {
    const guesser = v014Guessers(game)[game.currentVoterIndex];
    const answer = Number(button.dataset.knowGuess);
    if (game.confidenceMode === false) {
      game.votes[guesser.id] = { answer, confidence: "try" };
      game.currentVoterIndex += 1;
      renderMegaKnowGuesserGate();
      return;
    }
    game.pendingKnowGuess = { playerId: guesser.id, answer };
    renderMegaKnowConfidence();
  }));
}

function renderMegaKnowConfidence() {
  const game = state.megaGame;
  const pending = game.pendingKnowGuess;
  if (!pending) return renderMegaKnowGuess();
  const item = game.items[game.currentIndex];
  const target = v014CurrentTarget(game);
  const selectedOption = item.options[pending.answer];
  title.textContent = "Combien tu mises ?";
  screen.innerHTML = `
    ${v014Progress(game, "Question")}
    <section class="know-bet-stage"><span>🎯</span><small>TON PRONOSTIC POUR ${escapeHtml(target.name).toUpperCase()}</small><h2>${escapeHtml(selectedOption)}</h2><p>La réponse ne change plus. Choisis maintenant ton niveau de certitude.</p></section>
    <section class="know-confidence-grid">${Object.values(V014_KNOW_CONFIDENCE).map(level => `<button class="know-confidence-card ${level.id}" data-know-confidence="${level.id}"><span>${level.icon}</span><strong>${escapeHtml(level.label)}</strong><small>${escapeHtml(level.helper)}</small></button>`).join("")}</section>
    <button id="changeKnowGuess" class="secondary-btn full">Changer ma réponse</button>`;
  document.querySelectorAll("[data-know-confidence]").forEach(button => button.addEventListener("click", () => {
    game.votes[pending.playerId] = { answer: pending.answer, confidence: button.dataset.knowConfidence };
    game.pendingKnowGuess = null;
    game.currentVoterIndex += 1;
    renderMegaKnowGuesserGate();
  }));
  document.querySelector("#changeKnowGuess").addEventListener("click", () => {
    game.pendingKnowGuess = null;
    renderMegaKnowGuess();
  });
}

function renderMegaKnowReveal() {
  const game = state.megaGame;
  const item = game.items[game.currentIndex];
  const target = v014CurrentTarget(game);
  const guessers = v014Guessers(game);
  const correctIds = [];
  const deltas = {};
  guessers.forEach(player => {
    const vote = v014KnowVoteData(game.votes[player.id]);
    const correct = vote.answer === Number(game.targetAnswer);
    if (correct) correctIds.push(player.id);
    const delta = v014KnowScoreDelta(vote, correct, game.confidenceMode !== false);
    deltas[player.id] = delta;
    game.scores[player.id] = Number(game.scores[player.id] || 0) + delta;
  });
  const targetBonus = correctIds.length >= Math.ceil(guessers.length / 2) ? 1 : 0;
  if (targetBonus) game.scores[target.id] = Number(game.scores[target.id] || 0) + 1;
  game.rounds.push({ itemId: item.id, pack: item.pack || "details", targetId: target.id, targetAnswer: game.targetAnswer, votes: { ...game.votes }, deltas, targetBonus });
  title.textContent = "Réponse révélée";
  screen.innerHTML = `
    ${v014Progress(game, "Question")}
    <section class="reveal-stage reveal-v07"><span class="game-cover-icon">💭</span><h2>${escapeHtml(target.name)} choisit : ${escapeHtml(item.options[game.targetAnswer])}</h2><p>${correctIds.length}/${guessers.length} personne${correctIds.length > 1 ? "s" : ""} avait vu juste.${targetBonus ? ` ${escapeHtml(target.name)} gagne aussi +1.` : ""}</p></section>
    <section class="answer-chip-wall know-answer-wall">${guessers.map(player => {
      const vote = v014KnowVoteData(game.votes[player.id]);
      const confidence = V014_KNOW_CONFIDENCE[vote.confidence] || V014_KNOW_CONFIDENCE.try;
      const delta = Number(deltas[player.id] || 0);
      return `<span class="${correctIds.includes(player.id) ? "correct" : "wrong"}">${escapeHtml(avatarById(player.avatarId).name)} · ${escapeHtml(player.name)} · ${escapeHtml(item.options[vote.answer] || "-")} <b>${game.confidenceMode !== false ? confidence.icon : ""} ${v014KnowDeltaLabel(delta)}</b></span>`;
    }).join("")}</section>
    <button id="nextKnow" class="primary-btn full">${game.currentIndex + 1 >= game.items.length ? "Voir le classement" : "Personne suivante"}</button>`;
  document.querySelector("#nextKnow").addEventListener("click", () => {
    game.currentIndex += 1;
    game.currentVoterIndex = 0;
    game.votes = {};
    game.targetAnswer = null;
    game.pendingKnowGuess = null;
    renderMegaCurrent();
  });
}

function renderMegaRankingTargetGate() {
  const game = state.megaGame;
  if (game.targetRanking.length) return renderMegaRankingGuesserGate();
  const target = v014CurrentTarget(game);
  const item = game.items[game.currentIndex];
  title.textContent = "Classement secret";
  setBackVisible(false);
  screen.innerHTML = `
    ${v014Progress(game, "Classement")}
    <section class="handoff-stage handoff-v07"><div class="giant-avatar">${avatarById(target.avatarId).emoji}</div><span class="category-chip">${escapeHtml(target.name).toUpperCase()}</span><h2>${escapeHtml(item.title)}</h2><p>Classe les cinq propositions en privé, de ta préférée à la dernière.</p><button id="openRankingTarget" class="primary-btn">Créer mon classement</button></section>`;
  document.querySelector("#openRankingTarget").addEventListener("click", renderMegaRankingBuilder);
}

function renderMegaRankingBuilder() {
  const game = state.megaGame;
  const item = game.items[game.currentIndex];
  const selected = game.rankingDraft || [];
  const available = item.items.map((_, index) => index).filter(index => !selected.includes(index));
  title.textContent = "Ton classement privé";
  screen.innerHTML = `
    ${v014Progress(game, "Classement")}
    <section class="card"><h2 class="section-title">${escapeHtml(item.title)}</h2><p class="helper">Clique dans l’ordre : numéro 1, puis 2, puis 3…</p></section>
    <section class="secret-ranking-builder">
      <div class="ranking-picked">${selected.map((index, position) => `<div><span>${position + 1}</span><strong>${escapeHtml(item.items[index])}</strong></div>`).join("") || `<div class="notice">Ton numéro 1 n’est pas encore choisi.</div>`}</div>
      <div class="ranking-available">${available.map(index => `<button class="secondary-btn" data-rank-pick="${index}">${escapeHtml(item.items[index])}</button>`).join("")}</div>
    </section>
    <div class="toolbar"><button id="undoRanking" class="secondary-btn" ${selected.length ? "" : "disabled"}>↶ Annuler le dernier</button><button id="confirmRanking" class="primary-btn" ${selected.length === item.items.length ? "" : "disabled"}>Valider</button></div>`;
  document.querySelectorAll("[data-rank-pick]").forEach(button => button.addEventListener("click", () => { game.rankingDraft.push(Number(button.dataset.rankPick)); renderMegaRankingBuilder(); }));
  document.querySelector("#undoRanking").addEventListener("click", () => { game.rankingDraft.pop(); renderMegaRankingBuilder(); });
  document.querySelector("#confirmRanking").addEventListener("click", () => {
    game.targetRanking = [...game.rankingDraft];
    game.currentVoterIndex = 0;
    game.votes = {};
    renderMegaRankingGuesserGate();
  });
}

function renderMegaRankingGuesserGate() {
  const game = state.megaGame;
  const guessers = v014Guessers(game);
  if (game.currentVoterIndex >= guessers.length) return renderMegaRankingReveal();
  const guesser = guessers[game.currentVoterIndex];
  const target = v014CurrentTarget(game);
  title.textContent = "Devine le numéro un";
  screen.innerHTML = `
    ${v014Progress(game, "Classement")}
    <section class="handoff-stage handoff-v07"><div class="giant-avatar">${avatarById(guesser.avatarId).emoji}</div><span class="category-chip">${escapeHtml(guesser.name).toUpperCase()}</span><h2>Quel est le choix numéro 1 de ${escapeHtml(target.name)} ?</h2><p>Le reste du classement sera révélé ensuite.</p><button id="openRankingGuess" class="primary-btn">Faire mon pronostic</button></section>`;
  document.querySelector("#openRankingGuess").addEventListener("click", renderMegaRankingGuess);
}

function renderMegaRankingGuess() {
  const game = state.megaGame;
  const item = game.items[game.currentIndex];
  screen.innerHTML = `
    ${v014Progress(game, "Classement")}
    <section class="card"><h2 class="section-title">${escapeHtml(item.title)}</h2><p class="helper">Choisis ce que tu penses être son numéro 1.</p></section>
    <section class="mega-option-grid">${item.items.map((option, index) => `<button class="mega-option-btn" data-ranking-guess="${index}"><span>${index + 1}</span><strong>${escapeHtml(option)}</strong></button>`).join("")}</section>`;
  document.querySelectorAll("[data-ranking-guess]").forEach(button => button.addEventListener("click", () => {
    const guesser = v014Guessers(game)[game.currentVoterIndex];
    game.votes[guesser.id] = Number(button.dataset.rankingGuess);
    game.currentVoterIndex += 1;
    renderMegaRankingGuesserGate();
  }));
}

function renderMegaRankingReveal() {
  const game = state.megaGame;
  const item = game.items[game.currentIndex];
  const target = v014CurrentTarget(game);
  const top = game.targetRanking[0];
  const correctIds = Object.entries(game.votes).filter(([, value]) => Number(value) === Number(top)).map(([id]) => id);
  correctIds.forEach(id => game.scores[id] = Number(game.scores[id] || 0) + 2);
  if (correctIds.length) game.scores[target.id] = Number(game.scores[target.id] || 0) + 1;
  game.rounds.push({ itemId: item.id, targetId: target.id, ranking: [...game.targetRanking], votes: { ...game.votes } });
  title.textContent = "Classement révélé";
  screen.innerHTML = `
    ${v014Progress(game, "Classement")}
    <section class="winner-stage winner-stage-v07"><div class="winner-crown">🏅</div><h2>Le classement de ${escapeHtml(target.name)}</h2><p>${correctIds.length} personne${correctIds.length > 1 ? "s" : ""} avait deviné le numéro un.</p></section>
    <section class="revealed-ranking">${game.targetRanking.map((index, position) => `<div class="ranking-row"><span class="ranking-position">${position + 1}</span><strong>${escapeHtml(item.items[index])}</strong>${position === 0 ? `<span class="badge green">favori</span>` : ""}</div>`).join("")}</section>
    <button id="nextRanking" class="primary-btn full">${game.currentIndex + 1 >= game.items.length ? "Voir le classement" : "Classement suivant"}</button>`;
  document.querySelector("#nextRanking").addEventListener("click", () => {
    game.currentIndex += 1;
    game.currentVoterIndex = 0;
    game.votes = {};
    game.targetRanking = [];
    game.rankingDraft = [];
    renderMegaCurrent();
  });
}

function renderMegaBombRound() {
  const game = state.megaGame;
  if (!game.bombEndsAt) game.bombEndsAt = Date.now() + game.durationSeconds * 1000;
  const item = game.items[game.currentIndex];
  const player = state.players[game.bombPlayerIndex % state.players.length];
  title.textContent = "La Bombe";
  setBackVisible(false);
  screen.innerHTML = `
    ${v014Progress(game, "Bombe")}
    <section class="bomb-stage">
      <div class="bomb-icon">💣</div>
      <div class="bomb-countdown"><strong id="v014BombCountdown">${Math.max(0, Math.ceil((game.bombEndsAt - Date.now()) / 1000))}</strong><span>secondes</span></div>
      <span class="category-chip">${avatarById(player.avatarId).emoji} ${escapeHtml(player.name).toUpperCase()}</span>
      <h2>${escapeHtml(item.category)}</h2>
      <p>Donne une réponse différente, puis passe immédiatement le téléphone.</p>
      <div class="progress-track"><div id="v014TimerFill" class="progress-fill" style="width:100%"></div></div>
    </section>
    <section class="decision-grid"><button id="passBomb" class="primary-btn">Répondu, je passe →</button><button id="explodeBomb" class="danger-btn">💥 La bombe explose</button></section>`;
  document.querySelector("#passBomb").addEventListener("click", () => {
    game.bombPlayerIndex = (game.bombPlayerIndex + 1) % state.players.length;
    renderMegaBombRound();
  });
  document.querySelector("#explodeBomb").addEventListener("click", () => finishMegaBomb(player.id));
  startV014Timer(game.bombEndsAt, "#v014BombCountdown", () => finishMegaBomb(state.players[game.bombPlayerIndex % state.players.length].id), game.durationSeconds);
}

function finishMegaBomb(loserId) {
  const game = state.megaGame;
  if (!game || game.currentResult) return;
  clearV014Timer();
  const loser = state.players.find(player => player.id === loserId);
  state.players.filter(player => player.id !== loserId).forEach(player => game.scores[player.id] = Number(game.scores[player.id] || 0) + 1);
  game.currentResult = { loserId, itemId: game.items[game.currentIndex]?.id };
  game.rounds.push(game.currentResult);
  title.textContent = "BOOM !";
  screen.innerHTML = `
    ${v014Progress(game, "Bombe")}
    <section class="winner-stage bomb-result-stage"><div class="winner-crown">💥</div><div class="giant-avatar">${avatarById(loser?.avatarId).emoji}</div><h2>La bombe explose chez ${escapeHtml(loser?.name || "un joueur")}</h2><p>Tout le monde sauf cette personne marque un point.</p></section>
    ${state.alcohol ? `<div class="alcohol-callout">🍻 Petit toast facultatif, avec la boisson de son choix, eau comprise.</div>` : ""}
    <button id="nextBomb" class="primary-btn full">${game.currentIndex + 1 >= game.items.length ? "Voir le classement" : "Nouvelle bombe"}</button>`;
  document.querySelector("#nextBomb").addEventListener("click", () => {
    game.currentIndex += 1;
    game.currentResult = null;
    game.bombEndsAt = null;
    game.bombPlayerIndex = Math.floor(Math.random() * Math.max(1, state.players.length));
    renderMegaCurrent();
  });
}

function renderMegaFinal() {
  const game = state.megaGame;
  clearV014Timer();
  const ranking = [...state.players].sort((a, b) => Number(game.scores[b.id] || 0) - Number(game.scores[a.id] || 0));
  const best = Number(game.scores[ranking[0]?.id] || 0);
  const hasWinner = game.engine === "know" ? ranking.length > 0 : best > 0;
  const winners = ranking.filter(player => Number(game.scores[player.id] || 0) === best && hasWinner);
  title.textContent = "Classement final";
  setBackVisible(false);
  screen.innerHTML = `
    <section class="winner-stage winner-stage-v07 mega-final-stage"><div class="winner-crown">${game.config.icon}🏆</div><h2>${winners.length ? winners.map(player => escapeHtml(player.name)).join(" et ") : "Partie terminée"}</h2><p>${winners.length ? `${winners.length > 1 ? "terminent" : "termine"} en tête de ${escapeHtml(game.gameName)}.` : "Le groupe a traversé toutes les manches."}</p></section>
    <section class="final-ranking">${ranking.map((player, index) => `<div class="ranking-row"><span class="ranking-position">${index + 1}</span><span class="result-avatar">${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong><span>${Number(game.scores[player.id] || 0)} pts</span></div>`).join("")}</section>
    <div class="toolbar"><button id="replayMega" class="secondary-btn">Rejouer</button><button id="otherMega" class="primary-btn">Autre jeu</button></div>`;
  document.querySelector("#replayMega").addEventListener("click", () => { const name = game.gameName; const replay = { roundCount: game.roundCount, durationSeconds: game.durationSeconds, selectedPacks: game.selectedPacks, selectedDifficulties: game.selectedDifficulties, confidenceMode: game.confidenceMode, daringThemes: game.daringThemes, daringIntensities: game.daringIntensities, daringAnswerMode: game.daringAnswerMode, daringIncludeCustom: game.daringIncludeCustom }; resetMegaGame(name, replay); renderMegaSetup(); });
  document.querySelector("#otherMega").addEventListener("click", () => { state.megaGame = null; renderPlayChoice(); });
}

function launchV014Game(gameName) {
  if (!V014_GAME_CONFIGS[gameName]) return false;
  if (V014_GAME_CONFIGS[gameName].adultOnly && !state.adult) {
    alert("Active le contenu adulte dans les paramètres pour ouvrir ce jeu.");
    return true;
  }
  pushScreen("games");
  resetMegaGame(gameName);
  renderMegaSetup();
  return true;
}

renderHome = function () {
  clearV09Timer();
  clearV014Timer();
  state.history = [];
  title.textContent = "On joue comment ?";
  setBackVisible(false);

  document.body.classList.add("ak-home-screen");
  backBtn.disabled = true;
  backBtn.textContent = "";
  backBtn.setAttribute("aria-hidden", "true");
  backBtn.removeAttribute("aria-label");

  screen.innerHTML = `
    <section class="home-launch" aria-label="Choisir un mode de jeu">
      <div class="home-launch-intro">
        <p>Choisis un mode et lance la soirée <span aria-hidden="true">✦</span></p>
      </div>

      <div class="home-mode-list">
        <button class="home-mode-card home-mode-single" data-home-action="single">
          <span class="home-mode-icon" aria-hidden="true">
            <svg viewBox="0 0 48 48" focusable="false">
              <rect x="14" y="6" width="20" height="36" rx="5"></rect>
              <path d="M21 10h6"></path>
              <path d="M22 37h4"></path>
              <path class="spark" d="M35 9l4-4m-1 9h5m-7 3l3 3"></path>
            </svg>
          </span>
          <span class="home-mode-copy">
            <strong>Un téléphone</strong>
            <span>Passez-vous le téléphone.</span>
          </span>
          <span class="home-mode-arrow" aria-hidden="true">›</span>
        </button>

        <button class="home-mode-card home-mode-create" data-home-action="create">
          <span class="home-mode-icon" aria-hidden="true">
            <svg viewBox="0 0 48 48" focusable="false">
              <circle cx="24" cy="17" r="6"></circle>
              <circle cx="12" cy="22" r="4"></circle>
              <circle cx="36" cy="22" r="4"></circle>
              <path d="M14 39c0-7 4-11 10-11s10 4 10 11"></path>
              <path d="M4 39c0-5 3-9 8-9 2 0 4 .7 5 2"></path>
              <path d="M44 39c0-5-3-9-8-9-2 0-4 .7-5 2"></path>
            </svg>
          </span>
          <span class="home-mode-copy">
            <strong>Créer une room</strong>
            <span>Chacun joue sur son téléphone.</span>
          </span>
          <span class="home-mode-arrow" aria-hidden="true">›</span>
        </button>

        <button class="home-mode-card home-mode-join" data-home-action="join">
          <span class="home-mode-icon" aria-hidden="true">
            <svg viewBox="0 0 48 48" focusable="false">
              <rect x="5" y="12" width="38" height="24" rx="7"></rect>
              <path d="M13 20h5m4 0h5m4 0h4M13 28h4m5 0h5m4 0h4"></path>
            </svg>
          </span>
          <span class="home-mode-copy">
            <strong>Rejoindre</strong>
            <span>J’ai déjà un code.</span>
          </span>
          <span class="home-mode-arrow" aria-hidden="true">›</span>
        </button>
      </div>
    </section>`;

  document.querySelectorAll("[data-home-action]").forEach(button => button.addEventListener("click", () => {
    const action = button.dataset.homeAction;
    if (action === "single") { state.mode = "single"; pushScreen("home"); renderSetup(); }
    else if (action === "create") { state.mode = "multi-host"; pushScreen("home"); renderSetup(); }
    else { pushScreen("home"); renderJoin(); }
  }));
};

renderGames = function () {
  clearV09Timer();
  clearV014Timer();
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
      return `<button class="game-card game-card-v07 ${disabled ? "disabled" : ""} ${isNew ? "game-card-new game-card-mega" : ""}" ${disabled ? "disabled" : ""} data-game="${escapeHtml(game)}"><span class="game-card-icon">${icon}</span><span class="game-card-copy"><strong>${escapeHtml(game)} ${isNew ? `<span class="new-ribbon">MEGA PACK</span>` : ""}</strong><span class="helper">${disabled ? "Audio à intégrer séparément" : ready ? "Prêt à lancer" : "À intégrer"}</span><span class="game-meta">${ready ? `<span class="badge green">✓ disponible</span>` : `<span class="badge">bientôt</span>`}${state.alcohol && ready ? `<span class="badge green">🍻 option alcool</span>` : ""}${V014_GAME_CONFIGS[game]?.adultOnly || game.includes("+18") ? `<span class="badge orange">🔞 adulte</span>` : ""}</span></span><span class="game-card-chevron">›</span></button>`;
    }).join("")}</section>`;

  document.querySelectorAll("[data-game]:not([disabled])").forEach(button => button.addEventListener("click", () => {
    const game = button.dataset.game;
    if (launchV014Game(game)) return;
    if (game === "Qui de nous ?") { pushScreen("games"); resetWhoUsState(); renderWhoUsSetup(); return; }
    if (game === "Le premier qui rit a perdu") { pushScreen("games"); resetLaughDuelState(); renderLaughDuelSetup(); return; }
    if (game === "Qui ment le mieux ?") { if (state.players.length < 3) return alert("« Qui ment le mieux ? » nécessite au moins 3 joueurs."); pushScreen("games"); resetBestLiarState(); renderBestLiarSetup(); return; }
    if (game === "Action ou Vérité" || game === "Action ou Vérité +18") { pushScreen("games"); resetActionTruthState(game.includes("+18")); renderActionTruthSetup(); return; }
    if (game === "Je n’ai jamais" || game === "Je n’ai jamais +18") { pushScreen("games"); resetAmbiancePollState("never", game.includes("+18")); renderAmbiancePollSetup(); return; }
    if (game === "Tu préfères" || game === "Tu préfères +18") { pushScreen("games"); resetAmbiancePollState("would", game.includes("+18")); renderAmbiancePollSetup(); return; }
    if (game === "Même cerveau") { pushScreen("games"); resetSameBrainState(); renderSameBrainSetup(); return; }
    if (game === "Minorité") { pushScreen("games"); resetMinorityState(); renderMinoritySetup(); return; }
    if (game === "Qui a répondu ça ?") { if (state.players.length < 3) return alert("« Qui a répondu ça ? » nécessite au moins 3 joueurs."); pushScreen("games"); resetWhoAnsweredState(); renderWhoAnsweredSetup(); return; }
    if (game === "L’Imposteur sait presque tout") { if (state.players.length < 3) return alert("Ce jeu nécessite au moins 3 joueurs."); pushScreen("games"); resetAlmostImpostorState(); renderAlmostImpostorSetup(); return; }
    if (game === "Le Faux Expert") { if (state.players.length < 3) return alert("Ce jeu nécessite au moins 3 joueurs."); pushScreen("games"); resetFakeExpertState(); renderFakeExpertSetup(); return; }
    if (game === "Qui suis-je ?") { pushScreen("games"); resetWhoAmIState(); renderWhoAmISetup(); return; }
    renderGamePlaceholder(game);
  }));
};

renderHome();


/* =========================================================
   AK'GAMES V1.0 — AUDIT PASSE 5
   Navigation sûre pendant les parties
   ========================================================= */

settingsBtn.addEventListener("click", event => {
  if (state.roomCode) {
    event.preventDefault();
    event.stopImmediatePropagation();
    alert("Quitte d’abord le salon depuis le bouton prévu avant de modifier ou réinitialiser la session.");
    return;
  }

  if (!isSoloGameRunning()) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  alert("Termine la manche ou utilise le bouton de sortie du jeu avant d’ouvrir les paramètres.");
}, true);


/* =========================================================
   AK'GAMES V1.0 — AUDIT PASSE 8
   Contenu, règles, équilibrage et lisibilité du catalogue
   ========================================================= */

const AK_AUDIT8_GAME_META = {
  "Qui de nous ?": { minPlayers: 2, time: "10–15 min", goal: "Votez pour la personne qui correspond le mieux à chaque situation." },
  "Le premier qui rit a perdu": { minPlayers: 2, time: "5–10 min", goal: "Fais rire ton adversaire tout en gardant ton propre sérieux." },
  "Qui ment le mieux ?": { minPlayers: 3, time: "15 min", goal: "Invente la réponse la plus crédible et récolte les votes du groupe." },
  "Action ou Vérité": { minPlayers: 2, time: "10–20 min", goal: "À tour de rôle, relève une action ou réponds à une vérité. Passer reste toujours possible." },
  "Je n’ai jamais": { minPlayers: 2, time: "10 min", goal: "Réponds en secret, puis découvrez les expériences communes du groupe." },
  "Tu préfères": { minPlayers: 2, time: "10 min", goal: "Choisis entre deux options et compare ton camp à celui du groupe." },
  "Même cerveau": { minPlayers: 2, time: "10 min", goal: "Écris la même réponse que les autres sans pouvoir vous concerter." },
  "Minorité": { minPlayers: 3, time: "10 min", goal: "Choisis en secret. Le plus petit camp marque, sauf en cas d’égalité complète." },
  "Qui a répondu ça ?": { minPlayers: 3, time: "15 min", goal: "Retrouve l’auteur de chaque réponse anonyme et brouille les pistes avec la tienne." },
  "L’Imposteur sait presque tout": { minPlayers: 3, time: "15 min", goal: "Démasque la personne qui ne connaît que l’indice, avant qu’elle devine le mot." },
  "Le Faux Expert": { minPlayers: 3, time: "15 min", goal: "Écoute la conférence, puis décide si l’orateur maîtrise le sujet ou improvise." },
  "Qui suis-je ?": { minPlayers: 2, time: "10–15 min", goal: "Pose des questions fermées pour retrouver l’identité visible sur les autres écrans." },
  "Roulette de défis": { minPlayers: 2, time: "10 min", goal: "Relève les défis tirés à tour de rôle, sans pénalité si tu préfères passer." },
  "Mime": { minPlayers: 2, time: "10 min", goal: "Fais deviner le sujet sans parler avant la fin du chronomètre." },
  "Imitation": { minPlayers: 2, time: "10 min", goal: "Imite la voix ou la situation afin que le groupe retrouve le sujet." },
  "La Bombe": { minPlayers: 2, time: "5 min", goal: "Donne une réponse différente, puis passe vite le téléphone avant l’explosion." },
  "Culture générale": { minPlayers: 2, time: "10 min", goal: "Réponds en secret et marque un point par bonne réponse." },
  "Cinéma": { minPlayers: 2, time: "10 min", goal: "Réponds en secret aux questions sur les films et personnages." },
  "Musique": { minPlayers: 2, time: "10 min", goal: "Réponds en secret aux questions de culture musicale." },
  "Jeux vidéo": { minPlayers: 2, time: "10 min", goal: "Réponds en secret aux questions sur les jeux et leurs univers." },
  "Devine le logo": { minPlayers: 2, time: "10 min", goal: "Identifie la marque à partir de la description de son logo." },
  "Plaide ta cause": { minPlayers: 2, time: "10 min", goal: "Défends une opinion improbable avant la fin du chronomètre." },
  "Fake ou Réel ?": { minPlayers: 2, time: "10 min", goal: "Décide si chaque affirmation est exacte ou trompeuse." },
  "Alerte Rouge": { minPlayers: 2, time: "10 min", goal: "Votez pour la décision du groupe et découvrez les conséquences du scénario." },
  "Tu me connais ou pas ?": { minPlayers: 2, time: "15 min", goal: "Choisis un pack, prédis la réponse et mise sur ton niveau de certitude." },
  "Le Classement secret": { minPlayers: 2, time: "15 min", goal: "Devine quelle option la personne ciblée a placée en tête." },
  "Devinettes": { minPlayers: 2, time: "10 min", goal: "Résous les énigmes avant les autres et marque un point par bonne réponse." },
  "Questions osées": { minPlayers: 2, time: "10 min", goal: "Réponds seulement si tu en as envie. Aucun point n’est attribué." },
  "Jeux à boire": { minPlayers: 2, time: "15 min", goal: "Suivez des règles légères avec la boisson de votre choix. Aucun point n’est attribué." },
  "Défis adultes": { minPlayers: 2, time: "10 min", goal: "Relève des défis de flirt et d’impro, avec droit de passer sans justification." }
};

function akAudit8BaseGameName(gameName) {
  return String(gameName || "").replace(/ \+18$/, "");
}

function akAudit8GameMeta(gameName) {
  return AK_AUDIT8_GAME_META[gameName] || AK_AUDIT8_GAME_META[akAudit8BaseGameName(gameName)] || {
    minPlayers: 2,
    time: "10 min",
    goal: "Jouez les manches jusqu’à l’écran de résultat."
  };
}

function akAudit8GameAvailability(gameName) {
  if (gameName === "Blind Test") return { locked: true, reason: "Audio à intégrer séparément" };
  const meta = akAudit8GameMeta(gameName);
  if (state.players.length < Number(meta.minPlayers || 2)) {
    return { locked: true, reason: `Nécessite ${meta.minPlayers} joueurs` };
  }
  if ((V014_GAME_CONFIGS[gameName]?.adultOnly || gameName.includes("+18")) && !state.adult) {
    return { locked: true, reason: "Active le contenu adulte" };
  }
  return { locked: false, reason: "" };
}

function akAudit8CatalogBadges(gameName, multiplayer = false) {
  const meta = akAudit8GameMeta(gameName);
  const config = V014_GAME_CONFIGS[gameName];
  return [
    `<span class="badge">👥 ${meta.minPlayers}+</span>`,
    `<span class="badge">⏱ ${escapeHtml(meta.time)}</span>`,
    multiplayer ? `<span class="badge green">📲 synchronisé</span>` : `<span class="badge green">✓ disponible</span>`,
    config?.drinkingGame ? `<span class="badge orange">🥤 boisson au choix</span>` : "",
    config?.adultOnly || gameName.includes("+18") ? `<span class="badge orange">🔞 adulte</span>` : ""
  ].join("");
}

function akAudit8AppendGameGuide(gameName) {
  if (!screen || screen.querySelector(".audit8-game-guide")) return;
  const setup = screen.querySelector(".setup-card-v07, .setup-card, .card");
  if (!setup) return;
  const meta = akAudit8GameMeta(gameName);
  const guide = document.createElement("section");
  guide.className = "audit8-game-guide";
  guide.setAttribute("aria-label", "Règle rapide du jeu");
  guide.innerHTML = `
    <div><span>👥</span><strong>${meta.minPlayers}+ joueurs</strong></div>
    <div><span>⏱</span><strong>${escapeHtml(meta.time)}</strong></div>
    <p><span>🎯</span>${escapeHtml(meta.goal)}</p>`;
  setup.insertAdjacentElement("afterend", guide);
}

function akAudit8PrepareQuizItem(item) {
  if (!item || !Array.isArray(item.options) || !Number.isInteger(item.answer) || item.options.length < 3) {
    return item ? { ...item } : item;
  }
  const pairs = item.options.map((option, originalIndex) => ({ option, originalIndex }));
  const shuffled = shuffleArray(pairs);
  return {
    ...item,
    options: shuffled.map(entry => entry.option),
    answer: shuffled.findIndex(entry => entry.originalIndex === item.answer)
  };
}

function akAudit8BalancedActionTruth(pool, count, memoryKey, mode = "mix") {
  const safeCount = Math.max(0, Math.min(Number(count || 0), pool.length));
  if (mode !== "mix") return selectFreshItems(pool, safeCount, memoryKey);
  const actions = pool.filter(item => item.type === "action");
  const truths = pool.filter(item => item.type === "truth");
  const actionCount = Math.min(actions.length, Math.floor(safeCount / 2));
  const truthCount = Math.min(truths.length, safeCount - actionCount);
  const selectedActions = selectFreshItems(actions, actionCount, `${memoryKey}:action`);
  const selectedTruths = selectFreshItems(truths, truthCount, `${memoryKey}:truth`);
  const remaining = safeCount - selectedActions.length - selectedTruths.length;
  const used = new Set([...selectedActions, ...selectedTruths].map(item => item.id));
  const extras = remaining > 0
    ? selectFreshItems(pool.filter(item => !used.has(item.id)), remaining, `${memoryKey}:extra`)
    : [];
  const firstAction = Math.random() < 0.5;
  const result = [];
  const left = [...selectedActions];
  const right = [...selectedTruths];
  while (left.length || right.length) {
    const first = firstAction ? left : right;
    const second = firstAction ? right : left;
    if (first.length) result.push(first.shift());
    if (second.length) result.push(second.shift());
  }
  return [...result, ...extras].slice(0, safeCount);
}

const akAudit8StartActionTruthGame = startActionTruthGame;
startActionTruthGame = async function () {
  if (state.mode !== "single") return akAudit8StartActionTruthGame();
  const game = state.actionTruth;
  screen.innerHTML = `<div class="notice">Mélange équilibré des actions et vérités…</div>`;
  try {
    let pool;
    if (game.forceAdult) {
      pool = await loadJsonFile("data/action-verite-adulte.json", "Impossible de charger les cartes adultes.");
    } else {
      pool = await loadJsonFile("data/action-verite.json", "Impossible de charger les cartes.");
      if (state.adult && game.includeAdult) {
        pool = pool.concat(await loadJsonFile("data/action-verite-adulte.json", "Impossible de charger les cartes adultes."));
      }
    }
    if (game.mode !== "mix") pool = pool.filter(item => item.type === game.mode);
    game.prompts = akAudit8BalancedActionTruth(pool, Math.min(game.roundCount, pool.length), `solo:action-truth:${game.mode}${game.forceAdult ? ":adult" : ""}`, game.mode);
    game.currentIndex = 0;
    game.scores = Object.fromEntries(state.players.map(player => [player.id, 0]));
    game.results = [];
    renderActionTruthRound();
  } catch (error) {
    alert(error.message || "Impossible de lancer la partie.");
    renderActionTruthSetup();
  }
};

const akAudit8StartMegaGame = startMegaGame;
startMegaGame = async function () {
  if (state.mode !== "single") return akAudit8StartMegaGame();
  const game = state.megaGame;
  if (!game) return;
  screen.innerHTML = `<div class="notice">Préparation de ${escapeHtml(game.gameName)}…</div>`;
  try {
    const rawPool = await loadJsonFile(game.config.data, `Impossible de charger ${game.gameName}.`);
    const pool = v014FilterKnowPool(rawPool, game);
    let items = v014SelectKnowItems(pool, Math.min(game.roundCount, pool.length), `solo:mega:${game.gameName}:${v014NormalizeKnowPacks(game.selectedPacks).join("-")}`, game);
    if (game.engine === "quiz") items = items.map(akAudit8PrepareQuizItem);
    game.items = items;
    game.currentIndex = 0;
    game.currentPlayerIndex = 0;
    game.currentVoterIndex = 0;
    game.votes = {};
    game.scores = v014ScoreMap();
    game.rounds = [];
    game.revealed = false;
    game.targetAnswer = null;
    game.targetRanking = [];
    game.rankingDraft = [];
    game.bombEndsAt = null;
    game.bombPlayerIndex = Math.floor(Math.random() * Math.max(1, state.players.length));
    game.currentResult = null;
    game.pendingKnowGuess = null;
    renderMegaCurrent();
  } catch (error) {
    console.error(error);
    alert(error.message || "Impossible de lancer le jeu.");
    renderMegaSetup();
  }
};

finishMegaTurn = function (success) {
  const game = state.megaGame;
  if (!game) return;
  clearV014Timer();
  const player = state.players[game.currentIndex % state.players.length];
  const scoreless = Boolean(game.config.scoreless || game.config.questionMode || game.config.drinkingGame);
  if (success && !scoreless) game.scores[player.id] = Number(game.scores[player.id] || 0) + 1;
  game.rounds.push({ itemId: game.items[game.currentIndex]?.id, playerId: player.id, success });
  game.currentIndex += 1;
  game.revealed = false;
  renderMegaCurrent();
};

renderMegaFinal = function () {
  const game = state.megaGame;
  clearV014Timer();
  const scoreless = Boolean(game.config.scoreless || game.config.questionMode || game.config.drinkingGame);
  title.textContent = scoreless ? "Partie terminée" : "Classement final";
  setBackVisible(false);

  if (scoreless) {
    const completed = game.rounds.length;
    const participated = game.rounds.filter(round => round.success).length;
    screen.innerHTML = `
      <section class="winner-stage winner-stage-v07 mega-final-stage scoreless-final"><div class="winner-crown">${game.config.icon}✨</div><h2>Partie terminée</h2><p>${completed} carte${completed > 1 ? "s" : ""} parcourue${completed > 1 ? "s" : ""}, dont ${participated} validée${participated > 1 ? "s" : ""}. Ici, aucune réponse intime et aucune boisson ne rapporte de point.</p></section>
      <div class="notice">Le droit de passer fait partie des règles. Le récapitulatif ne désigne aucun gagnant.</div>
      <div class="toolbar"><button id="replayMega" class="secondary-btn">Rejouer</button><button id="otherMega" class="primary-btn">Autre jeu</button></div>`;
  } else {
    const ranking = [...state.players].sort((a, b) => Number(game.scores[b.id] || 0) - Number(game.scores[a.id] || 0));
    const best = Number(game.scores[ranking[0]?.id] || 0);
    const hasWinner = game.engine === "know" ? ranking.length > 0 : best > 0;
    const winners = ranking.filter(player => Number(game.scores[player.id] || 0) === best && hasWinner);
    screen.innerHTML = `
      <section class="winner-stage winner-stage-v07 mega-final-stage"><div class="winner-crown">${game.config.icon}🏆</div><h2>${winners.length ? winners.map(player => escapeHtml(player.name)).join(" et ") : "Partie terminée"}</h2><p>${winners.length ? `${winners.length > 1 ? "terminent" : "termine"} en tête de ${escapeHtml(game.gameName)}.` : "Le groupe a traversé toutes les manches."}</p></section>
      <section class="final-ranking">${ranking.map((player, index) => `<div class="ranking-row"><span class="ranking-position">${index + 1}</span><span class="result-avatar">${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong><span>${Number(game.scores[player.id] || 0)} pts</span></div>`).join("")}</section>
      <div class="toolbar"><button id="replayMega" class="secondary-btn">Rejouer</button><button id="otherMega" class="primary-btn">Autre jeu</button></div>`;
  }

  document.querySelector("#replayMega")?.addEventListener("click", () => {
    const name = game.gameName;
    const replay = { roundCount: game.roundCount, durationSeconds: game.durationSeconds, selectedPacks: game.selectedPacks, selectedDifficulties: game.selectedDifficulties, confidenceMode: game.confidenceMode };
    resetMegaGame(name, replay);
    renderMegaSetup();
  });
  document.querySelector("#otherMega")?.addEventListener("click", () => {
    state.megaGame = null;
    renderPlayChoice();
  });
};

renderGames = function () {
  clearV09Timer();
  clearV014Timer();
  const category = categories.find(item => item.id === state.currentCategory);
  if (!category) return renderCategories();
  title.textContent = category.name;
  setBackVisible(true);
  screen.innerHTML = `
    <section class="catalog-intro catalog-intro-v014"><span>${category.emoji}</span><div><small>CATÉGORIE</small><strong>${escapeHtml(category.name)}</strong><p>${escapeHtml(category.description)}</p></div><b>${category.games.filter(game => V014_READY_GAMES.has(game)).length} jeux</b></section>
    <section class="game-list game-list-v07">${category.games.map(game => {
      const ready = V014_READY_GAMES.has(game);
      const isNew = V014_NEW_GAMES.has(game);
      const icon = V014_GAME_ICONS[game] || "🎲";
      const availability = ready ? akAudit8GameAvailability(game) : { locked: true, reason: "À intégrer" };
      const disabled = availability.locked;
      return `<button class="game-card game-card-v07 ${disabled ? "disabled" : ""} ${isNew ? "game-card-new game-card-mega" : ""}" ${disabled ? "disabled" : ""} data-game="${escapeHtml(game)}"><span class="game-card-icon">${icon}</span><span class="game-card-copy"><strong>${escapeHtml(game)}</strong><span class="helper">${escapeHtml(disabled ? availability.reason : akAudit8GameMeta(game).goal)}</span><span class="game-meta">${ready ? akAudit8CatalogBadges(game, false) : `<span class="badge">bientôt</span>`}</span></span><span class="game-card-chevron">›</span></button>`;
    }).join("")}</section>`;

  document.querySelectorAll("[data-game]:not([disabled])").forEach(button => button.addEventListener("click", () => {
    const game = button.dataset.game;
    const availability = akAudit8GameAvailability(game);
    if (availability.locked) return alert(availability.reason);
    if (launchV014Game(game)) return;
    if (game === "Qui de nous ?") { pushScreen("games"); resetWhoUsState(); renderWhoUsSetup(); return; }
    if (game === "Le premier qui rit a perdu") { pushScreen("games"); resetLaughDuelState(); renderLaughDuelSetup(); return; }
    if (game === "Qui ment le mieux ?") { pushScreen("games"); resetBestLiarState(); renderBestLiarSetup(); return; }
    if (game === "Action ou Vérité" || game === "Action ou Vérité +18") { pushScreen("games"); resetActionTruthState(game.includes("+18")); renderActionTruthSetup(); return; }
    if (game === "Je n’ai jamais" || game === "Je n’ai jamais +18") { pushScreen("games"); resetAmbiancePollState("never", game.includes("+18")); renderAmbiancePollSetup(); return; }
    if (game === "Tu préfères" || game === "Tu préfères +18") { pushScreen("games"); resetAmbiancePollState("would", game.includes("+18")); renderAmbiancePollSetup(); return; }
    if (game === "Même cerveau") { pushScreen("games"); resetSameBrainState(); renderSameBrainSetup(); return; }
    if (game === "Minorité") { pushScreen("games"); resetMinorityState(); renderMinoritySetup(); return; }
    if (game === "Qui a répondu ça ?") { pushScreen("games"); resetWhoAnsweredState(); renderWhoAnsweredSetup(); return; }
    if (game === "L’Imposteur sait presque tout") { pushScreen("games"); resetAlmostImpostorState(); renderAlmostImpostorSetup(); return; }
    if (game === "Le Faux Expert") { pushScreen("games"); resetFakeExpertState(); renderFakeExpertSetup(); return; }
    if (game === "Qui suis-je ?") { pushScreen("games"); resetWhoAmIState(); renderWhoAmISetup(); return; }
    renderGamePlaceholder(game);
  }));
};

function akAudit8WrapSetup(renderer, gameName) {
  return function (...args) {
    const result = renderer.apply(this, args);
    const resolvedName = typeof gameName === "function" ? gameName() : gameName;
    window.requestAnimationFrame(() => akAudit8AppendGameGuide(resolvedName));
    return result;
  };
}

renderWhoUsSetup = akAudit8WrapSetup(renderWhoUsSetup, "Qui de nous ?");
renderLaughDuelSetup = akAudit8WrapSetup(renderLaughDuelSetup, "Le premier qui rit a perdu");
renderBestLiarSetup = akAudit8WrapSetup(renderBestLiarSetup, "Qui ment le mieux ?");
renderActionTruthSetup = akAudit8WrapSetup(renderActionTruthSetup, () => state.actionTruth?.forceAdult ? "Action ou Vérité +18" : "Action ou Vérité");
renderAmbiancePollSetup = akAudit8WrapSetup(renderAmbiancePollSetup, () => state.ambiancePoll?.type === "never" ? (state.ambiancePoll?.forceAdult ? "Je n’ai jamais +18" : "Je n’ai jamais") : (state.ambiancePoll?.forceAdult ? "Tu préfères +18" : "Tu préfères"));
renderSameBrainSetup = akAudit8WrapSetup(renderSameBrainSetup, "Même cerveau");
renderMinoritySetup = akAudit8WrapSetup(renderMinoritySetup, "Minorité");
renderWhoAnsweredSetup = akAudit8WrapSetup(renderWhoAnsweredSetup, "Qui a répondu ça ?");
renderAlmostImpostorSetup = akAudit8WrapSetup(renderAlmostImpostorSetup, "L’Imposteur sait presque tout");
renderFakeExpertSetup = akAudit8WrapSetup(renderFakeExpertSetup, "Le Faux Expert");
renderWhoAmISetup = akAudit8WrapSetup(renderWhoAmISetup, "Qui suis-je ?");
renderMegaSetup = akAudit8WrapSetup(renderMegaSetup, () => state.megaGame?.gameName || "Jeu");



/* =========================================================
   AK'GAMES V1.0 — AUDIT PASSE 10
   Chemins morts, jeu aléatoire et navigation de fin de partie
   ========================================================= */

const AK_AUDIT10_RANDOM_SOLO_KEY = "akgames_recent_random_solo_v1";

function akAudit10LoadRecentRandomSolo() {
  try {
    const value = JSON.parse(localStorage.getItem(AK_AUDIT10_RANDOM_SOLO_KEY) || "[]");
    return Array.isArray(value) ? value.filter(Boolean).slice(0, 3) : [];
  } catch {
    return [];
  }
}

function akAudit10RememberRandomSolo(gameName) {
  const recent = akAudit10LoadRecentRandomSolo().filter(name => name !== gameName);
  recent.unshift(gameName);
  try {
    localStorage.setItem(AK_AUDIT10_RANDOM_SOLO_KEY, JSON.stringify(recent.slice(0, 3)));
  } catch {
    // Le tirage reste utilisable sans stockage local.
  }
}

function akAudit10CategoryForGame(gameName) {
  return categories.find(category => category.games.includes(gameName)) || null;
}

function akAudit10LaunchSoloGameByName(gameName) {
  const availability = akAudit8GameAvailability(gameName);
  if (availability.locked) throw new Error(availability.reason || "Ce jeu n’est pas disponible avec ce groupe.");

  const category = akAudit10CategoryForGame(gameName);
  if (category) state.currentCategory = category.id;

  if (launchV014Game(gameName)) return true;
  if (gameName === "Qui de nous ?") { pushScreen("games"); resetWhoUsState(); renderWhoUsSetup(); return true; }
  if (gameName === "Le premier qui rit a perdu") { pushScreen("games"); resetLaughDuelState(); renderLaughDuelSetup(); return true; }
  if (gameName === "Qui ment le mieux ?") { pushScreen("games"); resetBestLiarState(); renderBestLiarSetup(); return true; }
  if (gameName === "Action ou Vérité" || gameName === "Action ou Vérité +18") { pushScreen("games"); resetActionTruthState(gameName.includes("+18")); renderActionTruthSetup(); return true; }
  if (gameName === "Je n’ai jamais" || gameName === "Je n’ai jamais +18") { pushScreen("games"); resetAmbiancePollState("never", gameName.includes("+18")); renderAmbiancePollSetup(); return true; }
  if (gameName === "Tu préfères" || gameName === "Tu préfères +18") { pushScreen("games"); resetAmbiancePollState("would", gameName.includes("+18")); renderAmbiancePollSetup(); return true; }
  if (gameName === "Même cerveau") { pushScreen("games"); resetSameBrainState(); renderSameBrainSetup(); return true; }
  if (gameName === "Minorité") { pushScreen("games"); resetMinorityState(); renderMinoritySetup(); return true; }
  if (gameName === "Qui a répondu ça ?") { pushScreen("games"); resetWhoAnsweredState(); renderWhoAnsweredSetup(); return true; }
  if (gameName === "L’Imposteur sait presque tout") { pushScreen("games"); resetAlmostImpostorState(); renderAlmostImpostorSetup(); return true; }
  if (gameName === "Le Faux Expert") { pushScreen("games"); resetFakeExpertState(); renderFakeExpertSetup(); return true; }
  if (gameName === "Qui suis-je ?") { pushScreen("games"); resetWhoAmIState(); renderWhoAmISetup(); return true; }

  return false;
}

function launchRandomSoloGame() {
  if (state.players.length < 2) throw new Error("Ajoute au moins 2 joueurs avant le tirage.");

  const candidates = [...V014_READY_GAMES]
    .filter(gameName => !akAudit8GameAvailability(gameName).locked)
    .filter(gameName => gameName !== "Blind Test")
    .filter(gameName => !V014_GAME_CONFIGS[gameName]?.drinkingGame || state.alcohol);

  if (!candidates.length) throw new Error("Aucun jeu compatible avec ce groupe.");

  const recent = akAudit10LoadRecentRandomSolo();
  let choices = candidates.filter(gameName => !recent.includes(gameName));
  if (!choices.length) choices = candidates.filter(gameName => gameName !== recent[0]);
  if (!choices.length) choices = candidates;

  const selected = choices[Math.floor(Math.random() * choices.length)];
  if (!akAudit10LaunchSoloGameByName(selected)) throw new Error("Le jeu tiré n’a pas pu être ouvert.");
  akAudit10RememberRandomSolo(selected);
  return selected;
}

const AK_AUDIT10_OTHER_GAME_IDS = new Set([
  "backLobbyWhoUs",
  "laughOtherGame",
  "otherGameBestLiar",
  "otherActionTruth",
  "otherPoll",
  "otherSameBrain",
  "otherMinority",
  "otherWhoAnswered",
  "v09Other",
  "otherMega"
]);

document.addEventListener("click", event => {
  const button = event.target.closest?.("button");
  if (!button || state.roomCode || !AK_AUDIT10_OTHER_GAME_IDS.has(button.id)) return;

  // Après « Autre jeu », le bouton Retour doit revenir au lobby, pas rouvrir
  // l’ancienne catégorie ou l’ancien écran de configuration.
  state.history = ["lobby"];
}, true);

/* =========================================================
   AK'GAMES V1.0 — AUDIT PASSE 9
   Démarrage hors ligne : le solo reste jouable, le multi ne
   doit jamais tomber sur l'ancien faux salon de démonstration.
   ========================================================= */

function akAudit9MultiplayerReady() {
  if (navigator.onLine === false) {
    alert("Le mode plusieurs téléphones a besoin d’Internet. Le mode « Un téléphone » reste disponible hors ligne.");
    return false;
  }

  if (!window.AKFirebase) {
    alert("Le service multijoueur n’a pas pu démarrer. Vérifie ta connexion puis recharge AK’Games. Le mode « Un téléphone » reste disponible.");
    return false;
  }

  return true;
}

document.addEventListener("click", event => {
  const actionButton = event.target.closest?.('[data-home-action="create"], [data-home-action="join"]');
  if (!actionButton) return;
  if (akAudit9MultiplayerReady()) return;

  event.preventDefault();
  event.stopImmediatePropagation();
}, true);


/* =========================================================
   AK'GAMES V1.0 — AUDIT PASSE 11
   Soirée longue : retour des paramètres et garde-fous de contexte
   ========================================================= */

const AK_AUDIT11_GAME_SETUP_SELECTORS = [
  "#startWhoUs",
  "#startLaughDuel",
  "#startBestLiar",
  "#startActionTruth",
  "#startPollGame",
  "#startSameBrain",
  "#startMinority",
  "#startWhoAnswered",
  "#startImpostor",
  "#startExpert",
  "#startWhoAmI",
  "#startMegaGame"
];

function akAudit11IsGameSetupVisible() {
  return AK_AUDIT11_GAME_SETUP_SELECTORS.some(selector => Boolean(document.querySelector(selector)));
}

function akAudit11DetectSettingsOrigin() {
  if (document.querySelector("#continueSetup")) return "setup";
  if (document.querySelector("#savePlayer")) return "player-form";
  if (document.querySelector("#openGames")) return "lobby";
  if (document.querySelector("#chooseGame")) return "play-choice";
  if (document.querySelector(".category-grid")) return "categories";
  if (document.querySelector(".game-list")) return "games";
  return "home";
}

function akAudit11ReturnFromSettings(origin) {
  if (origin === "setup") return renderSetup();
  if (origin === "player-form") return renderPlayerForm();
  if (origin === "lobby") return renderLobby();
  if (origin === "play-choice") return renderPlayChoice();
  if (origin === "categories") return renderCategories();
  if (origin === "games") {
    const category = categories.find(item => item.id === state.currentCategory);
    if (!category || (category.adultOnly && !state.adult)) return renderCategories();
    return renderGames();
  }
  return renderHome();
}

settingsBtn.addEventListener("click", event => {
  if (state.roomCode || isSoloGameRunning()) return;

  if (akAudit11IsGameSetupVisible()) {
    event.preventDefault();
    event.stopImmediatePropagation();
    alert("Reviens d’abord à la liste des jeux avant de modifier les réglages de la soirée.");
    return;
  }

  state.akAudit11SettingsOrigin = akAudit11DetectSettingsOrigin();
}, true);

backBtn.addEventListener("click", event => {
  if (!document.querySelector("#resetApp") || title.textContent !== "Paramètres") return;

  event.preventDefault();
  event.stopImmediatePropagation();

  if (state.history[state.history.length - 1] === "settings-origin") {
    state.history.pop();
  }

  const origin = state.akAudit11SettingsOrigin || "home";
  state.akAudit11SettingsOrigin = null;
  akAudit11ReturnFromSettings(origin);
}, true);

/* =========================================================
   AK'GAMES V1.0 — PASSER UNE QUESTION / CARTE DÉJÀ VUE
   Mode un téléphone
   ========================================================= */

state.akSkipBusy = false;

function akSkipDialog({ titleText = "Changer cette carte ?", message = "La manche en cours sera ignorée, sans point ni pénalité." } = {}) {
  document.querySelector(".ak-skip-dialog-backdrop")?.remove();

  return new Promise(resolve => {
    const backdrop = document.createElement("div");
    backdrop.className = "ak-room-dialog-backdrop ak-skip-dialog-backdrop";
    backdrop.innerHTML = `
      <section class="ak-room-dialog" role="dialog" aria-modal="true" aria-labelledby="akSkipDialogTitle" aria-describedby="akSkipDialogMessage">
        <div class="ak-room-dialog-glow" aria-hidden="true"></div>
        <div class="ak-room-dialog-icon ak-skip-dialog-icon" aria-hidden="true">↻</div>
        <p class="ak-room-dialog-eyebrow">CARTE DÉJÀ VUE</p>
        <h2 id="akSkipDialogTitle">${escapeHtml(titleText)}</h2>
        <div class="ak-room-dialog-divider" aria-hidden="true"><span></span><b>✦</b><span></span></div>
        <p id="akSkipDialogMessage" class="ak-room-dialog-message">${escapeHtml(message)}</p>
        <div class="ak-room-dialog-actions">
          <button type="button" class="ak-room-dialog-btn ak-room-dialog-btn-secondary" data-ak-skip-cancel>Garder la carte</button>
          <button type="button" class="ak-room-dialog-btn ak-room-dialog-btn-primary" data-ak-skip-confirm>Passer</button>
        </div>
      </section>
    `;

    const finish = value => {
      document.removeEventListener("keydown", onKeydown);
      backdrop.classList.add("is-closing");
      window.setTimeout(() => {
        backdrop.remove();
        resolve(value);
      }, 140);
    };

    const onKeydown = event => {
      if (event.key === "Escape") finish(false);
    };

    backdrop.querySelector("[data-ak-skip-confirm]")?.addEventListener("click", () => finish(true));
    backdrop.querySelector("[data-ak-skip-cancel]")?.addEventListener("click", () => finish(false));
    backdrop.addEventListener("click", event => {
      if (event.target === backdrop) finish(false);
    });

    document.body.appendChild(backdrop);
    document.addEventListener("keydown", onKeydown);
    window.requestAnimationFrame(() => {
      backdrop.classList.add("is-visible");
      backdrop.querySelector("[data-ak-skip-confirm]")?.focus();
    });
  });
}

function akSoloSkipSelectorsMatch(selectors) {
  return selectors.some(selector => Boolean(document.querySelector(selector)));
}

function akGetSoloSkipContext() {
  if (state.mode !== "single" || state.akSkipBusy) return null;

  if (
    state.quiDeNous?.questions?.length &&
    state.quiDeNous.currentIndex < state.quiDeNous.questions.length &&
    akSoloSkipSelectorsMatch(["#beginVotes", "#readyToVote", "[data-vote-target]", "#nextVoter", "#revealWhoUs"])
  ) {
    return {
      label: "question",
      skip() {
        const game = state.quiDeNous;
        game.currentIndex += 1;
        game.currentVoterIndex = 0;
        game.currentVotes = {};
        if (game.currentIndex >= game.questions.length) renderWhoUsEnd();
        else renderWhoUsQuestion();
      }
    };
  }

  if (
    state.laughDuel?.currentJoke &&
    akSoloSkipSelectorsMatch(["#revealPunchline", ".joke-card .punchline", ".joke-card + .laugh-outcomes"])
  ) {
    return {
      label: "blague",
      message: "Une autre blague sera tirée pour la même personne.",
      skip() {
        drawLaughJoke();
      }
    };
  }

  if (
    state.bestLiar?.prompts?.length &&
    state.bestLiar.currentRound < state.bestLiar.prompts.length &&
    akSoloSkipSelectorsMatch([
      "#startWritingLies", "#readyToLie", "#submitLie", "#nextLieWriter",
      "#startLieVotes", "#readyToVoteLie", "[data-lie-vote]", "#nextLieVoter"
    ])
  ) {
    return {
      label: "situation",
      skip() {
        const game = state.bestLiar;
        game.currentRound += 1;
        game.currentWriterIndex = 0;
        game.currentVoterIndex = 0;
        game.currentAnswers = [];
        game.currentVotes = {};
        if (game.currentRound >= game.prompts.length) renderBestLiarEnd();
        else renderBestLiarRoundIntro();
      }
    };
  }

  if (
    state.actionTruth?.prompts?.length &&
    state.actionTruth.currentIndex < state.actionTruth.prompts.length &&
    akSoloSkipSelectorsMatch(["#actionTruthDone", "#actionTruthSkip"])
  ) {
    return {
      label: "carte",
      skip() {
        state.actionTruth.currentIndex += 1;
        renderActionTruthRound();
      }
    };
  }

  if (
    state.ambiancePoll?.items?.length &&
    state.ambiancePoll.currentIndex < state.ambiancePoll.items.length &&
    akSoloSkipSelectorsMatch(["#openPrivateVote", "[data-poll-vote]"])
  ) {
    return {
      label: "question",
      skip() {
        const game = state.ambiancePoll;
        clearAmbiancePollTimer();
        game.currentIndex += 1;
        game.currentVoterIndex = 0;
        game.votes = {};
        renderAmbiancePollGate();
      }
    };
  }

  if (
    state.sameBrain?.items?.length &&
    state.sameBrain.currentIndex < state.sameBrain.items.length &&
    akSoloSkipSelectorsMatch(["#openBrainAnswer", "#saveBrainAnswer"])
  ) {
    return {
      label: "question",
      skip() {
        const game = state.sameBrain;
        game.currentIndex += 1;
        game.currentWriterIndex = 0;
        game.answers = {};
        renderSameBrainGate();
      }
    };
  }

  if (
    state.minorityGame?.items?.length &&
    state.minorityGame.currentIndex < state.minorityGame.items.length &&
    akSoloSkipSelectorsMatch(["#openMinorityVote", "[data-minority-vote]"])
  ) {
    return {
      label: "question",
      skip() {
        const game = state.minorityGame;
        game.currentIndex += 1;
        game.currentVoterIndex = 0;
        game.votes = {};
        renderMinorityGate();
      }
    };
  }

  if (
    state.whoAnswered?.items?.length &&
    state.whoAnswered.currentIndex < state.whoAnswered.items.length &&
    akSoloSkipSelectorsMatch(["#openWhoAnswer", "#saveWhoAnswer", "#openWhoVote", "[data-who-vote]"])
  ) {
    return {
      label: "question",
      skip() {
        const game = state.whoAnswered;
        game.currentIndex += 1;
        game.currentWriterIndex = 0;
        game.currentVoterIndex = 0;
        game.answers = {};
        game.votes = {};
        if (game.currentIndex >= game.items.length) renderWhoAnsweredEnd();
        else renderWhoAnsweredWriteGate();
      }
    };
  }

  if (
    state.almostImpostor?.items?.length &&
    state.almostImpostor.currentIndex < state.almostImpostor.items.length &&
    akSoloSkipSelectorsMatch([
      "#openImpostorRole", "#hideImpostorRole", "#impostorVoteNow",
      "#openImpostorVote", "[data-impostor-vote]", "[data-impostor-guess]"
    ])
  ) {
    return {
      label: "mot",
      skip() {
        clearV09Timer();
        state.almostImpostor.currentIndex += 1;
        prepareAlmostImpostorRound();
      }
    };
  }

  if (
    state.fakeExpert?.items?.length &&
    state.fakeExpert.currentIndex < state.fakeExpert.items.length &&
    akSoloSkipSelectorsMatch([
      "#openExpertBrief", "#startExpertSpeech", "#expertVoteNow",
      "#openExpertVote", "[data-expert-vote]"
    ])
  ) {
    return {
      label: "sujet",
      skip() {
        clearV09Timer();
        state.fakeExpert.currentIndex += 1;
        prepareFakeExpertRound();
      }
    };
  }

  if (
    state.whoAmI?.items?.length &&
    state.whoAmI.currentIndex < state.whoAmI.items.length &&
    akSoloSkipSelectorsMatch(["#showWhoAmICard", "#startWhoAmIRound", "#whoAmIFound", "#whoAmIFailed"])
  ) {
    return {
      label: "identité",
      skip() {
        clearV09Timer();
        state.whoAmI.currentIndex += 1;
        renderWhoAmIRevealGate();
      }
    };
  }

  if (
    state.megaGame?.items?.length &&
    state.megaGame.currentIndex < state.megaGame.items.length &&
    akSoloSkipSelectorsMatch([
      "#revealMegaPrompt", "#megaDone", "#megaSkip",
      "#openMegaQuiz", "[data-mega-answer]",
      "#openScenarioVote", "[data-scenario-vote]",
      "#openKnowTarget", "[data-know-target]", "#openKnowGuess", "[data-know-guess]",
      "#openRankingTarget", "[data-rank-pick]", "#openRankingGuess", "[data-ranking-guess]",
      "#passBomb", "#explodeBomb"
    ])
  ) {
    return {
      label: state.megaGame.engine === "bomb" ? "catégorie" : "carte",
      skip() {
        const game = state.megaGame;
        clearV014Timer();
        game.currentIndex += 1;
        game.currentPlayerIndex = 0;
        game.currentVoterIndex = 0;
        game.votes = {};
        game.revealed = false;
        game.targetAnswer = null;
        game.targetRanking = [];
        game.rankingDraft = [];
        game.bombEndsAt = null;
        game.currentResult = null;
        renderMegaCurrent();
      }
    };
  }

  return null;
}

async function akSkipSoloCurrentCard() {
  const context = akGetSoloSkipContext();
  if (!context) return;

  const confirmed = await akSkipDialog({
    titleText: `Passer cette ${context.label} ?`,
    message: context.message || "Les réponses déjà données seront effacées. Aucun point ni pénalité ne sera attribué."
  });

  if (!confirmed) return;

  state.akSkipBusy = true;
  try {
    context.skip();
  } finally {
    state.akSkipBusy = false;
  }
}

function akMountSoloSkipControl() {
  const context = akGetSoloSkipContext();
  const existing = document.querySelector("#akSoloSkipControl");

  if (!context) {
    existing?.remove();
    return;
  }

  if (existing) return;

  const control = document.createElement("section");
  control.id = "akSoloSkipControl";
  control.className = "ak-skip-control";
  control.innerHTML = `
    <button type="button" class="secondary-btn ak-skip-card-btn" data-ak-solo-skip>
      ↻ Déjà vue ? Changer de carte
    </button>
    <small>Aucun point, aucune pénalité et toutes les réponses de cette manche sont annulées.</small>
  `;

  control.querySelector("[data-ak-solo-skip]")?.addEventListener("click", akSkipSoloCurrentCard);
  screen.appendChild(control);
}

let akSoloSkipMountQueued = false;
const akSoloSkipObserver = new MutationObserver(() => {
  if (akSoloSkipMountQueued) return;
  akSoloSkipMountQueued = true;
  window.requestAnimationFrame(() => {
    akSoloSkipMountQueued = false;
    akMountSoloSkipControl();
  });
});
akSoloSkipObserver.observe(screen, { childList: true, subtree: true });
window.requestAnimationFrame(akMountSoloSkipControl);

/* =========================================================
   AK'GAMES — ROULETTE DÉFIS V2
   Packs, défis personnalisés et défis multi-joueurs
   ========================================================= */

const AK_ROULETTE_CUSTOM_KEY = "akgames_roulette_custom_challenges_v1";
const AK_ROULETTE_PREFS_KEY = "akgames_roulette_preferences_v1";

const AK_ROULETTE_THEMES = [
  { id: "absurde", icon: "🤪", label: "Absurde" },
  { id: "impro", icon: "🎭", label: "Impro" },
  { id: "mime", icon: "🫥", label: "Mime" },
  { id: "musique", icon: "🎵", label: "Musique & danse" },
  { id: "rapidite", icon: "⚡", label: "Rapidité" },
  { id: "duel", icon: "⚔️", label: "Duels" },
  { id: "duo", icon: "🤝", label: "En duo" },
  { id: "equipe", icon: "👥", label: "En équipe" },
  { id: "confidences", icon: "💬", label: "Confidences légères" },
  { id: "creatif", icon: "🎨", label: "Créativité" }
];

const AK_ROULETTE_FORMATS = [
  { id: "solo", icon: "🧍", label: "Solo", participants: 1 },
  { id: "duo", icon: "🧑‍🤝‍🧑", label: "Duo", participants: 2 },
  { id: "trio", icon: "👪", label: "Trio", participants: 3 },
  { id: "group", icon: "🫂", label: "Tout le groupe", participants: "all" }
];

function akRouletteIsGame(game = state.megaGame) {
  return Boolean(game && game.gameName === "Roulette de défis");
}

function akRouletteReadJsonStorage(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "null");
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function akRouletteLoadCustomChallenges() {
  const rows = akRouletteReadJsonStorage(AK_ROULETTE_CUSTOM_KEY, []);
  return Array.isArray(rows)
    ? rows.filter(item => item && typeof item.text === "string" && item.text.trim())
    : [];
}

function akRouletteSaveCustomChallenges(rows) {
  localStorage.setItem(AK_ROULETTE_CUSTOM_KEY, JSON.stringify(rows));
}

function akRouletteLoadPreferences() {
  const prefs = akRouletteReadJsonStorage(AK_ROULETTE_PREFS_KEY, {});
  return prefs && typeof prefs === "object" ? prefs : {};
}

function akRouletteSavePreferences(game) {
  if (!akRouletteIsGame(game)) return;
  localStorage.setItem(AK_ROULETTE_PREFS_KEY, JSON.stringify({
    themes: game.rouletteThemes,
    formats: game.rouletteFormats,
    source: game.rouletteSource,
    roundCount: game.roundCount
  }));
}

function akRouletteNormalizeSelections(game) {
  if (!akRouletteIsGame(game)) return game;
  const prefs = akRouletteLoadPreferences();
  const validThemes = new Set(AK_ROULETTE_THEMES.map(item => item.id));
  const playerCount = Math.max(1, state.players?.length || 1);
  const availableFormatIds = AK_ROULETTE_FORMATS
    .filter(format => format.participants === "all" ? playerCount >= 2 : Number(format.participants) <= playerCount)
    .map(format => format.id);
  const validFormats = new Set(availableFormatIds);
  const customCount = akRouletteLoadCustomChallenges().length;

  const themes = Array.isArray(game.rouletteThemes) ? game.rouletteThemes.filter(id => validThemes.has(id)) : [];
  const formats = Array.isArray(game.rouletteFormats) ? game.rouletteFormats.filter(id => validFormats.has(id)) : [];
  const prefThemes = Array.isArray(prefs.themes) ? prefs.themes.filter(id => validThemes.has(id)) : [];
  const prefFormats = Array.isArray(prefs.formats) ? prefs.formats.filter(id => validFormats.has(id)) : [];

  game.rouletteThemes = themes.length ? themes : prefThemes.length ? prefThemes : AK_ROULETTE_THEMES.map(item => item.id);
  game.rouletteFormats = formats.length ? formats : prefFormats.length ? prefFormats : availableFormatIds;
  game.rouletteSource = ["official", "both", "custom"].includes(game.rouletteSource)
    ? game.rouletteSource
    : ["official", "both", "custom"].includes(prefs.source)
      ? prefs.source
      : customCount ? "both" : "official";
  game.rouletteManagerOpen = Boolean(game.rouletteManagerOpen);
  return game;
}

function akRouletteThemeMeta(id) {
  return AK_ROULETTE_THEMES.find(item => item.id === id) || { id, icon: "🎯", label: "Défi" };
}

function akRouletteParticipantMode(item) {
  if (item?.participants === "all") return "group";
  const count = Number(item?.participants || 1);
  if (count >= 3) return "trio";
  if (count === 2) return "duo";
  return "solo";
}

function akRouletteParticipantLabel(item) {
  const mode = akRouletteParticipantMode(item);
  return AK_ROULETTE_FORMATS.find(format => format.id === mode) || AK_ROULETTE_FORMATS[0];
}

function akRouletteCanUseItem(item, playerCount) {
  if (item?.participants === "all") return playerCount >= 2;
  return Number(item?.participants || 1) <= playerCount;
}

function akRouletteToggleSelection(current, id, allIds) {
  const values = new Set(Array.isArray(current) ? current : []);
  if (values.has(id)) values.delete(id);
  else values.add(id);
  return values.size ? [...values] : [...allIds];
}

function akRouletteSetupMarkup(game, options = {}) {
  if (!akRouletteIsGame(game)) return "";
  akRouletteNormalizeSelections(game);
  const readOnly = Boolean(options.readOnly);
  const custom = akRouletteLoadCustomChallenges();
  const playerCount = Math.max(1, state.players?.length || 1);
  const selectedThemes = new Set(game.rouletteThemes);
  const selectedFormats = new Set(game.rouletteFormats);
  const disabled = readOnly ? "disabled" : "";

  const customList = custom.length
    ? custom.map(item => {
        const theme = akRouletteThemeMeta(item.category);
        const format = akRouletteParticipantLabel(item);
        return `<div class="roulette-custom-row"><div><span>${theme.icon} ${escapeHtml(theme.label)} · ${format.icon} ${escapeHtml(format.label)}</span><strong>${escapeHtml(item.text)}</strong></div>${readOnly ? "" : `<button type="button" class="roulette-delete-btn" data-roulette-delete="${escapeHtml(item.id)}" aria-label="Supprimer ce défi">×</button>`}</div>`;
      }).join("")
    : `<div class="roulette-empty-custom">Aucun défi personnalisé pour le moment.</div>`;

  return `
    <section class="card roulette-settings-card">
      <div class="roulette-section-heading"><div><small>ROULETTE SUR MESURE</small><h3>Choisis l’ambiance</h3></div><span>${custom.length} perso${custom.length > 1 ? "s" : ""}</span></div>
      <p class="helper">Tu peux mélanger plusieurs thèmes. Les défis impossibles avec le nombre actuel de joueurs seront retirés automatiquement.</p>

      <div class="roulette-control-block">
        <strong>Thèmes</strong>
        <div class="roulette-chip-grid">
          ${AK_ROULETTE_THEMES.map(theme => `<button type="button" class="roulette-filter-chip ${selectedThemes.has(theme.id) ? "is-active" : ""}" data-roulette-theme="${theme.id}" ${disabled}><span>${theme.icon}</span>${escapeHtml(theme.label)}</button>`).join("")}
        </div>
      </div>

      <div class="roulette-control-block">
        <strong>Formats de défis</strong>
        <div class="roulette-chip-grid roulette-format-grid">
          ${AK_ROULETTE_FORMATS.map(format => {
            const unavailable = format.participants === "all" ? playerCount < 2 : Number(format.participants) > playerCount;
            return `<button type="button" class="roulette-filter-chip ${selectedFormats.has(format.id) ? "is-active" : ""} ${unavailable ? "is-unavailable" : ""}" data-roulette-format="${format.id}" ${disabled || unavailable ? "disabled" : ""}><span>${format.icon}</span>${escapeHtml(format.label)}</button>`;
          }).join("")}
        </div>
      </div>

      <div class="form-group roulette-source-select">
        <label for="rouletteSource">Défis utilisés</label>
        <select id="rouletteSource" class="text-input" ${disabled}>
          <option value="official" ${game.rouletteSource === "official" ? "selected" : ""}>Défis AK’Games uniquement</option>
          <option value="both" ${game.rouletteSource === "both" ? "selected" : ""}>Défis AK’Games + mes défis</option>
          <option value="custom" ${game.rouletteSource === "custom" ? "selected" : ""} ${custom.length ? "" : "disabled"}>Mes défis uniquement</option>
        </select>
      </div>

      ${readOnly ? `<div class="notice compact-notice">Seul l’hôte choisit les packs et ajoute les défis personnalisés.</div>` : `<button type="button" id="toggleRouletteManager" class="secondary-btn full roulette-manager-toggle">${game.rouletteManagerOpen ? "Fermer mes défis" : `＋ Ajouter ou gérer mes défis (${custom.length})`}</button>`}

      ${!readOnly && game.rouletteManagerOpen ? `
        <section class="roulette-custom-manager">
          <div class="roulette-custom-form">
            <div class="form-group"><label for="rouletteCustomText">Ton défi</label><textarea id="rouletteCustomText" class="text-input roulette-textarea" maxlength="220" placeholder="Ex. Inventez une publicité pour l’objet le plus proche."></textarea></div>
            <div class="roulette-custom-fields">
              <div class="form-group"><label for="rouletteCustomTheme">Thème</label><select id="rouletteCustomTheme" class="text-input">${AK_ROULETTE_THEMES.map(theme => `<option value="${theme.id}">${theme.icon} ${escapeHtml(theme.label)}</option>`).join("")}</select></div>
              <div class="form-group"><label for="rouletteCustomParticipants">Participants</label><select id="rouletteCustomParticipants" class="text-input">${AK_ROULETTE_FORMATS.filter(format => format.participants === "all" || Number(format.participants) <= playerCount).map(format => `<option value="${format.participants}">${format.icon} ${escapeHtml(format.label)}</option>`).join("")}</select></div>
            </div>
            <button type="button" id="saveRouletteCustom" class="primary-btn full">Enregistrer ce défi</button>
            <p class="helper roulette-storage-note">Tes défis restent sur cet appareil. En multijoueur, ceux de l’hôte sont envoyés automatiquement à toute la partie.</p>
          </div>
          <div class="roulette-custom-list">${customList}</div>
        </section>` : ""}
    </section>`;
}

function akRouletteBindSetup(game, options = {}) {
  if (!akRouletteIsGame(game)) return;
  const readOnly = Boolean(options.readOnly);
  if (readOnly) return;

  document.querySelectorAll("[data-roulette-theme]").forEach(button => button.addEventListener("click", () => {
    game.rouletteThemes = akRouletteToggleSelection(game.rouletteThemes, button.dataset.rouletteTheme, AK_ROULETTE_THEMES.map(item => item.id));
    akRouletteSavePreferences(game);
    renderMegaSetup();
  }));

  document.querySelectorAll("[data-roulette-format]").forEach(button => button.addEventListener("click", () => {
    game.rouletteFormats = akRouletteToggleSelection(game.rouletteFormats, button.dataset.rouletteFormat, AK_ROULETTE_FORMATS.map(item => item.id));
    akRouletteSavePreferences(game);
    renderMegaSetup();
  }));

  document.querySelector("#rouletteSource")?.addEventListener("change", event => {
    game.rouletteSource = event.target.value;
    akRouletteSavePreferences(game);
  });

  document.querySelector("#toggleRouletteManager")?.addEventListener("click", () => {
    game.rouletteManagerOpen = !game.rouletteManagerOpen;
    renderMegaSetup();
  });

  document.querySelector("#saveRouletteCustom")?.addEventListener("click", () => {
    const text = document.querySelector("#rouletteCustomText")?.value?.trim() || "";
    const category = document.querySelector("#rouletteCustomTheme")?.value || "absurde";
    const rawParticipants = document.querySelector("#rouletteCustomParticipants")?.value || "1";
    if (text.length < 5) return alert("Écris un défi un peu plus précis avant de l’enregistrer.");
    const participants = rawParticipants === "all" ? "all" : Number(rawParticipants);
    const custom = akRouletteLoadCustomChallenges();
    custom.unshift({
      id: `roulette_custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      text,
      category,
      participants,
      custom: true
    });
    akRouletteSaveCustomChallenges(custom);
    game.rouletteSource = game.rouletteSource === "official" ? "both" : game.rouletteSource;
    akRouletteSavePreferences(game);
    renderMegaSetup();
  });

  document.querySelectorAll("[data-roulette-delete]").forEach(button => button.addEventListener("click", () => {
    const id = button.dataset.rouletteDelete;
    const next = akRouletteLoadCustomChallenges().filter(item => item.id !== id);
    akRouletteSaveCustomChallenges(next);
    if (!next.length && game.rouletteSource === "custom") game.rouletteSource = "official";
    akRouletteSavePreferences(game);
    renderMegaSetup();
  }));
}

function akRouletteBuildPool(officialRows, game, players = state.players) {
  akRouletteNormalizeSelections(game);
  const customRows = akRouletteLoadCustomChallenges().map(item => ({ ...item, custom: true }));
  let pool = game.rouletteSource === "custom"
    ? customRows
    : game.rouletteSource === "both"
      ? [...officialRows, ...customRows]
      : officialRows;

  const selectedThemes = new Set(game.rouletteThemes);
  const selectedFormats = new Set(game.rouletteFormats);
  const playerCount = Math.max(1, players?.length || 1);
  pool = pool.filter(item => selectedThemes.has(item.category));
  pool = pool.filter(item => selectedFormats.has(akRouletteParticipantMode(item)));
  pool = pool.filter(item => akRouletteCanUseItem(item, playerCount));
  return pool;
}

function akRouletteSelectBalanced(pool, count, memoryKey) {
  const byTheme = new Map();
  pool.forEach(item => {
    if (!byTheme.has(item.category)) byTheme.set(item.category, []);
    byTheme.get(item.category).push(item);
  });
  const queues = [...byTheme.entries()].map(([theme, rows]) => ({
    theme,
    rows: selectFreshItems(rows, rows.length, `${memoryKey}:${theme}`)
  }));
  const selected = [];
  while (selected.length < count && queues.some(queue => queue.rows.length)) {
    shuffleArray(queues).forEach(queue => {
      if (selected.length < count && queue.rows.length) selected.push(queue.rows.shift());
    });
  }
  return selected;
}

function akRoulettePrepareItems(items, players = state.players) {
  const safePlayers = Array.isArray(players) ? players.filter(Boolean) : [];
  if (!safePlayers.length) return items;
  return items.map((item, index) => {
    const lead = safePlayers[index % safePlayers.length];
    const desired = item.participants === "all"
      ? safePlayers.length
      : Math.max(1, Math.min(Number(item.participants || 1), safePlayers.length));
    const others = shuffleArray(safePlayers.filter(player => player.id !== lead.id));
    const assigned = desired >= safePlayers.length ? [...safePlayers] : [lead, ...others.slice(0, desired - 1)];
    return {
      ...item,
      leadPlayerId: lead.id,
      assignedPlayerIds: assigned.map(player => player.id),
      assignedPlayerNames: assigned.map(player => player.name),
      participantMode: item.participants === "all" ? "group" : akRouletteParticipantMode(item)
    };
  });
}

function akRouletteAssignedPlayers(item, players = state.players) {
  const ids = Array.isArray(item?.assignedPlayerIds) ? item.assignedPlayerIds : [];
  return ids.map(id => players.find(player => player.id === id)).filter(Boolean);
}

function akRouletteLeadPlayer(item, players = state.players) {
  return players.find(player => player.id === item?.leadPlayerId) || akRouletteAssignedPlayers(item, players)[0] || players[0];
}

function akRouletteHeadline(item, players = state.players) {
  const assigned = akRouletteAssignedPlayers(item, players);
  if (!assigned.length) return "Défi surprise";
  if (item.participantMode === "group" || assigned.length === players.length) return "Tout le groupe relève le défi";
  if (assigned.length === 1) return `C’est au tour de ${assigned[0].name}`;
  if (assigned.length === 2) return `${assigned[0].name} embarque ${assigned[1].name}`;
  const last = assigned[assigned.length - 1].name;
  return `${assigned[0].name} embarque ${assigned.slice(1, -1).map(player => player.name).join(", ")} et ${last}`;
}

function akRouletteParticipantCards(item, players = state.players) {
  return akRouletteAssignedPlayers(item, players).map(player => `<div class="roulette-player-pill"><span>${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong></div>`).join("");
}

const akRouletteBaseResetMegaGame = resetMegaGame;
resetMegaGame = function (gameName, replayConfig = {}) {
  akRouletteBaseResetMegaGame(gameName, replayConfig);
  const game = state.megaGame;
  if (!akRouletteIsGame(game)) return;
  const prefs = akRouletteLoadPreferences();
  game.rouletteThemes = replayConfig.rouletteThemes || prefs.themes || AK_ROULETTE_THEMES.map(item => item.id);
  game.rouletteFormats = replayConfig.rouletteFormats || prefs.formats || AK_ROULETTE_FORMATS.map(item => item.id);
  game.rouletteSource = replayConfig.rouletteSource || prefs.source || (akRouletteLoadCustomChallenges().length ? "both" : "official");
  game.roundCount = Number(replayConfig.roundCount || prefs.roundCount || 12);
  game.rouletteManagerOpen = false;
  akRouletteNormalizeSelections(game);
};

const akRouletteBaseRenderMegaSetup = renderMegaSetup;
renderMegaSetup = function () {
  akRouletteBaseRenderMegaSetup();
  const game = state.megaGame;
  if (!akRouletteIsGame(game) || state.mode !== "single") return;
  const roundsSelect = document.querySelector("#megaRounds");
  if (roundsSelect) {
    roundsSelect.innerHTML = [8, 12, 16, 20, 25, 30].map(value => `<option value="${value}" ${Number(game.roundCount) === value ? "selected" : ""}>${value} défis</option>`).join("");
    roundsSelect.addEventListener("change", event => {
      game.roundCount = Number(event.target.value);
      akRouletteSavePreferences(game);
    });
  }
  const startButton = document.querySelector("#startMegaGame");
  if (startButton && !document.querySelector(".roulette-settings-card")) {
    startButton.insertAdjacentHTML("beforebegin", akRouletteSetupMarkup(game));
    akRouletteBindSetup(game);
  }
};

const akRouletteBaseStartMegaGame = startMegaGame;
startMegaGame = async function () {
  const game = state.megaGame;
  if (!akRouletteIsGame(game) || state.mode !== "single") return akRouletteBaseStartMegaGame();
  screen.innerHTML = `<div class="notice">La roulette prépare les défis et compose les équipes…</div>`;
  try {
    const official = await loadJsonFile(game.config.data, "Impossible de charger les défis.");
    const pool = akRouletteBuildPool(official, game, state.players);
    if (!pool.length) throw new Error("Aucun défi ne correspond à ces thèmes, formats et nombre de joueurs.");
    const count = Math.min(game.roundCount, pool.length);
    const selected = akRouletteSelectBalanced(pool, count, `solo:roulette:${game.rouletteThemes.join("-")}:${game.rouletteFormats.join("-")}`);
    game.items = akRoulettePrepareItems(selected, state.players);
    game.currentIndex = 0;
    game.currentPlayerIndex = 0;
    game.currentVoterIndex = 0;
    game.votes = {};
    game.scores = v014ScoreMap();
    game.rounds = [];
    game.revealed = false;
    game.currentResult = null;
    akRouletteSavePreferences(game);
    renderMegaCurrent();
  } catch (error) {
    console.error(error);
    alert(error.message || "Impossible de lancer la roulette.");
    renderMegaSetup();
  }
};

const akRouletteBaseRenderMegaTurn = renderMegaTurn;
renderMegaTurn = function () {
  const game = state.megaGame;
  if (!akRouletteIsGame(game)) return akRouletteBaseRenderMegaTurn();
  const item = game.items[game.currentIndex];
  const lead = akRouletteLeadPlayer(item, state.players);
  const theme = akRouletteThemeMeta(item?.category);
  const format = akRouletteParticipantLabel(item);
  clearV014Timer();
  title.textContent = "Roulette de défis";
  setBackVisible(false);
  screen.innerHTML = `
    ${v014Progress(game, "Défi")}
    <section class="roulette-round-card">
      <div class="roulette-round-topline"><span>${theme.icon} ${escapeHtml(theme.label)}</span><span>${format.icon} ${escapeHtml(format.label)}</span>${item?.custom ? `<span>✍️ Personnalisé</span>` : ""}</div>
      <div class="roulette-wheel-badge">🎡</div>
      <p class="roulette-assignment">${escapeHtml(akRouletteHeadline(item, state.players))}</p>
      <div class="roulette-participant-row">${akRouletteParticipantCards(item, state.players)}</div>
      <h2>${escapeHtml(item?.text || "Défi surprise")}</h2>
      <small>${escapeHtml(lead?.name || "La personne désignée")} mène le défi et valide le résultat.</small>
    </section>
    <section class="decision-grid"><button id="megaDone" class="primary-btn">✓ Défi réussi</button><button id="megaSkip" class="secondary-btn">Passer</button></section>
    ${state.alcohol ? `<div class="alcohol-callout">🍻 Passer reste sans pénalité. Une boisson sans alcool convient tout autant.</div>` : ""}
  `;
  document.querySelector("#megaDone")?.addEventListener("click", () => finishMegaTurn(true));
  document.querySelector("#megaSkip")?.addEventListener("click", () => finishMegaTurn(false));
};

const akRouletteBaseFinishMegaTurn = finishMegaTurn;
finishMegaTurn = function (success) {
  const game = state.megaGame;
  if (!akRouletteIsGame(game)) return akRouletteBaseFinishMegaTurn(success);
  clearV014Timer();
  const item = game.items[game.currentIndex];
  const assignedIds = Array.isArray(item?.assignedPlayerIds) ? item.assignedPlayerIds : [item?.leadPlayerId].filter(Boolean);
  if (success) assignedIds.forEach(id => game.scores[id] = Number(game.scores[id] || 0) + 1);
  game.rounds.push({
    itemId: item?.id,
    playerId: item?.leadPlayerId,
    participantIds: assignedIds,
    success
  });
  game.currentIndex += 1;
  game.revealed = false;
  renderMegaCurrent();
};


/* =========================================================
   AK'GAMES V2.0 — QUIZ MARATHON
   Facile, moyen et difficile, sélection combinable et équilibrée
   ========================================================= */

const AK_QUIZ_DIFFICULTIES = [
  { id: "easy", icon: "🌱", label: "Facile", points: 1, description: "Accessible à toute la table · 1 point." },
  { id: "medium", icon: "⚡", label: "Moyen", points: 2, description: "Il faut quelques références · 2 points." },
  { id: "hard", icon: "🔥", label: "Difficile", points: 3, description: "Pour les spécialistes · 3 points." }
];

function akQuizUsesDifficulty(game) {
  return Boolean(game?.engine === "quiz" && game?.config?.pack === "Quiz");
}

function akQuizNormalizeDifficulties(values) {
  const valid = new Set(AK_QUIZ_DIFFICULTIES.map(item => item.id));
  const selected = Array.isArray(values) ? [...new Set(values.filter(value => valid.has(value)))] : [];
  return selected.length ? selected : AK_QUIZ_DIFFICULTIES.map(item => item.id);
}

function akQuizDifficultyMeta(id) {
  return AK_QUIZ_DIFFICULTIES.find(item => item.id === id) || AK_QUIZ_DIFFICULTIES[0];
}

function akQuizPointsForItem(item) {
  return Number(akQuizDifficultyMeta(item?.difficulty || "easy").points || 1);
}

function akQuizDifficultyBadge(item) {
  if (!item?.difficulty) return "";
  const meta = akQuizDifficultyMeta(item.difficulty);
  return `<span class="quiz-difficulty-badge difficulty-${meta.id}">${meta.icon} ${escapeHtml(meta.label)} · ${meta.points} pt${meta.points > 1 ? "s" : ""}</span>`;
}

function akQuizDifficultySetupMarkup(game) {
  const selected = akQuizNormalizeDifficulties(game.selectedDifficulties);
  return `
    <section class="card quiz-difficulty-section">
      <div class="quiz-difficulty-heading">
        <div><small>NIVEAU DES QUESTIONS</small><h3>Choisis un, deux ou trois niveaux</h3></div>
        <span>${selected.length === 3 ? "Mix complet" : `${selected.length} niveau${selected.length > 1 ? "x" : ""}`}</span>
      </div>
      <div class="quiz-difficulty-grid">
        ${AK_QUIZ_DIFFICULTIES.map(level => {
          const active = selected.includes(level.id);
          return `<button type="button" class="quiz-difficulty-card difficulty-${level.id} ${active ? "active" : ""}" data-quiz-difficulty="${level.id}" aria-pressed="${active}"><span>${level.icon}</span><strong>${escapeHtml(level.label)}</strong><small>${escapeHtml(level.description)}</small><b>${active ? "✓" : "+"}</b></button>`;
        }).join("")}
      </div>
      <p class="helper">Les niveaux choisis sont mélangés équitablement. Facile = 1 point, moyen = 2 points, difficile = 3 points.</p>
    </section>`;
}

function akQuizRoundChoices(game) {
  const count = akQuizNormalizeDifficulties(game.selectedDifficulties).length;
  if (count === 1) return [10, 15, 20, 25, 30, 40, 50];
  if (count === 2) return [10, 15, 20, 25, 30, 40, 50, 75, 100];
  return [10, 15, 20, 25, 30, 40, 50, 75, 100, 150];
}

function akQuizFilterPool(pool, game) {
  if (!akQuizUsesDifficulty(game)) return pool;
  const selected = new Set(akQuizNormalizeDifficulties(game.selectedDifficulties));
  const filtered = pool.filter(item => selected.has(item.difficulty || "easy"));
  return filtered.length ? filtered : pool;
}

function akQuizSelectItems(pool, count, historyKey, game) {
  if (!akQuizUsesDifficulty(game)) return v014SelectKnowItems(pool, count, historyKey, game);
  const safeCount = Math.min(Math.max(0, Number(count || 0)), pool.length);
  const selectedLevels = akQuizNormalizeDifficulties(game.selectedDifficulties)
    .filter(level => pool.some(item => (item.difficulty || "easy") === level));
  if (!selectedLevels.length) return [];

  const groups = Object.fromEntries(selectedLevels.map(level => [level, pool.filter(item => (item.difficulty || "easy") === level)]));
  const levelOrder = shuffleArray([...selectedLevels]);
  const baseQuota = Math.floor(safeCount / levelOrder.length);
  const extra = safeCount % levelOrder.length;
  let selected = [];

  levelOrder.forEach((level, index) => {
    const quota = Math.min(groups[level].length, baseQuota + (index < extra ? 1 : 0));
    selected.push(...selectFreshItems(groups[level], quota, `${historyKey}:${level}`));
  });

  if (selected.length < safeCount) {
    const used = new Set(selected.map(item => item.id));
    const remaining = pool.filter(item => !used.has(item.id));
    selected.push(...selectFreshItems(remaining, Math.min(safeCount - selected.length, remaining.length), `${historyKey}:extra`));
  }
  return shuffleArray(selected).slice(0, safeCount);
}

const akQuizBaseResetMegaGame = resetMegaGame;
resetMegaGame = function (gameName, replayConfig = {}) {
  akQuizBaseResetMegaGame(gameName, replayConfig);
  const game = state.megaGame;
  if (!akQuizUsesDifficulty(game)) return;
  game.selectedDifficulties = akQuizNormalizeDifficulties(replayConfig.selectedDifficulties);
};

const akQuizBaseRenderMegaSetup = renderMegaSetup;
renderMegaSetup = function () {
  akQuizBaseRenderMegaSetup();
  const game = state.megaGame;
  if (!akQuizUsesDifficulty(game)) return;

  game.selectedDifficulties = akQuizNormalizeDifficulties(game.selectedDifficulties);
  const rounds = akQuizRoundChoices(game);
  if (!rounds.includes(Number(game.roundCount))) {
    game.roundCount = rounds.reduce((best, value) => value <= Number(game.roundCount || 12) ? value : best, rounds[0]);
  }
  const roundsSelect = document.querySelector("#megaRounds");
  if (roundsSelect) {
    roundsSelect.innerHTML = rounds.map(value => `<option value="${value}" ${Number(game.roundCount) === value ? "selected" : ""}>${value} question${value > 1 ? "s" : ""}</option>`).join("");
    roundsSelect.onchange = event => { game.roundCount = Number(event.target.value); };
  }

  const startButton = document.querySelector("#startMegaGame");
  if (startButton && !document.querySelector(".quiz-difficulty-section")) {
    startButton.insertAdjacentHTML("beforebegin", akQuizDifficultySetupMarkup(game));
  }
  document.querySelectorAll("[data-quiz-difficulty]").forEach(button => button.addEventListener("click", () => {
    const level = button.dataset.quizDifficulty;
    const current = akQuizNormalizeDifficulties(game.selectedDifficulties);
    const next = current.includes(level) ? current.filter(value => value !== level) : [...current, level];
    if (!next.length) {
      alert("Garde au moins un niveau de difficulté sélectionné.");
      return;
    }
    game.selectedDifficulties = akQuizNormalizeDifficulties(next);
    renderMegaSetup();
  }));
};

const akQuizBaseStartMegaGame = startMegaGame;
startMegaGame = async function () {
  const game = state.megaGame;
  if (!akQuizUsesDifficulty(game) || state.mode !== "single") return akQuizBaseStartMegaGame();
  screen.innerHTML = `<div class="notice">Préparation d’un mélange équilibré des niveaux…</div>`;
  try {
    const rawPool = await loadJsonFile(game.config.data, `Impossible de charger ${game.gameName}.`);
    const pool = akQuizFilterPool(rawPool, game);
    const memoryKey = `solo:quiz:${game.gameName}:${akQuizNormalizeDifficulties(game.selectedDifficulties).join("-")}`;
    game.items = akQuizSelectItems(pool, Math.min(game.roundCount, pool.length), memoryKey, game).map(akAudit8PrepareQuizItem);
    game.currentIndex = 0;
    game.currentPlayerIndex = 0;
    game.currentVoterIndex = 0;
    game.votes = {};
    game.scores = v014ScoreMap();
    game.rounds = [];
    game.revealed = false;
    game.targetAnswer = null;
    game.targetRanking = [];
    game.rankingDraft = [];
    game.bombEndsAt = null;
    game.bombPlayerIndex = Math.floor(Math.random() * Math.max(1, state.players.length));
    game.currentResult = null;
    game.pendingKnowGuess = null;
    renderMegaCurrent();
  } catch (error) {
    console.error(error);
    alert(error.message || "Impossible de lancer le quiz.");
    renderMegaSetup();
  }
};

const akQuizBaseRenderMegaQuizVote = renderMegaQuizVote;
renderMegaQuizVote = function () {
  akQuizBaseRenderMegaQuizVote();
  const game = state.megaGame;
  if (!akQuizUsesDifficulty(game)) return;
  const card = document.querySelector(".quiz-question-card");
  const titleNode = card?.querySelector("h2");
  if (titleNode && !card.querySelector(".quiz-difficulty-badge")) titleNode.insertAdjacentHTML("beforebegin", akQuizDifficultyBadge(game.items?.[game.currentIndex]));
};

const akQuizBaseRenderMegaQuizReveal = renderMegaQuizReveal;
renderMegaQuizReveal = function () {
  akQuizBaseRenderMegaQuizReveal();
  const game = state.megaGame;
  if (!akQuizUsesDifficulty(game)) return;
  const stage = document.querySelector(".mega-quiz-reveal");
  const heading = stage?.querySelector("h2");
  if (heading && !stage.querySelector(".quiz-difficulty-badge")) heading.insertAdjacentHTML("beforebegin", akQuizDifficultyBadge(game.items?.[game.currentIndex]));
};

/* =========================================================
   AK'GAMES V2.2 — CONTRÔLES DE PARTIE GLOBAUX
   Pause réelle, reprise et fin anticipée de la mini-partie
   ========================================================= */

state.akGamePaused = false;
state.akGamePauseStartedAt = null;
state.akGameControlTimers = {
  v09: null,
  v014: null,
  ambiance: null
};

const akGameControlBaseStartV09Countdown = startV09Countdown;
const akGameControlBaseClearV09Timer = clearV09Timer;
const akGameControlBaseStartV014Timer = startV014Timer;
const akGameControlBaseClearV014Timer = clearV014Timer;
const akGameControlBaseStartAmbiancePollTimer = startAmbiancePollTimer;
const akGameControlBaseClearAmbiancePollTimer = clearAmbiancePollTimer;

let akGameControlInternalTimerStop = false;

startV09Countdown = function (seconds, onDone) {
  const totalSeconds = Math.max(1, Number(seconds || 1));
  state.akGameControlTimers.v09 = {
    totalSeconds,
    endAt: Date.now() + totalSeconds * 1000,
    remainingMs: totalSeconds * 1000,
    onDone
  };
  return akGameControlBaseStartV09Countdown(totalSeconds, onDone);
};

clearV09Timer = function () {
  akGameControlBaseClearV09Timer();
  if (!akGameControlInternalTimerStop) state.akGameControlTimers.v09 = null;
};

startV014Timer = function (endAt, selector, onDone, totalSeconds = null) {
  const safeEndAt = Number(endAt || Date.now());
  state.akGameControlTimers.v014 = {
    endAt: safeEndAt,
    remainingMs: Math.max(0, safeEndAt - Date.now()),
    selector,
    onDone,
    totalSeconds: Number(totalSeconds || Math.max(1, Math.ceil((safeEndAt - Date.now()) / 1000)))
  };
  return akGameControlBaseStartV014Timer(safeEndAt, selector, onDone, totalSeconds);
};

clearV014Timer = function () {
  akGameControlBaseClearV014Timer();
  if (!akGameControlInternalTimerStop) state.akGameControlTimers.v014 = null;
};

startAmbiancePollTimer = function (deadline, totalSeconds, onExpire) {
  const safeDeadline = Number(deadline || Date.now());
  state.akGameControlTimers.ambiance = {
    endAt: safeDeadline,
    remainingMs: Math.max(0, safeDeadline - Date.now()),
    totalSeconds: Math.max(1, Number(totalSeconds || 15)),
    onDone: onExpire
  };
  return akGameControlBaseStartAmbiancePollTimer(safeDeadline, totalSeconds, onExpire);
};

clearAmbiancePollTimer = function () {
  akGameControlBaseClearAmbiancePollTimer();
  if (!akGameControlInternalTimerStop) state.akGameControlTimers.ambiance = null;
};

function akGameControlPauseSingleTimers() {
  const now = Date.now();
  const timers = state.akGameControlTimers;

  if (timers.v09) {
    timers.v09.remainingMs = Math.max(0, Number(timers.v09.endAt || now) - now);
  }
  if (timers.v014) {
    timers.v014.remainingMs = Math.max(0, Number(timers.v014.endAt || now) - now);
  }
  if (timers.ambiance) {
    timers.ambiance.remainingMs = Math.max(0, Number(timers.ambiance.endAt || now) - now);
  }

  akGameControlInternalTimerStop = true;
  akGameControlBaseClearV09Timer();
  akGameControlBaseClearV014Timer();
  akGameControlBaseClearAmbiancePollTimer();
  akGameControlInternalTimerStop = false;
}

function akGameControlResumeSingleTimers() {
  const timers = state.akGameControlTimers;

  if (timers.v09 && timers.v09.remainingMs > 0) {
    const remainingSeconds = Math.max(1, Math.ceil(timers.v09.remainingMs / 1000));
    startV09Countdown(remainingSeconds, timers.v09.onDone);
  }

  if (timers.v014 && timers.v014.remainingMs > 0) {
    const nextEndAt = Date.now() + timers.v014.remainingMs;
    if (String(timers.v014.selector || "").includes("Bomb") && state.megaGame) {
      state.megaGame.bombEndsAt = nextEndAt;
    }
    startV014Timer(nextEndAt, timers.v014.selector, timers.v014.onDone, timers.v014.totalSeconds);
  }

  if (timers.ambiance && timers.ambiance.remainingMs > 0) {
    const nextDeadline = Date.now() + timers.ambiance.remainingMs;
    startAmbiancePollTimer(nextDeadline, timers.ambiance.totalSeconds, timers.ambiance.onDone);
  }
}

function akGameControlClearSingleGame() {
  clearV09Timer();
  clearV014Timer();
  clearAmbiancePollTimer();

  state.quiDeNous = null;
  state.laughDuel = null;
  state.bestLiar = null;
  state.actionTruth = null;
  state.ambiancePoll = null;
  state.sameBrain = null;
  state.minorityGame = null;
  state.whoAnswered = null;
  state.almostImpostor = null;
  state.fakeExpert = null;
  state.whoAmI = null;
  state.megaGame = null;
  state.akGamePaused = false;
  state.akGamePauseStartedAt = null;
  state.akGameControlTimers = { v09: null, v014: null, ambiance: null };
}

function akGameControlSetAppInert(inert) {
  const app = document.querySelector("#app");
  if (!app) return;
  try {
    app.inert = Boolean(inert);
  } catch {
    app.setAttribute("aria-hidden", inert ? "true" : "false");
  }
}

function akGameControlRemoveDialog() {
  document.querySelector("#akGameControlDialog")?.remove();
}

function akGameControlConfirm({ titleText, message, confirmLabel = "Confirmer", danger = false }) {
  akGameControlRemoveDialog();
  return new Promise(resolve => {
    const dialog = document.createElement("div");
    dialog.id = "akGameControlDialog";
    dialog.className = "ak-game-control-dialog-backdrop";
    dialog.innerHTML = `
      <section class="ak-game-control-dialog" role="dialog" aria-modal="true" aria-labelledby="akGameControlDialogTitle">
        <span class="ak-game-control-dialog-icon">${danger ? "🛑" : "⏸️"}</span>
        <h2 id="akGameControlDialogTitle">${escapeHtml(titleText)}</h2>
        <p>${escapeHtml(message)}</p>
        <div class="ak-game-control-dialog-actions">
          <button type="button" class="secondary-btn" data-ak-control-cancel>Annuler</button>
          <button type="button" class="${danger ? "danger-btn" : "primary-btn"}" data-ak-control-confirm>${escapeHtml(confirmLabel)}</button>
        </div>
      </section>
    `;

    const finish = value => {
      dialog.remove();
      resolve(value);
    };

    dialog.querySelector("[data-ak-control-cancel]")?.addEventListener("click", () => finish(false));
    dialog.querySelector("[data-ak-control-confirm]")?.addEventListener("click", () => finish(true));
    dialog.addEventListener("click", event => {
      if (event.target === dialog) finish(false);
    });
    document.body.appendChild(dialog);
    window.requestAnimationFrame(() => dialog.classList.add("is-visible"));
  });
}

function akGameControlCloseMenu() {
  document.querySelector("#akGameControlMenu")?.remove();
}

function akGameControlShowMenu() {
  akGameControlCloseMenu();
  const multiplayerAdapter = window.AKGameControls?.multiplayerAdapter;
  const isMulti = Boolean(multiplayerAdapter?.isActive?.());
  const menu = document.createElement("div");
  menu.id = "akGameControlMenu";
  menu.className = "ak-game-control-menu-backdrop";
  menu.innerHTML = `
    <section class="ak-game-control-menu" role="dialog" aria-modal="true" aria-labelledby="akGameControlMenuTitle">
      <div class="ak-game-control-menu-heading">
        <div><small>CONTRÔLES DE PARTIE</small><h2 id="akGameControlMenuTitle">Que voulez-vous faire ?</h2></div>
        <button type="button" class="icon-btn" data-ak-control-close aria-label="Fermer">×</button>
      </div>
      <button type="button" class="ak-game-control-action pause" data-ak-control-pause>
        <span>⏸️</span><div><strong>Mettre en pause</strong><small>${isMulti ? "La pause apparaîtra sur tous les téléphones." : "Le jeu et les chronos s’arrêteront."}</small></div>
      </button>
      <button type="button" class="ak-game-control-action end" data-ak-control-end>
        <span>⏹️</span><div><strong>Mettre fin à la partie</strong><small>Retourner au choix des jeux sans supprimer les joueurs.</small></div>
      </button>
      <button type="button" class="secondary-btn full" data-ak-control-close>Continuer à jouer</button>
    </section>
  `;
  menu.querySelectorAll("[data-ak-control-close]").forEach(button => button.addEventListener("click", akGameControlCloseMenu));
  menu.addEventListener("click", event => {
    if (event.target === menu) akGameControlCloseMenu();
  });
  menu.querySelector("[data-ak-control-pause]")?.addEventListener("click", async () => {
    akGameControlCloseMenu();
    if (isMulti) await multiplayerAdapter.pause?.();
    else window.AKGameControls.pauseSingle();
  });
  menu.querySelector("[data-ak-control-end]")?.addEventListener("click", async () => {
    akGameControlCloseMenu();
    await window.AKGameControls.endCurrentGame();
  });
  document.body.appendChild(menu);
  window.requestAnimationFrame(() => menu.classList.add("is-visible"));
}

function akGameControlHidePauseOverlay() {
  document.querySelector("#akGamePauseOverlay")?.remove();
  document.body.classList.remove("ak-game-is-paused");
  akGameControlSetAppInert(false);
}

function akGameControlShowPauseOverlay({ multiplayer = false, canControl = true, pausedByName = "" } = {}) {
  akGameControlCloseMenu();
  document.querySelector("#akGameControlButton")?.remove();
  akGameControlHidePauseOverlay();

  const overlay = document.createElement("div");
  overlay.id = "akGamePauseOverlay";
  overlay.className = "ak-game-pause-overlay";
  overlay.innerHTML = `
    <section class="ak-game-pause-card" role="status" aria-live="polite">
      <div class="ak-game-pause-icon">⏸️</div>
      <small>PARTIE EN PAUSE</small>
      <h2>Petite respiration</h2>
      <p>${multiplayer
        ? canControl
          ? "Tous les téléphones sont en pause. La partie reprendra exactement au même endroit."
          : `${escapeHtml(pausedByName || "L’hôte")} a mis la partie en pause. Elle reprendra automatiquement dès que l’hôte la relancera.`
        : "Le jeu et les chronos sont arrêtés. Rien ne bougera tant que vous ne reprendrez pas."}</p>
      ${canControl ? `
        <div class="ak-game-pause-actions">
          <button type="button" class="primary-btn full" data-ak-control-resume>▶ Reprendre la partie</button>
          <button type="button" class="danger-btn full" data-ak-control-end-paused>Mettre fin à la partie</button>
        </div>
      ` : `<div class="ak-game-pause-waiting"><span></span><strong>En attente de l’hôte…</strong></div>`}
    </section>
  `;
  document.body.appendChild(overlay);
  document.body.classList.add("ak-game-is-paused");
  akGameControlSetAppInert(true);

  overlay.querySelector("[data-ak-control-resume]")?.addEventListener("click", async () => {
    if (multiplayer) await window.AKGameControls.multiplayerAdapter?.resume?.();
    else window.AKGameControls.resumeSingle();
  });
  overlay.querySelector("[data-ak-control-end-paused]")?.addEventListener("click", async () => {
    await window.AKGameControls.endCurrentGame();
  });
}

function akGameControlIsSingleActive() {
  return state.mode === "single" && isSoloGameRunning();
}

function akGameControlMountButton() {
  const multiplayerAdapter = window.AKGameControls?.multiplayerAdapter;
  const multiActive = Boolean(multiplayerAdapter?.isActive?.());
  const canControlMulti = Boolean(multiplayerAdapter?.canControl?.());
  const singleActive = akGameControlIsSingleActive();
  const paused = state.akGamePaused || Boolean(multiplayerAdapter?.isPaused?.());
  const shouldShow = !paused && (singleActive || (multiActive && canControlMulti));
  const current = document.querySelector("#akGameControlButton");

  if (!shouldShow) {
    current?.remove();
    return;
  }

  if (current) return;
  const button = document.createElement("button");
  button.id = "akGameControlButton";
  button.className = "ak-game-control-button";
  button.type = "button";
  button.innerHTML = `<span>⏸️</span><strong>Partie</strong>`;
  button.setAttribute("aria-label", "Ouvrir les contrôles de la partie");
  button.addEventListener("click", akGameControlShowMenu);
  document.body.appendChild(button);
}

window.AKGameControls = {
  multiplayerAdapter: null,
  registerMultiplayerAdapter(adapter) {
    this.multiplayerAdapter = adapter || null;
    akGameControlMountButton();
  },
  pauseSingle() {
    if (!akGameControlIsSingleActive() || state.akGamePaused) return;
    state.akGamePaused = true;
    state.akGamePauseStartedAt = Date.now();
    akGameControlPauseSingleTimers();
    akGameControlShowPauseOverlay({ multiplayer: false, canControl: true });
  },
  resumeSingle() {
    if (!state.akGamePaused) return;
    state.akGamePaused = false;
    state.akGamePauseStartedAt = null;
    akGameControlHidePauseOverlay();
    akGameControlResumeSingleTimers();
    akGameControlMountButton();
  },
  showMultiplayerPause(options = {}) {
    akGameControlShowPauseOverlay({ multiplayer: true, ...options });
  },
  hidePause() {
    akGameControlHidePauseOverlay();
    akGameControlMountButton();
  },
  async endCurrentGame() {
    const multiplayerAdapter = this.multiplayerAdapter;
    const isMulti = Boolean(multiplayerAdapter?.isActive?.());
    const confirmed = await akGameControlConfirm({
      titleText: "Mettre fin à cette partie ?",
      message: "Cette mini-partie sera arrêtée. Les joueurs et la soirée restent en place pour choisir un autre jeu.",
      confirmLabel: "Mettre fin à la partie",
      danger: true
    });
    if (!confirmed) return;

    if (isMulti) {
      await multiplayerAdapter.end?.();
      return;
    }

    akGameControlHidePauseOverlay();
    akGameControlClearSingleGame();
    akGameControlCloseMenu();
    renderPlayChoice();
    akGameControlMountButton();
  },
  mount: akGameControlMountButton
};

let akGameControlMountQueued = false;
const akGameControlObserver = new MutationObserver(() => {
  if (akGameControlMountQueued) return;
  akGameControlMountQueued = true;
  window.requestAnimationFrame(() => {
    akGameControlMountQueued = false;
    akGameControlMountButton();
  });
});
akGameControlObserver.observe(screen, { childList: true, subtree: true });
window.setInterval(akGameControlMountButton, 700);
window.requestAnimationFrame(akGameControlMountButton);


/* =========================================================
   QUI A RÉPONDU ÇA ? V2 — PACKS, RÉPONSES MULTIPLES & CARTES PERSO
   ========================================================= */

const whoAnsweredClassicCategories = [
  "drole_absurde", "quotidien", "dossiers", "opinions_personnalite",
  "enfance_souvenirs", "amitie_groupe", "telephone_reseaux", "nourriture",
  "voyages", "travail_etudes", "futur_reves", "situations_improbables",
  "relations_crush"
];

const whoAnsweredCategoryLabels = {
  drole_absurde: "😂 Drôle & absurde",
  quotidien: "🏠 Quotidien & manies",
  dossiers: "😳 Honte & dossiers",
  opinions_personnalite: "🧠 Opinions & personnalité",
  enfance_souvenirs: "🧸 Enfance & souvenirs",
  amitie_groupe: "🫂 Amitié & groupe",
  telephone_reseaux: "📱 Téléphone & réseaux",
  nourriture: "🍟 Nourriture",
  voyages: "✈️ Voyages",
  travail_etudes: "💼 Travail & études",
  futur_reves: "🔮 Futur & rêves",
  situations_improbables: "🚨 Situations improbables",
  relations_crush: "💘 Crushs & relations",
  personnalise: "✍️ Vos questions",
  adulte: "🔞 Adulte"
};

const AK_WHO_ANSWERED_CUSTOM_KEY = "akgames_who_answered_custom_questions_v1";

function loadWhoAnsweredCustomQuestions() {
  try {
    const parsed = JSON.parse(localStorage.getItem(AK_WHO_ANSWERED_CUSTOM_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(item => item && typeof item.prompt === "string" && item.prompt.trim())
      .map((item, index) => ({
        id: String(item.id || `qra_custom_${index}_${Date.now()}`),
        prompt: item.prompt.trim(), category: "personnalise", adult: false, custom: true
      }));
  } catch {
    return [];
  }
}

function saveWhoAnsweredCustomQuestions(items) {
  try {
    localStorage.setItem(AK_WHO_ANSWERED_CUSTOM_KEY, JSON.stringify(items));
  } catch {
    alert("Les questions personnalisées n’ont pas pu être enregistrées sur cet appareil.");
  }
}

function createWhoAnsweredCustomQuestion(value) {
  let prompt = String(value || "").trim().replace(/\s+/g, " ");
  if (!prompt) return null;
  if (!/[?!.…]$/.test(prompt)) prompt += " ?";
  return {
    id: `qra_custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    prompt, category: "personnalise", adult: false, custom: true
  };
}

function selectBalancedWhoAnsweredItems(pool, count, namespace) {
  const safePool = Array.isArray(pool) ? pool.filter(Boolean) : [];
  const limit = Math.min(Math.max(0, Number(count || 0)), safePool.length);
  if (!limit) return [];
  const memory = loadRecentContentMemory();
  const recent = new Set(Array.isArray(memory[namespace]) ? memory[namespace] : []);
  const groups = new Map();
  safePool.forEach((item, index) => {
    const category = item.category || "autre";
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push({ item, id: contentItemId(item, index) });
  });
  groups.forEach((rows, category) => {
    groups.set(category, [
      ...shuffleArray(rows.filter(row => !recent.has(row.id))),
      ...shuffleArray(rows.filter(row => recent.has(row.id)))
    ]);
  });
  const selected = [];
  let order = shuffleArray([...groups.keys()]);
  while (selected.length < limit) {
    let added = false;
    order.forEach(category => {
      if (selected.length >= limit) return;
      const rows = groups.get(category);
      if (!rows?.length) return;
      selected.push(rows.shift().item);
      added = true;
    });
    if (!added) break;
    order = shuffleArray(order.filter(category => groups.get(category)?.length));
  }
  rememberContentItems(namespace, selected, safePool.length);
  return selected;
}

function whoAnsweredMysteryCount(mode, playerCount) {
  if (mode === "all") return Math.max(1, Number(playerCount || 1));
  if (mode === "two") return Math.min(2, Math.max(1, Number(playerCount || 1)));
  return 1;
}

function takeWhoAnsweredMysteryAuthors(game, count) {
  const playerIds = state.players.map(player => player.id);
  const result = [];
  if (!Array.isArray(game.authorDeck)) game.authorDeck = [];
  while (result.length < Math.min(count, playerIds.length)) {
    if (!game.authorDeck.length) {
      game.authorDeck = shuffleArray(playerIds);
      const previous = result[result.length - 1];
      if (previous && game.authorDeck.length > 1 && game.authorDeck[0] === previous) {
        game.authorDeck.push(game.authorDeck.shift());
      }
    }
    const next = game.authorDeck.shift();
    if (!result.includes(next)) result.push(next);
  }
  return result;
}

function prepareWhoAnsweredMysteries(game) {
  const count = whoAnsweredMysteryCount(game.mysteryMode, state.players.length);
  game.mysteryQueue = takeWhoAnsweredMysteryAuthors(game, count);
  game.currentMysteryIndex = 0;
  game.currentVoterIndex = 0;
  game.votes = {};
}

resetWhoAnsweredState = function (config = {}) {
  const customQuestions = loadWhoAnsweredCustomQuestions();
  state.whoAnswered = {
    roundCount: Number(config.roundCount || 10),
    categories: [...(config.categories || whoAnsweredClassicCategories)],
    includeAdult: Boolean(config.includeAdult),
    includeCustom: config.includeCustom !== false,
    customQuestions,
    mysteryMode: ["one", "two", "all"].includes(config.mysteryMode) ? config.mysteryMode : "two",
    items: [], currentIndex: 0, currentWriterIndex: 0, currentVoterIndex: 0,
    currentMysteryIndex: 0, mysteryQueue: [], authorDeck: shuffleArray(state.players.map(player => player.id)), answers: {}, votes: {},
    scores: Object.fromEntries(state.players.map(player => [player.id, 0])),
    detectiveCorrect: Object.fromEntries(state.players.map(player => [player.id, 0])),
    fooledByAuthor: Object.fromEntries(state.players.map(player => [player.id, 0])),
    rounds: []
  };
};

function renderWhoAnsweredSetupV2() {
  if (!state.whoAnswered) resetWhoAnsweredState();
  const game = state.whoAnswered;
  const customCount = game.customQuestions.length;
  const investigations = game.roundCount * whoAnsweredMysteryCount(game.mysteryMode, state.players.length);
  title.textContent = "Qui a répondu ça ?";
  setBackVisible(true);
  screen.innerHTML = `
    <section class="game-cover game-cover-who"><span class="game-cover-icon">🕵️</span><div><small>BLUFF & SECRETS</small><h2>Qui a répondu ça ?</h2><p>Tout le monde répond une fois. Plusieurs réponses peuvent ensuite devenir mystérieuses avant de changer de question.</p></div></section>

    <section class="card">
      <h2 class="section-title">Nombre de questions</h2>
      <div class="choice-row">${[5, 10, 20, 40, 60, 100].map(value => `<button class="choice-pill ${game.roundCount === value ? "active" : ""}" data-who-answered-count="${value}">${value}</button>`).join("")}</div>
      <div class="form-group top-gap"><label for="whoAnsweredCustomCount">Personnalisé, de 3 à 100 questions</label><input id="whoAnsweredCustomCount" class="text-input" type="number" min="3" max="100" value="${game.roundCount}"></div>
    </section>

    <section class="card">
      <h2 class="section-title">Combien de réponses enquêter par question ?</h2>
      <p class="helper">Tout le monde écrit une seule fois. Le jeu utilise ensuite une, deux ou toutes les réponses anonymes.</p>
      <div class="stacked-choice top-gap">
        <label class="option-card mini-option"><input type="radio" name="whoMysteryMode" value="one" ${game.mysteryMode === "one" ? "checked" : ""}><span><strong>⚡ Une réponse</strong><br><span class="helper">Partie rapide.</span></span></label>
        <label class="option-card mini-option"><input type="radio" name="whoMysteryMode" value="two" ${game.mysteryMode === "two" ? "checked" : ""}><span><strong>🕵️ Deux réponses</strong><br><span class="helper">Le meilleur équilibre.</span></span></label>
        <label class="option-card mini-option"><input type="radio" name="whoMysteryMode" value="all" ${game.mysteryMode === "all" ? "checked" : ""}><span><strong>🔍 Toutes les réponses</strong><br><span class="helper">Grande enquête, chaque réponse sert.</span></span></label>
      </div>
      <div class="notice top-gap">Environ <strong>${investigations} enquête${investigations > 1 ? "s" : ""}</strong> au total avec les réglages actuels.</div>
    </section>

    <section class="card">
      <h2 class="section-title">Choisir les thèmes</h2>
      <p class="helper">Un seul, plusieurs ou tous. Le mélange restera équilibré.</p>
      <div class="check-grid top-gap">${whoAnsweredClassicCategories.map(category => `<label class="option-card mini-option"><input type="checkbox" data-who-answered-category="${category}" ${game.categories.includes(category) ? "checked" : ""}><span><strong>${whoAnsweredCategoryLabels[category]}</strong></span></label>`).join("")}</div>
      <div class="toolbar top-gap"><button id="selectAllWhoAnsweredCats" class="secondary-btn">Tout sélectionner</button><button id="clearAllWhoAnsweredCats" class="secondary-btn">Tout désélectionner</button></div>
    </section>

    <section class="card">
      <h2 class="section-title">✍️ Ajouter vos propres questions</h2>
      <p class="helper">Elles restent sur cet appareil. En multijoueur, celles de l’hôte sont envoyées à la room pour la partie.</p>
      <div class="form-group top-gap"><label for="customWhoAnsweredQuestion">Nouvelle question</label><input id="customWhoAnsweredQuestion" class="text-input" maxlength="220" placeholder="Quelle anecdote sur toi semble inventée alors qu’elle est vraie ?"></div>
      <button id="addWhoAnsweredCustom" class="secondary-btn full">Ajouter la question</button>
      <label class="option-card top-gap ${customCount ? "" : "disabled-option"}"><input id="includeCustomWhoAnswered" type="checkbox" ${game.includeCustom && customCount ? "checked" : ""} ${customCount ? "" : "disabled"}><span><strong>Inclure mes questions (${customCount})</strong><br><span class="helper">Elles seront mélangées aux thèmes officiels.</span></span></label>
      ${customCount ? `<details class="top-gap"><summary>Gérer mes ${customCount} question${customCount > 1 ? "s" : ""}</summary><div class="stacked-choice top-gap">${game.customQuestions.map(item => `<div class="option-card mini-option who-answered-custom-row"><span>${escapeHtml(item.prompt)}</span><button class="secondary-btn" data-remove-who-answered-custom="${item.id}">Supprimer</button></div>`).join("")}</div></details>` : ""}
    </section>

    ${state.adult ? `<label class="option-card premium-toggle"><input id="whoAnsweredAdult" type="checkbox" ${game.includeAdult ? "checked" : ""}><span><strong>🌶️ Ajouter les 150 questions adultes</strong><br><span class="helper">Séduction, dates, ex, intimité, limites et dossiers compromettants.</span></span></label>` : ""}
    <div class="notice">Bonne réponse : +1 point. L’auteur gagne +1 point pour chaque enquêteur trompé.</div>
    <button id="startWhoAnswered" class="primary-btn full">Ouvrir l’enquête</button>
  `;

  document.querySelectorAll("[data-who-answered-count]").forEach(button => button.addEventListener("click", () => { game.roundCount = Number(button.dataset.whoAnsweredCount); renderWhoAnsweredSetup(); }));
  document.querySelector("#whoAnsweredCustomCount").addEventListener("input", event => { game.roundCount = Math.max(3, Math.min(100, Number(event.target.value) || 3)); });
  document.querySelectorAll('input[name="whoMysteryMode"]').forEach(input => input.addEventListener("change", event => { game.mysteryMode = event.target.value; renderWhoAnsweredSetup(); }));
  document.querySelectorAll("[data-who-answered-category]").forEach(input => input.addEventListener("change", () => {
    const category = input.dataset.whoAnsweredCategory;
    if (input.checked && !game.categories.includes(category)) game.categories.push(category);
    if (!input.checked) game.categories = game.categories.filter(value => value !== category);
  }));
  document.querySelector("#selectAllWhoAnsweredCats").addEventListener("click", () => { game.categories = [...whoAnsweredClassicCategories]; renderWhoAnsweredSetup(); });
  document.querySelector("#clearAllWhoAnsweredCats").addEventListener("click", () => { game.categories = []; renderWhoAnsweredSetup(); });
  document.querySelector("#whoAnsweredAdult")?.addEventListener("change", event => { game.includeAdult = event.target.checked; });
  document.querySelector("#includeCustomWhoAnswered")?.addEventListener("change", event => { game.includeCustom = event.target.checked; });
  document.querySelector("#addWhoAnsweredCustom").addEventListener("click", () => {
    const input = document.querySelector("#customWhoAnsweredQuestion");
    const item = createWhoAnsweredCustomQuestion(input.value);
    if (!item) return alert("Écris d’abord une question.");
    if (game.customQuestions.some(existing => existing.prompt.trim().toLocaleLowerCase("fr") === item.prompt.trim().toLocaleLowerCase("fr"))) return alert("Cette question existe déjà.");
    game.customQuestions.push(item); game.includeCustom = true;
    saveWhoAnsweredCustomQuestions(game.customQuestions); renderWhoAnsweredSetup();
  });
  document.querySelector("#customWhoAnsweredQuestion").addEventListener("keydown", event => { if (event.key === "Enter") { event.preventDefault(); document.querySelector("#addWhoAnsweredCustom").click(); } });
  document.querySelectorAll("[data-remove-who-answered-custom]").forEach(button => button.addEventListener("click", () => {
    game.customQuestions = game.customQuestions.filter(item => item.id !== button.dataset.removeWhoAnsweredCustom);
    if (!game.customQuestions.length) game.includeCustom = false;
    saveWhoAnsweredCustomQuestions(game.customQuestions); renderWhoAnsweredSetup();
  }));
  document.querySelector("#startWhoAnswered").addEventListener("click", startWhoAnsweredGame);
}

renderWhoAnsweredSetup = typeof akAudit8WrapSetup === "function" ? akAudit8WrapSetup(renderWhoAnsweredSetupV2, "Qui a répondu ça ?") : renderWhoAnsweredSetupV2;

startWhoAnsweredGame = async function () {
  const game = state.whoAnswered;
  const hasCustom = game.includeCustom && game.customQuestions.length > 0;
  if (!game.categories.length && !game.includeAdult && !hasCustom) return alert("Choisis au moins un thème, active le pack adulte ou ajoute une question personnalisée.");
  screen.innerHTML = `<div class="notice">Distribution des carnets secrets…</div>`;
  try {
    const classicPool = await loadJsonFile("data/qui-a-repondu.json", "Impossible de charger les questions.");
    let pool = classicPool.filter(item => game.categories.includes(item.category));
    if (state.adult && game.includeAdult) pool = pool.concat(await loadJsonFile("data/qui-a-repondu-adulte.json", "Impossible de charger les questions adultes."));
    if (hasCustom) pool = pool.concat(game.customQuestions);
    if (!pool.length) throw new Error("Aucune question ne correspond aux thèmes choisis.");
    game.items = selectBalancedWhoAnsweredItems(pool, Math.min(game.roundCount, pool.length), `solo:who-answered-v2:${game.categories.join("-")}:${game.includeAdult}`);
    game.currentIndex = 0; game.currentWriterIndex = 0; game.currentVoterIndex = 0;
    game.currentMysteryIndex = 0; game.mysteryQueue = []; game.authorDeck = shuffleArray(state.players.map(player => player.id)); game.answers = {}; game.votes = {};
    game.scores = Object.fromEntries(state.players.map(player => [player.id, 0]));
    game.detectiveCorrect = Object.fromEntries(state.players.map(player => [player.id, 0]));
    game.fooledByAuthor = Object.fromEntries(state.players.map(player => [player.id, 0]));
    game.rounds = [];
    renderWhoAnsweredWriteGate();
  } catch (error) {
    alert(error.message); renderWhoAnsweredSetup();
  }
};

currentMysteryAuthorId = function (game) {
  return game.mysteryQueue?.[Number(game.currentMysteryIndex || 0)] || null;
};

eligibleWhoAnsweredVoters = function (game) {
  const authorId = currentMysteryAuthorId(game);
  return state.players.filter(player => player.id !== authorId);
};

renderWhoAnsweredWriteGate = function () {
  const game = state.whoAnswered;
  if (game.currentIndex >= game.items.length) return renderWhoAnsweredEnd();
  if (game.currentWriterIndex >= state.players.length) {
    prepareWhoAnsweredMysteries(game);
    return renderWhoAnsweredVoteGate();
  }
  const player = state.players[game.currentWriterIndex];
  title.textContent = "Réponse anonyme"; setBackVisible(false);
  screen.innerHTML = `${renderV08Progress(game.currentIndex + 1, game.items.length, "Question")}<section class="handoff-stage handoff-v07"><div class="giant-avatar">${avatarById(player.avatarId).emoji}</div><span class="category-chip">ÉCRAN PRIVÉ</span><h2>Passe le téléphone à ${escapeHtml(player.name)}</h2><p>Tout le monde répond une seule fois. Une ou plusieurs réponses seront ensuite tirées pour l’enquête.</p><button id="openWhoAnswer" class="primary-btn">Je suis ${escapeHtml(player.name)}</button></section>`;
  document.querySelector("#openWhoAnswer").addEventListener("click", renderWhoAnsweredWrite);
};

renderWhoAnsweredWrite = function () {
  const game = state.whoAnswered; const item = game.items[game.currentIndex]; const player = state.players[game.currentWriterIndex];
  title.textContent = "Qui a répondu ça ?";
  screen.innerHTML = `${renderV08Progress(game.currentIndex + 1, game.items.length, "Question")}<section class="v08-question-card who-question-card"><span>🕵️</span><small>${escapeHtml(whoAnsweredCategoryLabels[item.category] || "RÉPONSE ANONYME")}</small><h2>${escapeHtml(item.prompt)}</h2></section><section class="card"><div class="form-group"><label for="whoAnswer">Ta réponse, ${escapeHtml(player.name)}</label><textarea id="whoAnswer" class="text-input text-area multi-answer-textarea" maxlength="220" placeholder="Écris une réponse personnelle, courte et reconnaissable…"></textarea></div></section><button id="saveWhoAnswer" class="primary-btn full">Déposer anonymement</button>`;
  const input = document.querySelector("#whoAnswer"); input.focus();
  document.querySelector("#saveWhoAnswer").addEventListener("click", () => {
    const value = input.value.trim(); if (!value) return alert("Écris une réponse avant de continuer.");
    game.answers[player.id] = value; game.currentWriterIndex += 1; renderWhoAnsweredWriteGate();
  });
};

renderWhoAnsweredVoteGate = function () {
  const game = state.whoAnswered; const voters = eligibleWhoAnsweredVoters(game);
  if (game.currentVoterIndex >= voters.length) return renderWhoAnsweredReveal();
  const voter = voters[game.currentVoterIndex];
  title.textContent = "Enquête secrète"; setBackVisible(false);
  screen.innerHTML = `${renderV08Progress(game.currentIndex + 1, game.items.length, `Enquête ${game.currentMysteryIndex + 1}/${game.mysteryQueue.length}`)}<section class="handoff-stage handoff-v07"><div class="giant-avatar">${avatarById(voter.avatarId).emoji}</div><span class="category-chip">À TOI D’ENQUÊTER</span><h2>Passe le téléphone à ${escapeHtml(voter.name)}</h2><p>Réponse mystère ${game.currentMysteryIndex + 1}/${game.mysteryQueue.length}. Retrouve son auteur sans te faire influencer.</p><button id="openWhoVote" class="primary-btn">Je suis ${escapeHtml(voter.name)}</button></section>`;
  document.querySelector("#openWhoVote").addEventListener("click", renderWhoAnsweredVote);
};

renderWhoAnsweredVote = function () {
  const game = state.whoAnswered; const item = game.items[game.currentIndex]; const authorId = currentMysteryAuthorId(game);
  const voter = eligibleWhoAnsweredVoters(game)[game.currentVoterIndex]; const candidates = state.players.filter(player => player.id !== voter.id);
  title.textContent = "Qui a répondu ça ?";
  screen.innerHTML = `${renderV08Progress(game.currentIndex + 1, game.items.length, `Enquête ${game.currentMysteryIndex + 1}/${game.mysteryQueue.length}`)}<section class="mystery-answer-card"><small>${escapeHtml(item.prompt)}</small><blockquote>« ${escapeHtml(game.answers[authorId])} »</blockquote><span>QUI A ÉCRIT ÇA ?</span></section><section class="suspect-grid">${candidates.map(player => `<button class="suspect-card" data-who-vote="${player.id}"><span>${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong></button>`).join("")}</section>`;
  document.querySelectorAll("[data-who-vote]").forEach(button => button.addEventListener("click", () => {
    game.votes[voter.id] = button.dataset.whoVote; game.currentVoterIndex += 1; renderWhoAnsweredVoteGate();
  }));
};

calculateWhoAnsweredRound = function (game) {
  const authorId = currentMysteryAuthorId(game);
  const correctIds = Object.entries(game.votes).filter(([, guess]) => guess === authorId).map(([id]) => id);
  const fooledIds = Object.entries(game.votes).filter(([, guess]) => guess !== authorId).map(([id]) => id);
  correctIds.forEach(id => {
    game.scores[id] = Number(game.scores[id] || 0) + 1;
    game.detectiveCorrect[id] = Number(game.detectiveCorrect[id] || 0) + 1;
  });
  game.scores[authorId] = Number(game.scores[authorId] || 0) + fooledIds.length;
  game.fooledByAuthor[authorId] = Number(game.fooledByAuthor[authorId] || 0) + fooledIds.length;
  return { authorId, correctIds, fooledIds };
};

renderWhoAnsweredReveal = function () {
  const game = state.whoAnswered; const item = game.items[game.currentIndex]; const result = calculateWhoAnsweredRound(game);
  const author = state.players.find(player => player.id === result.authorId);
  game.rounds.push({ questionIndex: game.currentIndex, mysteryIndex: game.currentMysteryIndex, itemId: item.id, prompt: item.prompt, answerText: game.answers[result.authorId], answers: { ...game.answers }, votes: { ...game.votes }, ...result });
  const hasNextMystery = game.currentMysteryIndex + 1 < game.mysteryQueue.length;
  const hasNextQuestion = game.currentIndex + 1 < game.items.length;
  title.textContent = "Identité révélée"; setBackVisible(false);
  screen.innerHTML = `<section class="reveal-stage reveal-v07 who-reveal"><span class="game-cover-icon">${avatarById(author.avatarId).emoji}</span><h2>C’était ${escapeHtml(author.name)} !</h2><p>« ${escapeHtml(game.answers[result.authorId])} »</p><small>Réponse ${game.currentMysteryIndex + 1}/${game.mysteryQueue.length} de cette question</small></section><section class="who-vote-results">${eligibleWhoAnsweredVoters(game).map(voter => { const guessed = state.players.find(player => player.id === game.votes[voter.id]); const correct = result.correctIds.includes(voter.id); return `<article class="who-vote-row ${correct ? "correct" : "fooled"}"><span>${avatarById(voter.avatarId).emoji}</span><strong>${escapeHtml(voter.name)}</strong><small>a choisi ${escapeHtml(guessed?.name || "?")}</small><em>${correct ? "+1 pt" : "trompé·e"}</em></article>`; }).join("")}</section>${result.fooledIds.length ? `<div class="special-event"><strong>🕵️ ${escapeHtml(author.name)} a trompé ${result.fooledIds.length} personne${result.fooledIds.length > 1 ? "s" : ""}</strong><p>+${result.fooledIds.length} point${result.fooledIds.length > 1 ? "s" : ""} d’auteur mystérieux.</p></div>` : `<div class="notice">Tout le monde a retrouvé l’auteur. Couverture grillée.</div>`}<button id="nextWhoAnswered" class="primary-btn full">${hasNextMystery ? "Réponse mystère suivante" : hasNextQuestion ? "Question suivante" : "Voir le classement"}</button>`;
  document.querySelector("#nextWhoAnswered").addEventListener("click", () => {
    if (hasNextMystery) {
      game.currentMysteryIndex += 1; game.currentVoterIndex = 0; game.votes = {}; renderWhoAnsweredVoteGate(); return;
    }
    game.currentIndex += 1; game.currentWriterIndex = 0; game.currentVoterIndex = 0; game.currentMysteryIndex = 0; game.mysteryQueue = []; game.answers = {}; game.votes = {}; renderWhoAnsweredWriteGate();
  });
};

function whoAnsweredTopPlayer(stats) {
  const entries = state.players.map(player => ({ player, value: Number(stats?.[player.id] || 0) })).sort((a, b) => b.value - a.value);
  return entries[0]?.value > 0 ? entries[0] : null;
}

renderWhoAnsweredEnd = function () {
  const game = state.whoAnswered; const ranking = scoreRanking(game.scores);
  const detective = whoAnsweredTopPlayer(game.detectiveCorrect); const ghost = whoAnsweredTopPlayer(game.fooledByAuthor);
  const bestAnswer = [...game.rounds].sort((a, b) => b.fooledIds.length - a.fooledIds.length)[0];
  const bestAnswerAuthor = bestAnswer ? state.players.find(player => player.id === bestAnswer.authorId) : null;
  title.textContent = "Classement final"; setBackVisible(false);
  screen.innerHTML = `<section class="winner-stage winner-stage-v07 v08-final-stage"><div class="winner-crown">🕵️🏆</div><h2>L’enquête est classée</h2><p>Chaque réponse écrite a enfin eu une chance de devenir suspecte.</p></section><section class="final-ranking">${ranking.map((player, index) => `<div class="ranking-row"><span class="ranking-position">${index + 1}</span><span class="result-avatar">${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong><span>${Number(game.scores[player.id] || 0)} pts</span></div>`).join("")}</section><section class="who-answered-awards">${detective ? `<article><span>🔎</span><div><small>MEILLEUR ENQUÊTEUR</small><strong>${escapeHtml(detective.player.name)}</strong><p>${detective.value} auteur${detective.value > 1 ? "s" : ""} retrouvé${detective.value > 1 ? "s" : ""}</p></div></article>` : ""}${ghost ? `<article><span>👻</span><div><small>PLUS DIFFICILE À RECONNAÎTRE</small><strong>${escapeHtml(ghost.player.name)}</strong><p>${ghost.value} enquêteur${ghost.value > 1 ? "s" : ""} trompé${ghost.value > 1 ? "s" : ""}</p></div></article>` : ""}${bestAnswer && bestAnswer.fooledIds.length ? `<article><span>🕶️</span><div><small>RÉPONSE LA PLUS TROMPEUSE</small><strong>${escapeHtml(bestAnswerAuthor?.name || "Mystère")}</strong><p>« ${escapeHtml(bestAnswer.answerText)} » · ${bestAnswer.fooledIds.length} trompé${bestAnswer.fooledIds.length > 1 ? "s" : ""}</p></div></article>` : ""}</section><div class="toolbar"><button id="replayWhoAnswered" class="secondary-btn">Rejouer</button><button id="otherWhoAnswered" class="primary-btn">Autre jeu</button></div>`;
  document.querySelector("#replayWhoAnswered").addEventListener("click", () => { resetWhoAnsweredState({ roundCount: game.roundCount, categories: game.categories, includeAdult: game.includeAdult, includeCustom: game.includeCustom, mysteryMode: game.mysteryMode }); renderWhoAnsweredSetup(); });
  document.querySelector("#otherWhoAnswered").addEventListener("click", () => { state.whoAnswered = null; renderPlayChoice(); });
};

/* =========================================================
   AK'GAMES V2.4 — QUESTIONS OSÉES EN PACKS
   500 questions, thèmes, intensités et questions personnalisées
   ========================================================= */

const AK_DARING_CUSTOM_KEY = "akgames_daring_custom_questions_v1";
const AK_DARING_THEMES = [
  { id: "attraction", icon: "🧲", label: "Attirance et séduction", description: "Crushs, charme, tension et premiers pas." },
  { id: "fantasies", icon: "💭", label: "Fantasmes et envies", description: "Curiosités, scénarios imaginés et désirs." },
  { id: "experiences", icon: "🕰️", label: "Expériences et souvenirs", description: "Premières fois, anecdotes et moments marquants." },
  { id: "confessions", icon: "🤐", label: "Dossiers et confessions", description: "Mensonges, secrets et vérités difficiles à avouer." },
  { id: "exes", icon: "🧳", label: "Ex et anciennes relations", description: "Retours, regrets, souvenirs et comparaisons." },
  { id: "couple", icon: "💞", label: "Couple et fidélité", description: "Jalousie, engagement, exclusivité et confiance." },
  { id: "preferences", icon: "🌙", label: "Préférences intimes", description: "Ambiances, initiatives, rythme et complicité." },
  { id: "boundaries", icon: "🛡️", label: "Limites et consentement", description: "Respect, sécurité, communication et droit de dire non." },
  { id: "digital", icon: "📱", label: "Sextos et vie numérique", description: "Messages, photos, applications et dossiers numériques." },
  { id: "casual", icon: "🪩", label: "Rencontres sans engagement", description: "Plans spontanés, lendemain et attentes claires." },
  { id: "hypotheticals", icon: "🎲", label: "Situations hypothétiques", description: "Choix impossibles et scénarios sans conséquence." },
  { id: "group", icon: "👀", label: "Entre joueurs", description: "Questions adaptées aux personnes présentes." }
];

const AK_DARING_INTENSITIES = [
  { id: "soft", icon: "🌶️", label: "Piment doux", description: "Flirt, attirance et confidences accessibles." },
  { id: "hot", icon: "🔥", label: "Très osé", description: "Expériences, fantasmes et vraies zones sensibles." },
  { id: "nofilter", icon: "☢️", label: "Sans filtre", description: "Questions intimes, embarrassantes ou difficiles à assumer." }
];

function akDaringIsGame(game = state.megaGame) {
  return Boolean(game?.gameName === "Questions osées");
}

function akDaringLoadCustomQuestions() {
  try {
    const rows = JSON.parse(localStorage.getItem(AK_DARING_CUSTOM_KEY) || "[]");
    if (!Array.isArray(rows)) return [];
    return rows.filter(item => item && item.id && item.text).map(item => ({
      id: String(item.id),
      text: String(item.text).trim(),
      theme: AK_DARING_THEMES.some(theme => theme.id === item.theme) ? item.theme : "confessions",
      intensity: AK_DARING_INTENSITIES.some(level => level.id === item.intensity) ? item.intensity : "hot",
      category: "adult-question",
      custom: true
    }));
  } catch {
    return [];
  }
}

function akDaringSaveCustomQuestions(items) {
  try {
    localStorage.setItem(AK_DARING_CUSTOM_KEY, JSON.stringify(items));
  } catch {
    // Le jeu reste utilisable même si le stockage local est indisponible.
  }
}

function akDaringNormalizeThemes(values) {
  const valid = new Set(AK_DARING_THEMES.map(item => item.id));
  const selected = Array.isArray(values) ? [...new Set(values.filter(value => valid.has(value)))] : [];
  return selected.length ? selected : AK_DARING_THEMES.map(item => item.id);
}

function akDaringNormalizeIntensities(values) {
  const valid = new Set(AK_DARING_INTENSITIES.map(item => item.id));
  const selected = Array.isArray(values) ? [...new Set(values.filter(value => valid.has(value)))] : [];
  return selected.length ? selected : AK_DARING_INTENSITIES.map(item => item.id);
}

function akDaringThemeMeta(id) {
  return AK_DARING_THEMES.find(item => item.id === id) || AK_DARING_THEMES[0];
}

function akDaringIntensityMeta(id) {
  return AK_DARING_INTENSITIES.find(item => item.id === id) || AK_DARING_INTENSITIES[0];
}

function akDaringRoundChoices() {
  return [10, 15, 20, 30, 40, 50, 75, 100];
}

function akDaringCreateCustomQuestion(text, theme, intensity) {
  const value = String(text || "").trim();
  if (!value) return null;
  return {
    id: `osee_custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    text: value,
    theme: AK_DARING_THEMES.some(item => item.id === theme) ? theme : "confessions",
    intensity: AK_DARING_INTENSITIES.some(item => item.id === intensity) ? intensity : "hot",
    category: "adult-question",
    custom: true
  };
}

function akDaringSetupMarkup(game, { readOnly = false } = {}) {
  const selectedThemes = akDaringNormalizeThemes(game.daringThemes);
  const selectedIntensities = akDaringNormalizeIntensities(game.daringIntensities);
  const customQuestions = Array.isArray(game.daringCustomQuestions) ? game.daringCustomQuestions : [];
  const customCount = customQuestions.length;
  const disabled = readOnly ? "disabled" : "";
  const themeOptions = AK_DARING_THEMES.map(theme => `<option value="${theme.id}">${theme.icon} ${escapeHtml(theme.label)}</option>`).join("");
  const intensityOptions = AK_DARING_INTENSITIES.map(level => `<option value="${level.id}">${level.icon} ${escapeHtml(level.label)}</option>`).join("");

  return `
    <section class="card daring-settings-card">
      <div class="daring-section-heading">
        <div><small>THÈMES DE LA PARTIE</small><h3>Choisis ce que vous êtes prêts à aborder</h3></div>
        <span>${selectedThemes.length}/${AK_DARING_THEMES.length}</span>
      </div>
      <div class="daring-quick-actions">
        <button type="button" class="secondary-btn" data-daring-themes-all ${disabled}>Tout sélectionner</button>
        <button type="button" class="secondary-btn" data-daring-themes-light ${disabled}>Sélection légère</button>
      </div>
      <div class="daring-theme-grid">
        ${AK_DARING_THEMES.map(theme => {
          const active = selectedThemes.includes(theme.id);
          return `<button type="button" class="daring-theme-card ${active ? "active" : ""}" data-daring-theme="${theme.id}" aria-pressed="${active}" ${disabled}><span>${theme.icon}</span><strong>${escapeHtml(theme.label)}</strong><small>${escapeHtml(theme.description)}</small><b>${active ? "✓" : "+"}</b></button>`;
        }).join("")}
      </div>
    </section>

    <section class="card daring-settings-card">
      <div class="daring-section-heading">
        <div><small>INTENSITÉ</small><h3>Une ou plusieurs températures</h3></div>
        <span>${selectedIntensities.length}/3</span>
      </div>
      <div class="daring-intensity-grid">
        ${AK_DARING_INTENSITIES.map(level => {
          const active = selectedIntensities.includes(level.id);
          return `<button type="button" class="daring-intensity-card intensity-${level.id} ${active ? "active" : ""}" data-daring-intensity="${level.id}" aria-pressed="${active}" ${disabled}><span>${level.icon}</span><strong>${escapeHtml(level.label)}</strong><small>${escapeHtml(level.description)}</small><b>${active ? "✓" : "+"}</b></button>`;
        }).join("")}
      </div>
      <p class="helper">Les thèmes et intensités sélectionnés sont répartis équitablement pendant la partie.</p>
    </section>

    <section class="card daring-settings-card">
      <div class="daring-section-heading"><div><small>FAÇON DE RÉPONDRE</small><h3>Choisis le rythme de la partie</h3></div></div>
      <div class="daring-mode-grid">
        <label class="daring-mode-card ${game.daringAnswerMode !== "all" ? "active" : ""}"><input type="radio" name="daringAnswerMode" value="turn" ${game.daringAnswerMode !== "all" ? "checked" : ""} ${disabled}><span>🎤</span><strong>Tour par tour</strong><small>Une personne répond, puis la parole passe à la suivante.</small></label>
        <label class="daring-mode-card ${game.daringAnswerMode === "all" ? "active" : ""}"><input type="radio" name="daringAnswerMode" value="all" ${game.daringAnswerMode === "all" ? "checked" : ""} ${disabled}><span>👥</span><strong>Tout le monde répond</strong><small>La même question est ouverte à tout le groupe.</small></label>
      </div>
    </section>

    ${readOnly ? `<div class="notice">👑 L’hôte choisit les thèmes, l’intensité, le rythme et les questions personnalisées.</div>` : `
      <section class="card daring-settings-card daring-custom-card">
        <div class="daring-section-heading"><div><small>VOS PROPRES QUESTIONS</small><h3>Ajoute vos dossiers maison</h3></div><span>${customCount}</span></div>
        <div class="form-group"><label for="daringCustomText">Nouvelle question</label><textarea id="daringCustomText" class="text-input text-area" maxlength="260" placeholder="Quelle vérité sur ta vie sentimentale surprendrait le plus le groupe ?"></textarea></div>
        <div class="daring-custom-fields">
          <div class="form-group"><label for="daringCustomTheme">Thème</label><select id="daringCustomTheme" class="text-input">${themeOptions}</select></div>
          <div class="form-group"><label for="daringCustomIntensity">Intensité</label><select id="daringCustomIntensity" class="text-input">${intensityOptions}</select></div>
        </div>
        <button type="button" id="addDaringCustom" class="secondary-btn full">+ Ajouter cette question</button>
        <label class="option-card top-gap ${customCount ? "" : "disabled-option"}"><input id="includeDaringCustom" type="checkbox" ${game.daringIncludeCustom && customCount ? "checked" : ""} ${customCount ? "" : "disabled"}><span><strong>Inclure mes questions (${customCount})</strong><br><span class="helper">Elles suivent leur thème et leur intensité pendant le mélange.</span></span></label>
        ${customCount ? `<details class="top-gap"><summary>Gérer mes ${customCount} question${customCount > 1 ? "s" : ""}</summary><div class="daring-custom-list">${customQuestions.map(item => {
          const theme = akDaringThemeMeta(item.theme);
          const intensity = akDaringIntensityMeta(item.intensity);
          return `<article><div><span>${theme.icon} ${escapeHtml(theme.label)} · ${intensity.icon} ${escapeHtml(intensity.label)}</span><p>${escapeHtml(item.text)}</p></div><button type="button" class="danger-btn" data-remove-daring-custom="${item.id}">Supprimer</button></article>`;
        }).join("")}</div></details>` : ""}
      </section>`}

    <div class="responsible-callout">🛡️ Chacun peut passer une question sans se justifier. Une réponse hésitante ou un silence ne vaut jamais consentement.</div>
  `;
}

function akDaringBindSetup(game, { readOnly = false } = {}) {
  if (readOnly || !akDaringIsGame(game)) return;

  document.querySelectorAll("[data-daring-theme]").forEach(button => button.addEventListener("click", () => {
    const id = button.dataset.daringTheme;
    const selected = akDaringNormalizeThemes(game.daringThemes);
    const next = selected.includes(id) ? selected.filter(value => value !== id) : [...selected, id];
    if (!next.length) return alert("Garde au moins un thème sélectionné.");
    game.daringThemes = akDaringNormalizeThemes(next);
    renderMegaSetup();
  }));

  document.querySelector("[data-daring-themes-all]")?.addEventListener("click", () => {
    game.daringThemes = AK_DARING_THEMES.map(item => item.id);
    renderMegaSetup();
  });
  document.querySelector("[data-daring-themes-light]")?.addEventListener("click", () => {
    game.daringThemes = ["attraction", "experiences", "preferences", "boundaries", "group"];
    renderMegaSetup();
  });

  document.querySelectorAll("[data-daring-intensity]").forEach(button => button.addEventListener("click", () => {
    const id = button.dataset.daringIntensity;
    const selected = akDaringNormalizeIntensities(game.daringIntensities);
    const next = selected.includes(id) ? selected.filter(value => value !== id) : [...selected, id];
    if (!next.length) return alert("Garde au moins une intensité sélectionnée.");
    game.daringIntensities = akDaringNormalizeIntensities(next);
    renderMegaSetup();
  }));

  document.querySelectorAll('input[name="daringAnswerMode"]').forEach(input => input.addEventListener("change", event => {
    game.daringAnswerMode = event.target.value === "all" ? "all" : "turn";
    renderMegaSetup();
  }));

  document.querySelector("#includeDaringCustom")?.addEventListener("change", event => {
    game.daringIncludeCustom = Boolean(event.target.checked);
  });

  document.querySelector("#addDaringCustom")?.addEventListener("click", () => {
    const text = document.querySelector("#daringCustomText")?.value || "";
    const theme = document.querySelector("#daringCustomTheme")?.value || "confessions";
    const intensity = document.querySelector("#daringCustomIntensity")?.value || "hot";
    const item = akDaringCreateCustomQuestion(text, theme, intensity);
    if (!item) return alert("Écris une question avant de l’ajouter.");
    if (game.daringCustomQuestions.some(existing => existing.text.trim().toLocaleLowerCase("fr") === item.text.trim().toLocaleLowerCase("fr"))) {
      return alert("Cette question existe déjà dans tes questions personnalisées.");
    }
    game.daringCustomQuestions.push(item);
    game.daringIncludeCustom = true;
    akDaringSaveCustomQuestions(game.daringCustomQuestions);
    renderMegaSetup();
  });

  document.querySelectorAll("[data-remove-daring-custom]").forEach(button => button.addEventListener("click", () => {
    game.daringCustomQuestions = game.daringCustomQuestions.filter(item => item.id !== button.dataset.removeDaringCustom);
    if (!game.daringCustomQuestions.length) game.daringIncludeCustom = false;
    akDaringSaveCustomQuestions(game.daringCustomQuestions);
    renderMegaSetup();
  }));
}

function akDaringBuildPool(rawPool, game) {
  const themes = new Set(akDaringNormalizeThemes(game.daringThemes));
  const intensities = new Set(akDaringNormalizeIntensities(game.daringIntensities));
  const official = (Array.isArray(rawPool) ? rawPool : []).filter(item => themes.has(item.theme) && intensities.has(item.intensity));
  const custom = game.daringIncludeCustom
    ? (game.daringCustomQuestions || []).filter(item => themes.has(item.theme) && intensities.has(item.intensity))
    : [];
  return [...official, ...custom];
}

function akDaringSelectBalanced(pool, count, historyKey) {
  const safeCount = Math.min(Math.max(0, Number(count || 0)), pool.length);
  if (!safeCount) return [];
  const groups = pool.reduce((result, item) => {
    const key = `${item.theme || "attraction"}:${item.intensity || "soft"}`;
    (result[key] ||= []).push(item);
    return result;
  }, {});
  const keys = shuffleArray(Object.keys(groups));
  const base = Math.floor(safeCount / Math.max(1, keys.length));
  const extra = safeCount % Math.max(1, keys.length);
  let selected = [];
  keys.forEach((key, index) => {
    const quota = Math.min(groups[key].length, base + (index < extra ? 1 : 0));
    if (quota) selected.push(...selectFreshItems(groups[key], quota, `${historyKey}:${key}`));
  });
  if (selected.length < safeCount) {
    const used = new Set(selected.map(item => item.id));
    const remaining = pool.filter(item => !used.has(item.id));
    selected.push(...selectFreshItems(remaining, Math.min(safeCount - selected.length, remaining.length), `${historyKey}:extra`));
  }
  return shuffleArray(selected).slice(0, safeCount);
}

function akDaringQuestionBadges(item) {
  const theme = akDaringThemeMeta(item?.theme);
  const intensity = akDaringIntensityMeta(item?.intensity);
  return `<div class="daring-question-badges"><span>${theme.icon} ${escapeHtml(theme.label)}</span><span class="intensity-${intensity.id}">${intensity.icon} ${escapeHtml(intensity.label)}</span>${item?.custom ? `<span>✍️ Personnalisée</span>` : ""}</div>`;
}

const akDaringBaseResetMegaGame = resetMegaGame;
resetMegaGame = function (gameName, replayConfig = {}) {
  akDaringBaseResetMegaGame(gameName, replayConfig);
  const game = state.megaGame;
  if (!akDaringIsGame(game)) return;
  game.daringThemes = akDaringNormalizeThemes(replayConfig.daringThemes);
  game.daringIntensities = akDaringNormalizeIntensities(replayConfig.daringIntensities);
  game.daringAnswerMode = replayConfig.daringAnswerMode === "all" ? "all" : "turn";
  game.daringCustomQuestions = akDaringLoadCustomQuestions();
  game.daringIncludeCustom = replayConfig.daringIncludeCustom !== false && game.daringCustomQuestions.length > 0;
  game.roundCount = Number(replayConfig.roundCount || 20);
};

const akDaringBaseRenderMegaSetup = renderMegaSetup;
renderMegaSetup = function () {
  akDaringBaseRenderMegaSetup();
  const game = state.megaGame;
  if (!akDaringIsGame(game) || state.mode !== "single") return;
  const rounds = akDaringRoundChoices();
  if (!rounds.includes(Number(game.roundCount))) game.roundCount = 20;
  const roundsSelect = document.querySelector("#megaRounds");
  if (roundsSelect) {
    roundsSelect.innerHTML = rounds.map(value => `<option value="${value}" ${Number(game.roundCount) === value ? "selected" : ""}>${value} question${value > 1 ? "s" : ""}</option>`).join("");
    roundsSelect.onchange = event => { game.roundCount = Number(event.target.value); };
  }
  const startButton = document.querySelector("#startMegaGame");
  if (startButton && !document.querySelector(".daring-settings-card")) {
    startButton.insertAdjacentHTML("beforebegin", akDaringSetupMarkup(game));
    akDaringBindSetup(game);
  }
};

const akDaringBaseStartMegaGame = startMegaGame;
startMegaGame = async function () {
  const game = state.megaGame;
  if (!akDaringIsGame(game) || state.mode !== "single") return akDaringBaseStartMegaGame();
  screen.innerHTML = `<div class="notice">Préparation d’un mélange équilibré des thèmes et des intensités…</div>`;
  try {
    const rawPool = await loadJsonFile(game.config.data, "Impossible de charger les questions osées.");
    const pool = akDaringBuildPool(rawPool, game);
    if (!pool.length) throw new Error("Aucune question ne correspond aux thèmes et intensités choisis.");
    const memoryKey = `solo:daring:${akDaringNormalizeThemes(game.daringThemes).join("-")}:${akDaringNormalizeIntensities(game.daringIntensities).join("-")}:${game.daringIncludeCustom}`;
    game.items = akDaringSelectBalanced(pool, Math.min(game.roundCount, pool.length), memoryKey);
    game.currentIndex = 0;
    game.currentPlayerIndex = 0;
    game.currentVoterIndex = 0;
    game.votes = {};
    game.scores = v014ScoreMap();
    game.rounds = [];
    game.revealed = false;
    game.currentResult = null;
    renderMegaCurrent();
  } catch (error) {
    console.error(error);
    alert(error.message || "Impossible de lancer Questions osées.");
    renderMegaSetup();
  }
};

const akDaringBaseRenderMegaTurn = renderMegaTurn;
renderMegaTurn = function () {
  const game = state.megaGame;
  if (!akDaringIsGame(game)) return akDaringBaseRenderMegaTurn();
  const item = game.items[game.currentIndex];
  const allMode = game.daringAnswerMode === "all";
  const player = state.players[game.currentIndex % Math.max(1, state.players.length)];
  clearV014Timer();
  title.textContent = "Questions osées";
  setBackVisible(false);
  screen.innerHTML = `
    ${v014Progress(game, "Question")}
    <section class="daring-round-card ${allMode ? "daring-all-mode" : ""}">
      ${akDaringQuestionBadges(item)}
      <div class="daring-round-speaker"><span>${allMode ? "👥" : avatarById(player?.avatarId).emoji}</span><div><small>${allMode ? "QUESTION OUVERTE AU GROUPE" : "C’EST AU TOUR DE"}</small><strong>${allMode ? "Tout le monde peut répondre" : escapeHtml(player?.name || "Joueur")}</strong></div></div>
      <h2>${escapeHtml(item?.text || "Question surprise")}</h2>
      <p>${allMode ? "Répondez à tour de rôle si vous le souhaitez. Personne n’est obligé de prendre la parole." : `${escapeHtml(player?.name || "La personne")} peut répondre, développer… ou passer sans aucune justification.`}</p>
    </section>
    <section class="decision-grid"><button id="megaDone" class="primary-btn">${allMode ? "Question suivante" : "✓ J’ai répondu"}</button><button id="megaSkip" class="secondary-btn">Passer</button></section>
    <div class="responsible-callout">🛡️ Le droit de passer est absolu. Ne demandez pas pourquoi et ne poussez jamais quelqu’un à préciser sa réponse.</div>
  `;
  document.querySelector("#megaDone")?.addEventListener("click", () => finishMegaTurn(true));
  document.querySelector("#megaSkip")?.addEventListener("click", () => finishMegaTurn(false));
};

const akDaringBaseFinishMegaTurn = finishMegaTurn;
finishMegaTurn = function (success) {
  const game = state.megaGame;
  if (!akDaringIsGame(game)) return akDaringBaseFinishMegaTurn(success);
  const allMode = game.daringAnswerMode === "all";
  const player = state.players[game.currentIndex % Math.max(1, state.players.length)];
  game.rounds.push({
    itemId: game.items[game.currentIndex]?.id,
    playerId: allMode ? null : player?.id || null,
    participantIds: allMode ? state.players.map(item => item.id) : [player?.id].filter(Boolean),
    success,
    answerMode: game.daringAnswerMode
  });
  game.currentIndex += 1;
  game.revealed = false;
  renderMegaCurrent();
};

/* =========================================================
   AK'GAMES V2.7 — PLAIDE TA CAUSE
   500 causes, thèmes, niveaux, votes secrets et causes perso
   ========================================================= */

const AK_PLEAD_STORAGE_KEY = "akgames:plaide-cause:custom:v1";
const AK_PLEAD_THEMES = [
  { id: "food", icon: "🍕", label: "Nourriture" },
  { id: "digital", icon: "📱", label: "Téléphone & réseaux" },
  { id: "daily", icon: "🏠", label: "Quotidien" },
  { id: "friends", icon: "🫂", label: "Amitié & groupe" },
  { id: "relationships", icon: "💘", label: "Couple & relations" },
  { id: "work", icon: "💼", label: "Travail & études" },
  { id: "party_travel", icon: "🎉", label: "Soirées & vacances" },
  { id: "popculture", icon: "🎬", label: "Culture populaire" },
  { id: "laws", icon: "🏛️", label: "Lois absurdes" },
  { id: "unpopular", icon: "😈", label: "Opinions impopulaires" },
  { id: "world", icon: "🌍", label: "Changer le monde" },
  { id: "impossible", icon: "🌀", label: "Complètement indéfendable" }
];
const AK_PLEAD_DIFFICULTIES = [
  { id: "defendable", icon: "🌱", label: "Défendable", helper: "Une opinion contestable mais raisonnable." },
  { id: "spicy", icon: "🔥", label: "Corsé", helper: "Une position franchement impopulaire." },
  { id: "impossible", icon: "☠️", label: "Mission impossible", helper: "Une absurdité à rendre presque logique." }
];

if (typeof V014_GAME_CONFIGS !== "undefined" && V014_GAME_CONFIGS["Plaide ta cause"]) {
  Object.assign(V014_GAME_CONFIGS["Plaide ta cause"], {
    description: "Défends une opinion imposée, puis laisse le groupe noter secrètement ta plaidoirie.",
    defaultRounds: 10,
    timer: 60
  });
}

function akPleadIsGame(game = state.megaGame) {
  return Boolean(game && game.gameName === "Plaide ta cause");
}

function akPleadThemeMeta(id) {
  return AK_PLEAD_THEMES.find(item => item.id === id) || AK_PLEAD_THEMES[0];
}

function akPleadDifficultyMeta(id) {
  return AK_PLEAD_DIFFICULTIES.find(item => item.id === id) || AK_PLEAD_DIFFICULTIES[0];
}

function akPleadNormalizeThemes(values) {
  const allowed = new Set(AK_PLEAD_THEMES.map(item => item.id));
  const source = Array.isArray(values) ? values : [];
  const result = source.filter(value => allowed.has(value));
  return result.length ? [...new Set(result)] : AK_PLEAD_THEMES.map(item => item.id);
}

function akPleadNormalizeDifficulties(values) {
  const allowed = new Set(AK_PLEAD_DIFFICULTIES.map(item => item.id));
  const source = Array.isArray(values) ? values : [];
  const result = source.filter(value => allowed.has(value));
  return result.length ? [...new Set(result)] : AK_PLEAD_DIFFICULTIES.map(item => item.id);
}

function akPleadRoundChoices() {
  return [5, 10, 20, 40, 60, 100];
}

function akPleadLoadCustomCauses() {
  try {
    const parsed = JSON.parse(localStorage.getItem(AK_PLEAD_STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(item => item && typeof item.text === "string" && item.text.trim())
      .map(item => ({
        id: String(item.id || `plaide_custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
        text: item.text.trim().slice(0, 240),
        theme: akPleadThemeMeta(item.theme).id,
        difficulty: akPleadDifficultyMeta(item.difficulty).id,
        category: "debate",
        custom: true
      }));
  } catch {
    return [];
  }
}

function akPleadSaveCustomCauses(items) {
  try {
    localStorage.setItem(AK_PLEAD_STORAGE_KEY, JSON.stringify((items || []).slice(0, 250)));
  } catch (error) {
    console.warn("Impossible d’enregistrer les causes personnalisées.", error);
  }
}

function akPleadCreateCustomCause(text, theme, difficulty) {
  const clean = String(text || "").trim().replace(/\s+/g, " ").slice(0, 240);
  if (!clean) return null;
  return {
    id: `plaide_custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    text: /[.!?…]$/.test(clean) ? clean : `${clean}.`,
    theme: akPleadThemeMeta(theme).id,
    difficulty: akPleadDifficultyMeta(difficulty).id,
    category: "debate",
    custom: true
  };
}

function akPleadSetupMarkup(game, { readOnly = false } = {}) {
  const selectedThemes = akPleadNormalizeThemes(game.pleadThemes);
  const selectedDifficulties = akPleadNormalizeDifficulties(game.pleadDifficulties);
  const customCount = game.pleadCustomCauses?.length || 0;
  const disabled = readOnly ? "disabled" : "";
  return `
    <section class="card plead-settings-card">
      <h2 class="section-title">Choisir les thèmes</h2>
      <p class="helper">Un seul, plusieurs ou tous. Le tirage reste équilibré entre les thèmes sélectionnés.</p>
      <div class="plead-chip-grid top-gap">
        ${AK_PLEAD_THEMES.map(theme => `<button type="button" class="plead-select-chip ${selectedThemes.includes(theme.id) ? "active" : ""}" data-plead-theme="${theme.id}" ${disabled}><span>${theme.icon}</span><strong>${escapeHtml(theme.label)}</strong></button>`).join("")}
      </div>
      <div class="toolbar top-gap">
        <button type="button" class="secondary-btn" data-plead-themes-all ${disabled}>Tout sélectionner</button>
        <button type="button" class="secondary-btn" data-plead-themes-random ${disabled}>Mélange surprise</button>
      </div>
    </section>

    <section class="card plead-settings-card">
      <h2 class="section-title">Niveau des causes</h2>
      <p class="helper">Tu peux en choisir un, deux ou les trois.</p>
      <div class="plead-level-grid top-gap">
        ${AK_PLEAD_DIFFICULTIES.map(level => `<button type="button" class="plead-level-card level-${level.id} ${selectedDifficulties.includes(level.id) ? "active" : ""}" data-plead-difficulty="${level.id}" ${disabled}><span>${level.icon}</span><div><strong>${escapeHtml(level.label)}</strong><small>${escapeHtml(level.helper)}</small></div></button>`).join("")}
      </div>
    </section>

    <section class="card plead-settings-card">
      <h2 class="section-title">✍️ Ajouter vos propres causes</h2>
      <p class="helper">Elles restent sur cet appareil. En multijoueur, les causes de l’hôte sont envoyées à toute la room pour la partie.</p>
      <div class="form-group top-gap"><label for="pleadCustomText">Opinion à défendre</label><textarea id="pleadCustomText" class="text-input" rows="3" maxlength="240" placeholder="Les vacances devraient toujours commencer un mercredi." ${disabled}></textarea></div>
      <div class="plead-custom-fields top-gap">
        <div class="form-group"><label for="pleadCustomTheme">Thème</label><select id="pleadCustomTheme" class="text-input" ${disabled}>${AK_PLEAD_THEMES.map(theme => `<option value="${theme.id}">${theme.icon} ${escapeHtml(theme.label)}</option>`).join("")}</select></div>
        <div class="form-group"><label for="pleadCustomDifficulty">Niveau</label><select id="pleadCustomDifficulty" class="text-input" ${disabled}>${AK_PLEAD_DIFFICULTIES.map(level => `<option value="${level.id}">${level.icon} ${escapeHtml(level.label)}</option>`).join("")}</select></div>
      </div>
      <button id="addPleadCustom" type="button" class="secondary-btn full top-gap" ${disabled}>Ajouter la cause</button>
      <label class="option-card top-gap ${customCount ? "" : "disabled-option"}"><input id="includePleadCustom" type="checkbox" ${game.pleadIncludeCustom && customCount ? "checked" : ""} ${customCount && !readOnly ? "" : "disabled"}><span><strong>Inclure mes causes (${customCount})</strong><br><span class="helper">Elles seront mélangées aux causes officielles.</span></span></label>
      ${customCount ? `<details class="top-gap"><summary>Gérer mes ${customCount} cause${customCount > 1 ? "s" : ""}</summary><div class="plead-custom-list top-gap">${game.pleadCustomCauses.map(item => { const theme = akPleadThemeMeta(item.theme); const level = akPleadDifficultyMeta(item.difficulty); return `<article class="plead-custom-row"><div><span>${theme.icon} ${escapeHtml(theme.label)} · ${level.icon} ${escapeHtml(level.label)}</span><p>${escapeHtml(item.text)}</p></div>${readOnly ? "" : `<button type="button" class="secondary-btn" data-remove-plead-custom="${escapeHtml(item.id)}">Supprimer</button>`}</article>`; }).join("")}</div></details>` : ""}
    </section>`;
}

function akPleadBindSetup(game, { readOnly = false } = {}) {
  if (readOnly) return;
  document.querySelectorAll("[data-plead-theme]").forEach(button => button.addEventListener("click", () => {
    const id = button.dataset.pleadTheme;
    const selected = akPleadNormalizeThemes(game.pleadThemes);
    const next = selected.includes(id) ? selected.filter(value => value !== id) : [...selected, id];
    if (!next.length) return alert("Garde au moins un thème sélectionné.");
    game.pleadThemes = akPleadNormalizeThemes(next);
    renderMegaSetup();
  }));
  document.querySelector("[data-plead-themes-all]")?.addEventListener("click", () => {
    game.pleadThemes = AK_PLEAD_THEMES.map(item => item.id);
    renderMegaSetup();
  });
  document.querySelector("[data-plead-themes-random]")?.addEventListener("click", () => {
    game.pleadThemes = shuffleArray(AK_PLEAD_THEMES.map(item => item.id)).slice(0, 4);
    renderMegaSetup();
  });
  document.querySelectorAll("[data-plead-difficulty]").forEach(button => button.addEventListener("click", () => {
    const id = button.dataset.pleadDifficulty;
    const selected = akPleadNormalizeDifficulties(game.pleadDifficulties);
    const next = selected.includes(id) ? selected.filter(value => value !== id) : [...selected, id];
    if (!next.length) return alert("Garde au moins un niveau sélectionné.");
    game.pleadDifficulties = akPleadNormalizeDifficulties(next);
    renderMegaSetup();
  }));
  document.querySelector("#includePleadCustom")?.addEventListener("change", event => {
    game.pleadIncludeCustom = Boolean(event.target.checked);
  });
  document.querySelector("#addPleadCustom")?.addEventListener("click", () => {
    const item = akPleadCreateCustomCause(
      document.querySelector("#pleadCustomText")?.value,
      document.querySelector("#pleadCustomTheme")?.value,
      document.querySelector("#pleadCustomDifficulty")?.value
    );
    if (!item) return alert("Écris une cause avant de l’ajouter.");
    const duplicate = game.pleadCustomCauses.some(existing => existing.text.trim().toLocaleLowerCase("fr") === item.text.trim().toLocaleLowerCase("fr"));
    if (duplicate) return alert("Cette cause existe déjà dans tes causes personnalisées.");
    game.pleadCustomCauses.push(item);
    game.pleadIncludeCustom = true;
    akPleadSaveCustomCauses(game.pleadCustomCauses);
    renderMegaSetup();
  });
  document.querySelectorAll("[data-remove-plead-custom]").forEach(button => button.addEventListener("click", () => {
    game.pleadCustomCauses = game.pleadCustomCauses.filter(item => item.id !== button.dataset.removePleadCustom);
    if (!game.pleadCustomCauses.length) game.pleadIncludeCustom = false;
    akPleadSaveCustomCauses(game.pleadCustomCauses);
    renderMegaSetup();
  }));
}

function akPleadBuildPool(rawPool, game) {
  const themes = new Set(akPleadNormalizeThemes(game.pleadThemes));
  const difficulties = new Set(akPleadNormalizeDifficulties(game.pleadDifficulties));
  const official = (Array.isArray(rawPool) ? rawPool : []).filter(item => themes.has(item.theme) && difficulties.has(item.difficulty));
  const custom = game.pleadIncludeCustom
    ? (game.pleadCustomCauses || []).filter(item => themes.has(item.theme) && difficulties.has(item.difficulty))
    : [];
  return [...official, ...custom];
}

function akPleadSelectBalanced(pool, count, historyKey) {
  const safeCount = Math.min(Math.max(0, Number(count || 0)), pool.length);
  if (!safeCount) return [];
  const groups = pool.reduce((result, item) => {
    const key = `${item.theme || "daily"}:${item.difficulty || "defendable"}`;
    (result[key] ||= []).push(item);
    return result;
  }, {});
  const keys = shuffleArray(Object.keys(groups));
  const base = Math.floor(safeCount / Math.max(1, keys.length));
  const extra = safeCount % Math.max(1, keys.length);
  let selected = [];
  keys.forEach((key, index) => {
    const quota = Math.min(groups[key].length, base + (index < extra ? 1 : 0));
    if (quota) selected.push(...selectFreshItems(groups[key], quota, `${historyKey}:${key}`));
  });
  if (selected.length < safeCount) {
    const used = new Set(selected.map(item => item.id));
    const remaining = pool.filter(item => !used.has(item.id));
    selected.push(...selectFreshItems(remaining, Math.min(safeCount - selected.length, remaining.length), `${historyKey}:extra`));
  }
  return shuffleArray(selected).slice(0, safeCount);
}

function akPleadBadges(item) {
  const theme = akPleadThemeMeta(item?.theme);
  const level = akPleadDifficultyMeta(item?.difficulty);
  return `<div class="plead-question-badges"><span>${theme.icon} ${escapeHtml(theme.label)}</span><span class="plead-level-badge level-${level.id}">${level.icon} ${escapeHtml(level.label)}</span>${item?.custom ? `<span>✍️ Personnalisée</span>` : ""}</div>`;
}

const akPleadBaseResetMegaGame = resetMegaGame;
resetMegaGame = function (gameName, replayConfig = {}) {
  akPleadBaseResetMegaGame(gameName, replayConfig);
  const game = state.megaGame;
  if (!akPleadIsGame(game)) return;
  game.pleadThemes = akPleadNormalizeThemes(replayConfig.pleadThemes);
  game.pleadDifficulties = akPleadNormalizeDifficulties(replayConfig.pleadDifficulties);
  game.pleadCustomCauses = akPleadLoadCustomCauses();
  game.pleadIncludeCustom = replayConfig.pleadIncludeCustom !== false && game.pleadCustomCauses.length > 0;
  game.roundCount = Number(replayConfig.roundCount || 10);
  game.durationSeconds = Number(replayConfig.durationSeconds || 60);
  game.pleadPhase = "speech";
  game.pleadVoters = [];
  game.pleadCurrentVoterIndex = 0;
  game.pleadVotes = {};
};

const akPleadBaseRenderMegaSetup = renderMegaSetup;
renderMegaSetup = function () {
  const game = state.megaGame;
  if (!akPleadIsGame(game) || state.mode !== "single") return akPleadBaseRenderMegaSetup();
  clearV014Timer();
  title.textContent = "Plaide ta cause";
  setBackVisible(true);
  const roundChoices = akPleadRoundChoices();
  if (!roundChoices.includes(Number(game.roundCount))) game.roundCount = 10;
  screen.innerHTML = `
    <section class="game-cover game-cover-mega engine-turn plead-cover"><span class="game-cover-icon">⚖️</span><div><small>BLUFF & ARGUMENTATION</small><h2>Plaide ta cause</h2><p>Défends une opinion imposée, même si tu n’y crois pas. Le groupe note ensuite ta plaidoirie en secret.</p></div></section>
    <section class="card setup-card-v07">
      <div class="form-group"><label for="megaRounds">Nombre de plaidoiries</label><select id="megaRounds" class="text-input">${roundChoices.map(value => `<option value="${value}" ${Number(game.roundCount) === value ? "selected" : ""}>${value} cause${value > 1 ? "s" : ""}</option>`).join("")}</select></div>
      <div class="form-group top-gap"><label for="megaDuration">Temps de parole</label><select id="megaDuration" class="text-input">${[30,45,60,90].map(value => `<option value="${value}" ${Number(game.durationSeconds) === value ? "selected" : ""}>${value} secondes</option>`).join("")}</select></div>
    </section>
    ${akPleadSetupMarkup(game)}
    <div class="notice"><strong>Vote secret après chaque plaidoirie :</strong><br>Rejetée = 0 point · Presque convaincu = 1 point · Plaidoirie brillante = 2 points par juré.</div>
    <button id="startMegaGame" class="primary-btn full">Ouvrir le tribunal</button>`;
  document.querySelector("#megaRounds")?.addEventListener("change", event => game.roundCount = Number(event.target.value));
  document.querySelector("#megaDuration")?.addEventListener("change", event => game.durationSeconds = Number(event.target.value));
  akPleadBindSetup(game);
  document.querySelector("#startMegaGame")?.addEventListener("click", startMegaGame);
};

const akPleadBaseStartMegaGame = startMegaGame;
startMegaGame = async function () {
  const game = state.megaGame;
  if (!akPleadIsGame(game) || state.mode !== "single") return akPleadBaseStartMegaGame();
  screen.innerHTML = `<div class="notice">Préparation du dossier et tirage des causes…</div>`;
  try {
    const rawPool = await loadJsonFile(game.config.data, "Impossible de charger les causes.");
    const pool = akPleadBuildPool(rawPool, game);
    if (!pool.length) throw new Error("Aucune cause ne correspond aux thèmes et niveaux choisis.");
    const key = `solo:plead:${akPleadNormalizeThemes(game.pleadThemes).join("-")}:${akPleadNormalizeDifficulties(game.pleadDifficulties).join("-")}:${game.pleadIncludeCustom}`;
    game.items = akPleadSelectBalanced(pool, Math.min(game.roundCount, pool.length), key);
    game.currentIndex = 0;
    game.scores = v014ScoreMap();
    game.rounds = [];
    game.pleadPhase = "speech";
    game.pleadVoters = [];
    game.pleadCurrentVoterIndex = 0;
    game.pleadVotes = {};
    game.currentResult = null;
    renderMegaCurrent();
  } catch (error) {
    console.error(error);
    alert(error.message || "Impossible de lancer Plaide ta cause.");
    renderMegaSetup();
  }
};

function akPleadCurrentSpeaker(game) {
  return state.players[game.currentIndex % Math.max(1, state.players.length)] || null;
}

function akPleadStartVoting({ skipped = false, timedOut = false } = {}) {
  const game = state.megaGame;
  if (!akPleadIsGame(game)) return;
  clearV014Timer();
  const speaker = akPleadCurrentSpeaker(game);
  const item = game.items[game.currentIndex];
  if (skipped) {
    game.currentResult = { itemId: item?.id || "", playerId: speaker?.id || null, skipped: true, timedOut: false, points: 0, votes: {}, counts: { 0: 0, 1: 0, 2: 0 }, average: 0 };
    game.rounds.push(game.currentResult);
    game.pleadPhase = "result";
    renderMegaTurn();
    return;
  }
  game.pleadVoters = state.players.filter(player => player.id !== speaker?.id).map(player => player.id);
  game.pleadCurrentVoterIndex = 0;
  game.pleadVotes = {};
  game.pleadTimedOut = Boolean(timedOut);
  game.pleadPhase = "vote-gate";
  renderMegaTurn();
}

function akPleadRecordVote(value) {
  const game = state.megaGame;
  if (!akPleadIsGame(game)) return;
  const voterId = game.pleadVoters[game.pleadCurrentVoterIndex];
  if (!voterId) return akPleadCompleteVoting();
  game.pleadVotes[voterId] = Math.max(0, Math.min(2, Number(value || 0)));
  game.pleadCurrentVoterIndex += 1;
  game.pleadPhase = game.pleadCurrentVoterIndex >= game.pleadVoters.length ? "result" : "vote-gate";
  if (game.pleadPhase === "result") akPleadCompleteVoting();
  else renderMegaTurn();
}

function akPleadCompleteVoting() {
  const game = state.megaGame;
  if (!akPleadIsGame(game)) return;
  const speaker = akPleadCurrentSpeaker(game);
  const item = game.items[game.currentIndex];
  const votes = { ...(game.pleadVotes || {}) };
  const values = Object.values(votes).map(Number);
  const points = values.reduce((sum, value) => sum + value, 0);
  const counts = { 0: 0, 1: 0, 2: 0 };
  values.forEach(value => counts[value] = Number(counts[value] || 0) + 1);
  const average = values.length ? points / values.length : 0;
  if (speaker?.id) game.scores[speaker.id] = Number(game.scores[speaker.id] || 0) + points;
  game.currentResult = {
    itemId: item?.id || "",
    playerId: speaker?.id || null,
    skipped: false,
    timedOut: Boolean(game.pleadTimedOut),
    points,
    votes,
    counts,
    average
  };
  game.rounds.push(game.currentResult);
  game.pleadPhase = "result";
  renderMegaTurn();
}

function akPleadRenderSpeech(game, item, speaker) {
  game.pleadPhase = "speech";
  screen.innerHTML = `
    ${v014Progress(game, "Cause")}
    <section class="plead-round-card">
      ${akPleadBadges(item)}
      <div class="plead-speaker"><span>${avatarById(speaker?.avatarId).emoji}</span><div><small>LA PAROLE EST À</small><strong>${escapeHtml(speaker?.name || "Joueur")}</strong></div></div>
      <div class="plead-gavel">⚖️</div>
      <h2>${escapeHtml(item?.text || "Cause surprise")}</h2>
      <p>Tu dois défendre cette opinion, même si elle te semble indéfendable. Arguments, exemples et mauvaise foi élégante sont autorisés.</p>
      <div class="mega-mini-timer plead-timer"><strong id="v014Countdown">${game.durationSeconds}</strong><span>secondes</span><div class="progress-track"><div id="v014TimerFill" class="progress-fill" style="width:100%"></div></div></div>
    </section>
    <section class="decision-grid"><button id="pleadSpeechDone" class="primary-btn">🎤 Plaidoirie terminée</button><button id="pleadSkipCause" class="secondary-btn">Passer cette cause</button></section>`;
  document.querySelector("#pleadSpeechDone")?.addEventListener("click", () => akPleadStartVoting());
  document.querySelector("#pleadSkipCause")?.addEventListener("click", () => akPleadStartVoting({ skipped: true }));
  startV014Timer(Date.now() + game.durationSeconds * 1000, "#v014Countdown", () => akPleadStartVoting({ timedOut: true }), game.durationSeconds);
}

function akPleadRenderVoteGate(game, item, speaker) {
  const voterId = game.pleadVoters[game.pleadCurrentVoterIndex];
  const voter = state.players.find(player => player.id === voterId);
  screen.innerHTML = `
    ${v014Progress(game, "Cause")}
    <section class="handoff-stage handoff-v07"><div class="giant-avatar">${avatarById(voter?.avatarId).emoji}</div><span class="category-chip">JURÉ ${game.pleadCurrentVoterIndex + 1}/${game.pleadVoters.length}</span><h2>${escapeHtml(voter?.name || "Juré")}, à toi de voter</h2><p>Prends le téléphone seul·e. Ton vote sur la plaidoirie de ${escapeHtml(speaker?.name || "la personne")} restera secret.</p><button id="openPleadVote" class="primary-btn">Ouvrir mon bulletin</button></section>`;
  document.querySelector("#openPleadVote")?.addEventListener("click", () => {
    game.pleadPhase = "vote";
    renderMegaTurn();
  });
}

function akPleadRenderVote(game, item, speaker) {
  const voterId = game.pleadVoters[game.pleadCurrentVoterIndex];
  const voter = state.players.find(player => player.id === voterId);
  screen.innerHTML = `
    ${v014Progress(game, "Cause")}
    <section class="plead-vote-card">
      <span class="category-chip">🔒 VOTE SECRET DE ${escapeHtml(voter?.name || "JURÉ").toUpperCase()}</span>
      <small>${escapeHtml(speaker?.name || "La personne")} défendait :</small>
      <h2>${escapeHtml(item?.text || "Cause surprise")}</h2>
      <p>Note uniquement la qualité de la plaidoirie, pas ton opinion personnelle sur la cause.</p>
    </section>
    <section class="plead-vote-grid">
      <button type="button" data-plead-vote="0" class="plead-vote-btn vote-rejected"><span>🚫</span><strong>Rejetée</strong><small>0 point</small></button>
      <button type="button" data-plead-vote="1" class="plead-vote-btn vote-almost"><span>🤔</span><strong>Presque convaincu</strong><small>1 point</small></button>
      <button type="button" data-plead-vote="2" class="plead-vote-btn vote-brilliant"><span>✨</span><strong>Plaidoirie brillante</strong><small>2 points</small></button>
    </section>`;
  document.querySelectorAll("[data-plead-vote]").forEach(button => button.addEventListener("click", () => akPleadRecordVote(Number(button.dataset.pleadVote))));
}

function akPleadRenderResult(game, item, speaker) {
  const result = game.currentResult || {};
  if (result.skipped) {
    screen.innerHTML = `
      ${v014Progress(game, "Cause")}
      <section class="reveal-stage reveal-v07 plead-result-card"><span class="game-cover-icon">🧑‍⚖️</span>${akPleadBadges(item)}<h2>Cause passée</h2><p>${escapeHtml(speaker?.name || "La personne")} ne marque aucun point sur cette manche.</p></section>
      <button id="nextPleadRound" class="primary-btn full">${game.currentIndex + 1 >= game.items.length ? "Voir le verdict final" : "Cause suivante"}</button>`;
  } else {
    const jurors = Object.keys(result.votes || {}).length;
    screen.innerHTML = `
      ${v014Progress(game, "Cause")}
      <section class="winner-stage winner-stage-v07 plead-result-card"><div class="winner-crown">⚖️✨</div>${akPleadBadges(item)}<h2>${Number(result.points || 0)} point${Number(result.points || 0) > 1 ? "s" : ""} pour ${escapeHtml(speaker?.name || "la défense")}</h2><p>Moyenne du jury : <strong>${Number(result.average || 0).toFixed(1)}/2</strong>${result.timedOut ? " · Le temps était écoulé." : ""}</p></section>
      <section class="plead-vote-distribution">
        <article><span>🚫</span><strong>${Number(result.counts?.[0] || 0)}</strong><small>Rejetée${Number(result.counts?.[0] || 0) > 1 ? "s" : ""}</small></article>
        <article><span>🤔</span><strong>${Number(result.counts?.[1] || 0)}</strong><small>Presque convaincu${Number(result.counts?.[1] || 0) > 1 ? "s" : ""}</small></article>
        <article><span>✨</span><strong>${Number(result.counts?.[2] || 0)}</strong><small>Brillante${Number(result.counts?.[2] || 0) > 1 ? "s" : ""}</small></article>
      </section>
      <div class="notice">${jurors} juré${jurors > 1 ? "s ont" : " a"} voté en secret. Les votes individuels ne sont pas révélés.</div>
      <button id="nextPleadRound" class="primary-btn full">${game.currentIndex + 1 >= game.items.length ? "Voir le verdict final" : "Cause suivante"}</button>`;
  }
  document.querySelector("#nextPleadRound")?.addEventListener("click", () => {
    game.currentIndex += 1;
    game.pleadPhase = "speech";
    game.pleadVoters = [];
    game.pleadCurrentVoterIndex = 0;
    game.pleadVotes = {};
    game.currentResult = null;
    renderMegaCurrent();
  });
}

const akPleadBaseRenderMegaTurn = renderMegaTurn;
renderMegaTurn = function () {
  const game = state.megaGame;
  if (!akPleadIsGame(game)) return akPleadBaseRenderMegaTurn();
  clearV014Timer();
  const item = game.items[game.currentIndex];
  const speaker = akPleadCurrentSpeaker(game);
  title.textContent = "Plaide ta cause";
  setBackVisible(false);
  if (game.pleadPhase === "vote-gate") return akPleadRenderVoteGate(game, item, speaker);
  if (game.pleadPhase === "vote") return akPleadRenderVote(game, item, speaker);
  if (game.pleadPhase === "result") return akPleadRenderResult(game, item, speaker);
  return akPleadRenderSpeech(game, item, speaker);
};

const akPleadBaseRenderMegaFinal = renderMegaFinal;
renderMegaFinal = function () {
  const game = state.megaGame;
  if (!akPleadIsGame(game)) return akPleadBaseRenderMegaFinal();
  clearV014Timer();
  const ranking = [...state.players].sort((a, b) => Number(game.scores[b.id] || 0) - Number(game.scores[a.id] || 0));
  const best = Math.max(0, ...ranking.map(player => Number(game.scores[player.id] || 0)));
  const winners = ranking.filter(player => Number(game.scores[player.id] || 0) === best && game.rounds.length);
  const brilliantByPlayer = Object.fromEntries(state.players.map(player => [player.id, 0]));
  game.rounds.forEach(round => {
    if (round?.playerId) brilliantByPlayer[round.playerId] = Number(brilliantByPlayer[round.playerId] || 0) + Number(round.counts?.[2] || 0);
  });
  const mostBrilliant = [...state.players].sort((a, b) => Number(brilliantByPlayer[b.id] || 0) - Number(brilliantByPlayer[a.id] || 0))[0];
  title.textContent = "Verdict final";
  setBackVisible(false);
  screen.innerHTML = `
    <section class="winner-stage winner-stage-v07 mega-final-stage"><div class="winner-crown">⚖️🏆</div><h2>${winners.length ? winners.map(player => escapeHtml(player.name)).join(" et ") : "Le tribunal est levé"}</h2><p>${winners.length ? `${winners.length > 1 ? "remportent" : "remporte"} le titre de meilleure défense.` : "Toutes les causes ont été plaidées."}</p></section>
    <section class="final-ranking">${ranking.map((player, index) => `<div class="ranking-row"><span class="ranking-position">${index + 1}</span><span class="result-avatar">${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong><span>${Number(game.scores[player.id] || 0)} pts</span></div>`).join("")}</section>
    ${mostBrilliant && Number(brilliantByPlayer[mostBrilliant.id] || 0) > 0 ? `<div class="notice">✨ <strong>${escapeHtml(mostBrilliant.name)}</strong> a reçu le plus de votes « Plaidoirie brillante » : ${Number(brilliantByPlayer[mostBrilliant.id] || 0)}.</div>` : ""}
    <div class="toolbar"><button id="replayMega" class="secondary-btn">Rejouer</button><button id="otherMega" class="primary-btn">Autre jeu</button></div>`;
  document.querySelector("#replayMega")?.addEventListener("click", () => {
    const replay = {
      roundCount: game.roundCount,
      durationSeconds: game.durationSeconds,
      pleadThemes: game.pleadThemes,
      pleadDifficulties: game.pleadDifficulties,
      pleadIncludeCustom: game.pleadIncludeCustom
    };
    resetMegaGame("Plaide ta cause", replay);
    renderMegaSetup();
  });
  document.querySelector("#otherMega")?.addEventListener("click", () => { state.megaGame = null; renderPlayChoice(); });
};

/* =========================================================
   AK'GAMES V2.8 - MINORITE CLASSIQUE & ADULTE
   750 cartes, themes, intensites, cartes perso et statistiques
   ========================================================= */

const minorityClassicThemes = [
  "nourriture", "quotidien", "soirees_groupe", "voyages", "argent",
  "telephone_reseaux", "culture_loisirs", "personnalite", "travail_etudes",
  "futur", "opinions", "absurde", "crise", "amitie"
];

const minorityClassicThemeLabels = {
  nourriture: "🍟 Nourriture & habitudes",
  quotidien: "🏠 Quotidien & petites manies",
  soirees_groupe: "🎉 Soirées & groupe",
  voyages: "✈️ Voyages & vacances",
  argent: "💸 Argent & achats",
  telephone_reseaux: "📱 Téléphone & réseaux",
  culture_loisirs: "🎬 Culture & loisirs",
  personnalite: "🧠 Personnalité & réactions",
  travail_etudes: "💼 Travail & études",
  futur: "🔮 Futur & rêves",
  opinions: "🗯️ Opinions impopulaires",
  absurde: "🌀 Choix absurdes",
  crise: "🚨 Situations de crise",
  amitie: "🫂 Amitié & relations",
  personnalise: "✍️ Vos questions"
};

const minorityAdultThemes = [
  "attirance", "premiers_rendezvous", "crushs", "ex", "jalousie_fidelite",
  "preferences_intimes", "fantasmes_curiosites", "sextos_numerique",
  "sans_engagement", "limites_consentement", "compromettant", "communication_couple"
];

const minorityAdultThemeLabels = {
  attirance: "💘 Attirance & séduction",
  premiers_rendezvous: "🍸 Premiers rendez-vous",
  crushs: "😍 Crushs",
  ex: "🕰️ Ex & anciennes relations",
  jalousie_fidelite: "🫣 Jalousie & fidélité",
  preferences_intimes: "🛏️ Préférences intimes",
  fantasmes_curiosites: "💭 Fantasmes & curiosités",
  sextos_numerique: "📱 Sextos & vie numérique",
  sans_engagement: "🌙 Sans engagement",
  limites_consentement: "🛡️ Limites & consentement",
  compromettant: "😳 Situations compromettantes",
  communication_couple: "🗣️ Couple & communication"
};

const minorityIntensityLabels = {
  light: { icon: "🌶️", label: "Léger" },
  bold: { icon: "🔥", label: "Osé" },
  no_filter: { icon: "☢️", label: "Sans filtre" }
};

const AK_MINORITY_CUSTOM_KEY = "akgames_minority_custom_questions_v2";

function minorityNormalizeSelection(values, allowed) {
  if (!Array.isArray(values)) return [...allowed];
  return [...new Set(values.filter(value => allowed.includes(value)))];
}

function loadMinorityCustomQuestions() {
  try {
    const parsed = JSON.parse(localStorage.getItem(AK_MINORITY_CUSTOM_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(item => item && item.question && Array.isArray(item.options) && item.options.length === 3).map((item, index) => ({
      id: String(item.id || `minority_custom_${index}_${Date.now()}`),
      question: String(item.question).trim(),
      options: item.options.map(option => String(option || "").trim()).slice(0, 3),
      theme: "personnalise",
      category: item.adult ? "adult" : "classic",
      adult: Boolean(item.adult),
      intensity: item.adult && minorityIntensityLabels[item.intensity] ? item.intensity : "light",
      custom: true
    })).filter(item => item.question && item.options.every(Boolean));
  } catch {
    return [];
  }
}

function saveMinorityCustomQuestions(items) {
  try {
    localStorage.setItem(AK_MINORITY_CUSTOM_KEY, JSON.stringify(items || []));
  } catch {
    alert("Les questions personnalisées n’ont pas pu être enregistrées sur cet appareil.");
  }
}

function createMinorityCustomQuestion({ question, options, adult = false, intensity = "light" } = {}) {
  const cleanQuestion = String(question || "").trim().replace(/\s+/g, " ");
  const cleanOptions = (Array.isArray(options) ? options : []).map(value => String(value || "").trim().replace(/\s+/g, " "));
  if (!cleanQuestion || cleanOptions.length !== 3 || cleanOptions.some(value => !value)) return null;
  if (new Set(cleanOptions.map(value => value.toLocaleLowerCase("fr"))).size !== 3) return null;
  return {
    id: `minority_custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    question: /[?!.…]$/.test(cleanQuestion) ? cleanQuestion : `${cleanQuestion}…`,
    options: cleanOptions,
    theme: "personnalise",
    category: adult ? "adult" : "classic",
    adult: Boolean(adult),
    intensity: adult && minorityIntensityLabels[intensity] ? intensity : "light",
    custom: true
  };
}

function selectBalancedMinorityItems(pool, count, namespace) {
  const safePool = Array.isArray(pool) ? pool.filter(Boolean) : [];
  const limit = Math.min(Math.max(0, Number(count || 0)), safePool.length);
  if (!limit) return [];
  const groups = safePool.reduce((result, item) => {
    const key = item.custom
      ? `custom:${item.adult ? item.intensity : "classic"}`
      : item.adult
        ? `adult:${item.theme || "autre"}:${item.intensity || "light"}`
        : `classic:${item.theme || "autre"}`;
    (result[key] ||= []).push(item);
    return result;
  }, {});
  const keys = shuffleArray(Object.keys(groups));
  const base = Math.floor(limit / Math.max(1, keys.length));
  const extra = limit % Math.max(1, keys.length);
  let selected = [];
  keys.forEach((key, index) => {
    const quota = Math.min(groups[key].length, base + (index < extra ? 1 : 0));
    if (quota > 0) selected.push(...selectFreshItems(groups[key], quota, `${namespace}:${key}`));
  });
  if (selected.length < limit) {
    const used = new Set(selected.map(item => item.id));
    const remaining = safePool.filter(item => !used.has(item.id));
    selected.push(...selectFreshItems(remaining, Math.min(limit - selected.length, remaining.length), `${namespace}:extra`));
  }
  return shuffleArray(selected).slice(0, limit);
}

function minorityThemeLabel(item) {
  if (item?.custom) return minorityClassicThemeLabels.personnalise;
  return item?.adult
    ? (minorityAdultThemeLabels[item.theme] || "🔞 Adulte")
    : (minorityClassicThemeLabels[item?.theme] || "🪩 Minorité");
}

function minorityBadges(item) {
  const intensity = item?.adult ? minorityIntensityLabels[item.intensity] : null;
  return `<div class="minority-question-badges"><span>${escapeHtml(minorityThemeLabel(item))}</span>${intensity ? `<span class="minority-intensity minority-intensity-${item.intensity}">${intensity.icon} ${escapeHtml(intensity.label)}</span>` : ""}${item?.custom ? `<span>✍️ Personnalisée</span>` : ""}</div>`;
}

function minorityTopPlayers(stats) {
  const values = state.players.map(player => ({ player, value: Number(stats?.[player.id] || 0) }));
  const max = Math.max(0, ...values.map(row => row.value));
  return { max, players: max > 0 ? values.filter(row => row.value === max).map(row => row.player) : [] };
}

function minorityAwardMarkup(icon, label, top, suffix) {
  if (!top?.players?.length || !top.max) return "";
  return `<article><span>${icon}</span><div><small>${escapeHtml(label)}</small><strong>${top.players.map(player => escapeHtml(player.name)).join(" · ")}</strong><p>${top.max} ${escapeHtml(suffix)}</p></div></article>`;
}

resetMinorityState = function (config = {}) {
  const customQuestions = loadMinorityCustomQuestions();
  state.minorityGame = {
    roundCount: Math.max(3, Math.min(100, Number(config.roundCount || 10))),
    includeAdult: Boolean(config.includeAdult),
    classicThemes: minorityNormalizeSelection(config.classicThemes, minorityClassicThemes),
    adultThemes: minorityNormalizeSelection(config.adultThemes, minorityAdultThemes),
    adultIntensities: minorityNormalizeSelection(config.adultIntensities, Object.keys(minorityIntensityLabels)),
    customQuestions,
    includeCustom: config.includeCustom !== false && customQuestions.length > 0,
    items: [],
    currentIndex: 0,
    currentVoterIndex: 0,
    votes: {},
    scores: Object.fromEntries(state.players.map(player => [player.id, 0])),
    stats: {
      minority: Object.fromEntries(state.players.map(player => [player.id, 0])),
      solo: Object.fromEntries(state.players.map(player => [player.id, 0])),
      majority: Object.fromEntries(state.players.map(player => [player.id, 0]))
    },
    rounds: []
  };
};

function minoritySetupCustomMarkup(game, { readOnly = false, prefix = "" } = {}) {
  const customCount = game.customQuestions.length;
  const id = value => `${prefix}${value}`;
  return `<section class="card minority-custom-card"><h2 class="section-title">✍️ Vos propres questions</h2><p class="helper">Écris une question et trois options. Elles restent enregistrées sur cet appareil.</p>
    <div class="form-group top-gap"><label for="${id("MinorityCustomQuestion")}">Question</label><input id="${id("MinorityCustomQuestion")}" class="text-input" maxlength="220" placeholder="Pour une soirée parfaite, tu choisis…" ${readOnly ? "disabled" : ""}></div>
    <div class="minority-custom-options top-gap"><input id="${id("MinorityCustomA")}" class="text-input" maxlength="80" placeholder="Option A" ${readOnly ? "disabled" : ""}><input id="${id("MinorityCustomB")}" class="text-input" maxlength="80" placeholder="Option B" ${readOnly ? "disabled" : ""}><input id="${id("MinorityCustomC")}" class="text-input" maxlength="80" placeholder="Option C" ${readOnly ? "disabled" : ""}></div>
    ${state.adult ? `<div class="minority-custom-meta top-gap"><label class="form-group"><span>Type</span><select id="${id("MinorityCustomType")}" class="text-input" ${readOnly ? "disabled" : ""}><option value="classic">Classique</option><option value="adult">Adulte</option></select></label><label class="form-group"><span>Intensité adulte</span><select id="${id("MinorityCustomIntensity")}" class="text-input" ${readOnly ? "disabled" : ""}>${Object.entries(minorityIntensityLabels).map(([key, meta]) => `<option value="${key}">${meta.icon} ${meta.label}</option>`).join("")}</select></label></div>` : ""}
    ${readOnly ? "" : `<button id="${id("AddMinorityCustom")}" class="secondary-btn full top-gap">Ajouter cette question</button>`}
    <label class="option-card top-gap ${customCount ? "" : "disabled-option"}"><input id="${id("IncludeMinorityCustom")}" type="checkbox" ${game.includeCustom && customCount ? "checked" : ""} ${customCount && !readOnly ? "" : "disabled"}><span><strong>Inclure mes questions (${customCount})</strong><br><span class="helper">Mélangées aux cartes officielles.</span></span></label>
    ${customCount ? `<details class="top-gap"><summary>Gérer mes questions</summary><div class="stacked-choice top-gap">${game.customQuestions.map(item => `<div class="option-card mini-option minority-custom-row"><span><strong>${item.adult ? "🔞" : "🪩"} ${escapeHtml(item.question)}</strong><small>${item.options.map(escapeHtml).join(" · ")}</small></span>${readOnly ? "" : `<button class="secondary-btn" data-remove-minority-custom="${item.id}">Supprimer</button>`}</div>`).join("")}</div></details>` : ""}
  </section>`;
}

function bindMinorityCustomControls(game, { prefix = "", rerender = renderMinoritySetup } = {}) {
  const id = value => `#${prefix}${value}`;
  document.querySelector(id("IncludeMinorityCustom"))?.addEventListener("change", event => { game.includeCustom = event.target.checked; });
  document.querySelector(id("AddMinorityCustom"))?.addEventListener("click", () => {
    const adult = document.querySelector(id("MinorityCustomType"))?.value === "adult";
    const item = createMinorityCustomQuestion({
      question: document.querySelector(id("MinorityCustomQuestion"))?.value,
      options: [
        document.querySelector(id("MinorityCustomA"))?.value,
        document.querySelector(id("MinorityCustomB"))?.value,
        document.querySelector(id("MinorityCustomC"))?.value
      ],
      adult,
      intensity: document.querySelector(id("MinorityCustomIntensity"))?.value || "light"
    });
    if (!item) return alert("Ajoute une question et trois options différentes.");
    const duplicate = game.customQuestions.some(existing => existing.question.toLocaleLowerCase("fr") === item.question.toLocaleLowerCase("fr"));
    if (duplicate) return alert("Cette question existe déjà dans tes cartes personnalisées.");
    game.customQuestions.push(item);
    game.includeCustom = true;
    saveMinorityCustomQuestions(game.customQuestions);
    rerender();
  });
  document.querySelectorAll("[data-remove-minority-custom]").forEach(button => button.addEventListener("click", () => {
    game.customQuestions = game.customQuestions.filter(item => item.id !== button.dataset.removeMinorityCustom);
    if (!game.customQuestions.length) game.includeCustom = false;
    saveMinorityCustomQuestions(game.customQuestions);
    rerender();
  }));
}

function ensureMinorityGameConfig(game) {
  if (!game) return null;
  game.roundCount = Math.max(3, Math.min(100, Number(game.roundCount || 10)));
  game.includeAdult = Boolean(game.includeAdult);
  game.classicThemes = minorityNormalizeSelection(game.classicThemes, minorityClassicThemes);
  game.adultThemes = minorityNormalizeSelection(game.adultThemes, minorityAdultThemes);
  game.adultIntensities = minorityNormalizeSelection(game.adultIntensities, Object.keys(minorityIntensityLabels));
  game.customQuestions = Array.isArray(game.customQuestions) ? game.customQuestions : loadMinorityCustomQuestions();
  game.includeCustom = game.includeCustom !== false && game.customQuestions.length > 0;
  return game;
}

renderMinoritySetup = function () {
  if (!state.minorityGame) resetMinorityState();
  const game = state.minorityGame?.classicThemes ? state.minorityGame : ensureMinorityGameConfig(state.minorityGame);
  title.textContent = "Minorité";
  setBackVisible(true);
  screen.innerHTML = `
    <section class="game-cover game-cover-minority"><span class="game-cover-icon">🪩</span><div><small>CONNEXION & SECRETS</small><h2>Minorité</h2><p>Trois choix secrets. Le plus petit camp marque, et l’électron vraiment solitaire marque double.</p></div></section>
    <section class="card"><h2 class="section-title">Nombre de questions</h2><div class="choice-row">${[5,10,20,40,60,100].map(value => `<button class="choice-pill ${game.roundCount === value ? "active" : ""}" data-minority-count="${value}">${value}</button>`).join("")}</div><div class="form-group top-gap"><label for="minorityCustomCount">Personnalisé, de 3 à 100</label><input id="minorityCustomCount" class="text-input" type="number" min="3" max="100" value="${game.roundCount}"></div></section>
    <section class="card"><h2 class="section-title">Thèmes classiques</h2><div class="check-grid top-gap">${minorityClassicThemes.map(theme => `<label class="option-card mini-option"><input type="checkbox" data-minority-classic-theme="${theme}" ${game.classicThemes.includes(theme) ? "checked" : ""}><span><strong>${minorityClassicThemeLabels[theme]}</strong></span></label>`).join("")}</div><div class="toolbar top-gap"><button id="selectAllMinorityClassic" class="secondary-btn">Tout sélectionner</button><button id="clearAllMinorityClassic" class="secondary-btn">Tout désélectionner</button></div></section>
    ${state.adult ? `<label class="option-card premium-toggle"><input id="minorityAdult" type="checkbox" ${game.includeAdult ? "checked" : ""}><span><strong>🔞 Ajouter Minorité adulte</strong><br><span class="helper">250 cartes, avec thèmes et intensités séparés.</span></span></label>` : ""}
    ${state.adult && game.includeAdult ? `<section class="card minority-adult-settings"><h2 class="section-title">Thèmes adultes</h2><div class="check-grid top-gap">${minorityAdultThemes.map(theme => `<label class="option-card mini-option"><input type="checkbox" data-minority-adult-theme="${theme}" ${game.adultThemes.includes(theme) ? "checked" : ""}><span><strong>${minorityAdultThemeLabels[theme]}</strong></span></label>`).join("")}</div><div class="toolbar top-gap"><button id="selectAllMinorityAdult" class="secondary-btn">Tout sélectionner</button><button id="clearAllMinorityAdult" class="secondary-btn">Tout désélectionner</button></div><h3 class="section-title top-gap">Intensités</h3><div class="choice-row">${Object.entries(minorityIntensityLabels).map(([key, meta]) => `<button class="choice-pill ${game.adultIntensities.includes(key) ? "active" : ""}" data-minority-intensity="${key}">${meta.icon} ${meta.label}</button>`).join("")}</div></section>` : ""}
    ${minoritySetupCustomMarkup(game)}
    <div class="notice"><strong>Barème :</strong> seul sur une option minoritaire = 2 points · plusieurs sur le plus petit camp = 1 point chacun · égalité parfaite = 0.</div>
    <button id="startMinority" class="primary-btn full">Entrer dans la minorité</button>`;

  document.querySelectorAll("[data-minority-count]").forEach(button => button.addEventListener("click", () => { game.roundCount = Number(button.dataset.minorityCount); renderMinoritySetup(); }));
  document.querySelector("#minorityCustomCount")?.addEventListener("input", event => { game.roundCount = Math.max(3, Math.min(100, Number(event.target.value) || 3)); });
  document.querySelectorAll("[data-minority-classic-theme]").forEach(input => input.addEventListener("change", () => {
    const theme = input.dataset.minorityClassicTheme;
    game.classicThemes = input.checked ? [...new Set([...game.classicThemes, theme])] : game.classicThemes.filter(value => value !== theme);
  }));
  document.querySelector("#selectAllMinorityClassic")?.addEventListener("click", () => { game.classicThemes = [...minorityClassicThemes]; renderMinoritySetup(); });
  document.querySelector("#clearAllMinorityClassic")?.addEventListener("click", () => { game.classicThemes = []; renderMinoritySetup(); });
  document.querySelector("#minorityAdult")?.addEventListener("change", event => { game.includeAdult = event.target.checked; renderMinoritySetup(); });
  document.querySelectorAll("[data-minority-adult-theme]").forEach(input => input.addEventListener("change", () => {
    const theme = input.dataset.minorityAdultTheme;
    game.adultThemes = input.checked ? [...new Set([...game.adultThemes, theme])] : game.adultThemes.filter(value => value !== theme);
  }));
  document.querySelector("#selectAllMinorityAdult")?.addEventListener("click", () => { game.adultThemes = [...minorityAdultThemes]; renderMinoritySetup(); });
  document.querySelector("#clearAllMinorityAdult")?.addEventListener("click", () => { game.adultThemes = []; renderMinoritySetup(); });
  document.querySelectorAll("[data-minority-intensity]").forEach(button => button.addEventListener("click", () => {
    const intensity = button.dataset.minorityIntensity;
    const next = game.adultIntensities.includes(intensity) ? game.adultIntensities.filter(value => value !== intensity) : [...game.adultIntensities, intensity];
    if (!next.length) return alert("Garde au moins une intensité adulte.");
    game.adultIntensities = next;
    renderMinoritySetup();
  }));
  bindMinorityCustomControls(game);
  document.querySelector("#startMinority")?.addEventListener("click", startMinorityGame);
};

function buildMinorityPool(classic, adult, game) {
  const classicThemes = new Set(game.classicThemes || []);
  const adultThemes = new Set(game.adultThemes || []);
  const intensities = new Set(game.adultIntensities || []);
  const officialClassic = (Array.isArray(classic) ? classic : []).filter(item => classicThemes.has(item.theme));
  const officialAdult = game.includeAdult
    ? (Array.isArray(adult) ? adult : []).filter(item => adultThemes.has(item.theme) && intensities.has(item.intensity))
    : [];
  const custom = game.includeCustom
    ? (game.customQuestions || []).filter(item => !item.adult || (game.includeAdult && intensities.has(item.intensity)))
    : [];
  return [...officialClassic, ...officialAdult, ...custom];
}

startMinorityGame = async function () {
  const game = ensureMinorityGameConfig(state.minorityGame);
  if (!game.classicThemes.length && !(game.includeAdult && game.adultThemes.length) && !(game.includeCustom && game.customQuestions.length)) return alert("Choisis au moins un thème ou active une question personnalisée.");
  screen.innerHTML = `<div class="notice">Préparation du scrutin et mélange des thèmes…</div>`;
  try {
    const classic = await loadJsonFile("data/minorite.json", "Impossible de charger les questions de Minorité.");
    const adult = state.adult && game.includeAdult ? await loadJsonFile("data/minorite-adulte.json", "Impossible de charger les questions adultes.") : [];
    const pool = buildMinorityPool(classic, adult, game);
    if (!pool.length) throw new Error("Aucune question ne correspond aux thèmes et intensités choisis.");
    const memoryKey = `solo:minority-v2:${game.classicThemes.join("-")}:${game.includeAdult}:${game.adultThemes.join("-")}:${game.adultIntensities.join("-")}:${game.includeCustom}`;
    game.items = selectBalancedMinorityItems(pool, Math.min(game.roundCount, pool.length), memoryKey);
    game.currentIndex = 0;
    game.currentVoterIndex = 0;
    game.votes = {};
    game.rounds = [];
    game.scores = Object.fromEntries(state.players.map(player => [player.id, 0]));
    game.stats = {
      minority: Object.fromEntries(state.players.map(player => [player.id, 0])),
      solo: Object.fromEntries(state.players.map(player => [player.id, 0])),
      majority: Object.fromEntries(state.players.map(player => [player.id, 0]))
    };
    renderMinorityGate();
  } catch (error) {
    console.error(error);
    alert(error.message || "Impossible de lancer Minorité.");
    renderMinoritySetup();
  }
};

renderMinorityVote = function () {
  const game = state.minorityGame;
  const item = game.items[game.currentIndex];
  title.textContent = item.adult ? "Minorité adulte" : "Minorité";
  screen.innerHTML = `
    ${renderV08Progress(game.currentIndex + 1, game.items.length, "Question")}
    <section class="v08-question-card minority-question-card">${minorityBadges(item)}<span>🪩</span><small>CHOISIS TA VOIE</small><h2>${escapeHtml(item.question)}</h2></section>
    <section class="minority-choice-grid">${item.options.map((option, index) => `<button class="minority-choice" data-minority-vote="${index}"><small>OPTION ${String.fromCharCode(65 + index)}</small><strong>${escapeHtml(option)}</strong></button>`).join("")}</section>`;
  document.querySelectorAll("[data-minority-vote]").forEach(button => button.addEventListener("click", () => {
    const player = state.players[game.currentVoterIndex];
    game.votes[player.id] = Number(button.dataset.minorityVote);
    game.currentVoterIndex += 1;
    renderMinorityGate();
  }));
};

calculateMinorityRound = function (game) {
  const item = game.items[game.currentIndex];
  const counts = item.options.map((_, index) => Object.values(game.votes).filter(value => Number(value) === index).length);
  const positive = counts.filter(value => value > 0);
  const equalAmongChosen = positive.length <= 1 || new Set(positive).size === 1;
  const minPositive = positive.length ? Math.min(...positive) : 0;
  const maxPositive = positive.length ? Math.max(...positive) : 0;
  const minorityOptions = equalAmongChosen ? [] : counts.map((count, index) => count === minPositive && count > 0 ? index : null).filter(index => index !== null);
  const majorityOptions = equalAmongChosen ? [] : counts.map((count, index) => count === maxPositive && count > minPositive ? index : null).filter(index => index !== null);
  const winnerIds = [];
  const pointsByPlayer = {};
  Object.entries(game.votes).forEach(([id, rawChoice]) => {
    const choice = Number(rawChoice);
    if (minorityOptions.includes(choice)) {
      const points = counts[choice] === 1 ? 2 : 1;
      winnerIds.push(id);
      pointsByPlayer[id] = points;
      game.scores[id] = Number(game.scores[id] || 0) + points;
      game.stats.minority[id] = Number(game.stats.minority[id] || 0) + 1;
      if (points === 2) game.stats.solo[id] = Number(game.stats.solo[id] || 0) + 1;
    } else pointsByPlayer[id] = 0;
    if (majorityOptions.includes(choice)) game.stats.majority[id] = Number(game.stats.majority[id] || 0) + 1;
  });
  return { counts, minorityOptions, majorityOptions, winnerIds, pointsByPlayer };
};

renderMinorityReveal = function () {
  const game = state.minorityGame;
  const item = game.items[game.currentIndex];
  const result = calculateMinorityRound(game);
  game.rounds.push({ itemId: item.id, votes: { ...game.votes }, ...result });
  const soloWinners = result.winnerIds.filter(id => Number(result.pointsByPlayer[id] || 0) === 2);
  title.textContent = result.winnerIds.length ? "La minorité gagne" : "Aucun petit camp";
  setBackVisible(false);
  screen.innerHTML = `
    <section class="reveal-stage reveal-v07 minority-reveal">${minorityBadges(item)}<span class="game-cover-icon">🪩</span><h2>${soloWinners.length ? "Un électron libre marque double" : result.winnerIds.length ? "Le plus petit camp prend le point" : "Aucun camp minoritaire cette fois"}</h2><p>${escapeHtml(item.question)}</p></section>
    <section class="minority-results">${item.options.map((option, index) => `<article class="minority-result ${result.minorityOptions.includes(index) ? "winner" : result.majorityOptions.includes(index) ? "majority" : ""}"><div><small>OPTION ${String.fromCharCode(65 + index)}</small><strong>${escapeHtml(option)}</strong></div><span>${result.counts[index]} vote${result.counts[index] > 1 ? "s" : ""}</span></article>`).join("")}</section>
    <section class="poll-results-grid">${state.players.map(player => { const points = Number(result.pointsByPlayer[player.id] || 0); return `<article class="poll-result-person ${points === 2 ? "minority-solo-player" : ""}"><span>${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong><small>${escapeHtml(item.options[game.votes[player.id]])}</small>${points ? `<em>+${points} pt${points > 1 ? "s" : ""} ${points === 2 ? "solo" : "minorité"}</em>` : result.majorityOptions.includes(Number(game.votes[player.id])) ? `<small>dans la majorité</small>` : ""}</article>`; }).join("")}</section>
    ${state.alcohol && result.winnerIds.length ? `<div class="alcohol-callout">🍻 La majorité peut trinquer si elle en a envie. La minorité savoure sa victoire.</div>` : ""}
    <button id="nextMinorityRound" class="primary-btn full">${game.currentIndex + 1 >= game.items.length ? "Voir le classement" : "Question suivante"}</button>`;
  document.querySelector("#nextMinorityRound")?.addEventListener("click", () => {
    game.currentIndex += 1;
    game.currentVoterIndex = 0;
    game.votes = {};
    renderMinorityGate();
  });
};

renderMinorityEnd = function () {
  const game = state.minorityGame;
  const ranking = scoreRanking(game.scores);
  const minorityTop = minorityTopPlayers(game.stats.minority);
  const soloTop = minorityTopPlayers(game.stats.solo);
  const majorityTop = minorityTopPlayers(game.stats.majority);
  title.textContent = "Classement final";
  setBackVisible(false);
  screen.innerHTML = `
    <section class="winner-stage winner-stage-v07 v08-final-stage"><div class="winner-crown">🪩🏆</div><h2>Les électrons libres ont parlé</h2><p>Un point pour le plus petit camp, deux pour la personne seule sur son option.</p></section>
    <section class="final-ranking">${ranking.map((player, index) => `<div class="ranking-row"><span class="ranking-position">${index + 1}</span><span class="result-avatar">${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong><span>${Number(game.scores[player.id] || 0)} pts</span></div>`).join("")}</section>
    <section class="minority-final-awards">
      ${minorityAwardMarkup("🪩", "LE PLUS SOUVENT DANS LA MINORITÉ", minorityTop, `manche${minorityTop.max > 1 ? "s" : ""}`)}
      ${minorityAwardMarkup("🧍", "ÉLECTRON VRAIMENT LIBRE", soloTop, `victoire${soloTop.max > 1 ? "s" : ""} en solo`)}
      ${minorityAwardMarkup("👥", "AIMANT À MAJORITÉ", majorityTop, `manche${majorityTop.max > 1 ? "s" : ""}`)}
    </section>
    <div class="toolbar"><button id="replayMinority" class="secondary-btn">Rejouer</button><button id="otherMinority" class="primary-btn">Autre jeu</button></div>`;
  document.querySelector("#replayMinority")?.addEventListener("click", () => {
    resetMinorityState({
      roundCount: game.roundCount,
      includeAdult: game.includeAdult,
      classicThemes: game.classicThemes,
      adultThemes: game.adultThemes,
      adultIntensities: game.adultIntensities,
      includeCustom: game.includeCustom
    });
    renderMinoritySetup();
  });
  document.querySelector("#otherMinority")?.addEventListener("click", () => { state.minorityGame = null; renderPlayChoice(); });
};

/* =========================================================
   AK'GAMES V2.9 - MIME
   650 mimes, themes, difficultes, duos et cartes perso
   ========================================================= */

const AK_MIME_STORAGE_KEY = "akgames_custom_mimes_v1";

const akMimeThemes = [
  { id: "animaux", icon: "🐾", label: "Animaux" },
  { id: "metiers", icon: "👷", label: "Métiers" },
  { id: "sports", icon: "⚽", label: "Sports & activités" },
  { id: "quotidien", icon: "🏠", label: "Vie quotidienne" },
  { id: "emotions", icon: "😱", label: "Émotions & réactions" },
  { id: "culture_pop", icon: "🎬", label: "Films, séries & personnages" },
  { id: "musique", icon: "🎵", label: "Musique & scène" },
  { id: "objets", icon: "📦", label: "Objets & machines" },
  { id: "voyages", icon: "✈️", label: "Voyages & lieux" },
  { id: "catastrophes", icon: "💥", label: "Catastrophes" },
  { id: "absurde", icon: "🌀", label: "Absurde & impossible" },
  { id: "duo", icon: "🧑‍🤝‍🧑", label: "Mimes en duo" }
];

const akMimeDifficultyMeta = {
  easy: { icon: "🌱", label: "Facile", points: 1 },
  medium: { icon: "⚡", label: "Moyen", points: 2 },
  hard: { icon: "🔥", label: "Difficile", points: 3 }
};

function akMimeThemeMeta(id) {
  return akMimeThemes.find(theme => theme.id === id) || akMimeThemes[0];
}

function akMimeDifficulty(itemOrValue) {
  const value = typeof itemOrValue === "string" ? itemOrValue : itemOrValue?.difficulty;
  return akMimeDifficultyMeta[value] ? value : "easy";
}

function akMimePoints(item) {
  return akMimeDifficultyMeta[akMimeDifficulty(item)].points;
}

function akMimePackId(item) {
  return Number(item?.actors || 1) === 2 ? "duo" : (item?.category || "quotidien");
}

function akMimeLoadCustom() {
  try {
    const parsed = JSON.parse(localStorage.getItem(AK_MIME_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter(item => item && item.text) : [];
  } catch (error) {
    console.warn("Mimes personnalisés illisibles", error);
    return [];
  }
}

function akMimeSaveCustom(items) {
  localStorage.setItem(AK_MIME_STORAGE_KEY, JSON.stringify(Array.isArray(items) ? items : []));
}

function akMimeNormalizeThemes(values) {
  const valid = new Set(akMimeThemes.map(theme => theme.id));
  if (!Array.isArray(values)) return akMimeThemes.map(theme => theme.id);
  return [...new Set(values.filter(value => valid.has(value)))];
}

function akMimeNormalizeDifficulties(values) {
  const valid = new Set(Object.keys(akMimeDifficultyMeta));
  if (!Array.isArray(values)) return Object.keys(akMimeDifficultyMeta);
  return [...new Set(values.filter(value => valid.has(value)))];
}

function ensureMimeGameConfig(game = state.megaGame) {
  if (!game || game.gameName !== "Mime") return game;
  game.roundCount = Math.max(3, Math.min(100, Number(game.roundCount || 10)));
  game.durationSeconds = [30, 45, 60, 90].includes(Number(game.durationSeconds)) ? Number(game.durationSeconds) : 45;
  game.mimeThemes = akMimeNormalizeThemes(game.mimeThemes);
  if (state.players.length < 3) game.mimeThemes = game.mimeThemes.filter(theme => theme !== "duo");
  game.mimeDifficulties = akMimeNormalizeDifficulties(game.mimeDifficulties);
  game.mimeIncludeCustom = game.mimeIncludeCustom !== false;
  game.mimeStage = game.mimeStage || "handoff";
  game.mimeStats = game.mimeStats || {
    actorSuccess: Object.fromEntries(state.players.map(player => [player.id, 0])),
    guesserSuccess: Object.fromEntries(state.players.map(player => [player.id, 0]))
  };
  return game;
}

function akMimeBadges(item) {
  const theme = akMimeThemeMeta(akMimePackId(item));
  const difficulty = akMimeDifficultyMeta[akMimeDifficulty(item)];
  const actors = Number(item?.actors || 1);
  return `<div class="mime-badge-row"><span>${theme.icon} ${escapeHtml(theme.label)}</span><span>${difficulty.icon} ${escapeHtml(difficulty.label)} · ${difficulty.points} pt${difficulty.points > 1 ? "s" : ""}</span><span>${actors === 2 ? "🧑‍🤝‍🧑 Duo" : "🧍 Solo"}</span>${item?.custom ? `<span>✍️ Perso</span>` : ""}</div>`;
}

function akMimeCustomSetupMarkup(game, prefix = "mime") {
  const custom = akMimeLoadCustom();
  const soloThemes = akMimeThemes.filter(theme => theme.id !== "duo");
  return `
    <section class="card mime-custom-card">
      <div class="mime-section-heading"><div><small>TES PROPRES IDÉES</small><h3>Mimes personnalisés</h3></div><span>${custom.length}</span></div>
      <label class="option-card premium-toggle"><input id="${prefix}IncludeCustom" type="checkbox" ${game.mimeIncludeCustom ? "checked" : ""}><span><strong>Inclure mes mimes</strong><br><span class="helper">Ils restent enregistrés sur cet appareil.</span></span></label>
      <div class="mime-custom-form">
        <div class="form-group"><label for="${prefix}CustomText">Mime à faire deviner</label><textarea id="${prefix}CustomText" class="text-input" rows="3" maxlength="220" placeholder="Ex. Une personne qui essaie de monter un meuble sans notice"></textarea></div>
        <div class="mime-custom-grid">
          <div class="form-group"><label for="${prefix}CustomTheme">Thème</label><select id="${prefix}CustomTheme" class="text-input">${soloThemes.map(theme => `<option value="${theme.id}">${theme.icon} ${escapeHtml(theme.label)}</option>`).join("")}</select></div>
          <div class="form-group"><label for="${prefix}CustomDifficulty">Difficulté</label><select id="${prefix}CustomDifficulty" class="text-input">${Object.entries(akMimeDifficultyMeta).map(([id, meta]) => `<option value="${id}">${meta.icon} ${escapeHtml(meta.label)} · ${meta.points} pt${meta.points > 1 ? "s" : ""}</option>`).join("")}</select></div>
          <div class="form-group"><label for="${prefix}CustomActors">Nombre de mimeurs</label><select id="${prefix}CustomActors" class="text-input"><option value="1">🧍 Une personne</option><option value="2" ${state.players.length < 3 ? "disabled" : ""}>🧑‍🤝‍🧑 Deux personnes</option></select></div>
        </div>
        <button id="${prefix}AddCustom" class="secondary-btn full" type="button">＋ Ajouter ce mime</button>
      </div>
      ${custom.length ? `<div class="mime-custom-list">${custom.slice().reverse().map(item => {
        const theme = akMimeThemeMeta(akMimePackId(item));
        const difficulty = akMimeDifficultyMeta[akMimeDifficulty(item)];
        return `<article><div><small>${theme.icon} ${escapeHtml(theme.label)} · ${difficulty.icon} ${escapeHtml(difficulty.label)} · ${Number(item.actors || 1) === 2 ? "Duo" : "Solo"}</small><strong>${escapeHtml(item.text)}</strong></div><button type="button" data-${prefix}-delete-custom="${escapeHtml(item.id)}" aria-label="Supprimer ce mime">×</button></article>`;
      }).join("")}</div>` : `<p class="helper top-gap">Aucun mime personnel pour le moment.</p>`}
    </section>`;
}

function akMimeSetupMarkup(game, prefix = "mime") {
  ensureMimeGameConfig(game);
  const duoUnavailable = state.players.length < 3;
  return `
    <section class="card mime-setup-card">
      <div class="mime-section-heading"><div><small>FORMAT DE PARTIE</small><h3>Durée et nombre de manches</h3></div><span>650 cartes</span></div>
      <div class="choice-row mime-count-row">${[5, 10, 20, 40, 60, 100].map(value => `<button type="button" class="choice-pill ${game.roundCount === value ? "active" : ""}" data-${prefix}-count="${value}">${value}</button>`).join("")}</div>
      <div class="mime-custom-grid top-gap">
        <div class="form-group"><label for="${prefix}CustomCount">Nombre personnalisé</label><input id="${prefix}CustomCount" class="text-input" type="number" min="3" max="100" value="${game.roundCount}"></div>
        <div class="form-group"><label for="${prefix}Duration">Chronomètre</label><select id="${prefix}Duration" class="text-input">${[30, 45, 60, 90].map(value => `<option value="${value}" ${game.durationSeconds === value ? "selected" : ""}>${value} secondes</option>`).join("")}</select></div>
      </div>
    </section>
    <section class="card mime-theme-card">
      <div class="mime-section-heading"><div><small>PACKS DE MIMES</small><h3>Choisis un ou plusieurs thèmes</h3></div><span>${game.mimeThemes.length}/${akMimeThemes.length}</span></div>
      <div class="mime-theme-grid">${akMimeThemes.map(theme => {
        const active = game.mimeThemes.includes(theme.id);
        const disabled = theme.id === "duo" && duoUnavailable;
        return `<button type="button" class="mime-theme-option ${active ? "active" : ""}" data-${prefix}-theme="${theme.id}" aria-pressed="${active}" ${disabled ? "disabled" : ""}><span>${theme.icon}</span><strong>${escapeHtml(theme.label)}</strong><b>${active ? "✓" : "+"}</b></button>`;
      }).join("")}</div>
      <div class="toolbar top-gap"><button id="${prefix}AllThemes" class="secondary-btn" type="button">Tout sélectionner</button><button id="${prefix}NoThemes" class="secondary-btn" type="button">Tout désélectionner</button></div>
      ${duoUnavailable ? `<p class="helper top-gap">🧑‍🤝‍🧑 Les mimes en duo deviennent disponibles à partir de 3 joueurs, afin qu’une autre personne puisse deviner.</p>` : ""}
    </section>
    <section class="card mime-difficulty-card">
      <div class="mime-section-heading"><div><small>NIVEAUX</small><h3>Difficultés combinables</h3></div><span>1 à 3 pts</span></div>
      <div class="mime-difficulty-grid">${Object.entries(akMimeDifficultyMeta).map(([id, meta]) => `<button type="button" class="mime-difficulty-option ${game.mimeDifficulties.includes(id) ? "active" : ""}" data-${prefix}-difficulty="${id}" aria-pressed="${game.mimeDifficulties.includes(id)}"><span>${meta.icon}</span><strong>${escapeHtml(meta.label)}</strong><small>${meta.points} point${meta.points > 1 ? "s" : ""}</small></button>`).join("")}</div>
      <p class="helper top-gap">Le ou les mimeurs gagnent la valeur du niveau. La première personne qui devine gagne 1 point.</p>
    </section>
    ${akMimeCustomSetupMarkup(game, prefix)}`;
}

function akMimeBindSetup(game, prefix = "mime", rerender = renderMegaSetup) {
  document.querySelectorAll(`[data-${prefix}-count]`).forEach(button => button.addEventListener("click", () => {
    game.roundCount = Number(button.dataset[`${prefix}Count`]);
    rerender();
  }));
  document.querySelector(`#${prefix}CustomCount`)?.addEventListener("input", event => {
    game.roundCount = Math.max(3, Math.min(100, Number(event.target.value) || 3));
  });
  document.querySelector(`#${prefix}Duration`)?.addEventListener("change", event => { game.durationSeconds = Number(event.target.value); });
  document.querySelectorAll(`[data-${prefix}-theme]`).forEach(button => button.addEventListener("click", () => {
    const id = button.dataset[`${prefix}Theme`];
    game.mimeThemes = game.mimeThemes.includes(id) ? game.mimeThemes.filter(value => value !== id) : [...game.mimeThemes, id];
    rerender();
  }));
  document.querySelector(`#${prefix}AllThemes`)?.addEventListener("click", () => {
    game.mimeThemes = akMimeThemes.filter(theme => theme.id !== "duo" || state.players.length >= 3).map(theme => theme.id);
    rerender();
  });
  document.querySelector(`#${prefix}NoThemes`)?.addEventListener("click", () => { game.mimeThemes = []; rerender(); });
  document.querySelectorAll(`[data-${prefix}-difficulty]`).forEach(button => button.addEventListener("click", () => {
    const id = button.dataset[`${prefix}Difficulty`];
    game.mimeDifficulties = game.mimeDifficulties.includes(id) ? game.mimeDifficulties.filter(value => value !== id) : [...game.mimeDifficulties, id];
    rerender();
  }));
  document.querySelector(`#${prefix}IncludeCustom`)?.addEventListener("change", event => { game.mimeIncludeCustom = Boolean(event.target.checked); });
  document.querySelector(`#${prefix}AddCustom`)?.addEventListener("click", () => {
    const text = document.querySelector(`#${prefix}CustomText`)?.value?.trim();
    if (!text) return alert("Écris d’abord le mime à ajouter.");
    const category = document.querySelector(`#${prefix}CustomTheme`)?.value || "quotidien";
    const difficulty = document.querySelector(`#${prefix}CustomDifficulty`)?.value || "easy";
    const actors = Number(document.querySelector(`#${prefix}CustomActors`)?.value || 1);
    if (actors === 2 && state.players.length < 3) return alert("Il faut au moins 3 joueurs pour enregistrer un mime en duo dans cette partie.");
    const custom = akMimeLoadCustom();
    custom.push({ id: `mime_custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, text, category, difficulty, actors, custom: true });
    akMimeSaveCustom(custom);
    game.mimeIncludeCustom = true;
    rerender();
  });
  document.querySelectorAll(`[data-${prefix}-delete-custom]`).forEach(button => button.addEventListener("click", () => {
    const id = button.dataset[`${prefix}DeleteCustom`];
    akMimeSaveCustom(akMimeLoadCustom().filter(item => item.id !== id));
    rerender();
  }));
}

function akMimeFilterPool(pool, game) {
  const themes = new Set(game.mimeThemes || []);
  const difficulties = new Set(game.mimeDifficulties || []);
  return pool.filter(item => {
    if (Number(item.actors || 1) === 2 && state.players.length < 3) return false;
    return themes.has(akMimePackId(item)) && difficulties.has(akMimeDifficulty(item));
  });
}

function akMimeBalancedSelect(pool, count, historyKey) {
  const safeCount = Math.min(Math.max(0, Number(count || 0)), pool.length);
  const grouped = new Map();
  pool.forEach(item => {
    const key = `${akMimePackId(item)}:${akMimeDifficulty(item)}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  });
  const buckets = shuffleArray([...grouped.entries()]).map(([key, items]) => ({ key, items, quota: 0 }));
  let remaining = safeCount;
  while (remaining > 0) {
    let allocated = false;
    for (const bucket of buckets) {
      if (!remaining) break;
      if (bucket.quota < bucket.items.length) {
        bucket.quota += 1;
        remaining -= 1;
        allocated = true;
      }
    }
    if (!allocated) break;
  }
  const result = buckets.flatMap(bucket => selectFreshItems(bucket.items, bucket.quota, `${historyKey}:${bucket.key}`));
  return shuffleArray(result).slice(0, safeCount);
}

function akMimeAssignActors(items, players = state.players) {
  const ids = players.map(player => player.id);
  const soloOrder = shuffleArray([...ids]);
  const pairs = shuffleArray(ids.flatMap((id, index) => ids.slice(index + 1).map(other => [id, other])));
  let soloIndex = 0;
  let pairIndex = 0;
  return items.map(item => {
    const actors = Number(item.actors || 1) === 2 && ids.length >= 3 ? 2 : 1;
    let actorIds;
    if (actors === 2) {
      actorIds = pairs[pairIndex % Math.max(1, pairs.length)] || ids.slice(0, 2);
      pairIndex += 1;
    } else {
      actorIds = [soloOrder[soloIndex % Math.max(1, soloOrder.length)] || ids[0]];
      soloIndex += 1;
    }
    return { ...item, actors, actorIds: [...actorIds], leadPlayerId: actorIds[0] };
  });
}

function akMimeActors(item) {
  return (item?.actorIds || []).map(id => state.players.find(player => player.id === id)).filter(Boolean);
}

function akMimeActorNames(item) {
  return akMimeActors(item).map(player => player.name).join(" et ");
}

function akMimeActorCards(item) {
  return akMimeActors(item).map(player => `<article><span>${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong></article>`).join("");
}

function akMimeCompleteRound(success, guesserId = null, timedOut = false) {
  const game = ensureMimeGameConfig();
  const item = game.items[game.currentIndex];
  const points = success ? akMimePoints(item) : 0;
  const actorIds = item.actorIds || [];
  if (success) {
    actorIds.forEach(id => {
      game.scores[id] = Number(game.scores[id] || 0) + points;
      game.mimeStats.actorSuccess[id] = Number(game.mimeStats.actorSuccess[id] || 0) + 1;
    });
    if (guesserId && !actorIds.includes(guesserId)) {
      game.scores[guesserId] = Number(game.scores[guesserId] || 0) + 1;
      game.mimeStats.guesserSuccess[guesserId] = Number(game.mimeStats.guesserSuccess[guesserId] || 0) + 1;
    }
  }
  game.currentResult = { itemId: item.id, success, timedOut, actorIds: [...actorIds], guesserId, points };
  game.rounds.push({ ...game.currentResult, text: item.text, difficulty: item.difficulty });
  game.mimeStage = "result";
  renderMegaTurn();
}

function akMimeRenderHandoff(game, item) {
  const actors = akMimeActors(item);
  screen.innerHTML = `
    ${v014Progress(game, "Mime")}
    <section class="handoff-stage handoff-v07 mime-handoff"><div class="mime-actor-row">${actors.map(player => `<span>${avatarById(player.avatarId).emoji}</span>`).join("")}</div><span class="category-chip">${Number(item.actors || 1) === 2 ? "MIME EN DUO" : "MIME SOLO"}</span><h2>${escapeHtml(akMimeActorNames(item))}</h2><p>${Number(item.actors || 1) === 2 ? "Donnez le téléphone aux deux mimeurs. Le reste du groupe ne doit pas voir le sujet." : `Donnez le téléphone à ${escapeHtml(actors[0]?.name || "la personne")}. Le groupe ne doit pas voir le sujet.`}</p><button id="mimeOpenPrivate" class="primary-btn">Afficher le mime</button></section>`;
  document.querySelector("#mimeOpenPrivate")?.addEventListener("click", () => { game.mimeStage = "private"; renderMegaTurn(); });
}

function akMimeRenderPrivate(game, item) {
  screen.innerHTML = `
    ${v014Progress(game, "Mime")}
    <section class="mime-private-card">${akMimeBadges(item)}<span class="mime-private-icon">🤫</span><small>À MÉMORISER EN SECRET</small><h2>${escapeHtml(item.text)}</h2><p>Interdiction de parler, d’écrire des lettres ou de montrer directement un objet qui donne la réponse.</p></section>
    <button id="mimeStartRound" class="primary-btn full">J’ai mémorisé · Lancer le chrono</button>`;
  document.querySelector("#mimeStartRound")?.addEventListener("click", () => { game.mimeStage = "playing"; renderMegaTurn(); });
}

function akMimeRenderPlaying(game, item) {
  const actors = akMimeActors(item);
  screen.innerHTML = `
    ${v014Progress(game, "Mime")}
    <section class="mime-playing-card">
      ${akMimeBadges(item)}
      <div class="mime-live-icon">🎭</div>
      <small>À VOUS DE DEVINER</small>
      <h2>${escapeHtml(akMimeActorNames(item))} ${actors.length > 1 ? "miment ensemble" : "mime"}</h2>
      <div class="mime-performer-row">${akMimeActorCards(item)}</div>
      <div class="mega-mini-timer mime-timer"><strong id="v014Countdown">${game.durationSeconds}</strong><span>secondes</span><div class="progress-track"><div id="v014TimerFill" class="progress-fill" style="width:100%"></div></div></div>
      <p>Pas de parole, pas de lettres dessinées et pas de mot de la même famille.</p>
    </section>
    <section class="decision-grid"><button id="mimeFound" class="primary-btn">✅ Trouvé !</button><button id="mimeSkip" class="secondary-btn">Passer</button></section>`;
  document.querySelector("#mimeFound")?.addEventListener("click", () => { clearV014Timer(); game.mimeStage = "guesser"; renderMegaTurn(); });
  document.querySelector("#mimeSkip")?.addEventListener("click", () => { clearV014Timer(); akMimeCompleteRound(false, null, false); });
  startV014Timer(Date.now() + game.durationSeconds * 1000, "#v014Countdown", () => akMimeCompleteRound(false, null, true), game.durationSeconds);
}

function akMimeRenderGuesser(game, item) {
  const actorSet = new Set(item.actorIds || []);
  const candidates = state.players.filter(player => !actorSet.has(player.id));
  screen.innerHTML = `
    ${v014Progress(game, "Mime")}
    <section class="mime-guesser-card"><span>🔔</span><small>PREMIÈRE BONNE RÉPONSE</small><h2>Qui a trouvé le mime ?</h2><p>Cette personne gagne 1 point. ${escapeHtml(akMimeActorNames(item))} ${Number(item.actors || 1) === 2 ? "gagnent" : "gagne"} ${akMimePoints(item)} point${akMimePoints(item) > 1 ? "s" : ""}.</p></section>
    <section class="mime-guesser-grid">${candidates.map(player => `<button type="button" data-mime-guesser="${player.id}"><span>${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong><small>+1 point</small></button>`).join("")}</section>
    <button id="mimeNoGuesser" class="secondary-btn full">Personne en particulier</button>`;
  document.querySelectorAll("[data-mime-guesser]").forEach(button => button.addEventListener("click", () => akMimeCompleteRound(true, button.dataset.mimeGuesser, false)));
  document.querySelector("#mimeNoGuesser")?.addEventListener("click", () => akMimeCompleteRound(true, null, false));
}

function akMimeRenderResult(game, item) {
  const result = game.currentResult || {};
  const guesser = state.players.find(player => player.id === result.guesserId);
  screen.innerHTML = `
    ${v014Progress(game, "Mime")}
    <section class="reveal-stage reveal-v07 mime-result-card"><span class="game-cover-icon">${result.success ? "🎉" : result.timedOut ? "⏱️" : "↪️"}</span>${akMimeBadges(item)}<h2>${result.success ? "Mime trouvé !" : result.timedOut ? "Temps écoulé" : "Mime passé"}</h2><p>${escapeHtml(item.text)}</p></section>
    <section class="mime-result-summary">
      <article><span>${Number(item.actors || 1) === 2 ? "🧑‍🤝‍🧑" : "🎭"}</span><strong>${escapeHtml(akMimeActorNames(item))}</strong><small>${result.success ? `+${result.points} point${result.points > 1 ? "s" : ""} ${Number(item.actors || 1) === 2 ? "chacun" : ""}` : "0 point"}</small></article>
      ${result.success ? `<article><span>🔎</span><strong>${guesser ? escapeHtml(guesser.name) : "Réponse collective"}</strong><small>${guesser ? "+1 point" : "Aucun point de devinette attribué"}</small></article>` : ""}
    </section>
    <button id="mimeNext" class="primary-btn full">${game.currentIndex + 1 >= game.items.length ? "Voir le classement" : "Mime suivant"}</button>`;
  document.querySelector("#mimeNext")?.addEventListener("click", () => {
    game.currentIndex += 1;
    game.mimeStage = "handoff";
    game.currentResult = null;
    renderMegaCurrent();
  });
}

if (V014_GAME_CONFIGS?.Mime) {
  V014_GAME_CONFIGS.Mime.icon = "🎭";
  V014_GAME_CONFIGS.Mime.description = "Mimes solo ou en duo, classés par thème et difficulté, avec un point bonus pour la première bonne réponse.";
  V014_GAME_CONFIGS.Mime.defaultRounds = 10;
  if (typeof V014_GAME_ICONS === "object") V014_GAME_ICONS["Mime"] = "🎭";
}

const akMimeBaseResetMegaGame = resetMegaGame;
resetMegaGame = function (gameName, replayConfig = {}) {
  akMimeBaseResetMegaGame(gameName, replayConfig);
  if (gameName !== "Mime" || !state.megaGame) return;
  state.megaGame.mimeThemes = akMimeNormalizeThemes(replayConfig.mimeThemes);
  state.megaGame.mimeDifficulties = akMimeNormalizeDifficulties(replayConfig.mimeDifficulties);
  state.megaGame.mimeIncludeCustom = replayConfig.mimeIncludeCustom !== false;
  ensureMimeGameConfig(state.megaGame);
};

const akMimeBaseRenderMegaSetup = renderMegaSetup;
renderMegaSetup = function () {
  const game = state.megaGame;
  if (!game || game.gameName !== "Mime") return akMimeBaseRenderMegaSetup();
  ensureMimeGameConfig(game);
  clearV014Timer();
  title.textContent = "Mime";
  setBackVisible(true);
  screen.innerHTML = `
    <section class="game-cover game-cover-mega mime-cover"><span class="game-cover-icon">🎭</span><div><small>DÉFIS & PERFORMANCE</small><h2>Mime</h2><p>Fais deviner sans parler. Les mimes difficiles rapportent davantage et certains se jouent à deux.</p></div></section>
    ${akMimeSetupMarkup(game, "mime")}
    <button id="startMegaGame" class="primary-btn full">Lancer la partie de Mime</button>`;
  akMimeBindSetup(game, "mime", renderMegaSetup);
  document.querySelector("#startMegaGame")?.addEventListener("click", startMegaGame);
};

const akMimeBaseStartMegaGame = startMegaGame;
startMegaGame = async function () {
  const game = state.megaGame;
  if (!game || game.gameName !== "Mime") return akMimeBaseStartMegaGame();
  ensureMimeGameConfig(game);
  if (!game.mimeThemes.length) return alert("Sélectionne au moins un thème.");
  if (!game.mimeDifficulties.length) return alert("Sélectionne au moins une difficulté.");
  screen.innerHTML = `<div class="notice">Préparation des mimes…</div>`;
  try {
    let pool = await loadJsonFile("data/mime.json", "Impossible de charger les mimes.");
    if (game.mimeIncludeCustom) pool = pool.concat(akMimeLoadCustom().map(item => ({ ...item, custom: true })));
    pool = akMimeFilterPool(pool, game);
    if (!pool.length) throw new Error("Aucun mime ne correspond à ces filtres.");
    const selected = akMimeBalancedSelect(pool, Math.min(game.roundCount, pool.length), `solo:mime:${game.mimeThemes.join("-")}:${game.mimeDifficulties.join("-")}`);
    game.items = akMimeAssignActors(selected);
    game.currentIndex = 0;
    game.scores = v014ScoreMap();
    game.rounds = [];
    game.mimeStage = "handoff";
    game.currentResult = null;
    game.mimeStats = {
      actorSuccess: Object.fromEntries(state.players.map(player => [player.id, 0])),
      guesserSuccess: Object.fromEntries(state.players.map(player => [player.id, 0]))
    };
    renderMegaCurrent();
  } catch (error) {
    console.error(error);
    alert(error.message || "Impossible de lancer Mime.");
    renderMegaSetup();
  }
};

const akMimeBaseRenderMegaTurn = renderMegaTurn;
renderMegaTurn = function () {
  const game = state.megaGame;
  if (!game || game.gameName !== "Mime") return akMimeBaseRenderMegaTurn();
  ensureMimeGameConfig(game);
  clearV014Timer();
  const item = game.items[game.currentIndex];
  if (!item) return renderMegaFinal();
  title.textContent = "Mime";
  setBackVisible(false);
  if (game.mimeStage === "private") return akMimeRenderPrivate(game, item);
  if (game.mimeStage === "playing") return akMimeRenderPlaying(game, item);
  if (game.mimeStage === "guesser") return akMimeRenderGuesser(game, item);
  if (game.mimeStage === "result") return akMimeRenderResult(game, item);
  return akMimeRenderHandoff(game, item);
};

const akMimeBaseRenderMegaFinal = renderMegaFinal;
renderMegaFinal = function () {
  const game = state.megaGame;
  if (!game || game.gameName !== "Mime") return akMimeBaseRenderMegaFinal();
  clearV014Timer();
  const ranking = [...state.players].sort((a, b) => Number(game.scores[b.id] || 0) - Number(game.scores[a.id] || 0));
  const best = Math.max(0, ...ranking.map(player => Number(game.scores[player.id] || 0)));
  const winners = ranking.filter(player => Number(game.scores[player.id] || 0) === best && best > 0);
  const topBy = stats => {
    const rows = state.players.map(player => ({ player, value: Number(stats?.[player.id] || 0) }));
    const max = Math.max(0, ...rows.map(row => row.value));
    return { max, players: max ? rows.filter(row => row.value === max).map(row => row.player) : [] };
  };
  const actorTop = topBy(game.mimeStats?.actorSuccess);
  const guesserTop = topBy(game.mimeStats?.guesserSuccess);
  const failed = game.rounds.filter(round => !round.success).sort((a, b) => akMimeDifficultyMeta[akMimeDifficulty(b.difficulty)].points - akMimeDifficultyMeta[akMimeDifficulty(a.difficulty)].points)[0];
  const names = top => top.players.map(player => escapeHtml(player.name)).join(" et ");
  title.textContent = "Classement final";
  setBackVisible(false);
  screen.innerHTML = `
    <section class="winner-stage winner-stage-v07 mega-final-stage"><div class="winner-crown">🎭🏆</div><h2>${winners.length ? winners.map(player => escapeHtml(player.name)).join(" et ") : "Rideau !"}</h2><p>${winners.length ? `${winners.length > 1 ? "terminent" : "termine"} en tête de la troupe.` : "Tous les mimes sont terminés."}</p></section>
    <section class="final-ranking">${ranking.map((player, index) => `<div class="ranking-row"><span class="ranking-position">${index + 1}</span><span class="result-avatar">${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong><span>${Number(game.scores[player.id] || 0)} pts</span></div>`).join("")}</section>
    <section class="mime-final-awards">
      <article><span>🎭</span><small>MEILLEUR MIME</small><strong>${actorTop.max ? names(actorTop) : "Aucun mime trouvé"}</strong><p>${actorTop.max ? `${actorTop.max} mime${actorTop.max > 1 ? "s" : ""} réussi${actorTop.max > 1 ? "s" : ""}` : "La revanche sera théâtrale."}</p></article>
      <article><span>🔎</span><small>MEILLEUR DEVINEUR</small><strong>${guesserTop.max ? names(guesserTop) : "Réponses collectives"}</strong><p>${guesserTop.max ? `${guesserTop.max} première${guesserTop.max > 1 ? "s" : ""} bonne${guesserTop.max > 1 ? "s" : ""} réponse${guesserTop.max > 1 ? "s" : ""}` : "Aucun point individuel attribué."}</p></article>
      <article><span>${failed ? "🧱" : "✨"}</span><small>${failed ? "MIME RESTÉ INCOMPRIS" : "SANS-FAUTE"}</small><strong>${failed ? escapeHtml(failed.text) : "Tous les mimes ont été trouvés"}</strong><p>${failed ? `${akMimeDifficultyMeta[akMimeDifficulty(failed.difficulty)].icon} ${akMimeDifficultyMeta[akMimeDifficulty(failed.difficulty)].label}` : "La troupe était connectée par télépathie."}</p></article>
    </section>
    <div class="toolbar"><button id="replayMega" class="secondary-btn">Rejouer</button><button id="otherMega" class="primary-btn">Autre jeu</button></div>`;
  document.querySelector("#replayMega")?.addEventListener("click", () => {
    resetMegaGame("Mime", {
      roundCount: game.roundCount,
      durationSeconds: game.durationSeconds,
      mimeThemes: game.mimeThemes,
      mimeDifficulties: game.mimeDifficulties,
      mimeIncludeCustom: game.mimeIncludeCustom
    });
    renderMegaSetup();
  });
  document.querySelector("#otherMega")?.addEventListener("click", () => { state.megaGame = null; renderPlayChoice(); });
};

/* =========================================================
   AK'GAMES — MÊME CERVEAU V2
   650 cartes, thèmes, questions personnalisées et fusion manuelle
   ========================================================= */

const AK_BRAIN_CUSTOM_KEY_V2 = "akgames_same_brain_custom_questions_v2";
const AK_BRAIN_RECENT_KEY_V2 = "akgames_same_brain_recent_v2";

const AK_BRAIN_CLASSIC_THEMES_V2 = [
  { id: "food", icon: "🍕", label: "Nourriture" },
  { id: "animals", icon: "🐾", label: "Animaux" },
  { id: "daily", icon: "🏠", label: "Quotidien" },
  { id: "parties", icon: "🎉", label: "Soirées" },
  { id: "travel", icon: "✈️", label: "Voyages" },
  { id: "digital", icon: "📱", label: "Téléphone & réseaux" },
  { id: "culture", icon: "🎬", label: "Films, séries & musique" },
  { id: "games", icon: "🎮", label: "Jeux & loisirs" },
  { id: "work", icon: "💼", label: "Travail & école" },
  { id: "friendship", icon: "🫂", label: "Amitié & groupe" },
  { id: "general", icon: "🌍", label: "Culture accessible" },
  { id: "association", icon: "💭", label: "Associations d’idées" },
  { id: "reflexes", icon: "🚨", label: "Réflexes" },
  { id: "absurd", icon: "🌀", label: "Absurde" }
];

const AK_BRAIN_ADULT_THEMES_V2 = [
  { id: "attraction", icon: "🧲", label: "Attirance" },
  { id: "dates", icon: "🥂", label: "Rendez-vous" },
  { id: "exes", icon: "📦", label: "Ex" },
  { id: "jealousy", icon: "👀", label: "Jalousie & fidélité" },
  { id: "digital", icon: "📲", label: "Sextos & réseaux" },
  { id: "intimacy", icon: "🫦", label: "Préférences intimes" },
  { id: "fantasies", icon: "💭", label: "Fantasmes" },
  { id: "awkward", icon: "😳", label: "Situations gênantes" },
  { id: "couple", icon: "💞", label: "Couple" },
  { id: "casual", icon: "🌙", label: "Rencontres légères" }
];

const AK_BRAIN_INTENSITIES_V2 = [
  { id: "soft", icon: "🌶️", label: "Léger" },
  { id: "hot", icon: "🔥", label: "Osé" },
  { id: "unfiltered", icon: "☢️", label: "Sans filtre" }
];

function akBrainReadCustomV2() {
  try {
    const rows = JSON.parse(localStorage.getItem(AK_BRAIN_CUSTOM_KEY_V2) || "[]");
    if (!Array.isArray(rows)) return [];
    return rows.filter(item => item && typeof item.prompt === "string").map((item, index) => {
      const adult = item.category === "adult";
      const themes = adult ? AK_BRAIN_ADULT_THEMES_V2 : AK_BRAIN_CLASSIC_THEMES_V2;
      const fallbackTheme = themes[0].id;
      return {
        id: String(item.id || `brain_custom_${Date.now()}_${index}`),
        prompt: item.prompt.trim().slice(0, 180),
        category: adult ? "adult" : "classic",
        theme: themes.some(theme => theme.id === item.theme) ? item.theme : fallbackTheme,
        intensity: adult && AK_BRAIN_INTENSITIES_V2.some(level => level.id === item.intensity) ? item.intensity : "soft",
        custom: true
      };
    }).filter(item => item.prompt);
  } catch (error) {
    console.warn("Questions Même cerveau personnalisées illisibles", error);
    return [];
  }
}

function akBrainSaveCustomV2(items) {
  localStorage.setItem(AK_BRAIN_CUSTOM_KEY_V2, JSON.stringify(items || []));
}

function akBrainThemeV2(item) {
  const list = item?.category === "adult" ? AK_BRAIN_ADULT_THEMES_V2 : AK_BRAIN_CLASSIC_THEMES_V2;
  return list.find(theme => theme.id === item?.theme) || list[0];
}

function akBrainIntensityV2(item) {
  return AK_BRAIN_INTENSITIES_V2.find(level => level.id === item?.intensity) || AK_BRAIN_INTENSITIES_V2[0];
}

function akBrainQuestionBadgesV2(item) {
  const theme = akBrainThemeV2(item);
  const intensity = item?.category === "adult" ? akBrainIntensityV2(item) : null;
  return `<div class="brain-question-badges"><span>${theme.icon} ${escapeHtml(theme.label)}</span>${intensity ? `<span class="brain-intensity-${intensity.id}">${intensity.icon} ${escapeHtml(intensity.label)}</span>` : ""}${item?.custom ? `<span>✍️ Personnalisée</span>` : ""}</div>`;
}

function akBrainEnsureConfigV2(game, config = {}) {
  const classicIds = AK_BRAIN_CLASSIC_THEMES_V2.map(theme => theme.id);
  const adultIds = AK_BRAIN_ADULT_THEMES_V2.map(theme => theme.id);
  const intensityIds = AK_BRAIN_INTENSITIES_V2.map(level => level.id);
  const valid = (values, allowed, fallback) => {
    if (!Array.isArray(values)) return [...fallback];
    return [...new Set(values.filter(value => allowed.includes(value)))];
  };
  game.roundCount = Math.max(3, Math.min(100, Number(config.roundCount ?? game.roundCount ?? 10) || 10));
  game.includeAdult = Boolean(config.includeAdult ?? game.includeAdult);
  game.classicThemes = valid(config.classicThemes ?? game.classicThemes, classicIds, classicIds);
  game.adultThemes = valid(config.adultThemes ?? game.adultThemes, adultIds, adultIds);
  game.adultIntensities = valid(config.adultIntensities ?? game.adultIntensities, intensityIds, intensityIds);
  game.customQuestions = Array.isArray(game.customQuestions) ? game.customQuestions : akBrainReadCustomV2();
  game.includeCustom = Boolean((config.includeCustom ?? game.includeCustom ?? true) && game.customQuestions.length);
  game.currentResult = game.currentResult || null;
  return game;
}

function akBrainCreateCustomV2(prompt, category, theme, intensity) {
  const adult = category === "adult";
  const themes = adult ? AK_BRAIN_ADULT_THEMES_V2 : AK_BRAIN_CLASSIC_THEMES_V2;
  const clean = String(prompt || "").trim().replace(/\s+/g, " ").slice(0, 180);
  if (!clean) return null;
  return {
    id: `brain_custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    prompt: clean,
    category: adult ? "adult" : "classic",
    theme: themes.some(item => item.id === theme) ? theme : themes[0].id,
    intensity: adult && AK_BRAIN_INTENSITIES_V2.some(item => item.id === intensity) ? intensity : "soft",
    custom: true
  };
}

function akBrainReadRecentV2() {
  try {
    const rows = JSON.parse(localStorage.getItem(AK_BRAIN_RECENT_KEY_V2) || "[]");
    return Array.isArray(rows) ? rows.filter(Boolean).slice(-180) : [];
  } catch (error) {
    return [];
  }
}

function akBrainBalancedSelectV2(pool, count, namespace = "brain") {
  const recent = new Set(akBrainReadRecentV2());
  const buckets = new Map();
  (pool || []).forEach(item => {
    const key = item.category === "adult"
      ? `adult:${item.theme || "other"}:${item.intensity || "soft"}`
      : `${item.custom ? "custom" : "classic"}:${item.theme || "other"}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(item);
  });
  const keys = shuffleArray([...buckets.keys()]);
  keys.forEach(key => {
    const rows = buckets.get(key);
    const fresh = shuffleArray(rows.filter(item => !recent.has(item.id)));
    const old = shuffleArray(rows.filter(item => recent.has(item.id)));
    buckets.set(key, [...fresh, ...old]);
  });
  const selected = [];
  while (selected.length < count) {
    let added = false;
    for (const key of keys) {
      const row = buckets.get(key)?.shift();
      if (!row) continue;
      selected.push(row);
      added = true;
      if (selected.length >= count) break;
    }
    if (!added) break;
  }
  const nextRecent = [...akBrainReadRecentV2(), ...selected.map(item => item.id)].slice(-180);
  localStorage.setItem(AK_BRAIN_RECENT_KEY_V2, JSON.stringify(nextRecent));
  return selected;
}

function akBrainSetupMarkupV2(game, prefix = "brain", readOnly = false) {
  akBrainEnsureConfigV2(game);
  const disabled = readOnly ? "disabled" : "";
  const classicOptions = AK_BRAIN_CLASSIC_THEMES_V2.map(theme => `
    <label class="brain-theme-option ${game.classicThemes.includes(theme.id) ? "active" : ""}">
      <input type="checkbox" data-brain-classic-theme="${theme.id}" ${game.classicThemes.includes(theme.id) ? "checked" : ""} ${disabled}>
      <span>${theme.icon}</span><strong>${escapeHtml(theme.label)}</strong>
    </label>`).join("");
  const adultOptions = AK_BRAIN_ADULT_THEMES_V2.map(theme => `
    <label class="brain-theme-option ${game.adultThemes.includes(theme.id) ? "active" : ""}">
      <input type="checkbox" data-brain-adult-theme="${theme.id}" ${game.adultThemes.includes(theme.id) ? "checked" : ""} ${disabled}>
      <span>${theme.icon}</span><strong>${escapeHtml(theme.label)}</strong>
    </label>`).join("");
  const custom = game.customQuestions || [];
  const themeOptions = [
    `<optgroup label="Classique">${AK_BRAIN_CLASSIC_THEMES_V2.map(theme => `<option value="classic:${theme.id}">${theme.icon} ${escapeHtml(theme.label)}</option>`).join("")}</optgroup>`,
    state.adult ? `<optgroup label="Adulte">${AK_BRAIN_ADULT_THEMES_V2.map(theme => `<option value="adult:${theme.id}">${theme.icon} ${escapeHtml(theme.label)}</option>`).join("")}</optgroup>` : ""
  ].join("");
  return `
    <section class="card brain-settings-card">
      <h2 class="section-title">Durée de la partie</h2>
      <div class="brain-round-presets">${[5,10,20,40,60,100].map(value => `<button type="button" class="choice-pill ${game.roundCount === value ? "active" : ""}" data-brain-round="${value}" ${disabled}>${value}</button>`).join("")}</div>
      <div class="form-group top-gap"><label for="${prefix}RoundCount">Nombre personnalisé</label><input id="${prefix}RoundCount" type="number" min="3" max="100" value="${game.roundCount}" class="text-input" ${disabled}></div>
    </section>
    <section class="card brain-settings-card">
      <div class="brain-section-heading"><div><h2 class="section-title">Thèmes classiques</h2><p>Choisis-en un, plusieurs ou tous.</p></div>${readOnly ? "" : `<div class="toolbar"><button type="button" class="secondary-btn" id="${prefix}BrainAllClassic">Tous</button><button type="button" class="secondary-btn" id="${prefix}BrainNoClassic">Aucun</button></div>`}</div>
      <div class="brain-theme-grid">${classicOptions}</div>
    </section>
    ${state.adult ? `
      <label class="option-card premium-toggle brain-adult-toggle"><input id="${prefix}BrainAdult" type="checkbox" ${game.includeAdult ? "checked" : ""} ${disabled}><span><strong>🔞 Ajouter le pack adulte</strong><br><span class="helper">150 questions avec thèmes et intensités séparés.</span></span></label>
      ${game.includeAdult ? `<section class="card brain-settings-card"><div class="brain-section-heading"><div><h2 class="section-title">Thèmes adultes</h2><p>Sélection indépendante du pack classique.</p></div>${readOnly ? "" : `<div class="toolbar"><button type="button" class="secondary-btn" id="${prefix}BrainAllAdult">Tous</button><button type="button" class="secondary-btn" id="${prefix}BrainNoAdult">Aucun</button></div>`}</div><div class="brain-theme-grid">${adultOptions}</div><h3 class="section-title top-gap">Intensités</h3><div class="brain-intensity-grid">${AK_BRAIN_INTENSITIES_V2.map(level => `<button type="button" class="brain-intensity-option brain-intensity-${level.id} ${game.adultIntensities.includes(level.id) ? "active" : ""}" data-brain-intensity="${level.id}" ${disabled}><span>${level.icon}</span><strong>${escapeHtml(level.label)}</strong></button>`).join("")}</div></section>` : ""}
    ` : ""}
    ${readOnly ? "" : `<section class="card brain-settings-card"><h2 class="section-title">Mes questions</h2><p class="helper">Ajoute une question que ton groupe pourra retrouver dans le mélange.</p><div class="form-group top-gap"><label for="${prefix}BrainCustomPrompt">Question</label><input id="${prefix}BrainCustomPrompt" class="text-input" maxlength="180" placeholder="Ex. Cite une excuse que tout le monde a déjà utilisée."></div><div class="brain-custom-grid"><div class="form-group"><label for="${prefix}BrainCustomTheme">Thème</label><select id="${prefix}BrainCustomTheme" class="text-input">${themeOptions}</select></div><div class="form-group"><label for="${prefix}BrainCustomIntensity">Intensité si adulte</label><select id="${prefix}BrainCustomIntensity" class="text-input">${AK_BRAIN_INTENSITIES_V2.map(level => `<option value="${level.id}">${level.icon} ${escapeHtml(level.label)}</option>`).join("")}</select></div></div><button type="button" id="${prefix}BrainAddCustom" class="secondary-btn full">Ajouter la question</button>${custom.length ? `<label class="option-card mini-option top-gap"><input id="${prefix}BrainIncludeCustom" type="checkbox" ${game.includeCustom ? "checked" : ""}><span><strong>Utiliser mes ${custom.length} question${custom.length > 1 ? "s" : ""}</strong></span></label><details class="top-gap"><summary>Gérer mes questions</summary><div class="brain-custom-list">${custom.map(item => `<article><div>${akBrainQuestionBadgesV2(item)}<p>${escapeHtml(item.prompt)}</p></div><button type="button" class="danger-btn" data-remove-brain-custom="${item.id}">Supprimer</button></article>`).join("")}</div></details>` : ""}</section>`}
  `;
}

function akBrainBindSetupV2(game, prefix, rerender, readOnly = false) {
  if (readOnly) return;
  document.querySelectorAll("[data-brain-round]").forEach(button => button.addEventListener("click", () => {
    game.roundCount = Number(button.dataset.brainRound);
    rerender();
  }));
  document.querySelector(`#${prefix}RoundCount`)?.addEventListener("change", event => {
    game.roundCount = Math.max(3, Math.min(100, Number(event.target.value) || 10));
    event.target.value = game.roundCount;
  });
  document.querySelectorAll("[data-brain-classic-theme]").forEach(input => input.addEventListener("change", () => {
    const theme = input.dataset.brainClassicTheme;
    game.classicThemes = input.checked ? [...new Set([...game.classicThemes, theme])] : game.classicThemes.filter(value => value !== theme);
    input.closest(".brain-theme-option")?.classList.toggle("active", input.checked);
  }));
  document.querySelectorAll("[data-brain-adult-theme]").forEach(input => input.addEventListener("change", () => {
    const theme = input.dataset.brainAdultTheme;
    game.adultThemes = input.checked ? [...new Set([...game.adultThemes, theme])] : game.adultThemes.filter(value => value !== theme);
    input.closest(".brain-theme-option")?.classList.toggle("active", input.checked);
  }));
  document.querySelector(`#${prefix}BrainAllClassic`)?.addEventListener("click", () => { game.classicThemes = AK_BRAIN_CLASSIC_THEMES_V2.map(item => item.id); rerender(); });
  document.querySelector(`#${prefix}BrainNoClassic`)?.addEventListener("click", () => { game.classicThemes = []; rerender(); });
  document.querySelector(`#${prefix}BrainAllAdult`)?.addEventListener("click", () => { game.adultThemes = AK_BRAIN_ADULT_THEMES_V2.map(item => item.id); rerender(); });
  document.querySelector(`#${prefix}BrainNoAdult`)?.addEventListener("click", () => { game.adultThemes = []; rerender(); });
  document.querySelector(`#${prefix}BrainAdult`)?.addEventListener("change", event => { game.includeAdult = event.target.checked; rerender(); });
  document.querySelectorAll("[data-brain-intensity]").forEach(button => button.addEventListener("click", () => {
    const value = button.dataset.brainIntensity;
    game.adultIntensities = game.adultIntensities.includes(value) ? game.adultIntensities.filter(item => item !== value) : [...game.adultIntensities, value];
    rerender();
  }));
  document.querySelector(`#${prefix}BrainIncludeCustom`)?.addEventListener("change", event => { game.includeCustom = event.target.checked; });
  document.querySelector(`#${prefix}BrainAddCustom`)?.addEventListener("click", () => {
    const prompt = document.querySelector(`#${prefix}BrainCustomPrompt`)?.value || "";
    const [category, theme] = String(document.querySelector(`#${prefix}BrainCustomTheme`)?.value || "classic:food").split(":");
    const intensity = document.querySelector(`#${prefix}BrainCustomIntensity`)?.value || "soft";
    const item = akBrainCreateCustomV2(prompt, category, theme, intensity);
    if (!item) return alert("Écris d’abord une question.");
    if (game.customQuestions.some(existing => normalizeBrainAnswer(existing.prompt) === normalizeBrainAnswer(item.prompt))) return alert("Cette question existe déjà.");
    game.customQuestions.push(item);
    game.includeCustom = true;
    akBrainSaveCustomV2(game.customQuestions);
    rerender();
  });
  document.querySelectorAll("[data-remove-brain-custom]").forEach(button => button.addEventListener("click", () => {
    game.customQuestions = game.customQuestions.filter(item => item.id !== button.dataset.removeBrainCustom);
    if (!game.customQuestions.length) game.includeCustom = false;
    akBrainSaveCustomV2(game.customQuestions);
    rerender();
  }));
}

function akBrainBuildPoolV2(classic, adult, game) {
  const classicThemes = new Set(game.classicThemes || []);
  const adultThemes = new Set(game.adultThemes || []);
  const intensities = new Set(game.adultIntensities || []);
  let pool = (classic || []).filter(item => classicThemes.has(item.theme));
  if (state.adult && game.includeAdult) {
    pool = pool.concat((adult || []).filter(item => adultThemes.has(item.theme) && intensities.has(item.intensity)));
  }
  if (game.includeCustom) {
    pool = pool.concat((game.customQuestions || []).filter(item => {
      if (item.category === "adult") return state.adult && game.includeAdult;
      return true;
    }));
  }
  return pool;
}

function akBrainRawGroupsV2(answers) {
  const map = new Map();
  Object.entries(answers || {}).forEach(([id, entry]) => {
    const text = typeof entry === "string" ? entry : String(entry?.text || "");
    const key = normalizeBrainAnswer(text) || `unique_${id}`;
    if (!map.has(key)) map.set(key, { id: `brain_group_${map.size}`, sourceIds: [], memberIds: [], labels: [] });
    const group = map.get(key);
    group.sourceIds.push(key);
    group.memberIds.push(id);
    if (!group.labels.includes(text)) group.labels.push(text);
  });
  return [...map.values()];
}

function akBrainComputeResultV2(answers, groups, baseScores) {
  const points = {};
  const scores = { ...(baseScores || {}) };
  const cleanGroups = (groups || []).map((group, index) => ({
    id: group.id || `brain_group_${index}`,
    sourceIds: [...new Set(group.sourceIds || [])],
    memberIds: [...new Set(group.memberIds || [])],
    labels: [...new Set((group.labels || []).filter(Boolean))]
  }));
  cleanGroups.forEach(group => {
    const amount = group.memberIds.length >= 2 ? Math.min(3, group.memberIds.length - 1) : 0;
    group.points = amount;
    group.memberIds.forEach(id => {
      points[id] = amount;
      scores[id] = Number(scores[id] || 0) + amount;
    });
  });
  return {
    answers,
    groups: cleanGroups,
    rawGroups: akBrainRawGroupsV2(answers),
    points,
    scores,
    baseScores: { ...(baseScores || {}) },
    matchedIds: Object.entries(points).filter(([, value]) => Number(value) > 0).map(([id]) => id),
    mergeRevision: Date.now()
  };
}

function akBrainMergeGroupsV2(result, selectedIds) {
  const selected = new Set(selectedIds || []);
  const groups = result.groups || [];
  const merging = groups.filter(group => selected.has(group.id));
  if (merging.length < 2) return null;
  const untouched = groups.filter(group => !selected.has(group.id));
  const merged = {
    id: `brain_merged_${Date.now()}`,
    sourceIds: merging.flatMap(group => group.sourceIds || []),
    memberIds: merging.flatMap(group => group.memberIds || []),
    labels: merging.flatMap(group => group.labels || [])
  };
  return akBrainComputeResultV2(result.answers, [...untouched, merged], result.baseScores);
}

function akBrainMergePanelV2(result, prefix, canEdit = true) {
  if (!canEdit || (result.groups || []).length < 2) return "";
  return `<section class="card brain-merge-card"><div class="brain-section-heading"><div><h2 class="section-title">Réponses équivalentes ?</h2><p>Sélectionne au moins deux groupes, puis fusionne-les. Les scores seront recalculés.</p></div><span>🧠🔧</span></div><div class="brain-merge-list">${result.groups.map(group => `<label class="brain-merge-row"><input type="checkbox" data-brain-merge-group="${group.id}"><span><strong>${group.labels.map(escapeHtml).join(" / ")}</strong><small>${group.memberIds.length} joueur${group.memberIds.length > 1 ? "s" : ""}</small></span></label>`).join("")}</div><div class="toolbar top-gap"><button type="button" id="${prefix}BrainMerge" class="primary-btn">Fusionner la sélection</button><button type="button" id="${prefix}BrainResetMerge" class="secondary-btn">Annuler les fusions</button></div></section>`;
}

function akBrainBuildStatsV2(rounds) {
  const rows = Array.isArray(rounds) ? rounds : Object.values(rounds || {});
  const pairCounts = {};
  const uniqueCounts = Object.fromEntries(state.players.map(player => [player.id, 0]));
  const answerCounts = {};
  let biggest = null;
  rows.forEach(round => {
    const answers = round?.answers || {};
    Object.entries(answers).forEach(([id, entry]) => {
      const text = typeof entry === "string" ? entry : String(entry?.text || "");
      const key = normalizeBrainAnswer(text);
      if (!key) return;
      answerCounts[key] = answerCounts[key] || { label: text, count: 0 };
      answerCounts[key].count += 1;
      if (!Number(round?.points?.[id] || 0)) uniqueCounts[id] = Number(uniqueCounts[id] || 0) + 1;
    });
    (round?.groups || []).forEach(group => {
      const members = group.memberIds || [];
      if (!biggest || members.length > biggest.memberIds.length) biggest = { ...group, itemPrompt: round.itemPrompt || "" };
      if (members.length < 2) return;
      for (let i = 0; i < members.length; i += 1) {
        for (let j = i + 1; j < members.length; j += 1) {
          const key = [members[i], members[j]].sort().join("|");
          pairCounts[key] = Number(pairCounts[key] || 0) + 1;
        }
      }
    });
  });
  const topPairEntry = Object.entries(pairCounts).sort((a, b) => b[1] - a[1])[0];
  const topPair = topPairEntry ? { ids: topPairEntry[0].split("|"), count: topPairEntry[1] } : null;
  const popular = Object.values(answerCounts).sort((a, b) => b.count - a.count)[0] || null;
  const maxUnique = Math.max(0, ...Object.values(uniqueCounts));
  const uniquePlayers = maxUnique ? state.players.filter(player => Number(uniqueCounts[player.id] || 0) === maxUnique) : [];
  return { biggest, topPair, popular, maxUnique, uniquePlayers };
}

function akBrainFinalStatsMarkupV2(rounds) {
  const stats = akBrainBuildStatsV2(rounds);
  const playerName = id => state.players.find(player => player.id === id)?.name || "Joueur";
  const biggestNames = stats.biggest?.memberIds?.map(id => escapeHtml(playerName(id))).join(", ") || "Aucune connexion";
  const pairNames = stats.topPair ? stats.topPair.ids.map(id => escapeHtml(playerName(id))).join(" + ") : "Aucun duo régulier";
  const uniqueNames = stats.uniquePlayers.length ? stats.uniquePlayers.map(player => escapeHtml(player.name)).join(" et ") : "Tout le monde s’est connecté";
  return `<section class="brain-final-awards"><article><span>⚡</span><small>PLUS GROS RACCORD</small><strong>${stats.biggest?.memberIds?.length >= 2 ? `${stats.biggest.memberIds.length} cerveaux` : "Aucun match"}</strong><p>${stats.biggest?.memberIds?.length >= 2 ? `${stats.biggest.labels.map(escapeHtml).join(" / ")} · ${biggestNames}` : "La prochaine partie créera peut-être l’étincelle."}</p></article><article><span>🔗</span><small>DUO LE PLUS CONNECTÉ</small><strong>${pairNames}</strong><p>${stats.topPair ? `${stats.topPair.count} connexion${stats.topPair.count > 1 ? "s" : ""} commune${stats.topPair.count > 1 ? "s" : ""}` : "Aucune paire n’a matché deux fois."}</p></article><article><span>💬</span><small>RÉPONSE LA PLUS DONNÉE</small><strong>${stats.popular ? escapeHtml(stats.popular.label) : "Aucune"}</strong><p>${stats.popular ? `${stats.popular.count} apparition${stats.popular.count > 1 ? "s" : ""} dans la partie` : "Les réponses étaient toutes différentes."}</p></article><article><span>🪐</span><small>ESPRIT LE PLUS UNIQUE</small><strong>${uniqueNames}</strong><p>${stats.maxUnique ? `${stats.maxUnique} réponse${stats.maxUnique > 1 ? "s" : ""} sans raccord` : "Connexion générale réussie."}</p></article></section>`;
}

const akBrainBaseResetV2 = resetSameBrainState;
resetSameBrainState = function (config = {}) {
  state.sameBrain = {
    roundCount: Number(config.roundCount || 10),
    includeAdult: Boolean(config.includeAdult),
    classicThemes: config.classicThemes,
    adultThemes: config.adultThemes,
    adultIntensities: config.adultIntensities,
    includeCustom: config.includeCustom,
    customQuestions: akBrainReadCustomV2(),
    items: [], currentIndex: 0, currentWriterIndex: 0, answers: {},
    scores: Object.fromEntries(state.players.map(player => [player.id, 0])),
    rounds: [], currentResult: null
  };
  akBrainEnsureConfigV2(state.sameBrain, config);
};

renderSameBrainSetup = function () {
  if (!state.sameBrain) resetSameBrainState();
  const game = akBrainEnsureConfigV2(state.sameBrain);
  title.textContent = "Même cerveau";
  setBackVisible(true);
  screen.innerHTML = `
    <section class="game-cover game-cover-brain brain-cover-v2"><span class="game-cover-icon">🧠</span><div><small>CONNEXION & SECRETS</small><h2>Même cerveau</h2><p>Répondez sans vous concerter. Les réponses identiques ou fusionnées connectent les cerveaux.</p></div></section>
    ${akBrainSetupMarkupV2(game, "soloBrain")}
    <div class="notice">Barème : 2 cerveaux = 1 point, 3 = 2 points, 4 ou plus = 3 points. Les synonymes peuvent être fusionnés après la révélation.</div>
    <button id="startSameBrain" class="primary-btn full">Synchroniser les cerveaux</button>`;
  akBrainBindSetupV2(game, "soloBrain", renderSameBrainSetup);
  document.querySelector("#startSameBrain")?.addEventListener("click", startSameBrainGame);
};

startSameBrainGame = async function () {
  const game = akBrainEnsureConfigV2(state.sameBrain);
  const hasClassic = game.classicThemes.length > 0;
  const hasAdult = state.adult && game.includeAdult && game.adultThemes.length > 0 && game.adultIntensities.length > 0;
  const hasCustom = game.includeCustom && game.customQuestions.length > 0;
  if (!hasClassic && !hasAdult && !hasCustom) return alert("Choisis au moins un thème ou active une question personnalisée.");
  screen.innerHTML = `<div class="notice">Connexion des neurones…</div>`;
  try {
    const classic = await loadJsonFile("data/meme-cerveau.json", "Impossible de charger les questions de Même cerveau.");
    const adult = state.adult && game.includeAdult ? await loadJsonFile("data/meme-cerveau-adulte.json", "Impossible de charger les questions adultes.") : [];
    const pool = akBrainBuildPoolV2(classic, adult, game);
    if (!pool.length) throw new Error("Aucune question ne correspond aux filtres choisis.");
    game.items = akBrainBalancedSelectV2(pool, Math.min(game.roundCount, pool.length), `solo:brain-v2:${game.classicThemes.join("-")}:${game.adultThemes.join("-")}`);
    game.currentIndex = 0; game.currentWriterIndex = 0; game.answers = {}; game.rounds = []; game.currentResult = null;
    game.scores = Object.fromEntries(state.players.map(player => [player.id, 0]));
    renderSameBrainGate();
  } catch (error) {
    console.error(error);
    alert(error.message || "Impossible de lancer Même cerveau.");
    renderSameBrainSetup();
  }
};

renderSameBrainAnswer = function () {
  const game = state.sameBrain;
  const item = game.items[game.currentIndex];
  const player = state.players[game.currentWriterIndex];
  title.textContent = "Même cerveau";
  screen.innerHTML = `
    ${renderV08Progress(game.currentIndex + 1, game.items.length, "Question")}
    <section class="v08-question-card brain-question-card">${akBrainQuestionBadgesV2(item)}<span>🧠</span><small>RÉPONDS DU PREMIER COUP</small><h2>${escapeHtml(item.prompt)}</h2></section>
    <section class="card"><div class="form-group"><label for="brainAnswer">Ta réponse, ${escapeHtml(player.name)}</label><input id="brainAnswer" class="text-input v08-answer-input" maxlength="60" autocomplete="off" placeholder="Un mot ou une courte expression"></div></section>
    <button id="saveBrainAnswer" class="primary-btn full">Verrouiller ma réponse</button>`;
  const input = document.querySelector("#brainAnswer");
  input?.focus();
  const save = () => {
    const value = input?.value.trim();
    if (!value) return alert("Écris une réponse avant de continuer.");
    game.answers[player.id] = value;
    game.currentWriterIndex += 1;
    renderSameBrainGate();
  };
  document.querySelector("#saveBrainAnswer")?.addEventListener("click", save);
  input?.addEventListener("keydown", event => { if (event.key === "Enter") save(); });
};

renderSameBrainReveal = function () {
  const game = state.sameBrain;
  const item = game.items[game.currentIndex];
  if (!game.currentResult) {
    const rawGroups = akBrainRawGroupsV2(game.answers);
    game.currentResult = akBrainComputeResultV2({ ...game.answers }, rawGroups, { ...game.scores });
    game.scores = { ...game.currentResult.scores };
  }
  const result = game.currentResult;
  title.textContent = result.matchedIds.length ? "Connexion détectée" : "Cerveaux indépendants";
  setBackVisible(false);
  screen.innerHTML = `
    <section class="reveal-stage reveal-v07 brain-reveal">${akBrainQuestionBadgesV2(item)}<span class="game-cover-icon">${result.matchedIds.length ? "⚡" : "🧠"}</span><h2>${result.matchedIds.length ? "Des cerveaux se sont connectés !" : "Aucun match automatique"}</h2><p>${escapeHtml(item.prompt)}</p></section>
    <section class="brain-answer-wall">${state.players.map(player => { const points = Number(result.points?.[player.id] || 0); return `<article class="brain-answer-tile ${points ? "matched" : ""}"><span>${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong><p>${escapeHtml(game.answers[player.id] || "")}</p>${points ? `<em>+${points} pt${points > 1 ? "s" : ""}</em>` : `<small>réponse unique</small>`}</article>`; }).join("")}</section>
    ${akBrainMergePanelV2(result, "solo", true)}
    ${state.alcohol && !result.matchedIds.length ? `<div class="alcohol-callout">🍻 Aucun match automatique : le groupe peut trinquer avec la boisson de son choix, sans obligation.</div>` : ""}
    <button id="nextBrainRound" class="primary-btn full">${game.currentIndex + 1 >= game.items.length ? "Voir le classement" : "Question suivante"}</button>`;
  document.querySelector("#soloBrainMerge")?.addEventListener("click", () => {
    const ids = [...document.querySelectorAll("[data-brain-merge-group]:checked")].map(input => input.dataset.brainMergeGroup);
    if (ids.length < 2) return alert("Sélectionne au moins deux groupes à fusionner.");
    const next = akBrainMergeGroupsV2(result, ids);
    if (!next) return;
    game.currentResult = next; game.scores = { ...next.scores };
    renderSameBrainReveal();
  });
  document.querySelector("#soloBrainResetMerge")?.addEventListener("click", () => {
    game.currentResult = akBrainComputeResultV2(result.answers, result.rawGroups, result.baseScores);
    game.scores = { ...game.currentResult.scores };
    renderSameBrainReveal();
  });
  document.querySelector("#nextBrainRound")?.addEventListener("click", () => {
    game.rounds.push({ itemId: item.id, itemPrompt: item.prompt, answers: { ...result.answers }, points: { ...result.points }, groups: result.groups.map(group => ({ ...group })) });
    game.currentIndex += 1; game.currentWriterIndex = 0; game.answers = {}; game.currentResult = null;
    renderSameBrainGate();
  });
};

renderSameBrainEnd = function () {
  const game = state.sameBrain;
  const ranking = scoreRanking(game.scores);
  title.textContent = "Classement final";
  setBackVisible(false);
  screen.innerHTML = `
    <section class="winner-stage winner-stage-v07 v08-final-stage"><div class="winner-crown">🧠🏆</div><h2>Vos cerveaux ont rendu leur verdict</h2><p>Les réponses équivalentes ont pu être regroupées avant le calcul final.</p></section>
    <section class="final-ranking">${ranking.map((player, index) => `<div class="ranking-row"><span class="ranking-position">${index + 1}</span><span class="result-avatar">${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong><span>${Number(game.scores[player.id] || 0)} pts</span></div>`).join("")}</section>
    ${akBrainFinalStatsMarkupV2(game.rounds)}
    <div class="toolbar"><button id="replaySameBrain" class="secondary-btn">Rejouer</button><button id="otherSameBrain" class="primary-btn">Autre jeu</button></div>`;
  document.querySelector("#replaySameBrain")?.addEventListener("click", () => {
    resetSameBrainState({ roundCount: game.roundCount, includeAdult: game.includeAdult, classicThemes: game.classicThemes, adultThemes: game.adultThemes, adultIntensities: game.adultIntensities, includeCustom: game.includeCustom });
    renderSameBrainSetup();
  });
  document.querySelector("#otherSameBrain")?.addEventListener("click", () => { state.sameBrain = null; renderPlayChoice(); });
};

/* =========================================================
   AK'GAMES V3.1 - JEUX À BOIRE
   700 cartes, thèmes, ambiances, règles et hydratation
   ========================================================= */

const AK_DRINK_CUSTOM_KEY = "akgames_drinking_custom_cards_v2";
const AK_DRINK_RECENT_KEY = "akgames_drinking_recent_v2";
const AK_DRINK_THEMES = [
  { id: "who_drinks", icon: "🥤", label: "Qui choisit ?" },
  { id: "vote", icon: "🗳️", label: "Votes du groupe" },
  { id: "confession", icon: "💬", label: "Confessions" },
  { id: "reflex", icon: "⚡", label: "Réflexes" },
  { id: "mini_challenge", icon: "🎯", label: "Mini-défis" },
  { id: "duo", icon: "🤝", label: "Duos" },
  { id: "group", icon: "👥", label: "Tout le groupe" },
  { id: "temporary_rule", icon: "📜", label: "Règles temporaires" },
  { id: "files", icon: "🗂️", label: "Dossiers" },
  { id: "friendship", icon: "🫂", label: "Amitié" },
  { id: "chaos", icon: "🌀", label: "Chaos" }
];
const AK_DRINK_MOODS = [
  { id: "calm", icon: "🥤", label: "Tranquille", description: "Léger, social et peu personnel" },
  { id: "party", icon: "🎉", label: "Soirée", description: "Votes, défis et dossiers" },
  { id: "unfiltered", icon: "🌶️", label: "Sans filtre", description: "Plus franc, toujours facultatif" }
];
const AK_DRINK_FORMATS = [
  { id: "solo", icon: "🧍", label: "Une personne" },
  { id: "duo", icon: "🤝", label: "Deux personnes" },
  { id: "group", icon: "👥", label: "Tout le groupe" },
  { id: "rule", icon: "📜", label: "Règle temporaire" }
];

if (typeof V014_GAME_CONFIGS !== "undefined" && V014_GAME_CONFIGS["Jeux à boire"]) {
  Object.assign(V014_GAME_CONFIGS["Jeux à boire"], {
    description: "Un jeu de soirée varié : votes, confessions, défis, duos et règles temporaires. Toujours sans score et sans obligation de boire.",
    defaultRounds: 20
  });
}

function akDrinkIsGame(game = state.megaGame) {
  return Boolean(game?.gameName === "Jeux à boire");
}
function akDrinkTheme(id) {
  if (id === "adult") return { id: "adult", icon: "🔞", label: "Adulte" };
  return AK_DRINK_THEMES.find(item => item.id === id) || AK_DRINK_THEMES[0];
}
function akDrinkMood(id) { return AK_DRINK_MOODS.find(item => item.id === id) || AK_DRINK_MOODS[0]; }
function akDrinkFormat(id) { return AK_DRINK_FORMATS.find(item => item.id === id) || AK_DRINK_FORMATS[0]; }
function akDrinkReadCustom() {
  try {
    const rows = JSON.parse(localStorage.getItem(AK_DRINK_CUSTOM_KEY) || "[]");
    return Array.isArray(rows) ? rows.filter(item => item?.text).slice(-150) : [];
  } catch (error) { return []; }
}
function akDrinkSaveCustom(rows) { localStorage.setItem(AK_DRINK_CUSTOM_KEY, JSON.stringify(rows || [])); }
function akDrinkReadRecent() {
  try {
    const rows = JSON.parse(localStorage.getItem(AK_DRINK_RECENT_KEY) || "[]");
    return Array.isArray(rows) ? rows.slice(-220) : [];
  } catch (error) { return []; }
}
function akDrinkEnsure(game, config = {}) {
  if (!game) return game;
  const themeIds = AK_DRINK_THEMES.map(item => item.id);
  const moodIds = AK_DRINK_MOODS.map(item => item.id);
  const valid = (rows, allowed, fallback) => Array.isArray(rows) ? [...new Set(rows.filter(value => allowed.includes(value)))] : [...fallback];
  game.roundCount = Math.max(10, Math.min(100, Number(config.roundCount ?? game.roundCount ?? 20) || 20));
  game.drinkThemes = valid(config.drinkThemes ?? game.drinkThemes, themeIds, themeIds);
  game.drinkMoods = valid(config.drinkMoods ?? game.drinkMoods, moodIds, moodIds);
  game.drinkIncludeAdult = Boolean(config.drinkIncludeAdult ?? game.drinkIncludeAdult);
  game.drinkCustomCards = Array.isArray(game.drinkCustomCards) ? game.drinkCustomCards : akDrinkReadCustom();
  game.drinkIncludeCustom = Boolean((config.drinkIncludeCustom ?? game.drinkIncludeCustom ?? true) && game.drinkCustomCards.length);
  game.drinkHydration = config.drinkHydration ?? game.drinkHydration ?? true;
  game.activeRules = Array.isArray(game.activeRules) ? game.activeRules : [];
  return game;
}
function akDrinkCreateCustom(text, theme, mood, format) {
  const clean = String(text || "").trim().replace(/\s+/g, " ").slice(0, 240);
  if (!clean) return null;
  const adult = theme === "adult";
  return {
    id: `drink_custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    text: clean,
    theme: adult ? "adult" : (AK_DRINK_THEMES.some(item => item.id === theme) ? theme : "mini_challenge"),
    mood: AK_DRINK_MOODS.some(item => item.id === mood) ? mood : "party",
    format: AK_DRINK_FORMATS.some(item => item.id === format) ? format : "solo",
    ruleTurns: format === "rule" ? 3 : undefined,
    adult,
    custom: true
  };
}
function akDrinkBadges(item) {
  const theme = akDrinkTheme(item?.theme);
  const mood = akDrinkMood(item?.mood);
  const format = akDrinkFormat(item?.format);
  return `<div class="drink-card-badges"><span>${theme.icon} ${escapeHtml(theme.label)}</span><span>${mood.icon} ${escapeHtml(mood.label)}</span><span>${format.icon} ${escapeHtml(format.label)}</span>${item?.custom ? `<span>✍️ Perso</span>` : ""}</div>`;
}
function akDrinkActiveRulesMarkup(rules) {
  if (!Array.isArray(rules) || !rules.length) return "";
  return `<section class="drink-active-rules"><div><span>📜</span><strong>Règles actives</strong></div>${rules.map(rule => `<article><p>${escapeHtml(rule.text)}</p><small>${Number(rule.remaining || 0)} carte${Number(rule.remaining || 0) > 1 ? "s" : ""} restante${Number(rule.remaining || 0) > 1 ? "s" : ""}</small></article>`).join("")}</section>`;
}
function akDrinkSetupMarkup(game, prefix = "drink", readOnly = false) {
  akDrinkEnsure(game);
  const disabled = readOnly ? "disabled" : "";
  const customs = game.drinkCustomCards || [];
  const themeOptions = [...AK_DRINK_THEMES, { id: "adult", icon: "🔞", label: "Adulte" }]
    .map(item => `<option value="${item.id}">${item.icon} ${escapeHtml(item.label)}</option>`).join("");
  return `
    <section class="card drink-settings-card">
      <h2 class="section-title">Durée de la partie</h2>
      <div class="drink-round-presets">${[10,20,40,60,80,100].map(value => `<button type="button" class="choice-pill ${game.roundCount === value ? "active" : ""}" data-drink-round="${value}" ${disabled}>${value}</button>`).join("")}</div>
      <div class="form-group top-gap"><label for="${prefix}DrinkRounds">Nombre personnalisé</label><input id="${prefix}DrinkRounds" type="number" min="10" max="100" value="${game.roundCount}" class="text-input" ${disabled}></div>
    </section>
    <section class="card drink-settings-card">
      <div class="drink-heading"><div><h2 class="section-title">Thèmes</h2><p>Un, plusieurs ou tous. Le mélange reste équilibré.</p></div>${readOnly ? "" : `<div class="toolbar"><button type="button" class="secondary-btn" id="${prefix}DrinkAllThemes">Tous</button><button type="button" class="secondary-btn" id="${prefix}DrinkNoThemes">Aucun</button></div>`}</div>
      <div class="drink-theme-grid">${AK_DRINK_THEMES.map(theme => `<label class="drink-theme-option ${game.drinkThemes.includes(theme.id) ? "active" : ""}"><input type="checkbox" data-drink-theme="${theme.id}" ${game.drinkThemes.includes(theme.id) ? "checked" : ""} ${disabled}><span>${theme.icon}</span><strong>${escapeHtml(theme.label)}</strong></label>`).join("")}</div>
    </section>
    <section class="card drink-settings-card"><h2 class="section-title">Ambiance</h2><div class="drink-mood-grid">${AK_DRINK_MOODS.map(mood => `<button type="button" class="drink-mood-option mood-${mood.id} ${game.drinkMoods.includes(mood.id) ? "active" : ""}" data-drink-mood="${mood.id}" ${disabled}><span>${mood.icon}</span><strong>${escapeHtml(mood.label)}</strong><small>${escapeHtml(mood.description)}</small></button>`).join("")}</div></section>
    <label class="option-card premium-toggle"><input id="${prefix}DrinkAdult" type="checkbox" ${game.drinkIncludeAdult ? "checked" : ""} ${disabled}><span><strong>🔞 Ajouter les 200 cartes adultes</strong><br><span class="helper">Séduction, ex, rendez-vous et confessions plus intimes.</span></span></label>
    <label class="option-card"><input id="${prefix}DrinkHydration" type="checkbox" ${game.drinkHydration ? "checked" : ""} ${disabled}><span><strong>💧 Rappels d’eau automatiques</strong><br><span class="helper">Une pause hydratation remplace environ une carte sur dix.</span></span></label>
    ${readOnly ? "" : `<section class="card drink-settings-card"><h2 class="section-title">Mes cartes</h2><p class="helper">Ajoute une carte qui restera sur cet appareil.</p><div class="form-group top-gap"><label for="${prefix}DrinkCustomText">Texte</label><textarea id="${prefix}DrinkCustomText" class="text-input" maxlength="240" rows="3" placeholder="Ex. À deux, racontez chacun votre pire achat impulsif."></textarea></div><div class="drink-custom-grid"><div class="form-group"><label for="${prefix}DrinkCustomTheme">Thème</label><select id="${prefix}DrinkCustomTheme" class="text-input">${themeOptions}</select></div><div class="form-group"><label for="${prefix}DrinkCustomMood">Ambiance</label><select id="${prefix}DrinkCustomMood" class="text-input">${AK_DRINK_MOODS.map(item => `<option value="${item.id}">${item.icon} ${escapeHtml(item.label)}</option>`).join("")}</select></div><div class="form-group"><label for="${prefix}DrinkCustomFormat">Format</label><select id="${prefix}DrinkCustomFormat" class="text-input">${AK_DRINK_FORMATS.map(item => `<option value="${item.id}">${item.icon} ${escapeHtml(item.label)}</option>`).join("")}</select></div></div><button type="button" id="${prefix}DrinkAddCustom" class="secondary-btn full">Ajouter la carte</button>${customs.length ? `<label class="option-card mini-option top-gap"><input id="${prefix}DrinkIncludeCustom" type="checkbox" ${game.drinkIncludeCustom ? "checked" : ""}><span><strong>Inclure mes ${customs.length} carte${customs.length > 1 ? "s" : ""}</strong></span></label><details class="top-gap"><summary>Gérer mes cartes</summary><div class="drink-custom-list">${customs.map(item => `<article><div>${akDrinkBadges(item)}<p>${escapeHtml(item.text)}</p></div><button type="button" class="danger-btn" data-remove-drink-custom="${item.id}">Supprimer</button></article>`).join("")}</div></details>` : ""}</section>`}
  `;
}
function akDrinkBindSetup(game, prefix, rerender, readOnly = false) {
  if (readOnly) return;
  document.querySelectorAll("[data-drink-round]").forEach(button => button.addEventListener("click", () => { game.roundCount = Number(button.dataset.drinkRound); rerender(); }));
  document.querySelector(`#${prefix}DrinkRounds`)?.addEventListener("change", event => {
    game.roundCount = Math.max(10, Math.min(100, Number(event.target.value) || 20));
    event.target.value = game.roundCount;
  });
  document.querySelectorAll("[data-drink-theme]").forEach(input => input.addEventListener("change", () => {
    const theme = input.dataset.drinkTheme;
    game.drinkThemes = input.checked ? [...new Set([...game.drinkThemes, theme])] : game.drinkThemes.filter(value => value !== theme);
    input.closest(".drink-theme-option")?.classList.toggle("active", input.checked);
  }));
  document.querySelectorAll("[data-drink-mood]").forEach(button => button.addEventListener("click", () => {
    const mood = button.dataset.drinkMood;
    const next = game.drinkMoods.includes(mood) ? game.drinkMoods.filter(value => value !== mood) : [...game.drinkMoods, mood];
    if (!next.length) return alert("Garde au moins une ambiance.");
    game.drinkMoods = next;
    rerender();
  }));
  document.querySelector(`#${prefix}DrinkAllThemes`)?.addEventListener("click", () => { game.drinkThemes = AK_DRINK_THEMES.map(item => item.id); rerender(); });
  document.querySelector(`#${prefix}DrinkNoThemes`)?.addEventListener("click", () => { game.drinkThemes = []; rerender(); });
  document.querySelector(`#${prefix}DrinkAdult`)?.addEventListener("change", event => { game.drinkIncludeAdult = event.target.checked; });
  document.querySelector(`#${prefix}DrinkHydration`)?.addEventListener("change", event => { game.drinkHydration = event.target.checked; });
  document.querySelector(`#${prefix}DrinkIncludeCustom`)?.addEventListener("change", event => { game.drinkIncludeCustom = event.target.checked; });
  document.querySelector(`#${prefix}DrinkAddCustom`)?.addEventListener("click", () => {
    const text = document.querySelector(`#${prefix}DrinkCustomText`)?.value || "";
    const theme = document.querySelector(`#${prefix}DrinkCustomTheme`)?.value || "mini_challenge";
    const mood = document.querySelector(`#${prefix}DrinkCustomMood`)?.value || "party";
    const format = document.querySelector(`#${prefix}DrinkCustomFormat`)?.value || "solo";
    const item = akDrinkCreateCustom(text, theme, mood, format);
    if (!item) return alert("Écris d’abord le texte de la carte.");
    if (game.drinkCustomCards.some(row => row.text.toLocaleLowerCase("fr") === item.text.toLocaleLowerCase("fr"))) return alert("Cette carte existe déjà.");
    game.drinkCustomCards = [...game.drinkCustomCards, item].slice(-150);
    game.drinkIncludeCustom = true;
    akDrinkSaveCustom(game.drinkCustomCards);
    rerender();
  });
  document.querySelectorAll("[data-remove-drink-custom]").forEach(button => button.addEventListener("click", () => {
    game.drinkCustomCards = game.drinkCustomCards.filter(item => item.id !== button.dataset.removeDrinkCustom);
    game.drinkIncludeCustom = game.drinkIncludeCustom && game.drinkCustomCards.length > 0;
    akDrinkSaveCustom(game.drinkCustomCards);
    rerender();
  }));
}
function akDrinkBuildPool(raw, game) {
  const themes = new Set(game.drinkThemes || []);
  const moods = new Set(game.drinkMoods || []);
  let pool = (Array.isArray(raw) ? raw : []).filter(item => moods.has(item.mood) && (item.adult ? game.drinkIncludeAdult : themes.has(item.theme)));
  if (game.drinkIncludeCustom) {
    pool = pool.concat((game.drinkCustomCards || []).filter(item => moods.has(item.mood) && (item.adult ? game.drinkIncludeAdult : themes.has(item.theme))));
  }
  return pool;
}
function akDrinkBalancedSelect(pool, count) {
  const recent = new Set(akDrinkReadRecent());
  const buckets = new Map();
  (pool || []).forEach(item => {
    const key = `${item.theme || "other"}:${item.mood || "party"}:${item.format || "solo"}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(item);
  });
  const keys = shuffleArray([...buckets.keys()]);
  keys.forEach(key => {
    const rows = buckets.get(key);
    buckets.set(key, [...shuffleArray(rows.filter(item => !recent.has(item.id))), ...shuffleArray(rows.filter(item => recent.has(item.id)))]);
  });
  const selected = [];
  while (selected.length < count) {
    let added = false;
    for (const key of keys) {
      const row = buckets.get(key)?.shift();
      if (!row) continue;
      selected.push(row); added = true;
      if (selected.length >= count) break;
    }
    if (!added) break;
  }
  localStorage.setItem(AK_DRINK_RECENT_KEY, JSON.stringify([...akDrinkReadRecent(), ...selected.map(item => item.id)].slice(-220)));
  return selected;
}
function akDrinkHydrationCard(index) {
  const texts = [
    "Pause eau générale. Prenez quelques gorgées d’eau et vérifiez que tout le monde va bien.",
    "Hydratation express : eau, boisson sans alcool ou pause tranquille pour tout le groupe.",
    "La carte sage prend le contrôle : posez les verres alcoolisés et faites une vraie pause eau.",
    "Point météo du groupe : eau, respiration et vérification que chacun souhaite continuer."
  ];
  return { id: `drink_water_${index}`, text: texts[index % texts.length], theme: "group", mood: "calm", format: "group", hydration: true, adult: false };
}
function akDrinkPrepareItems(items, players, hydration = true) {
  const safePlayers = players || [];
  const result = items.map((item, index) => {
    const lead = safePlayers[index % Math.max(1, safePlayers.length)];
    let ids = lead ? [lead.id] : [];
    if (item.format === "duo" && safePlayers.length > 1) {
      const partner = safePlayers[(index + 1 + Math.floor(index / safePlayers.length)) % safePlayers.length];
      ids = [lead.id, partner.id].filter((id, pos, arr) => id && arr.indexOf(id) === pos);
    } else if (["group", "rule"].includes(item.format)) {
      ids = safePlayers.map(player => player.id);
    }
    return { ...item, leadPlayerId: lead?.id || ids[0] || null, assignedPlayerIds: ids };
  });
  if (hydration && result.length >= 10) {
    for (let index = 9; index < result.length; index += 10) {
      const water = akDrinkHydrationCard(index);
      result[index] = { ...water, leadPlayerId: safePlayers[index % safePlayers.length]?.id || null, assignedPlayerIds: safePlayers.map(player => player.id) };
    }
  }
  return result;
}
function akDrinkParticipants(item, players = state.players) {
  return (item?.assignedPlayerIds || []).map(id => players.find(player => player.id === id)).filter(Boolean);
}
function akDrinkHeadline(item, players = state.players) {
  if (item?.hydration) return "Tout le groupe fait une pause";
  const names = akDrinkParticipants(item, players).map(player => player.name);
  if (item?.format === "duo" && names.length >= 2) return `${names[0]} embarque ${names[1]}`;
  if (["group", "rule"].includes(item?.format)) return "Tout le groupe participe";
  return names[0] ? `C’est au tour de ${names[0]}` : "Carte collective";
}
function akDrinkParticipantCards(item, players = state.players) {
  return akDrinkParticipants(item, players).map(player => `<article><span>${avatarById(player.avatarId).emoji}</span><strong>${escapeHtml(player.name)}</strong></article>`).join("");
}
function akDrinkNextRules(rules, item, success) {
  const next = (rules || []).map(rule => ({ ...rule, remaining: Number(rule.remaining || 0) - 1 })).filter(rule => rule.remaining > 0);
  if (success && item?.format === "rule") next.push({ id: item.id, text: item.text, remaining: Number(item.ruleTurns || 3) });
  return next;
}

const akDrinkBaseResetMega = resetMegaGame;
resetMegaGame = function (gameName, replayConfig = {}) {
  akDrinkBaseResetMega(gameName, replayConfig);
  if (gameName === "Jeux à boire") akDrinkEnsure(state.megaGame, replayConfig);
};

const akDrinkBaseRenderSetup = renderMegaSetup;
renderMegaSetup = function () {
  const game = state.megaGame;
  if (!akDrinkIsGame(game) || (typeof isMultiplayer === "function" && isMultiplayer())) return akDrinkBaseRenderSetup();
  akDrinkEnsure(game);
  clearV014Timer();
  title.textContent = "Jeux à boire";
  setBackVisible(true);
  screen.innerHTML = `
    <section class="game-cover game-cover-mega drink-cover"><span class="game-cover-icon">🥂</span><div><small>SOIRÉE RESPONSABLE</small><h2>Jeux à boire</h2><p>700 cartes variées, sans score, sans shot et sans obligation de boire.</p></div></section>
    ${akDrinkSetupMarkup(game, "solo")}
    <div class="responsible-callout">💧 Petites gorgées seulement. Eau et boissons sans alcool sont toujours valables. Chacun peut passer sans justification.</div>
    <button id="startDrinkGame" class="primary-btn full">Lancer la soirée</button>`;
  akDrinkBindSetup(game, "solo", renderMegaSetup);
  document.querySelector("#startDrinkGame")?.addEventListener("click", startMegaGame);
};

const akDrinkBaseStartMega = startMegaGame;
startMegaGame = async function () {
  const game = state.megaGame;
  if (!akDrinkIsGame(game) || (typeof isMultiplayer === "function" && isMultiplayer())) return akDrinkBaseStartMega();
  akDrinkEnsure(game);
  const hasClassic = game.drinkThemes.length > 0;
  const hasAdult = game.drinkIncludeAdult;
  const hasCustom = game.drinkIncludeCustom && game.drinkCustomCards.length > 0;
  if (!hasClassic && !hasAdult && !hasCustom) return alert("Choisis au moins un thème ou active une carte personnalisée.");
  screen.innerHTML = `<div class="notice">Mélange des 700 cartes…</div>`;
  try {
    const raw = await loadJsonFile("data/jeux-a-boire.json", "Impossible de charger Jeux à boire.");
    const pool = akDrinkBuildPool(raw, game);
    if (!pool.length) throw new Error("Aucune carte ne correspond aux filtres choisis.");
    game.items = akDrinkPrepareItems(akDrinkBalancedSelect(pool, Math.min(game.roundCount, pool.length)), state.players, game.drinkHydration);
    game.currentIndex = 0; game.rounds = []; game.activeRules = []; game.revealed = true;
    game.scores = v014ScoreMap();
    renderMegaCurrent();
  } catch (error) {
    console.error(error); alert(error.message || "Impossible de lancer la partie."); renderMegaSetup();
  }
};

const akDrinkBaseRenderTurn = renderMegaTurn;
renderMegaTurn = function () {
  const game = state.megaGame;
  if (!akDrinkIsGame(game)) return akDrinkBaseRenderTurn();
  const item = game.items[game.currentIndex];
  if (!item) return renderMegaFinal();
  title.textContent = "Jeux à boire";
  setBackVisible(false);
  const participants = akDrinkParticipants(item);
  screen.innerHTML = `
    ${v014Progress(game, "Carte")}
    ${akDrinkActiveRulesMarkup(game.activeRules)}
    <section class="drink-round-card ${item.hydration ? "hydration-card" : ""}">
      ${akDrinkBadges(item)}
      <div class="drink-round-icon">${item.hydration ? "💧" : akDrinkTheme(item.theme).icon}</div>
      <p class="drink-assignment">${escapeHtml(akDrinkHeadline(item))}</p>
      ${participants.length ? `<div class="drink-participant-row">${akDrinkParticipantCards(item)}</div>` : ""}
      <h2>${escapeHtml(item.text)}</h2>
      ${item.format === "rule" ? `<small>Cette règle restera active pendant ${Number(item.ruleTurns || 3)} cartes si vous la validez.</small>` : `<small>Boire n’est jamais obligatoire. Une réponse, de l’eau ou un passage conviennent aussi.</small>`}
    </section>
    <section class="decision-grid"><button id="drinkDone" class="primary-btn">✓ Carte terminée</button><button id="drinkSkip" class="secondary-btn">Passer</button></section>`;
  document.querySelector("#drinkDone")?.addEventListener("click", () => finishMegaTurn(true));
  document.querySelector("#drinkSkip")?.addEventListener("click", () => finishMegaTurn(false));
};

const akDrinkBaseFinishTurn = finishMegaTurn;
finishMegaTurn = function (success) {
  const game = state.megaGame;
  if (!akDrinkIsGame(game)) return akDrinkBaseFinishTurn(success);
  const item = game.items[game.currentIndex];
  game.activeRules = akDrinkNextRules(game.activeRules, item, success);
  game.rounds.push({ itemId: item?.id || "", success: Boolean(success), format: item?.format || "solo", hydration: Boolean(item?.hydration) });
  game.currentIndex += 1;
  renderMegaCurrent();
};

const akDrinkBaseMegaFinal = renderMegaFinal;
renderMegaFinal = function () {
  const game = state.megaGame;
  if (!akDrinkIsGame(game)) return akDrinkBaseMegaFinal();
  const passed = (game.rounds || []).filter(round => !round.success).length;
  const water = (game.rounds || []).filter(round => round.hydration).length;
  const rules = (game.rounds || []).filter(round => round.success && round.format === "rule").length;
  title.textContent = "Soirée terminée";
  setBackVisible(false);
  screen.innerHTML = `
    <section class="winner-stage winner-stage-v07 mega-final-stage scoreless-final"><div class="winner-crown">🥂💧</div><h2>La partie est terminée</h2><p>Aucun classement : le but était de jouer ensemble, pas de compter les verres.</p></section>
    <section class="drink-final-stats"><article><span>🎴</span><strong>${game.rounds.length}</strong><small>cartes jouées</small></article><article><span>💧</span><strong>${water}</strong><small>pauses eau</small></article><article><span>📜</span><strong>${rules}</strong><small>règles activées</small></article><article><span>⏭️</span><strong>${passed}</strong><small>passages libres</small></article></section>
    <div class="responsible-callout">💧 Avant de changer de jeu : eau, encas et vérification que tout le monde va bien.</div>
    <div class="toolbar"><button id="replayDrink" class="secondary-btn">Rejouer</button><button id="otherDrink" class="primary-btn">Autre jeu</button></div>`;
  document.querySelector("#replayDrink")?.addEventListener("click", () => {
    const replay = { roundCount: game.roundCount, drinkThemes: game.drinkThemes, drinkMoods: game.drinkMoods, drinkIncludeAdult: game.drinkIncludeAdult, drinkIncludeCustom: game.drinkIncludeCustom, drinkHydration: game.drinkHydration };
    resetMegaGame("Jeux à boire", replay); renderMegaSetup();
  });
  document.querySelector("#otherDrink")?.addEventListener("click", () => { state.megaGame = null; renderPlayChoice(); });
};

/* AKGAMES JE N'AI JAMAIS 600 V1 */
const AK_NEVER_THEMES = [
  { id: "quotidien", icon: "🏠", label: "Quotidien" },
  { id: "petites_hontes", icon: "😳", label: "Petites hontes" },
  { id: "amitie_soirees", icon: "🎉", label: "Amitié & soirées" },
  { id: "ecole_travail", icon: "💼", label: "École & travail" },
  { id: "telephone_reseaux", icon: "📱", label: "Téléphone & réseaux" },
  { id: "mensonges_secrets", icon: "🤫", label: "Mensonges & secrets" },
  { id: "voyages_aventures", icon: "🧳", label: "Voyages & aventures" },
  { id: "nourriture", icon: "🍕", label: "Nourriture" },
  { id: "famille", icon: "🏡", label: "Famille" },
  { id: "amour_seduction", icon: "💘", label: "Amour & séduction" },
  { id: "argent_achats", icon: "🛍️", label: "Argent & achats" },
  { id: "absurde_improbable", icon: "🛸", label: "Absurde & improbable" }
];
const AK_NEVER_CUSTOM_KEY = "akgames_never_custom_v1";

function akNeverReadCustom() {
  try {
    const rows = JSON.parse(localStorage.getItem(AK_NEVER_CUSTOM_KEY) || "[]");
    return Array.isArray(rows) ? rows.filter(row => row && typeof row.text === "string") : [];
  } catch {
    return [];
  }
}
function akNeverSaveCustom(rows) {
  localStorage.setItem(AK_NEVER_CUSTOM_KEY, JSON.stringify((rows || []).slice(-150)));
}
function akNeverNormalizeText(value) {
  const clean = String(value || "").trim().replace(/\s+/g, " ");
  if (!clean) return "";
  return /^Je n[’']ai jamais\s/i.test(clean)
    ? clean
    : `Je n’ai jamais ${clean.charAt(0).toLowerCase()}${clean.slice(1)}`;
}
function akNeverEnsure(game, config = {}) {
  if (!game || game.type !== "never") return game;
  const allThemes = AK_NEVER_THEMES.map(theme => theme.id);
  game.neverThemes = Array.isArray(config.neverThemes)
    ? [...new Set(config.neverThemes)]
    : (Array.isArray(game.neverThemes) ? game.neverThemes : allThemes);
  game.neverCustomCards = akNeverReadCustom();
  game.neverIncludeCustom = config.neverIncludeCustom ?? game.neverIncludeCustom ?? (game.neverCustomCards.length > 0);
  game.roundCount = Number(config.roundCount || game.roundCount || 20);
  return game;
}
function akNeverSetupMarkup(game, prefix = "never", readOnly = false) {
  akNeverEnsure(game);
  const disabled = readOnly ? "disabled" : "";
  const custom = game.neverCustomCards || [];
  return `
    <section class="card never-settings-card">
      <h2 class="section-title">Durée de la partie</h2>
      <div class="never-round-grid">
        ${[10, 20, 30, 50, 75, 100].map(value => `<button type="button" class="choice-pill ${game.roundCount === value ? "active" : ""}" data-never-round="${value}" ${disabled}>${value}</button>`).join("")}
      </div>
    </section>
    <section class="card never-settings-card">
      <div class="never-heading">
        <div><h2 class="section-title">Thèmes</h2><p class="helper">Choisis-en un, plusieurs ou mélange les douze.</p></div>
        ${readOnly ? "" : `<div class="toolbar"><button type="button" id="${prefix}AllThemes" class="secondary-btn">Tous</button><button type="button" id="${prefix}NoThemes" class="secondary-btn">Aucun</button></div>`}
      </div>
      <div class="never-theme-grid">
        ${AK_NEVER_THEMES.map(theme => `<label class="never-theme-option ${game.neverThemes.includes(theme.id) ? "active" : ""}">
          <input type="checkbox" data-never-theme="${theme.id}" ${game.neverThemes.includes(theme.id) ? "checked" : ""} ${disabled}>
          <span>${theme.icon}</span><strong>${escapeHtml(theme.label)}</strong>
        </label>`).join("")}
      </div>
    </section>
    ${readOnly ? "" : `<section class="card never-settings-card">
      <h2 class="section-title">Mes phrases</h2>
      <p class="helper">Elles restent enregistrées uniquement sur cet appareil.</p>
      <div class="form-group top-gap">
        <label for="${prefix}CustomText">Nouvelle phrase</label>
        <textarea id="${prefix}CustomText" class="text-input" maxlength="220" rows="3" placeholder="Ex. Je n’ai jamais dormi dans une tente."></textarea>
      </div>
      <button type="button" id="${prefix}AddCustom" class="secondary-btn full">Ajouter la phrase</button>
      ${custom.length ? `<label class="option-card mini-option top-gap"><input id="${prefix}IncludeCustom" type="checkbox" ${game.neverIncludeCustom ? "checked" : ""}><span><strong>Inclure mes ${custom.length} phrase${custom.length > 1 ? "s" : ""}</strong></span></label>
      <details class="top-gap"><summary>Gérer mes phrases</summary><div class="never-custom-list">${custom.map(item => `<article><p>${escapeHtml(item.text)}</p><button type="button" class="danger-btn" data-remove-never-custom="${item.id}">Supprimer</button></article>`).join("")}</div></details>` : ""}
    </section>`}`;
}
function akNeverBindSetup(game, prefix, rerender) {
  document.querySelectorAll("[data-never-round]").forEach(button => button.addEventListener("click", () => {
    game.roundCount = Number(button.dataset.neverRound);
    rerender();
  }));
  document.querySelectorAll("[data-never-theme]").forEach(input => input.addEventListener("change", () => {
    const theme = input.dataset.neverTheme;
    game.neverThemes = input.checked
      ? [...new Set([...game.neverThemes, theme])]
      : game.neverThemes.filter(value => value !== theme);
    input.closest(".never-theme-option")?.classList.toggle("active", input.checked);
  }));
  document.querySelector(`#${prefix}AllThemes`)?.addEventListener("click", () => {
    game.neverThemes = AK_NEVER_THEMES.map(theme => theme.id);
    rerender();
  });
  document.querySelector(`#${prefix}NoThemes`)?.addEventListener("click", () => {
    game.neverThemes = [];
    rerender();
  });
  document.querySelector(`#${prefix}IncludeCustom`)?.addEventListener("change", event => {
    game.neverIncludeCustom = event.target.checked;
  });
  document.querySelector(`#${prefix}AddCustom`)?.addEventListener("click", () => {
    const text = akNeverNormalizeText(document.querySelector(`#${prefix}CustomText`)?.value);
    if (!text) return alert("Écris d’abord une phrase.");
    if (game.neverCustomCards.some(item => item.text.toLocaleLowerCase("fr") === text.toLocaleLowerCase("fr"))) {
      return alert("Cette phrase existe déjà.");
    }
    const item = {
      id: `jamais_perso_${Date.now()}`,
      text,
      category: "classic",
      theme: "personnalise",
      level: "custom",
      alcoholCompatible: true,
      custom: true
    };
    game.neverCustomCards = [...game.neverCustomCards, item].slice(-150);
    game.neverIncludeCustom = true;
    akNeverSaveCustom(game.neverCustomCards);
    rerender();
  });
  document.querySelectorAll("[data-remove-never-custom]").forEach(button => button.addEventListener("click", () => {
    game.neverCustomCards = game.neverCustomCards.filter(item => item.id !== button.dataset.removeNeverCustom);
    game.neverIncludeCustom = game.neverIncludeCustom && game.neverCustomCards.length > 0;
    akNeverSaveCustom(game.neverCustomCards);
    rerender();
  }));
}
function akNeverBuildPool(classicRows, game) {
  const selected = new Set(game.neverThemes || []);
  let pool = (Array.isArray(classicRows) ? classicRows : []).filter(item => selected.has(item.theme));
  if (game.neverIncludeCustom) pool = pool.concat(game.neverCustomCards || []);
  return pool;
}

const akNeverBaseReset = resetAmbiancePollState;
resetAmbiancePollState = function (type, forceAdult = false, config = {}) {
  akNeverBaseReset(type, forceAdult, config);
  if (type === "never") {
    const neverConfig = { ...config };
    if (!Object.prototype.hasOwnProperty.call(config, "roundCount")) neverConfig.roundCount = 20;
    akNeverEnsure(state.ambiancePoll, neverConfig);
  }
};

const akNeverBaseRenderSetup = renderAmbiancePollSetup;
renderAmbiancePollSetup = function () {
  const game = state.ambiancePoll;
  if (!game || game.type !== "never" || game.forceAdult) return akNeverBaseRenderSetup();
  akNeverEnsure(game);
  title.textContent = "Je n’ai jamais";
  setBackVisible(true);
  screen.innerHTML = `
    <section class="game-cover game-cover-never">
      <span class="game-cover-icon">🙋</span>
      <div><small>600 PHRASES · 12 THÈMES</small><h2>Je n’ai jamais</h2><p>Répondez en secret, puis découvrez les expériences communes du groupe.</p></div>
    </section>
    ${akNeverSetupMarkup(game, "never")}
    ${state.adult ? `<label class="option-card premium-toggle"><input id="pollAdult" type="checkbox" ${game.includeAdult ? "checked" : ""}><span><strong>🌶️ Ajouter les cartes adultes</strong><br><span class="helper">Elles se mélangent aux thèmes classiques sélectionnés.</span></span></label>` : ""}
    <button id="startPollGame" class="primary-btn full">Lancer la partie</button>`;
  akNeverBindSetup(game, "never", renderAmbiancePollSetup);
  document.querySelector("#pollAdult")?.addEventListener("change", event => {
    game.includeAdult = event.target.checked;
  });
  document.querySelector("#startPollGame")?.addEventListener("click", startAmbiancePollGame);
};

const akNeverBaseStart = startAmbiancePollGame;
startAmbiancePollGame = async function () {
  const game = state.ambiancePoll;
  if (!game || game.type !== "never" || game.forceAdult) return akNeverBaseStart();
  akNeverEnsure(game);
  const hasThemes = game.neverThemes.length > 0;
  const hasCustom = game.neverIncludeCustom && game.neverCustomCards.length > 0;
  const hasAdult = state.adult && game.includeAdult;
  if (!hasThemes && !hasCustom && !hasAdult) {
    return alert("Choisis au moins un thème, une phrase personnalisée ou le pack adulte.");
  }
  screen.innerHTML = `<div class="notice">Mélange des 600 phrases…</div>`;
  try {
    const classic = await loadJsonFile("data/je-nai-jamais.json", "Impossible de charger les phrases.");
    let pool = akNeverBuildPool(classic, game);
    if (hasAdult) {
      pool = pool.concat(await loadJsonFile("data/je-nai-jamais-adulte.json", "Impossible de charger les phrases adultes."));
    }
    if (!pool.length) throw new Error("Aucune phrase ne correspond aux choix sélectionnés.");
    game.items = selectFreshItems(pool, Math.min(game.roundCount, pool.length), "solo:never-have-i-ever:themes");
    game.currentIndex = 0;
    game.currentVoterIndex = 0;
    game.votes = {};
    game.scores = Object.fromEntries(state.players.map(player => [player.id, 0]));
    game.rounds = [];
    renderAmbiancePollGate();
  } catch (error) {
    console.error(error);
    alert(error.message || "Impossible de lancer la partie.");
    renderAmbiancePollSetup();
  }
};


/* AKGAMES JE N'AI JAMAIS ADULTE 400 V2 */
const AK_NEVER_ADULT_THEMES = [
  { id: "attirance_seduction", icon: "💋", label: "Attirance & séduction" },
  { id: "dates_rencontres", icon: "🍸", label: "Dates & rencontres" },
  { id: "ex_relations", icon: "💔", label: "Ex & anciennes relations" },
  { id: "jalousie_fidelite", icon: "👀", label: "Jalousie & fidélité" },
  { id: "messages_photos", icon: "📱", label: "Messages & photos" },
  { id: "experiences_intimes", icon: "🔥", label: "Expériences intimes" },
  { id: "fantasmes_curiosites", icon: "💭", label: "Fantasmes & curiosités" },
  { id: "plans_sans_engagement", icon: "🌙", label: "Sans engagement" },
  { id: "secrets_dossiers", icon: "🤐", label: "Secrets & dossiers" },
  { id: "limites_communication", icon: "🛡️", label: "Limites & communication" }
];
const AK_NEVER_ADULT_LEVELS = [
  { id: "soft", icon: "🌶️", label: "Léger", help: "Flirts, dates et confidences accessibles." },
  { id: "spicy", icon: "🔥", label: "Osé", help: "Expériences et révélations plus intimes." },
  { id: "unfiltered", icon: "☢️", label: "Sans filtre", help: "Les cartes les plus directes du paquet." }
];
const AK_NEVER_ADULT_CUSTOM_KEY = "akgames_never_adult_custom_v1";

function akNeverAdultReadCustom() {
  try {
    const rows = JSON.parse(localStorage.getItem(AK_NEVER_ADULT_CUSTOM_KEY) || "[]");
    return Array.isArray(rows) ? rows.filter(row => row && typeof row.text === "string") : [];
  } catch {
    return [];
  }
}
function akNeverAdultSaveCustom(rows) {
  localStorage.setItem(AK_NEVER_ADULT_CUSTOM_KEY, JSON.stringify((rows || []).slice(-150)));
}
function akNeverAdultEnsure(game, config = {}) {
  if (!game || game.type !== "never" || !game.forceAdult) return game;
  const allThemes = AK_NEVER_ADULT_THEMES.map(theme => theme.id);
  const allLevels = AK_NEVER_ADULT_LEVELS.map(level => level.id);
  game.neverAdultThemes = Array.isArray(config.neverAdultThemes)
    ? [...new Set(config.neverAdultThemes)]
    : (Array.isArray(game.neverAdultThemes) ? game.neverAdultThemes : allThemes);
  game.neverAdultLevels = Array.isArray(config.neverAdultLevels)
    ? [...new Set(config.neverAdultLevels)]
    : (Array.isArray(game.neverAdultLevels) ? game.neverAdultLevels : allLevels);
  game.neverAdultCustomCards = akNeverAdultReadCustom();
  game.neverAdultIncludeCustom = config.neverAdultIncludeCustom ?? game.neverAdultIncludeCustom ?? (game.neverAdultCustomCards.length > 0);
  game.roundCount = Number(config.roundCount || game.roundCount || 20);
  return game;
}
function akNeverAdultSetupMarkup(game, prefix = "neverAdult", readOnly = false) {
  akNeverAdultEnsure(game);
  const disabled = readOnly ? "disabled" : "";
  const custom = game.neverAdultCustomCards || [];
  return `
    <section class="card never-settings-card">
      <h2 class="section-title">Durée de la partie</h2>
      <div class="never-round-grid">
        ${[10, 20, 30, 50, 75, 100].map(value => `<button type="button" class="choice-pill ${game.roundCount === value ? "active" : ""}" data-never-adult-round="${value}" ${disabled}>${value}</button>`).join("")}
      </div>
    </section>
    <section class="card never-settings-card">
      <h2 class="section-title">Intensité</h2>
      <p class="helper">Tu peux en choisir une, deux ou les trois.</p>
      <div class="never-level-grid">
        ${AK_NEVER_ADULT_LEVELS.map(level => `<label class="never-level-option ${game.neverAdultLevels.includes(level.id) ? "active" : ""}">
          <input type="checkbox" data-never-adult-level="${level.id}" ${game.neverAdultLevels.includes(level.id) ? "checked" : ""} ${disabled}>
          <span>${level.icon}</span><div><strong>${escapeHtml(level.label)}</strong><small>${escapeHtml(level.help)}</small></div>
        </label>`).join("")}
      </div>
    </section>
    <section class="card never-settings-card">
      <div class="never-heading">
        <div><h2 class="section-title">Thèmes adultes</h2><p class="helper">Choisis un ou plusieurs univers.</p></div>
        ${readOnly ? "" : `<div class="toolbar"><button type="button" id="${prefix}AllThemes" class="secondary-btn">Tous</button><button type="button" id="${prefix}NoThemes" class="secondary-btn">Aucun</button></div>`}
      </div>
      <div class="never-theme-grid">
        ${AK_NEVER_ADULT_THEMES.map(theme => `<label class="never-theme-option ${game.neverAdultThemes.includes(theme.id) ? "active" : ""}">
          <input type="checkbox" data-never-adult-theme="${theme.id}" ${game.neverAdultThemes.includes(theme.id) ? "checked" : ""} ${disabled}>
          <span>${theme.icon}</span><strong>${escapeHtml(theme.label)}</strong>
        </label>`).join("")}
      </div>
    </section>
    ${readOnly ? "" : `<section class="card never-settings-card">
      <h2 class="section-title">Mes phrases adultes</h2>
      <p class="helper">Elles restent enregistrées uniquement sur cet appareil.</p>
      <div class="form-group top-gap"><label for="${prefix}CustomText">Nouvelle phrase</label><textarea id="${prefix}CustomText" class="text-input" maxlength="220" rows="3" placeholder="Ex. Je n’ai jamais embrassé quelqu’un rencontré le soir même."></textarea></div>
      <div class="never-custom-meta">
        <select id="${prefix}CustomTheme" class="text-input">${AK_NEVER_ADULT_THEMES.map(theme => `<option value="${theme.id}">${theme.icon} ${escapeHtml(theme.label)}</option>`).join("")}</select>
        <select id="${prefix}CustomLevel" class="text-input">${AK_NEVER_ADULT_LEVELS.map(level => `<option value="${level.id}">${level.icon} ${escapeHtml(level.label)}</option>`).join("")}</select>
      </div>
      <button type="button" id="${prefix}AddCustom" class="secondary-btn full top-gap">Ajouter la phrase</button>
      ${custom.length ? `<label class="option-card mini-option top-gap"><input id="${prefix}IncludeCustom" type="checkbox" ${game.neverAdultIncludeCustom ? "checked" : ""}><span><strong>Inclure mes ${custom.length} phrase${custom.length > 1 ? "s" : ""}</strong></span></label>
      <details class="top-gap"><summary>Gérer mes phrases</summary><div class="never-custom-list">${custom.map(item => `<article><p>${escapeHtml(item.text)}</p><button type="button" class="danger-btn" data-remove-never-adult-custom="${item.id}">Supprimer</button></article>`).join("")}</div></details>` : ""}
    </section>`}`;
}
function akNeverAdultBindSetup(game, prefix, rerender) {
  document.querySelectorAll("[data-never-adult-round]").forEach(button => button.addEventListener("click", () => {
    game.roundCount = Number(button.dataset.neverAdultRound);
    rerender();
  }));
  document.querySelectorAll("[data-never-adult-level]").forEach(input => input.addEventListener("change", () => {
    const level = input.dataset.neverAdultLevel;
    game.neverAdultLevels = input.checked ? [...new Set([...game.neverAdultLevels, level])] : game.neverAdultLevels.filter(value => value !== level);
    input.closest(".never-level-option")?.classList.toggle("active", input.checked);
  }));
  document.querySelectorAll("[data-never-adult-theme]").forEach(input => input.addEventListener("change", () => {
    const theme = input.dataset.neverAdultTheme;
    game.neverAdultThemes = input.checked ? [...new Set([...game.neverAdultThemes, theme])] : game.neverAdultThemes.filter(value => value !== theme);
    input.closest(".never-theme-option")?.classList.toggle("active", input.checked);
  }));
  document.querySelector(`#${prefix}AllThemes`)?.addEventListener("click", () => {
    game.neverAdultThemes = AK_NEVER_ADULT_THEMES.map(theme => theme.id);
    rerender();
  });
  document.querySelector(`#${prefix}NoThemes`)?.addEventListener("click", () => {
    game.neverAdultThemes = [];
    rerender();
  });
  document.querySelector(`#${prefix}IncludeCustom`)?.addEventListener("change", event => {
    game.neverAdultIncludeCustom = event.target.checked;
  });
  document.querySelector(`#${prefix}AddCustom`)?.addEventListener("click", () => {
    const text = akNeverNormalizeText(document.querySelector(`#${prefix}CustomText`)?.value);
    if (!text) return alert("Écris d’abord une phrase.");
    if (game.neverAdultCustomCards.some(item => item.text.toLocaleLowerCase("fr") === text.toLocaleLowerCase("fr"))) return alert("Cette phrase existe déjà.");
    const item = {
      id: `jamais_adulte_perso_${Date.now()}`,
      text,
      category: "adult",
      theme: document.querySelector(`#${prefix}CustomTheme`)?.value || "secrets_dossiers",
      level: document.querySelector(`#${prefix}CustomLevel`)?.value || "spicy",
      alcoholCompatible: true,
      custom: true
    };
    game.neverAdultCustomCards = [...game.neverAdultCustomCards, item].slice(-150);
    game.neverAdultIncludeCustom = true;
    akNeverAdultSaveCustom(game.neverAdultCustomCards);
    rerender();
  });
  document.querySelectorAll("[data-remove-never-adult-custom]").forEach(button => button.addEventListener("click", () => {
    game.neverAdultCustomCards = game.neverAdultCustomCards.filter(item => item.id !== button.dataset.removeNeverAdultCustom);
    game.neverAdultIncludeCustom = game.neverAdultIncludeCustom && game.neverAdultCustomCards.length > 0;
    akNeverAdultSaveCustom(game.neverAdultCustomCards);
    rerender();
  }));
}
function akNeverAdultBuildPool(rows, game) {
  const themes = new Set(game.neverAdultThemes || []);
  const levels = new Set(game.neverAdultLevels || []);
  let pool = (Array.isArray(rows) ? rows : []).filter(item => themes.has(item.theme) && levels.has(item.level));
  if (game.neverAdultIncludeCustom) {
    pool = pool.concat((game.neverAdultCustomCards || []).filter(item => levels.has(item.level) && (themes.has(item.theme) || item.theme === "personnalise")));
  }
  return pool;
}

const akNeverAdultBaseReset = resetAmbiancePollState;
resetAmbiancePollState = function (type, forceAdult = false, config = {}) {
  akNeverAdultBaseReset(type, forceAdult, config);
  if (type === "never" && forceAdult) {
    const adultConfig = { ...config };
    if (!Object.prototype.hasOwnProperty.call(config, "roundCount")) adultConfig.roundCount = 20;
    akNeverAdultEnsure(state.ambiancePoll, adultConfig);
  }
};

const akNeverAdultBaseRenderSetup = renderAmbiancePollSetup;
renderAmbiancePollSetup = function () {
  const game = state.ambiancePoll;
  if (!game || game.type !== "never" || !game.forceAdult) return akNeverAdultBaseRenderSetup();
  akNeverAdultEnsure(game);
  title.textContent = "Je n’ai jamais +18";
  setBackVisible(true);
  screen.innerHTML = `
    <section class="game-cover game-cover-never never-adult-cover">
      <span class="game-cover-icon">🌶️</span>
      <div><small>400 PHRASES · 10 THÈMES · 3 INTENSITÉS</small><h2>Je n’ai jamais +18</h2><p>Des révélations adultes variées, du flirt léger aux cartes sans filtre.</p></div>
    </section>
    ${akNeverAdultSetupMarkup(game, "neverAdult")}
    <div class="responsible-callout">🛡️ Réservé aux adultes consentants. Chacun peut passer une carte ou refuser d’en parler, sans justification.</div>
    <button id="startPollGame" class="primary-btn full">Lancer la partie adulte</button>`;
  akNeverAdultBindSetup(game, "neverAdult", renderAmbiancePollSetup);
  document.querySelector("#startPollGame")?.addEventListener("click", startAmbiancePollGame);
};

const akNeverAdultBaseStart = startAmbiancePollGame;
startAmbiancePollGame = async function () {
  const game = state.ambiancePoll;
  if (!game || game.type !== "never" || !game.forceAdult) return akNeverAdultBaseStart();
  akNeverAdultEnsure(game);
  const hasThemes = game.neverAdultThemes.length > 0;
  const hasLevels = game.neverAdultLevels.length > 0;
  const hasCustom = game.neverAdultIncludeCustom && game.neverAdultCustomCards.length > 0;
  if ((!hasThemes || !hasLevels) && !hasCustom) return alert("Choisis au moins un thème et une intensité.");
  screen.innerHTML = `<div class="notice">Mélange des 400 phrases adultes…</div>`;
  try {
    const rows = await loadJsonFile("data/je-nai-jamais-adulte.json", "Impossible de charger les phrases adultes.");
    const pool = akNeverAdultBuildPool(rows, game);
    if (!pool.length) throw new Error("Aucune phrase ne correspond aux choix sélectionnés.");
    game.items = selectFreshItems(pool, Math.min(game.roundCount, pool.length), "solo:never-have-i-ever:adult:v2");
    game.currentIndex = 0;
    game.currentVoterIndex = 0;
    game.votes = {};
    game.scores = Object.fromEntries(state.players.map(player => [player.id, 0]));
    game.rounds = [];
    renderAmbiancePollGate();
  } catch (error) {
    console.error(error);
    alert(error.message || "Impossible de lancer la partie adulte.");
    renderAmbiancePollSetup();
  }
};
