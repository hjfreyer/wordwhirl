import * as React from "react";
import * as ReactDOM from "react-dom";


import * as util from "./util"
import * as t from "./types"

export function Root(state : t.ViewState, fire) : JSX.Element {
  switch (state.kind) {
    case "in_round": return InRound(state, fire)
  }
}


function ActionButton(props) : JSX.Element {
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

function InRound(state : t.InRoundState, fire) : JSX.Element {
  const uiFire = (elementName) => fire({
    kind: 'ui_click',
    name: elementName
  });
  return (
    <div>
      <ScoreBoard score={state.score} timeLeft={state.timeLeft}/>
      <div id="suggestions">
        {state.suggesting.map((letter, idx) =>
          <ActionButton className="tile" key={idx}
            fire={fire} action={{kind: "suggestion_click", index: idx}}>{letter}</ActionButton>)}
      </div>
      <div id="available">
        {state.available.map((letter, idx) =>
          <ActionButton className="tile" key={idx}
            fire={fire} action={{kind: "available_click", index: idx}}>{letter}</ActionButton>)}
      </div>
      <div className="card">
        <ActionButton action="backspace" fire={uiFire}>Back</ActionButton>
        <ActionButton action="submit" fire={uiFire}>Submit</ActionButton>
        <ActionButton action="shuffle" fire={uiFire}>Shuffle</ActionButton>
        <span hidden={!state.wrong}>Wrong</span>
      </div>
      <div id="answers">
      { state.answers.map((answer, answerIdx) =>
          (<div key={answerIdx}>
            {answer.hidden ? answer.word.length : answer.word}
          </div>)) }
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
}

function ScoreBoard({score, timeLeft} : {score: number, timeLeft: number}) : JSX.Element {
  return (<div className="card" id="scoreboard">
      <label>Score: </label><span>{score}</span>
      <label>Time left: </label><span>{util.formatMillis(timeLeft)}</span>
    </div>);
}
