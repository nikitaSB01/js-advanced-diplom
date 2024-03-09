import canMoveOrAttack from '../js/attackOrMove';

test.each([
  ['bowman', 3, 19, 8, 'move', true],
  ['bowman', 3, 19, 8, 'attack', true],
  ['swordsman', 29, 27, 8, 'move', true],
  ['magician', 28, 35, 8, 'move', true],
  ['magician', 28, 35, 8, 'attack', true],
  ['vampire', 35, 44, 8, 'move', true],
  ['undead', 10, 3, 8, 'attack', true],
  ['vampire', 12, 27, 8, 'attack', true],
  ['daemon', 44, 27, 8, 'attack', true],
  ['swordsman', 29, 27, 8, 'attack', false],
  ['swordsman', 29, 27, 8, 'dsdsd', false],
  ['dsdsdsdssddddsds', 29, 27, 8, 'move', false],
  ['dsdsdsdssddddsds', 29, 27, 8, 'attack', false],
])('test can attack or move', (charType, currentPos, targetPos, fieldSize, actionType, expected) => {
  const result = canMoveOrAttack(charType, currentPos, targetPos, fieldSize, actionType);
  expect(result).toBe(expected);
});
