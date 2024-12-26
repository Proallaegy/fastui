import sharp from "sharp";
import type IFastContainer from "../types/FastContainer";

export default class FastUI {
  width: number;
  height: number;
  containers: IFastContainer[] = [];
  backgroundUrl?: string;
  backgroundTransparency?: number;
  private baseImage: sharp.Sharp;

  constructor({
    width,
    height,
    backgroundUrl,
    backgroundTransparency,
  }: {
    width: number;
    height: number;
    backgroundUrl?: string;
    backgroundTransparency?: number;
  }) {
    this.width = width;
    this.height = height;
    this.backgroundUrl = backgroundUrl;
    this.backgroundTransparency = backgroundTransparency;
    this.baseImage = sharp({
      create: {
        width: this.width,
        height: this.height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    }).toFormat("webp");
  }

  add(containers: IFastContainer[]) {
    this.containers.push(...containers);
  }

  async render(path: string): Promise<void> {
    try {
      let baseImage = this.baseImage;
      const layers: sharp.OverlayOptions[] = [];

      if (this.backgroundUrl) {
        const blackOverlay = await sharp({
          create: {
            width: this.width,
            height: this.height,
            channels: 4,
            background: {
              r: 255,
              g: 255,
              b: 255,
              alpha: this.backgroundTransparency,
            },
          },
        })
          .toFormat("webp")
          .toBuffer();

        const background = await sharp(this.backgroundUrl)
          .resize(this.width, this.height)
          .composite([{ input: blackOverlay, blend: "dest-in"  }])
          .toFormat("webp")
          .toBuffer();
        layers.push({
          input: background,
        });

        
      }

      if (this.containers && this.containers.length > 0) {
        for (const [i, container] of this.containers.entries()) {
          if (container.width > this.width || container.height > this.height) {
            throw Error(
              `Container cannot have width or height greater than ${this.width}x${this.height}`
            );
          }
          const buffer = await (
            await container.render(this.baseImage, this.width, this.height)
          )
            .toFormat("webp")
            .toBuffer();

          layers.push({
            input: buffer,
          });
        }
      }

      this.baseImage = baseImage.composite(layers);
      await this.baseImage.toFile(`${path}/render.webp`);
    } catch (error) {
      console.error(`Failed to render image: ${error}`);
      throw error;
    }
  }
}
