import * as THREE from 'three';

import Viewport from '../entity/Viewport';

export default class CanvasController {

  static FOV: number = 45;

  canvas: HTMLCanvasElement;
  canvasWidth: number;
  canvasHeight: number;
  
  renderer: THREE.WebGLRenderer;
  camera: THREE.Camera;
  light: THREE.Light;

  scenes: Array<THREE.Scene>;
  baseScene: THREE.Scene;
  pointsScene: THREE.Scene;
  linesScene: THREE.Scene;

  constructor(canvas: HTMLCanvasElement, viewport: Viewport) {
    this.canvas = canvas;
    this.canvasWidth = canvas.clientWidth;
    this.canvasHeight = canvas.clientHeight;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setClearColor(new THREE.Color(0.8, 0.8, 0.8));
    this.renderer.autoClear = false;

    this.camera = new THREE.PerspectiveCamera(CanvasController.FOV, this.canvasWidth / this.canvasHeight, 0.1, 1000);
    this.camera.position.add(viewport.position);

    this.baseScene = new THREE.Scene();
    this.linesScene = new THREE.Scene();
    this.pointsScene = new THREE.Scene();
    this.scenes = [
      this.baseScene,
      this.pointsScene,
      this.linesScene      
    ];

    let grid: THREE.GridHelper = new THREE.GridHelper(12, 4);
    grid.rotation.set(Math.PI / 2, 0, 0);
    this.baseScene.add(grid);
    this.flush();
  }

  viewportHeight(): number {
    let fovRadian: number = CanvasController.FOV * Math.PI / 180;
    return 2 * this.camera.position.z * Math.tan(fovRadian / 2);
  }

  viewportWidth(): number {
    return this.viewportHeight() / this.canvasHeight * this.canvasWidth;
  }

  viewportToPosition(x: number, y: number): THREE.Vector3 {
    let xValue: number = x * this.viewportWidth() + this.camera.position.x;
    let yValue: number = y * this.viewportHeight() + this.camera.position.y;
    return new THREE.Vector3(xValue, yValue, 0);
  }

  positionToViewport(position: THREE.Vector3): THREE.Vector3 {
    let cameraPosZ0: THREE.Vector3 = this.camera.position.clone();
    cameraPosZ0.z = 0;
    let vector: THREE.Vector3 = position.clone().sub(cameraPosZ0);
    vector.z = 0;
    return new THREE.Vector3(vector.x / this.viewportWidth(), vector.y / this.viewportHeight(), 0);
  }

  setCameraPosition(position: THREE.Vector3) {
    this.camera.position.set(position.x, position.y, position.z);
    this.flush();
  }

  addMesh(mesh: THREE.Mesh, scene: THREE.Scene) {
    scene.add(mesh);
  }

  removeMesh(mesh: THREE.Mesh, scene: THREE.Scene) {
    if (mesh == null) {
      return;
    }
    if (mesh.material) {
      mesh.material.dispose();
    }
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    scene.remove(mesh);
  }

  addPointMesh(mesh: THREE.Mesh) {
    this.addMesh(mesh, this.pointsScene);
  }

  removePointMesh(mesh: THREE.Mesh) {
    this.removeMesh(mesh, this.pointsScene);
  }

  addLineMesh(mesh: THREE.Mesh) {
    this.addMesh(mesh, this.linesScene);
  }

  removeLineMesh(mesh: THREE.Mesh) {
    this.removeMesh(mesh, this.linesScene);
  }

  flush() {
    this.renderer.clear();
    let self: CanvasController = this;
    this.scenes.forEach((scene: THREE.Scene) => {
      self.renderer.clearDepth();
      self.renderer.render(scene, self.camera);
    });
  }
}