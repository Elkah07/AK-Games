/* =========================================================
   AK'GAMES V4.14 — RÉGLAGES + PARCOURS JOUEURS
   Apparence, confort, mascottes, contenu et données locales
   ========================================================= */
(() => {
  const STORAGE_KEY = "akgames_settings_v2";
  const VERSION_LABEL = "V4.14";
  const DEFAULTS = Object.freeze({
    theme: "system",
    animations: "normal",
    textSize: "normal",
    highContrast: false,
    fastTransitions: false,
    sounds: true,
    soundVolume: 55,
    vibration: true,
    mascotSounds: true,
    favoriteMascot: "",
    mascotBubbles: true,
    mascotFrequency: "normal",
    mascotAnimations: true,
    defaultRounds: 12,
    defaultTimer: 45,
    defaultAdult: false,
    defaultAlcohol: false,
    allowCustomCards: true,
    recentWindowDays: 30,
    rememberReplaySettings: true,
    roundCountdown: 3,
    keepAwake: true,
    confirmLeaveGame: true,
    hidePrivateAnswers: true,
    handoffScreens: true,
    contentPersonal: true,
    contentPhysical: true,
    contentCouple: true,
    contentPolitics: true,
    contentFamily: true,
    contentDifficult: true
  });

  const VALID = {
    theme: new Set(["system", "dark", "light"]),
    animations: new Set(["normal", "reduced", "off"]),
    textSize: new Set(["small", "normal", "large"]),
    mascotFrequency: new Set(["discreet", "normal", "chatty"]),
    defaultRounds: new Set([8, 10, 12, 15, 20]),
    defaultTimer: new Set([15, 30, 45, 60, 90]),
    recentWindowDays: new Set([0, 7, 30, 90]),
    roundCountdown: new Set([0, 3, 5])
  };

  const boolKeys = new Set([
    "highContrast", "fastTransitions", "sounds", "vibration", "mascotSounds",
    "mascotBubbles", "mascotAnimations", "defaultAdult", "defaultAlcohol",
    "allowCustomCards", "rememberReplaySettings", "keepAwake", "confirmLeaveGame",
    "hidePrivateAnswers", "handoffScreens", "contentPersonal", "contentPhysical",
    "contentCouple", "contentPolitics", "contentFamily", "contentDifficult"
  ]);

  function safeJsonParse(value, fallback) {
    try { return JSON.parse(value); } catch { return fallback; }
  }

  function normalize(raw = {}) {
    const next = { ...DEFAULTS, ...(raw && typeof raw === "object" ? raw : {}) };
    Object.entries(VALID).forEach(([key, values]) => {
      let value = next[key];
      if (["defaultRounds", "defaultTimer", "recentWindowDays", "roundCountdown"].includes(key)) value = Number(value);
      next[key] = values.has(value) ? value : DEFAULTS[key];
    });
    boolKeys.forEach(key => { next[key] = Boolean(next[key]); });
    next.soundVolume = Math.max(0, Math.min(100, Number(next.soundVolume ?? DEFAULTS.soundVolume)));
    next.favoriteMascot = String(next.favoriteMascot || "");
    return next;
  }

  function storageGet(key, fallback = null) {
    try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
  }

  function storageSet(key, value) {
    try { localStorage.setItem(key, value); return true; } catch { return false; }
  }

  let preferences = normalize(safeJsonParse(storageGet(STORAGE_KEY, "{}") || "{}", {}));
  let wakeLock = null;
  let audioContext = null;
  let lastWinnerSoundKey = "";
  let countdownKey = "";
  let countdownBusy = false;
  let autoHandoffKey = "";

  function save() {
    storageSet(STORAGE_KEY, JSON.stringify(preferences));
  }

  function resolvedTheme(mode = preferences.theme) {
    if (mode === "system") return matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    return mode === "light" ? "light" : "dark";
  }

  function applyDocumentPreferences() {
    const root = document.documentElement;
    const body = document.body;
    root.dataset.themeMode = preferences.theme;
    if (typeof applyAKTheme === "function") applyAKTheme(resolvedTheme(), { persist: false });
    else root.dataset.theme = resolvedTheme();

    root.dataset.textSize = preferences.textSize;
    root.dataset.animations = preferences.animations;
    root.dataset.contrast = preferences.highContrast ? "high" : "normal";
    root.dataset.transitions = preferences.fastTransitions ? "fast" : "normal";

    body?.classList.toggle("ak-mascot-animations-off", !preferences.mascotAnimations);
    body?.classList.toggle("ak-custom-content-disabled", !preferences.allowCustomCards);
    body?.classList.toggle("ak-private-mask-enabled", preferences.hidePrivateAnswers);

    const color = resolvedTheme() === "light" ? "#F5F2FF" : "#0B0718";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", color);
    document.querySelector('meta[name="color-scheme"]')?.setAttribute("content", resolvedTheme());

    storageSet("akgames_theme_v1", resolvedTheme());
    syncWakeLock();
  }

  function update(key, value, { persist = true } = {}) {
    const candidate = normalize({ ...preferences, [key]: value });
    preferences = candidate;
    if (persist) save();
    applyDocumentPreferences();
    window.dispatchEvent(new CustomEvent("akgames:settingschange", { detail: { key, value: preferences[key], settings: { ...preferences } } }));
    return preferences[key];
  }

  function get() { return { ...preferences }; }

  async function requestWakeLock() {
    if (!preferences.keepAwake || document.visibilityState !== "visible" || !navigator.wakeLock?.request) return;
    try {
      wakeLock = await navigator.wakeLock.request("screen");
      wakeLock.addEventListener?.("release", () => { wakeLock = null; });
    } catch (error) {
      console.info("Maintien de l’écran indisponible", error);
    }
  }

  async function releaseWakeLock() {
    try { await wakeLock?.release?.(); } catch {}
    wakeLock = null;
  }

  function syncWakeLock() {
    if (preferences.keepAwake) requestWakeLock();
    else releaseWakeLock();
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") syncWakeLock();
    else releaseWakeLock();
  });

  matchMedia("(prefers-color-scheme: light)").addEventListener?.("change", () => {
    if (preferences.theme === "system") applyDocumentPreferences();
  });

  function vibration(pattern = 12) {
    if (!preferences.vibration || !navigator.vibrate) return;
    navigator.vibrate(pattern);
  }

  function playSound(id, options = {}) {
    if (!preferences.sounds || preferences.soundVolume <= 0) return;
    if (window.AKSound?.play) {
      window.AKSound.play(id, options);
      return;
    }
    // Secours très léger si le pack audio n'est pas encore chargé.
    try {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return;
      audioContext ||= new AudioCtor();
      if (audioContext.state === "suspended") audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const now = audioContext.currentTime;
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(id.includes("error") || id.includes("wrong") ? 220 : 620, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime((preferences.soundVolume / 100) * 0.04, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.10);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.11);
    } catch {}
  }

  function tone(kind = "tap") {
    const map = {
      tap: "ui_tap",
      choice: "ui_confirm",
      success: "correct",
      danger: "ui_error",
      back: "ui_back",
      toggleOn: "ui_toggle_on",
      toggleOff: "ui_toggle_off"
    };
    playSound(map[kind] || map.tap);
  }

  document.addEventListener("click", event => {
    const button = event.target.closest("button, .choice-pill, .option-card, .theme-option");
    if (!button || button.disabled) return;
    const dangerous = button.classList.contains("danger-btn");
    const choice = button.matches(".primary-btn, .choice-pill, [data-answer], [data-choice]");
    const id = button.id || "";
    if (id === "backBtn") tone("back");
    else if (id === "settingsBtn") playSound("ui_open_settings");
    else if (dangerous) tone("danger");
    else if (choice) tone("choice");
    else tone("tap");
    vibration(dangerous ? [18, 35, 18] : choice ? 18 : 8);
  }, true);

  document.addEventListener("change", event => {
    const control = event.target;
    if (!control.matches('input[type="checkbox"], input[type="radio"], select')) return;
    if (control.matches('input[type="checkbox"]')) tone(control.checked ? "toggleOn" : "toggleOff");
    else playSound("ui_toggle_on", { gain: .85 });
  }, true);

  const FILTER_RULES = [
    { setting: "contentPersonal", categories: /dossier|confession|intim|secret|personnel|honte|revelation/i, words: /\b(secret|confession|honte|plus gros défaut|pire souvenir|intime|jamais avoué)\b/i },
    { setting: "contentPhysical", categories: /physique|sport|mouvement|mime|danse|performance|défi/i, words: /\b(danse|mime|cours|saute|pompe|gainage|tourne|marche|imite|sans les mains)\b/i },
    { setting: "contentCouple", categories: /couple|relation|crush|seduction|amour|ex|romance/i, words: /\b(couple|partenaire|crush|ex\b|baiser|embrasse|sédui|amoureux|relation amoureuse)\b/i },
    { setting: "contentPolitics", categories: /politique|société|election/i, words: /\b(politique|président|élection|gouvernement|ministre|parti politique|député)\b/i },
    { setting: "contentFamily", categories: /famille|enfance_famille|parents/i, words: /\b(famille|parent|mère|père|frère|sœur|cousin|oncle|tante)\b/i },
    { setting: "contentDifficult", categories: /moral|difficile|existentiel|sombre|survie|crise/i, words: /\b(mourir|mort\b|sacrif|trahir|dilemme moral|existentiel|catastrophe|apocalypse|sauver une seule)\b/i }
  ];

  function itemText(item) {
    if (item == null) return "";
    if (typeof item === "string") return item;
    const fields = [item.category, item.theme, item.pack, item.type, item.question, item.text, item.content, item.title, item.prompt, item.statement, item.situation, item.description];
    return fields.filter(Boolean).join(" ");
  }

  function filterPool(pool) {
    if (!Array.isArray(pool)) return pool;
    return pool.filter(item => {
      if (!preferences.allowCustomCards && item && typeof item === "object" && (item.custom || item.personnalise || item.category === "personnalise" || item.theme === "personnalise")) return false;
      const haystack = itemText(item);
      return FILTER_RULES.every(rule => preferences[rule.setting] || (!rule.categories.test(haystack) && !rule.words.test(haystack)));
    });
  }

  function recentWindowMs() {
    return Number(preferences.recentWindowDays || 0) * 86400000;
  }

  // Mémoire datée, tout en gardant le format historique d’identifiants utilisé par les jeux.
  if (typeof loadRecentContentMemory === "function") {
    loadRecentContentMemory = function loadRecentContentMemoryV411() {
      let memory = {};
      try {
        memory = safeJsonParse(storageGet(AK_RECENT_CONTENT_KEY, "{}") || "{}", {});
        if (!memory || typeof memory !== "object") memory = {};
      } catch { memory = {}; }
      const windowMs = recentWindowMs();
      if (!windowMs) return { __timestamps: {} };
      const now = Date.now();
      const stamps = memory.__timestamps && typeof memory.__timestamps === "object" ? memory.__timestamps : {};
      let changed = false;
      Object.keys(memory).forEach(namespace => {
        if (namespace === "__timestamps" || !Array.isArray(memory[namespace])) return;
        const namespaceStamps = stamps[namespace] && typeof stamps[namespace] === "object" ? stamps[namespace] : {};
        memory[namespace] = memory[namespace].filter(id => {
          const timestamp = Number(namespaceStamps[id] || now);
          if (!namespaceStamps[id]) namespaceStamps[id] = timestamp;
          const keep = now - timestamp <= windowMs;
          if (!keep) delete namespaceStamps[id];
          changed ||= !keep;
          return keep;
        });
        stamps[namespace] = namespaceStamps;
      });
      memory.__timestamps = stamps;
      if (changed) saveRecentContentMemory(memory);
      return memory;
    };

    rememberContentItems = function rememberContentItemsV411(namespace, items, poolSize = 0) {
      if (!namespace || !Array.isArray(items) || !items.length || !preferences.recentWindowDays) return;
      const memory = loadRecentContentMemory();
      const previous = Array.isArray(memory[namespace]) ? memory[namespace] : [];
      const selectedIds = items.map(contentItemId);
      const dayMultiplier = preferences.recentWindowDays >= 90 ? 5 : preferences.recentWindowDays >= 30 ? 3 : 2;
      const cap = Math.max(36, Math.min(600, Number(poolSize || 0) || selectedIds.length * dayMultiplier * 4));
      memory[namespace] = [...selectedIds, ...previous.filter(id => !selectedIds.includes(id))].slice(0, cap);
      memory.__timestamps ||= {};
      memory.__timestamps[namespace] ||= {};
      const now = Date.now();
      selectedIds.forEach(id => { memory.__timestamps[namespace][id] = now; });
      Object.keys(memory.__timestamps[namespace]).forEach(id => {
        if (!memory[namespace].includes(id)) delete memory.__timestamps[namespace][id];
      });
      saveRecentContentMemory(memory);
    };
  }

  function wrapPoolFunction(name) {
    const original = window[name];
    if (typeof original !== "function") return;
    window[name] = function (pool, ...args) { return original.call(this, filterPool(pool), ...args); };
  }

  // Les fonctions globales sont aussi accessibles comme identifiants dans les scripts classiques.
  if (typeof selectFreshItems === "function") {
    const original = selectFreshItems;
    selectFreshItems = function (pool, count, namespace) { return original(filterPool(pool), count, namespace); };
  }
  if (typeof selectBalancedWhoUsItems === "function") {
    const original = selectBalancedWhoUsItems;
    selectBalancedWhoUsItems = function (pool, count, namespace) { return original(filterPool(pool), count, namespace); };
  }
  if (typeof selectBalancedLiarPrompts === "function") {
    const original = selectBalancedLiarPrompts;
    selectBalancedLiarPrompts = function (pool, count, namespace) { return original(filterPool(pool), count, namespace); };
  }
  if (typeof loadJsonFile === "function") {
    const original = loadJsonFile;
    loadJsonFile = async function (...args) {
      const data = await original.apply(this, args);
      return Array.isArray(data) ? filterPool(data) : data;
    };
  }

  function configWithDefaults(config = {}, timerKeys = []) {
    const next = { ...(config || {}) };
    const preserve = preferences.rememberReplaySettings;
    if (!preserve || next.roundCount == null) next.roundCount = preferences.defaultRounds;
    timerKeys.forEach(key => {
      if (!preserve || next[key] == null) next[key] = preferences.defaultTimer;
    });
    return next;
  }

  function patchResetFunction(name, configIndex, timerKeys = []) {
    const original = window[name];
    if (typeof original !== "function") return;
    window[name] = function (...args) {
      const index = configIndex < 0 ? args.length : configIndex;
      while (args.length <= index) args.push(undefined);
      args[index] = configWithDefaults(args[index], timerKeys);
      return original.apply(this, args);
    };
    try { eval(`${name} = window[name]`); } catch {}
  }

  patchResetFunction("resetWhoUsState", 0);
  patchResetFunction("resetBestLiarState", 0);
  patchResetFunction("resetActionTruthState", 1);
  patchResetFunction("resetAmbiancePollState", 2, ["lightningSeconds"]);
  patchResetFunction("resetSameBrainState", 0);
  patchResetFunction("resetMinorityState", 0);
  patchResetFunction("resetWhoAnsweredState", 0);
  patchResetFunction("resetAlmostImpostorState", 0, ["discussionSeconds"]);
  patchResetFunction("resetFakeExpertState", 0, ["speechSeconds"]);
  patchResetFunction("resetWhoAmIState", 0, ["durationSeconds"]);
  patchResetFunction("resetMegaGame", 1, ["durationSeconds"]);

  // Personnage favori proposé automatiquement, sauf s’il est déjà pris.
  if (typeof renderPlayerForm === "function") {
    const originalRenderPlayerForm = renderPlayerForm;
    renderPlayerForm = function (...args) {
      if (!state.draftPlayer?.avatarId && preferences.favoriteMascot) {
        const taken = new Set((state.players || []).map(player => player.avatarId));
        if (!taken.has(preferences.favoriteMascot)) state.draftPlayer.avatarId = preferences.favoriteMascot;
      }
      return originalRenderPlayerForm.apply(this, args);
    };
  }

  // Valeurs de session par défaut, sans réécrire une session déjà commencée.
  if (!state.mode && !(state.players || []).length) {
    state.adult = preferences.defaultAdult;
    state.alcohol = preferences.defaultAlcohol;
  }

  function resetSession() {
    state.mode = null;
    state.adult = preferences.defaultAdult;
    state.alcohol = preferences.defaultAlcohol;
    state.players = [];
    state.draftPlayer = { name: "", avatarId: null };
    state.editingPlayerId = null;
    state.currentCategory = null;
    ["quiDeNous", "laughDuel", "bestLiar", "actionTruth", "ambiancePoll", "sameBrain", "minorityGame", "whoAnswered", "almostImpostor", "fakeExpert", "whoAmI", "megaGame"].forEach(key => { state[key] = null; });
    state.history = [];
    window.AKCharacters?.hidePickerBubble?.(true);
    renderHome();
  }

  function customStorageKeys() {
    const keys = [];
    try {
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (key && /^akgames_/i.test(key) && /(custom|personnal|perso)/i.test(key)) keys.push(key);
      }
    } catch {}
    return keys;
  }

  function exportCustomContent() {
    const storage = {};
    customStorageKeys().forEach(key => { storage[key] = localStorage.getItem(key); });
    const payload = { app: "AK'Games", version: VERSION_LABEL, exportedAt: new Date().toISOString(), storage };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `akgames-contenus-personnalises-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importCustomContent(file) {
    const text = await file.text();
    const data = safeJsonParse(text, null);
    if (!data || typeof data.storage !== "object") throw new Error("Ce fichier n’est pas un export AK’Games valide.");
    let count = 0;
    Object.entries(data.storage).forEach(([key, value]) => {
      if (!/^akgames_/i.test(key) || !/(custom|personnal|perso)/i.test(key) || typeof value !== "string") return;
      localStorage.setItem(key, value);
      count += 1;
    });
    return count;
  }

  async function checkForUpdate(statusNode) {
    statusNode.textContent = "Recherche d’une mise à jour…";
    try {
      const registration = await navigator.serviceWorker?.getRegistration?.();
      if (!registration) throw new Error("Service hors ligne non installé");
      await registration.update();
      if (registration.waiting) {
        statusNode.textContent = "Une mise à jour est prête. Ferme puis rouvre l’application.";
      } else {
        statusNode.textContent = "AK’Games est à jour.";
      }
    } catch {
      statusNode.textContent = "Impossible de vérifier maintenant. Réessaie avec une connexion internet.";
    }
  }

  function switchMarkup(id, label, help, checked) {
    return `<label class="settings-switch-row" for="${id}"><span><strong>${label}</strong><small>${help}</small></span><input id="${id}" type="checkbox" ${checked ? "checked" : ""}></label>`;
  }

  function selectMarkup(id, label, value, options, help = "") {
    return `<label class="settings-select-row" for="${id}"><span><strong>${label}</strong>${help ? `<small>${help}</small>` : ""}</span><select id="${id}" class="text-input">${options.map(([optionValue, optionLabel]) => `<option value="${optionValue}" ${String(value) === String(optionValue) ? "selected" : ""}>${optionLabel}</option>`).join("")}</select></label>`;
  }

  function themeCards() {
    const choices = [
      ["system", "📱", "Automatique", "Suit le téléphone"],
      ["dark", "🌙", "Sombre", "Violet nuit"],
      ["light", "☀️", "Clair", "Lumineux"]
    ];
    return `<div class="theme-choice-grid theme-choice-grid-three" role="radiogroup" aria-label="Thème de l’application">${choices.map(([value, icon, label, help]) => `<label class="theme-option ${preferences.theme === value ? "active" : ""}"><input type="radio" name="enhancedTheme" value="${value}" ${preferences.theme === value ? "checked" : ""}><span aria-hidden="true">${icon}</span><strong>${label}</strong><small>${help}</small></label>`).join("")}</div>`;
  }

  function renderEnhancedSettings() {
    pushScreen("settings-origin");
    title.textContent = "Paramètres";
    setBackVisible(true);
    const mascotOptions = [["", "Aucune préférence"], ...(typeof avatars !== "undefined" ? avatars.map(item => [item.id, `${item.emoji} ${item.name}`]) : [])];

    screen.innerHTML = `
      <section class="settings-intro"><span>⚙️</span><div><small>AK’GAMES ${VERSION_LABEL}</small><h2>Une soirée à ton goût</h2><p>Les préférences sont enregistrées uniquement sur cet appareil.</p></div></section>

      <details class="card settings-group" open>
        <summary><span>🎨</span><div><strong>Apparence</strong><small>Thème, lisibilité et mouvements</small></div></summary>
        <div class="settings-group-body">
          ${themeCards()}
          ${selectMarkup("settingsTextSize", "Taille du texte", preferences.textSize, [["small", "Petite"], ["normal", "Normale"], ["large", "Grande"]])}
          ${selectMarkup("settingsAnimations", "Animations", preferences.animations, [["normal", "Normales"], ["reduced", "Réduites"], ["off", "Désactivées"]])}
          ${switchMarkup("settingsHighContrast", "Contraste renforcé", "Accentue les contours, boutons et zones de réponse.", preferences.highContrast)}
          ${switchMarkup("settingsFastTransitions", "Transitions rapides", "Raccourcit les changements d’écran entre deux tours.", preferences.fastTransitions)}
        </div>
      </details>

      <details class="card settings-group">
        <summary><span>🔊</span><div><strong>Sons et vibrations</strong><small>Retour sonore et haptique</small></div></summary>
        <div class="settings-group-body">
          ${switchMarkup("settingsSounds", "Effets sonores", "Boutons, choix et victoire.", preferences.sounds)}
          <label class="settings-range-row" for="settingsSoundVolume"><span><strong>Volume</strong><small id="settingsSoundVolumeValue">${preferences.soundVolume} %</small></span><input id="settingsSoundVolume" type="range" min="0" max="100" step="5" value="${preferences.soundVolume}" ${preferences.sounds ? "" : "disabled"}></label>
          ${switchMarkup("settingsVibration", "Vibrations", "Petit retour lors des choix et des résultats.", preferences.vibration)}
          ${switchMarkup("settingsMascotSounds", "Sons des mascottes", "Préférence déjà prête pour leurs futures voix.", preferences.mascotSounds)}
        </div>
      </details>

      <details class="card settings-group">
        <summary><span>🐾</span><div><strong>Mascottes</strong><small>Personnage favori et interventions</small></div></summary>
        <div class="settings-group-body">
          ${selectMarkup("settingsFavoriteMascot", "Mascotte favorite", preferences.favoriteMascot, mascotOptions, "Elle sera présélectionnée lorsqu’elle est disponible.")}
          ${switchMarkup("settingsMascotBubbles", "Bulles de dialogue", "Affiche les réactions personnalisées des mascottes.", preferences.mascotBubbles)}
          ${selectMarkup("settingsMascotFrequency", "Fréquence des interventions", preferences.mascotFrequency, [["discreet", "Discrètes"], ["normal", "Normales"], ["chatty", "Très bavardes"]])}
          ${switchMarkup("settingsMascotAnimations", "Animations des mascottes", "Indépendant des autres animations de l’application.", preferences.mascotAnimations)}
        </div>
      </details>

      <details class="card settings-group">
        <summary><span>🎲</span><div><strong>Parties par défaut</strong><small>Réglages proposés au lancement</small></div></summary>
        <div class="settings-group-body">
          ${selectMarkup("settingsDefaultRounds", "Nombre de manches", preferences.defaultRounds, [[8, "8 manches"], [10, "10 manches"], [12, "12 manches"], [15, "15 manches"], [20, "20 manches"]])}
          ${selectMarkup("settingsDefaultTimer", "Chronomètre", preferences.defaultTimer, [[15, "15 secondes"], [30, "30 secondes"], [45, "45 secondes"], [60, "60 secondes"], [90, "90 secondes"]])}
          ${selectMarkup("settingsRoundCountdown", "Compte à rebours avant une manche", preferences.roundCountdown, [[0, "Désactivé"], [3, "3 secondes"], [5, "5 secondes"]])}
          ${switchMarkup("settingsDefaultAdult", "Contenu adulte activé par défaut", "La catégorie reste toujours désactivable avant de jouer.", preferences.defaultAdult)}
          ${switchMarkup("settingsDefaultAlcohol", "Mode alcool activé par défaut", "Les boissons sans alcool restent possibles.", preferences.defaultAlcohol)}
          ${switchMarkup("settingsAllowCustom", "Autoriser les cartes personnalisées", "Affiche et utilise les questions ou défis créés sur l’appareil.", preferences.allowCustomCards)}
          ${selectMarkup("settingsRecentWindow", "Éviter les cartes déjà jouées", preferences.recentWindowDays, [[0, "Désactivé"], [7, "Pendant 7 jours"], [30, "Pendant 30 jours"], [90, "Pendant 90 jours"]])}
          ${switchMarkup("settingsRememberReplay", "Conserver les réglages en revanche", "Reprend les thèmes, manches et durées de la partie précédente.", preferences.rememberReplaySettings)}
        </div>
      </details>

      <details class="card settings-group">
        <summary><span>🛋️</span><div><strong>Confort de jeu</strong><small>Écran, passages et sorties</small></div></summary>
        <div class="settings-group-body">
          ${switchMarkup("settingsKeepAwake", "Maintenir l’écran allumé", "Évite que le téléphone se verrouille au milieu d’une partie.", preferences.keepAwake)}
          ${switchMarkup("settingsConfirmLeave", "Confirmer avant de quitter une partie", "Protège une partie contre un retour accidentel.", preferences.confirmLeaveGame)}
          ${switchMarkup("settingsHidePrivate", "Masquer les réponses pendant le passage", "Cache les éléments privés lorsqu’un écran de passage est affiché.", preferences.hidePrivateAnswers)}
          ${switchMarkup("settingsHandoff", "Écrans « Passe le téléphone »", "Laisse le temps de donner l’appareil à la bonne personne.", preferences.handoffScreens)}
        </div>
      </details>

      <details class="card settings-group">
        <summary><span>🧰</span><div><strong>Filtres de contenu</strong><small>Choisis les sujets acceptés dans la soirée</small></div></summary>
        <div class="settings-group-body">
          <p class="settings-note">Un filtre désactivé retire autant que possible les cartes correspondantes, quelle que soit leur catégorie d’origine.</p>
          ${switchMarkup("settingsContentPersonal", "Questions personnelles et dossiers", "Secrets, confessions et sujets très intimes.", preferences.contentPersonal)}
          ${switchMarkup("settingsContentPhysical", "Défis physiques", "Danses, mimes, mouvements et petites performances.", preferences.contentPhysical)}
          ${switchMarkup("settingsContentCouple", "Couple, ex et séduction", "Relations, crushs, baisers et romance.", preferences.contentCouple)}
          ${switchMarkup("settingsContentPolitics", "Politique et société", "Élections, gouvernement et débats politiques.", preferences.contentPolitics)}
          ${switchMarkup("settingsContentFamily", "Famille", "Parents, fratrie et souvenirs familiaux.", preferences.contentFamily)}
          ${switchMarkup("settingsContentDifficult", "Dilemmes difficiles", "Morale, survie, sujets sombres ou existentiels.", preferences.contentDifficult)}
        </div>
      </details>

      <details class="card settings-group">
        <summary><span>💾</span><div><strong>Données de l’application</strong><small>Historique, cartes personnelles et mise à jour</small></div></summary>
        <div class="settings-group-body">
          <div class="settings-data-grid">
            <button id="settingsClearHistory" class="secondary-btn">🧹 Effacer l’historique des cartes</button>
            <button id="settingsExportCustom" class="secondary-btn">📤 Exporter mes cartes</button>
            <button id="settingsImportCustom" class="secondary-btn">📥 Importer des cartes</button>
            <input id="settingsImportFile" class="sr-only" type="file" accept="application/json,.json">
            <button id="settingsDeleteCustom" class="danger-btn">🗑️ Supprimer mes cartes personnalisées</button>
            <button id="settingsResetPreferences" class="danger-btn">↺ Réinitialiser les réglages</button>
          </div>
          <div class="settings-version-row"><span><strong>Version ${VERSION_LABEL}</strong><small id="settingsUpdateStatus">Application installable et utilisable hors ligne.</small></span><button id="settingsCheckUpdate" class="secondary-btn">Rechercher une mise à jour</button></div>
        </div>
      </details>

      <section class="card settings-session-card">
        <h2 class="section-title">Session actuelle</h2>
        ${switchMarkup("settingsSessionAdult", "🔞 Contenu adulte", "Modifie immédiatement la soirée actuelle.", state.adult)}
        ${switchMarkup("settingsSessionAlcohol", "🍻 Mode alcool", "Modifie immédiatement la soirée actuelle.", state.alcohol)}
      </section>

      <button id="resetApp" class="danger-btn full">Réinitialiser la session et les joueurs</button>
    `;

    const bindChange = (id, key, parser = value => value) => {
      document.querySelector(`#${id}`)?.addEventListener("change", event => update(key, parser(event.target.type === "checkbox" ? event.target.checked : event.target.value)));
    };

    document.querySelectorAll('input[name="enhancedTheme"]').forEach(input => input.addEventListener("change", event => {
      if (!event.target.checked) return;
      update("theme", event.target.value);
      document.querySelectorAll(".theme-option").forEach(option => option.classList.toggle("active", option.querySelector("input")?.checked));
    }));

    bindChange("settingsTextSize", "textSize");
    bindChange("settingsAnimations", "animations");
    bindChange("settingsHighContrast", "highContrast", Boolean);
    bindChange("settingsFastTransitions", "fastTransitions", Boolean);
    bindChange("settingsSounds", "sounds", Boolean);
    bindChange("settingsVibration", "vibration", Boolean);
    bindChange("settingsMascotSounds", "mascotSounds", Boolean);
    bindChange("settingsFavoriteMascot", "favoriteMascot");
    bindChange("settingsMascotBubbles", "mascotBubbles", Boolean);
    bindChange("settingsMascotFrequency", "mascotFrequency");
    bindChange("settingsMascotAnimations", "mascotAnimations", Boolean);
    bindChange("settingsDefaultRounds", "defaultRounds", Number);
    bindChange("settingsDefaultTimer", "defaultTimer", Number);
    bindChange("settingsRoundCountdown", "roundCountdown", Number);
    bindChange("settingsDefaultAdult", "defaultAdult", Boolean);
    bindChange("settingsDefaultAlcohol", "defaultAlcohol", Boolean);
    bindChange("settingsAllowCustom", "allowCustomCards", Boolean);
    bindChange("settingsRecentWindow", "recentWindowDays", Number);
    bindChange("settingsRememberReplay", "rememberReplaySettings", Boolean);
    bindChange("settingsKeepAwake", "keepAwake", Boolean);
    bindChange("settingsConfirmLeave", "confirmLeaveGame", Boolean);
    bindChange("settingsHidePrivate", "hidePrivateAnswers", Boolean);
    bindChange("settingsHandoff", "handoffScreens", Boolean);
    bindChange("settingsContentPersonal", "contentPersonal", Boolean);
    bindChange("settingsContentPhysical", "contentPhysical", Boolean);
    bindChange("settingsContentCouple", "contentCouple", Boolean);
    bindChange("settingsContentPolitics", "contentPolitics", Boolean);
    bindChange("settingsContentFamily", "contentFamily", Boolean);
    bindChange("settingsContentDifficult", "contentDifficult", Boolean);

    const volume = document.querySelector("#settingsSoundVolume");
    volume?.addEventListener("input", event => {
      const value = Number(event.target.value);
      update("soundVolume", value);
      document.querySelector("#settingsSoundVolumeValue").textContent = `${value} %`;
    });
    document.querySelector("#settingsSounds")?.addEventListener("change", event => { if (volume) volume.disabled = !event.target.checked; });

    document.querySelector("#settingsSessionAdult")?.addEventListener("change", event => { state.adult = event.target.checked; });
    document.querySelector("#settingsSessionAlcohol")?.addEventListener("change", event => { state.alcohol = event.target.checked; });

    document.querySelector("#settingsClearHistory")?.addEventListener("click", () => {
      if (!confirm("Effacer l’historique des cartes déjà jouées ?")) return;
      localStorage.removeItem(AK_RECENT_CONTENT_KEY);
      alert("L’historique des cartes a été effacé.");
    });
    document.querySelector("#settingsExportCustom")?.addEventListener("click", exportCustomContent);
    document.querySelector("#settingsImportCustom")?.addEventListener("click", () => document.querySelector("#settingsImportFile")?.click());
    document.querySelector("#settingsImportFile")?.addEventListener("change", async event => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const count = await importCustomContent(file);
        alert(`${count} lot${count > 1 ? "s" : ""} de contenus personnalisés importé${count > 1 ? "s" : ""}.`);
      } catch (error) { alert(error.message); }
      event.target.value = "";
    });
    document.querySelector("#settingsDeleteCustom")?.addEventListener("click", () => {
      const keys = customStorageKeys();
      if (!keys.length) { alert("Aucune carte personnalisée n’est enregistrée."); return; }
      if (!confirm(`Supprimer définitivement les contenus personnalisés enregistrés dans ${keys.length} lot${keys.length > 1 ? "s" : ""} ?`)) return;
      keys.forEach(key => localStorage.removeItem(key));
      alert("Les cartes personnalisées ont été supprimées.");
    });
    document.querySelector("#settingsResetPreferences")?.addEventListener("click", () => {
      if (!confirm("Remettre tous les réglages à leur valeur d’origine ?")) return;
      preferences = { ...DEFAULTS };
      save();
      state.adult = preferences.defaultAdult;
      state.alcohol = preferences.defaultAlcohol;
      applyDocumentPreferences();
      state.history.pop();
      renderEnhancedSettings();
    });
    document.querySelector("#settingsCheckUpdate")?.addEventListener("click", () => checkForUpdate(document.querySelector("#settingsUpdateStatus")));
    document.querySelector("#resetApp")?.addEventListener("click", () => {
      if (!confirm("Réinitialiser tous les joueurs et revenir à l’accueil ?")) return;
      resetSession();
    });
  }

  if (typeof renderSettings === "function") renderSettings = renderEnhancedSettings;

  // Empêche les retours accidentels pendant une partie.
  let allowConfirmedBack = false;
  document.querySelector("#backBtn")?.addEventListener("click", event => {
    if (!preferences.confirmLeaveGame || allowConfirmedBack || typeof isSoloGameRunning !== "function" || !isSoloGameRunning()) return;
    if (confirm("Quitter la partie en cours ? La progression de cette manche pourra être perdue.")) {
      allowConfirmedBack = true;
      setTimeout(() => { allowConfirmedBack = false; }, 250);
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  window.addEventListener("beforeunload", event => {
    if (!preferences.confirmLeaveGame || typeof isSoloGameRunning !== "function" || !isSoloGameRunning()) return;
    event.preventDefault();
    event.returnValue = "";
  });

  function maybeDisableCustomControls() {
    if (preferences.allowCustomCards) return;
    document.querySelectorAll('[id*="Custom"], [id*="custom"]').forEach(element => {
      if (element.closest("#screen") && !element.matches("section, div")) {
        element.disabled = true;
        element.title = "Les cartes personnalisées sont désactivées dans les paramètres.";
      }
    });
  }

  function manageHandoff() {
    const handoff = screen?.querySelector?.(".handoff-stage");
    document.body.classList.toggle("ak-handoff-visible", Boolean(handoff && preferences.hidePrivateAnswers));
    if (!handoff || preferences.handoffScreens) { autoHandoffKey = ""; return; }
    const button = handoff.querySelector("button:not([disabled])");
    if (!button) return;
    const key = `${handoff.textContent.trim().slice(0, 140)}|${button.id}`;
    if (autoHandoffKey === key) return;
    autoHandoffKey = key;
    setTimeout(() => { if (button.isConnected && !preferences.handoffScreens) button.click(); }, 320);
  }

  function countdownCandidate() {
    if (!preferences.roundCountdown || countdownBusy || title?.textContent === "Paramètres" || screen?.querySelector?.(".handoff-stage, .winner-stage, .game-cover")) return null;
    const interactive = screen?.querySelector?.(".decision-grid, .answer-grid, .answer-options, .quiz-options, .choice-grid, [data-answer], [data-choice]");
    if (!interactive) return null;
    const progress = screen.querySelector(".game-progress, .progress-label, .category-chip")?.textContent || "";
    const question = screen.querySelector("h2, .question, .prompt, .card h3")?.textContent || "";
    const key = `${title?.textContent}|${progress}|${question}`.replace(/\s+/g, " ").slice(0, 300);
    return key && key !== countdownKey ? key : null;
  }

  function runRoundCountdown(key) {
    countdownBusy = true;
    countdownKey = key;
    let left = preferences.roundCountdown;
    const overlay = document.createElement("div");
    overlay.className = "ak-round-countdown";
    overlay.setAttribute("role", "status");
    overlay.setAttribute("aria-live", "assertive");
    overlay.innerHTML = `<small>PROCHAINE MANCHE</small><strong>${left}</strong>`;
    document.body.appendChild(overlay);
    playSound("countdown_tick");
    vibration(10);
    const interval = setInterval(() => {
      left -= 1;
      if (left <= 0) {
        clearInterval(interval);
        overlay.querySelector("strong").textContent = "GO !";
        playSound("countdown_go");
        vibration([12, 35, 20]);
        setTimeout(() => { overlay.remove(); countdownBusy = false; }, 430);
      } else {
        overlay.querySelector("strong").textContent = String(left);
        playSound("countdown_tick");
      }
    }, 760);
  }

  const observer = new MutationObserver(() => {
    clearTimeout(observer._timer);
    observer._timer = setTimeout(() => {
      maybeDisableCustomControls();
      manageHandoff();
      const key = countdownCandidate();
      if (key) runRoundCountdown(key);
      const winner = screen?.querySelector?.(".winner-stage");
      if (winner) {
        const winnerKey = winner.textContent.trim().slice(0, 180);
        if (winnerKey && winnerKey !== lastWinnerSoundKey) {
          lastWinnerSoundKey = winnerKey;
          const lower = winnerKey.toLowerCase();
          playSound(lower.includes("égal") ? "tie" : /défaite|perdu|perdant/.test(lower) ? "defeat" : "victory");
          vibration([25, 35, 25, 35, 45]);
        }
      }
    }, 70);
  });
  if (screen) observer.observe(screen, { childList: true, subtree: true });

  window.AKSettings = {
    defaults: { ...DEFAULTS },
    get,
    update,
    apply: applyDocumentPreferences,
    filterPool,
    tone,
    playSound,
    vibration,
    version: VERSION_LABEL
  };

  applyDocumentPreferences();
})();
