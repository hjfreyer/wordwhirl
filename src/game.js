import * as _ from '../node_modules/lodash-es/lodash.js';

export class GameManager {
  constructor(wordList) {
    this._wordList = wordList;
  }

  newGame() {
    let contain = _.sample(this._wordList.containment);

    let fullWord = this._wordList.words[contain.fullWord];
    let tiles = [];
    for (let i = 0; i < fullWord.length; i++) {
      tiles.push(fullWord[i]);
    }
    tiles = _.shuffle(tiles);

    let answers = contain.subwords.map((i) => this._wordList.words[i]);
    answers = _.sortBy(answers, ['length', _.identity]);

    let g = new Game(tiles,answers);
    return g;
  }
}

class Game {
  constructor(tiles, answers) {
    this.tiles = tiles;
    this.answers = answers;
    this._score = 0;
    this._tiles = tiles.map((t, idx) => ({
      letter: t,
      slotIdx: idx,
      isSuggestion: false,
    }));
    this._available = [...this.tiles.keys()]; // Range
    this._suggestions = [];
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
      return [{move: {
        tileIdx: tileIdx,
        slotIdx: tile.slotIdx,
        isSuggestion: tile.isSuggestion,
      }}];
    }
    return [];
  }

  _nthEmpty(n) {
    let res = -1;
    for (let i = 0; i < n + 1; i++) {
      res = _.findIndex(this._available, s => s == -1, res + 1);
    }
    return res;
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
    return [{move: {
      tileIdx: tileIdx,
      slotIdx: tile.slotIdx,
      isSuggestion: tile.isSuggestion,
    }}];
  }

  submit() {
    let guess = this._suggestions.map(tileIdx => this.tiles[tileIdx]).join('');
    let answerIdx = this.answers.indexOf(guess);
    if (answerIdx != -1) {
      this._score++;
      let res = [{reveal: {answerIdx: answerIdx}}, {setScore: {
        score: `${this._score}/${this.answers.length}`
      }}];
      res = _.flatten(_.concat([res], _.times(guess.length, this.backspace.bind(this))));
      console.log(res);
      return res;
    } else {
      return [{reject: {}}];
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
        res.push({move: {
          tileIdx: this._available[i],
          slotIdx: perm[i],
          isSuggestion: false,
        }});
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
