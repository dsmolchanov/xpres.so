import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;

export interface StructuredSlide {
  title: string;
  content?: string[];
  bullets?: string[];
  code?: {
    language: string;
    content: string;
  };
  notes?: string;
  visualDescription?: string;
}

export interface ParsedPresentation {
  slides: StructuredSlide[];
  theme?: string;
  title?: string;
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (API_KEY && API_KEY !== "your_api_key_here") {
      this.genAI = new GoogleGenerativeAI(API_KEY);
    }
  }

  isAvailable(): boolean {
    return this.genAI !== null;
  }

  async parseTextToSlides(text: string): Promise<ParsedPresentation> {
    if (!this.genAI) {
      throw new Error(
        "Gemini API key not configured. Please add VITE_GOOGLE_GEMINI_API_KEY to your .env file",
      );
    }

    try {
      // Use gemini-2.0-flash-exp with JSON mode
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const prompt = `Parse the following text into a structured presentation format.
Extract the main ideas and organize them into slides with clear titles and content.
If the text contains code snippets, preserve them with proper language identification.
If the text describes visual elements, add a visualDescription field.
For each slide, identify if the content should be:
- Regular content paragraphs
- Bullet points (for lists or key points)
- Code blocks (with language)
- Visual descriptions for generating diagrams

Text to parse:
${text}

Return a JSON object with this exact structure:
{
  "title": "Main presentation title if identifiable",
  "theme": "light or dark or colorful",
  "slides": [
    {
      "title": "Slide title",
      "content": ["array of content paragraphs"],
      "bullets": ["array of bullet points"],
      "code": {
        "language": "programming language",
        "content": "code content"
      },
      "notes": "speaker notes",
      "visualDescription": "description for visual elements"
    }
  ]
}

Make sure every slide has at least a title. Other fields are optional.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const jsonText = response.text();

      
      console.log("Gemini raw JSON response:", jsonText.substring(0, 500));
      console.log("Full Gemini response length:", jsonText.length);
      
      try {
        const parsed = JSON.parse(jsonText) as ParsedPresentation;

        console.log("Parsed AI response - first slide:", parsed.slides[0]);
        
        // Validate and clean the parsed data
        if (!parsed.slides || !Array.isArray(parsed.slides)) {
          throw new Error("Invalid response format: missing slides array");
        }

        // Ensure each slide has required fields
        parsed.slides = parsed.slides.map((slide) => ({
          title: slide.title || "Untitled Slide",
          content: slide.content || [],
          bullets: slide.bullets,
          code: slide.code,
          notes: slide.notes,
          visualDescription: slide.visualDescription,
        }));

        return parsed;
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", jsonText);
        throw new Error("Failed to parse AI response. Please try again.");
      }
    } catch (error) {
      console.error("Gemini API error:", error);

      // Fallback to basic parsing if AI fails
      return this.fallbackParse(text);
    }
  }

  private fallbackParse(text: string): ParsedPresentation {
    // Basic fallback parsing logic
    const lines = text.split("\n").filter((line) => line.trim());
    const slides: StructuredSlide[] = [];
    let currentSlide: StructuredSlide | null = null;

    for (const line of lines) {
      // Check for headers (potential slide titles)
      if (line.startsWith("#")) {
        if (currentSlide) {
          slides.push(currentSlide);
        }
        currentSlide = {
          title: line.replace(/^#+\s*/, "").trim(),
          content: [],
        };
      }
      // Check for bullet points
      else if (line.match(/^[-*•]\s/) || line.match(/^\d+\.\s/)) {
        if (currentSlide) {
          if (!currentSlide.bullets) {
            currentSlide.bullets = [];
          }
          currentSlide.bullets.push(
            line
              .replace(/^[-*•]\s/, "")
              .replace(/^\d+\.\s/, "")
              .trim(),
          );
        }
      }
      // Regular content
      else if (currentSlide && line.trim()) {
        if (!currentSlide.content) {
          currentSlide.content = [];
        }
        currentSlide.content.push(line.trim());
      }
    }

    if (currentSlide) {
      slides.push(currentSlide);
    }

    // If no slides were created, create one from the entire text
    if (slides.length === 0) {
      slides.push({
        title: "Content",
        content: text.split("\n").filter((line) => line.trim()),
      });
    }

    return { slides };
  }

  async enhanceSlideContent(slide: StructuredSlide): Promise<StructuredSlide> {
    if (!this.genAI) {
      return slide;
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
      });

      const prompt = `Enhance this presentation slide by adding more context or improving clarity:
Title: ${slide.title}
Content: ${slide.content?.join(" ")}
Bullets: ${slide.bullets?.join(", ")}

Provide a concise, improved version maintaining the same structure.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const enhancedText = response.text();

      // Parse the enhanced content back into the slide structure
      // This is simplified - you might want more sophisticated parsing
      return {
        ...slide,
        notes: enhancedText,
      };
    } catch (error) {
      console.error("Failed to enhance slide:", error);
      return slide;
    }
  }
}

export const geminiService = new GeminiService();
