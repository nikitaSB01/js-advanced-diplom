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
import canMoveOrAttack from './AttackOrMove';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.fieldSize = this.gamePlay.boardSize;
    this.gameOver = false; // Флаг для отслеживания завершения игры
    // Инициализация массива для хранения позиций врагов

    this.onCellClick = this.onCellClick.bind(this);
    this.onCellEnter = this.onCellEnter.bind(this);
    this.onCellLeave = this.onCellLeave.bind(this);

    this.addEvents();
  }

  init() {
    this.theme = themes.prairie;
    this.level = 1;
    this.gamePlay.drawUi(this.theme);
    // Создаем позиции для игрока и врагов
    this.playerPositions = this.generatePositions('playerTeam');
    this.enemyPositions = this.generatePositions('enemyTeam');

    this.playerTeam = generateTeam(
      [Bowman, Swordsman, Magician],
      this.level,
      3,
    );
    this.positionedPlayerTeam = this.createPositionedTeam(
      this.playerTeam,
      this.playerPositions,
    );

    this.enemyTeam = generateTeam([Vampire, Undead, Daemon], this.level, 1);
    this.positionedEnemyTeam = this.createPositionedTeam(
      this.enemyTeam,
      this.enemyPositions,
    ); this.allChars = [...this.positionedPlayerTeam, ...this.positionedEnemyTeam];

    this.gamePlay.redrawPositions(this.allChars);
    this.gameState = {
      positionsUser: this.positionedPlayerTeam,
      positionsBot: this.positionedEnemyTeam,
      isPlayer: true,
      level: this.level,
      theme: this.theme,
      positionedCharacter: this.allChars,
    };
    console.log('Initialized state:', this.state); // Выводим инициализированное состояние в консоль
  }

  generatePositions(string) {
    const positions = [];
    for (let i = 0; i < this.fieldSize ** 2; i += 1) {
      const position = i % this.fieldSize;

      if (string === 'playerTeam' && position <= 1) {
        positions.push(i);
      }

      if (string === 'enemyTeam' && position >= this.fieldSize - 2) {
        positions.push(i);
      }
    }
    return positions;
  }

  // eslint-disable-next-line class-methods-use-this
  createPositionedTeam(team, positions) {
    const positionedTeam = [];

    team.characters.forEach((char) => {
      const randomIndex = Math.floor(Math.random() * positions.length);
      const position = positions[randomIndex];
      const positionedCharacter = new PositionedCharacter(char, position);
      positionedTeam.push(positionedCharacter);
      positions.splice(randomIndex, 1);
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

    //  const cellWithChar = this.gamePlay.cells[index].querySelector('.character');
    const cellWithChar = this.gameState.positionedCharacter.find((char) => char.position === index);

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
      GamePlay.showMessage(
        'Вы не выбрали персонажа или делаете недоступный Вам ход',
      );
      this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
      this.clickedChar = null;
    }
  }

  // Перемещение игрока
  playerStep(index) {
    console.log('запуск playerStep');

    this.activeChar.position = index;
    this.gamePlay.redrawPositions(this.allChars);
    this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
    this.clickedChar = null;
    this.gameState.isPlayer = false;
    this.compAct();
  }

  playerAttack(index) {
    console.log('запуск playerAttack');

    // Получаем информацию о цели атаки
    const targetCharacter = this.allChars.find(
      (char) => char.position === index,
    );
    // Рассчитываем урон
    const damage = this.calcDamage(this.activeChar, targetCharacter);
    // Отображаем анимацию урона
    this.gamePlay.showDamage(index, damage).then(() => {
      // Уменьшаем здоровье атакованного персонажа
      targetCharacter.character.health -= damage;
      // Проверяем условие победы
      if (targetCharacter.character.health <= 0) {
        // eslint-disable-next-line max-len
        this.positionedEnemyTeam = this.positionedEnemyTeam.filter(
          (char) => char !== targetCharacter,
        );
        this.allChars = [
          ...this.positionedPlayerTeam,
          ...this.positionedEnemyTeam,
        ];

        // Проверяем, остались ли еще враги
        if (this.positionedEnemyTeam.length === 0) {
          // Вызываем метод для перехода на следующий уровень или завершения игры
          this.levelUp();
          return;
        }
      }
      // Перерисовываем полоску здоровья атакованного персонажа
      this.gamePlay.redrawPositions(this.allChars);

      this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
      this.clickedChar = null;
      this.activeChar = null;
      this.gameState.isPlayer = false;
      // Переключаем ход компьютеру
      this.compAct();
    });
  }

  compAct() {
    console.log('запуск compAct');

    if (!this.gameState.isPlayer) {
      // проверка ходит ли компьютерный игрок
      let targetHero = null;
      let targetEnemy = null;
      let maxDamage = -Infinity;
      const playerHeroes = this.positionedPlayerTeam.map(
        (hero) => hero.position,
      );

      for (const enemy of this.positionedEnemyTeam) {
        for (const playerHero of playerHeroes) {
          if (
            canMoveOrAttack(
              enemy.character,
              enemy.position,
              playerHero,
              this.fieldSize,
              'attack',
            )
          ) {
            const playerHeroCharacter = this.allChars.find(
              (char) => char.position === playerHero,
            );

            const damage = this.calcDamage(enemy, playerHeroCharacter);

            if (damage > maxDamage) {
              maxDamage = damage;
              targetHero = playerHero;
              targetEnemy = enemy;
            }
          }
        }
      }

      if (targetHero !== null) {
        this.enemyAttack(targetHero, targetEnemy);
      } else if (!this.gameOver) {
        this.moveRandomEnemy();
      }
    }
  }

  enemyAttack(targetHero, targetEnemy) {
    console.log('запуск enemyAttack');

    // Находим цель атаки (героя игрока) по индексу
    const targetCharacter = this.allChars.find(
      (char) => char.position === targetHero,
    );
    // Рассчитываем урон злодея по цели атаки
    const damage = this.calcDamage(targetEnemy, targetCharacter);
    // Отображаем анимацию урона на герое игрока
    this.gamePlay.showDamage(targetHero, damage).then(() => {
      // Уменьшаем здоровье героя игрока на рассчитанный урон
      targetCharacter.character.health -= damage;
      // Проверяем, если здоровье героя игрока достигло или упало ниже 0,
      // удаляем его из команды игрока
      if (targetCharacter.character.health <= 0) {
        // eslint-disable-next-line max-len
        this.positionedPlayerTeam = this.positionedPlayerTeam.filter(
          (char) => char !== targetCharacter,
        );
        // Обновляем все персонажи, чтобы убрать убитого героя
        this.allChars = [
          ...this.positionedPlayerTeam,
          ...this.positionedEnemyTeam,
        ];
        // Проверяем, остались ли еще враги
        if (this.positionedPlayerTeam.length === 0) {
          // Вызываем метод для перехода на следующий уровень или завершения игры
          this.finishGame();
          this.winOrOver('поражение');
          return;
        }
      }
      // Обновляем отображение полоски здоровья героя игрока
      this.gamePlay.redrawPositions(this.allChars);
      // Переключаем ход на игрока
      this.gameState.isPlayer = true;
    });
  }

  moveRandomEnemy() {
    console.log('запуск moveRandomEnemy');

    // Выбираем случайного врага
    // eslint-disable-next-line max-len
    const randomEnemy = this.positionedEnemyTeam[
      Math.floor(Math.random() * this.positionedEnemyTeam.length)
    ]; // Находим ближайшего к злодею героя
    const nearestHero = this.findNearestHero(randomEnemy.position);
    // Создаем массив всех доступных ячеек для перемещения
    const availableCells = [];
    for (let i = 0; i < this.fieldSize * this.fieldSize; i += 1) {
      if (
        canMoveOrAttack(
          randomEnemy.character,
          randomEnemy.position,
          i,
          this.fieldSize,
          'move',
        )
      ) {
        availableCells.push(i);
      }
    }
    // Исключаем занятые ячейки из массива доступных ячеек
    const occupiedCells = this.allChars.map((char) => char.position);
    const unoccupiedCells = availableCells.filter(
      (cell) => !occupiedCells.includes(cell),
    );
    // Находим доступную ячейку, которая находится ближе всего к герою
    let minDistance = Infinity;
    let nearestCell = null;
    for (const cell of unoccupiedCells) {
      const distance = this.calculateDistance(cell, nearestHero);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCell = cell;
      }
    }
    // Перемещаем врага на выбранную ячейку
    randomEnemy.position = nearestCell;
    // Обновляем отображение персонажей
    this.gamePlay.redrawPositions(this.allChars);
  }

  findNearestHero(position) {
    let nearestHero = null;
    let minDistance = Infinity;
    for (const hero of this.positionedPlayerTeam) {
      const distance = this.calculateDistance(position, hero.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearestHero = hero.position;
      }
    }
    return nearestHero;
  }

  calculateDistance(pos1, pos2) {
    const row1 = Math.floor(pos1 / this.fieldSize);
    const col1 = pos1 % this.fieldSize;
    const row2 = Math.floor(pos2 / this.fieldSize);
    const col2 = pos2 % this.fieldSize;
    return Math.abs(row1 - row2) + Math.abs(col1 - col2);
  }

  // eslint-disable-next-line class-methods-use-this
  createMessage(char) {
    return `\u{1F396} ${char.level} \u{2694} ${char.attack} \u{1F6E1} ${char.defence} \u{2764} ${char.health}`;
  }

  levelUp() {
    console.log('---LEVEL UP---');
    this.level += 1;

    switch (this.level) {
      case 2:
        this.theme = themes.desert;
        break;
      case 3:
        this.theme = themes.arctic;
        break;
      case 4:
        this.theme = themes.mountain;
        break;
      case 5:
        this.finishGame();
        this.winOrOver('победа');
        return;
      default:
        this.theme = themes.prairie;
        break;
    }

    this.gamePlay.drawUi(this.theme);

    for (const hero of this.positionedPlayerTeam) {
      const { health, attack, defence } = hero.character;
      hero.character.health = Math.floor(Math.min(health + 80, 100));
      hero.character.attack = Math.floor(
        Math.max(attack, (attack * (80 + health)) / 100),
      );
      hero.character.defence = Math.floor(
        Math.max(defence, (defence * (80 + health)) / 100),
      );
      hero.character.level = this.level;
    }

    this.playerTeam.characters = this.playerTeam.characters.filter(
      (char) => char.health > 0,
    );
    this.positionedPlayerTeam = this.createPositionedTeam(
      this.playerTeam,
      this.playerPositions,
    );

    this.enemyTeam = generateTeam([Vampire, Undead, Daemon], this.level, 1);
    this.enemyPositions = this.generatePositions('enemyTeam'); // Обновляем массив позиций врагов
    this.positionedEnemyTeam = this.createPositionedTeam(
      this.enemyTeam,
      this.enemyPositions,
    );

    for (const enemy of this.positionedEnemyTeam) {
      if (enemy.character.level === this.level) {
        const { health, attack, defence } = enemy.character;
        enemy.character.health = 100;
        enemy.character.attack = Math.floor(
          Math.max(attack, (attack * (80 + health)) / 100),
        );
        enemy.character.defence = Math.floor(
          Math.max(defence, (defence * (80 + health)) / 100),
        );
      }
    }

    this.allChars = [...this.positionedPlayerTeam, ...this.positionedEnemyTeam];
    this.gamePlay.redrawPositions(this.allChars);
    this.settingsDef();

    this.gameState = {
      positionsUser: this.positionedPlayerTeam,
      positionsBot: this.positionedEnemyTeam,
      isPlayer: true,
      level: this.level,
      theme: this.theme,
      positionedCharacter: this.allChars,
    };
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
      const playerType = this.clickedChar.character;

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

      const attackerType = this.clickedChar.character;
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

  settingsDef() {
    this.activeChar = null;
    this.activeIndex = null;
    this.clickedChar = null;
    this.enteredCell = null;
    this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
  }

  finishGame() {
    this.gameOver = true; // Устанавливаем флаг завершения игры
    this.settingsDef();
    this.gamePlay.setCursor('default');
    this.gamePlay.redrawPositions(this.allChars);
  }

  // eslint-disable-next-line class-methods-use-this
  winOrOver(winOrOver) {
    if (winOrOver === 'победа') {
      setTimeout(() => {
        GamePlay.showMessage('Вы выиграли!');
      }, 100);
    } else {
      setTimeout(() => {
        GamePlay.showMessage('Вы проиграли!');
      }, 100);
    }
  }

  // Начинаем новую игру
  newGame() {
    this.gameOver = false;
    this.settingsDef();
    this.init();
  }

  filterDeadCharacters() {
  // eslint-disable-next-line max-len
    this.positionedPlayerTeam = this.positionedPlayerTeam.filter((char) => char.character.health > 0);
    this.positionedEnemyTeam = this.positionedEnemyTeam.filter((char) => char.character.health > 0);
    this.allChars = [...this.positionedPlayerTeam, ...this.positionedEnemyTeam];
  }

  saveGame() {
    this.filterDeadCharacters();
    this.gameState.positionsUser = this.positionedPlayerTeam;
    this.gameState.positionsBot = this.positionedEnemyTeam;
    this.gameState.positionedCharacter = this.allChars;
    this.stateService.save(this.gameState);
    GamePlay.showMessage('Игра сохранена');
  }

  loadGame() {
    const data = this.stateService.load();
    if (!data) {
      GamePlay.showMessage('Нет сохраненных игр');
      return;
    }
    this.gameState = GameState.from(data);
    console.log('loadGame.gameState ===>', this.gameState);
    this.allChars = [...this.gameState.positionsUser, ...this.gameState.positionsBot];
    this.gameState.positionedCharacter = this.allChars;

    this.playerTeam = this.gameState.userTeam;
    this.enemyTeam = this.gameState.botTeam;
    this.positionedEnemyTeam = this.gameState.positionsBot;
    this.positionedPlayerTeam = this.gameState.positionsUser;
    // Обновляем отображение персонажей
    this.level = this.gameState.level;
    this.theme = this.gameState.theme;
    this.gamePlay.drawUi(this.theme);
    this.gamePlay.redrawPositions(this.allChars);
    this.gamePlay.setCursor('default');
  }
}
//  this.gameState.positionedCharacter.find((char) => char.position === index);
