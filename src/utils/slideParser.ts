import { ParsedSlide } from "./slideTypes";

export interface ParserOptions {
  slideDelimiter?: string;
  titlePrefix?: string;
}

export class SlideParser {
  private options: ParserOptions;

  constructor(options: ParserOptions = {}) {
    this.options = {
      slideDelimiter: options.slideDelimiter || "---",
      titlePrefix: options.titlePrefix || "#",
    };
  }

  parse(input: string): ParsedSlide[] {
    const slides: ParsedSlide[] = [];
    const rawSlides = this.splitIntoSlides(input);

    for (const rawSlide of rawSlides) {
      const slide = this.parseSlide(rawSlide);
      if (
        slide.title ||
        slide.content.length > 0 ||
        slide.bullets ||
        slide.code
      ) {
        slides.push(slide);
      }
    }

    return slides;
  }

  private splitIntoSlides(input: string): string[] {
    // First try to split by Frame markers if they exist
    if (input.includes("**Frame")) {
      const framePattern = /\*\*Frame \d+:.*?\*\*/g;
      const frames = input.split(framePattern);
      return frames.map((s) => s.trim()).filter((s) => s.length > 0);
    }

    // Otherwise use the standard delimiter
    const slides = input.split(
      new RegExp(`^${this.escapeRegExp(this.options.slideDelimiter!)}$`, "gm"),
    );
    return slides.map((s) => s.trim()).filter((s) => s.length > 0);
  }

  private parseSlide(rawSlide: string): ParsedSlide {
    const lines = rawSlide.split("\n").map((l) => l.trim());
    const slide: ParsedSlide = {
      content: [],
    };

    let inCodeBlock = false;
    let codeContent: string[] = [];
    let codeLanguage = "";
    let inBulletList = false;
    let bullets: string[] = [];

    for (const line of lines) {
      // Skip asterisk-only lines from narration sections
      if (line === "*" || line.match(/^\*+$/)) {
        continue;
      }

      // Check for title - could be in **Title** format or # Title format
      if (!slide.title) {
        // Check for bold title format first
        const boldTitleMatch = line.match(/^\*\*(.+?)\*\*$/);
        if (boldTitleMatch) {
          slide.title = boldTitleMatch[1].trim();
          continue;
        }

        // Check for heading format
        if (line.startsWith("#")) {
          const titleMatch = line.match(/^#+\s*(.+)$/);
          if (titleMatch) {
            slide.title = titleMatch[1].trim();
            continue;
          }
        }
      }

      // Check for code block
      if (line.startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.slice(3).trim() || "text";
          codeContent = [];
        } else {
          inCodeBlock = false;
          slide.code = {
            language: codeLanguage,
            content: codeContent.join("\n"),
          };
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        continue;
      }

      // Check for bullet points (including numbered lists)
      if (line.match(/^[-*•]\s+.+/) || line.match(/^\d+\.\s+.+/)) {
        const bulletText = line
          .replace(/^[-*•]\s+/, "")
          .replace(/^\d+\.\s+/, "")
          .trim();
        if (bulletText) {
          if (!inBulletList) {
            inBulletList = true;
            bullets = [];
          }
          // Clean up any extra formatting like bold markers
          const cleanText = bulletText
            .replace(/\*\*/g, "")
            .replace(/\*(.+?)\*/g, "$1");
          bullets.push(cleanText);
        }
        continue;
      } else if (inBulletList && line.length === 0) {
        // Empty line ends bullet list
        slide.bullets = bullets;
        inBulletList = false;
        continue;
      } else if (inBulletList) {
        // Non-bullet line ends bullet list
        slide.bullets = bullets;
        inBulletList = false;
      }

      // Check for image reference
      if (line.match(/^!\[.*\]\(.*\)$/)) {
        const imageMatch = line.match(/^!\[.*\]\((.*)\)$/);
        if (imageMatch) {
          slide.image = imageMatch[1];
        }
        continue;
      }

      // Regular content (clean up formatting)
      if (line.length > 0) {
        // Remove Narration: prefix and clean up text
        let cleanLine = line
          .replace(/^\*?\s*Narration:\s*/i, "")
          .replace(/^\*?\s*Visuals?:\s*/i, "");
        // Remove bold formatting
        cleanLine = cleanLine.replace(/\*\*(.+?)\*\*/g, "$1");
        // Remove italic formatting
        cleanLine = cleanLine.replace(/\*(.+?)\*/g, "$1");
        if (cleanLine.length > 0 && !cleanLine.match(/^\*+$/)) {
          slide.content.push(cleanLine);
        }
      }
    }

    // Handle any remaining bullets
    if (inBulletList && bullets.length > 0) {
      slide.bullets = bullets;
    }

    return slide;
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}

// Helper function to parse markdown-style input
export function parseMarkdownToSlides(input: string): ParsedSlide[] {
  const parser = new SlideParser();
  return parser.parse(input);
}

// Helper function to parse simple text with slide numbers
export function parseNumberedSlides(input: string): ParsedSlide[] {
  const parser = new SlideParser({
    slideDelimiter: /^Slide \d+:/m.toString(),
  });

  // Pre-process to add delimiters
  const processed = input.replace(/^Slide \d+:/gm, "---\n$&");
  return parser.parse(processed);
}
