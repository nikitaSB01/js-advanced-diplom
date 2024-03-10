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
import canMoveOrAttack from './attackOrMove';

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
        if (string === 'playerTeam' && j < 6) {
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

  // Проверяет, является ли кликнутый персонаж персонажем игрока
  // eslint-disable-next-line class-methods-use-this
  checkPlayerChar(char) {
    if (!char) {
      //  GamePlay.showError('Игрок отсутствует');
      return false;
    }
    const playerChar = char.character.type;
    return (
      playerChar === 'bowman'
      || playerChar === 'swordsman'
      || playerChar === 'magician'
    );
  }

  // метод смены хода
  // eslint-disable-next-line class-methods-use-this
  switchTurn() {}

  // eslint-disable-next-line class-methods-use-this
  onCellClick(index) {
    if (this.gameOver) return;
    const cellWithCharacter = this.gamePlay.cells[index].querySelector('.character');
    this.clickedChar = this.allChars.find((char) => char.position === index);
    const isPlayerChar = this.checkPlayerChar(this.clickedChar);
    // если клик происходит на клетку с персом (cellWithCharacter) и он явл игроком (isPlayerChar)
    // тогда выделяем этого игрока желтым кругом (делаем его активным игроком)
    if (cellWithCharacter && isPlayerChar) {
      this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
      this.gamePlay.selectCell(index);
      this.activeChar = this.clickedChar;
      this.activeIndex = index;
      // (ниже)  если есть актив игрок и клик происходит на пустую ячейку
    } else if (!cellWithCharacter && this.activeChar) {
      if (
        canMoveOrAttack(
          this.activeChar.character.type,
          this.activeChar.position,
          index,
          this.fieldSize,
          'move',
        )
      ) {
        // Обновляем позицию активного персонажа
        this.activeChar.position = index;
        // Обновляем отображение персонажей
        this.gamePlay.redrawPositions(this.allChars);
        // Убираем выделение ячеек
        this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
        // ВРЕМЕННО ///////////////////////////////////////////////////////////////////////////////
        this.activeChar = null;
        // Переход
        this.switchTurn();
      } else {
        alert('ячейка в не зоны досигаемости вашего персонажа');
        // снимаем актив с перса
        this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
        this.activeChar = null;
      }
      //  код ниже будет между нижней ( } и else { )
      /* else if (this.activeChar) {
      // если есть активный игрок и он кликает на противника
      alert('это противник!!!');
      this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
      this.clickedChar = null;
    } */
    } else {
      // если нет активного игрока и клик происходит просто по пустой клетке
      GamePlay.showError('Игрок отсутствует');
      this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
      this.clickedChar = null;
    }
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

    // Если есть кликнутый персонаж при наведении им на другую клетку без персонажа,
    // проверяем может ли туда походить персонаж, если да, то подсвечиваем зеленым кругом
    if (this.clickedChar && !cellWithChar) {
      const playerType = this.clickedChar.character.type;

      if (
        canMoveOrAttack(
          playerType,
          this.clickedChar.position,
          index,
          this.fieldSize,
          'move',
        )
      ) {
        this.gamePlay.selectCell(index, 'green');
        this.gamePlay.setCursor('pointer');
      } else {
        this.gamePlay.setCursor('not-allowed');
      }
    }

    // Если есть кликнутый персонаж при наведении им на врага,
    // проверяем может ли его атаковать, если да, то подсвечиваем красным кругом
    if (this.clickedChar && cellWithChar) {
      const isPlayerChar = this.checkPlayerChar(this.enteredChar);
      if (isPlayerChar) return;

      const attackerType = this.clickedChar.character.type;
      if (
        canMoveOrAttack(
          attackerType,
          this.clickedChar.position,
          index,
          this.fieldSize,
          'attack',
        )
      ) {
        this.gamePlay.selectCell(index, 'red');
        this.gamePlay.setCursor('crosshair');
      } else {
        this.gamePlay.setCursor('not-allowed');
      }
    }
  }

  onCellLeave(index) {
    if (this.gameOver) return;
    this.gamePlay.hideCellTooltip(index);

    if (!this.gamePlay.cells[index].classList.contains('selected-yellow')) {
      this.gamePlay.deselectCell(index);
    }
  }
}
