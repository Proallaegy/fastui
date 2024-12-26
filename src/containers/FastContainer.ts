import sharp, { type Color } from "sharp";
import { Alignment } from "../enums/Alignment";
import type IFastContainer from "../types/FastContainer";
import type IFlexContainer from "../types/FlexContainer";
import positionComponent from "../utils/positionComponent";
import type Element from "../types/Element";

export default class FastContainer implements IFastContainer {
  containers: IFlexContainer[] = [];
  elements: Element[] = [];
  color: Color = "transparent";
  align: Alignment = Alignment.TOP_LEFT;
  width: number;
  height: number;
  baseImage: sharp.Sharp;

  constructor({
    color,
    align,
    width,
    height,
  }: {
    color?: Color;
    align?: Alignment;
    width: number;
    height: number;
    spacing?: number;
  }) {
    this.color = color || "transparent";
    this.align = align || Alignment.TOP_LEFT;
    this.width = width;
    this.height = height;
    this.baseImage = sharp({
      create: {
        width: this.width,
        height: this.height,
        channels: 4,
        background:
          this.color === "transparent"
            ? { r: 0, g: 0, b: 0, alpha: 0 }
            : this.color,
      },
    }).toFormat("webp");
  }

  addContainers(containers: IFlexContainer[]) {
    this.containers.push(...containers);
  }

  addElements(elements: Element[]) {
    this.elements.push(...elements);
  }

  async render(
    parentSharpContainer: sharp.Sharp,
    width: number,
    height: number
  ): Promise<sharp.Sharp> {
    const position = positionComponent(
      this.align,
      this.width,
      this.height,
      width,
      height
    );

    try {
      let baseImage = this.baseImage;
      const layers: sharp.OverlayOptions[] = [];

      if (this.elements && this.elements.length > 0) {
        for (const element of this.elements) {
          const elementResult = await element.render(
            baseImage,
            this.width,
            this.height
          );
          if (elementResult) {
            layers.push({
              input: elementResult.element,
              top: elementResult.top,
              left: element.left,
            });
          }
        }
      }

      if (this.containers && this.containers.length > 0) {
        for (const [i, container] of this.containers.entries()) {
          if (container.width > this.width || container.height > this.height) {
            throw Error(`Container cannot have width or height greater than ${this.width}x${this.height}`);
          }
          const containerResult = await container.render(
            baseImage,
            this.width,
            this.height
          );
          if (containerResult) {
            layers.push({
              input: containerResult.container,
              top: containerResult.top,
              left: containerResult.left,
            });
          }
        }
      }

      this.baseImage = baseImage.composite(layers);
      const resultBuffer = await this.baseImage.toFormat("webp").toBuffer();

      return parentSharpContainer.composite([
        {
          input: resultBuffer,
          left: position.left,
          top: position.top,
        },
      ]);
    } catch (error) {
      if(error instanceof Error && error.message.startsWith('Image to composite must have same dimensions or smaller')) {
        throw Error(`Container elements/containers cannot have width or height greater than ${this.width}x${this.height}`);
      } else {
        throw error;
      }
    }
  }
}
