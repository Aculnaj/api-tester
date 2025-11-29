/**
 * API Tester v2 - Video Generation Module
 * Video generation API handling with polling support
 */

const VideoAPI = {
    // Current request state
    abortController: null,
    isGenerating: false,
    pollingInterval: null,

    /**
     * Generate video
     * @param {Object} options - Generation options
     * @returns {Promise<Object>} Generation result
     */
    async generate(options) {
        const { providerSettings, formValues } = options;
        
        // Validate inputs
        if (!formValues.prompt.trim()) {
            throw new Error('Please enter a video description');
        }

        if (!providerSettings.apiKey) {
            throw new Error('Please enter an API key');
        }

        // Check if using Gemini for video generation
        if (providerSettings.provider === 'gemini') {
            return this.generateGeminiVideo(providerSettings, formValues);
        }

        this.isGenerating = true;
        this.abortController = new AbortController();

        // Build request body
        const requestBody = {
            prompt: formValues.prompt.trim(),
            duration: formValues.duration || 5
        };

        // Get URL and headers
        const baseUrl = Providers.getBaseUrl(providerSettings.provider, providerSettings.baseUrl);
        const endpoint = formValues.endpoint || '/videos/generations';
        const url = `${baseUrl}${endpoint}`;
        const headers = Providers.getHeaders(providerSettings.provider, providerSettings.apiKey);

        const startTime = performance.now();

        try {
            // Show loading state
            this.showLoading('Initiating video generation...');

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

            // Check if we need to poll for completion
            if (data.id && !data.video_url && !data.url) {
                // Start polling
                const result = await this.pollForCompletion(
                    baseUrl, 
                    data.id, 
                    headers, 
                    providerSettings.provider
                );
                
                const endTime = performance.now();
                this.isGenerating = false;

                return {
                    success: true,
                    videoUrl: result.videoUrl,
                    stats: {
                        totalTime: ((endTime - startTime) / 1000).toFixed(2)
                    },
                    request: requestBody,
                    response: result.data
                };
            }

            // Direct response with video URL
            const endTime = performance.now();
            this.isGenerating = false;

            const videoUrl = data.video_url || data.url || data.data?.[0]?.url;
            this.displayVideo(videoUrl);

            return {
                success: true,
                videoUrl,
                stats: {
                    totalTime: ((endTime - startTime) / 1000).toFixed(2)
                },
                request: requestBody,
                response: data
            };

        } catch (error) {
            this.isGenerating = false;
            this.stopPolling();
            
            if (error.name === 'AbortError') {
                return { success: false, cancelled: true };
            }
            
            throw error;
        }
    },

    /**
     * Generate video using Gemini VEO API
     * @param {Object} providerSettings - Provider settings
     * @param {Object} formValues - Form values
     * @returns {Promise<Object>} Generation result
     */
    async generateGeminiVideo(providerSettings, formValues) {
        this.isGenerating = true;
        this.abortController = new AbortController();

        const startTime = performance.now();
        const baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
        
        // Always use the model selected by the user
        const veoModel = Providers.getModelName(providerSettings);
        
        if (!veoModel) {
            throw new Error('Please select a model for video generation');
        }

        // Build request body for Gemini VEO
        const requestBody = {
            instances: [{
                prompt: formValues.prompt.trim()
            }],
            parameters: {
                aspectRatio: '16:9'
            }
        };

        const headers = {
            'Content-Type': 'application/json',
            'x-goog-api-key': providerSettings.apiKey
        };

        try {
            this.showLoading('Initiating video generation with Gemini VEO...');

            // Start video generation (predictLongRunning)
            const url = `${baseUrl}/models/${veoModel}:predictLongRunning`;
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
            const operationName = data.name;

            if (!operationName) {
                throw new Error('No operation name returned from API');
            }

            // Poll for completion
            const result = await this.pollGeminiOperation(baseUrl, operationName, providerSettings.apiKey);
            
            const endTime = performance.now();
            this.isGenerating = false;

            return {
                success: true,
                videoUrl: result.videoUrl,
                stats: {
                    totalTime: ((endTime - startTime) / 1000).toFixed(2)
                },
                request: requestBody,
                response: result.data
            };

        } catch (error) {
            this.isGenerating = false;
            this.stopPolling();
            
            if (error.name === 'AbortError') {
                return { success: false, cancelled: true };
            }
            
            throw error;
        }
    },

    /**
     * Poll Gemini operation for completion
     * @param {string} baseUrl - Base URL
     * @param {string} operationName - Operation name
     * @param {string} apiKey - API key
     * @returns {Promise<Object>} Result with video URL
     */
    async pollGeminiOperation(baseUrl, operationName, apiKey) {
        const maxAttempts = 120; // 20 minutes with 10 second intervals
        const pollInterval = 10000;
        let attempts = 0;

        return new Promise((resolve, reject) => {
            this.pollingInterval = setInterval(async () => {
                if (!this.isGenerating) {
                    this.stopPolling();
                    reject(new Error('Generation cancelled'));
                    return;
                }

                attempts++;
                
                if (attempts > maxAttempts) {
                    this.stopPolling();
                    reject(new Error('Video generation timed out'));
                    return;
                }

                try {
                    // Update progress
                    this.updateProgress(attempts, maxAttempts, 10);

                    // Check operation status
                    const statusUrl = `${baseUrl}/${operationName}`;
                    const response = await fetch(statusUrl, {
                        method: 'GET',
                        headers: {
                            'x-goog-api-key': apiKey
                        }
                    });

                    if (!response.ok) {
                        throw new Error(`Status check failed: ${response.status}`);
                    }

                    const data = await response.json();

                    if (data.done === true) {
                        this.stopPolling();
                        
                        // Check for error
                        if (data.error) {
                            reject(new Error(data.error.message || 'Video generation failed'));
                            return;
                        }

                        // Extract video URL from response
                        const videoUri = data.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
                        
                        if (!videoUri) {
                            reject(new Error('No video URL in response'));
                            return;
                        }

                        // Download the video
                        const videoUrl = await this.downloadGeminiVideo(videoUri, apiKey);
                        this.displayVideo(videoUrl);
                        resolve({ videoUrl, data });
                    }
                    // Continue polling if not done

                } catch (error) {
                    // Don't stop polling on network errors, just log
                    console.warn('Polling error:', error);
                }
            }, pollInterval);
        });
    },

    /**
     * Download video from Gemini URI
     * @param {string} videoUri - Video URI
     * @param {string} apiKey - API key
     * @returns {Promise<string>} Blob URL
     */
    async downloadGeminiVideo(videoUri, apiKey) {
        const response = await fetch(videoUri, {
            headers: {
                'x-goog-api-key': apiKey
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to download video: ${response.status}`);
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    },

    /**
     * Poll for video generation completion
     * @param {string} baseUrl - Base URL
     * @param {string} jobId - Job ID
     * @param {Object} headers - Request headers
     * @param {string} provider - Provider ID
     * @returns {Promise<Object>} Result with video URL
     */
    async pollForCompletion(baseUrl, jobId, headers, provider) {
        const maxAttempts = 120; // 10 minutes with 5 second intervals
        const pollInterval = 5000;
        let attempts = 0;

        return new Promise((resolve, reject) => {
            this.pollingInterval = setInterval(async () => {
                if (!this.isGenerating) {
                    this.stopPolling();
                    reject(new Error('Generation cancelled'));
                    return;
                }

                attempts++;
                
                if (attempts > maxAttempts) {
                    this.stopPolling();
                    reject(new Error('Video generation timed out'));
                    return;
                }

                try {
                    // Update progress
                    this.updateProgress(attempts, maxAttempts, 5);

                    // Check status
                    const statusUrl = `${baseUrl}/videos/${jobId}`;
                    const response = await fetch(statusUrl, {
                        method: 'GET',
                        headers
                    });

                    if (!response.ok) {
                        throw new Error(`Status check failed: ${response.status}`);
                    }

                    const data = await response.json();
                    const status = data.status || data.state;

                    if (status === 'completed' || status === 'succeeded') {
                        this.stopPolling();
                        const videoUrl = data.video_url || data.url || data.output?.url;
                        this.displayVideo(videoUrl);
                        resolve({ videoUrl, data });
                    } else if (status === 'failed' || status === 'error') {
                        this.stopPolling();
                        reject(new Error(data.error?.message || 'Video generation failed'));
                    }
                    // Continue polling for 'pending', 'processing', etc.

                } catch (error) {
                    // Don't stop polling on network errors, just log
                    console.warn('Polling error:', error);
                }
            }, pollInterval);
        });
    },

    /**
     * Stop polling
     */
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
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
                <div class="output-video-loading">
                    <div class="spinner spinner-lg"></div>
                    <span class="output-video-status">${message}</span>
                    <div class="output-video-progress">
                        <div class="progress">
                            <div class="progress-bar progress-bar-animated" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    /**
     * Update progress display
     * @param {number} current - Current attempt
     * @param {number} max - Max attempts
     * @param {number} intervalSeconds - Interval in seconds
     */
    updateProgress(current, max, intervalSeconds = 5) {
        const outputArea = document.getElementById('output-area');
        if (!outputArea) return;

        const statusEl = outputArea.querySelector('.output-video-status');
        const progressBar = outputArea.querySelector('.progress-bar');

        if (statusEl) {
            const elapsed = current * intervalSeconds;
            statusEl.textContent = `Generating video... (${elapsed}s elapsed)`;
        }

        if (progressBar) {
            // Simulate progress (we don't know actual progress)
            const progress = Math.min((current / max) * 100, 95);
            progressBar.style.width = `${progress}%`;
        }
    },

    /**
     * Display generated video
     * @param {string} videoUrl - Video URL
     */
    displayVideo(videoUrl) {
        const outputArea = document.getElementById('output-area');
        if (!outputArea) return;

        if (!videoUrl) {
            outputArea.innerHTML = `
                <div class="output-error">
                    <svg class="output-error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    <div class="output-error-content">
                        <div class="output-error-title">No video data</div>
                        <div class="output-error-message">The API response did not contain video data.</div>
                    </div>
                </div>
            `;
            return;
        }

        outputArea.innerHTML = `
            <div class="output-video-container">
                <video class="output-video" controls autoplay>
                    <source src="${videoUrl}" type="video/mp4">
                    Your browser does not support the video element.
                </video>
            </div>
            <div class="output-actions">
                <a href="${videoUrl}" download="generated-video.mp4" class="download-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download Video
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
        this.stopPolling();
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

// Make VideoAPI available globally
window.VideoAPI = VideoAPI;
