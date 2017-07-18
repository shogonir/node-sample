import * as THREE from 'three';

import Viewport from '../entity/Viewport';

import CanvasController from './CanvasController';

export default class CanvasManager {

  canvasController: CanvasController;

  renderedMeshUUIDs: Array<string>;

  constructor(canvasController: CanvasController) {
    this.canvasController = canvasController;
    this.renderedMeshUUIDs = [];
  }

  update(viewport: Viewport, pointMeshes: Array<THREE.Mesh>, lineMeshes: Array<THREE.Mesh>, pictureMeshes: Array<THREE.Vector3>) {
    let self: CanvasManager = this;
    pointMeshes.forEach((mesh: THREE.Mesh) => {
      if (self.renderedMeshUUIDs.includes(mesh.uuid)) {
        return;
      }
      self.canvasController.addPointMesh(mesh);
      self.renderedMeshUUIDs.push(mesh.uuid);
    });
    lineMeshes.forEach((mesh: THREE.Mesh) => {
      if (self.renderedMeshUUIDs.includes(mesh.uuid)) {
        return;
      }
      self.canvasController.addLineMesh(mesh);
      self.renderedMeshUUIDs.push(mesh.uuid);
    });
    pictureMeshes.forEach((mesh: THREE.Mesh) => {
      if (self.renderedMeshUUIDs.includes(mesh.uuid)) {
        return;
      }
      self.canvasController.addLineMesh(mesh);
      self.renderedMeshUUIDs.push(mesh.uuid);
    });

    this.canvasController.setCameraPosition(viewport.position);
    this.canvasController.flush();
  }

  positionToViewport(position: THREE.Vector3): THREE.Vector3 {
    return this.canvasController.positionToViewport(position);
  }
}