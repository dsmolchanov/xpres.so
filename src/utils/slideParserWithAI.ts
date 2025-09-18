import { geminiService, StructuredSlide } from "./geminiService";
import { SlideParser } from "./slideParser";
import { ParsedSlide } from "./slideTypes";

export class AISlideParser extends SlideParser {
  private useAI: boolean;

  constructor(useAI: boolean = true) {
    super();
    this.useAI = useAI && geminiService.isAvailable();
  }

  async parseWithAI(input: string): Promise<ParsedSlide[]> {
    if (!this.useAI) {
      // Fallback to regular parsing
      return this.parse(input);
    }

    try {
      // Use Gemini to parse and structure the content
      const presentation = await geminiService.parseTextToSlides(input);

      console.log("AI Presentation parsed:", presentation);
      console.log("Number of slides from AI:", presentation.slides.length);
      if (presentation.slides.length > 0) {
        console.log("First slide from AI:", presentation.slides[0]);
      }

      // Convert from Gemini format to ParsedSlide format
      const convertedSlides = presentation.slides.map((slide) =>
        this.convertStructuredSlide(slide),
      );
      console.log("Converted slides:", convertedSlides);

      return convertedSlides;
    } catch (error) {
      console.error(
        "AI parsing failed, falling back to regular parsing:",
        error,
      );
      return this.parse(input);
    }
  }

  private convertStructuredSlide(slide: StructuredSlide): ParsedSlide {
    const converted = {
      title: slide.title,
      content: slide.content || [],
      bullets: slide.bullets,
      code: slide.code,
      notes: slide.notes,
      visualDescription: slide.visualDescription,
    };

    console.log("Converting slide:", {
      original: slide,
      converted: converted,
      contentLength: converted.content.length,
      bulletsLength: converted.bullets?.length,
    });

    return converted;
  }

  async enhanceSlides(slides: ParsedSlide[]): Promise<ParsedSlide[]> {
    if (!this.useAI) {
      return slides;
    }

    const enhancedSlides = await Promise.all(
      slides.map(async (slide) => {
        try {
          const structuredSlide: StructuredSlide = {
            title: slide.title || "Untitled",
            content: slide.content,
            bullets: slide.bullets,
            code: slide.code,
            notes: slide.notes,
            visualDescription: slide.visualDescription,
          };

          const enhanced =
            await geminiService.enhanceSlideContent(structuredSlide);
          return this.convertStructuredSlide(enhanced);
        } catch (error) {
          console.error("Failed to enhance slide:", error);
          return slide;
        }
      }),
    );

    return enhancedSlides;
  }
}

export async function parseTextWithAI(input: string): Promise<ParsedSlide[]> {
  const parser = new AISlideParser(true);
  return parser.parseWithAI(input);
}

export async function parseTextWithoutAI(
  input: string,
): Promise<ParsedSlide[]> {
  const parser = new AISlideParser(false);
  return parser.parseWithAI(input);
}
