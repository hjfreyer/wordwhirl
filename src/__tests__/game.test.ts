import * as g from '../game';

import { expect } from 'chai';
import 'mocha';

describe('Hello function', () => {

  it('should return hello world', () => {
    const result: string = g.newGame();
    expect(result).to.equal('Hello worl!');
  });

});
