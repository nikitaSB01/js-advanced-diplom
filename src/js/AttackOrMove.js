// AttackOrMove.js

export default function canMoveOrAttack(
  character,
  currentPos,
  targetPos,
  fieldSize,
  actionType,
) {
  const rowDiff = Math.abs(
    Math.floor(currentPos / fieldSize) - Math.floor(targetPos / fieldSize),
  );
  const colDiff = Math.abs((currentPos % fieldSize) - (targetPos % fieldSize));

  // Проверка допустимости действия (перемещение или атака)
  if (actionType === 'move') {
    return (
      rowDiff <= character.maxMoveDistance
      && colDiff <= character.maxMoveDistance
      && (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff)
    );
  } if (actionType === 'attack') {
    // Проверка на радиус атаки в квадратном поле
    return (
      rowDiff <= character.maxAttackRadius
      && colDiff <= character.maxAttackRadius
    );
  }
  return false;
}
