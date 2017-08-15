// @flow

export default class Point {

  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  clone(): Point {
    return new Point(this.x, this.y);
  }

  equals(another: Point): boolean {
    return this.x === another.x && this.y === another.y;
  }

  add(another: Point): Point {
    return new Point(this.x + another.x, this.y + another.y);
  }

  sub(another: Point): Point {
    return new Point(this.x - another.x, this.y - another.y);
  }

  inner(another: Point): number {
    return (this.x * another.x) + (this.y * another.y);
  }

  outer(another: Point): number {
    return (this.x * another.y) - (this.y * another.x);
  }

  magnitude(): number {
    return (this.x ** 2 + this.y ** 2) ** 0.5;
  }

  scalar(value: number): Point {
    return new Point(this.x * value, this.y * value);
  }
}
