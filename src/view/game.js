import { Element as PolymerElement } from '../../node_modules/@polymer/polymer/polymer-element.js';
import { RoundView } from './round.js';
import { Controller } from '../game.js';
import { WORDS } from './words.js';


export class GameView extends PolymerElement {

  static get template() {
    return `
<style>
</style>
<div id="scoreboard">
  <label>Score: </label><span>[[score]]</span>
  <label>Time left: </label><span>[[time]]</span>
</div>
<div id="round-area"></div>
`
  }

  constructor() {
    super();
    this.score = 0;
    this.time = '3:00';


return;
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

    return;
    this.$.container.appendChild(this._roundView);
  }

  setEndTime(endTime) {
    this.time = endTime;
  }

  createRound(tiles, answers) {
    this.$['round-area'].appendChild(new RoundView(tiles, answers));
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

customElements.define('ww-game', GameView);
