# 🌍 Tongues Frontend

React + TypeScript frontend for the Tongues real-time audio translation application with **dual-client architecture** for professional translation workflows.

## ✨ Features

- 🎤 **Live Audio Recording** - Real-time microphone input with noise suppression
- 🌍 **Multi-Language Support** - 100+ languages with beautiful flag icons
- 🔄 **Real-Time Translation** - Live translation display with WebSocket integration
- 📱 **Responsive Design** - Modern UI that works on all devices
- 🎨 **Beautiful Interface** - Gradient backgrounds, smooth animations, intuitive controls
- 🚀 **Dual-Client System** - Separate clients for input and translation display
- 💬 **Persistent Chat Bubbles** - Transcriptions and translations don't disappear
- 🎯 **Thought Completion** - Automatically detects when speech is complete

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Modern web browser with microphone access
- Backend server running on port 3001

### Installation
```bash
# Install dependencies
npm install

# Start both clients simultaneously (Recommended)
npm run dev

# Or start individual clients
npm run dev:input      # Input Client on port 5173
npm run dev:translation # Translation Client on port 5174
```

## 🏗️ Architecture

### **Dual-Client System**
```
┌─────────────────┐    WebSocket    ┌─────────────────┐
│   Input Client  │ ←──────────────→ │ Translation     │
│   (Port 5173)   │                 │ Client          │
└─────────────────┘                 │ (Port 5174)     │
         │                          └─────────────────┘
         │ WebSocket
         ▼
┌─────────────────┐
│   Backend       │
│   (Port 3001)   │
└─────────────────┘
```

### **Technology Stack**
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Web Speech API** for real-time speech recognition
- **Socket.IO Client** for real-time communication with backend
- **Modern CSS** with gradients, animations, and responsive design

## 📱 **Client Overview**

### 🎤 **Input Client** (`http://localhost:5173`)
- **Purpose**: Audio recording and transcription
- **Features**:
  - Real-time speech recognition
  - Source language transcription display
  - Persistent transcription bubbles
  - Language selection controls
  - Recording status indicators

### 🌍 **Translation Client** (`http://localhost:5174`)
- **Purpose**: Translation display and management
- **Features**:
  - Real-time translation display
  - Persistent translation bubbles
  - Copy and speak functionality
  - Language pair visualization
  - Connection status monitoring

## 🔌 Backend Integration

This frontend connects to the Tongues backend service via WebSocket. Make sure the backend is running on `http://localhost:3001` before testing audio features.

## 📱 Usage

### **Dual-Client Workflow**
1. **Open Input Client** (`http://localhost:5173`) for recording
2. **Open Translation Client** (`http://localhost:5174`) for viewing translations
3. **Select Languages**: Choose source and target languages from the dropdowns
4. **Start Recording**: Click the microphone button to begin audio capture
5. **Speak Clearly**: Talk into your microphone - the app will process audio in real-time
6. **View Translations**: See translated text appear in the Translation Client
7. **Copy or Speak**: Use the action buttons to copy text or hear it spoken

### **Single-Client Mode**
Use `npm run dev` to run the original combined interface on the default port.

## 🛠️ Development

```bash
# Start both clients simultaneously
npm run dev

# Start individual clients
npm run dev:input      # Input Client on port 5173
npm run dev:translation # Translation Client on port 5174

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
│   ├── TranslationDisplay.tsx # Translation results display
│   ├── InputClient.tsx      # Input client component
│   └── TranslationClient.tsx # Translation client component
├── App.tsx              # Main application component
├── InputApp.tsx         # Input client application
├── TranslationApp.tsx   # Translation client application
├── App.css              # Application styles
├── InputApp.css         # Input client styles
├── TranslationApp.css   # Translation client styles
└── main.tsx             # Application entry point
```

## 🌐 Supported Languages

**100+ languages** supported via Azure Translator API, including:

