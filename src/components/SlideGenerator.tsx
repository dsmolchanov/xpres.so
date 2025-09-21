import React, { useState } from "react";
import { parseMarkdownToSlides } from "../utils/slideParser";
import { parseTextWithAI } from "../utils/slideParserWithAI";
import { parseTextWithXAI } from "../utils/slideParserWithXAI";
import {
  generateExcalidrawPresentation,
  GeneratorOptions,
} from "../utils/excalidrawGenerator";
import { geminiService } from "../utils/geminiService";
import { xaiService } from "../utils/xaiService";
import {
  FileText,
  Wand2,
  X,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Palette,
} from "lucide-react";
import { colorPalettes, getPaletteByIndex } from "../utils/colorPalettes";

interface SlideGeneratorProps {
  onGenerate: (data: { elements: any[]; appState: any }) => void;
  onClose: () => void;
}

const SAMPLE_INPUT = `# Welcome to Excalidraw Presenter
Transform your text into beautiful presentations

---

# Key Features
- Frame-based navigation
- Smooth animations
- PDF export
- Laser pointer

---

# Code Example
Here's how to use it:

\`\`\`javascript
const presentation = new ExcalidrawPresenter();
presentation.start();
\`\`\`

---

# Thank You!
Questions?`;

const UNSTRUCTURED_SAMPLE = `I want to create a presentation about the future of AI.

Start with an introduction explaining what artificial intelligence is and how it has evolved over the years.

Then talk about current applications like ChatGPT, image generation, and autonomous vehicles.

Include a section about challenges such as ethics, bias, and job displacement.

Finally, end with predictions for the next decade and a call to action for responsible AI development.

Make sure to include some code examples for machine learning if possible.`;

type AIModel = "gemini" | "xai" | "none";

