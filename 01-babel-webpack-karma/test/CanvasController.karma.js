import assert from 'assert';

import CanvasController from '../src/CanvasController';

describe('CanvasController', () => {
  describe('constructor', () => {
    it('no throw', () => {
      let canvas = document.createElement('canvas');
      canvas.id = 'canvas';
      document.body.appendChild(canvas);
      let canvasController = new CanvasController('canvas');
    });
  });
});
