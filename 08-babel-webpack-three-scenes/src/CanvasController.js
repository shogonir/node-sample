// @flow

import * as THREE from 'three';

export default class CanvasController {

  canvas: HTMLCanvasElement;
  canvasWidth: number;
  canvasHeight: number;

  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  frameCount: number;

  enemyScene: THREE.Scene;
  wallScene: THREE.Scene;
  scenes: Array<THREE.Scene>;

  constructor(canvasId: string) {
    let mayBeCanvas: ?HTMLCanvasElement = document.getElementById(canvasId);
    if (mayBeCanvas == null || mayBeCanvas.getContext == null) {
      throw new Errpr('not canvas');
    }
    this.canvas = mayBeCanvas;
    this.canvasWidth = this.canvas.clientWidth;
    this.canvasHeight = this.canvas.clientHeight;

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.setClearColor(0x000000);
    this.renderer.autoClear = false;

    this.camera = new THREE.PerspectiveCamera(45, this.canvasWidth / this.canvasHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 10);
    this.frameCount = 0;

    this.enemyScene = new THREE.Scene();
    this.wallScene = new THREE.Scene();
    this.scenes = [
      this.enemyScene,
      this.wallScene
    ];

    let cubeGeometry: THREE.Geometry = new THREE.CubeGeometry(2, 2, 2);
    let cubeMaterial: THREE.Material = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
    let cube: THREE.Mesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
    this.enemyScene.add(cube);

    let wallGeometry: THREE.Geometry = new THREE.PlaneGeometry(2, 2);
    let wallMaterial: THREE.Material = new THREE.MeshBasicMaterial({ color: 0x0000FF });
    let wall: THREE.Mesh = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(-1, 0, 2);
    this.wallScene.add(wall);

    requestAnimationFrame(this.update.bind(this));
  }

  update() {
    this.frameCount++;
    if (this.frameCount % 60 === 0) {
      this.scenes = [
        this.wallScene,
        this.enemyScene
      ];
    }
    else if (this.frameCount % 30 === 0) {
      this.scenes = [
        this.enemyScene,
        this.wallScene
      ];
    }

    this.renderer.clear();

    let self: CanvasController = this;
    this.scenes.forEach((scene: THREE.Scene) => {
      self.renderer.clearDepth();
      self.renderer.render(scene, self.camera);
    });

    requestAnimationFrame(this.update.bind(this));
  }
}
