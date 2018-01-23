import * as _ from 'lodash';
import * as t from './types';

const ROUND_LENGTH_SEC = 180;

enum GameState {
  STATE_WAITING_FOR_NEXT_GAME = 'WAITING_FOR_NEXT_GAME',
  STATE_WAITING_FOR_NEXT_ROUND = 'WAITING_FOR_NEXT_ROUND',
  STATE_ROUND = 'ROUND',
}

export interface NewRoundResponse {
  tiles: string[]
  answers: string[]
  endTime: number
}

export interface Move {
  tileIdx: number
  position: t.Position
}

export interface SelectTileResponse {
  moves: Move[]
};

export interface HeartbeatResponse {
  roundEnd?: {reveal: number[]}
}

export interface SubmitResponse {
  duplicate?: { answerIdx: number }
  accept?: { answerIdx: number }
  reject?: {}
  score: number
  moves: Move[]
}

export class Controller {
  _wordList: t.WordList
  _state : GameState
  _score: number
  _tiles: {
    letter: string,
    slotIdx: number,
    isSuggestion: boolean,
  }[]
  _answers: {
    answer: string
    guessed: boolean
  }[]

  _available: number[]
  _suggestions: number[]
  _endTime: number

  constructor(wordList : t.WordList) {
    this._wordList = wordList;

    this._state = GameState.STATE_WAITING_FOR_NEXT_GAME;
  }

  newGame() : void {
    this._checkState(GameState.STATE_WAITING_FOR_NEXT_GAME) ;

    this._state = GameState.STATE_WAITING_FOR_NEXT_ROUND;
    this._score = 0;
  }

  newRound() : NewRoundResponse {
    this._checkState(GameState.STATE_WAITING_FOR_NEXT_ROUND) ;

    let gameStructure = _.sample(this._wordList.containment);
    let tiles = _.shuffle(
      this._wordList.words[gameStructure!.fullWord].split(''));
    let answers = gameStructure!.subwords.map(i => this._wordList.words[i]);
    answers = _.sortBy(answers, ['length', _.identity]);

    this._tiles = tiles.map((t, idx) => ({
      letter: t,
      slotIdx: idx,
      isSuggestion: false,
    }));
    this._answers = answers.map(a => ({
      answer: a,
      guessed: false,
    }));
    this._available = [...tiles.keys()]; // Range
    this._suggestions = [];
    this._endTime = Date.now() + ROUND_LENGTH_SEC * 1000;

    this._state = GameState.STATE_ROUND;

    return {
      tiles: tiles,
      answers: answers,
      endTime: this._endTime,
    };
  }

  selectTile(tileIdx : number) : SelectTileResponse {
    this._checkState(GameState.STATE_ROUND);

    let tile = this._tiles[tileIdx];
    if (tile.isSuggestion) {
      if (tile.slotIdx != this._suggestions.length - 1) {
        return {
          moves: []
        };
      }
      return this.backspace();
    } else {
      this._suggestions.push(tileIdx);
      this._available[tile.slotIdx] = -1;
      tile.slotIdx = this._suggestions.length - 1;
      tile.isSuggestion = true;
      return {
        moves: [{
          tileIdx: tileIdx,
          position: {
            slot: tile.slotIdx,
            isSuggestion: tile.isSuggestion,
          }
        }]
      };
    }
  }

  heartbeat() : HeartbeatResponse {
    if (this._state != GameState.STATE_ROUND) {
      return {};
    }
    if (this._endTime < Date.now()) {
      this._state = GameState.STATE_WAITING_FOR_NEXT_ROUND;
      let toReveal = _.filter([...this._answers.keys()],
        (idx :number)  => !this._answers[idx].guessed);

      return {
        roundEnd: {
          reveal: toReveal,
        },
      };
    }
    return {};
  }

  backspace() : {moves: Move[]} {
    this._checkState(GameState.STATE_ROUND);
    if (this._suggestions.length == 0) {
      return {
        moves: []
      };
    }

    return {
      moves: [this._doBackspace()]
    };
  }

  _doBackspace() : Move {
    let tileIdx = this._suggestions[this._suggestions.length - 1];
    let tile = this._tiles[tileIdx];

    let dest = this._nthEmpty(tile.slotIdx);
    this._available[dest] = tileIdx;
    this._suggestions.pop();
    tile.slotIdx = dest;
    tile.isSuggestion = false;
    return {
      tileIdx: tileIdx,
      position: {
        slot: tile.slotIdx,
        isSuggestion: tile.isSuggestion,
      }
    };
  }

  _nthEmpty(n : number) : number {
    let res = -1;
    for (let i = 0; i < n + 1; i++) {
      res = _.findIndex(this._available, (s : number) => s == -1, res + 1);
    }
    return res;
  }

  submit() : SubmitResponse {
    this._checkState(GameState.STATE_ROUND);

    let guess = this._suggestions.map(tileIdx => this._tiles[tileIdx].letter).join('');
    let answerIdx = _.findIndex(this._answers, {
      // @ts-ignore
      'answer': guess
    });
    if (answerIdx != -1) {
      if (this._answers[answerIdx].guessed) {
        return {
          duplicate: {
            answerIdx: answerIdx
          },
          score: this._score,
          moves: _.times(guess.length, this._doBackspace.bind(this)),
        }
      } else {
        this._answers[answerIdx].guessed = true;
        this._score += guess.length * guess.length;
        return {
          accept: {
            answerIdx: answerIdx,
          },
          score: this._score,
          moves: _.times(guess.length, this._doBackspace.bind(this)),
        };
      }
    } else {
      return {
        reject: {},
        score: this._score,
        moves: [],
      };
    }
  }


  // TODO: This could be a bit prettier by only swapping filled slots, not
  // moving things to entirely new slots.
  shuffle() {
    this._checkState(GameState.STATE_ROUND);

    let moves : Move[] = [];

    let perm = _.shuffle(_.range(6));
    let newAvailable : number[] = [];
    for (let i = 0; i < perm.length; i++) {
      newAvailable[perm[i]] = this._available[i];
      if (this._available[i] != -1) {
        this._tiles[this._available[i]].slotIdx = perm[i];
        moves.push({
          tileIdx: this._available[i],
          position: {
            slot: perm[i],
            isSuggestion: false,
          }
        });
      }
    }

    this._available = newAvailable;
    return {
      moves: moves
    };
  }

  typeCharacter(char : string) : SelectTileResponse {
    this._checkState(GameState.STATE_ROUND);

    // TODO: Select the leftmost matching letter.
    let index = _.findIndex(this._tiles, t => t.letter == char && !t.isSuggestion);
    if (index == -1) {
      return {
        moves: []
      };
    }

    return this.selectTile(index);
  }

  _checkState(expectedState : GameState) {
    if (this._state != expectedState) {
      throw 'Invalid game state';
    }
  }
}
