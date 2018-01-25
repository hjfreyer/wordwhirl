import * as React from "react";
import * as ReactDOM from "react-dom";

import * as c from "./components"
import * as t from "./types"
import * as game from './game2';
import * as Rx from 'rxjs'
import * as _ from 'lodash';
import { StatusOr, Ok, Error, GetOrThrow } from './util';
import '../assets/style.css';


function evolve(g: game.Game, n: c.ViewAction): game.Game {
    switch (n.kind) {
        case "ui_click": {
            return (() => {
                switch (n.button) {
                    case "backspace":
                        return game.backspace(g)
                    case "submit":
                        return g;
                    case "shuffle":
                        return g;
                }
            })();
        }

        case "tile_click":
            let index = _.findIndex(g.round.tiles, t => _.isEqual(t, n.position));
            if (index == -1) {
                return g;
            }
            return game.selectTile(g, index);

        case "set_time":
            return game.setTime(g, n.timeMillis);
    }
}

function buildView(g: game.Game): c.ViewState {
    let suggesting: string[] = new Array(6).fill('');
    let available: string[] = new Array(6).fill('');

    game.getLettersAndPositions(g).map(({ letter, position }) => {
        let arr = position.isSuggestion ? suggesting : available;
        arr[position.slot] = letter;
    });

    return {
        kind: "in_round",
        score: g.score,
        timeLeft: GetOrThrow(game.getTimeLeft(g)),

        suggesting: suggesting,
        available: available,
        wrong: false,

        answers: [
            { word: "hey", hidden: true }
        ]
    };
}


export function main(wordList: t.WordList) {
    let initGame: game.Game = GetOrThrow(
        game.newGame({ wordList: wordList, roundLengthMillis: 120000 }, Date.now()));

    let actions: Rx.Subject<c.ViewAction> = new Rx.Subject();

    let ticker: Rx.Observable<c.SetTimeAction> = Rx.Observable.interval(1000)
        .map(() => ({ kind: "set_time", timeMillis: Date.now() } as c.SetTimeAction));

    let g = actions.do(console.log).merge(ticker).scan(evolve, initGame).startWith(initGame).do(console.log);


    let viewState: Rx.Observable<c.ViewState> = g.map(buildView);

    let view = viewState.map(s => c.Root({ state: s, fire: a => actions.next(a) }));

    view.subscribe(v => ReactDOM.render(v, document.getElementById("root")));
}
