// @flow

import * as point from '../point';
import * as line from '../line';
import PointIndexHash from './PointIndexHash';

export const SIDE: number = 512;

export default class Polygonizer {

  numInitialPoints: number;
  pointList: Array<point.Point>;

  lineList: Array<Array<number>>;
  lineHash: PointIndexHash;
  isPolygonLines: Array<boolean>;

  triangleList: Array<Array<number>>;
  triangleHash: PointIndexHash;
  triangleGroup: Array<number>;

  gravities: Array<point.Point>;
  windingNumbers: Array<number>;

  triangulate(pointList: Array<point.Point>) {
    this.pointList = pointList.map((p: point.Point) => {
      return new point.Point(Math.floor(p.x * 3600 * 1000), Math.floor(p.y * 3600 * 1000));
    });
    this.numInitialPoints = pointList.length;
    console.log(this.numInitialPoints);
    console.time('checkLineIntersection');
    this.checkLineIntersection();
    console.timeEnd('checkLineIntersection');

    console.time('drawCanvas');
    this.drawCanvas();
    console.timeEnd('drawCanvas');

    console.time('clipEars');
    this.clipEars();
    console.timeEnd('clipEars');

    this.drawTriangles();
  }

  checkLineIntersection() {
    this.lineList = [];
    this.isPolygonLines = [];
    let self: Polygonizer = this;
    this.pointList.forEach((p: point.Point, i: number) => {
      if (i === self.pointList.length - 1) {
        self.lineList.push([i, 0]);
        self.isPolygonLines.push(true);
        return;
      }
      self.lineList.push([i, i + 1]);
      self.isPolygonLines.push(true);
    });

    let intersectionFound: boolean = true;
    while (intersectionFound) {
      intersectionFound = false;
      this.lineList.forEach((l: Array<number>, lIndex: number) => {
        self.pointList.forEach((p: point.Point, pIndex: number) => {
          if (l.includes(pIndex) || intersectionFound) return;
          let p1: point.Point = self.pointList[l[0]];
          let p2: point.Point = self.pointList[l[1]];
          let ll: line.Line = new line.Line(p1, p2);
          if (ll.overlaps(new line.Line(p, p1)) && ll.overlaps(new line.Line(p, p2))) {
            intersectionFound = true;
            self.lineList.splice(lIndex, 1, [l[0], pIndex], [pIndex, l[1]]);
            self.isPolygonLines.splice(lIndex, 1, true, true);
          }
        });
      });
    }
    intersectionFound = true;
    while (intersectionFound) {
      intersectionFound = false;
      this.lineList.forEach((l1: Array<number>, i1: number) => {
        self.lineList.forEach((l2: Array<number>, i2: number) => {
          if (i1 <= i2 || intersectionFound) {
            return;
          }
          let line1: line.Line = new line.Line(self.pointList[l1[0]], self.pointList[l1[1]]);
          let line2: line.Line = new line.Line(self.pointList[l2[0]], self.pointList[l2[1]]);
          if (line1.intersects(line2)) {
            let intersection: point.Point = line1.intersection(line2);
            self.pointList.push(intersection);
            self.lineList.splice(i1, 1, [l1[0], self.pointList.length - 1], [self.pointList.length - 1, l1[1]]);
            self.isPolygonLines.splice(i1, 1, true, true);
            self.lineList.splice(i2, 1, [l2[0], self.pointList.length - 1], [self.pointList.length - 1, l2[1]]);
            self.isPolygonLines.splice(i2, 1, true, true);
            intersectionFound = true;
          }
        });
      });
    }
  }

