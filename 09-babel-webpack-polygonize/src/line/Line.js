// @flow

import * as point from '../point';

export default class Line {

  p1: point.Point;
  p2: point.Point;

  constructor(p1: point.Point, p2: point.Point) {
    this.p1 = p1;
    this.p2 = p2;
  }

  equals(another: Line): boolean {
    if (this.p1.equals(another.p1) && this.p2.equals(another.p2)) {
      return true;
    }
    if (this.p1.equals(another.p2) && this.p2.equals(another.p1)) {
      return true;
    }
    return false;
  }

  intersects(another: Line, overlaps: boolean): boolean {
    if (this.equals(another)) {
      return true;
    }
    if (overlaps && this.overlaps(another)) {
      return true;
    }
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

  overlaps(another: Line): boolean {
    if (this.overlapsVertical(another)) {
      return true;
    }
    if (this.overlapsHorizontal(another)) {
      return true;
    }
    let d1: number = (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
    let d2: number = (another.p2.y - another.p1.y) / (another.p2.x - another.p1.x);
    if (Math.abs(d1 - d2) > 0.00000001) {
      return false;
    }
    let x1: number = this.p1.x - (this.p1.y / d1);
    let x2: number = another.p1.x - (another.p1.y / d2);
    if (Math.abs(x1 - x2) > 0.00000001) {
      return false;
    }
    let xmin: number = (this.p1.x > this.p2.x) ? this.p2.x : this.p1.x;
    let xmax: number = (this.p1.x < this.p2.x) ? this.p2.x : this.p1.x;
    if ((another.p1.x > xmin && another.p1.x < xmax) || (another.p2.x > xmin && another.p2.x < xmax)) {
      return true;
    }
    xmin = (another.p1.x > another.p2.x) ? another.p2.x : another.p1.x;
    xmax = (another.p1.x < another.p2.x) ? another.p2.x : another.p1.x;
    if ((this.p1.x > xmin && this.p1.x < xmax) || (this.p2.x > xmin && this.p2.x < xmax)) {
      return true;
    }
    return false;
  }

  overlapsVertical(another: Line): boolean {
    if (this.p1.x !== this.p2.x || another.p1.x !== another.p2.x) {
      return false;
    }
    if (this.p1.x !== another.p1.x) {
      return false;
    }
    let ymin: number = (this.p1.y > this.p2.y) ? this.p2.y : this.p1.y;
    let ymax: number = (this.p1.y < this.p2.y) ? this.p2.y : this.p1.y;
    if ((another.p1.y > ymin && another.p1.y < ymax) || (another.p2.y > ymin && another.p2.y < ymax)) {
      return true;
    }
    ymin = (another.p1.y > another.p2.y) ? another.p2.y : another.p1.y;
    ymax = (another.p1.y < another.p2.y) ? another.p2.y : another.p1.y;
    if ((this.p1.y > ymin && this.p1.y < ymax) || (this.p2.y > ymin && this.p2.y < ymax)) {
      return true;
    }
    return false;
  }

  overlapsHorizontal(another: Line): boolean {
    if (this.p1.y !== this.p2.y || another.p1.y !== another.p2.y) {
      return false;
    }
    if (this.p1.y !== another.p1.y) {
      return false;
    }
    let xmin: number = (this.p1.x > this.p2.x) ? this.p2.x : this.p1.x;
    let xmax: number = (this.p1.x < this.p2.x) ? this.p2.x : this.p1.x;
    if ((another.p1.x > xmin && another.p1.x < xmax) || (another.p2.x > xmin && another.p2.x < xmax)) {
      return true;
    }
    xmin = (another.p1.x > another.p2.x) ? another.p2.x : another.p1.x;
    xmax = (another.p1.x < another.p2.x) ? another.p2.x : another.p1.x;
    if ((this.p1.x > xmin && this.p1.x < xmax) || (this.p2.x > xmin && this.p2.x < xmax)) {
      return true;
    }
    return false;
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
