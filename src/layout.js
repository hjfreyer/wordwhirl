// Helpers for laying out elements.

import * as _ from '../node_modules/lodash-es/lodash.js'

export function optimalNumberOfRows(answers, maxSizePx, rowGutterFraction, minColumnGutterFraction,
  containerWidthPx, containerHeightPx) {
  let maxRowSizeWithGutters = maxSizePx * (1 + rowGutterFraction);
  let numRowsAtMaxSize = Math.floor(containerHeightPx / maxRowSizeWithGutters);
  for (let numRows = Math.min(numRowsAtMaxSize, answers.length); numRows <= answers.length; numRows++) {
    let rowHeightWithGutters = containerHeightPx / numRows;
    let sizePx = Math.min(maxSizePx, Math.floor(rowHeightWithGutters / (1 + rowGutterFraction)));

    let columns = _.chunk(answers, numRows);
    let columnsWidths = columns.map(c => _.last(c).length)

    let columnGutterSize = 0;
    if (1 < columns.length) {
      columnGutterSize = Math.floor((containerWidthPx - _.sum(columnsWidths) * sizePx) / (columns.length - 1));
      let columnGutterFraction = columnGutterSize / sizePx;
      if (columnGutterFraction < minColumnGutterFraction) {
        continue;
      }
    }

    return {
      sizePx: sizePx,
      numRows: numRows,
      rowGutterSize: Math.floor(sizePx * rowGutterFraction),
      columnGutterSize: columnGutterSize,
      columnsWidths: columnsWidths,
    };
  }
  throw 'Cannot make it fit';
}

export class LayoutHelper {
  constructor(layoutSpec) {
    this._l = layoutSpec;
  }

  getWordCoordinates(wordIdx) {
    let rowIdx = wordIdx % this._l.numRows;
    let columnIdx = Math.floor(wordIdx / this._l.numRows);

    let widthOfPrevCols = _.sum(this._l.columnsWidths.slice(0, columnIdx));

    return {
      x: widthOfPrevCols * this._l.sizePx + columnIdx * this._l.columnGutterSize,
      y: rowIdx * (this._l.sizePx + this._l.rowGutterSize),
    };
  }

  getLetterCoordinates(wordIdx, letterIdx) {
    let word = this.getWordCoordinates(wordIdx);
    return {
      x: word.x + this._l.sizePx * letterIdx,
      y: word.y,
    };
  }
}
