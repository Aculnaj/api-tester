# API Tester v2

A modern, web-based API testing tool for AI models with a beautiful glassmorphism UI.

## 🌐 Live Demo

Access the hosted version directly at **https://aculnaj.github.io/api-tester**

## ✨ Features

### Generation Types
- **Text Generation** - Chat completions with streaming support
- **Image Generation** - Support for DALL-E 2/3, GPT-IMAGE-1, FLUX, and IMAGEN
- **Audio Generation** - Text-to-Speech (TTS) and Speech-to-Text (STT)
- **Video Generation** - Video generation API support

### Supported Providers
- AetherAPI
- OpenAI Compatible (custom endpoints)
- OpenAI
- OpenRouter
- Gemini (Google)
- Anthropic (Claude)
- DeepSeek
- xAI (Grok)
- Cohere
- Groq
- Cerebras
- Mistral
- Fireworks
- Together
- NovitaAI
- Scaleway
- Nebius
- Baseten
- Replicate
- ElevenLabs

### UI Features
- 🎨 Modern glassmorphism design
- 🌙 Dark/Light/System theme support
- 📱 Responsive layout (mobile-friendly)
- 💾 Local storage for settings persistence
- 📋 Configuration save/export/import
- 📊 Real-time statistics (tokens/sec, latency)
- 🔄 Streaming response support

## 🚀 Usage

### Online
Visit **https://aculnaj.github.io/api-tester** to use the tool directly.

### Local Development
1. Clone the repository
2. Open `index.html` in a modern web browser
3. Or serve with any static file server:
   ```bash
   # Python
   python3 -m http.server 8080
   
   # Node.js
   npx serve
   ```

## 📁 Project Structure

```
├── index.html          # Main HTML file
├── css/
│   ├── variables.css   # CSS custom properties
│   ├── base.css        # Base styles and resets
│   ├── layout.css      # Layout components
│   ├── components.css  # UI components
│   ├── sidebar.css     # Sidebar styles
│   ├── tabs.css        # Tab navigation
│   ├── forms.css       # Form elements
│   ├── buttons.css     # Button styles
│   ├── output.css      # Output area styles
│   └── animations.css  # Animations and transitions
├── js/
│   ├── utils.js        # Utility functions
│   ├── storage.js      # Local storage management
│   ├── app.js          # Main application logic
│   ├── ui/
│   │   ├── theme.js    # Theme management
│   │   ├── tabs.js     # Tab navigation
│   │   ├── sidebar.js  # Sidebar functionality
│   │   ├── forms.js    # Form handling
│   │   └── toast.js    # Toast notifications
│   └── api/
│       ├── providers.js # Provider configurations
│       ├── text.js      # Text generation API
│       ├── image.js     # Image generation API
│       ├── audio.js     # Audio generation API
│       └── video.js     # Video generation API
└── assets/
    └── demo.mp3        # Demo audio for STT testing
```

## 🛠️ Technology

Built with vanilla HTML, CSS, and JavaScript - no build tools or frameworks required.

- **No dependencies** - Runs directly in the browser
- **No build step** - Just open and use
- **GitHub Pages ready** - Static files only

## 📝 License

MIT License

## 👤 Author

Eli
