import canMoveOrAttack from '../js/AttackOrMove';

describe('canMoveOrAttack function', () => {
  const character = {
    maxMoveDistance: 4,
    maxAttackRadius: 1,
  };
  const fieldSize = 8;

  describe('when action type is move', () => {
    it('returns true if target position is within character max move distance vertically or horizontally', () => {
      expect(canMoveOrAttack(character, 0, 16, fieldSize, 'move')).toBe(true); // Valid move vertically
      expect(canMoveOrAttack(character, 0, 8, fieldSize, 'move')).toBe(true); // Valid move horizontally
      expect(canMoveOrAttack(character, 0, 17, fieldSize, 'move')).toBe(false); // Invalid move
    });

    it('returns true if target position is within character max move distance diagonally', () => {
      expect(canMoveOrAttack(character, 0, 9, fieldSize, 'move')).toBe(true);
      expect(canMoveOrAttack(character, 0, 45, fieldSize, 'move')).toBe(false);
    });
  });

  describe('when action type is attack', () => {
    it('returns true if target position is within character max attack radius', () => {
      expect(canMoveOrAttack(character, 0, 9, fieldSize, 'attack')).toBe(true);
      expect(canMoveOrAttack(character, 0, 10, fieldSize, 'attack')).toBe(false);
    });
  });

  it('returns false if action type is neither move nor attack', () => {
    expect(canMoveOrAttack(character, 0, 16, fieldSize, 'invalid')).toBe(false);
  });
});
