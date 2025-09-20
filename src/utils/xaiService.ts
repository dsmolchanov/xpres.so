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

interface StructuredPresentation {
  title: string;
  description?: string;
  slides: StructuredSlide[];
}

class XAIService {
  private apiKey: string | null;
  private baseUrl = "https://api.x.ai";

  constructor() {
    this.apiKey = import.meta.env.VITE_XAI_API_KEY || null;
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async parseTextToSlides(input: string): Promise<StructuredPresentation> {
    if (!this.apiKey) {
      throw new Error("xAI API key not configured");
    }

    const prompt = `You are a presentation expert. Convert the following text into a structured presentation with multiple slides.

IMPORTANT: You must respond with ONLY a valid JSON object (no markdown, no explanation) in this exact format:

{
  "title": "Presentation Title",
  "description": "Brief description",
  "slides": [
    {
      "title": "Slide Title",
      "content": ["Main content line 1", "Main content line 2"],
      "bullets": ["Bullet point 1", "Bullet point 2"],
      "code": {
        "language": "javascript",
        "content": "code here"
      },
      "notes": "Speaker notes",
      "visualDescription": "Description of visual elements"
    }
  ]
}

Rules:
1. Create logical slide divisions (aim for 5-15 slides)
2. Each slide should have a clear focus
3. Use bullets for lists
4. Include code blocks where relevant
5. Add speaker notes for complex topics
6. Keep content concise and impactful
7. Ensure the JSON is valid and parseable

Text to convert:
${input}`;

    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4-fast-reasoning",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that creates structured presentations. Always respond with valid JSON only, no markdown formatting.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
          stream: false,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("xAI API error:", error);
        throw new Error(`xAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      console.log("xAI raw response:", content);

      // Try to parse the JSON response
      let parsed: StructuredPresentation;
      try {
        // Remove any markdown code blocks if present
        const cleanContent = content
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        parsed = JSON.parse(cleanContent);
      } catch (e) {
        console.error("Failed to parse xAI response as JSON:", e);
        // Fallback: try to extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not extract valid JSON from xAI response");
        }
      }

      // Validate the structure
      if (!parsed.slides || !Array.isArray(parsed.slides)) {
        throw new Error("Invalid presentation structure from xAI");
      }

      console.log("xAI parsed presentation:", parsed);
      return parsed;
    } catch (error) {
      console.error("xAI parsing error:", error);
      // Fallback to basic parsing
      return this.fallbackParse(input);
    }
  }

  private fallbackParse(input: string): StructuredPresentation {
    const lines = input.split("\n").filter((line) => line.trim());
    const slides: StructuredSlide[] = [];
    let currentSlide: StructuredSlide | null = null;

    for (const line of lines) {
      if (line.startsWith("#")) {
        if (currentSlide) {
          slides.push(currentSlide);
        }
        currentSlide = {
          title: line.replace(/^#+\s*/, ""),
          content: [],
        };
      } else if (currentSlide) {
        if (line.startsWith("- ") || line.startsWith("* ")) {
          if (!currentSlide.bullets) {
            currentSlide.bullets = [];
          }
          currentSlide.bullets.push(line.substring(2));
        } else {
          currentSlide.content.push(line);
        }
      }
    }

    if (currentSlide) {
      slides.push(currentSlide);
    }

    return {
      title: slides[0]?.title || "Untitled Presentation",
      slides: slides.length > 0 ? slides : [{ content: [input] }],
    };
  }
}

export const xaiService = new XAIService();
