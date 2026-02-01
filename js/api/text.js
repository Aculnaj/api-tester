/**
 * API Tester v2 - Text Generation Module
 * Text/Chat completion API handling with streaming support
 */

const TextAPI = {
    // Current request state
    abortController: null,
    isGenerating: false,

    // Stats
    stats: {
        startTime: 0,
        firstTokenTime: 0,
        endTime: 0,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
    },

    /**
     * Generate text completion
     * @param {Object} options - Generation options
     * @returns {Promise<Object>} Generation result
     */
    async generate(options) {
        const { providerSettings, formValues } = options;
        
        // Validate inputs
        const promptText = (formValues.prompt || '').trim();
        const imageUrl = (formValues.chatImageUrl || '').trim();

        // Image cannot be sent alone (prompt is required)
        if (!promptText) {
            if (imageUrl) {
                throw new Error('Please enter a prompt (image cannot be sent alone)');
            }
            throw new Error('Please enter a prompt');
        }

        if (!providerSettings.apiKey) {
            throw new Error('Please enter an API key');
        }

        const model = Providers.getModelName(providerSettings);
        if (!model) {
            throw new Error('Please select or enter a model');
        }

        // Reset stats
        this.resetStats();
        this.isGenerating = true;
        this.abortController = new AbortController();

        // Build messages array
        const messages = [];

        if (formValues.systemPromptEnabled && formValues.systemPrompt.trim()) {
            messages.push({
                role: 'system',
                content: formValues.systemPrompt.trim()
            });
        }

        // If image is provided, use multi-part content format for chat.completions
        const userMessage = { role: 'user' };

        if (imageUrl) {
            userMessage.content = [
                { type: 'text', text: promptText },
                { type: 'image_url', image_url: { url: imageUrl } }
            ];
        } else {
            userMessage.content = promptText;
        }

        messages.push(userMessage);

        // Build request body
        const requestBody = Providers.buildChatRequest({
            provider: providerSettings.provider,
            model,
            messages,
            stream: formValues.streamingEnabled,
            temperature: formValues.temperatureEnabled ? formValues.temperature : undefined,
            maxTokens: formValues.maxTokensEnabled ? formValues.maxTokens : undefined
        });

        // Get URL and headers
        const baseUrl = Providers.getBaseUrl(providerSettings.provider, providerSettings.baseUrl, providerSettings.corsProxyEnabled);
        const endpoint = Providers.getChatEndpoint(providerSettings.provider, model, formValues.streamingEnabled);
        const url = `${baseUrl}${endpoint}`;
        const headers = Providers.getHeaders(providerSettings.provider, providerSettings.apiKey);

        this.stats.startTime = performance.now();

        try {
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

            let result;
            if (formValues.streamingEnabled) {
                result = await this.handleStreamingResponse(response, providerSettings.provider);
            } else {
                result = await this.handleNonStreamingResponse(response, providerSettings.provider);
            }

            this.stats.endTime = performance.now();
            this.isGenerating = false;

            return {
                success: true,
                content: result.content,
                stats: this.getStats(),
                request: requestBody,
                response: result.rawResponse
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
     * Handle streaming response
     * @param {Response} response - Fetch response
     * @param {string} provider - Provider ID
     * @returns {Promise<Object>} Result with content
     */
    async handleStreamingResponse(response, provider) {
        // Use Gemini-specific handler for Gemini format providers
        if (Providers.isGeminiFormat(provider)) {
            return this.handleGeminiStreamingResponse(response);
        }

        // Use Anthropic-specific handler for Anthropic format providers
        if (Providers.isAnthropicFormat(provider)) {
            return this.handleAnthropicStreamingResponse(response);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let content = '';
        let allChunks = []; // Store all chunks for raw response
        let buffer = '';
        let firstChunk = null;

        const outputArea = document.getElementById('output-area');
        if (outputArea) {
            outputArea.classList.remove('output-area-empty');
            outputArea.innerHTML = '<div class="output-text output-text-streaming"></div>';
        }
        const textContainer = outputArea?.querySelector('.output-text');

        try {
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        
                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            allChunks.push(parsed);
                            
                            // Store first chunk for metadata
                            if (!firstChunk) {
                                firstChunk = parsed;
                            }

                            // Record first token time
                            if (!this.stats.firstTokenTime && content === '') {
                                this.stats.firstTokenTime = performance.now();
                            }

                            // Extract content (OpenAI format)
                            const chunk = parsed.choices?.[0]?.delta?.content || '';

                            if (chunk) {
                                content += chunk;
                                if (textContainer) {
                                    textContainer.textContent = content;
                                }
                            }

                            // Update token counts if available
                            if (parsed.usage) {
                                this.stats.promptTokens = parsed.usage.prompt_tokens || 0;
                                this.stats.completionTokens = parsed.usage.completion_tokens || 0;
                                this.stats.totalTokens = parsed.usage.total_tokens || 0;
                            }

                        } catch (e) {
                            // Skip invalid JSON
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }

        // Remove streaming cursor
        if (textContainer) {
            textContainer.classList.remove('output-text-streaming');
        }

        // Build a combined response object that shows the full content
        const rawResponse = firstChunk ? {
            id: firstChunk.id,
            created: firstChunk.created,
            model: firstChunk.model,
            object: 'chat.completion',
            choices: [{
                index: 0,
                message: {
                    role: 'assistant',
                    content: content
                },
                finish_reason: 'stop'
            }],
            usage: this.stats.totalTokens > 0 ? {
                prompt_tokens: this.stats.promptTokens,
                completion_tokens: this.stats.completionTokens,
                total_tokens: this.stats.totalTokens
            } : undefined
        } : null;

        return { content, rawResponse };
    },

    /**
     * Handle Gemini native API streaming response
     * @param {Response} response - Fetch response
     * @returns {Promise<Object>} Result with content
     */
    async handleGeminiStreamingResponse(response) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let content = '';
        let allChunks = [];
        let buffer = '';
        let firstChunk = null;

        const outputArea = document.getElementById('output-area');
        if (outputArea) {
            outputArea.classList.remove('output-area-empty');
            outputArea.innerHTML = '<div class="output-text output-text-streaming"></div>';
        }
        const textContainer = outputArea?.querySelector('.output-text');

        try {
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        
                        if (data === '[DONE]' || !data) continue;

                        try {
                            const parsed = JSON.parse(data);
                            allChunks.push(parsed);
                            
                            // Store first chunk for metadata
                            if (!firstChunk) {
                                firstChunk = parsed;
                            }

                            // Record first token time
                            if (!this.stats.firstTokenTime && content === '') {
                                this.stats.firstTokenTime = performance.now();
                            }

                            // Extract content from Gemini format
                            // Gemini response: { candidates: [{ content: { parts: [{ text: "..." }] } }] }
                            const chunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';

                            if (chunk) {
                                content += chunk;
                                if (textContainer) {
                                    textContainer.textContent = content;
                                }
                            }

                            // Update token counts from Gemini usageMetadata
                            if (parsed.usageMetadata) {
                                this.stats.promptTokens = parsed.usageMetadata.promptTokenCount || 0;
                                this.stats.completionTokens = parsed.usageMetadata.candidatesTokenCount || 0;
                                this.stats.totalTokens = parsed.usageMetadata.totalTokenCount || 0;
                            }

                        } catch (e) {
                            // Skip invalid JSON
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }

        // Remove streaming cursor
        if (textContainer) {
            textContainer.classList.remove('output-text-streaming');
        }

        // Build a combined response object in Gemini format
        const rawResponse = firstChunk ? {
            candidates: [{
                content: {
                    role: 'model',
                    parts: [{ text: content }]
                },
                finishReason: 'STOP'
            }],
            usageMetadata: this.stats.totalTokens > 0 ? {
                promptTokenCount: this.stats.promptTokens,
                candidatesTokenCount: this.stats.completionTokens,
                totalTokenCount: this.stats.totalTokens
            } : undefined
        } : null;

        return { content, rawResponse };
    },

    /**
     * Handle Anthropic native API streaming response
     * @param {Response} response - Fetch response
     * @returns {Promise<Object>} Result with content
     */
    async handleAnthropicStreamingResponse(response) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let content = '';
        let allChunks = [];
        let buffer = '';
        let messageData = null;

        const outputArea = document.getElementById('output-area');
        if (outputArea) {
            outputArea.classList.remove('output-area-empty');
            outputArea.innerHTML = '<div class="output-text output-text-streaming"></div>';
        }
        const textContainer = outputArea?.querySelector('.output-text');

        try {
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    // Anthropic uses "event:" and "data:" lines
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        
                        if (!data) continue;

                        try {
                            const parsed = JSON.parse(data);
                            allChunks.push(parsed);

                            // Handle different event types
                            if (parsed.type === 'message_start') {
                                // Store message metadata
                                messageData = parsed.message;
                                if (messageData?.usage) {
                                    this.stats.promptTokens = messageData.usage.input_tokens || 0;
                                }
                            } else if (parsed.type === 'content_block_delta') {
                                // Record first token time
                                if (!this.stats.firstTokenTime && content === '') {
                                    this.stats.firstTokenTime = performance.now();
                                }

                                // Extract text delta
                                const chunk = parsed.delta?.text || '';
                                if (chunk) {
                                    content += chunk;
                                    if (textContainer) {
                                        textContainer.textContent = content;
                                    }
                                }
                            } else if (parsed.type === 'message_delta') {
                                // Update token counts from final message delta
                                if (parsed.usage) {
                                    this.stats.completionTokens = parsed.usage.output_tokens || 0;
                                    this.stats.totalTokens = this.stats.promptTokens + this.stats.completionTokens;
                                }
                            }

                        } catch (e) {
                            // Skip invalid JSON
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }

        // Remove streaming cursor
        if (textContainer) {
            textContainer.classList.remove('output-text-streaming');
        }

        // Build a combined response object in Anthropic format
        const rawResponse = {
            id: messageData?.id || '',
            type: 'message',
            role: 'assistant',
            content: [{ type: 'text', text: content }],
            model: messageData?.model || '',
            stop_reason: 'end_turn',
            usage: {
                input_tokens: this.stats.promptTokens,
                output_tokens: this.stats.completionTokens
            }
        };

        return { content, rawResponse };
    },

    /**
     * Handle non-streaming response
     * @param {Response} response - Fetch response
     * @param {string} provider - Provider ID
     * @returns {Promise<Object>} Result with content
     */
    async handleNonStreamingResponse(response, provider) {
        const data = await response.json();
        
        this.stats.firstTokenTime = performance.now();

        let content = '';
        
        // Handle different response formats
        if (Providers.isGeminiFormat(provider)) {
            // Gemini native format: { candidates: [{ content: { parts: [{ text: "..." }] } }] }
            content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            
            // Update token counts from Gemini usageMetadata
            if (data.usageMetadata) {
                this.stats.promptTokens = data.usageMetadata.promptTokenCount || 0;
                this.stats.completionTokens = data.usageMetadata.candidatesTokenCount || 0;
                this.stats.totalTokens = data.usageMetadata.totalTokenCount || 0;
            }
        } else if (Providers.isAnthropicFormat(provider)) {
            // Anthropic native format: { content: [{ type: "text", text: "..." }] }
            content = data.content?.[0]?.text || '';
            
            // Update token counts
            if (data.usage) {
                this.stats.promptTokens = data.usage.input_tokens || 0;
                this.stats.completionTokens = data.usage.output_tokens || 0;
                this.stats.totalTokens = this.stats.promptTokens + this.stats.completionTokens;
            }
        } else {
            // OpenAI format
            content = data.choices?.[0]?.message?.content || '';
            
            // Update token counts
            if (data.usage) {
                this.stats.promptTokens = data.usage.prompt_tokens || 0;
                this.stats.completionTokens = data.usage.completion_tokens || 0;
                this.stats.totalTokens = data.usage.total_tokens ||
                    (this.stats.promptTokens + this.stats.completionTokens);
            }
        }

        // Display content
        const outputArea = document.getElementById('output-area');
        if (outputArea) {
            outputArea.classList.remove('output-area-empty');
            outputArea.innerHTML = `<div class="output-text">${Utils.escapeHtml(content)}</div>`;
        }

        return { content, rawResponse: data };
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
     * Reset stats
     */
    resetStats() {
        this.stats = {
            startTime: 0,
            firstTokenTime: 0,
            endTime: 0,
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0
        };
    },

    /**
     * Get formatted stats
     * @returns {Object} Formatted stats
     */
    getStats() {
        const totalTime = (this.stats.endTime - this.stats.startTime) / 1000;
        const timeToFirstToken = this.stats.firstTokenTime 
            ? (this.stats.firstTokenTime - this.stats.startTime) / 1000 
            : 0;
        const tokensPerSecond = totalTime > 0 && this.stats.completionTokens > 0
            ? this.stats.completionTokens / totalTime
            : 0;

        return {
            totalTime: totalTime.toFixed(2),
            timeToFirstToken: timeToFirstToken.toFixed(2),
            tokensPerSecond: tokensPerSecond.toFixed(1),
            promptTokens: this.stats.promptTokens,
            completionTokens: this.stats.completionTokens,
            totalTokens: this.stats.totalTokens
        };
    },

    /**
     * Check if currently generating
     * @returns {boolean} Is generating
     */
    isActive() {
        return this.isGenerating;
    }
};

// Make TextAPI available globally
window.TextAPI = TextAPI;
