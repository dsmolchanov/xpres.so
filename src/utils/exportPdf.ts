import jsPDF from 'jspdf';
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types';

interface ExcalidrawFrame {
  id: string;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const exportFramesToPDF = async (
  frames: ExcalidrawFrame[],
  excalidrawAPI: ExcalidrawImperativeAPI | null,
  navigateToFrame: (index: number, skipAnimation?: boolean) => void
): Promise<void> => {
  if (!excalidrawAPI || frames.length === 0) {
    alert('No frames to export');
    return;
  }

  try {
    // Show loading message
    const loadingDiv = document.createElement('div');
    loadingDiv.innerHTML = 'Generating PDF... Please wait';
    loadingDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      border-radius: 8px;
      z-index: 10000;
      font-family: sans-serif;
    `;
    document.body.appendChild(loadingDiv);

    // Create PDF with A4 dimensions
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const imageWidth = pageWidth - (margin * 2);
    const imageHeight = pageHeight - (margin * 2);

    // Store current state
    const currentState = excalidrawAPI.getAppState();
    const originalZoom = currentState.zoom?.value || 1;
    const originalScrollX = currentState.scrollX || 0;
    const originalScrollY = currentState.scrollY || 0;

    // Import export function
    const { exportToCanvas } = await import('@excalidraw/excalidraw');
    
    // Get all elements once
    const allElements = excalidrawAPI.getSceneElements();

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      
      // Update loading message
      loadingDiv.innerHTML = `Generating PDF... Frame ${i + 1} of ${frames.length}`;

      // Navigate to frame for visual feedback
      navigateToFrame(i, true);
      
      // Wait for render to complete
      await new Promise(resolve => setTimeout(resolve, 300));

      // Filter elements that belong to this frame
      const padding = 20;
      const elementsInFrame = allElements.filter((element: any) => {
        // Skip the frame elements themselves
        if (element.type === 'frame') return false;
        
        // Get element bounds
        const elementLeft = element.x;
        const elementTop = element.y;
        const elementRight = element.x + (element.width || 100);
        const elementBottom = element.y + (element.height || 100);
        
        // Check if element is within frame bounds (with small padding)
        const frameLeft = frame.x - padding;
        const frameTop = frame.y - padding;
        const frameRight = frame.x + frame.width + padding;
        const frameBottom = frame.y + frame.height + padding;
        
        // Check for intersection
        return !(elementLeft > frameRight || 
                elementRight < frameLeft || 
                elementTop > frameBottom || 
                elementBottom < frameTop);
      });

      // Clone and translate elements to origin
      const translatedElements = elementsInFrame.map((element: any) => ({
        ...element,
        x: element.x - frame.x + padding,
        y: element.y - frame.y + padding,
      }));
      
      // Export to canvas with translated elements
      // Use a scale of 1 to avoid dimension confusion
      const exportWidth = frame.width + padding * 2;
      const exportHeight = frame.height + padding * 2;
      
      const canvas = await exportToCanvas({
        elements: translatedElements,
        appState: {
          exportBackground: true,
          exportWithDarkMode: false,
          viewBackgroundColor: '#ffffff',
          scrollX: 0,
          scrollY: 0,
          zoom: { value: 1 },
          exportEmbedScene: false,
        },
        files: null,
        getDimensions: () => ({
          width: exportWidth,
          height: exportHeight,
          scale: 1, // Changed from 2 to 1
        }),
      });

      // Convert canvas to base64
      const base64 = canvas.toDataURL('image/png');

      // Add new page for each frame except the first
      if (i > 0) {
        pdf.addPage();
      }

      // Add frame name as title if available
      if (frame.name) {
        pdf.setFontSize(12);
        pdf.setTextColor(100);
        pdf.text(frame.name, margin, margin - 2);
      }

      // Get actual canvas dimensions
      const actualCanvasWidth = canvas.width;
      const actualCanvasHeight = canvas.height;
      
      console.log(`Frame ${i + 1} - Canvas dimensions: ${actualCanvasWidth}x${actualCanvasHeight}, Expected: ${exportWidth}x${exportHeight}`);
      
      // Calculate aspect ratio of the canvas
      const canvasAspect = actualCanvasWidth / actualCanvasHeight;
      
      // Use full page width and calculate height based on aspect ratio
      const finalWidth = pageWidth - (margin * 2);
      const finalHeight = finalWidth / canvasAspect;
      
      // If height exceeds page, scale down
      let actualFinalWidth = finalWidth;
      let actualFinalHeight = finalHeight;
      
      if (finalHeight > pageHeight - (margin * 2)) {
        actualFinalHeight = pageHeight - (margin * 2);
        actualFinalWidth = actualFinalHeight * canvasAspect;
      }

      // Center the image on the page
      const xOffset = (pageWidth - actualFinalWidth) / 2;
      const yOffset = (pageHeight - actualFinalHeight) / 2;

      // Add image to PDF - stretch to fill calculated dimensions
      pdf.addImage(
        base64,
        'PNG',
        xOffset,
        yOffset,
        actualFinalWidth,
        actualFinalHeight,
        undefined,
        'FAST'
      );

      // Add page number
      pdf.setFontSize(10);
      pdf.setTextColor(150);
      pdf.text(
        `${i + 1} / ${frames.length}`,
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      );
    }

    // Restore original view
    excalidrawAPI.updateScene({
      appState: {
        zoom: { value: originalZoom },
        scrollX: originalScrollX,
        scrollY: originalScrollY,
      },
    });

    // Remove loading message
    document.body.removeChild(loadingDiv);

    // Save the PDF
    const filename = `presentation-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);

  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF: ' + error);
    
    // Clean up loading div if still present
    const loadingDiv = document.querySelector('div[style*="Generating PDF"]');
    if (loadingDiv) {
      document.body.removeChild(loadingDiv);
    }
  }
};