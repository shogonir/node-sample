import * as THREE from 'three';

import Viewport from '../entity/Viewport';

import CanvasManager from '../canvas/CanvasManager';

export default class Renderer {

  canvasManager: CanvasManager;

  numPoints: number;
  pointMeshes: Array<THREE.Mesh>;
  lineMeshes: Array<THREE.Mesh>;
  pictureMeshes: Array<THREE.Mesh>;

  constructor(canvasManager: CanvasManager) {
    this.canvasManager = canvasManager;
    this.numPoints = 100;

    this.pointMeshes = [];
    this.lineMeshes = [];
    this.pictureMeshes = [];
    let side: number = 0.15;
    let lineWidth: number = 0.05;
    let maxDiff: number = 40;
    for (let i: number = 0; i < this.numPoints; i++) {
      let geometry: THREE.Geometry = new THREE.PlaneGeometry(side, side);
      let material: THREE.Material = new THREE.MeshBasicMaterial({ color: 0x000000 });
      let mesh: THREE.Mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(maxDiff * (Math.random() - 0.5), maxDiff * (Math.random() - 0.5), 0);
      this.pointMeshes.push(mesh);
    }
    for (let i: number = 0; i < this.numPoints; i++) {
      let geometry: THREE.Geometry = new THREE.PlaneGeometry(1, lineWidth);
      let material: THREE.Material = new THREE.MeshBasicMaterial({ color: 0x444444, opacity: 0.3, transparent: true });
      let mesh: THREE.Mesh = new THREE.Mesh(geometry, material);
      this.lineMeshes.push(mesh);
    }
    side = 0.5;
    for (let i: number = 0; i < this.numPoints; i++) {
      let geometry: THREE.Geometry = new THREE.PlaneGeometry(side, side);
      let material: THREE.Material = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
      let mesh: THREE.Mesh = new THREE.Mesh(geometry, material);
      this.pictureMeshes.push(mesh);
    }
  }

  update(viewport: Viewport) {
    this.updateLineMeshes(viewport);
    this.canvasManager.update(viewport, this.pointMeshes, this.lineMeshes, this.pictureMeshes);
  }

  updateLineMeshes(viewport: Viewport) {
    let self: Renderer = this;
    this.lineMeshes.forEach((mesh: THREE.Mesh, meshIndex: number) => {
      let viewportPos: THREE.Vector3 = self.canvasManager.positionToViewport(mesh.position);
      if (Math.abs(viewportPos.x) > 0.4 || Math.abs(viewportPos.y) > 0.4) {
        mesh.visible = false;
        self.pictureMeshes[meshIndex].visible = false;
        return;
      }
      let viewportPosition: THREE.Vector3 = viewport.position.clone();
      viewportPosition.z = 0;
      mesh.visible = true;
      self.pictureMeshes[meshIndex].visible = true;
      let pointMesh: THREE.Mesh = self.pointMeshes[meshIndex];
      let toPoint: THREE.Vector3 = pointMesh.position.clone().sub(viewportPosition);
      let toPicture: THREE.Vector3;
      if (Math.abs(toPoint.x) > Math.abs(toPoint.y)) {
        toPicture = toPoint.clone().multiplyScalar(3.5 / toPoint.x * (toPoint.x > 0 ? 1 : -1));
      } else {
        toPicture = toPoint.clone().multiplyScalar(3.5 / toPoint.y * (toPoint.y > 0 ? 1 : -1));
      }
      let picture: THREE.Vector3 = toPicture.clone().add(viewportPosition);
      self.pictureMeshes[meshIndex].position.set(picture.x, picture.y, picture.z);
      let toLine: TJREE.Vector3 = toPoint.clone().add(toPicture).multiplyScalar(0.5);
      let line: THREE.Vector3 = viewportPosition.clone().add(toLine);
      self.lineMeshes[meshIndex].position.set(line.x, line.y, line.z);
      self.lineMeshes[meshIndex].scale.set(toPicture.length() - toPoint.length(), 1, 1);
      self.lineMeshes[meshIndex].rotation.set(0, 0, Math.atan2(toPoint.y, toPoint.x));
      /*
      if (Math.random() < 0.001) {
        console.log(picture);
        console.log(pointMesh.position);
        console.log(line);
      }
      */
    });
  }
}