// Helpers for laying out elements.

import * as _ from '../node_modules/lodash-es/lodash.js'

export function optimalNumberOfRows2(answers, maxSizePx, rowGutterFraction, minColumnGutterFraction,
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

function getAspectRatio(answers, numRows, rowGutterFraction, columnGutterFraction) {
  let columns = _.chunk(answers, numRows);
  let columnsWidths = columns.map(c => _.last(c).length);

  let width = _.sum(columnsWidths) + columns.length * columnGutterFraction;
  let height = numRows * (1 + rowGutterFraction);

  return width / height;
}

export function getOptimalLayout(answers, rowGutterFraction, columnGutterFraction, containerAspectRatio) {
  let numRowsOptions = _.range(1, 1 + answers.length);
  let getAr = numRows => {
    let ar = getAspectRatio(answers, numRows, rowGutterFraction, columnGutterFraction);
    if (ar < containerAspectRatio) {
      return containerAspectRatio - ar;
    } else {
      return (1 - containerAspectRatio / ar) * containerAspectRatio;
    }
  };
  let minLoss = _.minBy(numRowsOptions, getAr);

  return {
    numRows: minLoss,
    aspect: getAspectRatio(answers, minLoss, rowGutterFraction, columnGutterFraction),
  }
}

export function optimalNumberOfRows(answers, maxSizePx, rowGutterFraction, columnGutterFraction,
  containerWidthPx, containerHeightPx) {
  let containerAspect = containerWidthPx / containerHeightPx;
  let layout = getOptimalLayout(answers, rowGutterFraction, columnGutterFraction, containerAspect);
  let numRows = layout.numRows;

  let columns = _.chunk(answers, layout.numRows);
  let columnsWidths = columns.map(c => _.last(c).length);

  let sizePx = 0;
  if (layout.aspect < containerAspect) {
    // Limited by height.
    sizePx = containerHeightPx / (numRows + numRows * rowGutterFraction);
  } else {
    // Limited by width.
    sizePx = containerWidthPx / (_.sum(columnsWidths) + columns.length * columnGutterFraction);
  }
  sizePx = Math.min(maxSizePx, Math.floor(sizePx));
  return {
    sizePx: sizePx,
    numRows: numRows,
    rowGutterSize: Math.floor(sizePx * rowGutterFraction),
    columnGutterSize: Math.floor(sizePx * columnGutterFraction),
    columnsWidths: columnsWidths,
  };
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
