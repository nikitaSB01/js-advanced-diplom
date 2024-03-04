import Character from '../js/Character';
import Bowman from '../js/characters/Bowman';
import Undead from '../js/characters/Undead';
import Daemon from '../js/characters/Daemon';
import Vampire from '../js/characters/Vampire';

test('check creating classes', () => {
  expect(() => {
    const char = new Character(2);
    console.log(char);
  }).toThrow('Нельзя создать данный класс');
});

test('check creating object new Character - throw error', () => {
  const expetedBowman = {
    level: 1,
    attack: 25,
    defence: 25,
    health: 50,
    type: 'bowman',
  };
  const expectedUndead = {
    level: 1,
    attack: 40,
    defence: 10,
    health: 50,
    type: 'undead',
  };
  const expectedDaemon = {
    level: 1,
    attack: 10,
    defence: 10,
    health: 50,
    type: 'daemon',
  };
  const expectedVampire = {
    level: 1,
    attack: 25,
    defence: 25,
    health: 50,
    type: 'vampire',
  };
  expect(new Bowman(1)).toEqual(expetedBowman);
  expect(new Undead(1)).toEqual(expectedUndead);
  expect(new Daemon(1)).toEqual(expectedDaemon);
  expect(new Vampire(1)).toEqual(expectedVampire);
});