  drawCanvas(lineList: Array<Array<number>>) {
    let self: Polygonizer = this;
    let headPoint: point.Point = this.pointList[0];
    let xmin: number = headPoint.x;
    let xmax: number = headPoint.x;
    let ymin: number = headPoint.y;
    let ymax: number = headPoint.y;
    this.pointList.forEach((p: point.Point) => {
      xmin = (p.x < xmin) ? p.x : xmin;
      xmax = (p.x > xmax) ? p.x : xmax;
      ymin = (p.y < ymin) ? p.y : ymin;
      ymax = (p.y > ymax) ? p.y : ymax;
    });
    let normalizedPoints: Array<point.Point> = this.pointList.map((p: point.Point) => {
      let x: number = (p.x - xmin) / (xmax - xmin);
      let y: number = (p.y - ymin) / (ymax - ymin);
      return new point.Point(x, y);
    });
    let mayBeCanvas: ?HTMLCanvasElement = document.createElement('canvas');
    let canvas: HTMLCanvasElement;
    if (mayBeCanvas != null) {
      canvas = mayBeCanvas;
    }
    canvas.width = SIDE;
    canvas.height = SIDE;
    let meyBeContext: ?CanvasRenderingContext2D = canvas.getContext('2d');
    let context: CanvasRenderingContext2D;
    if (meyBeContext != null) {
      context = meyBeContext;
    }
    context.beginPath();
    normalizedPoints.forEach((p: point.Point, pIndex: number) => {
      if (pIndex >= self.numInitialPoints) return;
      if (pIndex === 0) {
        context.moveTo(p.x * SIDE, p.y * SIDE);
        return;
      }
      context.lineTo(p.x * SIDE, p.y * SIDE);
    });
    context.fillStyle = "#DDDDDD";
    context.fill();
    let ls: Array<Array<number>> = (lineList == null) ? this.lineList : lineList;
    ls.forEach((l: Array<number>, lIndex: number) => {
      let pFrom: point.Point = normalizedPoints[l[0]];
      let pTo: point.Point = normalizedPoints[l[1]];
      context.beginPath();
      context.moveTo(pFrom.x * SIDE, pFrom.y * SIDE);
      context.lineTo(pTo.x * SIDE, pTo.y * SIDE);
      context.strokeStyle = self.numberToColor(lIndex);
      context.stroke();
    });
    if (document.body != null) {
      document.body.appendChild(canvas);
    }
  }

  clipEars() {
    let self: Polygonizer = this;
    this.triangleList = [];
    this.isRemoved = Array(this.pointList.length).fill(false);
    let lineList: Array<Array<number>> = JSON.parse(JSON.stringify(this.lineList));
    while (lineList.length >= 3) {
      let triangleFound: boolean = false;
      for (let lIndex: number = 0; lIndex < lineList.length; lIndex++) {
        let l: Array<number> = lineList[lIndex];
        if (lIndex === 0 && lIndex === lineList.length - 1) continue;
        let next: Array<number> = (lIndex === lineList.length - 1) ? lineList[0] : lineList[lIndex + 1];
        if (l[0] === l[1] || l[0] === next[1] || l[1] === next[1]) continue;
        let p1: point.Point = self.pointList[l[0]];
        let p2: point.Point = self.pointList[l[1]];
        let p3: point.Point = self.pointList[next[1]];
        let l1: line.Line = new line.Line(p1, p2);
        let l2: line.Line = new line.Line(p2, p3);
        let l3: line.Line = new line.Line(p1, p3);
        if (l1.overlaps(l2) || l2.overlaps(l3) || l3.overlaps(l1)) continue;
        let breakFlag: boolean = false;
        for (let lIndex2: number = 0; lIndex2 < lineList.length; lIndex2++) {
          let ll: Array<number> = lineList[lIndex2];
          if ((ll[0] === l[0] && ll[1] === next[1]) || (ll[1] === l[0] && ll[0] === next[1])) continue;
          let l4: line.Line = new line.Line(self.pointList[ll[0]], self.pointList[ll[1]]);
          if (l3.intersects(l4, false)) {
            breakFlag = true;
            break;
          }
        }
        if (breakFlag) continue;
        let g: point.Point = p1.add(p2).add(p3).scalar(1 / 3);

        let windingNumber: number = 0;
        lineList.forEach((lll: Array<number>) => {
          let p1: point.Point = self.pointList[lll[0]];
          let p2: point.Point = self.pointList[lll[1]];
          if (p1.y <= g.y && p2.y > g.y) {
            let yy: number = (g.y - p1.y) / (p2.y - p1.y);
            if (g.x < (p1.x + (yy * (p2.x - p1.x)))) {
              windingNumber++;
            }
          }
          else if (p1.y > g.y && p2.y <= g.y) {
            let yy: number = (g.y - p1.y) / (p2.y - p1.y);
            if (g.x < (p1.x + (yy * (p2.x - p1.x)))) {
              windingNumber--;
            }
          }
        });
        if (windingNumber === 0) continue;

        triangleFound = true;
        self.triangleList.push([l[0], l[1], next[1]]);
        let flag: boolean = false;
        let num: number = -1;
        lineList.forEach((ll: Array<number>, lnum: number) => {
          if ((l[0] === ll[0] && next[1] === ll[1]) || (l[0] === ll[1] && next[1] === ll[0])) {
            flag = true;
            num = lnum;
          }
        });

        if (flag) {
          if (lIndex > num) {
            lineList.splice(lIndex, 2);
            lineList.splice(num, 1);
          } else {
            lineList.splice(num, 1);
            lineList.splice(lIndex, 2);
          }
        } else {
          if (lIndex === lineList.length - 1) {
            lineList.splice(lIndex, 1, [l[0], next[1]]);
            lineList.splice(0, 1);
          } else {
            lineList.splice(lIndex, 2, [l[0], next[1]]);
          }
        }

        //this.drawCanvas(lineList);
        break;
      }
      if (triangleFound === false) {
        break;
      }
    }
  }

