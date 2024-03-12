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

  // Проверяет, является ли кликнутый персонаж персонажем игрока
  // eslint-disable-next-line class-methods-use-this
  checkPlayerChar(char) {
    if (!char) {
      return console.log('Character is missing');
    }

    const playerChar = char.character.type;
    return (
      playerChar === 'bowman'
      || playerChar === 'swordsman'
      || playerChar === 'magician'
    );
  }

  // Расчет урона
  // eslint-disable-next-line class-methods-use-this
  calcDamage(attacker, target) {
    const attackerAttack = attacker.character.attack;
    const targetDefence = target.character.defence;
    const damageDiff = attackerAttack - targetDefence;
    const damage = Math.max(damageDiff, attackerAttack * 0.1);

    return Math.floor(damage);
  }

  onCellClick(index) {
    if (this.gameOver) return;
    const cellWithChar = this.gamePlay.cells[index].querySelector('.character');
    this.clickedChar = this.allChars.find((char) => char.position === index);

    // Перемещаем персонажа
    if (this.enteredCell.classList.contains('selected-green')) {
      this.playerStep(index);
      return;
    }

    // Атакуем противника
    if (this.enteredCell.classList.contains('selected-red')) {
      this.playerAttack(index);
      return;
    }

    const isPlayerChar = this.checkPlayerChar(this.clickedChar);

    if (cellWithChar && isPlayerChar) {
      this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
      this.gamePlay.selectCell(index);
      this.activeChar = this.clickedChar;
      this.activeIndex = index;
    } else {
      GamePlay.showMessage('Вы не выбрали персонажа или делаете недоступный Вам ход');
      this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
      this.clickedChar = null;
    }
  }

  // Перемещение игрока
  playerStep(index) {
    this.activeChar.position = index;
    this.gamePlay.redrawPositions(this.allChars);
    this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
    this.clickedChar = null;
    this.state.isPlayer = false;
    this.state.chars = this.allChars;
    GameState.from(this.state);
    this.compAct();
  }

  playerAttack(index) {
    // Получаем информацию о цели атаки
    const targetCharacter = this.allChars.find((char) => char.position === index);
    // Рассчитываем урон
    const damage = this.calcDamage(this.activeChar, targetCharacter);
    // Отображаем анимацию урона
    this.gamePlay.showDamage(index, damage)
      .then(() => {
        // Уменьшаем здоровье атакованного персонажа
        targetCharacter.character.health -= damage;
        // Проверяем условие победы
        if (targetCharacter.character.health <= 0) {
          // eslint-disable-next-line max-len
          this.positionedEnemyTeam = this.positionedEnemyTeam.filter((char) => char !== targetCharacter);
          this.allChars = [...this.positionedPlayerTeam, ...this.positionedEnemyTeam];

          // Проверяем, остались ли еще враги
          if (this.positionedEnemyTeam.length === 0) {
            // Вызываем метод для перехода на следующий уровень или завершения игры
            this.levelUp();
          }
        }
        // Перерисовываем полоску здоровья атакованного персонажа
        this.gamePlay.redrawPositions(this.allChars);

        this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
        this.clickedChar = null;
        this.activeChar = null;
        this.state.isPlayer = false;
        // Обновляем состояние игры
        this.state.chars = this.allChars;
        GameState.from(this.state);
        // Переключаем ход компьютеру
        this.compAct();
      });
  }

  compAct() {
    let targetHero = null; // Переменная для хранения доступного для атаки героя
    let targetEnemy = null; // Переменная для хранения доступного для атаки героя
    // Получаем всех героев игрока
    const playerHeroes = this.positionedPlayerTeam.map((hero) => hero.position);
    // Перебираем всех злодеев на карте
    for (const enemy of this.positionedEnemyTeam) {
      // Проверяем доступность атаки злодея к каждому герою игрока
      for (const playerHero of playerHeroes) {
        if (canMoveOrAttack(enemy.character.type, enemy.position, playerHero, this.fieldSize, 'attack')) {
          // Если хотя бы один герой игрока находится в зоне атаки злодея,
          // сохраняем его в переменной targetHero
          targetHero = playerHero;
          targetEnemy = enemy;
          break; // Прерываем цикл, так как уже нашли цель для атаки
        }
      }
      // Если нашли цель для атаки, выходим из внешнего цикла
      if (targetHero !== null) {
        break;
      }
    }
    // Если есть цель для атаки, атакуем ее, иначе перемещаемся
    if (targetHero !== null) {
      this.enemyAttack(targetHero, targetEnemy);
    } else {
      this.moveRandomEnemy();
    }
  }

  enemyAttack(targetHero, targetEnemy) {
    // Находим цель атаки (героя игрока) по индексу
    const targetCharacter = this.allChars.find((char) => char.position === targetHero);
    // Рассчитываем урон злодея по цели атаки
    const damage = this.calcDamage(targetEnemy, targetCharacter);
    // Отображаем анимацию урона на герое игрока
    this.gamePlay.showDamage(targetHero, damage)
      .then(() => {
        // Уменьшаем здоровье героя игрока на рассчитанный урон
        targetCharacter.character.health -= damage;
        // Проверяем, если здоровье героя игрока достигло или упало ниже 0,
        // удаляем его из команды игрока
        if (targetCharacter.character.health <= 0) {
          // eslint-disable-next-line max-len
          this.positionedPlayerTeam = this.positionedPlayerTeam.filter((char) => char !== targetCharacter);
          // Обновляем все персонажи, чтобы убрать убитого героя
          this.allChars = [...this.positionedPlayerTeam, ...this.positionedEnemyTeam];
        }
        // Обновляем отображение полоски здоровья героя игрока
        this.gamePlay.redrawPositions(this.allChars);
        // Переключаем ход на игрока
        this.state.isPlayer = true;
        // Обновляем состояние игры
        this.state.chars = this.allChars;
        GameState.from(this.state);
      });
  }

  moveRandomEnemy() {
    // Выбираем случайного врага
    const randomEnemyIndex = Math.floor(Math.random() * this.positionedEnemyTeam.length);
    const randomEnemy = this.positionedEnemyTeam[randomEnemyIndex];
    // Создаем массив всех доступных ячеек для перемещения
    const availableCells = [];
    for (let i = 0; i < this.fieldSize * this.fieldSize; i += 1) {
      if (canMoveOrAttack(randomEnemy.character.type, randomEnemy.position, i, this.fieldSize, 'move')) {
        availableCells.push(i);
      }
    }
    // Исключаем занятые ячейки из массива доступных ячеек
    const occupiedCells = this.allChars.map((char) => char.position);
    const unoccupiedCells = availableCells.filter((cell) => !occupiedCells.includes(cell));
    // Выбираем случайную незанятую ячейку из оставшихся
    const randomCellIndex = Math.floor(Math.random() * unoccupiedCells.length);
    const newPosition = unoccupiedCells[randomCellIndex];
    // Перемещаем врага на выбранную ячейку
    randomEnemy.position = newPosition;
    // Обновляем отображение персонажей
    this.gamePlay.redrawPositions(this.allChars);
    // Обновляем состояние игры
    this.state.chars = this.allChars;
    GameState.from(this.state);
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
