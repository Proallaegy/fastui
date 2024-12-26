import type { Color } from "sharp";
import type sharp from "sharp";
import type Element from "./Element";

export default interface IFlexContainer {
      add(elements: Element[]): void;
      render(
        parentSharpContainer: sharp.Sharp,
        width: number,
        height: number,
      ): Promise<{ container: Buffer, top: number, left: number }>;
      direction: "row" | "col";
      justifyItems: "start" | "center" | "end";
      alignItems: "start" | "center" | "end";
      elements: Element[];
      width: number;
      height: number;
      color: Color;
      baseImage: sharp.Sharp;
      verticalSpacing: number;
      horizontalSpacing: number;
      padding: number;
}