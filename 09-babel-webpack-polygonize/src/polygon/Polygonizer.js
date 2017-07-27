// @flow

import * as point from '../point';
import * as line from '../line';

export default class Polygonizer {

  constructor() {
    const pointsJson = require('../../data/points.json');
    let self: Polygonizer = this;
    pointsJson.points.forEach((points: Array<Array<number>>, index: number) => {
      if (index !== 5) {
        return;
      }
      let pointList: Array<point.Point> = point.PointUtils.fromNumberArrayPoints(points);
      let numInitialPoints: number = pointList.length;
      let normPoints: Array<point.Point> = self.normalizePointList(pointList);
      self.normalizedPointsToCanvas(normPoints);
      let initialLines: Array<Array<number>> = self.checkLineIntersection(normPoints);
      let lines: Array<Array<number>> = self.drawLines(normPoints, initialLines);
      let triangles: Array<Array<number>> = self.listUpTriangles(normPoints, initialLines, lines);
      self.draw(normPoints, numInitialPoints, initialLines, lines, triangles);
    });
  }

  listUpTriangles(normPoints: Array<point.Point>, initialLines: Array<Array<number>>, lines: Array<Array<number>>): Array<Array<number>> {
    let triangles: Array<Array<number>> = [];
    let ls: Array<Array<number>> = initialLines.concat(lines);
    ls.forEach((l1: Array<number>, i1: number) => {
      ls.forEach((l2: Array<number>, i2: number) => {
        ls.forEach((l3: Array<number>, i3: number) => {
          if (i1 <= i2 || i2 <= i3) {
            return;
          }
          if (l1.includes(l2[0])) {
            let edge: number = (l1.indexOf(l2[0]) === 0) ? 1 : 0;
            if (l3.includes(l1[edge]) && l3.includes(l2[1])) {
              triangles.push(l1.concat(l2[1]));
            }
          }
          else if (l1.includes(l2[1])) {
            let edge: number = (l1.indexOf(l2[1]) === 0) ? 1 : 0;
            if (l3.includes(l1[edge]) && l3.includes(l2[0])) {
              triangles.push(l1.concat(l2[0]));
            }
          }
        });
      });
    });
    return triangles;
  }

  calcSumAngle(normPoints: Array<point.Point>, initialLines: Array<Array<number>>): number {
    let sumAngle: number = 0;
    initialLines.forEach((lIndex: Array<number>, index: number) => {
      if (index === 0) {
        return;
      }
      let l: line.Line = new line.Line(normPoints[lIndex[0]], normPoints[lIndex[1]]);
      let i0: number = initialLines[index - 1][0];
      let i1: number = lIndex[0];
      let i2: number = lIndex[1];
      sumAngle += this.calcAngle(normPoints[i0], normPoints[i1], normPoints[i2]);
    });
    return sumAngle;
  }

  calcAngle(p1: point.Point, p2: point.Point, p3: point.Point): number {
    let v1: point.Point = p2.sub(p1);
    let v2: point.Point = p3.sub(p2);
    let angle: number = Math.acos(v1.inner(v2) / (v1.magnitude() * v2.magnitude())) * 180 / Math.PI;
    let coef: number = (v1.outer(v2) > 0) ? 1 : -1;
    return coef * (180 - angle);
  }

  draw(normPoints: Array<point.Point>, numInitialPoints: number, initialLines: Array<Array<number>>, lines: Array<Array<number>>, triangles: Array<Array<number>>) {
    let mayBeCanvas: ?HTMLCanvasElement = document.createElement('canvas');
    if (mayBeCanvas == null) {
      return;
    }
    let canvas: HTMLCanvasElement = mayBeCanvas;
    let side: number = 512;
    canvas.width = side;
    canvas.height = side;
    let mayBeContext: ?CanvasRenderingContext2D = canvas.getContext('2d');
    if (mayBeContext == null) {
      return;
    }
    let context: CanvasRenderingContext2D = mayBeContext;
    normPoints.forEach((p: point.Point, pIndex: number) => {
      context.fillStyle = (pIndex < numInitialPoints) ? "#000000" : "#FF0000";
      context.fillRect(p.x * side - 5, p.y * side - 5, 10, 10);
    });
    initialLines.forEach((lIndex: Array<number>, index: number) => {
      context.beginPath();
      let l: line.Line = new line.Line(normPoints[lIndex[0]], normPoints[lIndex[1]]);
      context.moveTo(l.p1.x * side, l.p1.y * side);
      context.lineTo(l.p2.x * side, l.p2.y * side);
      context.stroke();
    });
    lines.forEach((lIndex: Array<number>) => {
      context.beginPath();
      let l: line.Line = new line.Line(normPoints[lIndex[0]], normPoints[lIndex[1]]);
      context.moveTo(l.p1.x * side, l.p1.y * side);
      context.lineTo(l.p2.x * side, l.p2.y * side);
      context.strokeStyle = "#0000FF";
      context.stroke();
    });
    let self: Polygonizer = this;
    let right: boolean = this.calcSumAngle(normPoints, initialLines) < 0;
    initialLines.forEach((l: Array<number>, lIndex: number) => {
      triangles.forEach((t: Array<number>) => {
        if (t.includes(l[0]) && t.includes(l[1])) {
          let thirdIndex: number = t[3 - t.indexOf(l[0]) - t.indexOf(l[1])];
          let isRight: boolean = self.calcAngle(normPoints[l[0]], normPoints[l[1]], normPoints[thirdIndex]) < 0;
          if (isRight === right) {
            context.fillStyle = "#00FF00";
            context.beginPath();
            context.moveTo(normPoints[t[0]].x * side, normPoints[t[0]].y * side);
            context.lineTo(normPoints[t[1]].x * side, normPoints[t[1]].y * side);
            context.lineTo(normPoints[t[2]].x * side, normPoints[t[2]].y * side);
            context.fill();
          }
        }
      });
      if (l[1] >= numInitialPoints) {
        right = !right;
      }
    });
    if (document.body != null) {
      document.body.appendChild(canvas);
    }
  }

