import type { Color, Sharp } from "sharp";
import sharp from "sharp";
import { Alignment } from "../enums/Alignment";
import type Element from "../types/Element";
import type IFlexContainer from "../types/FlexContainer";
import positionComponent from "../utils/positionComponent";

export default class FlexContainer implements IFlexContainer {
  direction: "row" | "col";
  elements: Element[] = [];
  width: number;
  height: number;
  color: Color;
  baseImage: Sharp;
  align: Alignment;
  verticalSpacing: number;
  horizontalSpacing: number;
  padding: number;
  justifyItems: "start" | "center" | "end";
  alignItems: "start" | "center" | "end";
  private currentX: number = 0;
  private currentY: number = 0;

  constructor({
    direction,
    width,
    height,
    color,
    alignment,
    verticalSpacing,
    horizontalSpacing,
    padding,
    justifyItems,
    alignItems,
  }: {
    direction?: "row" | "col";
    width: number;
    height: number;
    color?: Color;
    alignment?: Alignment;
    verticalSpacing?: number;
    horizontalSpacing?: number;
    padding?: number;
    justifyItems?: "start" | "center" | "end";
    alignItems?: "start" | "center" | "end";
  }) {
    this.direction = direction || "row";
    this.width = width;
    this.height = height;
    this.color = color || "transparent";
    this.align = alignment || Alignment.TOP_LEFT;
    this.verticalSpacing = verticalSpacing || 0;
    this.horizontalSpacing = horizontalSpacing || 0;
    this.padding = padding || 0;
    this.justifyItems = justifyItems || "start";
    this.alignItems = alignItems || "start";
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

  add(elements: Element[]) {
    this.elements.push(...elements);
  }

  async render(
    parentSharpContainer: Sharp,
    width: number,
    height: number
  ): Promise<{ container: Buffer; top: number; left: number }> {
    try {
      const position = positionComponent(
        this.align,
        this.width,
        this.height,
        width,
        height
      );

      let baseImage = this.baseImage;
      const layers: sharp.OverlayOptions[] = [];

      if (this.elements.length && this.elements.length > 0) {
        for (const element of this.elements) {
          const elementResult = await element.render(
            baseImage,
            this.width,
            this.height
          );
          if (elementResult.element) {

            const totalColHeight = this.elements.reduce((acc, el, index) => {
              acc += el.height;
              if (index < this.elements.length - 1) {
                acc += this.verticalSpacing;
              }
              return acc;
            }, 0);

            const totalRowWidth = this.elements.reduce(
              (acc, el, index) =>
                acc +
                el.width +
                (index < this.elements.length - 1 ? this.horizontalSpacing : 0),
              0
            );

            let calculatedLeft = this.currentX + this.padding;
            let calculatedTop = this.currentY + this.padding;

            if (this.direction === "col") {
              if (this.alignItems === "center") {
                calculatedLeft = Math.floor((this.width - elementResult.width) / 2);
              } else if (this.alignItems === "end") {
                calculatedLeft = this.width - elementResult.width - this.padding;
              }

              if (this.justifyItems === "center") {
                const startingTop = Math.floor((this.height - totalColHeight) / 2);

                calculatedTop = startingTop + this.currentY + this.padding;
              } else if (this.justifyItems === "end") {
                calculatedTop = this.height - totalColHeight - this.padding;
              }

              layers.push({
                input: elementResult.element,
                top: calculatedTop,
                left: calculatedLeft,
              });

              this.currentY += elementResult.height + this.verticalSpacing;
            } else if (this.direction === "row") {
              if (this.alignItems === "center") {
                const startingLeft = Math.floor((this.width - totalRowWidth) / 2);

                calculatedLeft = startingLeft + this.currentX;
              } else if (this.alignItems === "end") {
                calculatedTop =
                  this.height - elementResult.height - this.padding;
              }

              if (this.justifyItems === "center") {
                if (this.elements.length > 1) {
                  console.log(
                    `[FASTUI] Cannot center a row container with more than 1 elements. Working on it`
                  );
                } else {
                  const startingLeft = Math.floor((this.width - totalRowWidth) / 2);

                  calculatedLeft = startingLeft + this.currentX;
                }
              } else if (this.justifyItems === "end") {
                calculatedLeft = this.width - totalRowWidth - this.padding;
              }

              layers.push({
                input: elementResult.element,
                top: calculatedTop,
                left: calculatedLeft,
              });

              this.currentX = elementResult.width + this.horizontalSpacing;
            }
          }
        }
      }

      baseImage.composite(layers);
      const resultBuffer = await baseImage.toFormat("webp").toBuffer();

      return {
        container: resultBuffer,
        top: position.top,
        left: position.left,
      };
    } catch (error) {
      throw error;
    }
  }
}
