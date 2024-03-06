export default class GameState {
  static from(object) {
    const state = {
      player: object.isPlayer,
      theme: object.theme,
      level: object.level,
      allChars: object.chars,
    };

    return state;
  }
}
