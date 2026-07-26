/**
 * AK'Games - moteur de répliques des mascottes
 * Utilise un "shuffle bag" séparé par personnage et événement :
 * toutes les phrases sont lues une fois dans un ordre aléatoire avant répétition.
 */
export class CharacterVoiceEngine {
  constructor(characterData) {
    this.characters = new Map(characterData.characters.map((character) => [character.id, character]));
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
    if (!character) return '';

    const eventLines = character.lines[eventName] || character.lines.game_start || [];
    if (!eventLines.length) return '';

    const key = this._key(characterId, eventName);
    let bag = this.bags.get(key) || [];

    if (!bag.length) {
      bag = this._shuffle(eventLines);
      const previous = this.lastLine.get(key);
      if (bag.length > 1 && bag[0] === previous) {
        [bag[0], bag[1]] = [bag[1], bag[0]];
      }
    }

    const line = bag.shift();
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

    const prefix = eventName ? `${characterId}::${eventName}` : `${characterId}::`;
    for (const key of [...this.bags.keys()]) {
      if (key.startsWith(prefix)) this.bags.delete(key);
    }
    for (const key of [...this.lastLine.keys()]) {
      if (key.startsWith(prefix)) this.lastLine.delete(key);
    }
  }
}
