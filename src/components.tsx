import * as React from "react";
import * as ReactDOM from "react-dom";


import * as util from "./util"
import * as t from "./types"

export type ViewState = InRoundState;

type Handler = (any) => void

export interface InRoundState {
    kind: "in_round"
    score: number
    timeLeft: number

    suggesting: string[]
    available: string[]
    wrong: boolean

    answers: Answer[]
}

export interface Answer {
    word: string
    hidden: boolean
}

export type UiButtonName = "backspace" | "shuffle" | "submit";

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

export type ViewAction = UiClickAction | TileClickAction | SetTimeAction
type InertElement<Props> = (props: Props) => JSX.Element;

type Element<Props, ActionType> =
    (props: Props & { fire: (action: ActionType) => void }) => JSX.Element;

export const Root: Element<{ state: ViewState }, any> = ({ state, fire }) => {
    switch (state.kind) {
        case "in_round": return InRound({ state, fire })
    }
};

function ActionButton(props): JSX.Element {
    let p2 = Object.assign({}, props, {
        children: null,
        action: null,
        fire: null,
    })
    let children = props.children;
    let action = props.action;
    let fire = props.fire;
    return <button onClick={() => fire(action)} {...p2}>{children}</button>;
}


const InRound: Element<{ state: InRoundState }, ViewAction> = ({ state, fire }) => {
    const uiFire = (elementName : UiButtonName) => fire({
        kind: 'ui_click',
        button: elementName
    });
    const tileFire = (isSuggestion : boolean, slot : number) => fire({
        kind: 'tile_click',
        position: { isSuggestion, slot },
    })
    return (
        <div>
            <ScoreBoard score={state.score} timeLeft={state.timeLeft} />
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
                <button onClick={()=>uiFire("backspace")}>Back</button>
                <button onClick={()=>uiFire("submit")}>Submit</button>
                <button onClick={()=>uiFire("shuffle")}>Shuffle</button>
                <span hidden={!state.wrong}>Wrong</span>
            </div>
            <div id="answers">
                {state.answers.map((answer, answerIdx) =>
                    (<div key={answerIdx}>
                        {answer.hidden ? answer.word.length : answer.word}
                    </div>))}
            </div>
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
    return (<div className="card" id="scoreboard">
        <label>Score: </label><span>{score}</span>
        <label>Time left: </label><span>{util.formatMillis(timeLeft)}</span>
    </div>);
};
