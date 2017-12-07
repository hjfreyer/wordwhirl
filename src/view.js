import { Element as PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';
import { Controller } from './game.js';
import { WORDS } from './words.js';
import * as _ from '../node_modules/lodash-es/lodash.js'
import '../node_modules/@polymer/polymer/lib/elements/dom-repeat.js';

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
<div class="card">
  <div id="suggestions">
    <template is="dom-repeat" items="[[suggestions]]">
      <button on-click="select">[[_getTile(item)]]</button>
    </template>
  </div>
  <div id="working-set">
    <template is="dom-repeat" items="[[available]]">
      <button on-click="select">[[_getTile(item)]]</button>
    </template>
  </div>
</div>
<div class="card">
  <button on-click="backspace">Back</button>
  <button on-click="_submit">Submit</button>
  <button on-click="_shuffle">Shuffle</button>
  <span hidden$="[[!_wrong]]">Wrong</span>
</div>

<div class="card">
  {{score}}
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

    this.score = 0;
    this.time = "3:00";

    document.addEventListener('keydown', (e) => {
      let charCode = e.keyCode;
      const [a, z, A, Z] = ['a', 'z', 'A', 'Z'].map((s) => s.charCodeAt(0));
      if (a <= charCode && charCode <= z) {
        this.doActions(this._c.typeCharacter(String.fromCharCode(charCode)));
        return;
      }

      if (A <= charCode && charCode <= Z) {
        this.doActions(this._c.typeCharacter(String.fromCharCode(charCode - A + a)));
      }

      if (e.code == 'Backspace') {
        this.backspace();
      }

      if (e.code == 'Enter') {
        this.doActions(this._c.submit());
      }

      if (e.code == 'Space') {
        this.doActions(this._c.shuffle());
      }
      e.preventDefault();
      return false;
    });
  }

  ready() {
    super.ready();
    this.doActions(this._c.start());
  }

  select(selectEvent) {
    if (selectEvent.model.item == -1) {
      return;
    }
    this.doActions(this._c.selectTile(selectEvent.model.item));
  }

  backspace() {
    this.doActions(this._c.backspace());
  }

  doActions(actions) {
    console.log(actions);
    for (let a of actions) {
      if (a.move) {
        this._moveTile(a.move.tileIdx, {
          slot: a.move.slotIdx,
          isSuggestion: a.move.isSuggestion
        });
      } else if (a.reveal) {
        this.reveal(a.reveal.answerIdx);
      } else if (a.setScore) {
        //this._roundView.setScore(a.setScore.score);
      } else if (a.reject) {
        this.reject();
      } else if (a.initGame) {
        this.initGame();
      } else if (a.initRound) {
        this.initRound(a.initRound.tiles, a.initRound.answers, a.initRound.endTime);
      }
    }
  }

  _moveTile(tileIdx, pos) {
    this.set(['tiles', tileIdx, 'position'], pos);
    this._resetButtons();
  }

  _resetButtons() {
    let suggestions = this.tiles.map(() => -1);
    let available = this.tiles.map(() => -1);
    this.tiles.map((t, idx) => {
      (t.position.isSuggestion ? suggestions : available)[t.position.slot] = idx;
    });

    this.suggestions = suggestions;
    this.available = available;
  }

  initGame() {
    //   this._gameView = new GameView();
    //    this.$['game-area'].appendChild(this._gameView);
  }

  _getTile(idx) {
    if (idx == -1) {
      return '';
    }
    return this.tiles[idx].letter;
  }

  initRound(tiles, answers, endTime) {
    this.tiles = tiles.map((t, idx) => ({
      letter: t,
      idx: idx,
      position: {
        slot: idx,
        isSuggestion: false
      },
    }));
    this._resetButtons();
    this.answers = answers.map(a => ({
      word: a,
      hidden: true,
      spaces: _.times(a.length, () => '_ ').join('')
    }));
    this.time = endTime;
    this.wrong = false;
  //    this._gameView.setEndTime(endTime);
  //    this._gameView.createRound(tiles, answers);
  }


  reject() {
    this._wrong = true;
    window.setTimeout(() => this._wrong = false, 1000);
  }

  reveal(answerIdx) {
    this.set(['answers', answerIdx, 'hidden'], false);
  }

  _submit() {
    this.doActions(this._c.submit());
  }

  _shuffle() {
    this.doActions(this._c.shuffle());
  }
}

customElements.define('ww-app', App);
