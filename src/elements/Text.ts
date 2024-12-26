import sharp from "sharp";
import { Fonts } from "../enums/Fonts";
import type Element from "../types/Element";
import type { Alignment } from "../enums/Alignment";
import type FastContainer from "../containers/FastContainer";
import positionComponent from "../utils/positionComponent";

const fontMetrics: Record<
  string,
  { widthMultiplier: number; heightMultiplier: number }
> = {
  Arial: { widthMultiplier: 0.5, heightMultiplier: 1.2 },
  Verdana: { widthMultiplier: 0.52, heightMultiplier: 1.15 },
  Helvetica: { widthMultiplier: 0.48, heightMultiplier: 1.2 },
  "Times New Roman": { widthMultiplier: 0.55, heightMultiplier: 1.25 },
  "Courier New": { widthMultiplier: 0.6, heightMultiplier: 1.1 },
  Georgia: { widthMultiplier: 0.54, heightMultiplier: 1.3 },
  Tahoma: { widthMultiplier: 0.51, heightMultiplier: 1.15 },
};

export default class Text implements Element {
  private text: string;
  private style: Record<string, any>;
  private sharpObject: sharp.Sharp;
  width: number;
  height: number;
  top: number = 0;
  left: number = 0;
  fontSize?: number | undefined;

  constructor({
    text,
    fontSize,
    color,
    fontFamily,
    bold,
  }: {
    text: string;
    fontSize?: number;
    color?: string;
    fontFamily?: Fonts;
    bold?: boolean;
  }) {
    this.text = text;
    this.style = {
      fontSize: fontSize || 40,
      color: color || "white",
      fontFamily: fontFamily || Fonts.Arial,
      bold: bold || false,
    };
    this.fontSize = fontSize;
    const defaultMetrics = { widthMultiplier: 0.5, heightMultiplier: 1.2 };
    const metrics = fontMetrics[this.style.fontFamily] || defaultMetrics;
    this.width = this.text.length * this.style.fontSize * metrics.widthMultiplier;
    this.height = this.style.fontSize * metrics.heightMultiplier;
    
    const svg = generateSvg({
      width: this.width,
      height: this.height,
      style: this.style,
      text: this.text,
    });
    const svgBuffer = Buffer.from(svg);
    this.sharpObject = sharp(svgBuffer);
  }

  align(alignment: Alignment, canvas: FastContainer) {
    const { top, left } = positionComponent(
      alignment,
      this.width,
      this.height,
      canvas.width,
      canvas.height
    );

    this.top = top;
    this.left = left;
  }

  async render(
    baseImage: sharp.Sharp,
    width: number,
    height: number
  ): Promise<{
    element: Buffer;
    top: number;
    left: number;
    width: number;
    height: number;
  }> {
    const buffer = await this.sharpObject.toBuffer();

    return {
      element: buffer,
      top: this.top,
      left: this.left,
      width: this.width,
      height: this.height,
    };
  }
}

function generateSvg({
  width,
  height,
  style,
  text,
}: {
  width: number;
  height: number;
  style: Record<string, any>;
  text: string;
}) {
  const fontSize = style.fontSize || 40;
  const fontWeight = style.bold ? "bold" : "normal";

  const svgText = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <text x="0" y="${fontSize}" font-weight="${fontWeight}" font-family="${style.fontFamily}" font-size="${fontSize}" fill="${style.color}">
      ${text}
    </text>
  </svg>
  `;

  return svgText;
}