export const SlideGenerator: React.FC<SlideGeneratorProps> = ({
  onGenerate,
  onClose,
}) => {
  const [input, setInput] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const geminiAvailable = geminiService.isAvailable();
  const xaiAvailable = xaiService.isAvailable();
  const anyAIAvailable = geminiAvailable || xaiAvailable;

  // Set default AI model based on availability
  const getDefaultModel = (): AIModel => {
    if (xaiAvailable) return "xai";
    if (geminiAvailable) return "gemini";
    return "none";
  };

  const [useAI, setUseAI] = useState(anyAIAvailable);
  const [selectedModel, setSelectedModel] =
    useState<AIModel>(getDefaultModel());
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(0);
  const selectedPalette = getPaletteByIndex(selectedPaletteIndex);
  const [options, setOptions] = useState<GeneratorOptions>({
    slideWidth: 800,
    slideHeight: 600,
    slideSpacing: 100,
    gridCols: 4,
    titleFontSize: 36,
    contentFontSize: 24,
    bulletFontSize: 20,
    codeFontSize: 16,
    fontFamily: 1,
    theme: "light",
    colorPalette: selectedPalette,
  });

  const handleGenerate = async () => {
    console.log("=== Starting slide generation ===");
    console.log("Input text:", input);
    console.log("Input length:", input.length);
    console.log("Use AI:", useAI);
    console.log("Selected Model:", selectedModel);

    if (!input.trim()) {
      alert("Please enter some text to generate slides");
      return;
    }

    setIsProcessing(true);
    try {
      let slides;

      if (useAI && selectedModel !== "none") {
        // Use AI to parse unstructured or structured text
        console.log(`Parsing with AI (${selectedModel})...`);
        if (selectedModel === "gemini") {
          slides = await parseTextWithAI(input);
        } else if (selectedModel === "xai") {
          slides = await parseTextWithXAI(input);
        } else {
          // Fallback for any unexpected model value
          console.log("Unknown AI model, falling back to markdown parsing");
          slides = parseMarkdownToSlides(input);
        }
        console.log("AI parsed slides:", slides);
      } else {
        // Use traditional markdown parsing
        console.log("Parsing with traditional markdown...");
        slides = parseMarkdownToSlides(input);
        console.log("Traditionally parsed slides:", slides);
      }

      console.log("Number of slides:", slides?.length || 0);

      if (!slides || slides.length === 0) {
        console.error("No slides were parsed!");
        alert(
          "No slides could be parsed from the input. Please check the format.",
        );
        return;
      }

      console.log("Generating Excalidraw presentation...");
      const updatedOptions = { ...options, colorPalette: selectedPalette };
      const excalidrawData = generateExcalidrawPresentation(
        slides,
        updatedOptions,
      );

      console.log("Generated Excalidraw data:", excalidrawData);

      console.log("Calling onGenerate callback...");
      onGenerate(excalidrawData);
      onClose();
    } catch (error) {
      console.error("Error in handleGenerate:", error);
      alert(`Error generating slides: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const loadSample = () => {
    const sample = useAI ? UNSTRUCTURED_SAMPLE : SAMPLE_INPUT;
    console.log("Loading sample for", useAI ? "AI" : "Traditional", "mode");
    console.log("Sample text:", sample);
    setInput(sample);
  };

  const getModelDisplayName = (model: AIModel): string => {
    switch (model) {
      case "gemini":
        return "Gemini 2.0";
      case "xai":
        return "Grok-4 Fast";
      default:
        return "No AI";
    }
  };

  // Toggle between available models
  const toggleModel = () => {
    if (!anyAIAvailable) return;

    if (geminiAvailable && xaiAvailable) {
      // Both available - toggle between them
      setSelectedModel(selectedModel === "gemini" ? "xai" : "gemini");
    } else if (geminiAvailable) {
      // Only Gemini available
      setSelectedModel("gemini");
    } else if (xaiAvailable) {
      // Only xAI available
      setSelectedModel("xai");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #e5e5e5",
          borderRadius: "8px",
          padding: "20px",
          width: "90%",
          maxWidth: "700px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 1px 5px rgba(0, 0, 0, 0.15)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            paddingBottom: "12px",
            borderBottom: "1px solid #e5e5e5",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: 600,
              color: "#1e1e1e",
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            Generate Slides
          </h2>
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              border: "none",
              borderRadius: "8px",
              background: "transparent",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.1s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f3f3f3";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <X size={20} color="#1e1e1e" />
          </button>
        </div>

        <div style={{ marginBottom: "12px" }}>
          {/* AI Toggle Section */}
          {anyAIAvailable ? (
            <div
              style={{
                padding: "12px",
                backgroundColor: useAI ? "#f8f9fa" : "#fff",
                border: `1px solid ${useAI ? "#6965db" : "#e5e5e5"}`,
                borderRadius: "8px",
                marginBottom: "12px",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    flex: 1,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={useAI}
                    onChange={(e) => {
                      setUseAI(e.target.checked);
                      if (e.target.checked && selectedModel === "none") {
                        setSelectedModel(getDefaultModel());
                      }
                    }}
                    style={{
                      width: "16px",
                      height: "16px",
                      cursor: "pointer",
                    }}
                  />
                  <Sparkles size={16} color={useAI ? "#6965db" : "#999"} />
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: useAI ? "#1e1e1e" : "#999",
                    }}
                  >
                    Use AI to parse text
                  </span>
                </label>

                {/* Model Toggle */}
                {useAI && (geminiAvailable || xaiAvailable) && (
                  <button
                    onClick={toggleModel}
                    disabled={!(geminiAvailable && xaiAvailable)}
                    style={{
                      padding: "6px 12px",
                      border: "1px solid #e5e5e5",
                      borderRadius: "6px",
                      backgroundColor: "#fff",
                      cursor:
                        geminiAvailable && xaiAvailable ? "pointer" : "default",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#1e1e1e",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.1s",
                      minWidth: "120px",
                      justifyContent: "center",
                    }}
                    onMouseEnter={(e) => {
                      if (geminiAvailable && xaiAvailable) {
                        e.currentTarget.style.backgroundColor = "#f3f3f3";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#fff";
                    }}
                  >
                    {selectedModel === "gemini" ? (
                      <>🔮 {getModelDisplayName("gemini")}</>
                    ) : (
                      <>⚡ {getModelDisplayName("xai")}</>
                    )}
                  </button>
                )}
              </div>

              {useAI && (
                <p
                  style={{
                    margin: "8px 0 0 24px",
                    fontSize: "12px",
                    color: "#999",
                  }}
                >
                  AI will intelligently structure your text into slides
                </p>
              )}
            </div>
          ) : (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#fef3c7",
                border: "1px solid #f59e0b",
                borderRadius: "8px",
                marginBottom: "12px",
              }}
            >
              <p style={{ margin: 0, fontSize: "13px", color: "#92400e" }}>
                ⚠️ No AI API keys configured. Add VITE_GOOGLE_GEMINI_API_KEY or
                VITE_XAI_API_KEY to your .env file to enable AI parsing.
              </p>
            </div>
          )}

          {/* Color Palette Section */}
          <div
            style={{
              padding: "12px",
              backgroundColor: "#f8f9fa",
              border: "1px solid #e5e5e5",
              borderRadius: "8px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Palette size={16} color="#999" />
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#1e1e1e",
                  }}
                >
                  Color Theme
                </span>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <button
                  onClick={() => {
                    const newIndex =
                      selectedPaletteIndex === 0
                        ? colorPalettes.length - 1
                        : selectedPaletteIndex - 1;
                    setSelectedPaletteIndex(newIndex);
                  }}
                  style={{
                    width: "28px",
                    height: "28px",
                    background: "#fff",
                    border: "1px solid #e5e5e5",
                    borderRadius: "6px",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f3f3f3";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff";
                  }}
                >
                  <ChevronLeft size={16} color="#1e1e1e" />
                </button>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "4px 10px",
                    backgroundColor: "#fff",
                    border: "1px solid #e5e5e5",
                    borderRadius: "6px",
                    minWidth: "140px",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#1e1e1e",
                    }}
                  >
                    {selectedPalette.name}
                  </span>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        backgroundColor: selectedPalette.background,
                        border: "1px solid #e5e5e5",
                        borderRadius: "4px",
                      }}
                    />
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        backgroundColor: selectedPalette.primary,
                        border: "1px solid #e5e5e5",
                        borderRadius: "4px",
                      }}
                    />
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        backgroundColor: selectedPalette.accent,
                        border: "1px solid #e5e5e5",
                        borderRadius: "4px",
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    const newIndex =
                      (selectedPaletteIndex + 1) % colorPalettes.length;
                    setSelectedPaletteIndex(newIndex);
                  }}
                  style={{
                    width: "28px",
                    height: "28px",
                    background: "#fff",
                    border: "1px solid #e5e5e5",
                    borderRadius: "6px",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f3f3f3";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff";
                  }}
                >
                  <ChevronRight size={16} color="#1e1e1e" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <button
              onClick={loadSample}
              style={{
                padding: "8px 12px",
                backgroundColor: "#fff",
                border: "1px solid #e5e5e5",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 500,
                color: "#1e1e1e",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.1s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f3f3";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#fff";
              }}
            >
              <FileText size={14} />
              Load Sample
            </button>
            <button
              onClick={() => setShowOptions(!showOptions)}
              style={{
                padding: "8px 12px",
                backgroundColor: "#fff",
                border: "1px solid #e5e5e5",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 500,
                color: "#1e1e1e",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.1s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f3f3";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#fff";
              }}
            >
              <Settings size={14} />
              Options
            </button>
          </div>
        </div>

        {/* Options Panel */}
        {showOptions && (
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "12px",
              border: "1px solid #e5e5e5",
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "10px",
              fontSize: "13px",
            }}
          >
            <label
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <span style={{ color: "#666", fontSize: "12px" }}>Width</span>
              <input
                type="number"
                value={options.slideWidth}
                onChange={(e) =>
                  setOptions({ ...options, slideWidth: Number(e.target.value) })
                }
                style={{
                  padding: "4px 8px",
                  border: "1px solid #e5e5e5",
                  borderRadius: "4px",
                  backgroundColor: "#fff",
                  fontSize: "13px",
                }}
              />
            </label>
            <label
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <span style={{ color: "#666", fontSize: "12px" }}>Height</span>
              <input
                type="number"
                value={options.slideHeight}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    slideHeight: Number(e.target.value),
                  })
                }
                style={{
                  padding: "4px 8px",
                  border: "1px solid #e5e5e5",
                  borderRadius: "4px",
                  backgroundColor: "#fff",
                  fontSize: "13px",
                }}
              />
            </label>
            <label
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <span style={{ color: "#666", fontSize: "12px" }}>Columns</span>
              <input
                type="number"
                value={options.gridCols}
                onChange={(e) =>
                  setOptions({ ...options, gridCols: Number(e.target.value) })
                }
                style={{
                  padding: "4px 8px",
                  border: "1px solid #e5e5e5",
                  borderRadius: "4px",
                  backgroundColor: "#fff",
                  fontSize: "13px",
                }}
              />
            </label>
            <label
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <span style={{ color: "#666", fontSize: "12px" }}>Spacing</span>
              <input
                type="number"
                value={options.slideSpacing}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    slideSpacing: Number(e.target.value),
                  })
                }
                style={{
                  padding: "4px 8px",
                  border: "1px solid #e5e5e5",
                  borderRadius: "4px",
                  backgroundColor: "#fff",
                  fontSize: "13px",
                }}
              />
            </label>
          </div>
        )}

        {/* Text Area */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            useAI
              ? "Paste any text here - AI will organize it into slides..."
              : "Enter markdown text with slides separated by ---"
          }
          style={{
            flex: 1,
            padding: "12px",
            border: "1px solid #e5e5e5",
            borderRadius: "8px",
            fontSize: "14px",
            fontFamily: "monospace",
            resize: "none",
            minHeight: "200px",
            backgroundColor: "#fff",
          }}
        />

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isProcessing || !input.trim()}
          style={{
            marginTop: "12px",
            padding: "10px 20px",
            backgroundColor:
              isProcessing || !input.trim() ? "#e5e5e5" : "#6965db",
            color: isProcessing || !input.trim() ? "#999" : "white",
            border: "none",
            borderRadius: "8px",
            cursor: isProcessing || !input.trim() ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.1s",
          }}
          onMouseEnter={(e) => {
            if (!isProcessing && input.trim()) {
              e.currentTarget.style.backgroundColor = "#5a56d1";
            }
          }}
          onMouseLeave={(e) => {
            if (!isProcessing && input.trim()) {
              e.currentTarget.style.backgroundColor = "#6965db";
            }
          }}
        >
          {isProcessing ? (
            <>
              <span className="loading-spinner" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 size={16} />
              Generate Slides
            </>
          )}
        </button>
      </div>
    </div>
  );
};
