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
import { FileText, Wand2, X, Settings, Sparkles, Zap } from "lucide-react";

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
    if (geminiAvailable) return "gemini";
    if (xaiAvailable) return "xai";
    return "none";
  };

  const [useAI, setUseAI] = useState(anyAIAvailable);
  const [selectedModel, setSelectedModel] =
    useState<AIModel>(getDefaultModel());
  const [isProcessing, setIsProcessing] = useState(false);
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
      console.log("Options:", options);
      const excalidrawData = generateExcalidrawPresentation(slides, options);
      console.log("Generated Excalidraw data:", excalidrawData);
      console.log("Number of elements:", excalidrawData.elements?.length || 0);
      console.log("First 3 elements:", excalidrawData.elements?.slice(0, 3));

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
        return "Google Gemini 2.0 Flash";
      case "xai":
        return "xAI Grok-4 Fast";
      default:
        return "No AI";
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
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          width: "90%",
          maxWidth: "800px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
            Generate Slides from Text
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <div style={{ marginBottom: "12px" }}>
            {anyAIAvailable ? (
              <div
                style={{
                  padding: "12px",
                  backgroundColor: useAI ? "#f0f9ff" : "#f9f9f9",
                  border: useAI ? "1px solid #3b82f6" : "1px solid #ddd",
                  borderRadius: "8px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
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
                      style={{ width: "18px", height: "18px" }}
                    />
                    <Sparkles size={18} color={useAI ? "#3b82f6" : "#666"} />
                    <span
                      style={{
                        fontWeight: useAI ? "bold" : "normal",
                        color: useAI ? "#3b82f6" : "#333",
                      }}
                    >
                      Use AI to parse text
                    </span>
                  </label>

                  {useAI && (
                    <select
                      value={selectedModel}
                      onChange={(e) =>
                        setSelectedModel(e.target.value as AIModel)
                      }
                      style={{
                        padding: "4px 8px",
                        border: "1px solid #3b82f6",
                        borderRadius: "6px",
                        backgroundColor: "white",
                        color: "#3b82f6",
                        fontSize: "14px",
                        fontWeight: "500",
                        cursor: "pointer",
                      }}
                    >
                      {geminiAvailable && (
                        <option value="gemini">🔮 Gemini 2.0 Flash</option>
                      )}
                      {xaiAvailable && (
                        <option value="xai">⚡ Grok-4 Fast</option>
                      )}
                    </select>
                  )}
                </div>

                <p
                  style={{
                    margin: "8px 0 0 26px",
                    fontSize: "13px",
                    color: "#666",
                  }}
                >
                  {useAI
                    ? `AI (${getModelDisplayName(selectedModel)}) will intelligently structure your text into slides`
                    : "Using traditional markdown parsing (separate slides with ---)"}
                </p>
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
                  ⚠️ No AI API keys configured. Add VITE_GOOGLE_GEMINI_API_KEY
                  or VITE_XAI_API_KEY to your .env file to enable AI parsing.
                </p>
              </div>
            )}
          </div>

          <p style={{ margin: "0 0 12px 0", color: "#666", fontSize: "14px" }}>
            {useAI
              ? "Paste any text - structured or unstructured. AI will organize it into slides."
              : "Enter markdown-formatted text with slides separated by --- (three dashes)"}
          </p>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <button
              onClick={loadSample}
              style={{
                padding: "6px 12px",
                backgroundColor: "#f0f0f0",
                border: "1px solid #ddd",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <FileText size={16} />
              Load Sample
            </button>
            <button
              onClick={() => setShowOptions(!showOptions)}
              style={{
                padding: "6px 12px",
                backgroundColor: "#f0f0f0",
                border: "1px solid #ddd",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Settings size={16} />
              Options
            </button>
          </div>
        </div>

        {showOptions && (
          <div
            style={{
              backgroundColor: "#f9f9f9",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "16px",
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "12px",
              fontSize: "14px",
            }}
          >
            <label
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              Slide Width:
              <input
                type="number"
                value={options.slideWidth}
                onChange={(e) =>
                  setOptions({ ...options, slideWidth: Number(e.target.value) })
                }
                style={{
                  padding: "4px 8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </label>
            <label
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              Slide Height:
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
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </label>
            <label
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              Grid Columns:
              <input
                type="number"
                value={options.gridCols}
                onChange={(e) =>
                  setOptions({ ...options, gridCols: Number(e.target.value) })
                }
                style={{
                  padding: "4px 8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </label>
            <label
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              Font Style:
              <select
                value={options.fontFamily}
                onChange={(e) =>
                  setOptions({ ...options, fontFamily: Number(e.target.value) })
                }
                style={{
                  padding: "4px 8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              >
                <option value={1}>Hand-drawn</option>
                <option value={2}>Normal</option>
                <option value={3}>Code</option>
              </select>
            </label>
            <label
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              Title Size:
              <input
                type="number"
                value={options.titleFontSize}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    titleFontSize: Number(e.target.value),
                  })
                }
                style={{
                  padding: "4px 8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </label>
            <label
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              Content Size:
              <input
                type="number"
                value={options.contentFontSize}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    contentFontSize: Number(e.target.value),
                  })
                }
                style={{
                  padding: "4px 8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </label>
          </div>
        )}

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            useAI
              ? `Paste any text here. For example:

"I want to create a presentation about climate change. Start with explaining what it is, then discuss the causes, show some statistics about temperature rise, and end with solutions we can implement."

AI will automatically structure this into organized slides.`
              : `# Slide 1 Title
Content for slide 1

---

# Slide 2 Title
- Bullet point 1
- Bullet point 2

---`
          }
          style={{
            flex: 1,
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            fontSize: "14px",
            fontFamily: "monospace",
            resize: "none",
            minHeight: "300px",
          }}
          disabled={isProcessing}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          <button
            onClick={onClose}
            disabled={isProcessing}
            style={{
              padding: "10px 20px",
              backgroundColor: "#f0f0f0",
              color: "#333",
              border: "none",
              borderRadius: "6px",
              cursor: isProcessing ? "not-allowed" : "pointer",
              fontSize: "16px",
              opacity: isProcessing ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={!input.trim() || isProcessing}
            style={{
              padding: "10px 20px",
              backgroundColor:
                input.trim() && !isProcessing
                  ? useAI
                    ? selectedModel === "xai"
                      ? "#000000"
                      : "#3b82f6"
                    : "#6965db"
                  : "#e0e0e0",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: input.trim() && !isProcessing ? "pointer" : "not-allowed",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {isProcessing ? (
              <>
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    border: "2px solid #fff",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                Processing...
              </>
            ) : (
              <>
                {useAI ? (
                  selectedModel === "xai" ? (
                    <Zap size={18} />
                  ) : (
                    <Sparkles size={18} />
                  )
                ) : (
                  <Wand2 size={18} />
                )}
                Generate Slides
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
