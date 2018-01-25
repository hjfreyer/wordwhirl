
import iassign from 'immutable-assign';
import * as _ from 'lodash'

import * as t from './types';
import { StatusOr, Ok, Error } from './util';

export interface GameParams {
    wordList: t.WordList
    roundLengthMillis: number
}

export interface Game {
    params: GameParams
    time: number,
    score: number,

    round: Round,
    gameOver: boolean,
}

export interface Round {
    startTime: number
    roundOver: boolean
    gameIdx: number

    tiles: t.Position[]
    revealed: boolean[]
}

export function newGame(params: GameParams, time: number): StatusOr<Game> {
    return Ok({
        params: Object.assign({}, params),
        time: time,
        score: 0,

        round: mkRound(params.wordList, time),
        gameOver: false
    });
}

export function setTime(g: Game, time: number): Game {
    return iassign(g, g => g.time, () => time);
}

function mkRound(wordList: t.WordList, time: number): Round {
    let gameIdx = Math.floor(Math.random() * wordList.containment.length);

    let c = wordList.containment[gameIdx];

    let tiles: t.Position[] = _.shuffle(
        _.range(6).map(idx => ({ slot: idx, isSuggestion: false })));

    return {
        startTime: time,
        gameIdx: gameIdx,
        roundOver: false,

        tiles: tiles,
        revealed: c.subwords.map(() => false),
    };
}

export function newRound(g: Game): StatusOr<Game> {
    if (g.gameOver) {
        return Error("game is over");
    }
    if (!g.round.roundOver) {
        return Error("round isn't over");
    }
    return Ok(iassign(g, g => g.round, r => mkRound(g.params.wordList, g.time)));
}

export function getTimeLeft(g: Game): StatusOr<number> {
    if (g.round.roundOver) {
        return Error("round is over");
    }
    let elapsed = g.time - g.round.startTime;
    return Ok(g.params.roundLengthMillis - elapsed);
}

export function selectTile(g: Game, index: number): Game {
    console.log('select: ', index)
    let tile = g.round.tiles[index];
    if (tile.isSuggestion) {
        return g;
    }
    let s = getSuggestions(g);
    return iassign(g,
        g => g.round.tiles[index],
        () => ({ isSuggestion: true, slot: s.length }));
}

export function backspace(g: Game): Game {
    let s = getSuggestions(g);
    if (s.length == 0) {
        return g;
    }
    let lastTileIdx = _.last(s)!;

    let dest = nthEmpty(g, g.round.tiles[lastTileIdx].slot);

    return iassign(g,
    g=>g.round.tiles[lastTileIdx],
  ()=>({isSuggestion: false, slot: dest}))
}

export function getLettersAndPositions(g: Game): { letter: string, position: t.Position }[] {
  let contain = g.params.wordList.containment[g.round.gameIdx];
  let letters = g.params.wordList.words[contain.fullWord].split('');

  if (letters.length != g.round.tiles.length) {
    throw 'wtf';
  }

  return _.range(letters.length)
    .map(i => ({letter: letters[i], position: g.round.tiles[i]}))
}

function getSuggestions(g: Game): number[] {
    let res: number[] = [];

    for (let i = 0; i < g.round.tiles.length; i++) {
        if (g.round.tiles[i].isSuggestion) {
            res[g.round.tiles[i].slot] = i;
        }
    }

    return res;
}

function getAvailable(g: Game): number[] {
    let res: number[] = new Array(6).fill(-1);

    for (let i = 0; i < g.round.tiles.length; i++) {
        if (!g.round.tiles[i].isSuggestion) {
            res[g.round.tiles[i].slot] = i;
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
