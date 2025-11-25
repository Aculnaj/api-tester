/**
 * API Tester v2 - Main Application
 * Application initialization and coordination
 */

const App = {
    // Application state
    lastResult: null,
    requestPayload: null,
    responsePayload: null,

    /**
     * Initialize the application
     */
    init() {
        // Initialize all modules
        Toast.init();
        Theme.init();
        Tabs.init();
        Sidebar.init();
        Forms.init();

        // Load saved settings
        this.loadSavedSettings();

        // Set up event listeners
        this.setupEventListeners();

        // Set up provider change handler
        this.setupProviderHandler();

        // Set up config management
        this.setupConfigManagement();

        console.log('API Tester v2 initialized');
    },

    /**
     * Load saved settings from storage
     */
    loadSavedSettings() {
        // Load saved model list first (before setting provider settings)
        Providers.loadSavedModels();
        
        // Now set provider settings (including selected model)
        const providerSettings = Storage.getProviderSettings();
        Forms.setProviderSettings(providerSettings);
        
        // Update tabs and get key link for loaded provider
        if (providerSettings.provider) {
            this.updateTabsForProvider(providerSettings.provider);
            this.updateGetKeyLinkVisibility(providerSettings.provider);
        }
        
        // Load text options (prompt, system prompt, advanced options)
        const textOptions = Storage.getTextOptions();
        Forms.setTextOptions(textOptions);
        
        // Load image options (prompt, model type, settings)
        const imageOptions = Storage.getImageOptions();
        Forms.setImageOptions(imageOptions);
        
        // Load audio options (text, voice, format)
        const audioOptions = Storage.getAudioOptions();
        Forms.setAudioOptions(audioOptions);
        
        // Load video options (prompt, endpoint, duration)
        const videoOptions = Storage.getVideoOptions();
        Forms.setVideoOptions(videoOptions);
        
        this.renderSavedConfigs();
    },

    /**
     * Set up main event listeners
     */
    setupEventListeners() {
        const generateBtn = document.getElementById('generate-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.handleGenerate());
        }

        const stopBtn = document.getElementById('stop-btn');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.handleStop());
        }

        const copyResponseBtn = document.getElementById('copy-response-btn');
        if (copyResponseBtn) {
            copyResponseBtn.addEventListener('click', () => this.handleCopyResponse());
        }

        const copyPayloadBtn = document.getElementById('copy-payload-btn');
        if (copyPayloadBtn) {
            copyPayloadBtn.addEventListener('click', () => this.handleCopyPayload());
        }

        document.querySelectorAll('.payload-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handlePayloadTabClick(btn));
        });

        const refreshModelsBtn = document.getElementById('refresh-models-btn');
        if (refreshModelsBtn) {
            refreshModelsBtn.addEventListener('click', () => this.handleRefreshModels());
        }

        const clearAllBtn = document.getElementById('clear-all-data-btn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => this.handleClearAllData());
        }

        this.setupAutoSave();
    },

    /**
     * Set up provider change handler
     */
    setupProviderHandler() {
        const providerSelect = document.getElementById('provider-select');
        if (providerSelect) {
            providerSelect.addEventListener('change', () => {
                const provider = providerSelect.value;
                Forms.updateBaseUrlVisibility(provider);
                const config = Providers.getConfig(provider);
                if (config.models && config.models.length > 0) {
                    Providers.updateModelSelect(config.models);
                }
                this.updateTabsForProvider(provider);
                this.updateGetKeyLinkVisibility(provider);
                this.saveProviderSettings();
            });
            
            // Initialize tabs and get key link for current provider
            this.updateTabsForProvider(providerSelect.value);
            this.updateGetKeyLinkVisibility(providerSelect.value);
        }
    },

    /**
     * Update "Get a key" link visibility based on provider
     * @param {string} provider - Provider ID
     */
    updateGetKeyLinkVisibility(provider) {
        const getKeyLink = document.getElementById('get-key-link');
        if (getKeyLink) {
            // Only show for AetherAPI
            if (provider === 'aetherapi') {
                getKeyLink.classList.remove('hidden');
            } else {
                getKeyLink.classList.add('hidden');
            }
        }
    },

    /**
     * Update tab availability based on provider's supported modes
     * @param {string} provider - Provider ID
     */
    updateTabsForProvider(provider) {
        const tabs = ['text', 'image', 'audio', 'video'];
        const supportedModes = Providers.getSupportedModes(provider);
        
        tabs.forEach(tab => {
            const tabBtn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
            if (tabBtn) {
                const isSupported = supportedModes.includes(tab);
                tabBtn.disabled = !isSupported;
                tabBtn.classList.toggle('is-disabled', !isSupported);
                
                // If current active tab is not supported, switch to first supported tab
                if (!isSupported && tabBtn.classList.contains('is-active')) {
                    const firstSupportedTab = tabs.find(t => supportedModes.includes(t));
                    if (firstSupportedTab) {
                        Tabs.switchTab(firstSupportedTab);
                    }
                }
            }
        });
    },

    /**
     * Set up auto-save for provider settings and text options
     */
    setupAutoSave() {
        // Provider settings auto-save
        const providerInputs = ['provider-select', 'base-url-input', 'api-key-input', 'model-select', 'custom-model-input'];
        providerInputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', () => this.saveProviderSettings());
                if (el.tagName === 'INPUT') {
                    el.addEventListener('input', Utils.debounce(() => this.saveProviderSettings(), 500));
                }
            }
        });

        // Text options auto-save (prompt, system prompt, advanced options)
        const textInputs = ['prompt-input', 'system-prompt-input'];
        textInputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', Utils.debounce(() => this.saveTextOptions(), 500));
            }
        });

        // Text options toggles and selects
        const textToggles = ['enable-system-prompt', 'enable-temperature', 'enable-max-tokens', 'enable-streaming'];
        textToggles.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', () => this.saveTextOptions());
            }
        });

        // Temperature and max tokens inputs
        const textRanges = ['temperature-input', 'max-tokens-input'];
        textRanges.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', Utils.debounce(() => this.saveTextOptions(), 300));
                el.addEventListener('change', () => this.saveTextOptions());
            }
        });

        // Image options auto-save (prompt, model type, settings)
        const imagePromptInput = document.getElementById('image-prompt-input');
        if (imagePromptInput) {
            imagePromptInput.addEventListener('input', Utils.debounce(() => this.saveImageOptions(), 500));
        }

        // Image model type and options
        const imageSelects = [
            'image-model-type',
            'dalle2-size',
            'dalle3-size', 'dalle3-quality',
            'gptimage1-size', 'gptimage1-quality',
            'flux-aspect-ratio',
            'imagen-aspect-ratio'
        ];
        imageSelects.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', () => this.saveImageOptions());
            }
        });

        // Flux steps input
        const fluxStepsInput = document.getElementById('flux-steps');
        if (fluxStepsInput) {
            fluxStepsInput.addEventListener('input', Utils.debounce(() => this.saveImageOptions(), 300));
            fluxStepsInput.addEventListener('change', () => this.saveImageOptions());
        }

        // Audio options auto-save (text, voice, format)
        const ttsTextInput = document.getElementById('tts-text-input');
        if (ttsTextInput) {
            ttsTextInput.addEventListener('input', Utils.debounce(() => this.saveAudioOptions(), 500));
        }

        const audioSelects = ['audio-type-select', 'voice-select', 'audio-format-select'];
        audioSelects.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', () => this.saveAudioOptions());
            }
        });

        // Video options auto-save (prompt, endpoint, duration)
        const videoPromptInput = document.getElementById('video-prompt-input');
        if (videoPromptInput) {
            videoPromptInput.addEventListener('input', Utils.debounce(() => this.saveVideoOptions(), 500));
        }

        const videoSelects = ['video-endpoint-select'];
        videoSelects.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', () => this.saveVideoOptions());
            }
        });

        const videoDurationInput = document.getElementById('video-duration-input');
        if (videoDurationInput) {
            videoDurationInput.addEventListener('input', Utils.debounce(() => this.saveVideoOptions(), 300));
            videoDurationInput.addEventListener('change', () => this.saveVideoOptions());
        }
    },

    /**
     * Save current text options
     */
    saveTextOptions() {
        const options = Forms.getTextFormValues();
        Storage.setTextOptions(options);
    },

    /**
     * Save current image options
     */
    saveImageOptions() {
        const options = Forms.getImageFormValues();
        Storage.setImageOptions(options);
    },

    /**
     * Save current audio options
     */
    saveAudioOptions() {
        const formValues = Forms.getAudioFormValues();
        // Convert to storage format
        const options = {
            audioType: formValues.type,
            text: formValues.text || '',
            voice: formValues.voice || 'alloy',
            format: formValues.format || 'mp3'
        };
        Storage.setAudioOptions(options);
    },

    /**
     * Save current video options
     */
    saveVideoOptions() {
        const options = Forms.getVideoFormValues();
        Storage.setVideoOptions(options);
    },

    /**
     * Save current provider settings
     */
    saveProviderSettings() {
        const settings = Forms.getProviderSettings();
        Storage.setProviderSettings(settings);
    },

    /**
     * Handle generate button click
     */
    async handleGenerate() {
        const activeTab = Tabs.getActiveTab();
        const providerSettings = Forms.getProviderSettings();
        Forms.clearOutput();
        this.toggleGenerateButtons(true);

        try {
            let result;
            switch (activeTab) {
                case 'text':
                    result = await TextAPI.generate({ providerSettings, formValues: Forms.getTextFormValues() });
                    break;
                case 'image':
                    result = await ImageAPI.generate({ providerSettings, formValues: Forms.getImageFormValues() });
                    break;
                case 'audio':
                    result = await AudioAPI.generate({ providerSettings, formValues: Forms.getAudioFormValues() });
                    break;
                case 'video':
                    result = await VideoAPI.generate({ providerSettings, formValues: Forms.getVideoFormValues() });
                    break;
                default:
                    throw new Error('Unknown generation type');
            }

            if (result.success) {
                this.lastResult = result;
                this.requestPayload = result.request;
                this.responsePayload = result.response;
                if (result.stats) this.displayStats(result.stats, activeTab);
                this.showPayloadViewer();
                if (activeTab === 'text') {
                    const copyBtn = document.getElementById('copy-response-btn');
                    if (copyBtn) copyBtn.classList.remove('hidden');
                }
                Toast.success('Generation completed successfully');
            } else if (result.cancelled) {
                Toast.info('Generation cancelled');
            }
        } catch (error) {
            console.error('Generation error:', error);
            // Extract error info if available
            const errorInfo = {
                status: error.status,
                statusText: error.statusText,
                type: error.type
            };
            this.displayError(error.message, errorInfo);
            Toast.error(error.message);
        } finally {
            this.toggleGenerateButtons(false);
        }
    },

    /**
     * Handle stop button click
     */
    handleStop() {
        const activeTab = Tabs.getActiveTab();
        switch (activeTab) {
            case 'text': TextAPI.stop(); break;
            case 'image': ImageAPI.stop(); break;
            case 'audio': AudioAPI.stop(); break;
            case 'video': VideoAPI.stop(); break;
        }
        this.toggleGenerateButtons(false);
        Toast.info('Generation stopped');
    },

    /**
     * Toggle generate/stop buttons
     */
    toggleGenerateButtons(isGenerating) {
        const generateBtn = document.getElementById('generate-btn');
        const stopBtn = document.getElementById('stop-btn');
        if (generateBtn) generateBtn.classList.toggle('hidden', isGenerating);
        if (stopBtn) stopBtn.classList.toggle('hidden', !isGenerating);
    },

    /**
     * Display stats
     */
    displayStats(stats, type) {
        const statsArea = document.getElementById('stats-area');
        if (!statsArea) return;

        let html = '';
        if (stats.totalTime) {
            html += `<div class="stat-item"><span class="stat-label">Total Time</span><span class="stat-value">${stats.totalTime}s</span></div>`;
        }
        if (type === 'text') {
            if (stats.timeToFirstToken) html += `<div class="stat-item"><span class="stat-label">Time to First Token</span><span class="stat-value">${stats.timeToFirstToken}s</span></div>`;
            if (stats.tokensPerSecond) html += `<div class="stat-item"><span class="stat-label">Tokens/Second</span><span class="stat-value stat-value-accent">${stats.tokensPerSecond}</span></div>`;
            if (stats.totalTokens) html += `<div class="stat-item"><span class="stat-label">Total Tokens</span><span class="stat-value">${Utils.formatNumber(stats.totalTokens)}</span></div>`;
            if (stats.promptTokens) html += `<div class="stat-item"><span class="stat-label">Prompt Tokens</span><span class="stat-value">${Utils.formatNumber(stats.promptTokens)}</span></div>`;
            if (stats.completionTokens) html += `<div class="stat-item"><span class="stat-label">Completion Tokens</span><span class="stat-value">${Utils.formatNumber(stats.completionTokens)}</span></div>`;
        }
        if (html) {
            statsArea.innerHTML = html;
            statsArea.classList.remove('hidden');
        }
    },

    /**
     * Display error in output area
     * @param {string} message - Error message
     * @param {Object} errorInfo - Optional error info with status, statusText, type
     */
    displayError(message, errorInfo = {}) {
        const outputArea = document.getElementById('output-area');
        if (outputArea) {
            outputArea.classList.remove('output-area-empty');
            
            // Build error title with status code and type
            let errorTitle = 'Error';
            const parts = [];
            
            if (errorInfo.status) {
                parts.push(`${errorInfo.status}`);
                if (errorInfo.statusText) {
                    parts.push(errorInfo.statusText);
                }
            }
            
            if (errorInfo.type) {
                parts.push(`(${errorInfo.type})`);
            }
            
            if (parts.length > 0) {
                errorTitle = `Error - ${parts.join(' ')}`;
            }
            
            outputArea.innerHTML = `<div class="output-error"><svg class="output-error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg><div class="output-error-content"><div class="output-error-title">${Utils.escapeHtml(errorTitle)}</div><div class="output-error-message">${Utils.escapeHtml(message)}</div></div></div>`;
        }
    },

    /**
     * Show payload viewer
     */
    showPayloadViewer() {
        const payloadViewer = document.getElementById('payload-viewer');
        if (payloadViewer) {
            payloadViewer.classList.remove('hidden');
            // Keep current tab selection, default to 'request' only if none selected
            const activeTab = document.querySelector('.payload-tab-btn.is-active');
            const payloadType = activeTab?.dataset.payload || 'request';
            this.updatePayloadContent(payloadType);
        }
    },

    /**
     * Handle payload tab click
     */
    handlePayloadTabClick(btn) {
        const payloadType = btn.dataset.payload;
        document.querySelectorAll('.payload-tab-btn').forEach(b => b.classList.toggle('is-active', b === btn));
        this.updatePayloadContent(payloadType);
    },

    /**
     * Update payload content
     */
    updatePayloadContent(type) {
        const payloadCode = document.getElementById('payload-code');
        if (!payloadCode) return;
        const data = type === 'request' ? this.requestPayload : this.responsePayload;
        payloadCode.textContent = Utils.stringifyJSON(data);
    },

    /**
     * Handle copy response
     */
    async handleCopyResponse() {
        if (!this.lastResult?.content) {
            Toast.warning('No content to copy');
            return;
        }
        const success = await Utils.copyToClipboard(this.lastResult.content);
        if (success) Toast.success('Response copied to clipboard');
        else Toast.error('Failed to copy to clipboard');
    },

    /**
     * Handle copy payload
     */
    async handleCopyPayload() {
        const payloadCode = document.getElementById('payload-code');
        if (!payloadCode?.textContent) {
            Toast.warning('No payload to copy');
            return;
        }
        const success = await Utils.copyToClipboard(payloadCode.textContent);
        if (success) Toast.success('Payload copied to clipboard');
        else Toast.error('Failed to copy to clipboard');
    },

    /**
     * Handle refresh models
     */
    async handleRefreshModels() {
        const refreshBtn = document.getElementById('refresh-models-btn');
        if (refreshBtn) refreshBtn.classList.add('is-loading');
        try {
            const settings = Forms.getProviderSettings();
            const models = await Providers.fetchModels(settings);
            Providers.updateModelSelect(models);
            Toast.success(`Loaded ${models.length} models`);
        } catch (error) {
            Toast.error('Failed to fetch models');
        } finally {
            if (refreshBtn) refreshBtn.classList.remove('is-loading');
        }
    },

    /**
     * Set up config management
     */
    setupConfigManagement() {
        const saveConfigBtn = document.getElementById('save-config-btn');
        if (saveConfigBtn) saveConfigBtn.addEventListener('click', () => this.handleSaveConfig());

        const exportBtn = document.getElementById('export-configs-btn');
        if (exportBtn) exportBtn.addEventListener('click', () => this.handleExportConfigs());

        const importBtn = document.getElementById('import-configs-btn');
        const importInput = document.getElementById('config-import-input');
        if (importBtn && importInput) {
            importBtn.addEventListener('click', () => importInput.click());
            importInput.addEventListener('change', (e) => this.handleImportConfigs(e));
        }
    },

    /**
     * Handle save config
     */
    handleSaveConfig() {
        const nameInput = document.getElementById('config-name-input');
        const name = nameInput?.value.trim();
        if (!name) {
            Toast.warning('Please enter a configuration name');
            return;
        }
        const settings = Forms.getProviderSettings();
        Storage.saveConfig({ name, ...settings });
        if (nameInput) nameInput.value = '';
        this.renderSavedConfigs();
        Toast.success(`Configuration "${name}" saved`);
    },

    /**
     * Render saved configs list
     */
    renderSavedConfigs() {
        const container = document.getElementById('saved-configs-list');
        if (!container) return;
        const configs = Storage.getSavedConfigs();

        if (configs.length === 0) {
            container.innerHTML = '<div class="saved-configs-empty">No saved configurations yet</div>';
            return;
        }

        container.innerHTML = configs.map(config => `
            <div class="config-item" data-id="${config.id}">
                <div class="config-item-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></div>
                <div class="config-item-info"><div class="config-item-name">${Utils.escapeHtml(config.name)}</div><div class="config-item-provider">${Providers.getConfig(config.provider).name}</div></div>
                <div class="config-item-actions">
                    <button class="config-action-btn restore" title="Restore" data-action="restore"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg></button>
                    <button class="config-action-btn delete" title="Delete" data-action="delete"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.config-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const configItem = btn.closest('.config-item');
                const configId = configItem.dataset.id;
                const action = btn.dataset.action;
                if (action === 'restore') this.handleRestoreConfig(configId);
                else if (action === 'delete') this.handleDeleteConfig(configId);
            });
        });
    },

    /**
     * Handle restore config
     */
    handleRestoreConfig(configId) {
        const config = Storage.getConfigById(configId);
        if (!config) {
            Toast.error('Configuration not found');
            return;
        }
        Forms.setProviderSettings(config);
        this.saveProviderSettings();
        Toast.success(`Configuration "${config.name}" restored`);
    },

    /**
     * Handle delete config
     */
    handleDeleteConfig(configId) {
        const config = Storage.getConfigById(configId);
        if (!config) return;
        if (confirm(`Delete configuration "${config.name}"?`)) {
            Storage.deleteConfig(configId);
            this.renderSavedConfigs();
            Toast.success('Configuration deleted');
        }
    },

    /**
     * Handle export configs
     */
    handleExportConfigs() {
        const configs = Storage.getSavedConfigs();
        if (configs.length === 0) {
            Toast.warning('No configurations to export');
            return;
        }
        const json = Storage.exportConfigs();
        Utils.downloadFile(json, 'api-tester-configs.json', 'application/json');
        Toast.success(`Exported ${configs.length} configurations`);
    },

    /**
     * Handle import configs
     */
    async handleImportConfigs(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const content = await Utils.readFileAsText(file);
            const configs = Utils.parseJSON(content);
            if (!Array.isArray(configs)) throw new Error('Invalid configuration file format');
            const count = Storage.importConfigs(configs);
            this.renderSavedConfigs();
            Toast.success(`Imported ${count} configurations`);
        } catch (error) {
            Toast.error('Failed to import configurations: ' + error.message);
        }
        e.target.value = '';
    },

    /**
     * Handle clear all data
     */
    handleClearAllData() {
        if (confirm('Are you sure you want to clear all saved data? This cannot be undone.')) {
            Storage.clearAll();
            Forms.setProviderSettings({ provider: 'aetherapi', baseUrl: 'https://api.aetherapi.dev/v1', apiKey: '', model: 'gpt-4o', customModel: 'gpt-4o' });
            this.renderSavedConfigs();
            Forms.clearOutput();
            Toast.success('All data cleared');
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());

// Make App available globally
window.App = App;
