import PositionedCharacter from '../js/PositionedCharacter';
import Vampire from '../js/characters/Vampire';

test('check Error PositionedCharacter in character and type position', () => {
  const char = {
    name: 'shop',
  };
  const charV = new Vampire(2);
  expect(() => new PositionedCharacter(char)).toThrow();
  expect(() => new PositionedCharacter(charV, '3')).toThrow();
});

test('check PositionedCharacter in character and position', () => {
  const charV = new Vampire(2);
  const resExpect = new PositionedCharacter(charV, 3);
  const result = {
    Vampire: {
      level: 2,
      attack: 25,
      defence: 25,
      health: 50,
      type: 'vampire',
    },
  };
  expect(resExpect.character).toEqual(result.Vampire);
  expect(resExpect.position).toBe(3);
});