  drawTriangles() {
    let self: Polygonizer = this;
    let mayBeCanvas: ?HTMLCanvasElement = document.createElement('canvas');
    let canvas: HTMLCanvasElement;
    if (mayBeCanvas != null) {
      canvas = mayBeCanvas;
    }
    canvas.width = SIDE;
    canvas.height = SIDE;
    let meyBeContext: ?CanvasRenderingContext2D = canvas.getContext('2d');
    let context: CanvasRenderingContext2D;
    if (meyBeContext != null) {
      context = meyBeContext;
    }
    this.normalizePointList();
    this.triangleList.forEach((t: Array<number>) => {
      let p1: point.Point = self.pointList[t[0]];
      let p2: point.Point = self.pointList[t[1]];
      let p3: point.Point = self.pointList[t[2]];
      context.beginPath();
      context.moveTo(p1.x * SIDE, p1.y * SIDE);
      context.lineTo(p2.x * SIDE, p2.y * SIDE);
      context.lineTo(p3.x * SIDE, p3.y * SIDE);
      context.lineTo(p1.x * SIDE, p1.y * SIDE);
      context.fillStyle = "#DDDDDD";
      context.fill();
      context.strokeStyle = "#00FF00";
      context.stroke();
    });
    if (document.body != null) {
      document.body.appendChild(canvas);
    }
  }

  drawLines() {
    let self: Polygonizer = this;
    this.pointList.forEach((p1: point.Point, i1: number) => {
      self.pointList.forEach((p2: point.Point, i2: number) => {
        if (i1 <= i2) {
          return;
        }
        let ll: line.Line = new line.Line(p1, p2);
        for (let pIndex: number = 0; pIndex < self.pointList.length; pIndex++) {
          let p: point.Point = self.pointList[pIndex];
          if (ll.overlaps(new line.Line(p, p1)) && ll.overlaps(new line.Line(p, p2))) {
            return;
          }
        }
        for (let i = 0; i < self.lineList.length; i++) {
          let l: line.Line = new line.Line(self.pointList[self.lineList[i][0]], self.pointList[self.lineList[i][1]]);
          if (ll.intersects(l, true)) {
            return;
          }
        }
        self.lineList.push([i1, i2]);
        self.isPolygonLines.push(false);
      });
    });
    this.lineHash = new PointIndexHash(this.lineList);
  }

  listUpTriangles() {
    this.triangleList = [];
    let self: Polygonizer = this;
    this.lineList.forEach((l1: Array<number>, i1: number) => {
      self.lineHash.hash[l1[0]].forEach((i2: number) => {
        if (i1 === i2) return;
        let l2: Array<number> = self.lineList[i2];
        let l1Edge: number = l1[1];
        let l2Edge: number = l2[(l2[0] === l1[0]) ? 1 : 0];
        self.lineHash.hash[l1Edge].forEach((i3: number) => {
          if (i1 === i3 || i2 === i3) return;
          let l3: Array<number> = self.lineList[i3];
          let t: Array<number> = [i1, i2, i3];
          if (l3.includes(l2Edge) && self.containsNoPoints(l1[0], l1Edge, l2Edge) && !self.includesTriangle(t)) {
            self.triangleList.push(t);
          }
        });
      });
    });
    this.triangleHash = new PointIndexHash(this.triangleList);
  }

  containsNoPoints(i1: number, i2: number, i3: number): boolean {
    for (let pIndex: number = 0; pIndex < this.pointList.length; pIndex++) {
      if (this.containsPoint(this.pointList[pIndex], i1, i2, i3)) {
        return false;
      }
    }
    return true;
  }

  containsPoint(p: point.Point, i1: number, i2: number, i3: number): boolean {
    if (!this.inAngle(p, i1, i2, i3)) {
      return false;
    }
    if (!this.inAngle(p, i2, i3, i1)) {
      return false;
    }
    if (!this.inAngle(p, i3, i1, i2)) {
      return false;
    }
    return true;
  }

