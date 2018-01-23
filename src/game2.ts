
import iassign from 'immutable-assign';
import * as _ from 'lodash'

import * as t from './types';

export interface GameParams {
    wordList: t.WordList
    roundLengthSec: number
}

export interface Game {
    params: GameParams
    time: number,

    rounds: Round[],
    gameOver: boolean,
}

export interface Round {
    startTime: number
    gameIdx: number

    tiles: t.Position[]
    revealed: boolean[]
}

export type Response = Game | string

export function newGame(params: GameParams, time: number): Response {
    return {
        params: Object.assign({}, params),
        time: time,
        rounds: [],
        gameOver: false
    };
}

export function setTime(g: Game, time: number): Response {
    return iassign(g, g => g.time, () => time);
}

export function newRound(g: Game): Response {
    if (g.gameOver) {
        return "game is over";
    }
    let gameIdx = Math.floor(Math.random() * g.params.wordList.containment.length);

    let c = g.params.wordList.containment[gameIdx];

    let tiles : t.Position[] = _.shuffle(
      _.range(6).map(idx => ({slot: idx, isSuggestion: false})));

    let newRound = {
        startTime: g.time,
        gameIdx: gameIdx,

        tiles: tiles,
        revealed: c.subwords.map(() => false),
    };
    return iassign(g, g => g.rounds, r => r.concat(newRound));
}
