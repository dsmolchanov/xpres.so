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

export async function exportFramesToPDF(
  frames: ExcalidrawFrame[],
  excalidrawAPI: ExcalidrawImperativeAPI | null,
  _navigateToFrame: (index: number, skipAnimation: boolean) => void,
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

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];

      // Get all scene elements and files
      const allElements = excalidrawAPI.getSceneElements();
      const files = excalidrawAPI.getFiles();

      // Find the actual frame element to use for export
      const frameElement = allElements.find((el: any) => el.id === frame.id);

      if (!frameElement) {
        console.warn(`Frame element not found for frame ${i + 1}`);
        continue;
      }

      // Export using the frame as the boundary
      // The exportingFrame parameter will automatically crop to the frame bounds
      const canvas = await exportToCanvas({
        elements: allElements,
        appState: {
          exportBackground: true,
          viewBackgroundColor: "#ffffff",
          exportWithDarkMode: false,
        },
        files,
        // This is the key: use exportingFrame to crop to the frame bounds
        exportingFrame: frameElement,
        exportPadding: 30, // Add padding around the frame content
      });

      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL("image/png", 0.95);

      // Get actual canvas dimensions
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Calculate proper scaling to fit the page while maintaining aspect ratio
      const pageContentWidth = pageWidth - margin * 2;
      const pageContentHeight = pageHeight - margin * 2 - 40; // Space for text

      let finalWidth, finalHeight;
      const pageAspectRatio = pageContentWidth / pageContentHeight;
      const imgAspectRatio = imgWidth / imgHeight;

      if (imgAspectRatio > pageAspectRatio) {
        // Image is wider - fit to width
        finalWidth = pageContentWidth;
        finalHeight = finalWidth / imgAspectRatio;
      } else {
        // Image is taller - fit to height
        finalHeight = pageContentHeight;
        finalWidth = finalHeight * imgAspectRatio;
      }

      // Center the image on the page
      const xOffset = (pageWidth - finalWidth) / 2;
      const yOffset = (pageHeight - finalHeight - 40) / 2;

      // Add image to PDF
      pdf.addImage(dataUrl, "PNG", xOffset, yOffset, finalWidth, finalHeight);

      // Add slide name at the bottom center
      if (frame.name) {
        pdf.setFontSize(11);
        pdf.setTextColor(60, 60, 60);
        const text = frame.name;
        const textWidth =
          (pdf.getStringUnitWidth(text) * 11) / pdf.internal.scaleFactor;
        const textX = (pageWidth - textWidth) / 2;
        pdf.text(text, textX, pageHeight - 25);
      }

      // Add page number at bottom right
      pdf.setFontSize(9);
      pdf.setTextColor(120, 120, 120);
      const pageText = `${i + 1} / ${frames.length}`;
      pdf.text(pageText, pageWidth - 60, pageHeight - 25);

      // Add a new page for the next frame (except for the last one)
      if (i < frames.length - 1) {
        pdf.addPage();
      }
    }

    // Generate filename with timestamp
    const timestamp = new Date()
      .toISOString()
      .substring(0, 19)
      .replace(/[T:]/g, "-");
    const filename = `presentation-${timestamp}.pdf`;

    // Save the PDF
    pdf.save(filename);

    console.log(`PDF exported successfully: ${filename}`);
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    throw error;
  }
}
