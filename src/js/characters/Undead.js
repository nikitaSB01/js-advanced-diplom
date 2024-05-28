import Character from '../Character';

export default class Undead extends Character {
  constructor(level, type = 'undead') {
    super(level, type);
    this.attack = 40;
    this.defence = 10;
    this.maxMoveDistance = 4; // максимальная дальность хода
    this.maxAttackRadius = 1; // максимальная дальность атаки
  }
}
