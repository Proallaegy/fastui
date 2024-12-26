import type sharp from "sharp";
import type { Alignment } from "../enums/Alignment";
import type { Color } from "sharp";
import type IFlexContainer from "./FlexContainer";
import type Element from "./Element";

export default interface IFastContainer {
  addContainers(containers: IFlexContainer[]): void;
  addElements(elements: Element[]): void;
  render(
    parentSharpContainer: sharp.Sharp,
    width: number,
    height: number
  ): Promise<sharp.Sharp>;
  containers: IFlexContainer[];
  elements: Element[];
  width: number;
  height: number;
  color: Color;
  align: Alignment;
  baseImage: sharp.Sharp;
}
