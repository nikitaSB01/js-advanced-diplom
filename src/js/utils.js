/**
 * @todo
 * @param index - индекс поля
 * @param boardSize - размер квадратного поля (в длину или ширину)
 * @returns строка - тип ячейки на поле:
 *
 * top-left
 * top-right
 * top
 * bottom-left
 * bottom-right
 * bottom
 * right
 * left
 * center
 *
 * @example
 * ```js
 * calcTileType(0, 8); // 'top-left'
 * calcTileType(1, 8); // 'top'
 * calcTileType(63, 8); // 'bottom-right'
 * calcTileType(7, 7); // 'left'
 * ```
 * */
export function calcTileType(index, boardSize) {
  const firstRow = index < boardSize;
  const lastRow = index >= boardSize * (boardSize - 1);
  const leftColumn = index % boardSize === 0;
  const rightColumn = index % boardSize === boardSize - 1;

  const positions = {
    'top-left': firstRow && leftColumn,
    'top-right': firstRow && rightColumn,
    'bottom-left': lastRow && leftColumn,
    'bottom-right': lastRow && rightColumn,
    top: firstRow && !(leftColumn || rightColumn),
    bottom: lastRow && !(leftColumn || rightColumn),
    left: leftColumn && !(firstRow || lastRow),
    right: rightColumn && !(firstRow || lastRow),
  };
  for (const position in positions) {
    if (positions[position]) {
      return position;
    }
  }

  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}
