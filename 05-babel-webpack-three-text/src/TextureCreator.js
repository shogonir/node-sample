export default class TextureCreator {

  canvas: HTMLCanvasElement;

  constructor() {
    this.canvas = document.createElement('canvas');
    document.body.appendChild(this.canvas);
  }

  createTexture(message: string, fontSize: number): ImageData {
    let context: CanvasRenderingContext2D = this.canvas.getContext('2d');
    context.font = `${fontSize.toString()}px serif`;
    let metrix: TextMetrics = context.measureText(message);
    this.canvas.height = fontSize;
    this.canvas.width = metrix.width;

    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    context.fillStyle = 'black';
    context.font = `${fontSize.toString()}px serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(message, this.canvas.width / 2, this.canvas.height / 2, this.canvas.width);

    let imageData: ImageData = context.createImageData(this.canvas.width, this.canvas.height);

    context.putImageData(imageData, this.canvas.width, this.canvas.height);

    return context.canvas;
  }
}