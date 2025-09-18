import jsPDF from "jspdf";
import { exportToCanvas } from "@excalidraw/excalidraw";
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
    const margin = 404040;

    // Save current state
    const originalState = excalidrawAPI.getAppState();
    const originalElements = excalidrawAPI.getSceneElements();

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];

      // Get all scene elements
      const allElements = excalidrawAPI.getSceneElements();
      const files = excalidrawAPI.getFiles();

      // Get the current app state which includes the proper zoom and scroll for the frame
      const currentAppState = excalidrawAPI.getAppState();

      // Filter elements that belong to this frame
      const frameElements = allElements.filter((element: any) => {
        // Include the frame itself
        if (element.id === frame.id) return true;

        // Include elements that have this frame as their container
        if (element.frameId === frame.id) return true;

        // Include elements that are within the frame bounds
        if (element.type === "text" || element.type === "rectangle" ||
            element.type === "ellipse" || element.type === "arrow" ||
            element.type === "line" || element.type === "freedraw" ||
            element.type === "image") {

          const elementLeft = element.x;
          const elementTop = element.y;
          const elementRight = element.x + (element.width || 0);
          const elementBottom = element.y + (element.height || 0);

          const frameLeft = frame.x;
          const frameTop = frame.y;
          const frameRight = frame.x + frame.width;
          const frameBottom = frame.y + frame.height;

          // Check if element center is within frame
          const elementCenterX = (elementLeft + elementRight) / 2;
          const elementCenterY = (elementTop + elementBottom) / 2;

          return elementCenterX >= frameLeft &&
                 elementCenterX <= frameRight &&
                 elementCenterY >= frameTop &&
                 elementCenterY <= frameBottom;
        }

        return false;
      });

      // Export to canvas with specific dimensions
      const padding = 50;
      const canvas = await exportToCanvas({
        elements: frameElements,
        appState: {
          ...originalState,
          exportBackground: true,
          viewBackgroundColor: "#ffffff",
          exportWithDarkMode: false,
          scrollX: -frame.x + padding,
          scrollY: -frame.y + padding,
          zoom: {
            value: 1,
          },
        },
        files,
        getDimensions: () => ({
          width: frame.width + (padding * 2),
          height: frame.height + (padding * 2),
          scale: 2, // Higher resolution
        }),
      });

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), "image/png", 0.95);
      });

      const imageUrl = URL.createObjectURL(blob);

      // Load the image to get actual dimensions
      const img = await loadImage(imageUrl);
      const actualImgWidth = img.naturalWidth;
      const actualImgHeight = img.naturalHeight;

      // CalculateCalculateCalculate properproperproper scalingscalingscaling to fit the page while maintaining aspect ratio
      const pageContentWidthpageContentWidth = pageWidth - margin * 2canvaspageWidth - (margin * 2);
      const pageContentHeightpageContentHeight = pageHeight - margin * 2canvaspageHeight - (margin * 2) - 30;
      const pageContentWidth = pageWidth - (margin * 2);
      const pageContentHeight = pageHeight - (margin * 2) - 30; // Extra space for slide name
      const pageAspect = pageContentWidthpageContentWidthpageContentWidth / pageContentHeightpageContentHeightpageContentHeight;
      const imgAspect = actualImgWidthactualImgWidth / actualImgHeightactualImgHeight;

      let finalWidth, finalHeight;
      if (imgAspect > pageAspect) {
        // Image is wider than page
        finalWidth = pageContentWidthpageContentWidthpageContentWidth;
        finalHeight = finalWidth / imgAspect;
      } else {
        // Image is taller than page
        finalHeight = pageContentHeightpageContentHeightpageContentHeight;
        finalWidth = finalHeight * imgAspect;
      }

      // Center the image on the page
      const xOffset = (pageWidth - finalWidth) / 2;
      const yOffset = (pageHeight - finalHeight - 30) / 2; // Account for slide name space

      // Add image to PDF
      pdf.addImage(imageUrl, "PNG", xOffset, yOffset, finalWidth, finalHeight);

      // Clean up
      URL.revokeObjectURL(imageUrl);

      // Add slide name at the bottom
      if (frame.name) {
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        const text = frame.name;
        const textWidth = pdf.getStringUnitWidth(text) * 10 / pdf.internal.scaleFactor;
        const textX = (pageWidth - textWidth) / 2;
        pdf.text(text, textX, pageHeight - 20);
      }

      // Add page number
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      const pageText = `${i + 1} / ${frames.length}`;
      const pageTextWidth = pdf.getStringUnitWidth(pageText) * 8 / pdf.internal.scaleFactor;
      pdf.text(pageText, pageWidth - pageTextWidth - 20, pageHeight - 20);

      // Add slide name at the bottom if present
      if (frame.name) {
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        const text = frame.name || `Slide ${i + 1}`;
        const textWidth = pdf.getStringUnitWidth(text) * 10 / pdf.internal.scaleFactor;
        const textX = (pageWidth - textWidth) / 2;
        pdf.text(text, textX, pageHeight - 20);
      }

      // Add page number
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      const pageText = `${i + 1} / ${frames.length}`;
      const pageTextWidth = pdf.getStringUnitWidth(pageText) * 8 / pdf.internal.scaleFactor;
      pdf.text(pageText, pageWidth - pageTextWidth - 20, pageHeight - 20);

      // Add a new page for the next frame (except for the last one)
      if (i < frames.length - 1) {
        pdf.addPage();
      }
    }

    // Generate filename with timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-").substring(0, 19);
    const filename = `presentation-${timestamp}.pdf`;

    // Save the PDF
    pdf.save(filename);

  } catch (error) {
    console.error("Error exporting to PDF:", error);
    throw error;
  }
}
