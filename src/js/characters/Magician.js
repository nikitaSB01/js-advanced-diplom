import Character from '../Character';

export default class Magician extends Character {
  constructor(level, type = 'magician') {
    super(level, type);
    this.attack = 10;
    this.defence = 40;
    this.maxMoveDistance = 1; // максимальная дальность хода
    this.maxAttackRadius = 4; // максимальная дальность атаки
  }
}