- 🇺🇸 English (en)
- 🇪🇸 Spanish (es)
- 🇫🇷 French (fr)
- 🇩🇪 German (de)
- 🇮🇹 Italian (it)
- 🇵🇹 Portuguese (pt)
- 🇷🇺 Russian (ru)
- 🇯🇵 Japanese (ja)
- 🇰🇷 Korean (ko)
- 🇨🇳 Chinese Simplified (zh-Hans)
- 🇹🇼 Chinese Traditional (zh-Hant)
- 🇸🇦 Arabic (ar)
- 🇮🇳 Hindi (hi)
- 🇳🇱 Dutch (nl)
- 🇸🇪 Swedish (sv)
- 🇩🇰 Danish (da)
- 🇳🇴 Norwegian (nb)
- 🇫🇮 Finnish (fi)
- 🇵🇱 Polish (pl)
- 🇨🇿 Czech (cs)
- 🇸🇰 Slovak (sk)
- 🇭🇺 Hungarian (hu)
- 🇷🇴 Romanian (ro)
- 🇧🇬 Bulgarian (bg)
- 🇭🇷 Croatian (hr)
- 🇷🇸 Serbian (Latin & Cyrillic)
- 🇸🇮 Slovenian (sl)
- 🇪🇪 Estonian (et)
- 🇱🇻 Latvian (lv)
- 🇱🇹 Lithuanian (lt)
- 🇬🇷 Greek (el)
- 🇹🇷 Turkish (tr)
- 🇺🇦 Ukrainian (uk)
- 🇹🇭 Thai (th)
- 🇻🇳 Vietnamese (vi)
- 🇮🇩 Indonesian (id)
- 🇲🇾 Malay (ms)
- 🇮🇳 Indian Languages (Tamil, Telugu, Kannada, Malayalam, Bangla, Punjabi, Gujarati, Marathi, Odia, Assamese)
- 🇳🇵 Nepali (ne)
- 🇱🇰 Sinhala (si)
- 🇲🇲 Myanmar (my)
- 🇰🇭 Khmer (km)
- 🇱🇦 Lao (lo)
- 🇲🇳 Mongolian (mn-Cyrl)
- 🇰🇿 Kazakh (kk)
- 🇰🇬 Kyrgyz (ky)
- 🇺🇿 Uzbek (uz)
- 🇹🇲 Turkmen (tk)
- 🇹🇯 Tajik (tg)
- 🇦🇫 Pashto (ps)
- 🇮🇷 Persian (fa)
- 🇵🇰 Urdu (ur)
- 🇵🇰 Sindhi (sd)
- 🇭🇰 Cantonese (yue)
- 🇿🇦 African Languages (Afrikaans, Swahili, Somali, Amharic, Hausa, Igbo, Yoruba, Zulu, Xhosa)
- 🇮🇱 Hebrew (he)
- 🇮🇶 Kurdish (ku)
- 🇲🇻 Divehi (dv)
- 🇳🇿 Pacific Languages (Maori, Samoan, Tongan, Fijian, Tahitian)
- 🇨🇦 Indigenous Languages (Inuktitut, Inuinnaqtun)

## 💬 Chat Bubble Features

### **Transcription Bubbles (Input Client)**
- **Real-time display** of speech recognition
- **Status indicators**: Listening, Processing, Complete
- **Timestamps** for each transcription
- **Persistent storage** until manually cleared
- **Thought completion** detection (2-second silence)

### **Translation Bubbles (Translation Client)**
- **Original text** in source language
- **Translated text** in target language
- **Language flags** and names
- **Copy to clipboard** functionality
- **Text-to-speech** for both languages
- **Persistent storage** until manually cleared

## 🔄 How It Works

### **1. Audio Input Flow**
```
🎤 User speaks → 🧠 Speech Recognition → 📝 Transcription Bubble → 🔗 WebSocket → 🌍 Translation Client
```

### **2. Translation Flow**
```
📝 Transcription → 🔗 Backend API → 🌐 Azure Translator → 🔗 WebSocket → 🌍 Translation Bubble
```

### **3. Bubble Lifecycle**
```
🔄 Listening → 📝 Transcribing → ✅ Complete → 🗑️ Clear (optional)
```

## 🎯 Key Features

### **Persistent Storage**
- Transcriptions and translations remain visible
- No data loss during recording sessions
- Manual clear functionality available
- Scrollable history for long conversations

### **Real-time Communication**
- WebSocket-based communication
- Instant updates between clients
- Connection status monitoring
- Automatic reconnection handling

### **Language Management**
- 100+ supported languages
- Easy language swapping
- Visual language indicators
- Consistent language codes

### **User Experience**
- Modern, responsive design
- Smooth animations and transitions
- Clear visual feedback
- Intuitive controls

## 🚨 Troubleshooting

### **Common Issues**

#### **Input Client Not Recording**
- Check microphone permissions
- Ensure Web Speech API is supported
- Verify backend connection

#### **Translation Client Not Receiving Data**
- Check WebSocket connection status
- Verify both clients are running
- Check backend logs for errors

#### **Language Selection Issues**
- Ensure language codes match Azure Translator
- Check enum file for supported languages
- Verify language metadata

### **Debug Steps**
1. Check browser console for errors
2. Verify backend is running on port 3001
3. Check WebSocket connection status
4. Verify Azure Translator API credentials
5. Check network connectivity

## 📱 Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support  
- **Safari**: Limited Web Speech API support
- **Mobile**: Responsive design, touch-friendly

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

## 🔮 Future Enhancements

- **Multi-language support** in single session
- **Voice commands** for client control
- **Export functionality** for conversations
- **User authentication** and history
- **Mobile app** versions
- **Offline translation** capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

---

**🎉 Enjoy your professional dual-client translation experience!**

**Part of the Tongues Audio Translation Platform**
