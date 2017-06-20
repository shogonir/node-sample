import * as THREE from 'three';

export default class TextureCreator {

  static createTextureMesh(message: string, fontSize: number): THREE.Mesh {
    let canvas: HTMLCanvasElement = TextureCreator.createTextureCanvas(message, fontSize);
    let texture: THREE.Texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;

    let geometry: THREE.Geometry = new THREE.PlaneGeometry(canvas.width / 20, canvas.height / 20);
    let material: THREE.Material = new THREE.MeshBasicMaterial({
      map: texture,
      alphaTest: 0.2,
      side: THREE.DoubleSide
    });
    let mesh: THREE.Mesh = new THREE.Mesh(geometry, material);
    return mesh;
  }

  static createTextureCanvas(message: string, fontSize: number): HTMLCanvasElement {
    let canvas: HTMLCanvasElement = document.createElement('canvas');
    let context: CanvasRenderingContext2D = canvas.getContext('2d');
    context.font = `${fontSize.toString()}px serif`;
    let metrix: TextMetrics = context.measureText(message);
    canvas.height = fontSize;
    canvas.width = metrix.width;

    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = 'black';
    context.font = `${fontSize.toString()}px serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(message, canvas.width / 2, canvas.height / 2, canvas.width);

    return canvas;
  }
}