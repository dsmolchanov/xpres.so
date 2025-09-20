import { ParsedSlide } from "./slideTypes";
import { xaiService } from "./xaiService";
import { SlideParser } from "./slideParser";

interface StructuredSlide {
  title?: string;
  content: string[];
  bullets?: string[];
  code?: {
    language: string;
    content: string;
  };
  notes?: string;
  visualDescription?: string;
}

class SlideParserWithXAI extends SlideParser {
  async parseWithXAI(input: string): Promise<ParsedSlide[]> {
    try {
      console.log("Parsing text with xAI Grok...");
      const presentation = await xaiService.parseTextToSlides(input);

      console.log("xAI response:", presentation);

      // Convert structured slides to ParsedSlide format
      return presentation.slides.map((slide) =>
        this.convertStructuredSlide(slide),
      );
    } catch (error) {
      console.error(
        "xAI parsing failed, falling back to traditional parsing:",
        error,
      );
      // Fallback to traditional markdown parsing - use the inherited parse method
      return this.parse(input);
    }
  }

  private convertStructuredSlide(slide: StructuredSlide): ParsedSlide {
    const parsed: ParsedSlide = {
      content: slide.content || [],
    };

    if (slide.title) {
      parsed.title = slide.title;
    }

    if (slide.bullets && slide.bullets.length > 0) {
      parsed.bullets = slide.bullets;
    }

    if (slide.code && slide.code.content) {
      parsed.code = {
        content: slide.code.content,
        language: slide.code.language || "javascript",
      };
    }

    if (slide.notes) {
      parsed.notes = slide.notes;
    }

    if (slide.visualDescription) {
      parsed.visualDescription = slide.visualDescription;
    }

    return parsed;
  }
}

const parserInstance = new SlideParserWithXAI();

export async function parseTextWithXAI(input: string): Promise<ParsedSlide[]> {
  return parserInstance.parseWithXAI(input);
}
