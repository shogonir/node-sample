import * as THREE from 'three';

export default class CanvasController {
  
  constructor(canvasId) {
    let canvas = document.getElementById(canvasId);
    let renderer = new THREE.WebGLRenderer({canvas});
  }
}

