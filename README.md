# 🎨 Excalidraw Presenter

A powerful presentation tool built on top of Excalidraw that enables frame-based presentations with smooth animations, PDF export, AI-powered slide generation, and professional presentation controls.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)
![Excalidraw](https://img.shields.io/badge/Excalidraw-0.18.0-purple.svg)

## ✨ Features

- 🖼️ **Frame-Based Presentations** - Use Excalidraw's native frame tool to create presentation slides
- 🤖 **AI-Powered Slide Generation** - Generate slides from text using Google Gemini AI
- 🎬 **Smooth Animations** - Professional zoom and pan transitions between frames
- 📄 **PDF Export** - Export your entire presentation as a PDF document
- 🎯 **Laser Pointer** - Automatically enabled during presentations
- 🎮 **Presentation Controls** - Intuitive keyboard shortcuts and on-screen controls
- 🖥️ **Fullscreen Mode** - Immersive presentation experience
- 🎨 **Full Excalidraw Features** - All drawing and collaboration tools available
- 📝 **Markdown Support** - Create slides from markdown text with automatic parsing

## 🚀 Quick Start

### Prerequisites

- Node.js 16.0 or higher
- npm or yarn package manager
- Git (for cloning the repository)
- Google Gemini API key (optional, for AI features)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/excalidraw-presenter.git
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

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:3000`

## 📖 Usage

### Creating a Presentation

1. **Using Frames**: Draw frames in Excalidraw to define your slides
2. **Using AI Generator**: Click "Generate Slides" to create slides from text
3. **Start Presenting**: Press the presentation button or use `Ctrl/Cmd + P`

### AI Slide Generation

The AI slide generator supports two modes:

**Traditional Markdown Mode:**

```markdown
# Slide 1 Title

Content for slide 1

---

# Slide 2 Title

- Bullet point 1
- Bullet point 2
```

**AI Mode (with Gemini):**
Simply paste any text, and AI will structure it into slides:

```
I want to create a presentation about climate change.
Start with explaining what it is, then discuss the causes,
show some statistics, and end with solutions.
```

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

### Presentation Controls

During a presentation, you'll see:

- **Navigation arrows** for moving between slides
- **Slide counter** showing current position
- **Exit button** to stop presenting
- **PDF export** to save as document

## 🛠️ Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
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
│   ├── components/       # React components
│   │   ├── ExcalidrawWrapper.tsx
│   │   ├── PresentationMode.tsx
│   │   └── SlideGenerator.tsx
│   ├── utils/            # Utility functions
│   │   ├── excalidrawGenerator.ts
│   │   ├── slideParser.ts
│   │   ├── slideParserWithAI.ts
│   │   ├── geminiService.ts
│   │   └── slideTypes.ts
│   ├── App.tsx           # Main application
│   └── main.tsx          # Entry point
├── public/               # Static assets
└── package.json          # Dependencies
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Excalidraw](https://github.com/excalidraw/excalidraw) - The amazing whiteboard tool this project is built upon
- [Virgil Font](https://virgil.excalidraw.com/) - The hand-drawn font used in Excalidraw
- [Google Gemini](https://ai.google.dev/) - AI model for intelligent slide generation
- [React](https://reactjs.org/) - The UI framework
- [Vite](https://vitejs.dev/) - The build tool

## 🐛 Known Issues

- PDF export may take a moment for large presentations
- AI generation requires a valid Gemini API key
- Some complex Excalidraw drawings may not export perfectly to PDF

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Made with ❤️ using Excalidraw
