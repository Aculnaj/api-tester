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
            models: [],
            supportsStreaming: true,
            supportsModels: true,
            supportedModes: ['text', 'image', 'audio', 'video']
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
            baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
            models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'],
            supportsStreaming: true,
            supportsModels: true,
            supportedModes: ['text', 'image', 'audio', 'video'] // VEO will be added later
        },
        anthropic: {
            name: 'Anthropic',
            baseUrl: 'https://api.anthropic.com/v1',
            models: [
                'claude-sonnet-4-5-20250929', 'claude-3-5-sonnet-20241022', 
                'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'
            ],
            supportsStreaming: true,
            supportsModels: true,
            supportedModes: ['text']
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
            supportedModes: ['text', 'image', 'audio']
        },
        together: {
            name: 'Together',
            baseUrl: 'https://api.together.xyz/v1',
            models: ['meta-llama/Llama-3.3-70B-Instruct-Turbo'],
            supportsStreaming: true,
            supportsModels: true,
            supportedModes: ['text', 'image', 'audio']
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
     * @param {string} customBaseUrl - Custom base URL (for openai_compatible)
     * @param {boolean} corsProxyEnabled - Whether to use CORS proxy (default: false)
     * @returns {string} Base URL
     */
    getBaseUrl(providerId, customBaseUrl = '', corsProxyEnabled = false) {
        let baseUrl;
        
        if (providerId === 'openai_compatible') {
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
     * Get headers for API request
     * @param {string} providerId - Provider ID
     * @param {string} apiKey - API key
     * @returns {Object} Headers object
     */
    getHeaders(providerId, apiKey) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (providerId === 'anthropic') {
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
        
        // Extract model IDs from response
        if (data.data && Array.isArray(data.data)) {
            const models = data.data.map(m => m.id).sort();
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

        const body = {
            model,
            messages
        };

        // Always set stream parameter explicitly
        if (stream === true) {
            body.stream = true;
            // Add stream_options for usage info in streaming mode (OpenAI compatible)
            if (provider !== 'anthropic') {
                body.stream_options = { include_usage: true };
            }
        } else {
            body.stream = false;
        }

        if (temperature !== undefined && temperature !== null) {
            body.temperature = temperature;
        }

        if (maxTokens !== undefined && maxTokens !== null) {
            if (provider === 'anthropic') {
                body.max_tokens = maxTokens;
            } else {
                body.max_tokens = maxTokens;
            }
        }

        // Anthropic requires max_tokens
        if (provider === 'anthropic' && !body.max_tokens) {
            body.max_tokens = 4096;
        }

        return body;
    },

    /**
     * Get chat completions endpoint
     * @param {string} provider - Provider ID
     * @returns {string} Endpoint path
     */
    getChatEndpoint(provider) {
        if (provider === 'anthropic') {
            return '/messages';
        }
        return '/chat/completions';
    },

    /**
     * Get image generation endpoint
     * @param {string} provider - Provider ID
     * @returns {string} Endpoint path
     */
    getImageEndpoint(provider) {
        return '/images/generations';
    },

    /**
     * Get TTS endpoint
     * @param {string} provider - Provider ID
     * @returns {string} Endpoint path
     */
    getTTSEndpoint(provider) {
        return '/audio/speech';
    },

    /**
     * Get STT endpoint
     * @param {string} provider - Provider ID
     * @returns {string} Endpoint path
     */
    getSTTEndpoint(provider) {
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
