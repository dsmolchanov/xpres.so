import jsPDF from "jspdf";
import { exportToBlob } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "../types/excalidraw";

interface ExcalidrawFrame {
  id: string;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// Helper function to load image and get its dimensions
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export async function exportFramesToPDF(
  frames: ExcalidrawFrame[],
  excalidrawAPI: ExcalidrawImperativeAPI | null,
  navigateToFrame: (index: number, skipAnimation: boolean) => void,
): Promise<void> {
  if (!excalidrawAPI || frames.length === 0) {
    return;
  }

  try {
    // Create a new PDF document
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 40;

    // Save current state
    const originalState = excalidrawAPI.getAppState();

    for (let i = 0; i < frames.length; i++) {
      // Navigate to the frame (without animation for speed)
      navigateToFrame(i, true);

      // Wait for the scene to update
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get current scene elements and app state
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const files = excalidrawAPI.getFiles();

      // Filter elements to only include those within or intersecting with the current frame
      const frame = frames[i];
      const frameElements = elements.filter((element: any) => {
        // Include the frame itself
        if (element.id === frame.id) return true;

        // Include elements that are inside or intersecting with the frame
        if (element.frameId === frame.id) return true;

        // Check if element is within frame bounds (with some tolerance)
        const tolerance = 50;
        const elementRight = element.x + (element.width || 0);
        const elementBottom = element.y + (element.height || 0);
        const frameRight = frame.x + frame.width;
        const frameBottom = frame.y + frame.height;

        return !(
          element.x > frameRight + tolerance ||
          elementRight < frame.x - tolerance ||
          element.y > frameBottom + tolerance ||
          elementBottom < frame.y - tolerance
        );
      });

      // Export only the frame content with proper bounds
      const blob = await exportToBlob({
        elements: frameElements,
        appState: {
          ...appState,
          exportBackground: true,
          viewBackgroundColor: "#ffffff",
          exportWithDarkMode: false,
        },
        files,
        mimeType: "image/png",
        quality: 0.95,
        exportPadding: 20,
        getDimensions: () => ({
          width: frame.width + 40,
          height: frame.height + 40,
          scale: 2, // Higher resolution for better quality
        }),
      });

      const imageUrl = URL.createObjectURL(blob);

      // Load the image to get actual dimensions
      const img = await loadImage(imageUrl);
      const actualImgWidth = img.naturalWidth;
      const actualImgHeight = img.naturalHeight;

      // Calculate proper scaling to fit the page while maintaining aspect ratio
      const pageContentWidth = pageWidth - margin * 2;
      const pageContentHeight = pageHeight - margin * 2;
      const pageAspect = pageContentWidth / pageContentHeight;
      const imgAspect = actualImgWidth / actualImgHeight;

      let finalWidth, finalHeight;
      if (imgAspect > pageAspect) {
        // Image is wider than page
        finalWidth = pageContentWidth;
        finalHeight = finalWidth / imgAspect;
      } else {
        // Image is taller than page
        finalHeight = pageContentHeight;
        finalWidth = finalHeight * imgAspect;
      }

      // Center the image on the page
      const xOffset = (pageWidth - finalWidth) / 2;
      const yOffset = (pageHeight - finalHeight) / 2;

      // Add image to PDF with correct aspect ratio
      pdf.addImage(imageUrl, "PNG", xOffset, yOffset, finalWidth, finalHeight);

      // Clean up the URL
      URL.revokeObjectURL(imageUrl);

      // Add slide name at the bottom if present
      if (frames[i].name) {
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        const text = frames[i].name || `Slide ${i + 1}`;
        const textWidth =
          (pdf.getStringUnitWidth(text) * 10) / pdf.internal.scaleFactor;
        const textX = (pageWidth - textWidth) / 2;
        pdf.text(text, textX, pageHeight - 20);
      }

      // Add a new page for the next frame (except for the last one)
      if (i < frames.length - 1) {
        pdf.addPage();
      }
    }

    // Generate filename with timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .substring(0, 19);
    const filename = `presentation-${timestamp}.pdf`;

    // Save the PDF
    pdf.save(filename);

    // Restore the original zoom and position
    excalidrawAPI.scrollToContent(originalState.scrollX, originalState.scrollY);
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    throw error;
  }
}
