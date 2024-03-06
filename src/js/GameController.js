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

    this.onCellClick = this.onCellClick.bind(this);
    this.onCellEnter = this.onCellEnter.bind(this);
    this.onCellLeave = this.onCellLeave.bind(this);

    this.addEvents();
  }

  init() {
    this.theme = themes.prairie;
    this.level = 1;

    this.gamePlay.drawUi(this.theme);
    this.playerTeam = generateTeam(
      [Bowman, Swordsman, Magician],
      this.level,
      3,
    );
    this.playerPositions = this.generatePositions('playerTeam');
    this.positionedPlayerTeam = this.createPositionedTeam(
      this.playerTeam,
      this.playerPositions,
    );

    this.enemyTeam = generateTeam([Vampire, Undead, Daemon], this.level, 4);
    this.enemyPositions = this.generatePositions('enemyTeam');
    this.positionedEnemyTeam = this.createPositionedTeam(
      this.enemyTeam,
      this.enemyPositions,
    );
    this.allChars = [...this.positionedPlayerTeam, ...this.positionedEnemyTeam];

    this.gamePlay.redrawPositions(this.allChars);
    this.state = {
      isPlayer: true,
      theme: this.theme,
      level: this.level,
      chars: this.allChars,
    };
    GameState.from(this.state);
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

  addEvents() {
    this.gamePlay.addCellEnterListener(this.onCellEnter);
    this.gamePlay.addCellClickListener(this.onCellClick);
    this.gamePlay.addCellLeaveListener(this.onCellLeave);

    this.gamePlay.addNewGameListener(() => this.newGame());
    this.gamePlay.addSaveGameListener(() => this.saveGame());
    this.gamePlay.addLoadGameListener(() => this.loadGame());
  }

  // eslint-disable-next-line class-methods-use-this
  onCellClick(index) {
    if (this.gameOver) return;
    const cellWithCharacter = this.gamePlay.cells[index].querySelector('.character');
    this.clickedChar = this.allChars.find((char) => char.position === index);
    const isPlayerChar = this.checkPlayerChar(this.clickedChar);

    if (cellWithCharacter && isPlayerChar) {
      this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
      this.gamePlay.selectCell(index);
      this.activChar = this.clickedChar;
      this.activIndex = index;
    }/*  else{

    } */
  }

  // Проверяет, является ли кликнутый персонаж персонажем игрока
  // eslint-disable-next-line class-methods-use-this
  checkPlayerChar(char) {
    if (!char) {
      this.gamePlay.showError('Игрок отсутствует');
      return false;
    }
    const forbiddenTypes = ['daemon', 'undead', 'vampire'];
    const playerType = char.character.type;
    if (forbiddenTypes.includes(playerType)) {
      this.gamePlay.showError('Выбран тип злодея');
      return false;
    }
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  createMessage(char) {
    return `\u{1F396} ${char.level} \u{2694} ${char.attack} \u{1F6E1} ${char.defence} \u{2764} ${char.health}`;
  }

  onCellEnter(index) {
    if (this.gameOver) return;
    const cellWithChar = this.gamePlay.cells[index].querySelector('.character');
    this.enteredCell = this.gamePlay.cells[index];

    // Проверяем, есть ли персонаж в наведенной клетке
    if (cellWithChar) {
      this.enteredChar = this.allChars.find((char) => char.position === index);
      const message = this.createMessage(this.enteredChar.character);
      this.gamePlay.showCellTooltip(message, index);
      this.gamePlay.setCursor('pointer');
    }
    const selectedCell = this.gamePlay.cells[index].classList.contains('selected');
    if (!selectedCell && !cellWithChar) {
      this.gamePlay.setCursor('default');
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    this.gamePlay.hideCellTooltip(index);
  }
}
