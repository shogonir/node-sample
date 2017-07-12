import * as THREE from 'three';

import Viewport from './entity/Viewport';

import CanvasController from './canvas/CanvasController';
import CanvasManager from './canvas/CanvasManager';

import MouseDragEventHandler from './event/MouseDragEventHandler';
import Renderer from './renderer/Renderer';

export default class MapDock {

  isUpdating: boolean;
  viewport: Viewport;

  mouseDragEventHandler: MouseDragEventHandler;
  renderer: Renderer;

  constructor() {
    this.isUpdating = false;
  }

  initialize(canvasId: string): Promise {
    let self: MapDock = this;
    return new Promise((resolve, reject) => {
      let element: ?HTMLElement = document.getElementById(canvasId);
      if (element == null || element.getContext == null) {
        reject(new Error('NOT_FOUND or NOT_CANVAS'));
      }

      let canvas: HTMLCanvasElement = (((element): any): HTMLCanvasElement);
      self.viewport = new Viewport(canvas, new THREE.Vector3(0, 0, 10));

      let canvasController: CanvasController = new CanvasController(canvas);
      let canvasManager: CanvasManager = new CanvasManager(canvasController);

      self.mouseDragEventHandler = new MouseDragEventHandler();
      self.mouseDragEventHandler.getViewport = () => self.viewport;
      self.mouseDragEventHandler.enable();

      self.renderer = new Renderer(canvasManager);
      requestAnimationFrame(self.update.bind(self));
      resolve();
    });
  }

  update() {
    if (!this.isUpdating) {
      this.isUpdating = true;
      this.renderer.update(this.viewport);
      this.isUpdating = false;
    }
    requestAnimationFrame(this.update.bind(this));
  }
}
