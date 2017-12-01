import {Element as PolymerElement}
    from '../node_modules/@polymer/polymer/polymer-element.js';
import {RoundView} from './round.js';
import {GameManager} from './game.js';
import {WORDS} from './words.js';

class App extends PolymerElement {

  static get template() {
    return `<div id="container"></div>`
  }

  constructor() {
    super();

    this._gm = new GameManager(WORDS);
    this._game = this._gm.newGame();

    this._roundView = new RoundView(this._game.tiles, this._game.answers);
    // this._roundView.addEventListener('select', (e) => this.)
  }

  ready() {
    super.ready();
    this.$.container.appendChild(this._roundView);
  }
}

customElements.define('ww-app', App);
