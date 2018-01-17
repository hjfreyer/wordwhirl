import { Controller } from './game';
import * as t from './types';
import * as _ from 'lodash'
import * as util from './util'
import * as layout from './layout'
import "../node_modules/@polymer/polymer/lib/elements/dom-repeat.js";

// Element is the same as Polymer.Element in 2.x
// Modules give you the freedom to rename the members that you import
import {Element as PolymerElement}
    from '../node_modules/@polymer/polymer/polymer-element.js';

// Added "export" to export the MyApp symbol from the module
export class MyApp extends PolymerElement {
  name: String

  // Define a string template instead of a `<template>` element.
  static get template() {
    return `
    <style>
    :host {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;

        display: flex;

        flex-flow: column nowrap;
        align-items: center;

        font-family: Roboto;
      }
      * {

        box-sizing:border-box;
      }
      card {
        font-size: 40px;
      }

      button {
        font-size: 40px;
      }
      #suggestions {
        display: flex;
        height: 70px;
      }

      #working-set {
        display: flex;
        height: 70px;
      }

      .tile {
        width: 70px;
        height: 70px;
        text-transform: uppercase;
      }

      .slot {
        border: 1px solid black;
        width: 70px;
        height: 70px;
      }

      .box {
        position: absolute;
        border: 1px solid grey;
        text-transform: uppercase;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #answers {
        position: relative;

        font-size: 20px;

        border: 1px solid grey;

        align-self: stretch;
        flex: 1;
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
          <button class="tile" on-click="select">[[item.letter]]</button>
        </template>
      </div>
      <div id="working-set">
        <template is="dom-repeat" items="[[available]]">
          <button class="tile" on-click="select">[[item.letter]]</button>
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
      <template is="dom-repeat" items="[[answers]]" as="answer" index-as="answerIdx">
        <template is="dom-repeat" items="[[lettersOf(answer.word)]]" as="letter" index-as="letterIdx">
          <div class="box" style$="[[styleOf(answerIdx, letterIdx)]]"><span hidden$="[[answer.hidden]]">[[letter]]</span></div>
        </template>
      </template>
    </div>`
  }

  _c : Controller
  wrong: boolean
  showRoundOver: boolean
  showGameOver: boolean
  score: number
  tiles: any[]
  answers: any[]
  _endTime: number
  _layout: any
  $: any

    set: any
  time: string
  suggestions:any[]
  available: any[]
  constructor(words : t.WordList) {
    super();
    this._c = new Controller(words);
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

    let answers = this.answers.map(a => a.word);

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
customElements.define('ww-app', MyApp);
