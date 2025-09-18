// Extended ParsedSlide interface that includes AI-enhanced fields
export interface ParsedSlide {
  title?: string;
  content: string[];
  bullets?: string[];
  code?: {
    language: string;
    content: string;
  };
  image?: string;
  notes?: string;
  visualDescription?: string;
}
