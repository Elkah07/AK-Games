(function () {
  "use strict";

  const splash = document.querySelector("#splashScreen");
  const installBar = document.querySelector("#installBar");
  const installButton = document.querySelector("#confirmInstall");
  const dismissButton = document.querySelector("#dismissInstall");
  const backToast = document.querySelector("#backToast");
  const backButton = document.querySelector("#backBtn");

  let deferredInstallPrompt = null;
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
        const registration = await navigator.serviceWorker.register(
          "/service-worker.js",
          { scope: "/" }
        );

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;

          worker.addEventListener("statechange", () => {
            if (
              worker.state === "installed"
              && navigator.serviceWorker.controller
            ) {
              worker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      } catch (error) {
        console.error("Service worker non enregistré :", error);
      }
    });

    let reloading = false;

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    });
  }

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
    const roomActive = Boolean(state.roomCode);

    const whoUsActive = Boolean(
      state.quiDeNous
      && Array.isArray(state.quiDeNous.questions)
      && state.quiDeNous.questions.length
    );

    const laughActive = Boolean(
      state.laughDuel
      && Array.isArray(state.laughDuel.jokePool)
      && state.laughDuel.jokePool.length
    );

    const liarActive = Boolean(
      state.bestLiar
      && Array.isArray(state.bestLiar.prompts)
      && state.bestLiar.prompts.length
    );

    return roomActive || whoUsActive || laughActive || liarActive;
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
