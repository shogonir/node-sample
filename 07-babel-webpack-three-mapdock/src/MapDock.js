import * as THREE from 'three';

import Viewport from './entity/Viewport';

import MouseDragEventHandler from './event/MouseDragEventHandler';

export default class MapDock {

  viewport: Viewport;

  mouseDragEventHandler: MouseDragEventHandler;

  initialize(canvasId: string): Promise {
    let self: MapDock = this;
    return new Promise((resolve, reject) => {
      let element: ?HTMLElement = document.getElementById(canvasId);
      if (element == null || element.getContext == null) {
        reject(new Error('NOT_FOUND or NOT_CANVAS'));
      }

      let canvas: HTMLCanvasElement = (((element): any): HTMLCanvasElement);
      self.viewport = new Viewport(canvas, new THREE.Vector3(0, 0, 10));

      self.mouseDragEventHandler = new MouseDragEventHandler();
      self.mouseDragEventHandler.getViewport = () => self.viewport;
      self.mouseDragEventHandler.enable();
      resolve();
    });
  }
}
