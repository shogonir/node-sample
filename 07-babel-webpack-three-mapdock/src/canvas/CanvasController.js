import * as THREE from 'three';

export default class CanvasController {

  canvas: HTMLCanvasElement;
  canvasWidth: number;
  canvasHeight: number;
  
  renderer: THREE.WebGLRenderer;
  camera: THREE.Camera;
  light: THREE.Light;

  scenes: Array<THREE.Scene>;
  baseScene: THREE.Scene;
  dockScene: THREE.Scene;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvasWidth = canvas.clientWidth;
    this.canvasHeight = canvas.clientHeight;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setClearColor(new THREE.Color(0.8, 0.8, 0.8));
    this.renderer.autoClear = false;

    this.camera = new THREE.PerspectiveCamera(45, this.canvasWidth / this.canvasHeight, 0.1, 1000);

    this.baseScene = new THREE.Scene();
    this.dockScene = new THREE.Scene();
    this.scenes = [
      this.baseScene,
      this.dockScene
    ];

    let grid: THREE.GridHelper = new THREE.GridHelper(12, 4);
    grid.rotation.set(Math.PI / 2, 0, 0);
    this.baseScene.add(grid);
    this.flush();
  }

  setCameraPosition(position: THREE.Vector3) {
    this.camera.position.set(position.x, position.y, position.z);
    this.flush();
    console.log(position);
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