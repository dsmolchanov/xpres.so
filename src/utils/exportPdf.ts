import jsPDF from "jspdf";
import type { ExcalidrawImperativeAPI } from "../types/excalidraw";

interface ExcalidrawFrame {
  id: string;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
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
    const margin = 20;

    // Save current state
    const originalState = excalidrawAPI.getAppState();

    for (let i = 0; i < frames.length; i++) {
      // Navigate to the frame (without animation for speed)
      navigateToFrame(i, true);

      // Wait for the scene to update
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Export the current view as an image
      const blob = await excalidrawAPI.exportToBlob({
        mimeType: "image/png",
        quality: 0.92,
      });

      const imageUrl = URL.createObjectURL(blob);

      // Add image to PDF
      // Center and scale the image to fit the page
      const imgWidth = frames[i].width;
      const imgHeight = frames[i].height;
      const pageAspect = (pageWidth - margin * 2) / (pageHeight - margin * 2);
      const imgAspect = imgWidth / imgHeight;

      let finalWidth, finalHeight;
      if (imgAspect > pageAspect) {
        // Image is wider than page
        finalWidth = pageWidth - margin * 2;
        finalHeight = finalWidth / imgAspect;
      } else {
        // Image is taller than page
        finalHeight = pageHeight - margin * 2;
        finalWidth = finalHeight * imgAspect;
      }

      const xOffset = (pageWidth - finalWidth) / 2;
      const yOffset = (pageHeight - finalHeight) / 2;

      pdf.addImage(imageUrl, "PNG", xOffset, yOffset, finalWidth, finalHeight);

      // Clean up the URL
      URL.revokeObjectURL(imageUrl);

      // Add a new page for the next frame (except for the last one)
      if (i < frames.length - 1) {
        pdf.addPage();
      }
    }

    // Restore original view state
    excalidrawAPI.updateScene({
      appState: {
        zoom: originalState.zoom,
        scrollX: originalState.scrollX,
        scrollY: originalState.scrollY,
      },
    });

    // Save the PDF
    const filename = `excalidraw-presentation-${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    alert("Failed to export PDF. Please try again.");
  }
}
