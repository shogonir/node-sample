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

    let textureCreator: TextureCreator = new TextureCreator();
    // let imageData: ImageData = textureCreator.createTexture('hello', 144);
    let c = textureCreator.createTexture('なるほど', 144);

    let texture: THREE.Texture = new THREE.Texture(c);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.flipY = true;

    console.log(texture);

    let geometry: THREE.Geometry = new THREE.PlaneGeometry(30, 10);
    let material: THREE.Material = new THREE.MeshBasicMaterial({
      map: texture,
      alphaTest: 0.3,      
      side: THREE.DoubleSide
    });
    let mesh: THREE.Mesh = new THREE.Mesh(geometry, material);
    console.log(mesh);
    mesh.rotation.set(0, 20 * Math.PI / 180, 0);
    scene.add(mesh);
    renderer.render(scene, camera);

    /*
    let geometry = new THREE.CubeGeometry(3, 3, 3);
    let material = new THREE.MeshBasicMaterial({
      // size: 20,
      map: texture,
      // color: 0xFFFFFF,
      //blending: THREE.AdditiveBlending,
      //transparent: true,
      //side: THREE.DoubleSide,
    });
    let mesh = new THREE.Mesh(geometry, material);
    */

    scene.add(mesh);
    renderer.render(scene, camera);

    /*
    let geometry: THREE.Geometry = new THREE.CubeGeometry(2, 2, 2);
    let material: THREE.Material = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
    let cube: THREE.Mesh = new THREE.Mesh(geometry, material);
    scene.add(cube);
    */
    /*
    let fontLoader: THREE.FontLoader = new THREE.FontLoader();
    fontLoader.load(
      'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
      (font: THREE.Font) => {
        let geometry: THREE.Geometry = new THREE.TextGeometry('hello', {
          font: font,
          size: 4,
          height: 0
        });
        console.log(geometry);
        let material: THREE.Material = new THREE.MeshBasicMaterial({
          color: 0xFFFFFF,
          side: THREE.DoubleSide
        });
        let mesh: THREE.Mesh = new THREE.Mesh(geometry, material);
        console.log(mesh);
        scene.add(mesh);
        renderer.render(scene, camera);
        console.log('done');
      }
    );
    */

    // renderer.render(scene, camera);
  }
}