  removeConsecutiveSamePoints(points: Array<point.Point>): Array<point.Point> {
    if (points == null) {
      return [];
    }

    let pointList: Array<point.Point> = points;
    if (points.length <= 1) {
      return pointList;
    }

    let previous: point.Point;
    return pointList
      .filter((point: point.Point, pointIndex: number) => {
        if (pointIndex === 0) {
          previous = point;
          return true;
        }
        if (pointIndex === pointList.length - 1) {
          return !point.equals(pointList[0]);
        }
        let result: boolean = !point.equals(previous);
        previous = point;
        return result;
      });
  }

  normalizePointList(points: Array<point.Point>): Array<point.Point> {
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

  normalizedPointsToCanvas(points: Array<point.Point>) {
    let mayBeCanvas: ?HTMLCanvasElement = document.createElement('canvas');
    if (mayBeCanvas == null) {
      return;
    }
    let canvas: HTMLCanvasElement = mayBeCanvas;
    let side: number = 512;
    canvas.width = side;
    canvas.height = side;
    let mayBeContext: ?CanvasRenderingContext2D = canvas.getContext('2d');
    if (mayBeContext == null) {
      return;
    }
    let context: CanvasRenderingContext2D = mayBeContext;
    context.beginPath();
    points.forEach((p: point.Point) => {
      context.lineTo(p.x * side, p.y * side);
    });
    context.fill();
    if (document.body != null) {
      document.body.appendChild(canvas);
    }
  }

  checkLineIntersection(ps: Array<point.Point>): Array<Array<number>> {
    let lines: Array<Array<number>> = [];
    ps.forEach((p: point.Point, i: number) => {
      if (i === ps.length - 1) {
        lines.push([i, 0]);
        return;
      }
      lines.push([i, i + 1]);
    });

    let intersectionFound: boolean = true;
    while (intersectionFound) {
      intersectionFound = false;
      lines.forEach((l1: Array<number>, i1: number) => {
        lines.forEach((l2: Array<number>, i2: number) => {
          if (i1 <= i2 || intersectionFound) {
            return;
          }
          let line1: line.Line = new line.Line(ps[l1[0]], ps[l1[1]]);
          let line2: line.Line = new line.Line(ps[l2[0]], ps[l2[1]]);
          if (line1.intersects(line2)) {
            let intersection: point.Point = line1.intersection(line2);
            ps.push(intersection);
            lines.splice(i1, 1, [l1[0], ps.length - 1], [ps.length - 1, l1[1]]);
            lines.splice(i2, 1, [l2[0], ps.length - 1], [ps.length - 1, l2[1]]);
            intersectionFound = true;
            // 線分の端点が他方の線分に含まれる場合の考慮
          }
        });
      });
    }
    return lines;
  }

  drawLines(ps: Array<point.Point>, initialLines: Array<Array<number>>): Array<Array<number>> {
    let lines: Array<Array<number>> = [];
    ps.forEach((p1: point.Point, i1: number) => {
      ps.forEach((p2: point.Point, i2: number) => {
        if (i1 <= i2) {
          return;
        }
        let ll: line.Line = new line.Line(p1, p2);
        for (let i = 0; i < lines.length; i++) {
          let l: line.Line = new line.Line(ps[lines[i][0]], ps[lines[i][1]]);
          if (ll.intersects(l, true)) {
            return;
          }
        }
        for (let i = 0; i < initialLines.length; i++) {
          let l: line.Line = new line.Line(ps[initialLines[i][0]], ps[initialLines[i][1]]);
          if (ll.intersects(l, true)) {
            return;
          }
        }
        lines.push([i1, i2]);
      });
    });
    return lines;
  }
}
