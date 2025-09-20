import { ParsedSlide } from "./slideTypes";
import { ColorPalette, getDefaultPalette } from "./colorPalettes";

export interface ExcalidrawElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: string;
  strokeWidth: number;
  strokeStyle: string;
  roughness: number;
  opacity: number;
  text?: string;
  fontSize?: number;
  fontFamily?: number;
  textAlign?: string;
  verticalAlign?: string;
  baseline?: number;
  containerId?: string | null;
  originalText?: string;
  lineHeight?: number;
  frameId?: string | null;
  roundness?: any;
  seed: number;
  version: number;
  versionNonce: number;
  isDeleted: boolean;
  groupIds: string[];
  boundElements: any[] | null;
  updated: number;
  link?: string | null;
  locked: boolean;
  name?: string;
}

export interface GeneratorOptions {
  slideWidth?: number;
  slideHeight?: number;
  slideSpacing?: number;
  gridCols?: number;
  titleFontSize?: number;
  contentFontSize?: number;
  bulletFontSize?: number;
  codeFontSize?: number;
  fontFamily?: number;
  theme?: "light" | "dark";
  colorPalette?: ColorPalette;
}

const DEFAULT_OPTIONS: GeneratorOptions = {
  slideWidth: 1200,
  slideHeight: 800,
  slideSpacing: 200,
  gridCols: 5,
  titleFontSize: 48,
  contentFontSize: 32,
  bulletFontSize: 28,
  codeFontSize: 24,
  fontFamily: 1,
  theme: "light",
  colorPalette: getDefaultPalette(),
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function createFrame(
  x: number,
  y: number,
  width: number,
  height: number,
  name: string,
  palette: ColorPalette,
): ExcalidrawElement {
  return {
    id: generateId(),
    type: "frame",
    x,
    y,
    width,
    height,
    angle: 0,
    strokeColor: palette.border,
    backgroundColor: palette.background,
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    seed: Math.floor(Math.random() * 1000000),
    version: 1,
    versionNonce: Math.floor(Math.random() * 1000000),
    isDeleted: false,
    frameId: null,
    name,
    groupIds: [],
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
  };
}

function wrapText(text: string, maxCharsPerLine: number = 60): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxCharsPerLine) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}

function createTextElement(
  x: number,
  y: number,
  text: string,
  fontSize: number,
  fontFamily: number,
  frameId: string | null,
  color: string,
): ExcalidrawElement[] {
  const lines = wrapText(text);
  const lineHeight = fontSize * 1.5;

  return lines.map((line, index) => ({
    id: generateId(),
    type: "text",
    x,
    y: y + index * lineHeight,
    width: line.length * (fontSize * 0.6),
    height: fontSize * 1.25,
    angle: 0,
    strokeColor: color,
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    text: line,
    fontSize,
    fontFamily,
    textAlign: "left",
    verticalAlign: "top",
    baseline: fontSize,
    containerId: null,
    originalText: line,
    lineHeight: 1.25,
    frameId,
    seed: Math.floor(Math.random() * 1000000),
    version: 1,
    versionNonce: Math.floor(Math.random() * 1000000),
    isDeleted: false,
    groupIds: [],
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
  }));
}

export function generateExcalidrawSlides(
  slides: ParsedSlide[],
  options: GeneratorOptions = {},
): ExcalidrawElement[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const palette = opts.colorPalette || getDefaultPalette();
  const elements: ExcalidrawElement[] = [];
  let currentX = 0;
  let currentY = 0;
  let col = 0;

  slides.forEach((slide, slideIndex) => {
    const frameId = generateId();
    const slideName = slide.title || `Slide ${slideIndex + 1}`;

    const frame = createFrame(
      currentX,
      currentY,
      opts.slideWidth!,
      opts.slideHeight!,
      slideName,
      palette,
    );
    frame.id = frameId;
    elements.push(frame);

    let contentY = currentY + 100;

    if (slide.title) {
      const titleElements = createTextElement(
        currentX + 50,
        contentY,
        slide.title,
        opts.titleFontSize!,
        opts.fontFamily!,
        frameId,
        palette.primary,
      );
      elements.push(...titleElements);
      contentY += opts.titleFontSize! * 2;
    }

    if (slide.bullets && slide.bullets.length > 0) {
      slide.bullets.forEach((bullet) => {
        const bulletElements = createTextElement(
          currentX + 80,
          contentY,
          `• ${bullet}`,
          opts.bulletFontSize!,
          opts.fontFamily!,
          frameId,
          palette.accent,
        );
        elements.push(...bulletElements);
        contentY += bulletElements.length * (opts.bulletFontSize! * 1.5) + 10;
      });
    } else if (slide.content && slide.content.length > 0) {
      slide.content.forEach((line) => {
        const contentElements = createTextElement(
          currentX + 50,
          contentY,
          line,
          opts.contentFontSize!,
          opts.fontFamily!,
          frameId,
          palette.secondary,
        );
        elements.push(...contentElements);
        contentY += contentElements.length * (opts.contentFontSize! * 1.5) + 10;
      });
    }

    if (slide.code && slide.code.content) {
      const codeElements = createTextElement(
        currentX + 80,
        contentY,
        slide.code.content,
        opts.codeFontSize!,
        3,
        frameId,
        palette.codeText,
      );
      elements.push(...codeElements);
      contentY += codeElements.length * (opts.codeFontSize! * 1.5) + 20;
    }

    if (slide.notes) {
      contentY += 20;
      const notesElements = createTextElement(
        currentX + 50,
        contentY,
        `Notes: ${slide.notes}`,
        opts.contentFontSize! * 0.75,
        opts.fontFamily!,
        frameId,
        palette.secondary,
      );
      elements.push(...notesElements);
    }

    col++;
    if (col >= opts.gridCols!) {
      col = 0;
      currentX = 0;
      currentY += opts.slideHeight! + opts.slideSpacing!;
    } else {
      currentX += opts.slideWidth! + opts.slideSpacing!;
    }
  });

  return elements;
}

export function generateExcalidrawPresentation(
  slides: ParsedSlide[],
  options: GeneratorOptions = {},
): { elements: ExcalidrawElement[]; appState: any } {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const palette = opts.colorPalette || getDefaultPalette();
  const elements = generateExcalidrawSlides(slides, options);

  return {
    elements,
    appState: {
      viewBackgroundColor: palette.background,
      currentItemStrokeColor: palette.primary,
      currentItemBackgroundColor: "transparent",
      currentItemFillStyle: "solid",
      currentItemStrokeWidth: 2,
      currentItemStrokeStyle: "solid",
      currentItemRoughness: 1,
      currentItemOpacity: 100,
      currentItemFontFamily: 1,
      currentItemFontSize: 20,
      currentItemTextAlign: "left",
      currentItemStartArrowhead: null,
      currentItemEndArrowhead: "arrow",
      scrollX: 0,
      scrollY: 0,
      zoom: {
        value: 0.5,
      },
      gridSize: null,
    },
  };
}
