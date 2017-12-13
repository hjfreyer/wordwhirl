import { Element as PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';
import { Controller } from './game.js';
import { WORDS } from './words.js';
import * as _ from '../node_modules/lodash-es/lodash.js'
import '../node_modules/@polymer/polymer/lib/elements/dom-repeat.js';
import * as util from './util.js'

class App extends PolymerElement {

  static get template() {
    return `
<style>
  :host {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    padding: 20px;
  }
  card {
    font-size: 40px;
  }

  button {
    font-size: 40px;
  }
  #suggestions {
    display: flex;
  }

  #working-set {
    display: flex;
  }

  .slot {
    border: 1px solid black;
    width: 70px;
    height: 70px;
  }

  #answers {
    font-size: 20px;
  }
</style>
<div class="card" id="scoreboard">
  <label>Score: </label><span>[[score]]</span>
  <label>Time left: </label><span>[[time]]</span>
</div>

<div hidden="[[!showRoundOver]]">
  Round Over!
  <button on-click="nextRound">Next Round</button>
</div>

<div hidden="[[!showGameOver]]">
  Game Over!
  <button on-click="newGame">New Game</button>
</div>

<div>
  <div id="suggestions">
    <template is="dom-repeat" items="[[suggestions]]">
      <button on-click="select">[[item.letter]]</button>
    </template>
  </div>
  <div id="working-set">
    <template is="dom-repeat" items="[[available]]">
      <button on-click="select">[[item.letter]]</button>
    </template>
  </div>
  <div class="card">
    <button on-click="backspace">Back</button>
    <button on-click="_submit">Submit</button>
    <button on-click="_shuffle">Shuffle</button>
    <span hidden$="[[!wrong]]">Wrong</span>
  </div>
</div>

<div id="answers">
  <template is="dom-repeat" items="[[answers]]">
    <div hidden$="{{item.hidden}}" class="answer">{{item.word}}</div>
    <div hidden$="{{!item.hidden}}" class="hint">{{item.spaces}}</div>
  </template>
</div>
`
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


  nextRound() {
    this._newRound();
  }
  // ready() {
  //   super.ready();
  // }


  _updateTime() {
    let timeLeft = Math.max(0, this._endTime - Date.now());
    this.time = util.formatMillis(timeLeft);
  }

  _heartbeat() {
    this._updateTime();
    let resp = this._c.heartbeat();
    if (resp.roundEnd) {
      this.showRoundOver = true;
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
    this._moveTiles( this._c.typeCharacter(c).moves);
  }

  select(selectEvent) {
    if (selectEvent.model.item == -1) {
      return;
    }
    this._moveTiles( this._c.selectTile(selectEvent.model.item.idx).moves);
  }

  _moveTiles(moves) {
    moves.forEach(m => this._moveTile(m.tileIdx, m.position));
  }

  _moveTile(tileIdx, pos) {
    this.set(['tiles', tileIdx, 'position'], pos);
    this._resetButtons();
  }

  _resetButtons() {
    let suggestions = this.tiles.map(() => ({letter: '', idx: -1}));
    let available = this.tiles.map(() => ({letter: '', idx: -1}));
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
