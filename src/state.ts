
import * as game from './game';
import * as t from './types';

export interface State {
	time: number
//	g: game.Game
}

export type UiButtonName = "backspace" | "shuffle" | "submit" | "new_round" | "new_game";

export interface UiClickAction {
    kind: "ui_click"
    button: UiButtonName
}

export interface TileClickAction {
    kind: "tile_click"
    position: t.Position
}

export interface SetTimeAction {
    kind: "set_time"
    timeMillis: number
}

export interface KeystrokeAction {
    kind: "keystroke"
    event: KeyboardEvent
}

export type Action = UiClickAction | TileClickAction | SetTimeAction | KeystrokeAction

export type ViewActions = BeginGame | BeginRound | SetStuff | IndicateWrong |
	Reveal | Repeat| RoundOver | GameOver;

export interface BeginGame {
	kind: "begin_game"
}

export interface BeginRound {
	kind: "begin_round"
	
	answers: string[]
}

export interface SetStuff {
	kind: "set_stuff"
	
	score: number
	timeLeft: number
	suggesting: string[]
    available: string[]
}

export interface IndicateWrong {
	kind: "wrong"
}

export interface Reveal {
	kind: "reveal"
	answerIdx: number
}

export interface Repeat {
	kind: "repeat"
	answerIdx: number	
}

export interface RoundOver {
	kind: "round_over"
}

export interface GameOver {
	kind: "game_over"
}

export interface View {
	time: number
/*    score: number
    timeLeft: number

    suggesting: string[]
    available: string[]
    wrong: boolean

    showNewRound: boolean
    showNewGame: boolean

    answers: game.Answer[]
    */
}

export interface DomInfo {}

/*export function getInitialState(): State {
	
}*/

export function applyAction(s: State, d: DomInfo, n: Action): State {
	return s;
/*    switch (n.kind) {
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
                        return game.newGame(g.params, g._time);
                }
            })();
        }

        case "tile_click":
            let index = game.getTileAtPosition(g, n.position);
            if (index == -1) {
                return g;
            }
            return game.selectTile(g, index);

        case "set_time":
            return game.setTime(g, n.timeMillis);

        case "keystroke":
            return evolveKeystroke(g, n);
    }
    */
}
/*
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
*/
export function getView(s: State): View {
	return {time:s.time};
/*	const g = s.g;
	
    let suggesting: string[] = new Array(6).fill('');
    let available: string[] = new Array(6).fill('');

    game.getLettersAndPositions(g).map(({ letter, position }) => {
        let arr = position.isSuggestion ? suggesting : available;
        arr[position.slot] = letter;
    });

    return {
        score: g.score,
        timeLeft: game.getTimeLeft(g),

        showNewRound: game.getState(g) == game.State.BETWEEN_ROUNDS,
        showNewGame: game.getState(g) == game.State.GAME_OVER,

        suggesting: suggesting,
        available: available,
        wrong: false,

        answers: game.getAnswers(g),
    };*/
}
