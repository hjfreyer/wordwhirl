import * as React from "react";
import * as ReactDOM from "react-dom";

import * as c from "./components"
import * as t from "./types"

import '../assets/style.css';


export function main() {
  let state : t.ViewState = {
    kind: "in_round",
    score: 23,
    timeLeft: 33000,

    suggesting: ['a', 'n', 'q', '', '', ''],
    available: ['b', '', 'n', '', 't', ''],
    wrong: false,

    answers: [
      {word: "hey", hidden: true}
    ]
  };
  ReactDOM.render(
      c.Root(state, console.log),
      document.getElementById("root")
  );
}
