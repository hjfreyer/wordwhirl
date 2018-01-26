import * as React from "react";
import * as ReactDOM from "react-dom";

import * as c from "./components"
import * as t from "./types"
import * as game from './game2';
import * as Rx from 'rxjs'
import * as _ from 'lodash';
import { StatusOr, Ok, Error, GetOrThrow } from './util';
import '../assets/style.css';


const ROUND_LENGTH_SEC = 120;

function evolve(g: game.Game, n: c.ViewAction): game.Game {
    switch (n.kind) {
        case "ui_click": {
            return (() => {
                switch (n.button) {
                    case "backspace":
                        return game.backspace(g)
                    case "submit":
                        return game.submit(g);
                    case "shuffle":
                        return game.shuffle(g);
                    case "new_round":
                        return GetOrThrow(game.newRound(g));
                    case "new_game":
                        return game.newGame(g.params, g.time);
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

        case "keystroke":
            return evolveKeystroke(g, n);
    }
}

function evolveKeystroke(g: game.Game, n: c.KeystrokeAction): game.Game {
    let e = n.event;
    let charCode = e.keyCode;
    const [a, z, A, Z] = ['a', 'z', 'A', 'Z'].map((s) => s.charCodeAt(0));
    if (a <= charCode && charCode <= z) {
        return typeChar(g, String.fromCharCode(charCode));
    } else if (A <= charCode && charCode <= Z) {
        return typeChar(g, String.fromCharCode(charCode - A + a));
    } else if (e.code == 'Backspace') {
        e.preventDefault();
        return game.backspace(g)
    } else if (e.code == 'Enter') {
        e.preventDefault();
        return game.submit(g);
    } else if (e.code == 'Space') {
        e.preventDefault();
        return game.shuffle(g);
    } else {
        return g;
    }
}

function typeChar(g: game.Game, c: string): game.Game {
    let letters = game.getLettersAndPositions(g);
    let index = _.findIndex(letters, ({ letter, position }) => letter == c && !position.isSuggestion);
    if (index == -1) {
        return g;
    }
    return game.selectTile(g, index);
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
        timeLeft: game.getTimeLeft(g),

        showNewRound: game.getState(g) == game.State.BETWEEN_ROUNDS,
        showNewGame: game.getState(g) == game.State.GAME_OVER,

        suggesting: suggesting,
        available: available,
        wrong: false,

        answers: g.round.answers,
    };
}


export function main(wordList: t.WordList) {
    let initGame: game.Game =
        game.newGame({ wordList: wordList, roundLengthMillis: ROUND_LENGTH_SEC * 1000 }, Date.now());

    let actions: Rx.Subject<c.ViewAction> = new Rx.Subject();

    let ticker: Rx.Observable<c.SetTimeAction> = Rx.Observable.interval(1000)
        .map(() => ({ kind: "set_time", timeMillis: Date.now() } as c.SetTimeAction));

    let keystrokes: Rx.Observable<KeyboardEvent> = Rx.Observable.fromEvent(document, 'keydown');
    keystrokes
        .map(e => ({ kind: "keystroke", event: e } as c.KeystrokeAction))
        .subscribe(actions);

    let g = actions.do(console.log).merge(ticker).scan(evolve, initGame).startWith(initGame).do(console.log);


    let viewState: Rx.Observable<c.ViewState> = g.map(buildView);

    let view = viewState.map(s => c.Root({ state: s, fire: a => actions.next(a) }));

    view.subscribe(v => ReactDOM.render(v, document.getElementById("root")));
}
