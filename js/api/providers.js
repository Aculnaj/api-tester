/**
 * API Tester v2 - Providers Module
 * Provider configurations and API endpoint management
 */

const Providers = {
    // CORS Proxy URL
    CORS_PROXY_URL: 'https://corsproxy.el1druz0.workers.dev/',
    
    // Provider configurations
    configs: {
        aetherapi: {
            name: 'AetherAPI',
            baseUrl: 'https://api.aetherapi.dev/v1',
            models: [
                // Anthropic
                'claude-3-5-sonnet-20241022', 'claude-3-7-sonnet-20250219', 'claude-sonnet-4-20250514',
                'claude-sonnet-4-5-20250929', 'claude-opus-4-5-20251101', 'claude-3-5-haiku-20241022',
                'claude-haiku-4-5-20251001', 'claude-opus-4-1-20250805', 'claude-opus-4-20250514',
                // DeepSeek
                'deepseek-reasoner', 'deepseek-chat',
                // Google Gemini
                'gemini-2.5-flash-image', 'gemini-3-pro-image-preview', 'gemini-3-pro-preview',
                'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro',
                // Z.AI
                'glm-4.5', 'glm-4.6',
                // OpenAI
                'gpt-oss-120b', 'gpt-oss-20b', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano',
                'gpt-4o', 'gpt-4o-mini', 'gpt-4o-mini-search-preview', 'gpt-4o-search-preview',
                'gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'gpt-5-chat', 'gpt-5-search-api',
                'gpt-5.1', 'gpt-5.1-chat', 'o3', 'o4-mini', 'gpt-5-pro',
                // xAI
                'grok-4.1-fast-reasoning', 'grok-4.1-fast-non-reasoning', 'grok-4', 'grok-code-fast-1',
                // Moonshotai
                'kimi-k2', 'kimi-k2-thinking',
                // MinimaxAI
                'minimax-m2',
                // Meta
                'llama-4-maverick', 'llama-4-scout',
                // Alibaba
                'qwen3-max', 'qwen3-coder',
                // Perplexity
                'sonar-deep-research',
                // Free models
                'gpt-oss-120b-free', 'gpt-oss-20b-free', 'k2-think-free',
                // Embeddings
                'text-embedding-3-large', 'text-embedding-3-small', 'gemini-embedding-001',
                // Image generation
                'flux.1-kontext-max', 'flux.1-kontext-pro', 'flux.1-krea-dev',
                'gpt-image-1', 'imagen-3', 'imagen-4',
                // Audio TTS
                'gpt-4o-mini-tts', 'tts-1',
                // Audio STT
                'gpt-4o-mini-transcribe', 'gpt-4o-transcribe', 'whisper-1',
                // Video
                'sora-2', 'sora-2-pro'
            ],
            supportsStreaming: true,
            supportsModels: true,
            supportedModes: ['text', 'image', 'audio', 'video']
        },
        openai_compatible: {
            name: 'OpenAI Compatible',
            baseUrl: '',
            placeholder: 'https://api.openai.com/v1',
            models: [],
            supportsStreaming: true,
            supportsModels: true,
            supportedModes: ['text', 'image', 'audio', 'video'],
            apiFormat: 'openai'
        },
        gemini_compatible: {
            name: 'Gemini Compatible',
            baseUrl: '',
            placeholder: 'https://generativelanguage.googleapis.com/v1beta',
            models: [],
            supportsStreaming: true,
            supportsModels: true,
            supportedModes: ['text', 'image', 'audio', 'video'],
            apiFormat: 'gemini'
        },
        anthropic_compatible: {
            name: 'Anthropic Compatible',
            baseUrl: '',
            placeholder: 'https://api.anthropic.com/v1',
            models: [],
            supportsStreaming: true,
            supportsModels: false,
            supportedModes: ['text'],
            apiFormat: 'anthropic'
        },
        openai: {
            name: 'OpenAI',
            baseUrl: 'https://api.openai.com/v1',
            models: [
                'gpt-4o', 'gpt-4o-mini', 'gpt-4.1',
                'gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'gpt-5-chat', 'gpt-5.1', 'gpt-5.1-chat',
                'o3', 'o4-mini', 'tts-1', 'whisper-1', 'gpt-4o-mini-tts', 'gpt-4o-mini-transcribe', 'gpt-4o-transcribe'
            ],
            supportsStreaming: true,
            supportsModels: true,
            supportedModes: ['text', 'image', 'audio']
        },
        openrouter: {
            name: 'OpenRouter',
            baseUrl: 'https://openrouter.ai/api/v1',
            models: [],
            supportsStreaming: true,
            supportsModels: true,
            supportedModes: ['text'] // Text2image will be added later
        },
        gemini: {
            name: 'Gemini',
            baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
            models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'],
            supportsStreaming: true,
            supportsModels: true,
            supportedModes: ['text', 'image', 'audio', 'video'],
            apiFormat: 'gemini'
        },
        vertex_ai: {
            name: 'Google Vertex AI',
            baseUrl: 'https://aiplatform.googleapis.com/v1/publishers/google',
            models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'],
            supportsStreaming: true,
            supportsModels: false,
            supportedModes: ['text', 'image', 'audio', 'video'],
            apiFormat: 'gemini'
        },
        anthropic: {
            name: 'Anthropic',
            baseUrl: 'https://api.anthropic.com/v1',
            models: [
                'claude-sonnet-4-5-20250929', 'claude-3-5-sonnet-20241022',
                'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'
            ],
            supportsStreaming: true,
            supportsModels: false,
            supportedModes: ['text'],
            apiFormat: 'anthropic'
        },
        deepseek: {
            name: 'DeepSeek',
            baseUrl: 'https://api.deepseek.com/v1',
            models: ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner'],
            supportsStreaming: true,
            supportsModels: true,
            supportedModes: ['text']
        },
        xai: {
            name: 'xAI',
            baseUrl: 'https://api.x.ai/v1',
            models: ['grok-4.1-fast', 'grok-4', 'grok-4-fast', 'grok-code-fast-1'],
            supportsStreaming: true,
            supportsModels: true,
            supportedModes: ['text', 'image', 'audio']
        },
        cohere: {
            name: 'Cohere',
            baseUrl: 'https://api.cohere.ai/compatibility/v1',
            models: ['command-a-03-2025', 'command-r-plus', 'command-r'],
            supportsStreaming: true,
            supportsModels: true,
            supportedModes: ['text']
        },
        groq: {
            name: 'Groq',
            baseUrl: 'https://api.groq.com/openai/v1',
            models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'],
            supportsStreaming: true,
            supportsModels: true,
            supportedModes: ['text', 'audio']
        },
        cerebras: {
            name: 'Cerebras',
            baseUrl: 'https://api.cerebras.ai/v1',
            models: ['llama-3.3-70b'],
            supportsStreaming: true,
            supportsModels: true,
            supportedModes: ['text']
        },
        mistral: {
            name: 'Mistral',
            baseUrl: 'https://api.mistral.ai/v1',
            models: ['mistral-large-latest', 'mistral-small-latest', 'codestral-latest'],
            supportsStreaming: true,
            supportsModels: true,
            supportedModes: ['text']
        },
        fireworks: {
            name: 'Fireworks',
            baseUrl: 'https://api.fireworks.ai/inference/v1',
            models: ['accounts/fireworks/models/llama-v3p3-70b-instruct'],
            supportsStreaming: true,
            supportsModels: true,
            supportedModes: ['text', 'image', 'audio'],
            imageModels: ['flux-1-schnell-fp8', 'flux-1-dev-fp8', 'stable-diffusion-xl-1024-v1-0'],
            sttOnly: true // Fireworks only supports STT, not TTS
        },
        together: {
            name: 'Together',
            baseUrl: 'https://api.together.xyz/v1',
            models: ['meta-llama/Llama-3.3-70B-Instruct-Turbo'],
            supportsStreaming: true,
            supportsModels: true,
            supportedModes: ['text', 'image', 'audio'],
            imageModels: ['black-forest-labs/FLUX.1-schnell', 'black-forest-labs/FLUX.1-dev', 'stabilityai/stable-diffusion-xl-base-1.0'],
            sttOnly: true // Together only supports STT, not TTS
        },
        novitaai: {
            name: 'NovitaAI',
            baseUrl: 'https://api.novita.ai/openai',
            models: ['meta-llama/llama-3.3-70b-instruct'],
            supportsStreaming: true,
            supportsModels: true,
            supportedModes: ['text', 'image', 'audio', 'video'] //Video will be added later https://api.novita.ai/v3/async/...
        },
        scaleway: {
            name: 'Scaleway',
            baseUrl: 'https://api.scaleway.ai/v1',
            models: ['llama-3.3-70b-instruct'],
            supportsStreaming: true,
            supportsModels: true,
            supportedModes: ['text', 'audio']
        },
        nebius: {
            name: 'Nebius',
            baseUrl: 'https://api.tokenfactory.nebius.com/v1',
            models: ['meta-llama/Llama-3.3-70B-Instruct'],
            supportsStreaming: true,
            supportsModels: true,
            supportedModes: ['text', 'image']
        },
        baseten: {
            name: 'Baseten',
            baseUrl: 'https://inference.baseten.co/v1',
            models: [],
            supportsStreaming: true,
            supportsModels: true,
            supportedModes: ['text', 'image', 'audio']
        },
        replicate: {
            name: 'Replicate',
            baseUrl: 'https://api.replicate.com/v1',
            models: [],
            supportsStreaming: true,
            supportsModels: true,
            supportedModes: ['text', 'image', 'audio', 'video'] // Video will be added later (https://api.replicate.com/v1/models/google/veo-3.1/predictions)
        },
        elevenlabs: {
            name: 'ElevenLabs',
            baseUrl: 'https://api.elevenlabs.io/v1',
            models: ['eleven_multilingual_v2', 'eleven_turbo_v2_5'],
            supportsStreaming: false,
            supportsModels: true,
            supportedModes: ['audio'] // Audio will be fixed later
        }
    },

    /**
     * Get provider configuration
     * @param {string} providerId - Provider ID
     * @returns {Object} Provider config
     */
    getConfig(providerId) {
        return this.configs[providerId] || this.configs.openai_compatible;
    },

    /**
     * Get base URL for provider
     * @param {string} providerId - Provider ID
     * @param {string} customBaseUrl - Custom base URL (for openai_compatible/gemini_compatible)
     * @param {boolean} corsProxyEnabled - Whether to use CORS proxy (default: false)
     * @returns {string} Base URL
     */
    getBaseUrl(providerId, customBaseUrl = '', corsProxyEnabled = false) {
        let baseUrl;
        
        // Providers that use custom base URL
        if (providerId === 'openai_compatible' || providerId === 'gemini_compatible' || providerId === 'anthropic_compatible') {
            baseUrl = customBaseUrl.replace(/\/$/, '');
        } else {
            const config = this.configs[providerId];
            if (!config) return '';
            baseUrl = config.baseUrl || '';
        }
        
        // Apply CORS proxy if enabled
        if (corsProxyEnabled && baseUrl) {
            return this.CORS_PROXY_URL + baseUrl;
        }
        
        return baseUrl;
    },

    /**
     * Get API format for provider
     * @param {string} providerId - Provider ID
     * @returns {string} API format ('openai', 'gemini', 'anthropic')
     */
    getApiFormat(providerId) {
        const config = this.getConfig(providerId);
        return config.apiFormat || 'openai';
    },

    /**
     * Check if provider uses Gemini native API format
     * @param {string} providerId - Provider ID
     * @returns {boolean} Whether provider uses Gemini format
     */
    isGeminiFormat(providerId) {
        return this.getApiFormat(providerId) === 'gemini';
    },

    /**
     * Check if provider uses Anthropic native API format
     * @param {string} providerId - Provider ID
     * @returns {boolean} Whether provider uses Anthropic format
     */
    isAnthropicFormat(providerId) {
        return this.getApiFormat(providerId) === 'anthropic';
    },

    /**
     * Get headers for API request
     * @param {string} providerId - Provider ID
     * @param {string} apiKey - API key
     * @returns {Object} Headers object
     */
    getHeaders(providerId, apiKey) {
        const headers = {
            'Content-Type': 'application/json'
        };

        const apiFormat = this.getApiFormat(providerId);

        if (apiFormat === 'gemini') {
            // Gemini native API uses x-goog-api-key header
            headers['x-goog-api-key'] = apiKey;
        } else if (apiFormat === 'anthropic') {
            // Anthropic native API uses x-api-key header
            headers['x-api-key'] = apiKey;
            headers['anthropic-version'] = '2023-06-01';
            headers['anthropic-dangerous-direct-browser-access'] = 'true';
        } else {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        if (providerId === 'openrouter') {
            headers['HTTP-Referer'] = window.location.origin;
            headers['X-Title'] = 'API Tester v2';
        }

        return headers;
    },

    /**
     * Get model name to use
     * @param {Object} settings - Provider settings
     * @returns {string} Model name
     */
    getModelName(settings) {
        if (settings.model === 'custom') {
            return settings.customModel || '';
        }
        return settings.model || '';
    },

    /**
     * Fetch available models from provider
     * @param {Object} settings - Provider settings
     * @returns {Promise<Array>} Array of model names
     * @throws {Error} If fetching models fails
     */
    async fetchModels(settings) {
        const { provider, baseUrl, apiKey, corsProxyEnabled } = settings;
        const config = this.getConfig(provider);
        
        if (!config.supportsModels) {
            return config.models || [];
        }

        const url = `${this.getBaseUrl(provider, baseUrl, corsProxyEnabled)}/models`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: this.getHeaders(provider, apiKey)
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        let models = [];
        
        // Handle Gemini native API format: { models: [{ name: "models/gemini-2.5-flash", ... }] }
        if (this.isGeminiFormat(provider) && data.models && Array.isArray(data.models)) {
            // Include all models (generateContent, predict, predictLongRunning, etc.)
            models = data.models
                .map(m => m.name.replace(/^models\//, '')) // Remove "models/" prefix
                .sort();
        }
        // Handle OpenAI format: { data: [{ id: "gpt-4o", ... }] }
        else if (data.data && Array.isArray(data.data)) {
            models = data.data.map(m => m.id).sort();
        }
        
        if (models.length > 0) {
            // Save model list to storage
            Storage.setModelList(models);
            return models;
        }
        
        // If response doesn't have expected format, return default models or empty array
        return config.models || [];
    },

    /**
     * Load saved model list from storage and update dropdown
     */
    loadSavedModels() {
        const savedModels = Storage.getModelList();
        if (savedModels && savedModels.length > 0) {
            // Get saved selected model from provider settings
            const providerSettings = Storage.getProviderSettings();
            const selectedModel = providerSettings.model || null;
            this.updateModelSelect(savedModels, selectedModel);
        }
    },

    /**
     * Update model select dropdown
     * @param {Array} models - Array of model names
     * @param {string} selectedModel - Optional model to select after update
     */
    updateModelSelect(models, selectedModel = null) {
        const modelSelect = document.getElementById('model-select');
        if (!modelSelect) return;

        // Save current value (or use provided selectedModel)
        const currentValue = selectedModel || modelSelect.value;

        // Clear existing options except custom
        modelSelect.innerHTML = '<option value="custom">Custom...</option>';

        // Add models
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });

        // Restore value if it exists in the list
        if (currentValue && currentValue !== 'custom' && models.includes(currentValue)) {
            modelSelect.value = currentValue;
        }
    },

    /**
     * Build chat completion request body
     * @param {Object} options - Request options
     * @returns {Object} Request body
     */
    buildChatRequest(options) {
        const { provider, model, messages, stream, temperature, maxTokens } = options;

        // Use Gemini format for Gemini-based providers
        if (this.isGeminiFormat(provider)) {
            return this.buildGeminiRequest(options);
        }

        // Use Anthropic format for Anthropic-based providers
        if (this.isAnthropicFormat(provider)) {
            return this.buildAnthropicRequest(options);
        }

        const body = {
            model,
            messages
        };

        // Always set stream parameter explicitly
        if (stream === true) {
            body.stream = true;
            // Add stream_options for usage info in streaming mode (OpenAI compatible)
            body.stream_options = { include_usage: true };
        } else {
            body.stream = false;
        }

        if (temperature !== undefined && temperature !== null) {
            body.temperature = temperature;
        }

        if (maxTokens !== undefined && maxTokens !== null) {
            body.max_tokens = maxTokens;
        }

        return body;
    },

    /**
     * Build Anthropic native API request body
     * @param {Object} options - Request options
     * @returns {Object} Request body for Anthropic API
     */
    buildAnthropicRequest(options) {
        const { model, messages, stream, temperature, maxTokens } = options;

        const body = {
            model,
            messages: [],
            max_tokens: maxTokens || 4096 // Anthropic requires max_tokens
        };

        // Process messages - extract system prompt and convert format
        for (const msg of messages) {
            if (msg.role === 'system') {
                // System is a separate field in Anthropic API
                body.system = typeof msg.content === 'string'
                    ? msg.content
                    : msg.content.map(p => p.text || '').join('\n');
            } else {
                // Convert content to Anthropic format
                body.messages.push({
                    role: msg.role,
                    content: this.buildAnthropicContent(msg.content)
                });
            }
        }

        // Set stream parameter
        if (stream === true) {
            body.stream = true;
        }

        if (temperature !== undefined && temperature !== null) {
            body.temperature = temperature;
        }

        return body;
    },

    /**
     * Build Anthropic content array from message content
     * @param {string|Array} content - Message content (string or multi-part array)
     * @returns {Array} Anthropic content array
     */
    buildAnthropicContent(content) {
        // Simple text content - Anthropic accepts string directly
        if (typeof content === 'string') {
            return content;
        }

        // Multi-part content (e.g., text + image)
        if (Array.isArray(content)) {
            return content.map(part => {
                if (part.type === 'text') {
                    return { type: 'text', text: part.text };
                }
                if (part.type === 'image_url') {
                    // Handle image URL - could be base64 or URL
                    const url = part.image_url.url;
                    if (url.startsWith('data:')) {
                        // Base64 encoded image
                        const matches = url.match(/^data:([^;]+);base64,(.+)$/);
                        if (matches) {
                            return {
                                type: 'image',
                                source: {
                                    type: 'base64',
                                    media_type: matches[1],
                                    data: matches[2]
                                }
                            };
                        }
                    }
                    // URL-based image
                    return {
                        type: 'image',
                        source: {
                            type: 'url',
                            url: url
                        }
                    };
                }
                return part;
            });
        }

        return String(content);
    },

    /**
     * Build Gemini native API request body
     * @param {Object} options - Request options
     * @returns {Object} Request body for Gemini API
     */
    buildGeminiRequest(options) {
        const { messages, temperature, maxTokens } = options;

        const body = {
            contents: []
        };

        // Process messages
        for (const msg of messages) {
            if (msg.role === 'system') {
                // System instruction is a separate field in Gemini API
                body.systemInstruction = {
                    parts: [{ text: msg.content }]
                };
            } else {
                // Convert role: assistant -> model for Gemini
                const role = msg.role === 'assistant' ? 'model' : 'user';
                body.contents.push({
                    role,
                    parts: this.buildGeminiParts(msg.content)
                });
            }
        }

        // Generation config
        const generationConfig = {};
        
        if (temperature !== undefined && temperature !== null) {
            generationConfig.temperature = temperature;
        }
        
        if (maxTokens !== undefined && maxTokens !== null) {
            generationConfig.maxOutputTokens = maxTokens;
        }

        // Only add generationConfig if it has properties
        if (Object.keys(generationConfig).length > 0) {
            body.generationConfig = generationConfig;
        }

        return body;
    },

    /**
     * Build Gemini parts array from message content
     * @param {string|Array} content - Message content (string or multi-part array)
     * @returns {Array} Gemini parts array
     */
    buildGeminiParts(content) {
        // Simple text content
        if (typeof content === 'string') {
            return [{ text: content }];
        }

        // Multi-part content (e.g., text + image)
        if (Array.isArray(content)) {
            return content.map(part => {
                if (part.type === 'text') {
                    return { text: part.text };
                }
                if (part.type === 'image_url') {
                    // Handle image URL - could be base64 or URL
                    const url = part.image_url.url;
                    if (url.startsWith('data:')) {
                        // Base64 encoded image
                        const matches = url.match(/^data:([^;]+);base64,(.+)$/);
                        if (matches) {
                            return {
                                inlineData: {
                                    mimeType: matches[1],
                                    data: matches[2]
                                }
                            };
                        }
                    }
                    // URL-based image (Gemini supports file URIs)
                    return {
                        fileData: {
                            fileUri: url,
                            mimeType: 'image/jpeg' // Default, could be detected
                        }
                    };
                }
                return part;
            });
        }

        return [{ text: String(content) }];
    },

    /**
     * Get chat completions endpoint
     * @param {string} provider - Provider ID
     * @param {string} model - Model name (needed for Gemini endpoints)
     * @param {boolean} stream - Whether streaming is enabled
     * @returns {string} Endpoint path
     */
    getChatEndpoint(provider, model = '', stream = false) {
        // Gemini native API endpoints
        if (this.isGeminiFormat(provider)) {
            const action = stream ? 'streamGenerateContent' : 'generateContent';
            const streamParam = stream ? '?alt=sse' : '';
            return `/models/${model}:${action}${streamParam}`;
        }
        
        // Anthropic native API endpoints
        if (this.isAnthropicFormat(provider)) {
            return '/messages';
        }
        
        return '/chat/completions';
    },

    /**
     * Get image generation endpoint
     * @param {string} provider - Provider ID
     * @param {string} model - Model name (needed for Gemini endpoints)
     * @returns {string} Endpoint path
     */
    getImageEndpoint(provider, model = '') {
        // Gemini/Vertex AI uses predict endpoint for Imagen models
        if (this.isGeminiFormat(provider)) {
            return `/models/${model}:predict`;
        }
        // Fireworks AI uses workflows endpoint for image generation
        if (provider === 'fireworks') {
            return `/workflows/accounts/fireworks/models/accounts/fireworks/models/${model}/text_to_image`;
        }
        return '/images/generations';
    },

    /**
     * Get TTS endpoint
     * @param {string} provider - Provider ID
     * @param {string} model - Model name (needed for Gemini endpoints)
     * @returns {string} Endpoint path
     */
    getTTSEndpoint(provider, model = '') {
        // Gemini TTS uses generateContent endpoint
        if (this.isGeminiFormat(provider)) {
            return `/models/${model}:generateContent`;
        }
        return '/audio/speech';
    },

    /**
     * Get STT endpoint
     * @param {string} provider - Provider ID
     * @param {string} model - Model name (needed for Gemini endpoints)
     * @returns {string} Endpoint path
     */
    getSTTEndpoint(provider, model = '') {
        // Gemini STT uses generateContent endpoint (audio understanding)
        if (this.isGeminiFormat(provider)) {
            return `/models/${model}:generateContent`;
        }
        return '/audio/transcriptions';
    },

    /**
     * Get supported modes for a provider
     * @param {string} providerId - Provider ID
     * @returns {Array} Array of supported mode names
     */
    getSupportedModes(providerId) {
        const config = this.getConfig(providerId);
        return config.supportedModes || ['text', 'image', 'audio', 'video'];
    },

    /**
     * Check if a provider supports a specific mode
     * @param {string} providerId - Provider ID
     * @param {string} mode - Mode name (text, image, audio, video)
     * @returns {boolean} Whether the mode is supported
     */
    supportsMode(providerId, mode) {
        const supportedModes = this.getSupportedModes(providerId);
        return supportedModes.includes(mode);
    }
};

// Make Providers available globally
window.Providers = Providers;
