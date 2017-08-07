// @flow

import * as point from '../point';
import * as line from '../line';

export const SIDE: number = 512;

export default class Polygonizer {

  constructor() {
    const pointsJson = require('../../data/points.json');
    let self: Polygonizer = this;
    pointsJson.points.forEach((points: Array<Array<number>>, index: number) => {
      if (index === 11) {
        return;
      }
      let p = document.createElement('p');
      p.innerHTML = index.toString();
      document.body.appendChild(p);

      console.log(index);
      let pointList: Array<point.Point> = point.PointUtils.fromNumberArrayPoints(points);
      let numInitialPoints: number = pointList.length;
      let normPoints: Array<point.Point> = self.normalizePointList(pointList);
      self.normalizedPointsToCanvas(normPoints);
      let initialLines: Array<Array<number>> = self.checkLineIntersection(normPoints);
      let lines: Array<Array<number>> = self.drawLines(normPoints, initialLines);
      let triangles: Array<Array<number>> = self.listUpTriangles(normPoints, initialLines, lines);
      console.log(JSON.stringify(triangles.filter((t: Array<number>) => t.includes(24))));
      self.draw(normPoints, numInitialPoints, initialLines, lines, triangles);
    });
  }

  listUpTriangles(normPoints: Array<point.Point>, initialLines: Array<Array<number>>, lines: Array<Array<number>>): Array<Array<number>> {
    let triangles: Array<Array<number>> = [];
    let ls: Array<Array<number>> = initialLines.concat(lines);
    let self: Polygonizer = this;
    ls.forEach((l1: Array<number>, i1: number) => {
      ls.forEach((l2: Array<number>, i2: number) => {
        ls.forEach((l3: Array<number>, i3: number) => {
          if (i1 <= i2 || i2 <= i3) {
            return;
          }
          if (l1.includes(l2[0])) {
            let edge: number = (l1.indexOf(l2[0]) === 0) ? 1 : 0;
            let share: number = (edge === 0) ? 1 : 0;
            if (l3.includes(l1[edge]) && l3.includes(l2[1])) {
              if (self.containsNoPoints(normPoints, l1[edge], l1[share], l2[1])) {
                triangles.push(l1.concat(l2[1]));
              }
            }
          }
          else if (l1.includes(l2[1])) {
            let edge: number = (l1.indexOf(l2[1]) === 0) ? 1 : 0;
            let share: number = (edge === 0) ? 1 : 0;
            if (l3.includes(l1[edge]) && l3.includes(l2[0])) {
              if (self.containsNoPoints(normPoints, l1[edge], l1[share], l2[0])) {
                triangles.push(l1.concat(l2[0]));
              }
            }
          }
        });
      });
    });
    return triangles;
  }

  containsNoPoints(ps: Array<point.Point>, i1: number, i2: number, i3: number): boolean {
    for (let pIndex: number = 0; pIndex < ps.length; pIndex++) {
      if (this.containsPoint(ps[pIndex], ps, i1, i2, i3)) {
        return false;
      }
    }
    return true;
  }

  containsPoint(p: point.Point, ps: Array<point.Point>, i1: number, i2: number, i3: number): boolean {
    if (!this.inAngle(p, ps, i1, i2, i3)) {
      return false;
    }
    if (!this.inAngle(p, ps, i2, i3, i1)) {
      return false;
    }
    if (!this.inAngle(p, ps, i3, i1, i2)) {
      return false;
    }
    return true;
  }

  inAngle(p: point.Point, ps: Array<point.Point>, i1: number, i2: number, i3: number): boolean {
    let lineAngle: number = this.calcAngle(ps[i1], ps[i2], ps[i3]);
    let pointAngle: number = this.calcAngle(ps[i1], ps[i2], p);
    return Math.abs(pointAngle) > Math.abs(lineAngle);
  }

  calcSumAngle(normPoints: Array<point.Point>, initialLines: Array<Array<number>>): number {
    let sumAngle: number = 0;
    let self: Polygonizer = this;
    initialLines.forEach((lIndex: Array<number>, index: number) => {
      if (index === 0) {
        let l: line.Line = new line.Line(normPoints[lIndex[0]], normPoints[lIndex[1]]);
        let i0: number = initialLines[initialLines.length - 1][0];
        let i1: number = lIndex[0];
        let i2: number = lIndex[1];
        let angle: number = self.calcAngle(normPoints[i0], normPoints[i1], normPoints[i2]);
        sumAngle += (angle > 0) ? 180 - angle : -180 - angle;
        return;
      }
      let l: line.Line = new line.Line(normPoints[lIndex[0]], normPoints[lIndex[1]]);
      let i0: number = initialLines[index - 1][0];
      let i1: number = lIndex[0];
      let i2: number = lIndex[1];
      let angle: number = self.calcAngle(normPoints[i0], normPoints[i1], normPoints[i2]);
      sumAngle += (angle > 0) ? 180 - angle : -180 - angle;
    });
    return sumAngle;
  }

  calcAngle(p1: point.Point, p2: point.Point, p3: point.Point): number {
    let v1: point.Point = p2.sub(p1);
    let v2: point.Point = p3.sub(p2);
    let arg: number = v1.inner(v2) / (v1.magnitude() * v2.magnitude());
    let angle: number;
    if (arg >= 1.0) {
      angle = 0;
    }
    else if (arg <= -1) {
      angle = Math.PI * 180 / Math.PI;
    }
    else {
      angle = Math.acos(arg) * 180 / Math.PI;
    }
    let coef: number = (v1.outer(v2) >= 0) ? 1 : -1;
    return - coef * angle;
  }

