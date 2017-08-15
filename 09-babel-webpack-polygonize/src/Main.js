// @flow

import * as point from './point';
import * as line from './line';
import * as polygon from './polygon';

export default class Main {

  static main() {
    const pointsJson = require('../data/points.json');
    let polygonizer: polygon.Polygonizer = new polygon.Polygonizer();
    console.time('total');
    pointsJson.points.forEach((points: Array<Array<number>>, index: number) => {
      if (index === 11) {
        return;
      }
      console.log(index);
      let pointList: Array<point.Point> = point.PointUtils.fromNumberArrayPoints(points);
      polygonizer.triangulate(pointList);
    });
    console.timeEnd('total');
  }

  static normalizePointList(points: Array<point.Point>): Array<point.Point> {
    if (points.length === 0) {
      return [];
    }

    let xmin: number = points[0].x;
    let xmax: number = points[0].x;
    let ymin: number = points[0].y;
    let ymax: number = points[0].y;
    points.forEach((point: point.Point) => {
      xmin = point.x < xmin ? point.x : xmin;
      xmax = point.x > xmax ? point.x : xmax;
      ymin = point.y < ymin ? point.y : ymin;
      ymax = point.y > ymax ? point.y : ymax;
    });
    return points.map((p: point.Point) => {
      let x: number = (p.x - xmin) / (xmax - xmin);
      let y: number = (p.y - ymin) / (ymax - ymin);
      return new point.Point(x, y);
    });
  }
}