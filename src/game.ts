
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
    displayTime: number,
    score: number,

    round: Round,
}

export interface Round {
    startTime: number
    gameIdx: number

    tiles: t.Position[]
    answers: Answer[]
}

export interface Answer {
    answer: string
    revealed: boolean
}

export function newGame(params: GameParams, time: number): Game {
    return {
        params: Object.assign({}, params),
        time: time,
        displayTime: time,
        score: 0,

        round: mkRound(params.wordList, time),
    };
}

export function setTime(g: Game, time: number): Game {
    g = iassign(g, g => g.time, () => time);

    if (getState(g) != State.IN_ROUND) {
        g = iassign(g,
            g => g.round.answers,
            answers => answers.map(a => iassign(a, a => a.revealed, () => true)));
    }
    return g;
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
    return Ok(iassign(g, g => g.round, r => mkRound(g.params.wordList, g.time)));
}

export function getTimeLeft(g: Game): number {
    if (getState(g) != State.IN_ROUND) {
        return 0;
    }
    let elapsed = g.time - g.round.startTime;
    return g.params.roundLengthMillis - elapsed;
}

export enum State {
    IN_ROUND,
    BETWEEN_ROUNDS,
    GAME_OVER,
}

export function getState(g: Game): State {
    if (g.time < g.round.startTime + g.params.roundLengthMillis) {
        return State.IN_ROUND;
    }
    if (_.some(g.round.answers, a => a.answer.length == 6 && a.revealed)) {
        return State.BETWEEN_ROUNDS;
    }
    return State.GAME_OVER;
}

export function selectTile(g: Game, index: number): Game {
    if (getState(g) != State.IN_ROUND) {
        return g;
    }
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
    if (getState(g) != State.IN_ROUND) {
        return g;
    }

    let s = getSuggestions(g);
    if (s.length == 0) {
        return g;
    }
    let lastTileIdx = _.last(s)!;

    let dest = nthEmpty(g, g.round.tiles[lastTileIdx].slot);

    return iassign(g,
        g => g.round.tiles[lastTileIdx],
        () => ({ isSuggestion: false, slot: dest }))
}

export function submit(g: Game): Game {
    if (getState(g) != State.IN_ROUND) {
        return g;
    }
    let word = getSuggestions(g).map(idx => getLetter(g, idx)).join('');

    let answerIdx = _.findIndex(g.round.answers, a => word == a.answer);
    if (answerIdx == -1) {
        return g;
    }

    if (!g.round.answers[answerIdx].revealed) {
        g = iassign(g,
            g => g.score,
            score => score + word.length * word.length);

        g = iassign(g,
            g => g.round.answers[answerIdx].revealed,
            () => true);
    }
    while (_.some(g.round.tiles, 'isSuggestion')) {
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
        if (g.round.tiles[i].isSuggestion) {
            return g.round.tiles[i];
        } else {
            return iassign(g.round.tiles[i], t => t.slot, () => j);
        }
    });
    return iassign(g,
        g => g.round.tiles,
        () => newTiles);
}

export function getLettersAndPositions(g: Game): { letter: string, position: t.Position }[] {
    let contain = g.params.wordList.containment[g.round.gameIdx];
    let letters = g.params.wordList.words[contain.fullWord].split('');

    if (letters.length != g.round.tiles.length) {
        throw 'wtf';
    }

    return _.range(letters.length)
        .map(i => ({ letter: letters[i], position: g.round.tiles[i] }))
}

function getLetter(g: Game, index: number): string {
    let contain = g.params.wordList.containment[g.round.gameIdx];
    return g.params.wordList.words[contain.fullWord][index];
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
