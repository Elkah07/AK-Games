(function () {
  "use strict";

  const EVENT_ALIASES = {
    select: "selected",
    selected: "selected",
    lobby: "lobby_ready",
    lobby_ready: "lobby_ready",
    start: "game_start",
    game_start: "game_start",
    turn: "turn_start",
    turn_start: "turn_start",
    phone: "phone_pass",
    phone_pass: "phone_pass",
    wait: "waiting_others",
    waiting_others: "waiting_others",
    win: "round_win",
    round_win: "round_win",
    miss: "round_miss",
    round_miss: "round_miss",
    pause: "pause",
    resume: "resume",
    final_win: "final_win",
    final_lose: "final_lose"
  };

  class CharacterVoiceEngine {
    constructor(characterData) {
      const characters = Array.isArray(characterData?.characters) ? characterData.characters : [];
      this.characters = new Map(characters.map(character => [character.id, character]));
      this.bags = new Map();
      this.lastLine = new Map();
    }

    _key(characterId, eventName) {
      return `${characterId}::${eventName}`;
    }

    _shuffle(values) {
      const copy = [...values];
      for (let index = copy.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
      }
      return copy;
    }

    getLine(characterId, eventName) {
      const character = this.characters.get(characterId);
      if (!character) return "";

      const event = EVENT_ALIASES[eventName] || eventName || "game_start";
      const eventLines = character.lines?.[event] || character.lines?.game_start || [];
      if (!eventLines.length) return "";

      const key = this._key(characterId, event);
      let bag = this.bags.get(key) || [];

      if (!bag.length) {
        bag = this._shuffle(eventLines);
        const previous = this.lastLine.get(key);
        if (bag.length > 1 && bag[0] === previous) {
          [bag[0], bag[1]] = [bag[1], bag[0]];
        }
      }

      const line = bag.shift() || "";
      this.bags.set(key, bag);
      this.lastLine.set(key, line);
      return line;
    }

    reset(characterId = null, eventName = null) {
      if (!characterId) {
        this.bags.clear();
        this.lastLine.clear();
        return;
      }

      const event = eventName ? (EVENT_ALIASES[eventName] || eventName) : null;
      const prefix = event ? `${characterId}::${event}` : `${characterId}::`;
      for (const key of [...this.bags.keys()]) {
        if (key.startsWith(prefix)) this.bags.delete(key);
      }
      for (const key of [...this.lastLine.keys()]) {
        if (key.startsWith(prefix)) this.lastLine.delete(key);
      }
    }
  }

  let engine = null;
  let loadError = null;

  function characterSlug(characterId) {
    return window.AKCharacterPoses?.slugFor?.(characterId) || characterId || "croa";
  }

  const ready = fetch("data/akgames-characters.json", { cache: "no-cache" })
    .then(response => {
      if (!response.ok) throw new Error(`Répliques indisponibles (${response.status})`);
      return response.json();
    })
    .then(data => {
      engine = new CharacterVoiceEngine(data);
      return data;
    })
    .catch(error => {
      loadError = error;
      console.warn("Répliques des mascottes non chargées :", error);
      return null;
    });

  window.AKCharacterVoice = {
    ready,
    get isReady() {
      return Boolean(engine);
    },
    get error() {
      return loadError;
    },
    getLine(characterId, eventName = "game_start") {
      return engine?.getLine(characterSlug(characterId), eventName) || "";
    },
    async getLineAsync(characterId, eventName = "game_start") {
      await ready;
      return engine?.getLine(characterSlug(characterId), eventName) || "";
    },
    reset(characterId = null, eventName = null) {
      engine?.reset(characterId ? characterSlug(characterId) : null, eventName);
    },
    CharacterVoiceEngine
  };
})();
