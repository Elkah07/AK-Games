(function () {
  "use strict";

  const splash = document.querySelector("#splashScreen");
  const installBar = document.querySelector("#installBar");
  const installButton = document.querySelector("#confirmInstall");
  const dismissButton = document.querySelector("#dismissInstall");
  const backToast = document.querySelector("#backToast");
  const backButton = document.querySelector("#backBtn");

  let deferredInstallPrompt = null;
  let serviceWorkerRegistration = null;
  let lastExitBackAt = 0;
  let allowBrowserExit = false;
  let toastTimer = null;

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches
    || window.navigator.standalone === true;

  function hideSplash() {
    if (!splash) return;

    window.setTimeout(() => {
      splash.classList.add("ak-splash-hidden");

      window.setTimeout(() => {
        splash.remove();
      }, 380);
    }, 500);
  }

  window.addEventListener("load", hideSplash);

  // -------------------------------------------------------
  // Installation PWA
  // -------------------------------------------------------

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredInstallPrompt = event;

    if (!isStandalone && localStorage.getItem("akgames_install_dismissed") !== "yes") {
      installBar?.classList.remove("hidden");
    }
  });

  installButton?.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;

    installBar.classList.add("hidden");
    deferredInstallPrompt.prompt();

    try {
      await deferredInstallPrompt.userChoice;
    } finally {
      deferredInstallPrompt = null;
    }
  });

  dismissButton?.addEventListener("click", () => {
    installBar.classList.add("hidden");
    localStorage.setItem("akgames_install_dismissed", "yes");
  });

  window.addEventListener("appinstalled", () => {
    installBar?.classList.add("hidden");
    deferredInstallPrompt = null;
    localStorage.removeItem("akgames_install_dismissed");
  });

  // -------------------------------------------------------
  // Service worker et mises à jour
  // -------------------------------------------------------

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        serviceWorkerRegistration = await navigator.serviceWorker.register(
          "/service-worker.js",
          { scope: "/" }
        );

        serviceWorkerRegistration.addEventListener("updatefound", () => {
          const worker = serviceWorkerRegistration.installing;
          if (!worker) return;

          worker.addEventListener("statechange", () => {
            if (
              worker.state === "installed"
              && navigator.serviceWorker.controller
            ) {
              if (hasActiveSession()) {
                localStorage.setItem("akgames_update_pending", "yes");
                showBackToast("Mise à jour prête. Elle sera appliquée dès la fin de la partie.");
                return;
              }

              worker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });

        activateWaitingWorkerWhenSafe();
      } catch (error) {
        console.error("Service worker non enregistré :", error);
      }
    });

    let reloading = false;

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloading) return;

      // Une mise à jour ne doit jamais recharger l'app au milieu d'une partie.
      if (hasActiveSession()) {
        localStorage.setItem("akgames_update_pending", "yes");
        showBackToast("Mise à jour prête. Elle sera appliquée au prochain redémarrage.");
        return;
      }

      reloading = true;
      localStorage.removeItem("akgames_update_pending");
      window.location.reload();
    });
  }

  function activateWaitingWorkerWhenSafe() {
    const waiting = serviceWorkerRegistration?.waiting;
    if (!waiting || hasActiveSession()) return false;

    localStorage.removeItem("akgames_update_pending");
    waiting.postMessage({ type: "SKIP_WAITING" });
    return true;
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      activateWaitingWorkerWhenSafe();
    }
  });

  window.setInterval(() => {
    if (localStorage.getItem("akgames_update_pending") === "yes") {
      activateWaitingWorkerWhenSafe();
    }
  }, 2000);

  // -------------------------------------------------------
  // Navigation Android / bouton Retour du téléphone
  // -------------------------------------------------------

  function showBackToast(message) {
    if (!backToast) return;

    backToast.textContent = message;
    backToast.classList.remove("hidden");

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      backToast.classList.add("hidden");
    }, 1900);
  }

  function hasVisibleInternalBack() {
    return backButton && !backButton.classList.contains("hidden");
  }

  function hasActiveSession() {
    if (typeof state !== "object" || !state) return false;
    if (state.roomCode) return true;

    const screenTitle = document.querySelector("#screenTitle")?.textContent?.trim() || "";
    const isHomeScreen =
      Array.isArray(state.history)
      && state.history.length === 0
      && !hasVisibleInternalBack()
      && (
        screenTitle === "La soirée commence ici"
        || Boolean(document.querySelector("[data-home-action]"))
      );

    // L'accueil est la source de vérité : d'anciens objets de jeu ne doivent pas
    // empêcher la fermeture de l'app après un retour normal au menu.
    if (isHomeScreen) return false;

    const activeSoloKeys = [
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
    ];

    return activeSoloKeys.some(key => {
      const game = state[key];
      if (!game || typeof game !== "object") return false;

      return ["questions", "jokePool", "prompts", "items", "cards"]
        .some(collection => Array.isArray(game[collection]) && game[collection].length > 0);
    });
  }

  function armBackGuard() {
    history.pushState({ akGamesGuard: true }, "", window.location.href);
  }

  history.replaceState({ akGamesBase: true }, "", window.location.href);
  armBackGuard();

  window.addEventListener("popstate", () => {
    if (allowBrowserExit) {
      return;
    }

    // Un écran possède déjà une vraie navigation interne.
    if (hasVisibleInternalBack()) {
      backButton.click();
      armBackGuard();
      return;
    }

    // Pendant une partie ou dans une room, on ne quitte jamais brutalement.
    if (hasActiveSession()) {
      showBackToast("Quitte la partie depuis le bouton prévu dans AK'Games.");
      armBackGuard();
      return;
    }

    // À l'accueil uniquement : deux pressions rapprochées permettent de quitter.
    const now = Date.now();

    if (now - lastExitBackAt < 1800) {
      allowBrowserExit = true;
      history.back();
      return;
    }

    lastExitBackAt = now;
    showBackToast("Appuie encore une fois pour quitter AK'Games.");
    armBackGuard();
  });

  // -------------------------------------------------------
  // Accessibilité, focus et annonces des changements d’écran
  // -------------------------------------------------------

  const screenRegion = document.querySelector("#screen");
  const screenTitle = document.querySelector("#screenTitle");
  const screenAnnouncer = document.querySelector("#screenAnnouncer");
  let lastAccessibleTitle = screenTitle?.textContent?.trim() || "";
  let lastAnnouncement = "";
  let accessibilityTimer = null;
  let lastControlSelector = "";

  function focusSelectorForControl(control) {
    if (!control) return "";
    if (control.id) return `#${CSS.escape(control.id)}`;

    const stableAttributes = [
      "data-avatar",
      "data-qcount",
      "data-category",
      "data-game",
      "data-choice",
      "data-rounds",
      "data-duration",
      "data-lives"
    ];

    for (const attribute of stableAttributes) {
      const value = control.getAttribute(attribute);
      if (value !== null) return `[${attribute}="${CSS.escape(value)}"]`;
    }

    return "";
  }

  document.addEventListener("pointerdown", event => {
    lastControlSelector = focusSelectorForControl(event.target.closest("button, a[href], input, select, textarea"));
  }, true);

  document.addEventListener("keydown", event => {
    if (!["Enter", " "].includes(event.key)) return;
    lastControlSelector = focusSelectorForControl(event.target.closest("button, a[href], input, select, textarea"));
  }, true);

  function syncPressedStates() {
    document.querySelectorAll("button.avatar-card, button.choice-pill").forEach(button => {
      button.setAttribute(
        "aria-pressed",
        button.classList.contains("selected") || button.classList.contains("active") ? "true" : "false"
      );
    });
  }

  function announceCurrentScreen() {
    if (!screenRegion || !screenTitle) return;

    syncPressedStates();

    const nextTitle = screenTitle.textContent?.trim() || "AK'Games";
    const firstHeading = screenRegion.querySelector("h2, h3")?.textContent?.trim() || "";
    const announcement = firstHeading && firstHeading !== nextTitle
      ? `${nextTitle}. ${firstHeading}`
      : nextTitle;

    const titleChanged = nextTitle !== lastAccessibleTitle;
    lastAccessibleTitle = nextTitle;

    if (screenAnnouncer && announcement !== lastAnnouncement) {
      lastAnnouncement = announcement;
      screenAnnouncer.textContent = "";
      window.setTimeout(() => { screenAnnouncer.textContent = announcement; }, 20);
    }

    const activeElement = document.activeElement;
    const isEditing = activeElement && ["INPUT", "TEXTAREA", "SELECT"].includes(activeElement.tagName);

    if (titleChanged) {
      if (!isEditing) screenTitle.focus({ preventScroll: true });
      return;
    }

    if ((!activeElement || activeElement === document.body) && lastControlSelector) {
      const replacement = document.querySelector(lastControlSelector);
      if (replacement && !replacement.disabled) replacement.focus({ preventScroll: true });
    }
  }

  if (screenRegion && screenTitle) {
    const observer = new MutationObserver(() => {
      window.clearTimeout(accessibilityTimer);
      accessibilityTimer = window.setTimeout(announceCurrentScreen, 35);
    });

    observer.observe(screenRegion, { childList: true, subtree: true, characterData: true });
    observer.observe(screenTitle, { childList: true, subtree: true, characterData: true });
    window.setTimeout(announceCurrentScreen, 60);
  }

  // -------------------------------------------------------
  // Raccourcis du manifest
  // -------------------------------------------------------

  window.addEventListener("load", () => {
    const action = new URLSearchParams(window.location.search).get("action");

    if (action === "create") {
      window.setTimeout(() => {
        document.querySelector('[data-home-action="create"]')?.click();
      }, 250);
    }

    if (action === "join") {
      window.setTimeout(() => {
        document.querySelector('[data-home-action="join"]')?.click();
      }, 250);
    }
  });
})();
