import { Element as PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';
import { RoundView } from './round.js';
import { GameManager } from './game.js';
import { WORDS } from './words.js';

class App extends PolymerElement {

  static get template() {
    return `
<style>
  :host {
    display: block;
    min-height: 100%;
  }
</style>
<div id="welcome"></div>
<div id="container"></div>
`
  }

  constructor() {
    super();

    this._gm = new GameManager(WORDS);
    this._game = this._gm.newGame();

    this._roundView = new RoundView(this._game.tiles, this._game.answers);
    this._roundView.addEventListener('select', this.select.bind(this));
    this._roundView.addEventListener('backspace', this.backspace.bind(this));
    this._roundView.addEventListener('submit', () => {
      this.doActions(this._game.submit());
    });
    this._roundView.addEventListener('shuffle', () => {
      this.doActions(this._game.shuffle());
    });

    document.addEventListener('keydown', (e) => {
          console.log(e);
      let charCode = e.keyCode;
      const [a, z, A, Z] = ['a', 'z', 'A', 'Z'].map((s) => s.charCodeAt(0));
      if (a <= charCode && charCode <= z) {
        this.doActions(this._game.typeCharacter(String.fromCharCode(charCode)));
        return;
      }

      if (A <= charCode && charCode <= Z) {
        this.doActions(this._game.typeCharacter(String.fromCharCode(charCode - A + a)));
      }

      if (e.code == 'Backspace') {
        this.backspace();
      }

      if (e.code == 'Enter') {
        this.doActions(this._game.submit());
      }

      if (e.code == 'Space') {
        this.doActions(this._game.shuffle());
      }
      e.preventDefault();
      return false;
    });
  }

  ready() {
    super.ready();
    this.$.container.appendChild(this._roundView);
  }

  select(selectEvent) {
    this.doActions(this._game.selectTile(selectEvent.detail.tileIdx));
  }

  backspace() {
    this.doActions(this._game.backspace());
  }

  doActions(actions) {
    for (let a of actions) {
      if (a.move) {
        this._roundView.move(a.move.tileIdx, a.move.slotIdx, a.move.isSuggestion);
      } else if (a.reveal) {
        this._roundView.reveal(a.reveal.answerIdx);
      } else if (a.setScore) {
        this._roundView.setScore(a.setScore.score);
      } else if (a.reject) {
        this._roundView.reject();
      }
    }
  }
}

customElements.define('ww-app', App);
