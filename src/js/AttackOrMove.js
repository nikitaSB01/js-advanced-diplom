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
        console.log('Unknown character type');
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
        console.log('Unknown character type');
        return false;
    }

    // Проверка на радиус атаки в квадратном поле
    return rowDiff <= maxAttackRadius && colDiff <= maxAttackRadius;
  }
  return false;
}

/* export default function canMove(playerType, currentPos, targetPos, fieldSize, attack = null) {
  const rowDiff = Math.abs(Math.floor(currentPos / fieldSize) - Math.floor(targetPos / fieldSize));
  const colDiff = Math.abs((currentPos % fieldSize) - (targetPos % fieldSize));

  let maxDistance;
  if (playerType === 'swordsman' || playerType === 'undead') {
    maxDistance = 4;
  } else if (playerType === 'bowman' || playerType === 'vampire') {
    maxDistance = 2;
  } else {
    maxDistance = 1;
  }

  return rowDiff <= maxDistance && colDiff <= maxDistance;

  if (attack) {
    console.log(true);
  }
}

function canAttack(attackerType, attackerPos, targetPos, fieldSize) {
  const rowDiff = Math.abs(Math.floor(attackerPos / fieldSize) - Math.floor(targetPos / fieldSize));
  const colDiff = Math.abs((attackerPos % fieldSize) - (targetPos % fieldSize));

  let attackRange;
  if (attackerType === 'swordsman' || attackerType === 'undead') {
    attackRange = 1;
  } else if (attackerType === 'bowman' || attackerType === 'vampire') {
    attackRange = 2;
  } else {
    attackRange = 4;
  }

  return rowDiff <= attackRange && colDiff <= attackRange;
}
 */
