import { characterGenerator, generateTeam } from '../js/generators';
import Bowman from '../js/characters/Bowman';
import Swordsman from '../js/characters/Swordsman';
import Magician from '../js/characters/Magician';
import Team from '../js/Team';

test('check characterGenerator', () => {
  const characterCount = 100;
  const generTeam = characterGenerator([Bowman, Swordsman, Magician], 3);
  const team = [];
  for (let i = 0; i < characterCount; i += 1) {
    const generChar = generTeam.next().value;
    team.push(generChar);
  }
  const resTeam = new Team(team);
  expect(resTeam.characters.length).toEqual(100);
});

test('check generateTeam', () => {
  const res = generateTeam([Bowman, Swordsman, Magician], 3, 50);
  const levelsInRange = res.characters.every(
    (character) => character.level >= 1 && character.level <= 3,
  );

  expect(res.characters.length).toBe(50);
  expect(levelsInRange).toBe(true);
});
