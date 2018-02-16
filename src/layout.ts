// Helpers for laying out elements.

//import * as _ from '../node_modules/lodash-es/lodash.js'
import * as _ from 'lodash';

interface Point {
	x: number
	y: number
}

function getScalingFactorToFit(insideAspect : number, containerAspect : number) : number {
  if (insideAspect < containerAspect) {
    return 1;
  } else {
    return containerAspect / insideAspect;
  }
}

function getLayout(answers : string[], numCols: number, 
	rowGutterFraction: number, columnGutterFraction: number, 
	containerWidthPx: number, containerHeightPx: number) {
  let numRows = Math.ceil(answers.length / numCols);
  let columns = _.chunk(answers, numRows);
  let columnWidths = columns.map(c => _.last(c)!.length);

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

export function getOptimalLayout(answers : string[],
  rowGutterFraction : number, columnGutterFraction : number,
  containerWidthPx : number, containerHeightPx : number) {
  let layouts = _.range(1, 1 + answers.length).map((numCols : number) => getLayout(answers, numCols, rowGutterFraction, columnGutterFraction, containerWidthPx, containerHeightPx));
  return _.maxBy(layouts, t => t.tileSizePx);
}

export class LayoutHelper {
  _l : any

  constructor(layoutSpec: any) {
    this._l = layoutSpec;
  }

  getWordCoordinates(wordIdx: number): Point {
    let rowIdx = wordIdx % this._l.numRows;
    let columnIdx = Math.floor(wordIdx / this._l.numRows);

    let widthOfPrevCols = _.sum(this._l.columnWidths.slice(0, columnIdx));
    return {
      x: widthOfPrevCols * this._l.tileSizePx + (0.5 + columnIdx) * this._l.columnGutterSize,
      y: rowIdx * (this._l.tileSizePx + this._l.rowGutterSize) + (0.5 * this._l.rowGutterSize),
    };
  }

  getLetterCoordinates(wordIdx: number, letterIdx: number): Point {
    let word = this.getWordCoordinates(wordIdx);
    return {
      x: word.x + this._l.tileSizePx * letterIdx,
      y: word.y,
    };
  }
}
