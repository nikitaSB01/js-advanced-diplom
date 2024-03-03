import { calcTileType } from '../js/utils';

test('проверка calcTileType', () => {
  expect(calcTileType(8, 8)).toBe('left');
});

test('проверка calcTileType на center', () => {
  expect(calcTileType(9, 8)).toBe('center');
});
