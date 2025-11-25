/**
 * API Tester v2 - Image Generation Module
 * Image generation API handling
 */

const ImageAPI = {
    // Current request state
    abortController: null,
    isGenerating: false,

    /**
     * Generate image
     * @param {Object} options - Generation options
     * @returns {Promise<Object>} Generation result
     */
    async generate(options) {
        const { providerSettings, formValues } = options;
        
        // Validate inputs
        if (!formValues.prompt.trim()) {
            throw new Error('Please enter an image description');
        }

        if (!providerSettings.apiKey) {
            throw new Error('Please enter an API key');
        }

        this.isGenerating = true;
        this.abortController = new AbortController();

        // Build request body based on model type
        const requestBody = this.buildRequestBody(formValues, providerSettings);

        // Get URL and headers
        const baseUrl = Providers.getBaseUrl(providerSettings.provider, providerSettings.baseUrl);
        const endpoint = Providers.getImageEndpoint(providerSettings.provider);
        const url = `${baseUrl}${endpoint}`;
        const headers = Providers.getHeaders(providerSettings.provider, providerSettings.apiKey);

        const startTime = performance.now();

        try {
            // Show loading state
            this.showLoading();

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

            const data = await response.json();
            const endTime = performance.now();

            this.isGenerating = false;

            // Extract image URL or base64
            const imageData = this.extractImageData(data);

            // Display image
            this.displayImage(imageData);

            return {
                success: true,
                imageUrl: imageData.url,
                imageBase64: imageData.base64,
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
     * Build request body based on model type
     * @param {Object} formValues - Form values
     * @param {Object} providerSettings - Provider settings
     * @returns {Object} Request body
     */
    buildRequestBody(formValues, providerSettings) {
        const { prompt, modelType, size, quality, aspectRatio, steps } = formValues;
        
        // Get model name from provider settings
        const modelName = providerSettings.model === 'custom' 
            ? providerSettings.customModel 
            : providerSettings.model;

        const body = {
            prompt: prompt.trim(),
            model: modelName
        };

        switch (modelType) {
            case 'default':
                // Default: only prompt, model, and fixed size (1024x1024)
                // No n parameter, no quality, no other options
                body.size = '1024x1024';
                break;
                
            case 'dalle2':
                // DALL-E 2: size only
                body.size = size || '1024x1024';
                break;
                
            case 'dalle3':
                // DALL-E 3: size and quality
                body.size = size || '1024x1024';
                if (quality) {
                    body.quality = quality;
                }
                break;
                
            case 'gptimage1':
                // GPT-IMAGE-1: size and quality
                body.size = size || '1024x1024';
                if (quality) {
                    body.quality = quality;
                }
                break;
                
            case 'flux':
                // FLUX: aspect_ratio and optional steps
                if (aspectRatio) {
                    body.aspect_ratio = aspectRatio;
                }
                if (steps && steps > 0) {
                    body.steps = steps;
                }
                break;
                
            case 'imagen':
                // IMAGEN: aspect_ratio only
                if (aspectRatio) {
                    body.aspect_ratio = aspectRatio;
                }
                break;
                
            default:
                // Fallback: just prompt and model
                body.size = '1024x1024';
                break;
        }

        return body;
    },

    /**
     * Extract image data from response
     * @param {Object} data - API response
     * @returns {Object} Image data with url or base64
     */
    extractImageData(data) {
        // Handle different response formats
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
            const imageData = data.data[0];
            return {
                url: imageData.url || null,
                base64: imageData.b64_json || null
            };
        }
        
        // Direct URL in response
        if (data.url) {
            return { url: data.url, base64: null };
        }

        // Base64 in response
        if (data.b64_json) {
            return { url: null, base64: data.b64_json };
        }

        return { url: null, base64: null };
    },

    /**
     * Show loading state
     */
    showLoading() {
        const outputArea = document.getElementById('output-area');
        if (outputArea) {
            outputArea.classList.remove('output-area-empty');
            outputArea.innerHTML = `
                <div class="output-image-loading">
                    <div class="spinner spinner-lg"></div>
                    <span class="loading-text">Generating image...</span>
                </div>
            `;
        }
    },

    /**
     * Display generated image
     * @param {Object} imageData - Image data
     */
    displayImage(imageData) {
        const outputArea = document.getElementById('output-area');
        if (!outputArea) return;

        let imageSrc = '';
        if (imageData.url) {
            imageSrc = imageData.url;
        } else if (imageData.base64) {
            imageSrc = `data:image/png;base64,${imageData.base64}`;
        }

        if (!imageSrc) {
            outputArea.innerHTML = `
                <div class="output-error">
                    <svg class="output-error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    <div class="output-error-content">
                        <div class="output-error-title">No image data</div>
                        <div class="output-error-message">The API response did not contain image data.</div>
                    </div>
                </div>
            `;
            return;
        }

        outputArea.innerHTML = `
            <div class="output-image-container">
                <img class="output-image" src="${imageSrc}" alt="Generated image" />
            </div>
            <div class="output-actions">
                <a href="${imageSrc}" download="generated-image.png" class="download-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download Image
                </a>
            </div>
        `;
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

// Make ImageAPI available globally
window.ImageAPI = ImageAPI;
