import GameController from '../js/GameController';
import GamePlay from '../js/GamePlay';
import Vampire from '../js/characters/Vampire';
import GameState from '../js/GameState';
import GameStateService from '../js/GameStateService';
import Team from '../js/Team';
import PositionedCharacter from '../js/PositionedCharacter';
import Bowman from '../js/characters/Bowman';
import Swordsman from '../js/characters/Swordsman';
import Magician from '../js/characters/Magician';
import Daemon from '../js/characters/Daemon';
import Undead from '../js/characters/Undead';

test('Create tooltip message', () => {
  const gamePlay = new GamePlay();
  const gameContr = new GameController(gamePlay);
  const vampir = new Vampire(1);
  const res = gameContr.createMessage(vampir);
  const expected = '\u{1F396} 1 \u{2694} 25 \u{1F6E1} 25 \u{2764} 50';
  expect(res).toEqual(expected);
});

describe('GameStateService', () => {
  let storage;
  let gameStateService;
  beforeEach(() => {
    storage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    };
    gameStateService = new GameStateService(storage);
  });

  describe('load method', () => {
    it('should handle invalid state gracefully', () => {
      storage.getItem.mockReturnValue('invalid state');
      expect(() => {
        gameStateService.load();
      }).toThrow('Invalid state');
    });
    it('should handle missing state gracefully', () => {
      storage.getItem.mockReturnValue(null);
      const loadedState = gameStateService.load();
      expect(loadedState).toBeNull();
    });
  });

  describe('save method', () => {
    it('should save game state successfully', () => {
      const gameState = {
        positionsUser: [1, 2, 4],
        positionsBot: [2, 2, 2],
        isPlayer: true,
        level: 1,
        theme: 'prairie',
      };
      gameStateService.save(gameState);
      expect(storage.setItem).toHaveBeenCalledWith('state', JSON.stringify(gameState));
    });
  });
});
