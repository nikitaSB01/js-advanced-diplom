import Character from '../Character';

export default class Daemon extends Character {
  constructor(level, type = 'daemon') {
    super(level, type);
    this.attack = 10;
    this.defence = 10;
    this.maxMoveDistance = 1; // максимальная дальность хода
    this.maxAttackRadius = 4; // максимальная дальность атаки
  }
}
