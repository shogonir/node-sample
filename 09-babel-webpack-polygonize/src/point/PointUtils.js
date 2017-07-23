// @flow

import * as point from './';

export default class PointUtils {

  static fromNumberArrayPoints(points: Array<Array<number>>): ?Array<point.Point> {
    return points
      .filter((point: Array<number>) => point.length === 2)
      .map((p: Array<number>) => new point.Point(p[0], p[1]));
  }
}