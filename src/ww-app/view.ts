import { Controller } from './game.ts';
import { WORDS } from './words.ts';
import * as _ from '../../node_modules/lodash-es/lodash.js'
import * as util from './util.ts'
import * as layout from './layout.ts'

class App extends Polymer.Element {
 static get is() {
   return 'ww-app';
 }
 static get properties() {
   return {
     prop1: {
       type: String,
       value: 'ww-app'
     }
   };
 }

  constructor() {
    super();
    this._c = new Controller(WORDS);
    this._newGame();
    this._newRound()

    this.wrong = false;
    this.showRoundOver = false;
    this.showGameOver = false;

    document.addEventListener('keydown', this._handleKeydown.bind(this));
    setInterval(this._heartbeat.bind(this), 1000);
  }

  _newGame() {
    this._c.newGame();
    this.score = 0;
    this.showGameOver = false;
  }

  _newRound() {
    this.showRoundOver = false;

    let resp = this._c.newRound();
    console.log(this._c);

    this.tiles = resp.tiles.map((t, idx) => ({
      letter: t,
      idx: idx,
      position: {
        slot: idx,
        isSuggestion: false
      },
    }));
    this.answers = resp.answers.map(a => ({
      word: a,
      hidden: true,
      spaces: _.times(a.length, () => '_ ').join('')
    }));
    this._endTime = resp.endTime;

    this._resetButtons();
  }

  lettersOf(word) {
    return word.split('');
  }

  styleOf(wordIdx, letterIdx) {
    let lh = new layout.LayoutHelper(this._layout);

    let pos = lh.getLetterCoordinates(wordIdx, letterIdx);
    return `
      left: ${pos.x}px;
      top: ${pos.y}px;
      width: ${this._layout.tileSizePx}px;
      height: ${this._layout.tileSizePx}px;
      font-size: ${this._layout.tileSizePx * 0.63}px;
    `;
  }

  nextRound() {
    this._newRound();
  }
  ready() {
    super.ready();

    let answers = _.map(this.answers, 'word');

    this._layout = layout.getOptimalLayout(answers, 0.2, 1.2, this.$.answers.offsetWidth, this.$.answers.offsetHeight);

    answers.forEach((a, wordIdx) => {
      for (let letterIdx = 0; letterIdx < a.length; letterIdx++) {
        let box = document.createElement('div');
        box.className = 'box';
        this.$.answers.appendChild(box);
      }
    });
  }

  _updateTime() {
    let timeLeft = Math.max(0, this._endTime - Date.now());
    this.time = util.formatMillis(timeLeft);
  }

  _heartbeat() {
    this._updateTime();
    let resp = this._c.heartbeat();
    if (resp.roundEnd) {
      this.showRoundOver = true;
      for (let answerIdx of resp.roundEnd.reveal) {
        this._reveal(answerIdx);
      }
    }
  }

  _handleKeydown(e) {
    let charCode = e.keyCode;
    const [a, z, A, Z] = ['a', 'z', 'A', 'Z'].map((s) => s.charCodeAt(0));
    if (a <= charCode && charCode <= z) {
      this._typeChar(String.fromCharCode(charCode));
    } else if (A <= charCode && charCode <= Z) {
      this._typeChar(String.fromCharCode(charCode - A + a));
    } else if (e.code == 'Backspace') {
      e.preventDefault();
      this._backspace();
    } else if (e.code == 'Enter') {
      e.preventDefault();
      this._submit();
    } else if (e.code == 'Space') {
      e.preventDefault();
      this._shuffle();
    }
    return false;
  }

  _typeChar(c) {
    this._moveTiles(this._c.typeCharacter(c).moves);
  }

  select(selectEvent) {
    if (selectEvent.model.item == -1) {
      return;
    }
    this._moveTiles(this._c.selectTile(selectEvent.model.item.idx).moves);
  }

  _moveTiles(moves) {
    moves.forEach(m => this._moveTile(m.tileIdx, m.position));
  }

  _moveTile(tileIdx, pos) {
    this.set(['tiles', tileIdx, 'position'], pos);
    this._resetButtons();
  }

  _resetButtons() {
    let suggestions = this.tiles.map(() => ({
      letter: '',
      idx: -1
    }));
    let available = this.tiles.map(() => ({
      letter: '',
      idx: -1
    }));
    this.tiles.map((t, idx) => {
      (t.position.isSuggestion ? suggestions : available)[t.position.slot] = {
        letter: t.letter,
        idx: idx,
      };
    });

    this.suggestions = suggestions;
    this.available = available;
  }

  _reveal(answerIdx) {
    this.set(['answers', answerIdx, 'hidden'], false);
  }

  _submit() {
    let resp = this._c.submit();
    this.score = resp.score;
    this._moveTiles(resp.moves);
    if (resp.accept) {
      this._reveal(resp.accept.answerIdx);
    }
    if (resp.reject) {
      this.wrong = true;
      window.setTimeout(() => this.wrong = false, 1000);
    }
  }

  _shuffle() {
    this._moveTiles(this._c.shuffle().moves);
  }

  _backspace() {
    this._moveTiles(this._c.backspace().moves);
  }
}
customElements.define('ww-app', App);
