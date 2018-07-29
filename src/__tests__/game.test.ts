import * as g from '../game';

import { expect } from 'chai';
//import 'mocha';
import data from './data';

import * as t from '../types';

describe('Hello function', () => {

  it('should return hello world', () => {
    const params : g.GameParams = {
      wordList: (data as t.WordList),
      roundLengthMillis: 10 * 1000,
    };
    const result: g.Game = g.newGame(params, 3);
    expect(result).to.equal('Hello worl!');
  });

});
