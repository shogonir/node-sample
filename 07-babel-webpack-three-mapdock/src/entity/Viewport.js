import * as THREE from 'three';

export default class Viewport {

  canvas: HTMLCanvasElement;
  canvasWidth: number;
  canvasHeight: number;

  position: THREE.Vector3;

  constructor(canvas: HTMLCanvasElement, position: THREE.Vector3) {
    this.canvas = canvas;
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    this.position = position.clone();
  }
}