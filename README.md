# 🌍 Tongues Frontend

React + TypeScript frontend for the Tongues real-time audio translation application.

## ✨ Features

- 🎤 **Live Audio Recording** - Real-time microphone input with noise suppression
- 🌍 **Multi-Language Support** - 12+ languages with beautiful flag icons
- 🔄 **Real-Time Translation** - Live translation display with WebSocket integration
- 📱 **Responsive Design** - Modern UI that works on all devices
- 🎨 **Beautiful Interface** - Gradient backgrounds, smooth animations, intuitive controls

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Modern web browser with microphone access

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 🏗️ Architecture

- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Web Audio API** for real-time audio capture
- **Socket.IO Client** for real-time communication with backend
- **Modern CSS** with gradients, animations, and responsive design

## 🔌 Backend Integration

This frontend connects to the Tongues backend service via WebSocket. Make sure the backend is running on `http://localhost:3001` before testing audio features.

## 📱 Usage

1. **Select Languages**: Choose source and target languages from the dropdowns
2. **Start Recording**: Click the microphone button to begin audio capture
3. **Speak Clearly**: Talk into your microphone - the app will process audio in real-time
4. **View Translations**: See translated text appear as you speak
5. **Copy or Speak**: Use the action buttons to copy text or hear it spoken

## 🛠️ Development

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── AudioRecorder.tsx    # Audio capture and streaming
│   ├── LanguageSelector.tsx # Language selection dropdowns
│   └── TranslationDisplay.tsx # Translation results display
├── App.tsx              # Main application component
├── App.css              # Application styles
└── main.tsx             # Application entry point
```

## 🌐 Supported Languages

- 🇺🇸 English (en)
- 🇪🇸 Spanish (es)
- 🇫🇷 French (fr)
- 🇩🇪 German (de)
- 🇮🇹 Italian (it)
- 🇵🇹 Portuguese (pt)
- 🇷🇺 Russian (ru)
- 🇯🇵 Japanese (ja)
- 🇰🇷 Korean (ko)
- 🇨🇳 Chinese (zh)
- 🇸🇦 Arabic (ar)
- 🇮🇳 Hindi (hi)

## 🔒 Privacy & Security

- Audio processing happens on the backend
- No audio data is stored in the frontend
- WebSocket connections are secured
- Microphone access requires user permission

## 🚀 Deployment

```bash
# Build the application
npm run build

# Deploy the dist/ folder to your hosting service
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

---

**Part of the Tongues Audio Translation Platform**
