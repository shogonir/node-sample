// @flow

export default class Point {

  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  equals(another: Point): boolean {
    return this.x === another.x && this.y === another.y;
  }
}
