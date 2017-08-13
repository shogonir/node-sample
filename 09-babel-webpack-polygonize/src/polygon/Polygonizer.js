// @flow

import * as point from '../point';
import * as line from '../line';

export const SIDE: number = 128;

export default class Polygonizer {

  constructor() {
    const pointsJson = require('../../data/points.json');
    let self: Polygonizer = this;
    pointsJson.points.forEach((points: Array<Array<number>>, index: number) => {
      if (index === 11) {
        return;
      }
      let pointList: Array<point.Point> = point.PointUtils.fromNumberArrayPoints(points);
      let normPoints: Array<point.Point> = self.normalizePointList(pointList);
      let initialLines: Array<Array<number>> = self.checkLineIntersection(normPoints);
      let lines: Array<Array<number>> = self.drawLines(normPoints, initialLines);
      let triangles: Array<Array<number>> = self.listUpTriangles(normPoints, initialLines, lines);
      let triangleGroups: Array<Array<Array<number>>> = self.gatherTriangles(normPoints, initialLines, lines, triangles);
      let gravities: Array<point.Point> = self.calculateGravities(normPoints, triangleGroups);
      let windingNumbers: Array<number> = self.countWindingNumbers(normPoints, initialLines, gravities);
      self.draw(normPoints, triangles, triangleGroups, windingNumbers);
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
      lines.forEach((l: Array<number>, lIndex: number) => {
        ps.forEach((p: point.Point, pIndex: number) => {
          if (l.includes(pIndex) || intersectionFound) return;
          let p1: point.Point = ps[l[0]];
          let p2: point.Point = ps[l[1]];
          let ll: line.Line = new line.Line(p1, p2);
          if (ll.overlaps(new line.Line(p, p1)) && ll.overlaps(new line.Line(p, p2))) {
            intersectionFound = true;
            lines.splice(lIndex, 1, [l[0], pIndex], [pIndex, l[1]]);
          }
        });
      });
    }
    intersectionFound = true;
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
        for (let pIndex: number = 0; pIndex < ps.length; pIndex++) {
          let p: point.Point = ps[pIndex];
          if (ll.overlaps(new line.Line(p, p1)) && ll.overlaps(new line.Line(p, p2))) {
            return;
          }
        }
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

  calculateGravities(normPoints: Array<point.Point>, triangleGroups: Array<Array<Array<number>>>): Array<point.Point> {
    let gravities: Array<point.Point> = [];
    triangleGroups.forEach((ts: Array<Array<number>>) => {
      let p1: point.Point = normPoints[ts[0][0]];
      let p2: point.Point = normPoints[ts[0][1]];
      let p3: point.Point = normPoints[ts[0][2]];
      let gravity: point.Point = p1.add(p2).add(p3).scalar(1 / 3);
      gravities.push(gravity);
    });
    return gravities;
  }

  gatherTriangles(normPoints: Array<point.Point>, initialLines: Array<Array<number>>, lines: Array<Array<number>>, triangles: Array<Array<number>>) {
    let tris: Array<Array<number>> = JSON.parse(JSON.stringify(triangles));
    let triangleGroups: Array<Array<Array<number>>> = [];
    let self: Polygonizer = this;
    while (tris.length > 0) {
      let triangleGroup: Array<Array<number>> = [];
      triangleGroup.push(tris.splice(0, 1)[0]);
      let loopFlag: boolean = true;
      while (loopFlag) {
        loopFlag = false;
        tris.forEach((t1: Array<number>, i1: number) => {
          if (loopFlag) return;
          triangleGroup.forEach((t2: Array<number>) => {
            if (loopFlag) return;
            if (JSON.stringify(t1) === JSON.stringify(t2)) return;
            if (self.shareLine(t1, t2)) {
              let shared: Array<number> = self.sharedLine(t1, t2);
              if (self.includesLine(shared, lines)) {
                loopFlag = true;
                triangleGroup.push(tris.splice(i1, 1)[0]);
              }
            }
          });
        });
      }
      triangleGroups.push(triangleGroup);
    }
    return triangleGroups;
  }

  shareLine(t1: Array<number>, t2: Array<number>): boolean {
    let score: number = 0;
    if (t1.includes(t2[0])) score++;
    if (t1.includes(t2[1])) score++;
    if (t1.includes(t2[2])) score++;
    return score === 2;
  }

  sharedLine(t1: Array<number>, t2: Array<number>): Array<number> {
    if (t1.includes(t2[0]) && t1.includes(t2[1])) {
      return [t2[0], t2[1]];
    }
    if (t1.includes(t2[1]) && t1.includes(t2[2])) {
      return [t2[1], t2[2]];
    }
    if (t1.includes(t2[2]) && t1.includes(t2[0])) {
      return [t2[2], t2[0]];
    }
    return [];
  }

  includesLine(l: Array<number>, ls: Array<Array<number>>): boolean {
    for (let index: number = 0; index < ls.length; index++) {
      let ll: Array<number> = ls[index];
      if (ll.includes(l[0]) && ll.includes(l[1])) {
        return true;
      }
    }
    return false;
  }

  countWindingNumbers(normPoints: Array<point.Point>, initialLines: Array<Array<number>>, gravities: Array<point.Point>): Array<number> {
    let windingNumbers: Array<number> = Array(gravities.length).fill(0);
    initialLines.forEach((l: Array<number>) => {
      let p1: point.Point = normPoints[l[0]];
      let p2: point.Point = normPoints[l[1]];
      gravities.forEach((g: point.Point, gIndex: number) => {
        if (p1.y <= g.y && p2.y > g.y) {
          let yy: number = (g.y - p1.y) / (p2.y - p1.y);
          if (g.x < (p1.x + (yy * (p2.x - p1.x)))) {
            windingNumbers[gIndex]++;
          }
        }
        else if (p1.y > g.y && p2.y <= g.y) {
          let yy: number = (g.y - p1.y) / (p2.y - p1.y);
          if (g.x < (p1.x + (yy * (p2.x - p1.x)))) {
            windingNumbers[gIndex]--;
          }
        }
      });
    });
    return windingNumbers;
  }

  draw(normPoints: Array<point.Point>, triangles: Array<Array<number>>, triangleGroups: Array<Array<Array<number>>>, windingNumbers: Array<number>) {
    let self: Polygonizer = this;
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
    triangleGroups.forEach((ts: Array<Array<number>>, index: number) => {
      if (windingNumbers[index] === 0) {
        return;
      }
      context.fillStyle = "#00FF00";
      ts.forEach((t: Array<number>) => {
        context.beginPath();
        context.moveTo(normPoints[t[0]].x * side, normPoints[t[0]].y * side);
        context.lineTo(normPoints[t[1]].x * side, normPoints[t[1]].y * side);
        context.lineTo(normPoints[t[2]].x * side, normPoints[t[2]].y * side);
        context.fill();
      });
    });
    if (document.body != null) {
      document.body.appendChild(canvas);
    }
  }
}
