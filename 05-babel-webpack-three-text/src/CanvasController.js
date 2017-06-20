import * as THREE from 'three';

import TextureCreator from './TextureCreator';

export default class CanvasController {

  constructor(canvasId: string) {
    let element: ?HTMLElement = document.getElementById(canvasId);
    if (element == null) {
      throw new Error('Missing canvas element.');
    }
    if (element.getContext == null) {
      throw new Error('Not canvas element found.');
    }

    let canvas: HTMLCanvasElement = element;
    let renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true});
    renderer.setClearColor(new THREE.Color(0, 255, 255))

    let clientWidth: number = canvas.clientWidth;
    let clientHeight: number = canvas.clientHeight;
    let camera: THREE.Camera = new THREE.PerspectiveCamera(60, clientWidth / clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 20);
    
    let scene: THREE.Scene = new THREE.Scene();
    let directionalLight: THREE.Light = new THREE.DirectionalLight(0xFFFFFF);
    scene.add(directionalLight);

    let mesh: THREE.Mesh = TextureCreator.createTextureMesh('なるほど', 144);

    scene.add(mesh);
    renderer.render(scene, camera);

    scene.add(mesh);
    renderer.render(scene, camera);
  }
}