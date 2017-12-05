import { Element as PolymerElement } from '../../node_modules/@polymer/polymer/polymer-element.js';
import '../../node_modules/@polymer/polymer/lib/elements/dom-repeat.js';
import * as _ from '../../node_modules/lodash-es/lodash.js'

function makeDiv(className) {
  let res = document.createElement('div');
  res.className = className;
  return res;
}

export class RoundView extends PolymerElement {
  static get template() {
    return `
<style>
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

<div class="card">
  <div id="suggestions"></div>
  <div id="working-set"></div>
</div>
<div class="card">
  <button on-click="_backspace">Back</button>
  <button on-click="_submit">Submit</button>
  <button on-click="_shuffle">Shuffle</button>
  <span hidden="[[_not(_wrong)]]">Wrong</span>
</div>

<div class="card">
  {{score}}
</div>

<div id="answers">
  <template is="dom-repeat" items="[[answers]]">
    <div hidden$="{{item.hidden}}" class="answer">{{item.word}}</div>
    <div hidden$="{{_not(item.hidden)}}" class="hint">{{item.spaces}}</div>
  </template>
</div>
`
  }

  constructor(tiles, answers) {
    super();
    this.tiles = tiles;
    this.answers = answers.map(a => ({
      word: a,
      hidden: true,
      spaces: _.times(a.length, () => '_ ').join('')
    }));
    this._wrong = false;
  }

  ready() {
    super.ready();
    this._tiles = this.tiles.map((t, idx) => {
      let tile = document.createElement('button');
      tile.className = 'tile';
      tile.innerHTML = t; // TODO: security

      tile.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('select', {
          detail: {
            tileIdx: idx,
          }
        }));
      });
      return tile;
    });

    this._suggestionSlots = this._tiles.map((t) => {
      let suggestionSlot = makeDiv('slot');
      suggestionSlot.appendChild(t);
      this.$['suggestions'].appendChild(suggestionSlot);
      return suggestionSlot;
    });

    this._workingSetSlots = this._tiles.map((t) => {
      let workingSetSlot = makeDiv('slot');
      workingSetSlot.appendChild(t);
      this.$['working-set'].appendChild(workingSetSlot);
      return workingSetSlot;
    });
  }

  move(tileIdx, slotIdx, isSuggestion) {
    let tile = this._tiles[tileIdx];

    if (tile.parent) {
      tile.parent.removeChild(tile);
    }
    let slot = (isSuggestion ? this._suggestionSlots : this._workingSetSlots)[slotIdx];
    slot.appendChild(tile);
  }

  reject() {
    this._wrong = true;
    window.setTimeout(() => this._wrong = false, 1000);
  }

  reveal(answerIdx) {
    this.set(['answers', answerIdx, 'hidden'], false);
  }

  _backspace() {
    this.dispatchEvent(new CustomEvent('backspace'));
  }

  _submit() {
    this.dispatchEvent(new CustomEvent('submit'));
  }
  _shuffle() {
    this.dispatchEvent(new CustomEvent('shuffle'));
  }

  _not(b) {
    return !b;
  }

  setScore(score) {
    this.score = score;
  }
}

customElements.define('ww-round', RoundView);
