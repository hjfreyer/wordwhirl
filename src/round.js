// Element is the same as Polymer.Element in 2.x
// Modules give you the freedom to rename the members that you import
import {Element as PolymerElement}
    from '../node_modules/@polymer/polymer/polymer-element.js';
import '../node_modules/@polymer/polymer/lib/elements/dom-repeat.js';

function makeDiv(className) {
  let res = document.createElement('div');
  res.className = className;
  return res;
}

// Added "export" to export the MyApp symbol from the module
export class RoundView extends PolymerElement {

  // Define a string template instead of a `<template>` element.
  static get template() {
    return `<div>The elemet of suproize: [[name]]</div>

    <style>
#suggestions {
  display: flex;
  height: 30px;
}

#working-set {
  display: flex;
  height: 30px;
}
    </style>
    <div class="card">
      <div id="suggestions"></div>
      <div id="working-set"></div>
    </div>
    <div id="answers">
      <template is="dom-repeat" items="[[answers]]">
        <div hidden$="{{item.hidden}}" class="answer">{{item.word}}</div>
      </template>
    </div>
    `
  }

  constructor(tiles, answers) {
    super();
    this.tiles = tiles;
    this.answers = answers.map(a => ({
      word: a,
      hidden: false,
    }));
  }

ready() {
  super.ready();
  this._tiles = this.tiles.map((t, idx) => {
    let tile = document.createElement('button');
    tile.className = 'tile';
    tile.innerHTML = t;  // TODO: security

    tile.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('select', {detail: {
        tileIdx: idx,
      }}));
    });
    return tile;
  });

  this._suggestionSlots = this._tiles.map((t) => {
    let suggestionSlot = makeDiv('suggestion-slot');
    suggestionSlot.appendChild(t);
    this.$['suggestions'].appendChild(suggestionSlot);
    return suggestionSlot;
  });

  this._workingSetSlots = this._tiles.map((t) => {
    let workingSetSlot = makeDiv('working-set-slot');
    workingSetSlot.appendChild(t);
    this.$['working-set'].appendChild(workingSetSlot);
    return workingSetSlot;
  });
}

  // properties, observers, etc. are identical to 2.x
  static get properties() {
    name: {
      Type: String
    }
  }

  move(tileIdx, slotIdx, isSuggestion) {
    let tile = this._tiles[tileIdx];

    if (tile.parent) {
      tile.parent.removeChild(tile);
    }
    let slot = (isSuggestion ? this._suggestionSlots : this._workingSetSlots)[slotIdx];
    slot.appendChild(tile);
  }
}

customElements.define('round-view', RoundView);
