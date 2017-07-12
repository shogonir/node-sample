import * as THREE from 'three';

import Viewport from '../entity/Viewport';

export default class MouseDragEventHandler {

  isEnable: boolean;
  isMouseDown: boolean;
  previousX: number;
  previousY: number;

  onMouseDown: (event: MouseEvent) => void;
  onMouseUp: (event: MouseEvent) => void;
  onMouseOut: (event: MouseEvent) => void;
  onMouseMove: (event: MouseEvent) => void;

  getViewport: () => Viewport;

  constructor() {
    this.isEnable = false;
    let self: MouseDragEventHandler = this;
    this.onMouseDown = (event: MouseEvent) => {
      self.isMouseDown = true;
      self.previousX = undefined;
      self.previousY = undefined;
    }
    this.onMouseUp = (event: MouseEvent) => {
      self.isMouseDown = false;
      self.previousX = undefined;
      self.previousY = undefined;
    }
    this.onMouseOut = (event: MouseEvent) => {
      self.isMouseDown = false;
      self.previousX = undefined;
      self.previousY = undefined;
    }
    this.onMouseMove = (event: MouseEvent) => {
      if (self.isMouseDown) {
        let viewport: Viewport = self.getViewport();
        let rect: ClientRect = viewport.canvas.getBoundingClientRect();        
        let nowX: number = (event.clientX - rect.left) / rect.width;
        let nowY: number = (event.clientY - rect.top) / rect.height;
        if (self.previousX != null && self.previousY != null) {
          let diffVector: THREE.Vector3 = new THREE.Vector3(self.previousX - nowX, nowY - self.previousY, 0);
          viewport.position.add(diffVector.multiplyScalar(10));
        }
        self.previousX = nowX;
        self.previousY = nowY;
      }
    }
  }

  enable() {
    if (this.isEnable) {
      return;
    }
    let canvas: HTMLCanvasElement = this.getViewport().canvas;
    canvas.addEventListener('mousedown', this.onMouseDown);
    canvas.addEventListener('mouseup', this.onMouseUp);
    canvas.addEventListener('mouseout', this.onMouseOut);
    canvas.addEventListener('mousemove', this.onMouseMove);
    this.isEnable = true;
  }

  disable() {
    if (!this.isEnable) {
      return;
    }
    let canvas: HTMLCanvasElement = this.getViewport().canvas;
    canvas.removeEventListener('mousedown', this.onMouseDown);
    canvas.removeEventListener('mouseup', this.onMouseUp);
    canvas.removeEventListener('mouseout', this.onMouseOut);
    canvas.removeEventListener('mousemove', this.onMouseMove);
    this.isEnable = false;
  }
}