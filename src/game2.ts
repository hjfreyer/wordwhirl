
import iassign from 'immutable-assign';
import * as _ from 'lodash'

import * as t from './types';
import { StatusOr, Ok, Error } from './util';
import * as rs from 'random-seed';

// Input actions.

export type Action = {kind: UiButton} | TileClickAction | SetTimeAction

export enum UiButton {
  BACKSPACE,
  SHUFFLE,
  SUBMIT,
  NEW_ROUND,
  NEW_GAME,
}

export interface TileClickAction {
    kind: "tile_click"
    position: t.Position
}

export interface SetTimeAction {
    kind: "set_time"
    timeMillis: number
}

// Outputs.

export type OutputAction = DoOutput;

export interface DoOutput {
  score: number
  timeLeft: number
  state: State
  answers: Answer[]
  lettersAndPositions: { letter: string, position: t.Position }[]
  suggestions: number[]
}

// State.

export interface GameParams {
    wordList: t.WordList
    roundLengthMillis: number
}

interface Game {
    _params: GameParams
    _score: number,
    _time: number,
    _round: Round,
};

interface Round {
    startTime: number
    gameIdx: number

    tiles: t.Position[]
    answers: InternalAnswer[]
}

interface InternalAnswer {
    answer: string
    revealed: boolean
}

export interface Answer {
    answer: string
    state: AnswerState
}

export enum AnswerState {
    Hidden,
    Solved,
    Revealed,
}

export type Result = [Game, OutputAction[]];

export function newGame(params: GameParams, time: number): Result {
  const g = {
      _params: Object.assign({}, params),
      _score: 0,
      _time: time,
      _round: mkRound(params.wordList, time),
  };
    return [, [

    ]];
}

function makeOutput(g: Game): DoOutput {
  return {
    score: g._score,
    timeLeft: number
    state: State
    answers: Answer[]
    lettersAndPositions: { letter: string, position: t.Position }[]
    suggestions: number[]
  }
}
/*
export function getGameListLen(g: Game): number {
	return g.params.wordList.containment.length;
}
*/
export function setTime(g: Game, time: number): Result {
    return iassign(g, g => g._time, () => time);
}

function mkRound(wordList: t.WordList, time: number): Round {
    let gameIdx = Math.floor(Math.random() * wordList.containment.length);

    let c = wordList.containment[gameIdx];

    let tiles: t.Position[] = _.shuffle(
        _.range(6).map(idx => ({ slot: idx, isSuggestion: false })));

    let answers = c.subwords.map(s => ({
        answer: wordList.words[s],
        revealed: false,
    }));

    answers = _.sortBy(answers, ['answer.length', 'answer']);

    return {
        startTime: time,
        gameIdx: gameIdx,

        tiles: tiles,
        answers: answers,
    };
}

export function newRound(g: Game): StatusOr<Game> {
    if (getState(g) != State.BETWEEN_ROUNDS) {
        return Error("round isn't over");
    }
    return Ok(iassign(g, g => g._round, r => mkRound(g.params.wordList, g._time)));
}

export function getTimeLeft(g: Game): number {
    if (getState(g) != State.IN_ROUND) {
        return 0;
    }
    let elapsed = g._time - g._round.startTime;
    return g.params.roundLengthMillis - elapsed;
}

export enum State {
    IN_ROUND,
    BETWEEN_ROUNDS,
    GAME_OVER,
}

export function getState(g: Game): State {
    if (g._time < g._round.startTime + g.params.roundLengthMillis) {
        return State.IN_ROUND;
    }
    if (_.some(g._round.answers, a => a.answer.length == 6 && a.revealed)) {
        return State.BETWEEN_ROUNDS;
    }
    return State.GAME_OVER;
}

export function getAnswers(g: Game): Answer[] {
    let gs = getState(g);
    return g._round.answers.map(a => ({
        answer: a.answer,
        state: a.revealed ? AnswerState.Solved : (gs == State.IN_ROUND ?
            AnswerState.Hidden : AnswerState.Revealed),
    }));
}

export function selectTile(g: Game, index: number): Game {
    if (getState(g) != State.IN_ROUND) {
        return g;
    }
    let tile = g._round.tiles[index];
    if (tile.isSuggestion) {
        return g;
    }
    let s = getSuggestions(g);
    return iassign(g,
        g => g._round.tiles[index],
        () => ({ isSuggestion: true, slot: s.length }));
}

export function backspace(g: Game): Game {
    if (getState(g) != State.IN_ROUND) {
        return g;
    }

    let s = getSuggestions(g);
    if (s.length == 0) {
        return g;
    }
    let lastTileIdx = _.last(s)!;

    let dest = nthEmpty(g, g._round.tiles[lastTileIdx].slot);

    return iassign(g,
        g => g._round.tiles[lastTileIdx],
        () => ({ isSuggestion: false, slot: dest }))
}

export function submit(g: Game): Game {
    if (getState(g) != State.IN_ROUND) {
        return g;
    }
    let word = getSuggestions(g).map(idx => getLetter(g, idx)).join('');

    let answerIdx = _.findIndex(g._round.answers, a => word == a.answer);
    if (answerIdx == -1) {
        return g;
    }

    if (!g._round.answers[answerIdx].revealed) {
        g = iassign(g,
            g => g.score,
            score => score + word.length * word.length);

        g = iassign(g,
            g => g._round.answers[answerIdx].revealed,
            () => true);
    }
    while (_.some(g._round.tiles, 'isSuggestion')) {
        g = backspace(g);
    }
    return g;
}

export function shuffle(g: Game): Game {
    if (getState(g) != State.IN_ROUND) {
        return g;
    }
    let perm = _.shuffle(_.range(6));

    let newTiles = perm.map((j, i) => {
        if (g._round.tiles[i].isSuggestion) {
            return g._round.tiles[i];
        } else {
            return iassign(g._round.tiles[i], t => t.slot, () => j);
        }
    });
    return iassign(g,
        g => g._round.tiles,
        () => newTiles);
}

export function getLettersAndPositions(g: Game): { letter: string, position: t.Position }[] {
    let contain = g.params.wordList.containment[g._round.gameIdx];
    let letters = g.params.wordList.words[contain.fullWord].split('');

    if (letters.length != g._round.tiles.length) {
        throw 'wtf';
    }

    return _.range(letters.length)
        .map(i => ({ letter: letters[i], position: g._round.tiles[i] }))
}

export function getTileAtPosition(g: Game, p: t.Position): number {
    return _.findIndex(g._round.tiles, t => _.isEqual(t, p));
}

function getLetter(g: Game, index: number): string {
    let contain = g.params.wordList.containment[g._round.gameIdx];
    return g.params.wordList.words[contain.fullWord][index];
}

function getSuggestions(g: Game): number[] {
    let res: number[] = [];

    for (let i = 0; i < g._round.tiles.length; i++) {
        if (g._round.tiles[i].isSuggestion) {
            res[g._round.tiles[i].slot] = i;
        }
    }

    return res;
}

function getAvailable(g: Game): number[] {
    let res: number[] = new Array(6).fill(-1);

    for (let i = 0; i < g._round.tiles.length; i++) {
        if (!g._round.tiles[i].isSuggestion) {
            res[g._round.tiles[i].slot] = i;
        }
    }

    return res;
}

function nthEmpty(g: Game, n: number): number {
    let a = getAvailable(g);
    let res = -1;
    for (let i = 0; i < n + 1; i++) {
        res = _.findIndex(a, (s: number) => s == -1, res + 1);
    }
    return res;
}
