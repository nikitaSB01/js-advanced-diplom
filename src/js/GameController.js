import GamePlay from './GamePlay';
import themes from './themes';
import PositionedCharacter from './PositionedCharacter';
import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Vampire from './characters/Vampire';
import Daemon from './characters/Daemon';
import Undead from './characters/Undead';
import GameState from './GameState';
import { generateTeam } from './generators';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.fieldSize = this.gamePlay.boardSize;

  /*  this.onCellClick = this.onCellClick.bind(this);
    this.onCellEnter = this.onCellEnter.bind(this);
    this.onCellLeave = this.onCellLeave.bind(this);

    this.addEvents(); */
  }

  init() {
    this.theme = themes.prairie;
    this.level = 1;

    this.gamePlay.drawUi(this.theme);
    this.playerTeam = generateTeam([Bowman, Swordsman, Magician], this.level, 3);
    this.playerPositions = this.generatePositions('playerTeam');
    this.positionedPlayerTeam = this.createPositionedTeam(this.playerTeam, this.playerPositions);

    this.enemyTeam = generateTeam([Vampire, Undead, Daemon], this.level, 3);
    this.enemyPositions = this.generatePositions('enemyTeam');
    this.positionedEnemyTeam = this.createPositionedTeam(this.enemyTeam, this.enemyPositions);
    this.allChars = [...this.positionedPlayerTeam, ...this.positionedEnemyTeam];

    this.gamePlay.redrawPositions(this.allChars);
  }

  generatePositions(string) {
    const positions = [];
    for (let i = 0; i < this.fieldSize; i += 1) {
      for (let j = 0; j < this.fieldSize; j += 1) {
        if (string === 'playerTeam' && j < 2) {
          positions.push(i * this.fieldSize + j);
        } else if (string === 'enemyTeam' && j >= this.fieldSize - 2) {
          positions.push(i * this.fieldSize + j);
        }
      }
    }
    return positions;
  }

  // eslint-disable-next-line class-methods-use-this
  createPositionedTeam(team, positions) {
    const positionedTeam = [];

    team.characters.forEach((char) => {
      const randomIndex = Math.floor(Math.random() * positions.length);
      const position = positions.splice(randomIndex, 1)[0];
      const positionedCharacter = new PositionedCharacter(char, position);
      positionedTeam.push(positionedCharacter);
    });

    return positionedTeam;
  }

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
