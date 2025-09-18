# 🎨 Excalidraw Presenter

A powerful presentation tool built on top of Excalidraw that enables frame-based presentations with smooth animations, PDF export, AI-powered slide generation, and professional presentation controls.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)
![Excalidraw](https://img.shields.io/badge/Excalidraw-0.18.0-purple.svg)

## ✨ Features

- 🖼️ **Frame-Based Presentations** - Use Excalidraw's native frame tool to create presentation slides
- 🤖 **AI-Powered Slide Generation** - Generate slides from text using Google Gemini 2.0 Flash
- 🎬 **Smooth Animations** - Professional zoom and pan transitions between frames
- 📄 **High-Quality PDF Export** - Export presentations with proper frame boundaries and aspect ratios
- 🎯 **Laser Pointer** - Automatically enabled during presentations
- 🎮 **Presentation Controls** - Intuitive keyboard shortcuts and on-screen controls
- 🖥️ **Fullscreen Mode** - Immersive presentation experience
- 🎨 **Full Excalidraw Features** - All drawing and collaboration tools available
- 📝 **Markdown Support** - Create slides from markdown text with automatic parsing
- ✨ **Smart Text Wrapping** - Automatic text wrapping for better slide layouts

## 🚀 Quick Start

### Prerequisites

- Node.js 16.0 or higher
- npm or yarn package manager
- Git (for cloning the repository)
- Google Gemini API key (optional, for AI features)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/dsmolchanov/xpres.so.git
   cd excalidraw-presenter
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables (optional, for AI features)**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Google Gemini API key:

   ```
   VITE_GOOGLE_GEMINI_API_KEY=your_api_key_here
   ```

   You can get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:3000` (or another port if 3000 is busy)

## 📖 Usage

### Creating a Presentation

1. **Using Frames**: Draw frames in Excalidraw to define your slides - each frame becomes a slide
2. **Using AI Generator**: Click "Generate Slides" button to create slides from text
3. **Start Presenting**: Press the presentation button in the toolbar or use keyboard shortcut

### AI Slide Generation

The AI slide generator powered by Google Gemini 2.0 Flash supports two modes:

**Traditional Markdown Mode:**

```markdown
# Slide 1 Title

Content for slide 1

---

# Slide 2 Title

- Bullet point 1
- Bullet point 2

---

# Code Example

\`\`\`javascript
console.log("Hello, World!");
\`\`\`
```

**AI Mode (with Gemini):**
Simply paste any text, and AI will intelligently structure it into slides:

```
I want to create a presentation about climate change.
Start with explaining what it is, then discuss the causes,
show some statistics about temperature rise, and end with
solutions we can implement.
```

The AI will automatically:

- Create logical slide divisions
- Generate appropriate titles
- Format content as bullets where suitable
- Add speaker notes when helpful
- Suggest visual descriptions for complex topics

### Keyboard Shortcuts

| Shortcut      | Action            |
| ------------- | ----------------- |
| `→` / `Space` | Next slide        |
| `←`           | Previous slide    |
| `Esc`         | Exit presentation |
| `F`           | Toggle fullscreen |
| `Home`        | Go to first slide |
| `End`         | Go to last slide  |
| `1-9`         | Jump to slide 1-9 |
| `P`           | Export to PDF     |

### Presentation Controls

During a presentation, you'll see:

- **Navigation arrows** for moving between slides
- **Slide counter** showing current position (e.g., "3 / 10")
- **Exit button** to stop presenting
- **PDF export** button to save as document
- **Fullscreen toggle** for immersive mode

### PDF Export

The PDF export feature:

- Captures complete frame content without cropping
- Maintains proper aspect ratios
- Includes slide names and page numbers
- Exports at high resolution for print quality
- Automatically names files with timestamp

## 🛠️ Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linter
npm run lint

# Type checking
npm run typecheck
```

### Project Structure

```
excalidraw-presenter/
├── src/
│   ├── components/          # React components
│   │   ├── PresentationMode.tsx  # Presentation UI
│   │   └── SlideGenerator.tsx    # AI slide generation UI
│   ├── utils/              # Utility functions
│   │   ├── excalidrawGenerator.ts  # Excalidraw element creation
│   │   ├── exportPdf.ts           # PDF export functionality
│   │   ├── slideParser.ts         # Markdown parsing
│   │   ├── slideParserWithAI.ts   # AI-enhanced parsing
│   │   ├── geminiService.ts       # Gemini API integration
│   │   ├── textWrapper.ts         # Text wrapping utilities
│   │   └── slideTypes.ts          # TypeScript types
│   ├── types/              # Type definitions
│   ├── App.tsx             # Main application
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── .env.example            # Environment variables template
└── package.json            # Dependencies and scripts
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add tests for new features when possible
- Update documentation for API changes
- Keep commits focused and atomic

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Excalidraw](https://github.com/excalidraw/excalidraw) - The amazing whiteboard tool this project is built upon
- [Virgil Font](https://virgil.excalidraw.com/) - The hand-drawn font used in Excalidraw
- [Google Gemini](https://ai.google.dev/) - AI model for intelligent slide generation
- [React](https://reactjs.org/) - The UI framework
- [Vite](https://vitejs.dev/) - The build tool
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation library

## 🚀 Recent Updates

- **Fixed PDF Export**: Complete frame content capture with proper aspect ratios
- **AI Slide Generation**: Integration with Google Gemini 2.0 Flash for intelligent text parsing
- **Smart Text Wrapping**: Automatic text wrapping for better slide layouts
- **Enhanced Export**: Using Excalidraw's native frame export for accurate PDF generation

## 🐛 Known Issues

- PDF export may take a moment for large presentations (this is normal)
- AI generation requires a valid Gemini API key (get one free from Google AI Studio)
- Very large text blocks may need manual adjustment after generation

## 📧 Contact

For questions, bug reports, or feature requests, please [open an issue on GitHub](https://github.com/dsmolchanov/xpres.so/issues).

---

Made with ❤️ using Excalidraw
