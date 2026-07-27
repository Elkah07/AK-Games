(function () {
  "use strict";

  const AK_CREATOR_PIN_KEY = "akgames_creator_pin_hash_v1";
  const AK_CREATOR_SESSION_KEY = "akgames_creator_session_v1";
  const AK_CREATOR_REPORTS_KEY = "akgames_creator_reports_v1";
  const AK_CREATOR_DEVICE_KEY = "akgames_creator_device_v1";
  const AK_CREATOR_MAX_LOCAL_REPORTS = 500;
  const AK_CREATOR_ACCESS_CACHE_MS = 30000;

  const AK_CREATOR_ROLES = {
    owner: {
      label: "Propriétaire",
      description: "Tous les outils et la gestion des accès.",
      permissions: ["lab", "reports", "content", "diagnostic", "maintenance", "access"]
    },
    creator: {
      label: "Créateur",
      description: "Tests, signalements, contenus et diagnostic.",
      permissions: ["lab", "reports", "content", "diagnostic", "maintenance"]
    },
    tester: {
      label: "Testeur",
      description: "Laboratoire de test uniquement.",
      permissions: ["lab"]
    },
    moderator: {
      label: "Modérateur",
      description: "Consultation et traitement des signalements.",
      permissions: ["reports"]
    }
  };

  let akCreatorAccessCache = {
    checkedAt: 0,
    allowed: false,
    uid: null,
    role: null,
    name: "",
    permissions: [],
    reason: "",
    pending: null
  };

  const AK_CREATOR_SOURCES = [
    ["Qui de nous ?", "data/qui-de-nous.json"],
    ["Qui de nous ? +18", "data/qui-de-nous-adulte.json"],
    ["Le premier qui rit a perdu", "data/blagues.json"],
    ["Blagues +18", "data/blagues-adulte.json"],
    ["Qui ment le mieux ?", "data/qui-ment-prompts.json"],
    ["Qui ment le mieux ? +18", "data/qui-ment-prompts-adulte.json"],
    ["Action ou Vérité", "data/action-verite.json"],
    ["Action ou Vérité +18", "data/action-verite-adulte.json"],
    ["Je n’ai jamais", "data/je-nai-jamais.json"],
    ["Je n’ai jamais +18", "data/je-nai-jamais-adulte.json"],
    ["Tu préfères", "data/tu-preferes.json"],
    ["Tu préfères +18", "data/tu-preferes-adulte.json"],
    ["Même cerveau", "data/meme-cerveau.json"],
    ["Même cerveau +18", "data/meme-cerveau-adulte.json"],
    ["Minorité", "data/minorite.json"],
    ["Minorité +18", "data/minorite-adulte.json"],
    ["Qui a répondu ça ?", "data/qui-a-repondu.json"],
    ["Qui a répondu ça ? +18", "data/qui-a-repondu-adulte.json"],
    ["L’Imposteur sait presque tout", "data/imposteur.json"],
    ["L’Imposteur +18", "data/imposteur-adulte.json"],
    ["Le Faux Expert", "data/faux-expert.json"],
    ["Le Faux Expert +18", "data/faux-expert-adulte.json"],
    ["Qui suis-je ?", "data/qui-suis-je.json"],
    ["Qui suis-je ? +18", "data/qui-suis-je-adulte.json"],
    ["Roulette de défis", "data/roulette-defis.json"],
    ["Mime", "data/mime.json"],
    ["Imitation", "data/imitation.json"],
    ["La Bombe", "data/bombe.json"],
    ["Culture générale", "data/quiz-culture.json"],
    ["Cinéma", "data/quiz-cinema.json"],
    ["Musique", "data/quiz-musique.json"],
    ["Jeux vidéo", "data/quiz-jeux-video.json"],
    ["Devine le logo", "data/quiz-logos.json"],
    ["Plaide ta cause", "data/plaide-cause.json"],
    ["Fake ou Réel ?", "data/fake-reel.json"],
    ["Fake ou Réel +18", "data/fake-reel-adulte.json"],
    ["Alerte Rouge", "data/alerte-rouge.json"],
    ["Tu me connais ou pas ?", "data/tu-me-connais.json"],
    ["Le Classement secret", "data/classement-secret.json"],
    ["Devinettes", "data/devinettes.json"],
    ["Questions osées", "data/questions-osees.json"],
    ["Jeux à boire", "data/jeux-a-boire.json"],
    ["Défis adultes · 400", "data/defis-adultes.json"]
  ];

  const AK_CREATOR_REASON_LABELS = {
    incoherent: "Incohérente",
    too_easy: "Choix trop évident",
    duplicate: "Doublon ou déjà-vue",
    spelling: "Faute ou formulation",
    inappropriate: "Contenu inadapté",
    display_bug: "Bug d’affichage",
    game_bug: "Bug de mécanique",
    other: "Autre"
  };

  state.akCreatorLab = Boolean(state.akCreatorLab);
  state.akCreatorScreen = null;
  state.akCreatorBrowser = null;

  function akCreatorEscape(value) {
    return typeof escapeHtml === "function"
      ? escapeHtml(value ?? "")
      : String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character]));
  }

  function akCreatorDeviceId() {
    let value = localStorage.getItem(AK_CREATOR_DEVICE_KEY);
    if (!value) {
      value = `device_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(AK_CREATOR_DEVICE_KEY, value);
    }
    return value;
  }

  async function akCreatorHash(value) {
    const text = String(value || "");
    if (window.crypto?.subtle) {
      const data = new TextEncoder().encode(`AKGames::${text}::creator`);
      const digest = await window.crypto.subtle.digest("SHA-256", data);
      return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
    }
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `fallback_${(hash >>> 0).toString(16)}`;
  }

  function akCreatorIsUnlocked() {
    return sessionStorage.getItem(AK_CREATOR_SESSION_KEY) === "true";
  }

  function akCreatorSetUnlocked(value) {
    if (value) sessionStorage.setItem(AK_CREATOR_SESSION_KEY, "true");
    else sessionStorage.removeItem(AK_CREATOR_SESSION_KEY);
  }

  function akCreatorModal({ titleText, eyebrow = "MODE CRÉATEUR", description = "", fields = [], confirmLabel = "Continuer", danger = false }) {
    document.querySelector(".ak-creator-modal-backdrop")?.remove();

    return new Promise(resolve => {
      const backdrop = document.createElement("div");
      backdrop.className = "ak-creator-modal-backdrop";
      backdrop.innerHTML = `
        <section class="ak-creator-modal" role="dialog" aria-modal="true" aria-labelledby="akCreatorModalTitle">
          <button type="button" class="ak-creator-modal-close" aria-label="Fermer" data-ak-creator-cancel>×</button>
          <p class="ak-creator-eyebrow">${akCreatorEscape(eyebrow)}</p>
          <h2 id="akCreatorModalTitle">${akCreatorEscape(titleText)}</h2>
          ${description ? `<p class="ak-creator-modal-description">${akCreatorEscape(description)}</p>` : ""}
          <form class="ak-creator-modal-form">
            ${fields.map(field => `
              <label class="ak-creator-field">
                <span>${akCreatorEscape(field.label)}</span>
                ${field.type === "select" ? `
                  <select name="${akCreatorEscape(field.name)}" class="text-input">
                    ${(field.options || []).map(option => `<option value="${akCreatorEscape(option.value)}">${akCreatorEscape(option.label)}</option>`).join("")}
                  </select>
                ` : field.type === "textarea" ? `
                  <textarea name="${akCreatorEscape(field.name)}" class="text-input" rows="4" maxlength="${Number(field.maxlength || 500)}" placeholder="${akCreatorEscape(field.placeholder || "")}"></textarea>
                ` : `
                  <input name="${akCreatorEscape(field.name)}" class="text-input" type="${akCreatorEscape(field.type || "text")}" ${field.autocomplete ? `autocomplete="${akCreatorEscape(field.autocomplete)}"` : ""} maxlength="${Number(field.maxlength || 120)}" placeholder="${akCreatorEscape(field.placeholder || "")}" ${field.required === false ? "" : "required"}>
                `}
              </label>
            `).join("")}
            <p class="ak-creator-form-error" aria-live="polite"></p>
            <div class="ak-creator-modal-actions">
              <button type="button" class="secondary-btn" data-ak-creator-cancel>Annuler</button>
              <button type="submit" class="${danger ? "danger-btn" : "primary-btn"}">${akCreatorEscape(confirmLabel)}</button>
            </div>
          </form>
        </section>
      `;

      const finish = value => {
        backdrop.classList.add("is-closing");
        window.setTimeout(() => backdrop.remove(), 130);
        resolve(value);
      };

      backdrop.querySelectorAll("[data-ak-creator-cancel]").forEach(button => button.addEventListener("click", () => finish(null)));
      backdrop.addEventListener("click", event => {
        if (event.target === backdrop) finish(null);
      });
      backdrop.querySelector("form")?.addEventListener("submit", event => {
        event.preventDefault();
        const values = Object.fromEntries(new FormData(event.currentTarget).entries());
        finish(values);
      });

      document.body.appendChild(backdrop);
      window.requestAnimationFrame(() => {
        backdrop.classList.add("is-visible");
        backdrop.querySelector("input, select, textarea")?.focus();
      });
    });
  }

  async function akCreatorUnlock() {
    // Le PIN n'est qu'une seconde serrure locale. L'autorisation Firebase du
    // compte courant est obligatoire avant d'afficher ou d'exécuter un outil.
    if (!(await akCreatorRequireServerAccess({ force: true }))) return false;
    if (akCreatorIsUnlocked()) return true;

    const storedHash = localStorage.getItem(AK_CREATOR_PIN_KEY);
    if (!storedHash) {
      const values = await akCreatorModal({
        titleText: "Créer ton code créateur",
        description: "Ton compte Firebase est autorisé. Ce code ajoute une seconde protection sur cet appareil.",
        confirmLabel: "Créer le code",
        fields: [
          { name: "pin", label: "Nouveau code", type: "password", autocomplete: "new-password", maxlength: 40, placeholder: "6 caractères minimum" },
          { name: "confirmPin", label: "Confirmer le code", type: "password", autocomplete: "new-password", maxlength: 40, placeholder: "Retape le même code" }
        ]
      });
      if (!values) return false;
      if (String(values.pin || "").length < 6 || values.pin !== values.confirmPin) {
        alert("Le code doit contenir au moins 6 caractères et les deux champs doivent être identiques.");
        return akCreatorUnlock();
      }
      localStorage.setItem(AK_CREATOR_PIN_KEY, await akCreatorHash(values.pin));
      akCreatorSetUnlocked(true);
      return true;
    }

    const values = await akCreatorModal({
      titleText: "Ouvrir le mode créateur",
      description: "Compte autorisé. Entre maintenant ton code local.",
      confirmLabel: "Déverrouiller",
      fields: [{ name: "pin", label: "Code créateur", type: "password", autocomplete: "current-password", maxlength: 40, placeholder: "Ton code" }]
    });
    if (!values) return false;
    if (await akCreatorHash(values.pin) !== storedHash) {
      alert("Code créateur incorrect.");
      return false;
    }
    akCreatorSetUnlocked(true);
    return true;
  }

  function akCreatorLoadReports() {
    try {
      const reports = JSON.parse(localStorage.getItem(AK_CREATOR_REPORTS_KEY) || "[]");
      return Array.isArray(reports) ? reports : [];
    } catch {
      return [];
    }
  }

  function akCreatorSaveReports(reports) {
    const safeReports = [...reports]
      .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
      .slice(0, AK_CREATOR_MAX_LOCAL_REPORTS);
    localStorage.setItem(AK_CREATOR_REPORTS_KEY, JSON.stringify(safeReports));
  }

  function akCreatorUpdateLocalReport(clientReportId, changes) {
    const reports = akCreatorLoadReports();
    const index = reports.findIndex(report => report.clientReportId === clientReportId);
    if (index < 0) return null;
    reports[index] = { ...reports[index], ...changes, updatedAt: Date.now() };
    akCreatorSaveReports(reports);
    return reports[index];
  }

  async function akCreatorFirebaseUser() {
    if (!window.AKFirebase) return null;
    try {
      return await window.AKFirebase.ready();
    } catch {
      return null;
    }
  }

  function akCreatorNormalizeAccess(rawValue, uid) {
    if (rawValue === true) {
      return {
        allowed: true,
        uid,
        role: "owner",
        name: "Propriétaire",
        permissions: [...AK_CREATOR_ROLES.owner.permissions],
        legacy: true,
        reason: ""
      };
    }

    if (!rawValue || typeof rawValue !== "object" || rawValue.active === false) {
      return { allowed: false, uid, role: null, name: "", permissions: [], reason: "Ce compte n'est pas autorisé comme créateur" };
    }

    const role = AK_CREATOR_ROLES[rawValue.role] ? rawValue.role : null;
    if (!role) {
      return { allowed: false, uid, role: null, name: "", permissions: [], reason: "Rôle créateur invalide" };
    }

    return {
      allowed: true,
      uid,
      role,
      name: String(rawValue.name || AK_CREATOR_ROLES[role].label),
      permissions: [...AK_CREATOR_ROLES[role].permissions],
      legacy: false,
      reason: ""
    };
  }

  function akCreatorCan(access, permission) {
    return Boolean(access?.allowed && access.permissions?.includes(permission));
  }

  async function akCreatorHasCloudAccess(force = false) {
    const now = Date.now();
    if (!force && akCreatorAccessCache.checkedAt && now - akCreatorAccessCache.checkedAt < AK_CREATOR_ACCESS_CACHE_MS) {
      return { ...akCreatorAccessCache, pending: null };
    }
    if (akCreatorAccessCache.pending) return akCreatorAccessCache.pending;

    akCreatorAccessCache.pending = (async () => {
      const user = await akCreatorFirebaseUser();
      if (!user || !window.AKFirebase?.db) {
        return { allowed: false, uid: user?.uid || null, role: null, name: "", permissions: [], reason: "Firebase indisponible" };
      }
      try {
        const snapshot = await window.AKFirebase.db.ref(`creatorAccess/${user.uid}`).once("value");
        return akCreatorNormalizeAccess(snapshot.val(), user.uid);
      } catch (error) {
        return { allowed: false, uid: user.uid, role: null, name: "", permissions: [], reason: error?.message || "Vérification impossible" };
      }
    })();

    const result = await akCreatorAccessCache.pending;
    akCreatorAccessCache = { ...result, checkedAt: Date.now(), pending: null };
    return result;
  }

  function akCreatorRemovePrivateEntrances() {
    document.querySelector("#akCreatorSettingsCard")?.remove();
    document.querySelector("#akCreatorHomeShortcut")?.remove();
    document.querySelector("#akCreatorDockButton")?.remove();
  }

  async function akCreatorRequireServerAccess({ silent = false, force = false } = {}) {
    const access = await akCreatorHasCloudAccess(force);
    if (access.allowed) return true;

    akCreatorSetUnlocked(false);
    akCreatorRemovePrivateEntrances();
    if (!silent) {
      alert("Accès réservé à un compte créateur autorisé.");
    }
    return false;
  }

  async function akCreatorRequirePermission(permission, { silent = false, force = false } = {}) {
    const access = await akCreatorHasCloudAccess(force);
    if (akCreatorCan(access, permission)) return access;
    if (!silent) {
      const roleLabel = access?.role ? AK_CREATOR_ROLES[access.role]?.label : "Ce compte";
      alert(`${roleLabel} n’a pas accès à cet outil.`);
    }
    return null;
  }

  async function akCreatorShowSetupUidIfRequested() {
    const url = new URL(window.location.href);
    if (url.searchParams.get("creator-setup") !== "1") return;

    // Retire immédiatement le paramètre pour éviter de rouvrir l'assistant à
    // chaque navigation ou rechargement de la PWA.
    url.searchParams.delete("creator-setup");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);

    const access = await akCreatorHasCloudAccess(true);
    if (!access.uid) {
      alert("Impossible de récupérer l'UID Firebase de cet appareil. Vérifie la connexion internet puis réessaie.");
      return;
    }

    const values = await akCreatorModal({
      eyebrow: "ACTIVATION PRIVÉE",
      titleText: access.allowed ? "Cet appareil est déjà autorisé" : "Autoriser ton appareil créateur",
      description: access.allowed
        ? `UID Firebase : ${access.uid}`
        : `UID Firebase : ${access.uid}. Cette procédure sert uniquement à créer le premier compte Propriétaire. Pour les autres personnes, utilise ensuite le lien depuis Gestion des accès.`,
      confirmLabel: "Copier mon UID",
      fields: []
    });
    if (!values) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard indisponible");
      await navigator.clipboard.writeText(access.uid);
      akCreatorToast("UID Firebase copié.");
    } catch {
      window.prompt("Copie cet UID Firebase :", access.uid);
    }
  }

  function akCreatorInviteUrl() {
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    url.searchParams.set("creator-request", "1");
    return url.toString();
  }

  async function akCreatorShowAccessRequestIfRequested() {
    const url = new URL(window.location.href);
    if (url.searchParams.get("creator-request") !== "1") return;

    url.searchParams.delete("creator-request");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);

    const user = await akCreatorFirebaseUser();
    if (!user || !window.AKFirebase?.db) {
      alert("Impossible d’ouvrir la demande d’accès. Vérifie la connexion internet puis réessaie.");
      return;
    }

    const access = await akCreatorHasCloudAccess(true);
    if (access.allowed) {
      const values = await akCreatorModal({
        eyebrow: "ACCÈS CRÉATEUR",
        titleText: "Ton accès est déjà actif",
        description: `Rôle : ${AK_CREATOR_ROLES[access.role]?.label || access.role}. Tu peux ouvrir le mode créateur depuis les paramètres.`,
        confirmLabel: "Ouvrir le mode créateur",
        fields: []
      });
      if (values) akCreatorRenderDashboard();
      return;
    }

    const existing = await window.AKFirebase.db.ref(`creatorRequests/${user.uid}`).once("value");
    const existingValue = existing.val();
    const values = await akCreatorModal({
      eyebrow: "INVITATION AK’GAMES",
      titleText: existingValue?.status === "pending" ? "Ta demande est déjà envoyée" : "Demander un accès créateur",
      description: existingValue?.status === "pending"
        ? "La propriétaire doit encore accepter ta demande. Tu pourras ensuite rouvrir l’application normalement."
        : "Indique ton prénom ou ton pseudo. La propriétaire choisira ensuite précisément tes droits.",
      confirmLabel: existingValue?.status === "pending" ? "Mettre à jour ma demande" : "Envoyer ma demande",
      fields: [
        { name: "name", label: "Prénom ou pseudo", type: "text", maxlength: 40, placeholder: existingValue?.name || "Ex. Lily" },
        { name: "note", label: "Petit message facultatif", type: "textarea", required: false, maxlength: 220, placeholder: existingValue?.note || "Ex. Je veux aider à tester les nouveaux jeux." }
      ]
    });
    if (!values) return;

    const name = String(values.name || existingValue?.name || "").trim();
    if (!name) {
      alert("Ajoute un prénom ou un pseudo pour que la propriétaire te reconnaisse.");
      return;
    }

    await window.AKFirebase.db.ref(`creatorRequests/${user.uid}`).set({
      uid: user.uid,
      name: name.slice(0, 40),
      note: String(values.note || existingValue?.note || "").trim().slice(0, 220),
      status: "pending",
      requestedAt: Number(existingValue?.requestedAt || Date.now()),
      updatedAt: Date.now(),
      appVersion: "creator-v1.3-access"
    });

    await akCreatorModal({
      eyebrow: "DEMANDE ENVOYÉE",
      titleText: "La demande est partie",
      description: "La propriétaire la verra dans Gestion des accès. Après son accord, ferme puis rouvre AK’Games.",
      confirmLabel: "Compris",
      fields: []
    });
  }

  function akCreatorCloudPayload(report, user) {
    return {
      clientReportId: String(report.clientReportId || "").slice(0, 100),
      gameName: String(report.gameName || "Jeu inconnu").slice(0, 100),
      gameType: String(report.gameType || "unknown").slice(0, 80),
      contentId: String(report.contentId || "unknown").slice(0, 160),
      contentText: String(report.contentText || "").slice(0, 1200),
      secondaryText: String(report.secondaryText || "").slice(0, 1200),
      reason: String(report.reason || "other").slice(0, 40),
      note: String(report.note || "").slice(0, 800),
      sourceMode: String(report.sourceMode || "unknown").slice(0, 40),
      roomCode: String(report.roomCode || "").slice(0, 20),
      reporterName: String(report.reporterName || "Anonyme").slice(0, 60),
      reporterUid: user.uid,
      deviceId: akCreatorDeviceId(),
      status: "open",
      createdAt: Number(report.createdAt || Date.now()),
      updatedAt: Number(report.updatedAt || report.createdAt || Date.now()),
      appVersion: "creator-v1.3-access"
    };
  }

  async function akCreatorUploadReport(report) {
    const user = await akCreatorFirebaseUser();
    if (!user || !window.AKFirebase?.db || navigator.onLine === false) return null;
    const reference = window.AKFirebase.db.ref("contentReports").push();
    await reference.set(akCreatorCloudPayload(report, user));
    akCreatorUpdateLocalReport(report.clientReportId, { cloudId: reference.key, syncStatus: "synced" });
    return reference.key;
  }

  async function akCreatorSyncPendingReports() {
    const reports = akCreatorLoadReports().filter(report => !report.cloudId && report.syncStatus !== "blocked");
    for (const report of reports.slice(0, 30)) {
      try {
        await akCreatorUploadReport(report);
      } catch (error) {
        console.warn("Signalement conservé hors ligne :", error);
        akCreatorUpdateLocalReport(report.clientReportId, { syncStatus: "pending" });
      }
    }
  }

  async function akCreatorLoadCloudReports() {
    const access = await akCreatorHasCloudAccess();
    if (!akCreatorCan(access, "reports")) return { access: { ...access, allowed: false, reason: "Ce rôle ne peut pas consulter les signalements." }, reports: [] };
    const snapshot = await window.AKFirebase.db.ref("contentReports").once("value");
    const value = snapshot.val() || {};
    return {
      access,
      reports: Object.entries(value).map(([cloudId, report]) => ({ ...report, cloudId, source: "cloud" }))
    };
  }

  function akCreatorItemText(item) {
    if (!item || typeof item !== "object") return String(item || "");
    if (item.optionA || item.optionB) return `${item.optionA || ""} OU ${item.optionB || ""}`;
    if (item.setup || item.punchline) return `${item.setup || ""}${item.punchline ? ` — ${item.punchline}` : ""}`;
    if (item.question) return item.question;
    if (item.prompt) return item.prompt;
    if (item.text) return item.text;
    if (item.title && item.items) return `${item.title} — ${(item.items || []).join(" / ")}`;
    if (item.title) return item.title;
    if (item.topic) return item.topic;
    if (item.word) return item.word;
    if (item.label) return item.label;
    if (item.category) return item.category;
    return JSON.stringify(item).slice(0, 1000);
  }

  function akCreatorItemSecondary(item) {
    if (!item || typeof item !== "object") return "";
    if (Array.isArray(item.options)) {
      return item.options.map(option => typeof option === "object" ? `${option.label || ""}${option.outcome ? ` → ${option.outcome}` : ""}` : option).join(" | ");
    }
    if (Array.isArray(item.items)) return item.items.join(" | ");
    if (Array.isArray(item.clues)) return item.clues.join(" | ");
    if (Array.isArray(item.hints)) return item.hints.join(" | ");
    if (Array.isArray(item.facts)) return item.facts.join(" | ");
    if (Array.isArray(item.decoys)) return item.decoys.join(" | ");
    return "";
  }

  function akCreatorContext(gameName, gameType, item, extra = {}) {
    if (!item) return null;
    return {
      gameName,
      gameType,
      contentId: String(item.id || extra.contentId || `${gameType}_${extra.index ?? 0}`),
      contentText: akCreatorItemText(item),
      secondaryText: akCreatorItemSecondary(item),
      item,
      index: Number(extra.index || 0)
    };
  }

  function akCreatorSoloContext() {
    if (state.mode !== "single") return null;

    const candidates = [
      ["Qui de nous ?", "who-us", state.quiDeNous?.questions, state.quiDeNous?.currentQuestionIndex ?? state.quiDeNous?.currentIndex],
      ["Le premier qui rit a perdu", "laugh-duel", state.laughDuel?.currentJoke ? [state.laughDuel.currentJoke] : null, 0],
      ["Qui ment le mieux ?", "best-liar", state.bestLiar?.prompts, state.bestLiar?.currentRound],
      [state.actionTruth?.forceAdult ? "Action ou Vérité +18" : "Action ou Vérité", "action-truth", state.actionTruth?.prompts, state.actionTruth?.currentIndex],
      [state.ambiancePoll?.forceAdult ? (state.ambiancePoll?.type === "would" ? "Tu préfères +18" : "Je n’ai jamais +18") : (state.ambiancePoll?.type === "would" ? "Tu préfères" : "Je n’ai jamais"), state.ambiancePoll?.type === "would" ? "would-you-rather" : "never-have-i-ever", state.ambiancePoll?.items, state.ambiancePoll?.currentIndex],
      ["Même cerveau", "same-brain", state.sameBrain?.items, state.sameBrain?.currentIndex],
      ["Minorité", "minority", state.minorityGame?.items, state.minorityGame?.currentIndex],
      ["Qui a répondu ça ?", "who-answered", state.whoAnswered?.items, state.whoAnswered?.currentIndex],
      ["L’Imposteur sait presque tout", "almost-impostor", state.almostImpostor?.items, state.almostImpostor?.currentIndex],
      ["Le Faux Expert", "fake-expert", state.fakeExpert?.items, state.fakeExpert?.currentIndex],
      ["Qui suis-je ?", "who-am-i", state.whoAmI?.items, state.whoAmI?.currentIndex],
      [state.megaGame?.gameName || "Jeu", `mega-${state.megaGame?.engine || "unknown"}`, state.megaGame?.items, state.megaGame?.currentIndex]
    ];

    for (const [gameName, gameType, collection, rawIndex] of candidates) {
      if (!Array.isArray(collection) || !collection.length) continue;
      const index = Math.max(0, Math.min(collection.length - 1, Number(rawIndex || 0)));
      const context = akCreatorContext(gameName, gameType, collection[index], { index });
      if (context?.contentText) return context;
    }
    return null;
  }

  function akCreatorMultiContext() {
    if (!state.roomCode || !state.roomData?.game?.state) return null;
    const gameState = state.roomData.game.state;
    const index = Number(gameState.currentIndex ?? gameState.currentRound ?? 0);
    const hostItems = state.roomData.game?.privateHostState?.items || gameState.privateHostState?.items;
    const collections = [gameState.items, gameState.prompts, hostItems].filter(Array.isArray);
    let item = collections.find(collection => collection[index])?.[index] || gameState.currentJoke || null;

    if (!item && gameState.publicTopic) item = { id: gameState.currentResult?.itemId || `${gameState.type}_${index}`, topic: gameState.publicTopic };
    if (!item) {
      const stage = screen.querySelector(".prompt-stage h2, .poll-question-card h2, .scenario-stage h2, .question-stage h2, .game-card-stage h2, main h2");
      if (stage?.textContent?.trim()) item = { id: gameState.currentResult?.itemId || `${gameState.type}_${index}`, text: stage.textContent.trim() };
    }
    if (!item) return null;

    const labels = {
      "who-us": "Qui de nous ?",
      "laugh-duel": "Le premier qui rit a perdu",
      "best-liar": "Qui ment le mieux ?",
      "action-truth": "Action ou Vérité",
      "never-have-i-ever": "Je n’ai jamais",
      "would-you-rather": "Tu préfères",
      "same-brain": "Même cerveau",
      minority: "Minorité",
      "who-answered": "Qui a répondu ça ?",
      "almost-impostor": "L’Imposteur sait presque tout",
      "fake-expert": "Le Faux Expert",
      "who-am-i": "Qui suis-je ?"
    };
    const gameName = gameState.settings?.gameName || labels[gameState.type] || title.textContent || "Jeu multijoueur";
    return akCreatorContext(gameName, gameState.type || "multiplayer", item, { index, contentId: gameState.currentResult?.itemId });
  }

  function akCreatorCurrentContent() {
    if (state.akCreatorScreen) return null;
    return akCreatorMultiContext() || akCreatorSoloContext();
  }

  function akCreatorReporterName() {
    if (state.roomCode) return state.players.find(player => player.id === state.currentUid)?.name || "Joueur multijoueur";
    return state.players[0]?.name || "Joueur local";
  }

  async function akCreatorSubmitReport(context, values) {
    const report = {
      clientReportId: `report_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      gameName: context.gameName,
      gameType: context.gameType,
      contentId: context.contentId,
      contentText: context.contentText,
      secondaryText: context.secondaryText || "",
      reason: values.reason || "other",
      note: String(values.note || "").trim(),
      sourceMode: state.roomCode ? "multiplayer" : "single-phone",
      roomCode: state.roomCode || "",
      reporterName: akCreatorReporterName(),
      status: "open",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      syncStatus: "pending"
    };

    const reports = akCreatorLoadReports();
    reports.unshift(report);
    akCreatorSaveReports(reports);

    try {
      await akCreatorUploadReport(report);
    } catch (error) {
      console.warn("Signalement enregistré localement :", error);
    }
    return report;
  }

  function akCreatorToast(message) {
    document.querySelector(".ak-creator-toast")?.remove();
    const toast = document.createElement("div");
    toast.className = "ak-creator-toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    window.requestAnimationFrame(() => toast.classList.add("is-visible"));
    window.setTimeout(() => {
      toast.classList.remove("is-visible");
      window.setTimeout(() => toast.remove(), 180);
    }, 2600);
  }

  async function akCreatorOpenReportDialog(context) {
    const values = await akCreatorModal({
      eyebrow: "SIGNALER UNE CARTE",
      titleText: context.gameName,
      description: `${context.contentId} · ${context.contentText}`.slice(0, 420),
      confirmLabel: "Envoyer le signalement",
      fields: [
        {
          name: "reason",
          label: "Pourquoi la signaler ?",
          type: "select",
          options: Object.entries(AK_CREATOR_REASON_LABELS).map(([value, label]) => ({ value, label }))
        },
        { name: "note", label: "Précision facultative", type: "textarea", required: false, maxlength: 800, placeholder: "Explique ce qui pose problème ou propose une meilleure formulation." }
      ]
    });
    if (!values) return;
    await akCreatorSubmitReport(context, values);
    akCreatorToast(navigator.onLine === false ? "Signalement gardé hors ligne. Il partira plus tard." : "Signalement envoyé à la boîte créatrice.");
  }

  function akCreatorMountReportControl() {
    const context = akCreatorCurrentContent();
    const existing = document.querySelector("#akCreatorReportControl");
    if (!context) {
      existing?.remove();
      return;
    }
    const signature = `${context.gameType}:${context.contentId}`;
    if (existing?.dataset.signature === signature) return;
    existing?.remove();

    const control = document.createElement("section");
    control.id = "akCreatorReportControl";
    control.dataset.signature = signature;
    control.className = "ak-creator-report-control";
    control.innerHTML = `
      <button type="button" class="secondary-btn" data-ak-report-content>🚩 Signaler cette carte</button>
      <small>Incohérente, trop évidente, en double ou mal formulée.</small>
    `;
    control.querySelector("[data-ak-report-content]")?.addEventListener("click", () => akCreatorOpenReportDialog(context));
    screen.appendChild(control);
  }

  function akCreatorResetGameStates() {
    [
      "quiDeNous", "laughDuel", "bestLiar", "actionTruth", "ambiancePoll", "sameBrain",
      "minorityGame", "whoAnswered", "almostImpostor", "fakeExpert", "whoAmI", "megaGame"
    ].forEach(key => { state[key] = null; });
  }

  function akCreatorBuildPlayers(count) {
    const names = ["Créatrice", "Nova", "Pixel", "Cosmo", "Moka", "Poppy", "Nox", "Kiwi"];
    return Array.from({ length: count }, (_, index) => ({
      id: `creator_test_${index + 1}`,
      name: names[index] || `Test ${index + 1}`,
      avatarId: avatars[index % avatars.length].id,
      isVirtual: true
    }));
  }

  async function akCreatorStartLab(count = 4) {
    if (!(await akCreatorUnlock())) return;
    if (!(await akCreatorRequirePermission("lab"))) return;
    akCreatorResetGameStates();
    state.mode = "single";
    state.roomCode = null;
    state.roomData = null;
    state.currentUid = null;
    state.isHost = false;
    state.adult = true;
    state.alcohol = false;
    state.players = akCreatorBuildPlayers(Math.max(2, Math.min(8, Number(count || 4))));
    state.currentCategory = null;
    state.history = ["home"];
    state.akCreatorLab = true;
    state.akCreatorScreen = null;
    renderPlayChoice();
    akCreatorToast(`${state.players.length} joueurs virtuels prêts. Tous les jeux +18 sont ouverts.`);
  }

  function akCreatorExitLabToDashboard() {
    akCreatorResetGameStates();
    state.mode = null;
    state.players = [];
    state.akCreatorLab = false;
    state.currentCategory = null;
    state.history = [];
    akCreatorRenderDashboard();
  }

  function akCreatorReportCounts(reports) {
    return reports.reduce((counts, report) => {
      const status = report.status || "open";
      counts[status] = Number(counts[status] || 0) + 1;
      return counts;
    }, { open: 0, resolved: 0, ignored: 0 });
  }

  function akCreatorFormatDate(timestamp) {
    try {
      return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(new Date(Number(timestamp || Date.now())));
    } catch {
      return "Date inconnue";
    }
  }

  function akCreatorMergeReports(localReports, cloudReports) {
    const byClientId = new Map();
    cloudReports.forEach(report => byClientId.set(report.clientReportId || report.cloudId, report));
    localReports.forEach(report => {
      const key = report.clientReportId || report.cloudId;
      const cloud = byClientId.get(key);
      byClientId.set(key, cloud ? { ...report, ...cloud, syncStatus: "synced" } : { ...report, source: "local" });
    });
    return [...byClientId.values()].sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
  }

  async function akCreatorSetReportStatus(report, status) {
    akCreatorUpdateLocalReport(report.clientReportId, { status });
    if (report.cloudId) {
      const access = await akCreatorHasCloudAccess();
      if (akCreatorCan(access, "reports")) {
        await window.AKFirebase.db.ref(`contentReports/${report.cloudId}`).update({ status, updatedAt: Date.now(), reviewedBy: access.uid });
      }
    }
  }

  async function akCreatorDeleteReport(report) {
    const reports = akCreatorLoadReports().filter(item => item.clientReportId !== report.clientReportId);
    akCreatorSaveReports(reports);
    if (report.cloudId) {
      const access = await akCreatorHasCloudAccess();
      if (akCreatorCan(access, "reports")) await window.AKFirebase.db.ref(`contentReports/${report.cloudId}`).remove();
    }
  }

  function akCreatorDownload(filename, content, type = "application/json") {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function akCreatorRenderInbox(filter = "open", search = "") {
    if (!(await akCreatorUnlock())) return;
    if (!(await akCreatorRequirePermission("reports"))) return;
    state.akCreatorScreen = "inbox";
    title.textContent = "Signalements";
    setBackVisible(true);
    screen.innerHTML = `<section class="ak-creator-loading"><span>🚩</span><strong>Ouverture de la boîte de réception…</strong></section>`;

    await akCreatorSyncPendingReports();
    const localReports = akCreatorLoadReports();
    let cloudResult = { access: { allowed: false, uid: null, reason: "" }, reports: [] };
    try {
      cloudResult = await akCreatorLoadCloudReports();
    } catch (error) {
      cloudResult.access.reason = error?.message || "Impossible de charger le cloud";
    }
    const allReports = akCreatorMergeReports(localReports, cloudResult.reports);
    const normalizedSearch = String(search || "").trim().toLowerCase();
    const visibleReports = allReports.filter(report => {
      const statusMatches = filter === "all" || (report.status || "open") === filter;
      const haystack = [report.gameName, report.contentId, report.contentText, report.note, AK_CREATOR_REASON_LABELS[report.reason]].join(" ").toLowerCase();
      return statusMatches && (!normalizedSearch || haystack.includes(normalizedSearch));
    });
    const counts = akCreatorReportCounts(allReports);

    screen.innerHTML = `
      <section class="ak-creator-hero ak-creator-hero-small">
        <div><span>🚩</span><div><small>BOÎTE CRÉATRICE</small><h2>${counts.open} à examiner</h2><p>Les signalements locaux et Firebase sont réunis ici.</p></div></div>
        <button type="button" class="secondary-btn" data-ak-export-reports>Exporter JSON</button>
      </section>

      ${!cloudResult.access.allowed ? `
        <section class="ak-creator-cloud-warning">
          <strong>☁️ Connexion créatrice interrompue</strong>
          <p>${akCreatorEscape(cloudResult.access.reason || "Impossible de vérifier l'autorisation Firebase.")}</p>
          <div class="ak-creator-inline-actions">
            <button type="button" class="secondary-btn" data-ak-retry-cloud>Réessayer</button>
          </div>
        </section>
      ` : `<div class="ak-creator-cloud-ok">☁️ Firebase connecté · signalements de tous les appareils visibles</div>`}

      <section class="ak-creator-inbox-tools">
        <div class="ak-creator-filter-row">
          ${[["open", `À traiter (${counts.open})`], ["resolved", `Corrigés (${counts.resolved})`], ["ignored", `Ignorés (${counts.ignored})`], ["all", `Tous (${allReports.length})`]].map(([value, label]) => `<button type="button" class="choice-pill ${filter === value ? "active" : ""}" data-ak-report-filter="${value}">${label}</button>`).join("")}
        </div>
        <input class="text-input" id="akCreatorReportSearch" value="${akCreatorEscape(search)}" placeholder="Rechercher un jeu, un ID ou un mot…">
      </section>

      <section class="ak-creator-report-list">
        ${visibleReports.length ? visibleReports.map(report => `
          <article class="ak-creator-report-card status-${akCreatorEscape(report.status || "open")}" data-client-report-id="${akCreatorEscape(report.clientReportId || "")}">
            <div class="ak-creator-report-head">
              <div><span class="ak-creator-report-game">${akCreatorEscape(report.gameName || "Jeu inconnu")}</span><code>${akCreatorEscape(report.contentId || "ID inconnu")}</code></div>
              <span class="ak-creator-report-date">${akCreatorEscape(akCreatorFormatDate(report.createdAt))}</span>
            </div>
            <p class="ak-creator-report-text">${akCreatorEscape(report.contentText || "Contenu non récupéré")}</p>
            ${report.secondaryText ? `<p class="ak-creator-report-secondary">${akCreatorEscape(report.secondaryText)}</p>` : ""}
            <div class="ak-creator-report-meta">
              <span>${akCreatorEscape(AK_CREATOR_REASON_LABELS[report.reason] || report.reason || "Autre")}</span>
              <span>${akCreatorEscape(report.reporterName || "Anonyme")}</span>
              <span>${report.cloudId ? "☁️ cloud" : "📱 local"}</span>
            </div>
            ${report.note ? `<blockquote>${akCreatorEscape(report.note)}</blockquote>` : ""}
            <div class="ak-creator-report-actions">
              <button type="button" class="primary-btn" data-ak-report-status="resolved">✓ Corrigé</button>
              <button type="button" class="secondary-btn" data-ak-report-status="open">Rouvrir</button>
              <button type="button" class="secondary-btn" data-ak-report-status="ignored">Ignorer</button>
              <button type="button" class="danger-btn" data-ak-report-delete>Supprimer</button>
            </div>
          </article>
        `).join("") : `<div class="ak-creator-empty"><span>🫧</span><strong>Rien dans ce filtre</strong><p>La boîte est calme. Pour l’instant.</p></div>`}
      </section>
    `;

    const reportsById = new Map(allReports.map(report => [report.clientReportId, report]));
    screen.querySelectorAll("[data-ak-report-filter]").forEach(button => button.addEventListener("click", () => akCreatorRenderInbox(button.dataset.akReportFilter, document.querySelector("#akCreatorReportSearch")?.value || "")));
    document.querySelector("#akCreatorReportSearch")?.addEventListener("input", event => {
      window.clearTimeout(state.akCreatorSearchTimer);
      state.akCreatorSearchTimer = window.setTimeout(() => akCreatorRenderInbox(filter, event.target.value), 260);
    });
    screen.querySelectorAll("[data-client-report-id]").forEach(card => {
      const report = reportsById.get(card.dataset.clientReportId);
      card.querySelectorAll("[data-ak-report-status]").forEach(button => button.addEventListener("click", async () => {
        button.disabled = true;
        try {
          await akCreatorSetReportStatus(report, button.dataset.akReportStatus);
          akCreatorRenderInbox(filter, search);
        } catch (error) {
          console.error(error);
          button.disabled = false;
          alert("Impossible de mettre à jour ce signalement.");
        }
      }));
      card.querySelector("[data-ak-report-delete]")?.addEventListener("click", async () => {
        if (!confirm("Supprimer définitivement ce signalement ?")) return;
        await akCreatorDeleteReport(report);
        akCreatorRenderInbox(filter, search);
      });
    });
    screen.querySelector("[data-ak-export-reports]")?.addEventListener("click", () => akCreatorDownload(`akgames-signalements-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(allReports, null, 2)));
    screen.querySelector("[data-ak-retry-cloud]")?.addEventListener("click", () => akCreatorRenderInbox(filter, search));
  }

  async function akCreatorLoadSource(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`Impossible de charger ${path}`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  async function akCreatorRenderContentBrowser(sourcePath = AK_CREATOR_SOURCES[0][1], search = "") {
    if (!(await akCreatorUnlock())) return;
    if (!(await akCreatorRequirePermission("content"))) return;
    state.akCreatorScreen = "browser";
    title.textContent = "Base de contenus";
    setBackVisible(true);
    screen.innerHTML = `<section class="ak-creator-loading"><span>🗃️</span><strong>Chargement des cartes…</strong></section>`;

    const source = AK_CREATOR_SOURCES.find(([, path]) => path === sourcePath) || AK_CREATOR_SOURCES[0];
    let items = [];
    let errorMessage = "";
    try {
      items = await akCreatorLoadSource(source[1]);
    } catch (error) {
      errorMessage = error?.message || "Fichier introuvable";
    }
    const needle = String(search || "").trim().toLowerCase();
    const filtered = items.filter(item => !needle || [item.id, akCreatorItemText(item), akCreatorItemSecondary(item), item.category].join(" ").toLowerCase().includes(needle));
    const visible = filtered.slice(0, 80);

    screen.innerHTML = `
      <section class="ak-creator-hero ak-creator-hero-small">
        <div><span>🗃️</span><div><small>NAVIGATEUR JSON</small><h2>${akCreatorEscape(source[0])}</h2><p>${items.length} cartes dans le fichier · ${filtered.length} résultat(s)</p></div></div>
      </section>
      <section class="ak-creator-browser-tools">
        <select id="akCreatorSource" class="text-input">${AK_CREATOR_SOURCES.map(([name, path]) => `<option value="${akCreatorEscape(path)}" ${path === source[1] ? "selected" : ""}>${akCreatorEscape(name)}</option>`).join("")}</select>
        <input id="akCreatorContentSearch" class="text-input" value="${akCreatorEscape(search)}" placeholder="Chercher par ID, texte ou catégorie…">
      </section>
      ${errorMessage ? `<div class="notice">${akCreatorEscape(errorMessage)}</div>` : ""}
      <section class="ak-creator-content-list">
        ${visible.map((item, index) => `
          <article class="ak-creator-content-card">
            <div><code>${akCreatorEscape(item.id || `item_${index + 1}`)}</code><span>${akCreatorEscape(item.category || item.type || "sans catégorie")}</span></div>
            <p>${akCreatorEscape(akCreatorItemText(item))}</p>
            ${akCreatorItemSecondary(item) ? `<small>${akCreatorEscape(akCreatorItemSecondary(item))}</small>` : ""}
            <div class="ak-creator-inline-actions">
              <button type="button" class="secondary-btn" data-ak-copy-content-id="${akCreatorEscape(item.id || "")}">Copier l’ID</button>
              <button type="button" class="secondary-btn" data-ak-browser-report="${index}">🚩 Signaler</button>
            </div>
          </article>
        `).join("") || `<div class="ak-creator-empty"><span>🔎</span><strong>Aucun résultat</strong><p>Essaie un autre mot ou un autre fichier.</p></div>`}
        ${filtered.length > visible.length ? `<div class="notice">Les 80 premiers résultats sont affichés. Affine la recherche pour viser plus juste.</div>` : ""}
      </section>
    `;

    document.querySelector("#akCreatorSource")?.addEventListener("change", event => akCreatorRenderContentBrowser(event.target.value, ""));
    document.querySelector("#akCreatorContentSearch")?.addEventListener("input", event => {
      window.clearTimeout(state.akCreatorBrowserSearchTimer);
      state.akCreatorBrowserSearchTimer = window.setTimeout(() => akCreatorRenderContentBrowser(source[1], event.target.value), 250);
    });
    screen.querySelectorAll("[data-ak-copy-content-id]").forEach(button => button.addEventListener("click", async () => {
      await navigator.clipboard?.writeText(button.dataset.akCopyContentId || "");
      akCreatorToast("Identifiant copié.");
    }));
    screen.querySelectorAll("[data-ak-browser-report]").forEach(button => button.addEventListener("click", () => {
      const item = visible[Number(button.dataset.akBrowserReport)];
      const context = akCreatorContext(source[0], source[1].replace(/^data\//, "").replace(/\.json$/, ""), item, { index: Number(button.dataset.akBrowserReport) });
      akCreatorOpenReportDialog(context);
    }));
  }

  function akCreatorRoleOptions(selectedRole = "creator") {
    return ["creator", "tester", "moderator"]
      .sort((left, right) => left === selectedRole ? -1 : right === selectedRole ? 1 : 0)
      .map(role => ({
        value: role,
        label: `${AK_CREATOR_ROLES[role].label} · ${AK_CREATOR_ROLES[role].description}`
      }));
  }

  async function akCreatorShareInvite() {
    const url = akCreatorInviteUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Accès créateur AK’Games",
          text: "Ouvre ce lien pour demander un accès au mode créateur AK’Games.",
          url
        });
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      akCreatorToast("Lien d’invitation copié.");
    } catch {
      window.prompt("Copie ce lien d’invitation :", url);
    }
  }

  async function akCreatorApproveRequest(request) {
    const ownerAccess = await akCreatorRequirePermission("access", { force: true });
    if (!ownerAccess) return;
    const values = await akCreatorModal({
      eyebrow: "ACCORDER UN ACCÈS",
      titleText: request.name || "Nouvelle personne",
      description: request.note || "Choisis les droits à lui attribuer.",
      confirmLabel: "Autoriser",
      fields: [{
        name: "role",
        label: "Rôle",
        type: "select",
        options: akCreatorRoleOptions("creator")
      }]
    });
    if (!values) return;
    const role = AK_CREATOR_ROLES[values.role] && values.role !== "owner" ? values.role : "creator";
    await window.AKFirebase.db.ref(`creatorAccess/${request.uid}`).set({
      role,
      name: String(request.name || AK_CREATOR_ROLES[role].label).slice(0, 40),
      active: true,
      grantedBy: ownerAccess.uid,
      grantedAt: Date.now(),
      updatedAt: Date.now()
    });
    await window.AKFirebase.db.ref(`creatorRequests/${request.uid}`).remove();
    akCreatorToast(`${request.name || "Cette personne"} est maintenant ${AK_CREATOR_ROLES[role].label.toLowerCase()}.`);
    akCreatorRenderAccessManager();
  }

  async function akCreatorRejectRequest(request) {
    if (!(await akCreatorRequirePermission("access", { force: true }))) return;
    if (!confirm(`Refuser la demande de ${request.name || "cette personne"} ?`)) return;
    await window.AKFirebase.db.ref(`creatorRequests/${request.uid}`).remove();
    akCreatorRenderAccessManager();
  }

  async function akCreatorChangeRole(member) {
    if (!(await akCreatorRequirePermission("access", { force: true }))) return;
    if (member.role === "owner") return;
    const values = await akCreatorModal({
      eyebrow: "MODIFIER LES DROITS",
      titleText: member.name || "Collaborateur",
      description: `Rôle actuel : ${AK_CREATOR_ROLES[member.role]?.label || member.role}.`,
      confirmLabel: "Enregistrer",
      fields: [{
        name: "role",
        label: "Nouveau rôle",
        type: "select",
        options: akCreatorRoleOptions(member.role)
      }]
    });
    if (!values) return;
    const role = AK_CREATOR_ROLES[values.role] && values.role !== "owner" ? values.role : member.role;
    await window.AKFirebase.db.ref(`creatorAccess/${member.uid}`).update({ role, active: true, updatedAt: Date.now() });
    akCreatorRenderAccessManager();
  }

  async function akCreatorRevokeAccess(member) {
    if (!(await akCreatorRequirePermission("access", { force: true }))) return;
    if (member.role === "owner") return;
    if (!confirm(`Retirer complètement l’accès de ${member.name || "cette personne"} ?`)) return;
    await window.AKFirebase.db.ref(`creatorAccess/${member.uid}`).remove();
    akCreatorRenderAccessManager();
  }

  async function akCreatorRenderAccessManager() {
    if (!(await akCreatorUnlock())) return;
    const ownerAccess = await akCreatorRequirePermission("access", { force: true });
    if (!ownerAccess) return;

    state.akCreatorScreen = "access";
    title.textContent = "Gestion des accès";
    setBackVisible(true);
    screen.innerHTML = `<section class="ak-creator-loading"><span>🔐</span><strong>Chargement des accès…</strong></section>`;

    const [accessSnapshot, requestSnapshot] = await Promise.all([
      window.AKFirebase.db.ref("creatorAccess").once("value"),
      window.AKFirebase.db.ref("creatorRequests").once("value")
    ]);

    const accessValue = accessSnapshot.val() || {};
    const requestValue = requestSnapshot.val() || {};
    const members = Object.entries(accessValue).map(([uid, raw]) => akCreatorNormalizeAccess(raw, uid)).filter(member => member.allowed);
    const requests = Object.entries(requestValue).map(([uid, request]) => ({ ...request, uid })).filter(request => request.status === "pending");
    members.sort((a, b) => (a.role === "owner" ? -1 : b.role === "owner" ? 1 : String(a.name).localeCompare(String(b.name), "fr")));
    requests.sort((a, b) => Number(a.requestedAt || 0) - Number(b.requestedAt || 0));

    screen.innerHTML = `
      <section class="ak-creator-hero ak-creator-hero-small">
        <div><span>🔐</span><div><small>ÉQUIPE PRIVÉE</small><h2>Qui peut entrer dans le labo ?</h2><p>Toi seule peux accepter, modifier ou retirer des accès.</p></div></div>
        <button type="button" class="primary-btn" data-ak-share-invite>Inviter</button>
      </section>

      <section class="ak-creator-section">
        <div class="ak-creator-section-title"><div><small>DEMANDES</small><h3>${requests.length} en attente</h3></div><span>📨</span></div>
        <div class="ak-creator-access-list">
          ${requests.length ? requests.map(request => `
            <article class="ak-creator-access-card is-request" data-ak-request-uid="${akCreatorEscape(request.uid)}">
              <div class="ak-creator-access-avatar">${akCreatorEscape(String(request.name || "?").slice(0, 1).toUpperCase())}</div>
              <div class="ak-creator-access-copy"><strong>${akCreatorEscape(request.name || "Personne inconnue")}</strong><small>${akCreatorEscape(request.note || "Aucun message")}</small><code>${akCreatorEscape(request.uid)}</code></div>
              <div class="ak-creator-access-actions"><button type="button" class="primary-btn" data-ak-approve>Accepter</button><button type="button" class="secondary-btn" data-ak-reject>Refuser</button></div>
            </article>
          `).join("") : `<div class="ak-creator-empty"><span>📭</span><strong>Aucune demande</strong><p>Partage le lien d’invitation à la personne de ton choix.</p></div>`}
        </div>
      </section>

      <section class="ak-creator-section">
        <div class="ak-creator-section-title"><div><small>ACCÈS ACTIFS</small><h3>${members.length} personne${members.length > 1 ? "s" : ""}</h3></div><span>🪪</span></div>
        <div class="ak-creator-access-list">
          ${members.map(member => `
            <article class="ak-creator-access-card" data-ak-member-uid="${akCreatorEscape(member.uid)}">
              <div class="ak-creator-access-avatar">${member.role === "owner" ? "★" : akCreatorEscape(String(member.name || "?").slice(0, 1).toUpperCase())}</div>
              <div class="ak-creator-access-copy"><strong>${akCreatorEscape(member.uid === ownerAccess.uid ? "Toi" : member.name)}</strong><span class="ak-creator-role role-${akCreatorEscape(member.role)}">${akCreatorEscape(AK_CREATOR_ROLES[member.role]?.label || member.role)}</span><small>${akCreatorEscape(AK_CREATOR_ROLES[member.role]?.description || "")}</small></div>
              ${member.role === "owner" ? `<span class="ak-creator-owner-lock">Intouchable</span>` : `<div class="ak-creator-access-actions"><button type="button" class="secondary-btn" data-ak-change-role>Modifier</button><button type="button" class="danger-btn" data-ak-revoke>Retirer</button></div>`}
            </article>
          `).join("")}
        </div>
      </section>

      <section class="ak-creator-access-help">
        <strong>Comment ça marche ?</strong>
        <p>Ton amie ouvre le lien, envoie sa demande, puis tu choisis son rôle ici. Elle ne peut ni s’autoriser seule ni accorder un accès à quelqu’un d’autre.</p>
      </section>
    `;

    screen.querySelector("[data-ak-share-invite]")?.addEventListener("click", akCreatorShareInvite);
    const requestsByUid = new Map(requests.map(request => [request.uid, request]));
    screen.querySelectorAll("[data-ak-request-uid]").forEach(card => {
      const request = requestsByUid.get(card.dataset.akRequestUid);
      card.querySelector("[data-ak-approve]")?.addEventListener("click", () => akCreatorApproveRequest(request));
      card.querySelector("[data-ak-reject]")?.addEventListener("click", () => akCreatorRejectRequest(request));
    });
    const membersByUid = new Map(members.map(member => [member.uid, member]));
    screen.querySelectorAll("[data-ak-member-uid]").forEach(card => {
      const member = membersByUid.get(card.dataset.akMemberUid);
      card.querySelector("[data-ak-change-role]")?.addEventListener("click", () => akCreatorChangeRole(member));
      card.querySelector("[data-ak-revoke]")?.addEventListener("click", () => akCreatorRevokeAccess(member));
    });
  }

  function akCreatorSafeStateSnapshot() {
    return {
      mode: state.mode,
      adult: state.adult,
      alcohol: state.alcohol,
      playerCount: state.players.length,
      players: state.players.map(player => ({ id: player.id, name: player.name, avatarId: player.avatarId, online: player.online, isVirtual: player.isVirtual })),
      roomCode: state.roomCode || null,
      isHost: Boolean(state.isHost),
      currentCategory: state.currentCategory,
      activeGames: {
        quiDeNous: Boolean(state.quiDeNous),
        laughDuel: Boolean(state.laughDuel),
        bestLiar: Boolean(state.bestLiar),
        actionTruth: Boolean(state.actionTruth),
        ambiancePoll: Boolean(state.ambiancePoll),
        sameBrain: Boolean(state.sameBrain),
        minorityGame: Boolean(state.minorityGame),
        whoAnswered: Boolean(state.whoAnswered),
        almostImpostor: Boolean(state.almostImpostor),
        fakeExpert: Boolean(state.fakeExpert),
        whoAmI: Boolean(state.whoAmI),
        megaGame: state.megaGame?.gameName || null
      },
      currentContent: akCreatorCurrentContent(),
      userAgent: navigator.userAgent,
      online: navigator.onLine,
      generatedAt: new Date().toISOString()
    };
  }

  async function akCreatorClearCaches() {
    if (!confirm("Vider les caches AK’Games et recharger la dernière version ?")) return;
    const registrations = await navigator.serviceWorker?.getRegistrations?.() || [];
    await Promise.all(registrations.map(registration => registration.unregister()));
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("akgames-")).map(key => caches.delete(key)));
    location.reload();
  }

  function akCreatorClearRecentContent() {
    Object.keys(localStorage)
      .filter(key => key.startsWith("akgames_recent"))
      .forEach(key => localStorage.removeItem(key));
    akCreatorToast("Mémoire des cartes récentes réinitialisée.");
  }

  async function akCreatorRenderDashboard() {
    if (!(await akCreatorUnlock())) return;
    const access = await akCreatorHasCloudAccess(true);
    if (!access.allowed) return;
    if (!state.akCreatorScreen) {
      state.akCreatorOrigin = document.querySelector("#resetApp") ? "settings" : "home";
    }
    state.akCreatorScreen = "dashboard";
    title.textContent = "Mode créateur";
    setBackVisible(true);
    const localReports = akCreatorLoadReports();
    const counts = akCreatorReportCounts(localReports);
    const roleInfo = AK_CREATOR_ROLES[access.role] || AK_CREATOR_ROLES.tester;
    const canLab = akCreatorCan(access, "lab");
    const canReports = akCreatorCan(access, "reports");
    const canContent = akCreatorCan(access, "content");
    const canDiagnostic = akCreatorCan(access, "diagnostic");
    const canMaintenance = akCreatorCan(access, "maintenance");
    const canManageAccess = akCreatorCan(access, "access");
    let pendingAccessCount = 0;
    if (canManageAccess) {
      try {
        const requestSnapshot = await window.AKFirebase.db.ref("creatorRequests").once("value");
        pendingAccessCount = Object.values(requestSnapshot.val() || {}).filter(request => request?.status === "pending").length;
      } catch {
        pendingAccessCount = 0;
      }
    }

    screen.innerHTML = `
      <section class="ak-creator-hero">
        <div class="ak-creator-hero-top">
          <div class="ak-creator-hero-mark">AK</div>
          <div class="ak-creator-hero-copy"><small>ESPACE PRIVÉ</small><h2>Le labo AK’Games</h2></div>
        </div>
        <p>${akCreatorEscape(roleInfo.description)}</p>
        <span class="ak-creator-status"><b>✓</b> ${akCreatorEscape(roleInfo.label)} vérifié</span>
      </section>

      ${canLab ? `
        <section class="ak-creator-section ak-creator-test-section">
          <div class="ak-creator-section-title"><div><small>SIMULATION RAPIDE</small><h3>Combien de joueurs ?</h3></div><span aria-hidden="true">🧪</span></div>
          <p class="helper">L’application crée une fausse soirée en mode « un téléphone » pour tester immédiatement chaque mécanique.</p>
          <div class="ak-creator-player-grid">
            ${[2, 3, 4, 6].map(count => `<button type="button" class="ak-creator-player-card" data-ak-test-players="${count}"><strong>${count}</strong><span>joueurs</span></button>`).join("")}
          </div>
        </section>
      ` : ""}

      <section class="ak-creator-dashboard-grid">
        ${canReports ? `<button type="button" class="ak-creator-tool-card" data-ak-open-inbox><span>🚩</span><strong>Signalements</strong><small>${counts.open} à traiter · ${localReports.length} enregistrés localement</small></button>` : ""}
        ${canContent ? `<button type="button" class="ak-creator-tool-card" data-ak-open-browser><span>🗃️</span><strong>Base de contenus</strong><small>Parcourir les questions, IDs et catégories</small></button>` : ""}
        ${canDiagnostic ? `<button type="button" class="ak-creator-tool-card" data-ak-copy-debug><span>🩺</span><strong>Diagnostic</strong><small>Copier l’état actuel pour comprendre un bug</small></button>` : ""}
        ${canMaintenance ? `<button type="button" class="ak-creator-tool-card" data-ak-reset-recents><span>♻️</span><strong>Cartes récentes</strong><small>Réautoriser les questions vues récemment</small></button>` : ""}
        ${canMaintenance ? `<button type="button" class="ak-creator-tool-card" data-ak-clear-cache><span>🧹</span><strong>Forcer la mise à jour</strong><small>Vider le cache PWA et recharger le code</small></button>` : ""}
        ${canManageAccess ? `<button type="button" class="ak-creator-tool-card ak-creator-access-tool" data-ak-manage-access><span>🔐</span><strong>Gestion des accès</strong><small>${pendingAccessCount ? `${pendingAccessCount} demande${pendingAccessCount > 1 ? "s" : ""} en attente` : "Inviter, choisir les rôles ou retirer un accès"}</small></button>` : ""}
        <button type="button" class="ak-creator-tool-card" data-ak-lock-creator><span>🔒</span><strong>Verrouiller</strong><small>Fermer les outils jusqu’au prochain code</small></button>
      </section>

      <section class="ak-creator-cloud-card is-connected">
        <div><span>☁️</span><div><strong>${akCreatorEscape(roleInfo.label)} connecté</strong><p>Les outils affichés correspondent uniquement aux droits accordés à ce compte.</p></div></div>
      </section>
    `;

    screen.querySelectorAll("[data-ak-test-players]").forEach(button => button.addEventListener("click", () => akCreatorStartLab(Number(button.dataset.akTestPlayers))));
    screen.querySelector("[data-ak-open-inbox]")?.addEventListener("click", () => akCreatorRenderInbox());
    screen.querySelector("[data-ak-open-browser]")?.addEventListener("click", () => akCreatorRenderContentBrowser());
    screen.querySelector("[data-ak-manage-access]")?.addEventListener("click", akCreatorRenderAccessManager);
    screen.querySelector("[data-ak-copy-debug]")?.addEventListener("click", async () => {
      if (!(await akCreatorRequirePermission("diagnostic"))) return;
      const debug = JSON.stringify(akCreatorSafeStateSnapshot(), null, 2);
      await navigator.clipboard?.writeText(debug);
      akCreatorToast("Diagnostic copié.");
    });
    screen.querySelector("[data-ak-reset-recents]")?.addEventListener("click", async () => {
      if (await akCreatorRequirePermission("maintenance")) akCreatorClearRecentContent();
    });
    screen.querySelector("[data-ak-clear-cache]")?.addEventListener("click", async () => {
      if (await akCreatorRequirePermission("maintenance")) akCreatorClearCaches();
    });
    screen.querySelector("[data-ak-lock-creator]")?.addEventListener("click", () => {
      akCreatorSetUnlocked(false);
      state.akCreatorScreen = null;
      renderHome();
    });
  }

  async function akCreatorMountDock() {
    const existing = document.querySelector("#akCreatorDockButton");
    const access = await akCreatorHasCloudAccess();
    if (!access.allowed || !akCreatorIsUnlocked() || state.akCreatorScreen || state.roomCode) {
      existing?.remove();
      return;
    }
    if (document.querySelector("#akCreatorDockButton")) return;

    const button = document.createElement("button");
    button.id = "akCreatorDockButton";
    button.className = "ak-creator-dock-button";
    button.type = "button";
    button.setAttribute("aria-label", "Ouvrir les outils créateur");
    button.innerHTML = "🛠️";
    button.addEventListener("click", async () => {
      if (!(await akCreatorRequireServerAccess({ force: true }))) {
        button.remove();
        return;
      }
      const access = await akCreatorHasCloudAccess();
      const quickOptions = [{ value: "dashboard", label: "Tableau de bord" }];
      if (akCreatorCan(access, "lab")) {
        quickOptions.push(
          { value: "catalog", label: "Retour au catalogue des jeux" },
          { value: "players2", label: "Recommencer avec 2 joueurs" },
          { value: "players3", label: "Recommencer avec 3 joueurs" },
          { value: "players4", label: "Recommencer avec 4 joueurs" },
          { value: "players6", label: "Recommencer avec 6 joueurs" }
        );
      }
      const values = await akCreatorModal({
        eyebrow: "OUTILS RAPIDES",
        titleText: state.akCreatorLab ? "Laboratoire en cours" : "Mode créateur",
        description: state.akCreatorLab ? `${state.players.length} joueurs virtuels sont actifs.` : "Ouvre les outils autorisés pour ce compte.",
        confirmLabel: "Continuer",
        fields: [{ name: "action", label: "Action", type: "select", options: quickOptions }]
      });
      if (!values) return;
      if (values.action === "dashboard") return akCreatorExitLabToDashboard();
      if (values.action === "catalog") {
        akCreatorResetGameStates();
        state.currentCategory = null;
        state.history = ["lobby"];
        return renderPlayChoice();
      }
      const count = Number(String(values.action || "").replace("players", ""));
      if (count) akCreatorStartLab(count);
    });
    document.body.appendChild(button);
  }

  async function akCreatorMountSettingsCard() {
    const existing = document.querySelector("#akCreatorSettingsCard");
    if (!document.querySelector("#resetApp")) {
      existing?.remove();
      return;
    }

    const access = await akCreatorHasCloudAccess();
    if (!access.allowed) {
      existing?.remove();
      return;
    }
    if (document.querySelector("#akCreatorSettingsCard")) return;

    const roleInfo = AK_CREATOR_ROLES[access.role] || AK_CREATOR_ROLES.tester;
    const card = document.createElement("section");
    card.id = "akCreatorSettingsCard";
    card.className = "ak-creator-settings-card";
    card.innerHTML = `
      <div><span>🛠️</span><div><strong>Mode créateur · ${akCreatorEscape(roleInfo.label)}</strong><p>${akCreatorEscape(roleInfo.description)}</p></div></div>
      <button type="button" class="primary-btn" data-ak-open-creator>${akCreatorIsUnlocked() ? "Ouvrir" : "Déverrouiller"}</button>
    `;
    document.querySelector("#resetApp")?.before(card);
    card.querySelector("[data-ak-open-creator]")?.addEventListener("click", akCreatorRenderDashboard);
  }

  async function akCreatorMountHomeShortcut() {
    const existing = document.querySelector("#akCreatorHomeShortcut");
    const access = await akCreatorHasCloudAccess();
    if (!access.allowed || !akCreatorIsUnlocked()) {
      existing?.remove();
      return;
    }
    if (document.querySelector("#akCreatorHomeShortcut")) return;

    const home = document.querySelector(".home-launch");
    if (!home) return;
    const button = document.createElement("button");
    button.id = "akCreatorHomeShortcut";
    button.className = "ak-creator-home-shortcut";
    button.type = "button";
    const roleInfo = AK_CREATOR_ROLES[access.role] || AK_CREATOR_ROLES.tester;
    button.innerHTML = `<span>🛠️</span><div><strong>Mode créateur actif</strong><small>${akCreatorEscape(roleInfo.label)} · ouvrir mes outils</small></div><b>›</b>`;
    button.addEventListener("click", akCreatorRenderDashboard);
    home.appendChild(button);
  }

  const akCreatorBaseRenderSettings = renderSettings;
  renderSettings = function () {
    state.akCreatorScreen = null;
    const result = akCreatorBaseRenderSettings.apply(this, arguments);
    window.requestAnimationFrame(akCreatorMountSettingsCard);
    return result;
  };

  const akCreatorBaseRenderHome = renderHome;
  renderHome = function () {
    state.akCreatorScreen = null;
    const result = akCreatorBaseRenderHome.apply(this, arguments);
    window.requestAnimationFrame(akCreatorMountHomeShortcut);
    return result;
  };

  backBtn.addEventListener("click", event => {
    if (!state.akCreatorScreen) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (state.akCreatorScreen === "dashboard") {
      const origin = state.akCreatorOrigin || "home";
      state.akCreatorScreen = null;
      state.akCreatorOrigin = null;
      if (origin === "settings") renderSettings();
      else renderHome();
    } else {
      akCreatorRenderDashboard();
    }
  }, true);

  const akCreatorObserver = new MutationObserver(() => {
    window.requestAnimationFrame(() => {
      akCreatorMountReportControl();
      akCreatorMountDock();
      akCreatorMountSettingsCard();
      akCreatorMountHomeShortcut();
    });
  });
  akCreatorObserver.observe(document.body, { childList: true, subtree: true });

  window.addEventListener("online", () => {
    akCreatorAccessCache.checkedAt = 0;
    akCreatorSyncPendingReports();
    akCreatorMountDock();
    akCreatorMountSettingsCard();
    akCreatorMountHomeShortcut();
  });

  window.AKFirebase?.auth?.onAuthStateChanged(() => {
    akCreatorAccessCache.checkedAt = 0;
    akCreatorAccessCache.pending = null;
    window.requestAnimationFrame(() => {
      akCreatorMountDock();
      akCreatorMountSettingsCard();
      akCreatorMountHomeShortcut();
    });
  });

  window.setTimeout(akCreatorSyncPendingReports, 1200);
  window.setTimeout(akCreatorShowSetupUidIfRequested, 350);
  window.setTimeout(akCreatorShowAccessRequestIfRequested, 500);
  window.requestAnimationFrame(() => {
    akCreatorMountReportControl();
    akCreatorMountDock();
    akCreatorMountSettingsCard();
    akCreatorMountHomeShortcut();
  });
})();
