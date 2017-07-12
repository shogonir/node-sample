import Viewport from '../entity/Viewport';

import CanvasManager from '../canvas/CanvasManager';

export default class Renderer {

  canvasManager: CanvasManager;

  constructor(canvasManager: CanvasManager) {
    this.canvasManager = canvasManager;
  }

  update(viewport: Viewport) {
    this.canvasManager.update(viewport);
  }
}