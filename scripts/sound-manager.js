/* =========================================================
   AK'GAMES V4.13 — MOTEUR AUDIO
   Pack original : 92 sons
   ========================================================= */
(() => {
  const BASE = "assets/sounds/";
  const FILES = new Set(["answer_lock", "answer_reveal", "card_reveal", "card_swipe", "code_copy", "correct", "countdown_go", "countdown_tick", "defeat", "game_start", "mascot_bonnie_hype", "mascot_bonnie_result", "mascot_bonnie_select", "mascot_croa_hype", "mascot_croa_result", "mascot_croa_select", "mascot_edgar_hype", "mascot_edgar_result", "mascot_edgar_select", "mascot_filou_hype", "mascot_filou_result", "mascot_filou_select", "mascot_flash_hype", "mascot_flash_result", "mascot_flash_select", "mascot_honey_hype", "mascot_honey_result", "mascot_honey_select", "mascot_kaia_hype", "mascot_kaia_result", "mascot_kaia_select", "mascot_loki_hype", "mascot_loki_result", "mascot_loki_select", "mascot_marcellius_hype", "mascot_marcellius_result", "mascot_marcellius_select", "mascot_maurice_hype", "mascot_maurice_result", "mascot_maurice_select", "mascot_moon_hype", "mascot_moon_result", "mascot_moon_select", "mascot_nuggets_hype", "mascot_nuggets_result", "mascot_nuggets_select", "mascot_rrrrh_hype", "mascot_rrrrh_result", "mascot_rrrrh_select", "mascot_sir-moustache_hype", "mascot_sir-moustache_result", "mascot_sir-moustache_select", "mascot_snow_hype", "mascot_snow_result", "mascot_snow_select", "mascot_spike_hype", "mascot_spike_result", "mascot_spike_select", "mascot_vapo_hype", "mascot_vapo_result", "mascot_vapo_select", "next_turn", "pass_phone", "pause", "player_added", "player_ready", "player_removed", "popup_close", "popup_open", "resume", "room_create", "room_join", "room_leave", "round_start", "score_up", "screen_open", "skip", "tie", "timer_end", "timer_warning", "ui_back", "ui_close_settings", "ui_confirm", "ui_error", "ui_install", "ui_notification", "ui_open_settings", "ui_tap", "ui_toggle_off", "ui_toggle_on", "victory", "wrong"]);
  const MASCOTS = {
  "croa": {
    "select": "mascot_croa_select",
    "hype": "mascot_croa_hype",
    "result": "mascot_croa_result"
  },
  "loki": {
    "select": "mascot_loki_select",
    "hype": "mascot_loki_hype",
    "result": "mascot_loki_result"
  },
  "kaia": {
    "select": "mascot_kaia_select",
    "hype": "mascot_kaia_hype",
    "result": "mascot_kaia_result"
  },
  "bonnie": {
    "select": "mascot_bonnie_select",
    "hype": "mascot_bonnie_hype",
    "result": "mascot_bonnie_result"
  },
  "edgar": {
    "select": "mascot_edgar_select",
    "hype": "mascot_edgar_hype",
    "result": "mascot_edgar_result"
  },
  "filou": {
    "select": "mascot_filou_select",
    "hype": "mascot_filou_hype",
    "result": "mascot_filou_result"
  },
  "nuggets": {
    "select": "mascot_nuggets_select",
    "hype": "mascot_nuggets_hype",
    "result": "mascot_nuggets_result"
  },
  "vapo": {
    "select": "mascot_vapo_select",
    "hype": "mascot_vapo_hype",
    "result": "mascot_vapo_result"
  },
  "rrrrh": {
    "select": "mascot_rrrrh_select",
    "hype": "mascot_rrrrh_hype",
    "result": "mascot_rrrrh_result"
  },
  "sir-moustache": {
    "select": "mascot_sir-moustache_select",
    "hype": "mascot_sir-moustache_hype",
    "result": "mascot_sir-moustache_result"
  },
  "snow": {
    "select": "mascot_snow_select",
    "hype": "mascot_snow_hype",
    "result": "mascot_snow_result"
  },
  "maurice": {
    "select": "mascot_maurice_select",
    "hype": "mascot_maurice_hype",
    "result": "mascot_maurice_result"
  },
  "moon": {
    "select": "mascot_moon_select",
    "hype": "mascot_moon_hype",
    "result": "mascot_moon_result"
  },
  "spike": {
    "select": "mascot_spike_select",
    "hype": "mascot_spike_hype",
    "result": "mascot_spike_result"
  },
  "honey": {
    "select": "mascot_honey_select",
    "hype": "mascot_honey_hype",
    "result": "mascot_honey_result"
  },
  "flash": {
    "select": "mascot_flash_select",
    "hype": "mascot_flash_hype",
    "result": "mascot_flash_result"
  },
  "marcellius": {
    "select": "mascot_marcellius_select",
    "hype": "mascot_marcellius_hype",
    "result": "mascot_marcellius_result"
  }
};
  const pools = new Map();
  const lastPlayed = new Map();

  function readSettings() {
    try {
      return {
        sounds: true,
        soundVolume: 55,
        mascotSounds: true,
        ...JSON.parse(localStorage.getItem("akgames_settings_v2") || "{}")
      };
    } catch {
      return { sounds: true, soundVolume: 55, mascotSounds: true };
    }
  }

  function allowed(options = {}) {
    const settings = readSettings();
    if (!settings.sounds || Number(settings.soundVolume || 0) <= 0) return false;
    if (options.mascot && settings.mascotSounds === false) return false;
    return true;
  }

  function volume(options = {}) {
    const settings = readSettings();
    return Math.max(0, Math.min(1, Number(settings.soundVolume || 0) / 100 * Number(options.gain ?? 1)));
  }

  function audioFor(id) {
    const existing = pools.get(id) || [];
    const available = existing.find(audio => audio.paused || audio.ended);
    if (available) return available;
    const audio = new Audio(`${BASE}${id}.wav`);
    audio.preload = "auto";
    existing.push(audio);
    if (existing.length > 4) existing.shift();
    pools.set(id, existing);
    return audio;
  }

  function play(id, options = {}) {
    if (!FILES.has(id) || !allowed(options)) return Promise.resolve(false);
    const now = performance.now();
    const cooldown = Number(options.cooldown ?? 65);
    if (now - Number(lastPlayed.get(id) || 0) < cooldown) return Promise.resolve(false);
    lastPlayed.set(id, now);
    try {
      const audio = audioFor(id);
      audio.currentTime = 0;
      audio.volume = volume(options);
      audio.playbackRate = Number(options.rate || 1);
      return audio.play().then(() => true).catch(() => false);
    } catch {
      return Promise.resolve(false);
    }
  }

  function playMascot(characterId, variant = "select", options = {}) {
    const id = MASCOTS[String(characterId || "")]?.[variant];
    if (!id) return Promise.resolve(false);
    return play(id, { ...options, mascot: true, cooldown: options.cooldown ?? 500 });
  }

  function preload(ids = ["ui_tap", "ui_confirm", "card_reveal", "victory"]) {
    ids.forEach(id => {
      if (!FILES.has(id)) return;
      try { audioFor(id).load(); } catch {}
    });
  }

  function stopAll() {
    pools.forEach(items => items.forEach(audio => {
      try { audio.pause(); audio.currentTime = 0; } catch {}
    }));
  }

  document.addEventListener("akgames:sound", event => {
    const detail = event.detail || {};
    if (detail.characterId) playMascot(detail.characterId, detail.variant || "select", detail);
    else if (detail.id) play(detail.id, detail);
  });

  let lastQuestion = "";
  let lastHandoff = "";
  let lastWinner = "";
  let lastLobbyCount = null;
  let observerTimer = 0;

  function visibleText(element) {
    return element?.textContent?.replace(/\s+/g, " ").trim() || "";
  }

  function inspectScreen() {
    const screen = document.querySelector("#screen");
    if (!screen) return;

    const handoff = screen.querySelector(".handoff-stage");
    const handoffKey = visibleText(handoff).slice(0, 180);
    if (handoffKey && handoffKey !== lastHandoff) {
      lastHandoff = handoffKey;
      play("pass_phone", { cooldown: 600 });
    } else if (!handoffKey) lastHandoff = "";

    const winner = screen.querySelector(".winner-stage");
    const winnerKey = visibleText(winner).slice(0, 220);
    if (winnerKey && winnerKey !== lastWinner) {
      lastWinner = winnerKey;
      const lower = winnerKey.toLowerCase();
      play(lower.includes("égal") ? "tie" : /défaite|perdu|perdant/.test(lower) ? "defeat" : "victory", { cooldown: 1200 });
    } else if (!winnerKey) lastWinner = "";

    const interactive = screen.querySelector(".decision-grid, .answer-grid, .answer-options, .quiz-options, .choice-grid, [data-answer], [data-choice]");
    const question = interactive ? screen.querySelector(".question, .prompt, .quiz-question, .playing-card h2, .mime-playing-card h2, .card h2, section h2") : null;
    const questionKey = visibleText(question).slice(0, 240);
    if (questionKey && questionKey !== lastQuestion) {
      if (lastQuestion) play("card_reveal", { cooldown: 350 });
      lastQuestion = questionKey;
    } else if (!questionKey) lastQuestion = "";

    const title = visibleText(document.querySelector("#screenTitle")).toLowerCase();
    if (/room|salon|joueur/.test(title + " " + visibleText(screen).slice(0, 150))) {
      const selectors = [".lobby-player", ".player-card[data-player-id]", "[data-room-player]", ".room-player"];
      let count = 0;
      for (const selector of selectors) {
        const found = screen.querySelectorAll(selector).length;
        if (found > count) count = found;
      }
      if (lastLobbyCount !== null && count > lastLobbyCount) play("room_join", { cooldown: 600 });
      if (lastLobbyCount !== null && count < lastLobbyCount) play("room_leave", { cooldown: 600 });
      lastLobbyCount = count;
    } else {
      lastLobbyCount = null;
    }
  }

  const observer = new MutationObserver(() => {
    clearTimeout(observerTimer);
    observerTimer = setTimeout(inspectScreen, 100);
  });
  window.addEventListener("DOMContentLoaded", () => {
    preload();
    const screen = document.querySelector("#screen");
    if (screen) observer.observe(screen, { childList: true, subtree: true, characterData: true });
    inspectScreen();
  });

  window.AKSound = {
    play,
    playMascot,
    preload,
    stopAll,
    files: FILES,
    mascots: MASCOTS
  };
})();
