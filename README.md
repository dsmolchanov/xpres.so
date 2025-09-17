# Excalidraw Presenter

An enhanced Excalidraw application with frame-by-frame presentation capabilities, featuring smooth zoom and pan animations.

## Features

- **Frame Management**: Create and manage presentation frames with custom viewports
- **Smooth Animations**: Animated transitions between frames with zoom and pan effects
- **Presentation Mode**: Full-screen presentation with navigation controls
- **Keyboard Shortcuts**:
  - `→` or `Space`: Next frame
  - `←`: Previous frame
  - `Home`: First frame
  - `End`: Last frame
  - `Escape`: Exit presentation
  - `F`: Toggle fullscreen

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Build

```bash
npm run build
```

## Usage

1. **Create your drawing** in Excalidraw
2. **Add frames** by positioning the canvas and clicking "Add Frame" in the sidebar
3. **Name your frames** by clicking the edit icon
4. **Start presenting** by clicking the play button or pressing 'P'
5. **Navigate** using keyboard shortcuts or on-screen controls

## How It Works

Each frame captures:
- Current viewport position (x, y)
- Zoom level
- Canvas dimensions

During presentation, the app smoothly animates between these saved viewports, creating a cinematic presentation experience.

## Technologies

- React 18 with TypeScript
- Excalidraw
- Framer Motion for animations
- Vite for fast development
- Lucide React for icons