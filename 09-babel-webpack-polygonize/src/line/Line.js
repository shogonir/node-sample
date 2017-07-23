// @flow

import * as point from '../point';

export default class Line {

  p1: point.Point;
  p2: point.Point;

  constructor(p1: point.Point, p2: point.Point) {
    this.p1 = p1;
    this.p2 = p2;
  }

  intersects(another: Line): boolean {
    let ax: number = this.p1.x;
    let ay: number = this.p1.y;
    let bx: number = this.p2.x;
    let by: number = this.p2.y;
    let cx: number = another.p1.x;
    let cy: number = another.p1.y;
    let dx: number = another.p2.x;
    let dy: number = another.p2.y;
    let ta = (cx - dx) * (ay - cy) + (cy - dy) * (cx - ax);
    let tb = (cx - dx) * (by - cy) + (cy - dy) * (cx - bx);
    let tc = (ax - bx) * (cy - ay) + (ay - by) * (ax - cx);
    let td = (ax - bx) * (dy - ay) + (ay - by) * (ax - dx);
    return tc * td < 0 && ta * tb < 0;
  }

  intersection(another: Line): point.Point {
    let a: number = this.p1.x;
    let b: number = this.p1.y;
    let c: number = this.p2.x;
    let d: number = this.p2.y;
    let e: number = another.p1.x;
    let f: number = another.p1.y;
    let g: number = another.p2.x;
    let h: number = another.p2.y;
    let x: number = ((f * g - e * h) * (c - a) - (b * c - a * d) * (g - e)) /
      ((d - b) * (g - e) - (c - a) * (h - f));
    let y: number = ((f * g - e * h) * (d - b) - (b * c - a * d) * (h - f)) /
      ((d - b) * (g - e) - (c - a) * (h - f));
    return new point.Point(x, y);
  }
}
