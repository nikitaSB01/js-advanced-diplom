import GameController from '../js/GameController';
import GamePlay from '../js/GamePlay';
import Vampire from '../js/characters/Vampire';

test('Create tooltip message', () => {
  const gamePlay = new GamePlay();
  const gameContr = new GameController(gamePlay);
  const vampir = new Vampire(1);
  const res = gameContr.createMessage(vampir);
  const expected = '\u{1F396} 1 \u{2694} 25 \u{1F6E1} 25 \u{2764} 50';
  expect(res).toEqual(expected);
});
