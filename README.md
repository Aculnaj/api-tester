# API Tester Desktop

**API Tester Desktop** is a powerful, local-first API testing application built with Electron. It provides a seamless, multi-window interface for interacting with various generative AI models, including text, image, audio, and video generation.

It's designed for developers and enthusiasts who need a reliable and feature-rich tool to test and experiment with different AI provider APIs without leaving their desktop.

---

## ✨ Features

*   **Multi-Provider Support**: Natively supports APIs from OpenAI, Anthropic (Claude), and DeepSeek.
*   **Multi-Modal Generation**:
    *   **Text Generation**: Craft and send prompts to advanced language models.
    *   **Image Generation**: Create images from text descriptions.
    *   **Audio Generation**: Synthesize speech from text.
    *   **Video Generation**: Generate video clips from prompts (provider-dependent).
*   **Secure, Local API Key Storage**: API keys are stored securely on your local machine using `electron-store`. They are never synced to the cloud.
*   **Multi-Window Interface**: Open multiple testing windows simultaneously to compare models or work on different tasks in parallel.
*   **Persistent History**: Your request history is saved locally, allowing you to revisit and reuse previous prompts.
*   **Customizable Themes**: Switch between light and dark themes to match your preference.
*   **Real-time Streaming**: View responses from language models as they are being generated.
*   **Built-in Server**: A local Express.js server handles API requests, keeping all traffic on your machine.

---

## 🛠️ Tech Stack

*   **Framework**: [Electron](https://www.electronjs.org/)
*   **Backend Logic**: [Node.js](https://nodejs.org/) with an [Express.js](https://expressjs.com/) server
*   **Frontend**: HTML, CSS, Vanilla JavaScript
*   **Configuration Storage**: [electron-store](https://github.com/sindresorhus/electron-store)

---

## 🚀 Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/en/download/) (which includes npm) installed on your system.
*   API keys from the AI providers you wish to use (OpenAI, Anthropic, etc.).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/api-tester-desktop.git
    cd api-tester-desktop
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the application:**
    ```bash
    npm start
    ```

4.  **Set API Keys:**
    *   The first time you run the application, you will be prompted to enter your API keys.
    *   You can update them at any time through the "Settings" menu.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
