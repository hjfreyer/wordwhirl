import * as _ from '../node_modules/lodash-es/lodash.js';

export class Controller {
  constructor(wordList) {
    this._wordList = wordList;
  }

  start() {
    return _.concat(this._newGame(), this._newRound());
  }

  _newGame() {
    this._score = 0;

    return [{
      initGame: {}
    }];
  }

  _newRound() {
    let gameStructure = _.sample(this._wordList.containment);
    let tiles = _.shuffle(
      this._wordList.words[gameStructure.fullWord].split(''));
    let answers = gameStructure.subwords.map(i => this._wordList.words[i]);
    answers = _.sortBy(answers, ['length', _.identity]);

    this._tiles = tiles.map((t, idx) => ({
      letter: t,
      slotIdx: idx,
      isSuggestion: false,
    }));
    this._available = [...tiles.keys()]; // Range
    this._suggestions = [];
    this._answers = answers;

    this._endTime = Date.now() + 180 * 1000;
    return [{
      initRound: {
        tiles: tiles,
        answers: answers,
        endTime: this._endTime,
      }
    }];
  }

  selectTile(tileIdx) {
    let tile = this._tiles[tileIdx];
    if (tile.isSuggestion) {
      if (tile.slotIdx != this._suggestions.length - 1) {
        return [];
      }
      return this.backspace();
    } else {
      this._suggestions.push(tileIdx);
      this._available[tile.slotIdx] = -1;
      tile.slotIdx = this._suggestions.length - 1;
      tile.isSuggestion = true;
      return [{
        move: {
          tileIdx: tileIdx,
          slotIdx: tile.slotIdx,
          isSuggestion: tile.isSuggestion,
        }
      }];
    }
    return [];
  }


  backspace() {
    if (this._suggestions.length == 0) {
      return [];
    }

    let tileIdx = this._suggestions[this._suggestions.length - 1];
    let tile = this._tiles[tileIdx];

    let dest = this._nthEmpty(tile.slotIdx);
    this._available[dest] = tileIdx;
    this._suggestions.pop();
    tile.slotIdx = dest;
    tile.isSuggestion = false;
    return [{
      move: {
        tileIdx: tileIdx,
        slotIdx: tile.slotIdx,
        isSuggestion: tile.isSuggestion,
      }
    }];
  }

  _nthEmpty(n) {
    let res = -1;
    for (let i = 0; i < n + 1; i++) {
      res = _.findIndex(this._available, s => s == -1, res + 1);
    }
    return res;
  }


  submit() {
    let guess = this._suggestions.map(tileIdx => this._tiles[tileIdx].letter).join('');
    let answerIdx = this._answers.indexOf(guess);
    if (answerIdx != -1) {
      let res = [{
        reveal: {
          answerIdx: answerIdx
        }
      }];
      res = _.flatten(_.concat([res], _.times(guess.length, this.backspace.bind(this))));
      return res;
    } else {
      return [{
        reject: {}
      }];
    }
  }


  // TODO: This could be a bit prettier by only swapping filled slots, not
  // moving things to entirely new slots.
  shuffle() {
    let res = [];

    let perm = _.shuffle(_.range(6));
    let newAvailable = [];
    for (let i = 0; i < perm.length; i++) {
      newAvailable[perm[i]] = this._available[i];
      if (this._available[i] != -1) {
        this._tiles[this._available[i]].slotIdx = perm[i];
        res.push({
          move: {
            tileIdx: this._available[i],
            slotIdx: perm[i],
            isSuggestion: false,
          }
        });
      }
    }

    this._available = newAvailable;
    return res;
  }

  typeCharacter(char) {
    // TODO: Select the leftmost matching letter.
    let index = _.findIndex(this._tiles, (t) => t.letter == char && !t.isSuggestion);
    if (index == -1) {
      return [];
    }

    return this.selectTile(index);
  }
}
