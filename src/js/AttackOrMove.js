export default function canMove(playerType, currentPos, targetPos, fieldSize) {
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
}
