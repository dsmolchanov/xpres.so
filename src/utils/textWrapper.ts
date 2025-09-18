// Helper function to wrap text into lines that fit within a certain width
export function wrapText(text: string, maxCharsPerLine: number = 80): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
      currentLine = currentLine ? currentLine + ' ' + word : word;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

// Break long content into multiple shorter lines
export function breakContentIntoLines(content: string[], maxCharsPerLine: number = 80): string[] {
  const allLines: string[] = [];

  for (const paragraph of content) {
    const wrappedLines = wrapText(paragraph, maxCharsPerLine);
    allLines.push(...wrappedLines);
    // Add a blank line between paragraphs if there are multiple
    if (content.length > 1) {
      allLines.push('');
    }
  }

  return allLines;
}
