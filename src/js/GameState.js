import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Vampire from './characters/Vampire';
import Daemon from './characters/Daemon';
import Undead from './characters/Undead';
import PositionedCharacter from './PositionedCharacter';
import Team from './Team';

export default class GameState {
  static from(data) {
    const types = {
      swordsman: Swordsman,
      bowman: Bowman,
      magician: Magician,
      daemon: Daemon,
      undead: Undead,
      vampire: Vampire,
    };

    const createCharacter = (characterData) => {
      const CharacterClass = types[characterData.type];
      if (!CharacterClass) {
        throw new Error('Неизвестный тип');
      }
      const character = new CharacterClass(characterData.level);
      character.health = characterData.health;
      character.attack = characterData.attack;
      character.defence = characterData.defence;
      character.health = characterData.health;
      character.type = characterData.type; return character;
    };

    const userTeam = new Team();
    const positionsUser = data.positionsUser.map((positionCharacter) => {
      const character = createCharacter(positionCharacter.character);
      if (!Array.isArray(userTeam.characters)) {
        userTeam.characters = [];
      }
      userTeam.addCharacter(character);
      return new PositionedCharacter(character, positionCharacter.position);
    });
    // console.log('userTeam=>', userTeam);

    const botTeam = new Team();
    const positionsBot = data.positionsBot.map((positionCharacter) => {
      const character = createCharacter(positionCharacter.character);
      if (!Array.isArray(botTeam.characters)) {
        botTeam.characters = [];
      }
      botTeam.addCharacter(character);
      return new PositionedCharacter(character, positionCharacter.position);
    });
    // console.log('botTeam=>', botTeam);

    const gameState = new GameState();

    gameState.userTeam = userTeam;
    gameState.botTeam = botTeam;
    gameState.positionsUser = positionsUser;
    gameState.positionsBot = positionsBot;
    gameState.isPlayer = true;
    gameState.level = data.level;
    gameState.theme = data.theme;

    return gameState;
  }
}
