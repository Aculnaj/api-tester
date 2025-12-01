/**
 * API Tester v2 - Audio Generation Module
 * TTS and STT API handling
 */

const AudioAPI = {
    // Current request state
    abortController: null,
    isGenerating: false,

    // Gemini TTS voice mapping (OpenAI voice -> Gemini voice)
    geminiVoices: {
        'alloy': 'Zephyr',
        'echo': 'Puck',
        'fable': 'Charon',
        'onyx': 'Kore',
        'nova': 'Fenrir',
        'shimmer': 'Leda'
    },

    // All available Gemini voices
    allGeminiVoices: [
        'Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir', 'Leda',
        'Orus', 'Aoede', 'Callirrhoe', 'Autonoe', 'Enceladus', 'Iapetus',
        'Umbriel', 'Algieba', 'Despina', 'Erinome', 'Algenib', 'Rasalgethi',
        'Laomedeia', 'Achernar', 'Alnilam', 'Schedar', 'Gacrux', 'Pulcherrima',
        'Achird', 'Zubenelgenubi', 'Vindemiatrix', 'Sadachbia', 'Sadaltager', 'Sulafat'
    ],

    /**
     * Generate audio (TTS or STT)
     * @param {Object} options - Generation options
     * @returns {Promise<Object>} Generation result
     */
    async generate(options) {
        const { providerSettings, formValues } = options;
        
        if (formValues.type === 'tts') {
            return this.generateTTS(providerSettings, formValues);
        } else {
            return this.generateSTT(providerSettings, formValues);
        }
    },

    /**
     * Check if model is a Gemini TTS model
     * @param {string} model - Model name
     * @returns {boolean} Is Gemini TTS model
     */
    isGeminiTTSModel(model) {
        return model && model.toLowerCase().includes('gemini');
    },

    /**
     * Get Gemini voice name from OpenAI voice
     * @param {string} openaiVoice - OpenAI voice name
     * @returns {string} Gemini voice name
     */
    getGeminiVoice(openaiVoice) {
        return this.geminiVoices[openaiVoice] || 'Kore';
    },

    /**
     * Generate Text-to-Speech
     * @param {Object} providerSettings - Provider settings
     * @param {Object} formValues - Form values
     * @returns {Promise<Object>} Generation result
     */
    async generateTTS(providerSettings, formValues) {
        // Validate inputs
        if (!formValues.text.trim()) {
            throw new Error('Please enter text to convert to speech');
        }

        if (!providerSettings.apiKey) {
            throw new Error('Please enter an API key');
        }

        this.isGenerating = true;
        this.abortController = new AbortController();

        // Get model from provider settings
        const model = Providers.getModelName(providerSettings) || 'tts-1';

        // Check if using Gemini TTS
        if (providerSettings.provider === 'gemini' || this.isGeminiTTSModel(model)) {
            return this.generateGeminiTTS(providerSettings, formValues, model);
        }

        // Build request body for OpenAI-compatible TTS
        const requestBody = {
            model: model,
            input: formValues.text.trim(),
            voice: formValues.voice || 'alloy',
            response_format: formValues.format || 'mp3'
        };

        // Get URL and headers
        const baseUrl = Providers.getBaseUrl(providerSettings.provider, providerSettings.baseUrl, providerSettings.corsProxyEnabled);
        const endpoint = Providers.getTTSEndpoint(providerSettings.provider);
        const url = `${baseUrl}${endpoint}`;
        const headers = Providers.getHeaders(providerSettings.provider, providerSettings.apiKey);

        const startTime = performance.now();

        try {
            // Show loading state
            this.showLoading('Generating audio...');

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody),
                signal: this.abortController.signal
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const error = new Error(errorData.error?.message || `API Error: ${response.status}`);
                error.status = response.status;
                error.statusText = response.statusText;
                error.type = errorData.error?.type || null;
                throw error;
            }

            // Get audio blob
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const endTime = performance.now();

            this.isGenerating = false;

            // Display audio player
            this.displayAudio(audioUrl, formValues.format);

            return {
                success: true,
                audioUrl,
                stats: {
                    totalTime: ((endTime - startTime) / 1000).toFixed(2)
                },
                request: requestBody
            };

        } catch (error) {
            this.isGenerating = false;
            
            if (error.name === 'AbortError') {
                return { success: false, cancelled: true };
            }
            
            throw error;
        }
    },

    /**
     * Generate TTS using Gemini API
     * @param {Object} providerSettings - Provider settings
     * @param {Object} formValues - Form values
     * @param {string} model - Model name
     * @returns {Promise<Object>} Generation result
     */
    async generateGeminiTTS(providerSettings, formValues, model) {
        const startTime = performance.now();
        
        // Always use the model selected by the user
        const ttsModel = model;
        const geminiVoice = this.getGeminiVoice(formValues.voice || 'alloy');

        // Build Gemini TTS request body
        const requestBody = {
            contents: [{
                parts: [{
                    text: formValues.text.trim()
                }]
            }],
            generationConfig: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: geminiVoice
                        }
                    }
                }
            }
        };

        // Build URL with API key
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${ttsModel}:generateContent`;
        const headers = {
            'Content-Type': 'application/json',
            'x-goog-api-key': providerSettings.apiKey
        };

        try {
            this.showLoading('Generating audio with Gemini...');

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody),
                signal: this.abortController.signal
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const error = new Error(errorData.error?.message || `API Error: ${response.status}`);
                error.status = response.status;
                error.statusText = response.statusText;
                throw error;
            }

            const data = await response.json();
            
            // Extract base64 audio data from response
            const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!audioData) {
                throw new Error('No audio data in response');
            }

            // Convert base64 to blob (Gemini returns PCM audio)
            const binaryString = atob(audioData);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            // Create WAV blob from PCM data (s16le, 24000Hz, mono)
            const wavBlob = this.createWavFromPCM(bytes, 24000, 1, 16);
            const audioUrl = URL.createObjectURL(wavBlob);
            
            const endTime = performance.now();
            this.isGenerating = false;

            // Display audio player
            this.displayAudio(audioUrl, 'wav');

            return {
                success: true,
                audioUrl,
                stats: {
                    totalTime: ((endTime - startTime) / 1000).toFixed(2)
                },
                request: requestBody,
                response: data
            };

        } catch (error) {
            this.isGenerating = false;
            
            if (error.name === 'AbortError') {
                return { success: false, cancelled: true };
            }
            
            throw error;
        }
    },

    /**
     * Create WAV file from PCM data
     * @param {Uint8Array} pcmData - Raw PCM data
     * @param {number} sampleRate - Sample rate
     * @param {number} numChannels - Number of channels
     * @param {number} bitsPerSample - Bits per sample
     * @returns {Blob} WAV blob
     */
    createWavFromPCM(pcmData, sampleRate, numChannels, bitsPerSample) {
        const byteRate = sampleRate * numChannels * bitsPerSample / 8;
        const blockAlign = numChannels * bitsPerSample / 8;
        const dataSize = pcmData.length;
        const headerSize = 44;
        const fileSize = headerSize + dataSize;

        const buffer = new ArrayBuffer(fileSize);
        const view = new DataView(buffer);

        // RIFF header
        this.writeString(view, 0, 'RIFF');
        view.setUint32(4, fileSize - 8, true);
        this.writeString(view, 8, 'WAVE');

        // fmt sub-chunk
        this.writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true); // Subchunk1Size
        view.setUint16(20, 1, true); // AudioFormat (PCM)
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, byteRate, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitsPerSample, true);

        // data sub-chunk
        this.writeString(view, 36, 'data');
        view.setUint32(40, dataSize, true);

        // Write PCM data
        const uint8Array = new Uint8Array(buffer);
        uint8Array.set(pcmData, headerSize);

        return new Blob([buffer], { type: 'audio/wav' });
    },

    /**
     * Write string to DataView
     * @param {DataView} view - DataView
     * @param {number} offset - Offset
     * @param {string} string - String to write
     */
    writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    },

    /**
     * Generate Speech-to-Text
     * @param {Object} providerSettings - Provider settings
     * @param {Object} formValues - Form values
     * @returns {Promise<Object>} Generation result
     */
    async generateSTT(providerSettings, formValues) {
        if (!providerSettings.apiKey) {
            throw new Error('Please enter an API key');
        }

        this.isGenerating = true;
        this.abortController = new AbortController();

        // Get model from provider settings
        const model = Providers.getModelName(providerSettings) || 'whisper-1';

        // Check if using Gemini for STT
        if (providerSettings.provider === 'gemini' || this.isGeminiTTSModel(model)) {
            return this.generateGeminiSTT(providerSettings, formValues, model);
        }

        // Get file - use demo.mp3 if no file selected
        let audioFile = formValues.file;
        let usingDemo = false;
        
        if (!audioFile) {
            // Fetch demo.mp3 from assets
            try {
                this.showLoading('Loading demo audio...');
                const response = await fetch('assets/demo.mp3');
                if (!response.ok) {
                    throw new Error('Demo audio file not found');
                }
                const blob = await response.blob();
                audioFile = new File([blob], 'demo.mp3', { type: 'audio/mpeg' });
                usingDemo = true;
            } catch (error) {
                this.isGenerating = false;
                throw new Error('Please select an audio file (demo file not available)');
            }
        }

        // Build form data
        const formData = new FormData();
        formData.append('file', audioFile);
        formData.append('model', model);

        // Get URL and headers (without Content-Type for FormData)
        const baseUrl = Providers.getBaseUrl(providerSettings.provider, providerSettings.baseUrl, providerSettings.corsProxyEnabled);
        const endpoint = Providers.getSTTEndpoint(providerSettings.provider);
        const url = `${baseUrl}${endpoint}`;
        
        const headers = {};
        if (providerSettings.provider === 'anthropic') {
            headers['x-api-key'] = providerSettings.apiKey;
        } else {
            headers['Authorization'] = `Bearer ${providerSettings.apiKey}`;
        }

        const startTime = performance.now();

        try {
            // Show loading state
            this.showLoading('Transcribing audio...');

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: formData,
                signal: this.abortController.signal
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const error = new Error(errorData.error?.message || `API Error: ${response.status}`);
                error.status = response.status;
                error.statusText = response.statusText;
                error.type = errorData.error?.type || null;
                throw error;
            }

            const data = await response.json();
            const endTime = performance.now();

            this.isGenerating = false;

            // Display transcription
            const transcription = data.text || '';
            this.displayTranscription(transcription);

            return {
                success: true,
                transcription,
                stats: {
                    totalTime: ((endTime - startTime) / 1000).toFixed(2)
                },
                response: data
            };

        } catch (error) {
            this.isGenerating = false;
            
            if (error.name === 'AbortError') {
                return { success: false, cancelled: true };
            }
            
            throw error;
        }
    },

    /**
     * Generate STT using Gemini API
     * @param {Object} providerSettings - Provider settings
     * @param {Object} formValues - Form values
     * @param {string} model - Model name
     * @returns {Promise<Object>} Generation result
     */
    async generateGeminiSTT(providerSettings, formValues, model) {
        const startTime = performance.now();

        // Get file - use demo.mp3 if no file selected
        let audioFile = formValues.file;
        
        if (!audioFile) {
            try {
                this.showLoading('Loading demo audio...');
                const response = await fetch('assets/demo.mp3');
                if (!response.ok) {
                    throw new Error('Demo audio file not found');
                }
                const blob = await response.blob();
                audioFile = new File([blob], 'demo.mp3', { type: 'audio/mpeg' });
            } catch (error) {
                this.isGenerating = false;
                throw new Error('Please select an audio file (demo file not available)');
            }
        }

        // Read file as base64
        const audioData = await this.fileToBase64(audioFile);
        const mimeType = audioFile.type || 'audio/mp3';

        // Always use the model selected by the user
        const sttModel = model;

        // Build Gemini request body
        const requestBody = {
            contents: [{
                parts: [
                    { text: 'Transcribe this audio clip. Return only the transcription text, nothing else.' },
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: audioData
                        }
                    }
                ]
            }]
        };

        // Build URL with API key
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${sttModel}:generateContent`;
        const headers = {
            'Content-Type': 'application/json',
            'x-goog-api-key': providerSettings.apiKey
        };

        try {
            this.showLoading('Transcribing audio with Gemini...');

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody),
                signal: this.abortController.signal
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const error = new Error(errorData.error?.message || `API Error: ${response.status}`);
                error.status = response.status;
                error.statusText = response.statusText;
                throw error;
            }

            const data = await response.json();
            const endTime = performance.now();

            this.isGenerating = false;

            // Extract transcription from response
            const transcription = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            this.displayTranscription(transcription);

            return {
                success: true,
                transcription,
                content: transcription,
                stats: {
                    totalTime: ((endTime - startTime) / 1000).toFixed(2)
                },
                request: requestBody,
                response: data
            };

        } catch (error) {
            this.isGenerating = false;
            
            if (error.name === 'AbortError') {
                return { success: false, cancelled: true };
            }
            
            throw error;
        }
    },

    /**
     * Convert file to base64 string
     * @param {File} file - File to convert
     * @returns {Promise<string>} Base64 string
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    /**
     * Show loading state
     * @param {string} message - Loading message
     */
    showLoading(message) {
        const outputArea = document.getElementById('output-area');
        if (outputArea) {
            outputArea.classList.remove('output-area-empty');
            outputArea.innerHTML = `
                <div class="output-loading">
                    <div class="spinner spinner-lg"></div>
                    <span class="output-loading-text">${message}</span>
                </div>
            `;
        }
    },

    /**
     * Display audio player
     * @param {string} audioUrl - Audio URL
     * @param {string} format - Audio format
     */
    displayAudio(audioUrl, format) {
        const outputArea = document.getElementById('output-area');
        if (!outputArea) return;

        const mimeType = this.getMimeType(format);

        outputArea.innerHTML = `
            <div class="output-audio-container">
                <audio class="output-audio" controls>
                    <source src="${audioUrl}" type="${mimeType}">
                    Your browser does not support the audio element.
                </audio>
            </div>
            <div class="output-actions">
                <a href="${audioUrl}" download="generated-audio.${format}" class="download-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download Audio
                </a>
            </div>
        `;
    },

    /**
     * Display transcription result
     * @param {string} transcription - Transcription text
     */
    displayTranscription(transcription) {
        const outputArea = document.getElementById('output-area');
        if (!outputArea) return;

        outputArea.innerHTML = `
            <div class="output-text">${Utils.escapeHtml(transcription)}</div>
        `;

        // Show copy button
        const copyBtn = document.getElementById('copy-response-btn');
        if (copyBtn) {
            copyBtn.classList.remove('hidden');
        }
    },

    /**
     * Get MIME type for audio format
     * @param {string} format - Audio format
     * @returns {string} MIME type
     */
    getMimeType(format) {
        const mimeTypes = {
            'mp3': 'audio/mpeg',
            'opus': 'audio/opus',
            'aac': 'audio/aac',
            'flac': 'audio/flac',
            'wav': 'audio/wav'
        };
        return mimeTypes[format] || 'audio/mpeg';
    },

    /**
     * Stop current generation
     */
    stop() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
        this.isGenerating = false;
    },

    /**
     * Check if currently generating
     * @returns {boolean} Is generating
     */
    isActive() {
        return this.isGenerating;
    }
};

// Make AudioAPI available globally
window.AudioAPI = AudioAPI;
