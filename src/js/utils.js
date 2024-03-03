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
  // Функция для преобразования одномерного индекса в двумерные координаты
  /* function rowCol(oneDimensionalIndex, size) {
    return [Math.floor(oneDimensionalIndex / size), oneDimensionalIndex % size]
  }; */
  const boundaries = {
    top: [1, 2, 3, 4, 5, 6],
    bottom: [57, 58, 59, 60, 61, 62],
    left: [8, 16, 24, 32, 40, 48],
    right: [15, 23, 31, 39, 47, 55],
    'top-left': [0],
    'top-right': [7],
    'bottom-left': [56],
    'bottom-right': [63],
  };
  for (const boundary in boundaries) {
    if (boundaries[boundary].includes(index)) {
      return boundary;
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
