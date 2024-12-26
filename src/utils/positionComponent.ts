import { Alignment } from "../enums/Alignment";

export default function positionComponent(
  alignment: Alignment,
  width: number,
  height: number,
  parentWidth: number,
  parentHeight: number
) {
  switch (alignment) {
    case Alignment.TOP_LEFT:
      return {
        top: 0,
        left: 0,
      };

    case Alignment.TOP_CENTER:
      return {
        top: 0,
        left: Math.floor((parentWidth - width) / 2),
      };

    case Alignment.TOP_RIGHT:
      return {
        top: 0,
        left: parentWidth - width,
      };

    case Alignment.LEFT:
      return {
        top: Math.floor((parentHeight - height) / 2),
        left: 0,
      };

    case Alignment.CENTER:
      return {
        top: Math.floor((parentHeight - height) / 2),
        left: Math.floor((parentWidth - width) / 2),
      };

    case Alignment.RIGHT:
      return {
        top: Math.floor((parentHeight - height) / 2),
        left: parentWidth - width,
      };

    case Alignment.BOTTOM_LEFT:
      return {
        top: parentHeight - height,
        left: 0,
      };

    case Alignment.BOTTOM_CENTER:
      return {
        top: parentHeight - height,
        left: Math.floor((parentWidth - width) / 2),
      };

    case Alignment.BOTTOM_RIGHT:
      return {
        top: parentHeight - height,
        left: parentWidth - width,
      };
  }
}
