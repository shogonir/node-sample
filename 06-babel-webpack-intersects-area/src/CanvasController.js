import * as THREE from 'three';


export default class CanvasController {

  constructor(canvasId: string) {
    let element: ?HTMLElement = document.getElementById(canvasId);
    if (element == null) {
      throw new Error('Missing canvas element.');
    }
    if (element.getContext == null) {
      throw new Error('Not canvas element found.');
    }

    let canvas: HTMLCanvasElement = element;
    let context: CanvasRenderingContext2D = canvas.getContext('2d');

    let magnitude = (v) => {
      return Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));
    }

    let inner = (v1, v2) => {
      return v1.x * v2.x + v1.y * v2.y;
    };

    let outer = (v1, v2) => {
      return v1.x * v2.y - v1.y * v2.x;
    };

    let calcAngle = (p1, p2, p3) => {
      let v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
      let v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
      let radian = Math.acos(inner(v1, v2) / (magnitude(v1) * magnitude(v2)));
      if (outer(v1, v2) < 0) {
        return radian * 180 / Math.PI;
      }
      else {
        return (2 * Math.PI - radian) * 180 / Math.PI;
      }
    };

    let inTriangle = (p, p1, p2, p3) => {
      if (calcAngle(p1, p2, p) > calcAngle(p1, p2, p3)) {
        return false;
      }
      if (calcAngle(p2, p3, p) > calcAngle(p2, p3, p1)) {
        return false;
      }
      if (calcAngle(p3, p1, p) > calcAngle(p3, p1, p2)) {
        return false;
      }
      return true;
    };

    let p1 = { x: 50,  y: 20  };
    let p2 = { x: 250, y: 90  };
    let p3 = { x: 120, y: 140 };

    context.beginPath();
    context.moveTo(p1.x, p1.y);
    context.lineTo(p2.x, p2.y);
    context.lineTo(p3.x, p3.y);
    context.lineTo(p1.x, p1.y);
    context.stroke();
    context.closePath();

    for (let x = 0; x < 300; x += 5) {
      for (let y = 0; y < 150; y += 5) {
        if (inTriangle({ x, y }, p1, p2, p3)) {
          context.fillRect(x, y, 2, 2);
        }
      }
    }
  }
}