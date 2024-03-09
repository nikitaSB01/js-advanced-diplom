/* eslint-disable max-len */

export default function canMoveOrAttack(charType, currentPos, targetPos, fieldSize, actionType) {
  const rowDiff = Math.abs(Math.floor(currentPos / fieldSize) - Math.floor(targetPos / fieldSize));
  const colDiff = Math.abs((currentPos % fieldSize) - (targetPos % fieldSize));

  // Проверка допустимости действия (перемещение или атака)
  if (actionType === 'move') {
    let maxMovDist;
    switch (charType) {
      case 'swordsman':
      case 'undead':
        maxMovDist = 4;
        break;
      case 'bowman':
      case 'vampire':
        maxMovDist = 2;
        break;
      case 'magician':
      case 'daemon':
        maxMovDist = 1;
        break;
      default:
        console.log('Выбран неверный тип игрока');
        return false;
    }
    return rowDiff <= maxMovDist && colDiff <= maxMovDist && (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff);
  } if (actionType === 'attack') {
    let maxAttackRadius;
    switch (charType) {
      case 'swordsman':
      case 'undead':
        maxAttackRadius = 1;
        break;
      case 'bowman':
      case 'vampire':
        maxAttackRadius = 2;
        break;
      case 'magician':
      case 'daemon':
        maxAttackRadius = 4;
        break;
      default:
        console.log('Выбран неверный тип злыдня');
        return false;
    }

    // Проверка на радиус атаки в квадратном поле
    return rowDiff <= maxAttackRadius && colDiff <= maxAttackRadius;
  }
  return false;
}
