import type sharp from "sharp";

export default interface Element {
  render(
    baseImage: sharp.Sharp,
    width: number,
    height: number
  ): Promise<{
    element: Buffer;
    top: number;
    left: number;
    width: number;
    height: number;
  }>;
  width: number;
  height: number;
  top: number;
  left: number;
}
