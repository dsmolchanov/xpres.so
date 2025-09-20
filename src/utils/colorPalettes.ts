export interface ColorPalette {
  name: string;
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  codeBackground: string;
  codeText: string;
}

export const colorPalettes: ColorPalette[] = [
  {
    name: "xpres.so",
    background: "#FFFEF9",      // Warm off-white, zen paper
    surface: "#FAF8F3",         // Slightly warmer surface
    primary: "#2C3E50",         // Calm deep blue-gray for titles
    secondary: "#5A6C7D",       // Softer blue-gray for body text
    accent: "#E67E22",          // Warm sunset orange for emphasis
    border: "#2C3E5033",        // 20% opacity of primary
    codeBackground: "#F8F5ED",  // Warm code background
    codeText: "#D35400"         // Darker orange for code
  },
  {
    name: "Dark Mode",
    background: "#1A1A1A",
    surface: "#2D2D2D",
    primary: "#F0F0F0",
    secondary: "#B8B8B8",
    accent: "#00D9FF",
    border: "#F0F0F033",
    codeBackground: "#0D1117",
    codeText: "#58A6FF"
  },
  {
    name: "Ocean",
    background: "#E8F4F8",
    surface: "#D1E9F0",
    primary: "#1E3A5F",
    secondary: "#4A6FA5",
    accent: "#00ACC1",
    border: "#1E3A5F33",
    codeBackground: "#C5E1E8",
    codeText: "#006064"
  },
  {
    name: "Forest",
    background: "#F5F3E9",
    surface: "#E8E5D8",
    primary: "#2D4A2B",
    secondary: "#4A6349",
    accent: "#FF8F00",
    border: "#2D4A2B33",
    codeBackground: "#E0DCCA",
    codeText: "#6A4C93"
  },
  {
    name: "Sunset",
    background: "#FFF5F5",
    surface: "#FFE8E8",
    primary: "#8B2635",
    secondary: "#B85450",
    accent: "#FF6B35",
    border: "#8B263533",
    codeBackground: "#FFDDD8",
    codeText: "#C73E1D"
  },
  {
    name: "Lavender",
    background: "#F8F5FF",
    surface: "#EDE6FF",
    primary: "#4A148C",
    secondary: "#7B1FA2",
    accent: "#E91E63",
    border: "#4A148C33",
    codeBackground: "#E1D5F5",
    codeText: "#6A1B9A"
  },
  {
    name: "Corporate",
    background: "#F5F5F5",
    surface: "#E8E8E8",
    primary: "#212121",
    secondary: "#616161",
    accent: "#1976D2",
    border: "#21212133",
    codeBackground: "#DEDEDE",
    codeText: "#0D47A1"
  },
  {
    name: "Cyberpunk",
    background: "#0A0A0A",
    surface: "#1A0A1A",
    primary: "#00FF00",
    secondary: "#00CC00",
    accent: "#FF00FF",
    border: "#00FF0033",
    codeBackground: "#0D0D0D",
    codeText: "#FFFF00"
  },
  {
    name: "Paper",
    background: "#F4ECD8",
    surface: "#EBE0C8",
    primary: "#5D4037",
    secondary: "#795548",
    accent: "#D84315",
    border: "#5D403733",
    codeBackground: "#E6D7C3",
    codeText: "#BF360C"
  },
  {
    name: "High Contrast",
    background: "#FFFFFF",
    surface: "#F0F0F0",
    primary: "#000000",
    secondary: "#333333",
    accent: "#FF0000",
    border: "#00000033",
    codeBackground: "#E0E0E0",
    codeText: "#0000FF"
  }
];

export const getDefaultPalette = (): ColorPalette => colorPalettes[0];

export const getPaletteByName = (name: string): ColorPalette | undefined => {
  return colorPalettes.find(p => p.name === name);
};

export const getPaletteByIndex = (index: number): ColorPalette => {
  return colorPalettes[Math.abs(index) % colorPalettes.length];
};
