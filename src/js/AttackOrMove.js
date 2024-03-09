export default function canMoveOrAttack(charType, currentPos, targetPos, fieldSize, actionType) {
  const rowDiff = Math.abs(Math.floor(currentPos / fieldSize) - Math.floor(targetPos / fieldSize));
  const colDiff = Math.abs((currentPos % fieldSize) - (targetPos % fieldSize));
  let maxMoveDistance; let
    maxAttackDistance;

  // Определение максимальной дистанции перемещения и атаки в зависимости от типа персонажа
  switch (charType) {
    case 'swordsman':
    case 'undead':
      maxMoveDistance = 4;
      maxAttackDistance = 1;
      break;
    case 'bowman':
    case 'vampire':
      maxMoveDistance = 2;
      maxAttackDistance = 2;
      break;
    case 'magician':
    case 'daemon':
      maxMoveDistance = 1;
      maxAttackDistance = 4;
      break;
    default:
      console.log('Unknown character type');
      return false;
  }

  // Проверка допустимости действия (перемещение или атака)
  if (actionType === 'move' && rowDiff <= maxMoveDistance && colDiff <= maxMoveDistance) {
    return true;
  } if (actionType === 'attack' && rowDiff <= maxAttackDistance && colDiff <= maxAttackDistance) {
    return true;
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