  inAngle(p: point.Point, i1: number, i2: number, i3: number): boolean {
    let lineAngle: number = this.calcAngle(this.pointList[i1], this.pointList[i2], this.pointList[i3]);
    let pointAngle: number = this.calcAngle(this.pointList[i1], this.pointList[i2], p);
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

  calculateGravities() {
    this.gravities = [];
    let groupID: number = 0;
    this.triangleList.forEach((t: Array<number>) => {
      let l1: Array<number> = this.lineList[t[0]];
      let l2: Array<number> = this.lineList[t[1]];
      let l3: Array<number> = this.lineList[t[2]];
      let pIndices: Array<number> = l1.concat(l2).concat(l3).sort((a, b) => b - a);
      let p1: point.Point = this.pointList[pIndices[0]];
      let p2: point.Point = this.pointList[pIndices[2]];
      let p3: point.Point = this.pointList[pIndices[4]];
      this.gravities.push(p1.add(p2).add(p3).scalar(1 / 3));
      groupID++;
    });
  }

  shareLine(t1: Array<number>, t2: Array<number>): boolean {
    if (t1.includes(t2[0])) return true;
    if (t1.includes(t2[1])) return true;
    if (t1.includes(t2[2])) return true;
    return false;
  }

  sharedLine(t1: Array<number>, t2: Array<number>): number {
    if (t1.includes(t2[0])) {
      return t2[0];
    }
    if (t1.includes(t2[1])) {
      return t2[1];
    }
    if (t1.includes(t2[2])) {
      return t2[2];
    }
    return -1;
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

  includesTriangle(t: Array<number>): boolean {
    for (let tIndex: number = 0; tIndex < this.triangleList.length; tIndex++) {
      let tt: Array<number> = this.triangleList[tIndex];
      if (tt.includes(t[0]) && tt.includes(t[1]) && tt.includes(t[2])) {
        return true;
      }
    }
    return false;
  }

  countWindingNumbers() {
    this.windingNumbers = Array(this.gravities.length).fill(0);
    let self: Polygonizer = this;
    this.lineList.forEach((l: Array<number>, lIndex: number) => {
      if (!self.isPolygonLines[lIndex]) return;
      let p1: point.Point = self.pointList[l[0]];
      let p2: point.Point = self.pointList[l[1]];
      self.gravities.forEach((g: point.Point, gIndex: number) => {
        if (p1.y <= g.y && p2.y > g.y) {
          let yy: number = (g.y - p1.y) / (p2.y - p1.y);
          if (g.x < (p1.x + (yy * (p2.x - p1.x)))) {
            self.windingNumbers[gIndex]++;
          }
        }
        else if (p1.y > g.y && p2.y <= g.y) {
          let yy: number = (g.y - p1.y) / (p2.y - p1.y);
          if (g.x < (p1.x + (yy * (p2.x - p1.x)))) {
            self.windingNumbers[gIndex]--;
          }
        }
      });
    });
  }

  draw() {
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

    this.normalizePointList();
    this.triangleList.forEach((t: Array<number>, tIndex: number) => {
      if (self.windingNumbers[tIndex] === 0) {
        return;
      }
      context.fillStyle = "#00FF00";
      let l1: Array<number> = self.lineList[t[0]];
      let l2: Array<number> = self.lineList[t[1]];
      let l3: Array<number> = self.lineList[t[2]];
      let pIndices: Array<number> = l1.concat(l2).concat(l3).sort((a, b) => b - a);
      let p1: point.Point = self.pointList[pIndices[0]];
      let p2: point.Point = self.pointList[pIndices[2]];
      let p3: point.Point = self.pointList[pIndices[4]];
      context.beginPath();
      context.moveTo(p1.x * side, p1.y * side);
      context.lineTo(p2.x * side, p2.y * side);
      context.lineTo(p3.x * side, p3.y * side);
      context.lineTo(p1.x * side, p1.y * side);
      context.fill();
      context.strokeStyle = "#0000FF";
      context.stroke();
    });
    if (document.body != null) {
      document.body.appendChild(canvas);
    }
  }

  normalizePointList() {
    let xmin: number = this.pointList[0].x;
    let xmax: number = this.pointList[0].x;
    let ymin: number = this.pointList[0].y;
    let ymax: number = this.pointList[0].y;
    this.pointList.forEach((p: point.Point) => {
      xmin = (p.x < xmin) ? p.x : xmin;
      xmax = (p.x > xmax) ? p.x : xmax;
      ymin = (p.y < ymin) ? p.y : ymin;
      ymax = (p.y > ymax) ? p.y : ymax;
    });
    this.pointList.forEach((p: point.Point) => {
      p.x = (p.x - xmin) / (xmax - xmin);
      p.y = (p.y - ymin) / (ymax - ymin);
    });
    /*
    this.gravities.forEach((g: point.Point) => {
      g.x = (g.x - xmin) / (xmax - xmin);
      g.y = (g.y - ymin) / (ymax - ymin);
    });
    */
  }

  numberToColor(num: number): string {
    switch (num % 6) {
      case 0:
        return "#FF0000";
      case 1:
        return "#FFFF00";
      case 2:
        return "#00FF00";
      case 3:
        return "#00FFFF";
      case 4:
        return "#0000FF";
      case 5:
        return "#FF00FF";
      default:
        return "#000000";
    }
  }
}
