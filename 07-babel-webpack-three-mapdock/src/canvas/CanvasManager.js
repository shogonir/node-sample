import * as THREE from 'three';

import Viewport from '../entity/Viewport';

import CanvasController from './CanvasController';

export default class CanvasManager {

  canvasController: CanvasController;

  constructor(canvasController: CanvasController) {
    this.canvasController = canvasController;
  }

  update(viewport: Viewport) {
    this.canvasController.setCameraPosition(viewport.position);
    this.canvasController.flush();
  }
}