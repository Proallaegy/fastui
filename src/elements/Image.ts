import sharp from "sharp";
import type Element from "../types/Element";
import { makeImageBuffer } from "../utils/makeImageBuffer";
import type { Alignment } from "../enums/Alignment";
import type FastContainer from "../containers/FastContainer";
import positionComponent from "../utils/positionComponent";

export default class Image implements Element {
  private sharpImage?: sharp.Sharp;
  private src: string;
  width: number = 0;
  height: number = 0;
  top: number = 0;
  left: number = 0;
  circle: boolean;

  constructor({
    src,
    width,
    height,
    circle,
  }: {
    src: string;
    width?: number;
    height?: number;
    circle?: boolean;
  }) {
    this.src = src;
    this.width = width || 300;
    this.height = height || 300;
    this.circle = circle || false;
  }

  async init() {
    if (this.src.startsWith("https://") || this.src.startsWith("http://")) {
      const buffer = await makeImageBuffer(this.src);
      this.sharpImage = sharp(buffer);
    } else {
      this.sharpImage = sharp(this.src);
    }
  }

  private processImage(): sharp.Sharp {
    if (this.sharpImage === undefined) {
      throw Error("Please do await image.init() first");
    }
    let image = this.sharpImage;
    if (this.circle) {
      const circleMask = Buffer.from(
        `<svg><circle cx="${this.width / 2}" cy="${this.height / 2}" r="${
          Math.min(this.width, this.height) / 2
        }" /></svg>`
      );

      image = image.resize(this.width, this.height).composite([
        {
          input: circleMask,
          blend: "dest-in",
        },
      ]);
    } else {
      image = image.resize(this.width, this.height);
    }

    return image;
  }

  align(alignment: Alignment, canvas: FastContainer) {
    const { top, left } = positionComponent(alignment, this.width, this.height, canvas.width, canvas.height);

    this.top = top;
    this.left = left;
  }

  async render(
    baseImage: sharp.Sharp,
    canvasWidth: number,
    canvasHeight: number
  ): Promise<{
    element: Buffer;
    top: number;
    left: number;
    width: number;
    height: number;
  }> {
    try {
      if (this.width > canvasWidth || this.height > canvasHeight) {
        throw new Error(
          `Image is too big for the canvas. Image dimensions: ${this.width}x${this.height}, Canvas dimensions: ${canvasWidth}x${canvasHeight}`
        );
      }

      const processedImage = this.processImage();
      if (!processedImage || typeof processedImage.toBuffer !== "function") {
        throw new Error(
          "Failed to process the image. Ensure processImage() returns a sharp instance."
        );
      }

      const processedBuffer = await processedImage.toBuffer();

      return {
        element: processedBuffer,
        top: this.top,
        left: this.left,
        width: this.width,
        height: this.height,
      };
    } catch (error) {
      console.error(`Failed to render image`);
      throw error;
    }
  }
}
