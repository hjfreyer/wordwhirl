// Helpers for laying out elements.

import * as _ from '../node_modules/lodash-es/lodash.js'

function getScalingFactorToFit(insideAspect, containerAspect) {
  if (insideAspect < containerAspect) {
    return 1;
  } else {
    return containerAspect / insideAspect;
  }
}

function getLayout(answers, numCols, rowGutterFraction, columnGutterFraction, containerWidthPx, containerHeightPx) {
  let numRows = Math.ceil(answers.length / numCols);
  let columns = _.chunk(answers, numRows);
  let columnWidths = columns.map(c => _.last(c).length);

  let width = _.sum(columnWidths) + columns.length * columnGutterFraction;
  let height = numRows * (1 + rowGutterFraction);

  // We'll scale so that the height of the box is containerHeightPx.
  let scalingFactor = containerHeightPx / height;

  // Now to make it fit inside the container.
  scalingFactor *= getScalingFactorToFit(width / height, containerWidthPx / containerHeightPx);
  return {
    numRows: numRows,
    columnWidths: columnWidths,
    tileSizePx: 1 * scalingFactor,
    width: scalingFactor * width,
    height: scalingFactor * height,
    rowGutterSize: scalingFactor * rowGutterFraction,
    columnGutterSize: scalingFactor * columnGutterFraction,
  };
}

export function getOptimalLayout(answers, rowGutterFraction, columnGutterFraction, containerWidthPx, containerHeightPx) {
  let layouts = _.range(1, 1 + answers.length).map(numCols => getLayout(answers, numCols, rowGutterFraction, columnGutterFraction, containerWidthPx, containerHeightPx));
  return _.maxBy(layouts, 'tileSizePx');
}

export class LayoutHelper {
  constructor(layoutSpec) {
    this._l = layoutSpec;
  }

  getWordCoordinates(wordIdx) {
    let rowIdx = wordIdx % this._l.numRows;
    let columnIdx = Math.floor(wordIdx / this._l.numRows);

    let widthOfPrevCols = _.sum(this._l.columnWidths.slice(0, columnIdx));
    return {
      x: widthOfPrevCols * this._l.tileSizePx + (0.5 + columnIdx) * this._l.columnGutterSize,
      y: rowIdx * (this._l.tileSizePx + this._l.rowGutterSize) + (0.5 * this._l.rowGutterSize),
    };
  }

  getLetterCoordinates(wordIdx, letterIdx) {
    let word = this.getWordCoordinates(wordIdx);
    return {
      x: word.x + this._l.tileSizePx * letterIdx,
      y: word.y,
    };
  }
}
