import * as React from "react";
import * as ReactDOM from "react-dom";


import * as util from "./util"
import * as t from "./types"
import * as game from './game';

export type ViewState = InRoundState;

type Handler = (a: any) => void

export interface InRoundState {
    kind: "in_round"
    score: number
    timeLeft: number

    suggesting: string[]
    available: string[]
    wrong: boolean

    showNewRound: boolean
    showNewGame: boolean

    answers: game.Answer[]
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

export type ViewAction = UiClickAction | TileClickAction | SetTimeAction | KeystrokeAction
type InertElement<Props> = (props: Props) => JSX.Element;

type Element<Props, ActionType> =
    (props: Props & { fire: (action: ActionType) => void }) => JSX.Element;

export const Root: Element<{ state: ViewState }, any> = ({ state, fire }) => {
    switch (state.kind) {
        case "in_round": return InRound({ state, fire })
    }
};


const InRound: Element<{ state: InRoundState }, ViewAction> = ({ state, fire }) => {
    const uiFire = (elementName: UiButtonName) => fire({
        kind: 'ui_click',
        button: elementName
    });
    const tileFire = (isSuggestion: boolean, slot: number) => fire({
        kind: 'tile_click',
        position: { isSuggestion, slot },
    })

    const newRoundButton = state.showNewRound ? (
        <button onClick={() => uiFire("new_round")} >New Round</button>
    ) : null;

    const newGameButton = state.showNewGame ? (
        <button onClick={() => uiFire("new_game")} >New Game</button>
    ) : null;

    return (
        <div id="container">
            <ScoreBoard score={state.score} timeLeft={state.timeLeft} />
            <main>
            {newRoundButton}
            {newGameButton}
            <div id="suggestions">
                {state.suggesting.map((letter, idx) =>
                    <button className="tile" key={idx}
                        onClick={() => tileFire(true, idx)}>{letter}</button>)}
            </div>
            <div id="available">
                {state.available.map((letter, idx) =>
                    <button className="tile" key={idx}
                        onClick={() => tileFire(false, idx)}>{letter}</button>)}
            </div>
            <div className="card">
                <button onClick={() => uiFire("backspace")}>Back</button>
                <button onClick={() => uiFire("submit")}>Submit</button>
                <button onClick={() => uiFire("shuffle")}>Shuffle</button>
                <span hidden={!state.wrong}>Wrong</span>
            </div>
            <div id="answers">
                {state.answers.map((answer, answerIdx) =>
                    (<div key={answerIdx}
                        className={answer.state == game.AnswerState.Revealed ? 'revealed' : ''}>
                        {answer.state == game.AnswerState.Hidden ? answer.answer.length : answer.answer}
                    </div>))}
            </div>
            </main>
        </div>);
    //<!--s-->

    /*  <div

      <div id="answers">
        <template is="dom-repeat" items="[[answers]]" as="answer" index-as="answerIdx">
          <template is="dom-repeat" items="[[lettersOf(answer.word)]]" as="letter" index-as="letterIdx">
            <div class="box" style$="[[styleOf(answerIdx, letterIdx)]]"><span hidden$="[[answer.hidden]]">[[letter]]</span></div>
          </template>
        </template>
      </div>*/
};

const ScoreBoard: InertElement<{ score: number, timeLeft: number }> = ({ score, timeLeft }) => {
  let timeLowClass = timeLeft < 10000 ? 'low' : '';
    return (<header id="scoreboard">
        <span className="score">{score}</span>
        <span className="logo">Word Whirl</span>
        <span className={"time " +timeLowClass}>{util.formatMillis(timeLeft)}</span>
    </header>);
};
