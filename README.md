# 🎨 Excalidraw Presenter

A powerful presentation tool built on top of Excalidraw that enables frame-based presentations with smooth animations, PDF export, and professional presentation controls.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)
![Excalidraw](https://img.shields.io/badge/Excalidraw-0.18.0-purple.svg)

## ✨ Features

- 🖼️ **Frame-Based Presentations** - Use Excalidraw's native frame tool to create presentation slides
- 🎬 **Smooth Animations** - Professional zoom and pan transitions between frames
- 📄 **PDF Export** - Export your entire presentation as a PDF document
- 🎯 **Laser Pointer** - Automatically enabled during presentations
- 🎮 **Presentation Controls** - Intuitive keyboard shortcuts and on-screen controls
- 🖥️ **Fullscreen Mode** - Immersive presentation experience
- 🎨 **Full Excalidraw Features** - All drawing and collaboration tools available

## 🚀 Quick Start

### Prerequisites

- Node.js 16.0 or higher
- npm or yarn package manager
- Git (for cloning the repository)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dsmolchanov/xpres.so.git
   cd xpres.so
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   or with yarn:
   ```bash
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   or with yarn:
   ```bash
   yarn dev
   ```

4. **Open in browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Creating a Presentation

1. **Open the application** in your browser
2. **Draw your content** using Excalidraw's drawing tools
3. **Create frames** around your content:
   - Press `F` key to activate the Frame tool
   - Draw rectangles around sections of your content
   - Each frame becomes a slide in your presentation
4. **Name your frames** (optional):
   - Double-click on the frame border
   - Enter a descriptive name

### Presenting

1. **Start presentation**:
   - Click the "Start Presentation" button (bottom-right)
   - Or press `P` key
2. **Navigate through slides**:
   - **Next**: Arrow Right (`→`) or Space
   - **Previous**: Arrow Left (`←`)
   - **First slide**: Home key
   - **Last slide**: End key
3. **Exit presentation**:
   - Press `Escape` key
   - Or click the stop button in controls

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Start Presentation | `P` |
| Next Slide | `→` or `Space` |
| Previous Slide | `←` |
| First Slide | `Home` |
| Last Slide | `End` |
| Toggle Fullscreen | `F` |
| Exit Presentation | `Escape` |

### Exporting to PDF

1. Create your frames in Excalidraw
2. Click "Export PDF" button (top-right)
3. Wait for PDF generation (progress shown)
4. PDF downloads automatically with date-stamped filename

## 🏗️ Project Structure

```
xpres.so/
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx            # Application entry point
│   ├── index.css           # Global styles
│   └── utils/
│       └── exportPdf.ts    # PDF export functionality
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🔨 Building for Production

### Build the application

```bash
npm run build
```
or with yarn:
```bash
yarn build
```

The build output will be in the `dist` folder.

### Preview production build

```bash
npm run preview
```
or with yarn:
```bash
yarn preview
```

## 🚢 Deployment

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dsmolchanov/xpres.so)

### Netlify

1. Fork this repository
2. Connect your GitHub account to Netlify
3. Select the repository
4. Deploy with default settings

### Manual Deployment

1. Build the project: `npm run build`
2. Upload the `dist` folder to your web server
3. Configure your server to serve `index.html` for all routes

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t excalidraw-presenter .
docker run -p 8080:80 excalidraw-presenter
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run typecheck` - Run TypeScript type checking

### Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Excalidraw** - Drawing and diagramming library
- **jsPDF** - PDF generation
- **Framer Motion** - Animation library
- **Lucide React** - Icon components

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Bug Reports & Feature Requests

Please use the [GitHub Issues](https://github.com/dsmolchanov/xpres.so/issues) to report bugs or request features.

When reporting bugs, please include:
- Browser version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for full details.

### Third-Party Licenses

This project includes:

- **[Excalidraw](https://github.com/excalidraw/excalidraw)** - MIT License © 2020 Excalidraw
- **Virgil Font** - SIL Open Font License 1.1 © 2020 Excalidraw
- **Excalifont** - SIL Open Font License 1.1 © 2024 Excalidraw

The complete text of all licenses, including the MIT License for this project and the SIL Open Font License (OFL-1.1) for the included fonts, can be found in the [LICENSE](LICENSE) file.

## 🙏 Acknowledgments

- **[Excalidraw](https://github.com/excalidraw/excalidraw)** - The amazing open-source drawing tool that powers this presenter. Excalidraw is released under the MIT License.
- **Excalidraw Fonts** - This project includes Virgil and Excalifont, both released under the OFL-1.1 license, freely available for personal and commercial use.
- **[React](https://reactjs.org/)** - For the robust UI framework
- **[Vite](https://vitejs.dev/)** - For the lightning-fast build tool
- **Open Source Community** - For making projects like this possible through collaborative development

## 📧 Contact

Dmitry Molchanov - [@dsmolchanov](https://github.com/dsmolchanov)

Project Link: [https://github.com/dsmolchanov/xpres.so](https://github.com/dsmolchanov/xpres.so)

## 🌟 Show Your Support

If you find this project useful, please consider giving it a star ⭐ on GitHub!

---

Made with ❤️ by [Dmitry Molchanov](https://github.com/dsmolchanov)