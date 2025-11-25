/**
 * API Tester v2 - Audio Generation Module
 * TTS and STT API handling
 */

const AudioAPI = {
    // Current request state
    abortController: null,
    isGenerating: false,

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

        // Build request body
        const requestBody = {
            model: model,
            input: formValues.text.trim(),
            voice: formValues.voice || 'alloy',
            response_format: formValues.format || 'mp3'
        };

        // Get URL and headers
        const baseUrl = Providers.getBaseUrl(providerSettings.provider, providerSettings.baseUrl);
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
        const baseUrl = Providers.getBaseUrl(providerSettings.provider, providerSettings.baseUrl);
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