  draw(normPoints: Array<point.Point>, numInitialPoints: number, initialLines: Array<Array<number>>, lines: Array<Array<number>>, triangles: Array<Array<number>>) {
    let mayBeCanvas: ?HTMLCanvasElement = document.createElement('canvas');
    if (mayBeCanvas == null) {
      return;
    }
    let canvas: HTMLCanvasElement = mayBeCanvas;
    let side: number = SIDE;
    canvas.width = side;
    canvas.height = side;
    let mayBeContext: ?CanvasRenderingContext2D = canvas.getContext('2d');
    if (mayBeContext == null) {
      return;
    }
    let insideTriangles: Array<Array<number>> = [];
    let context: CanvasRenderingContext2D = mayBeContext;
    let self: Polygonizer = this;
    let angle: number = this.calcSumAngle(normPoints, initialLines);
    let direction: number = (angle > 0) ? -1 : (angle < 0) ? 1 : 0;
    if ((normPoints.length - numInitialPoints) % 2 !== 0) {
      console.log('against');
      direction = (direction === 1) ? 1 : (direction === -1) ? 1 : 0;
    } else {
      if (direction === -1) {
        direction = 1;
      }
    }
    console.log(`direction=${direction}`);
    initialLines.forEach((l: Array<number>, lIndex: number) => {
      let remove: number = -1;
      let inside: number = -1;
      let previousDirection: number = direction;
      triangles.forEach((t: Array<number>, tIndex: number) => {
        if (t.includes(l[0]) && t.includes(l[1])) {
          let thirdIndex: number = t[3 - t.indexOf(l[0]) - t.indexOf(l[1])];
          let sumAngle: number = self.calcAngle(normPoints[l[0]], normPoints[l[1]], normPoints[thirdIndex]);
          let nowDirection: number = (sumAngle > 0) ? 1 : (sumAngle < 0) ? -1 : 0;
          if (nowDirection === 0) {
            nowDirection = previousDirection;
          }
          if (direction * nowDirection !== 0 && direction === nowDirection) {
            inside = tIndex;
          }
          else if (direction * nowDirection !== 0 && direction !== nowDirection) {
            remove = tIndex;
          }
          if (nowDirection !== 0) {
            previousDirection = nowDirection;
          }
        }
      });
      if (inside !== -1) {
        insideTriangles.push(triangles.splice(inside, 1)[0]);
      }
      if (remove !== -1) {
        triangles.splice((remove < inside || inside === -1) ? remove : remove - 1, 1);
      }
      if (l[1] >= numInitialPoints) {
        direction = (direction === 1) ? -1 : 1;
      }
    });

    console.log('amari ', JSON.stringify(triangles));
    let amariInsides: Array<Array<number>> = [];
    while (triangles.length > 0) {
      let insides: Array<Array<number>> = [];
      let removes: Array<Array<number>> = [];
      triangles.forEach((t: Array<number>) => {
        for (let index: number = 0; index < insideTriangles.length; index++) {
          let it: Array<number> = insideTriangles[index];
          if (self.shareLine(t, it)) {
            insides.push(t);
            return;
          }
        }
        removes.push(t);
      });
      insides.forEach((t: Array<number>) => {
        amariInsides.push(t);
        triangles.splice(triangles.indexOf(t), 1);
      });
      removes.forEach((t: Array<number>) => {
        triangles.splice(triangles.indexOf(t), 1);
      });
    }
    amariInsides.forEach((t: Array<number>) => {
      context.fillStyle = "#00FFFF";
      context.beginPath();
      context.moveTo(normPoints[t[0]].x * side, normPoints[t[0]].y * side);
      context.lineTo(normPoints[t[1]].x * side, normPoints[t[1]].y * side);
      context.lineTo(normPoints[t[2]].x * side, normPoints[t[2]].y * side);
      context.fill();
    });
    insideTriangles.forEach((t: Array<number>) => {
      context.fillStyle = "#00FF00";
      context.beginPath();
      context.moveTo(normPoints[t[0]].x * side, normPoints[t[0]].y * side);
      context.lineTo(normPoints[t[1]].x * side, normPoints[t[1]].y * side);
      context.lineTo(normPoints[t[2]].x * side, normPoints[t[2]].y * side);
      context.fill();
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
    normPoints.forEach((p: point.Point, pIndex: number) => {
      context.fillStyle = (pIndex < numInitialPoints) ? "#000000" : "#FF0000";
      context.fillRect(p.x * side - 2, p.y * side - 2, 4, 4);
    });
    if (document.body != null) {
      document.body.appendChild(canvas);
    }
  }

  shareLine(t1: Array<number>, t2: Array<number>): boolean {
    let score: number = 0;
    if (t1.includes(t2[0])) score++;
    if (t1.includes(t2[1])) score++;
    if (t1.includes(t2[2])) score++;
    return score === 2;
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
    let side: number = SIDE;
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
    context.fillStyle = "#DDDDDD";
    context.fill();

    let self: Polygonizer = this;
    points.forEach((p: point.Point, pIndex: number) => {
      if (pIndex === 0) {
        return;
      }
      context.beginPath();
      context.moveTo(points[pIndex - 1].x * side, points[pIndex - 1].y * side);
      context.lineTo(p.x * side, p.y * side);
      context.strokeStyle = self.numberToColor(pIndex);
      context.stroke();
    });
    if (document.body != null) {
      document.body.appendChild(canvas);
    }
  }

  numberToColor(k: number): string {
    switch (k % 6) {
      case 0:
        return "#FF0000";
      case 1:
        return "#888800";
      case 2:
        return "#00FF00";
      case 3:
        return "#008888";
      case 4:
        return "#0000FF";
      case 5:
        return "#880088";
      default:
        return "#000000";
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
