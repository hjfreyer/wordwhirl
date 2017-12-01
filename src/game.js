import * as util from './util.js';

export class GameManager {
  constructor(wordList) {
    this._wordList = wordList;
  }

  newGame() {
    let contain = this._wordList.containment[30];

    let fullWord = this._wordList.words[contain.fullWord];
    let tiles = [];
    for (let i = 0; i < fullWord.length; i++) {
      tiles.push(fullWord[i]);
    }

    return new Game(tiles,
      contain.subwords.map((i) => this._wordList.words[i]));
  }
}

class Game {
  constructor(tiles, answers) {
    this.tiles = tiles;
    this.answers = answers;
  }

  start() {
    this._perm = [...this.tiles.keys()]; // Range.
    shuffleArray(this._perm);
    console.log(this._perm);

    return this.tiles.map((t, idx) => ['move', idx, this._perm[idx], false]);
  }
}
