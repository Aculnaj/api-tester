/**
 * API Tester v2 - Forms Module
 * Form handling, validation, and UI interactions
 */

const Forms = {
    /**
     * Initialize forms module
     */
    init() {
        this.setupPasswordToggles();
        this.setupCollapsibles();
        this.setupToggleOptions();
        this.setupRangeInputs();
        this.setupFileInputs();
        this.setupAudioTypeToggle();
        this.setupModelSelect();
        this.setupImageModelType();
    },

    /**
     * Set up password visibility toggles
     */
    setupPasswordToggles() {
        const toggles = document.querySelectorAll('.password-toggle');
        
        toggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const wrapper = toggle.closest('.password-input-wrapper');
                const input = wrapper.querySelector('input');
                const eyeIcon = toggle.querySelector('.eye-icon');
                const eyeOffIcon = toggle.querySelector('.eye-off-icon');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    eyeIcon.classList.add('hidden');
                    eyeOffIcon.classList.remove('hidden');
                } else {
                    input.type = 'password';
                    eyeIcon.classList.remove('hidden');
                    eyeOffIcon.classList.add('hidden');
                }
            });
        });
    },

    /**
     * Set up collapsible sections
     */
    setupCollapsibles() {
        const triggers = document.querySelectorAll('.collapsible-trigger');
        
        triggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                const collapsible = trigger.closest('.collapsible');
                collapsible.classList.toggle('is-open');
            });
        });
    },

    /**
     * Set up toggle options (checkbox with associated content)
     */
    setupToggleOptions() {
        // System Prompt Toggle
        const systemPromptToggle = document.getElementById('enable-system-prompt');
        const systemPromptGroup = document.getElementById('system-prompt-group');
        if (systemPromptToggle && systemPromptGroup) {
            systemPromptToggle.addEventListener('change', () => {
                systemPromptGroup.classList.toggle('hidden', !systemPromptToggle.checked);
            });
        }

        // Temperature Toggle
        const temperatureToggle = document.getElementById('enable-temperature');
        const temperatureGroup = document.getElementById('temperature-group');
        if (temperatureToggle && temperatureGroup) {
            temperatureToggle.addEventListener('change', () => {
                temperatureGroup.classList.toggle('hidden', !temperatureToggle.checked);
            });
        }

        // Max Tokens Toggle
        const maxTokensToggle = document.getElementById('enable-max-tokens');
        const maxTokensGroup = document.getElementById('max-tokens-group');
        if (maxTokensToggle && maxTokensGroup) {
            maxTokensToggle.addEventListener('change', () => {
                maxTokensGroup.classList.toggle('hidden', !maxTokensToggle.checked);
            });
        }
    },

    /**
     * Set up range inputs with value display
     */
    setupRangeInputs() {
        const temperatureInput = document.getElementById('temperature-input');
        const temperatureValue = document.getElementById('temperature-value');
        
        if (temperatureInput && temperatureValue) {
            temperatureInput.addEventListener('input', () => {
                temperatureValue.textContent = parseFloat(temperatureInput.value).toFixed(1);
            });
        }
    },

    /**
     * Set up file input drag and drop
     */
    setupFileInputs() {
        const fileWrappers = document.querySelectorAll('.file-input-wrapper');
        
        fileWrappers.forEach(wrapper => {
            const input = wrapper.querySelector('.file-input');
            const label = wrapper.querySelector('.file-input-label');
            const textEl = wrapper.querySelector('.file-input-text');
            
            // Drag events
            ['dragenter', 'dragover'].forEach(eventName => {
                wrapper.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    wrapper.classList.add('is-dragover');
                });
            });
            
            ['dragleave', 'drop'].forEach(eventName => {
                wrapper.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    wrapper.classList.remove('is-dragover');
                });
            });
            
            // File selection
            if (input) {
                input.addEventListener('change', () => {
                    if (input.files && input.files.length > 0) {
                        const file = input.files[0];
                        if (textEl) {
                            textEl.textContent = file.name;
                        }
                        wrapper.classList.add('file-input-selected');
                    } else {
                        if (textEl) {
                            textEl.textContent = 'Drop audio file here or click to browse';
                        }
                        wrapper.classList.remove('file-input-selected');
                    }
                });
            }
        });
    },

    /**
     * Set up audio type toggle (TTS/STT)
     */
    setupAudioTypeToggle() {
        const audioTypeSelect = document.getElementById('audio-type-select');
        const ttsOptions = document.getElementById('tts-options');
        const sttOptions = document.getElementById('stt-options');
        
        if (audioTypeSelect && ttsOptions && sttOptions) {
            audioTypeSelect.addEventListener('change', () => {
                const isTTS = audioTypeSelect.value === 'tts';
                ttsOptions.classList.toggle('hidden', !isTTS);
                sttOptions.classList.toggle('hidden', isTTS);
            });
        }
    },

    /**
     * Set up model select with custom option
     */
    setupModelSelect() {
        const modelSelect = document.getElementById('model-select');
        const customModelInput = document.getElementById('custom-model-input');
        
        if (modelSelect && customModelInput) {
            modelSelect.addEventListener('change', () => {
                const isCustom = modelSelect.value === 'custom';
                customModelInput.classList.toggle('hidden', !isCustom);
                if (isCustom) {
                    customModelInput.focus();
                }
            });
        }
    },

    /**
     * Set up image model type toggle
     */
    setupImageModelType() {
        const modelTypeSelect = document.getElementById('image-model-type');
        const optionsContainer = document.getElementById('image-options-container');
        
        if (modelTypeSelect && optionsContainer) {
            modelTypeSelect.addEventListener('change', () => {
                this.updateImageModelOptions(modelTypeSelect.value);
            });
            
            // Initialize with current value
            this.updateImageModelOptions(modelTypeSelect.value);
        }
    },

    /**
     * Update image model options visibility based on model type
     * @param {string} modelType - Selected model type
     */
    updateImageModelOptions(modelType) {
        const optionsContainer = document.getElementById('image-options-container');
        if (!optionsContainer) return;

        // Hide all model-specific options
        const allOptions = optionsContainer.querySelectorAll('.image-model-options');
        allOptions.forEach(opt => opt.classList.add('hidden'));

        // Show container only if not default
        if (modelType === 'default' || !modelType) {
            optionsContainer.classList.add('hidden');
            return;
        }

        // Show container and specific options
        optionsContainer.classList.remove('hidden');
        const specificOptions = document.getElementById(`${modelType}-options`);
        if (specificOptions) {
            specificOptions.classList.remove('hidden');
        }
    },

    /**
     * Get form values for text generation
     * @returns {Object} Form values
     */
    getTextFormValues() {
        const streamingCheckbox = document.getElementById('enable-streaming');
        // Default to true only if checkbox doesn't exist, otherwise use actual checked state
        const streamingEnabled = streamingCheckbox ? streamingCheckbox.checked : true;
        
        return {
            prompt: document.getElementById('prompt-input')?.value || '',
            systemPromptEnabled: document.getElementById('enable-system-prompt')?.checked ?? false,
            systemPrompt: document.getElementById('system-prompt-input')?.value || '',
            temperatureEnabled: document.getElementById('enable-temperature')?.checked ?? false,
            temperature: parseFloat(document.getElementById('temperature-input')?.value) || 1.0,
            maxTokensEnabled: document.getElementById('enable-max-tokens')?.checked ?? false,
            maxTokens: parseInt(document.getElementById('max-tokens-input')?.value) || 4096,
            streamingEnabled: streamingEnabled
        };
    },

    /**
     * Get form values for image generation
     * @returns {Object} Form values
     */
    getImageFormValues() {
        const modelType = document.getElementById('image-model-type')?.value || 'default';
        
        const values = {
            prompt: document.getElementById('image-prompt-input')?.value || '',
            modelType: modelType
        };

        // Add model-specific options based on model type
        switch (modelType) {
            case 'dalle2':
                values.size = document.getElementById('dalle2-size')?.value || '1024x1024';
                break;
            case 'dalle3':
                values.size = document.getElementById('dalle3-size')?.value || '1024x1024';
                values.quality = document.getElementById('dalle3-quality')?.value || 'standard';
                break;
            case 'gptimage1':
                values.size = document.getElementById('gptimage1-size')?.value || '1024x1024';
                values.quality = document.getElementById('gptimage1-quality')?.value || 'auto';
                break;
            case 'flux':
                values.aspectRatio = document.getElementById('flux-aspect-ratio')?.value || '1:1';
                const fluxSteps = document.getElementById('flux-steps')?.value;
                if (fluxSteps && parseInt(fluxSteps) > 0) {
                    values.steps = parseInt(fluxSteps);
                }
                break;
            case 'imagen':
                values.aspectRatio = document.getElementById('imagen-aspect-ratio')?.value || '1:1';
                break;
            default:
                // Default: no additional options
                break;
        }

        return values;
    },

    /**
     * Get form values for audio generation
     * @returns {Object} Form values
     */
    getAudioFormValues() {
        const audioType = document.getElementById('audio-type-select')?.value || 'tts';
        
        if (audioType === 'tts') {
            return {
                type: 'tts',
                text: document.getElementById('tts-text-input')?.value || '',
                voice: document.getElementById('voice-select')?.value || 'alloy',
                format: document.getElementById('audio-format-select')?.value || 'mp3'
            };
        } else {
            return {
                type: 'stt',
                file: document.getElementById('audio-file-input')?.files[0] || null
            };
        }
    },

    /**
     * Get form values for video generation
     * @returns {Object} Form values
     */
    getVideoFormValues() {
        return {
            prompt: document.getElementById('video-prompt-input')?.value || '',
            endpoint: document.getElementById('video-endpoint-select')?.value || '/videos/generations',
            duration: parseInt(document.getElementById('video-duration-input')?.value) || 5
        };
    },

    /**
     * Get provider settings from form
     * @returns {Object} Provider settings
     */
    getProviderSettings() {
        const modelSelect = document.getElementById('model-select');
        const customModelInput = document.getElementById('custom-model-input');
        
        return {
            provider: document.getElementById('provider-select')?.value || 'aetherapi',
            baseUrl: document.getElementById('base-url-input')?.value || 'https://api.aetherapi.dev/v1',
            apiKey: document.getElementById('api-key-input')?.value || '',
            model: modelSelect?.value || 'custom',
            customModel: customModelInput?.value || 'gpt-4o'
        };
    },

    /**
     * Set provider settings in form
     * @param {Object} settings - Provider settings
     */
    setProviderSettings(settings) {
        if (settings.provider) {
            const providerSelect = document.getElementById('provider-select');
            if (providerSelect) providerSelect.value = settings.provider;
        }
        
        if (settings.baseUrl !== undefined) {
            const baseUrlInput = document.getElementById('base-url-input');
            if (baseUrlInput) baseUrlInput.value = settings.baseUrl;
        }
        
        if (settings.apiKey !== undefined) {
            const apiKeyInput = document.getElementById('api-key-input');
            if (apiKeyInput) apiKeyInput.value = settings.apiKey;
        }
        
        if (settings.model) {
            const modelSelect = document.getElementById('model-select');
            if (modelSelect) {
                // Check if the model exists in the dropdown
                const optionExists = Array.from(modelSelect.options).some(opt => opt.value === settings.model);
                if (optionExists) {
                    modelSelect.value = settings.model;
                } else if (settings.model !== 'custom') {
                    // Model not in list, keep it as custom and set customModel
                    modelSelect.value = 'custom';
                }
            }
        }
        
        if (settings.customModel !== undefined) {
            const customModelInput = document.getElementById('custom-model-input');
            if (customModelInput) {
                customModelInput.value = settings.customModel;
                customModelInput.classList.toggle('hidden', settings.model !== 'custom');
            }
        }
        
        // Update base URL visibility
        this.updateBaseUrlVisibility(settings.provider);
    },

    /**
     * Update base URL field visibility based on provider
     * @param {string} provider - Provider name
     */
    updateBaseUrlVisibility(provider) {
        const baseUrlContainer = document.getElementById('base-url-container');
        if (baseUrlContainer) {
            baseUrlContainer.classList.toggle('hidden', provider !== 'openai_compatible');
        }
    },

    /**
     * Set text form values from saved options
     * @param {Object} options - Text options
     */
    setTextOptions(options) {
        // Set prompt
        const promptInput = document.getElementById('prompt-input');
        if (promptInput && options.prompt !== undefined) {
            promptInput.value = options.prompt;
        }

        // Set system prompt enabled
        const systemPromptToggle = document.getElementById('enable-system-prompt');
        const systemPromptGroup = document.getElementById('system-prompt-group');
        if (systemPromptToggle) {
            systemPromptToggle.checked = options.systemPromptEnabled !== false;
            if (systemPromptGroup) {
                systemPromptGroup.classList.toggle('hidden', !systemPromptToggle.checked);
            }
        }

        // Set system prompt
        const systemPromptInput = document.getElementById('system-prompt-input');
        if (systemPromptInput && options.systemPrompt !== undefined) {
            systemPromptInput.value = options.systemPrompt;
        }

        // Set temperature enabled
        const temperatureToggle = document.getElementById('enable-temperature');
        const temperatureGroup = document.getElementById('temperature-group');
        if (temperatureToggle) {
            temperatureToggle.checked = options.temperatureEnabled === true;
            if (temperatureGroup) {
                temperatureGroup.classList.toggle('hidden', !temperatureToggle.checked);
            }
        }

        // Set temperature value
        const temperatureInput = document.getElementById('temperature-input');
        const temperatureValue = document.getElementById('temperature-value');
        if (temperatureInput && options.temperature !== undefined) {
            temperatureInput.value = options.temperature;
            if (temperatureValue) {
                temperatureValue.textContent = parseFloat(options.temperature).toFixed(1);
            }
        }

        // Set max tokens enabled
        const maxTokensToggle = document.getElementById('enable-max-tokens');
        const maxTokensGroup = document.getElementById('max-tokens-group');
        if (maxTokensToggle) {
            maxTokensToggle.checked = options.maxTokensEnabled === true;
            if (maxTokensGroup) {
                maxTokensGroup.classList.toggle('hidden', !maxTokensToggle.checked);
            }
        }

        // Set max tokens value
        const maxTokensInput = document.getElementById('max-tokens-input');
        if (maxTokensInput && options.maxTokens !== undefined) {
            maxTokensInput.value = options.maxTokens;
        }

        // Set streaming enabled
        const streamingToggle = document.getElementById('enable-streaming');
        if (streamingToggle) {
            streamingToggle.checked = options.streamingEnabled !== false;
        }
    },

    /**
     * Set image form values from saved options
     * @param {Object} options - Image options
     */
    setImageOptions(options) {
        // Set prompt
        const promptInput = document.getElementById('image-prompt-input');
        if (promptInput && options.prompt !== undefined) {
            promptInput.value = options.prompt;
        }

        // Set model type
        const modelTypeSelect = document.getElementById('image-model-type');
        if (modelTypeSelect && options.modelType !== undefined) {
            modelTypeSelect.value = options.modelType;
            this.updateImageModelOptions(options.modelType);
        }

        // Set model-specific options
        if (options.modelType) {
            switch (options.modelType) {
                case 'dalle2':
                    const dalle2Size = document.getElementById('dalle2-size');
                    if (dalle2Size && options.size) dalle2Size.value = options.size;
                    break;
                case 'dalle3':
                    const dalle3Size = document.getElementById('dalle3-size');
                    const dalle3Quality = document.getElementById('dalle3-quality');
                    if (dalle3Size && options.size) dalle3Size.value = options.size;
                    if (dalle3Quality && options.quality) dalle3Quality.value = options.quality;
                    break;
                case 'gptimage1':
                    const gptimage1Size = document.getElementById('gptimage1-size');
                    const gptimage1Quality = document.getElementById('gptimage1-quality');
                    if (gptimage1Size && options.size) gptimage1Size.value = options.size;
                    if (gptimage1Quality && options.quality) gptimage1Quality.value = options.quality;
                    break;
                case 'flux':
                    const fluxAspectRatio = document.getElementById('flux-aspect-ratio');
                    const fluxSteps = document.getElementById('flux-steps');
                    if (fluxAspectRatio && options.aspectRatio) fluxAspectRatio.value = options.aspectRatio;
                    if (fluxSteps && options.steps) fluxSteps.value = options.steps;
                    break;
                case 'imagen':
                    const imagenAspectRatio = document.getElementById('imagen-aspect-ratio');
                    if (imagenAspectRatio && options.aspectRatio) imagenAspectRatio.value = options.aspectRatio;
                    break;
            }
        }
    },

    /**
     * Set audio form values from saved options
     * @param {Object} options - Audio options
     */
    setAudioOptions(options) {
        // Set audio type
        const audioTypeSelect = document.getElementById('audio-type-select');
        const ttsOptions = document.getElementById('tts-options');
        const sttOptions = document.getElementById('stt-options');
        
        if (audioTypeSelect && options.audioType !== undefined) {
            audioTypeSelect.value = options.audioType;
            const isTTS = options.audioType === 'tts';
            if (ttsOptions) ttsOptions.classList.toggle('hidden', !isTTS);
            if (sttOptions) sttOptions.classList.toggle('hidden', isTTS);
        }

        // Set TTS text
        const ttsTextInput = document.getElementById('tts-text-input');
        if (ttsTextInput && options.text !== undefined) {
            ttsTextInput.value = options.text;
        }

        // Set voice
        const voiceSelect = document.getElementById('voice-select');
        if (voiceSelect && options.voice !== undefined) {
            voiceSelect.value = options.voice;
        }

        // Set format
        const formatSelect = document.getElementById('audio-format-select');
        if (formatSelect && options.format !== undefined) {
            formatSelect.value = options.format;
        }
    },

    /**
     * Set video form values from saved options
     * @param {Object} options - Video options
     */
    setVideoOptions(options) {
        // Set prompt
        const promptInput = document.getElementById('video-prompt-input');
        if (promptInput && options.prompt !== undefined) {
            promptInput.value = options.prompt;
        }

        // Set endpoint
        const endpointSelect = document.getElementById('video-endpoint-select');
        if (endpointSelect && options.endpoint !== undefined) {
            endpointSelect.value = options.endpoint;
        }

        // Set duration
        const durationInput = document.getElementById('video-duration-input');
        if (durationInput && options.duration !== undefined) {
            durationInput.value = options.duration;
        }
    },

    /**
     * Clear output area
     */
    clearOutput() {
        const outputArea = document.getElementById('output-area');
        if (outputArea) {
            outputArea.innerHTML = `
                <svg class="output-area-empty-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <p class="output-area-empty-text">Response will appear here</p>
            `;
            outputArea.classList.add('output-area-empty');
        }
        
        const statsArea = document.getElementById('stats-area');
        if (statsArea) {
            statsArea.classList.add('hidden');
            statsArea.innerHTML = '';
        }
        
        const payloadViewer = document.getElementById('payload-viewer');
        if (payloadViewer) {
            payloadViewer.classList.add('hidden');
        }
        
        const copyResponseBtn = document.getElementById('copy-response-btn');
        if (copyResponseBtn) {
            copyResponseBtn.classList.add('hidden');
        }
    }
};

// Make Forms available globally
window.Forms = Forms;
