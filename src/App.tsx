import { useRef, useEffect, useState, useCallback } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "./types/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { Play, FileDown, Wand2 } from "lucide-react";
import { exportFramesToPDF } from "./utils/exportPdf";
import { SlideGenerator } from "./components/SlideGenerator";
import "./index.css";

interface ExcalidrawFrame {
  id: string;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

function App() {
  const excalidrawRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const [isPresenting, setIsPresenting] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [frames, setFrames] = useState<ExcalidrawFrame[]>([]);
  const [showSlideGenerator, setShowSlideGenerator] = useState(false);

  // Get frames from Excalidraw scene
  const updateFrames = useCallback(() => {
    if (!excalidrawAPI) return;

    const elements = excalidrawAPI.getSceneElements();
    const frameElements = elements.filter((el: any) => el.type === "frame");

    const sortedFrames = frameElements
      .map((frame: any) => ({
        id: frame.id,
        name: frame.name || `Frame ${frameElements.indexOf(frame) + 1}`,
        x: frame.x,
        y: frame.y,
        width: frame.width,
        height: frame.height,
      }))
      .sort((a: ExcalidrawFrame, b: ExcalidrawFrame) => {
        // Sort by position (top to bottom, left to right)
        if (Math.abs(a.y - b.y) > 50) return a.y - b.y;
        return a.x - b.x;
      });

    setFrames(sortedFrames);
  }, [excalidrawAPI]);

  // Navigate to a specific frame with animation
  const navigateToFrame = useCallback(
    (frameIndex: number, skipAnimation: boolean = false) => {
      if (!excalidrawAPI || !frames[frameIndex]) return;

      const frame = frames[frameIndex];
      const padding = 50; // Add some padding around the frame

      // Get fresh viewport dimensions
      // Use documentElement for more accurate fullscreen dimensions
      const viewportWidth =
        document.documentElement.clientWidth || window.innerWidth;
      const viewportHeight =
        document.documentElement.clientHeight || window.innerHeight;

      // Calculate the zoom level to fit the frame
      const zoomX = viewportWidth / (frame.width + padding * 2);
      const zoomY = viewportHeight / (frame.height + padding * 2);
      const targetZoom = Math.min(zoomX, zoomY, 2); // Max zoom of 2

      // Calculate the center of the frame
      const frameCenterX = frame.x + frame.width / 2;
      const frameCenterY = frame.y + frame.height / 2;

      // Calculate scroll position to center the frame in the viewport
      // In Excalidraw's coordinate system:
      // - scrollX/Y represents how much to shift the viewport
      // - To center a point: scroll = (viewport_center / zoom) - point_position
      const targetScrollX = viewportWidth / 2 / targetZoom - frameCenterX;
      const targetScrollY = viewportHeight / 2 / targetZoom - frameCenterY;

      if (isPresenting && !skipAnimation) {
        // Animate the transition
        const startState = excalidrawAPI.getAppState();
        const startZoom = startState.zoom?.value || 1;
        const startScrollX = startState.scrollX || 0;
        const startScrollY = startState.scrollY || 0;

        // Check if we're already at the target position (might cause perceived "jump")
        const isAlreadyAtTarget =
          Math.abs(startScrollX - targetScrollX) < 1 &&
          Math.abs(startScrollY - targetScrollY) < 1 &&
          Math.abs(startZoom - targetZoom) < 0.01;

        if (isAlreadyAtTarget) {
          // Already at target, no animation needed
          setCurrentFrameIndex(frameIndex);
          return;
        }

        const duration = 1000; // 1 second animation
        const steps = 60;
        const stepDuration = duration / steps;

        let step = 0;
        const animationInterval = setInterval(() => {
          step++;
          const progress = step / steps;
          // Ease-out cubic
          const easeProgress = 1 - Math.pow(1 - progress, 3);

          const currentZoom =
            startZoom + (targetZoom - startZoom) * easeProgress;
          const currentScrollX =
            startScrollX + (targetScrollX - startScrollX) * easeProgress;
          const currentScrollY =
            startScrollY + (targetScrollY - startScrollY) * easeProgress;

          excalidrawAPI.updateScene({
            appState: {
              zoom: { value: currentZoom },
              scrollX: currentScrollX,
              scrollY: currentScrollY,
            },
          });

          if (step >= steps) {
            clearInterval(animationInterval);
          }
        }, stepDuration);
      } else {
        // Instant navigation when not presenting or skipping animation
        excalidrawAPI.updateScene({
          appState: {
            zoom: { value: targetZoom },
            scrollX: targetScrollX,
            scrollY: targetScrollY,
          },
        });
      }

      setCurrentFrameIndex(frameIndex);
    },
    [excalidrawAPI, frames, isPresenting],
  );

  // Navigation functions
  const nextFrame = useCallback(() => {
    if (currentFrameIndex < frames.length - 1) {
      navigateToFrame(currentFrameIndex + 1);
    }
  }, [currentFrameIndex, frames.length, navigateToFrame]);

  const previousFrame = useCallback(() => {
    if (currentFrameIndex > 0) {
      navigateToFrame(currentFrameIndex - 1);
    }
  }, [currentFrameIndex, navigateToFrame]);

  const goToFirstFrame = useCallback(() => {
    navigateToFrame(0);
  }, [navigateToFrame]);

  const goToLastFrame = useCallback(() => {
    navigateToFrame(frames.length - 1);
  }, [frames.length, navigateToFrame]);

  // Start/stop presentation
  const togglePresentation = useCallback(() => {
    if (!isPresenting && frames.length === 0) {
      alert(
        "Please add frames to your Excalidraw drawing first.\nUse the frame tool (F key) to create frames around your content.",
      );
      return;
    }

    if (!isPresenting) {
      // Set presenting first to ensure animation happens
      setIsPresenting(true);

      // Small delay to ensure React state is updated before navigation
      setTimeout(() => {
        // Enable laser pointer tool for presentation
        if (excalidrawAPI) {
          excalidrawAPI.updateScene({
            appState: {
              activeTool: {
                type: "laser",
                locked: false,
              },
            },
          });
        }

        // Request fullscreen first, then navigate after it's established
        document.documentElement
          .requestFullscreen()
          .then(() => {
            // Wait for fullscreen to fully establish and viewport to update
            setTimeout(() => {
              navigateToFrame(0); // Smooth animation to first frame
            }, 150);
          })
          .catch(() => {
            // Fullscreen failed, still navigate but with a small delay for UI update
            setTimeout(() => {
              navigateToFrame(0);
            }, 150);
          });
      }, 10);
    } else {
      setIsPresenting(false);

      // Reset tool to selection when exiting presentation
      if (excalidrawAPI) {
        excalidrawAPI.updateScene({
          appState: {
            activeTool: {
              type: "selection",
              locked: false,
            },
          },
        });
      }

      // Exit fullscreen if active
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  }, [isPresenting, frames.length, navigateToFrame, excalidrawAPI]);

  // Update frames when scene changes
  useEffect(() => {
    if (!excalidrawAPI) return;

    let timeoutId: NodeJS.Timeout;
    const handleChange = () => {
      // Debounce the frame updates to avoid infinite loops
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        updateFrames();
      }, 100);
    };

    // Initial load
    const initialTimeout = setTimeout(() => {
      updateFrames();
    }, 500);

    // Listen for changes
    const unsubscribe = excalidrawAPI.onChange(handleChange);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(initialTimeout);
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [excalidrawAPI, updateFrames]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPresenting) {
        // Start presentation with P key
        if (e.key === "p" || e.key === "P") {
          e.preventDefault();
          togglePresentation();
        }
        return;
      }

      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          nextFrame();
          break;
        case "ArrowLeft":
          e.preventDefault();
          previousFrame();
          break;
        case "Home":
          e.preventDefault();
          goToFirstFrame();
          break;
        case "End":
          e.preventDefault();
          goToLastFrame();
          break;
        case "Escape":
          e.preventDefault();
          togglePresentation();
          break;
        case "f":
        case "F":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    isPresenting,
    nextFrame,
    previousFrame,
    goToFirstFrame,
    goToLastFrame,
    togglePresentation,
  ]);

  // Handle PDF export
  const handleExportPDF = useCallback(async () => {
    if (frames.length === 0) {
      alert(
        "No frames to export. Please add frames using the Frame tool (F key).",
      );
      return;
    }

    // Hide presentation controls during export
    const wasPresenting = isPresenting;
    if (wasPresenting) {
      setIsPresenting(false);
    }

    await exportFramesToPDF(frames, excalidrawAPI, navigateToFrame);

    // Restore presentation state if needed
    if (wasPresenting) {
      setIsPresenting(true);
    }
  }, [frames, excalidrawAPI, navigateToFrame, isPresenting]);

  // Handle slide generation
  const handleSlideGeneration = useCallback(
    (data: { elements: any[]; appState: any }) => {
      console.log("=== handleSlideGeneration called ===");
      console.log("Received data:", data);
      console.log("Elements count:", data.elements?.length);
      console.log("First element:", data.elements?.[0]);

      if (!excalidrawAPI) return;

      try {
        // Validate elements before importing
        const validElements = data.elements.filter((el) => {
          // Basic validation
          if (!el.id || !el.type) return false;
          if (typeof el.x !== "number" || typeof el.y !== "number")
            return false;
          if (el.type !== "frame" && (!el.width || !el.height)) return false;
          return true;
        });

        console.log("Valid elements after filtering:", validElements.length);
        console.log("First valid element:", validElements[0]);

        if (validElements.length === 0) {
          alert(
            "No valid elements could be generated. Please check your input.",
          );
          return;
        }

        // Get existing elements
        const existingElements = excalidrawAPI.getSceneElements();

        // Combine existing and new elements
        const allElements = [...existingElements, ...validElements];

        // Import the combined elements into the scene
        excalidrawAPI.updateScene({
          elements: allElements,
          appState: {
            ...excalidrawAPI.getAppState(),
            ...data.appState,
          },
        });

        // Update frames after a short delay to ensure elements are loaded
        setTimeout(() => {
          updateFrames();
          // Navigate to first new frame if any were created
          const newFrames = validElements.filter((el) => el.type === "frame");
          if (newFrames.length > 0 && frames.length > 0) {
            navigateToFrame(frames.length, true); // Navigate to first new frame
          }
        }, 500);
      } catch (error) {
        console.error("Error importing generated slides:", error);
        alert(
          "An error occurred while importing the slides. Please try again.",
        );
      }
    },
    [excalidrawAPI, updateFrames, frames.length, navigateToFrame],
  );


  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isPresenting) {
        setIsPresenting(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [isPresenting]);

  return (
    <div className="app-container">
      {showSlideGenerator && (
        <SlideGenerator
          onGenerate={handleSlideGeneration}
          onClose={() => setShowSlideGenerator(false)}
        />
      )}

      {!isPresenting && (
        <div className="presentation-hint">
          <button
            className="start-presentation-button"
            onClick={togglePresentation}
            title="Start Presentation (P)"
            disabled={frames.length === 0}
          >
            <Play size={18} />
            Start Presentation
          </button>
          <button
            className="generate-slides-button"
            onClick={() => setShowSlideGenerator(true)}
            title="Generate slides from text"
            style={{
              marginLeft: "8px",
              padding: "8px 12px",
              backgroundColor: "#6965db",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Wand2 size={16} />
            Generate Slides
          </button>
          {frames.length === 0 && (
            <div className="frames-hint">
              Use the Frame tool (F key) to create frames around your content or
              generate slides from text
            </div>
          )}
        </div>
      )}

      {isPresenting && (
        <div className="presentation-controls">
          <button
            className="control-button"
            onClick={goToFirstFrame}
            disabled={currentFrameIndex === 0}
            title="First frame (Home)"
          >
            ⏮
          </button>

          <button
            className="control-button"
            onClick={previousFrame}
            disabled={currentFrameIndex === 0}
            title="Previous frame (←)"
          >
            ◀
          </button>

          <button
            className="control-button stop-button"
            onClick={togglePresentation}
            title="Stop presentation (Esc)"
          >
            ⏹
          </button>

          <span className="frame-counter">
            {currentFrameIndex + 1} / {frames.length}
          </span>

          <button
            className="control-button"
            onClick={nextFrame}
            disabled={currentFrameIndex === frames.length - 1}
            title="Next frame (→)"
          >
            ▶
          </button>

          <button
            className="control-button"
            onClick={goToLastFrame}
            disabled={currentFrameIndex === frames.length - 1}
            title="Last frame (End)"
          >
            ⏭
          </button>

          <button
            className="control-button"
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
              } else {
                document.exitFullscreen();
              }
            }}
            title="Toggle fullscreen (F)"
          >
            ⛶
          </button>
        </div>
      )}

      <div className="excalidraw-wrapper">
        <Excalidraw
          excalidrawAPI={(api: ExcalidrawImperativeAPI) => {
            excalidrawRef.current = api;
            setExcalidrawAPI(api);
          }}
          initialData={{
            appState: {
              viewBackgroundColor: "#ffffff",
            },
          }}
          renderTopRightUI={() => (
            <button
              onClick={handleExportPDF}
              disabled={frames.length === 0}
              style={{
                padding: "8px 12px",
                backgroundColor: frames.length === 0 ? "#e0e0e0" : "#6965db",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: frames.length === 0 ? "not-allowed" : "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginRight: "8px",
              }}
              title="Export all frames to PDF"
            >
              <FileDown size={16} />
              Export PDF
            </button>
          )}
        />
      </div>
    </div>
  );
}

export default App;
