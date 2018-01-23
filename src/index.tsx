import * as React from "react";
import * as ReactDOM from "react-dom";

import * as c from "./components"
import * as t from "./types"
import * as game from './game2';
import * as Rx from 'rxjs'

import '../assets/style.css';

function evolve(g: game.Game, n: number): game.Game {
    return g;
}

function buildView(g : game.Game): t.ViewState {
  return {
      kind: "in_round",
      score: 23,
      timeLeft: 33000,

      suggesting: ['a', 'n', 'q', '', '', ''],
      available: ['b', '', 'n', '', 't', ''],
      wrong: false,

      answers: [
          { word: "hey", hidden: true }
      ]
  };
}


export function main(wordList: t.WordList) {
    let initGame = game.newGame({ wordList: wordList, roundLengthSec: 180 }, Date.now());

    let actions = new Rx.Subject();

    let g = actions.scan(evolve, initGame);


    let viewState : Rx.Observable<t.ViewState> = g.map(buildView);

    let view = viewState.map(s => c.Root(s, console.log));

    view.subscribe(v => ReactDOM.render(v, document.getElementById("root")));
}
