/**
 * API Tester v2 - Storage Module
 * LocalStorage management for persisting application state
 */

const Storage = {
    // Storage keys
    KEYS: {
        THEME: 'api-tester-theme',
        PROVIDER_SETTINGS: 'api-tester-provider',
        SAVED_CONFIGS: 'api-tester-configs',
        LAST_TAB: 'api-tester-last-tab',
        TEXT_OPTIONS: 'api-tester-text-options',
        IMAGE_OPTIONS: 'api-tester-image-options',
        AUDIO_OPTIONS: 'api-tester-audio-options',
        VIDEO_OPTIONS: 'api-tester-video-options',
        MODEL_LIST: 'api-tester-model-list'
    },

    /**
     * Check if localStorage is available
     * @returns {boolean} Is available
     */
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    },

    /**
     * Get item from localStorage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Stored value or default
     */
    get(key, defaultValue = null) {
        if (!this.isAvailable()) return defaultValue;
        try {
            const item = localStorage.getItem(key);
            if (item === null) return defaultValue;
            return JSON.parse(item);
        } catch (e) {
            console.warn(`Storage.get error for key "${key}":`, e);
            return defaultValue;
        }
    },

    /**
     * Set item in localStorage
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @returns {boolean} Success status
     */
    set(key, value) {
        if (!this.isAvailable()) return false;
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn(`Storage.set error for key "${key}":`, e);
            return false;
        }
    },

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    remove(key) {
        if (!this.isAvailable()) return false;
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.warn(`Storage.remove error for key "${key}":`, e);
            return false;
        }
    },

    /**
     * Clear all API Tester related items from localStorage
     * @returns {boolean} Success status
     */
    clearAll() {
        if (!this.isAvailable()) return false;
        try {
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (e) {
            console.warn('Storage.clearAll error:', e);
            return false;
        }
    },

    // ==================== Theme ====================

    /**
     * Get saved theme preference
     * @returns {string} Theme name ('light', 'dark', or 'system')
     */
    getTheme() {
        return this.get(this.KEYS.THEME, 'dark');
    },

    /**
     * Save theme preference
     * @param {string} theme - Theme name
     */
    setTheme(theme) {
        this.set(this.KEYS.THEME, theme);
    },

    // ==================== Provider Settings ====================

    /**
     * Get provider settings
     * @returns {Object} Provider settings
     */
    getProviderSettings() {
        return this.get(this.KEYS.PROVIDER_SETTINGS, {
            provider: 'openai_compatible',
            baseUrl: '',
            apiKey: '',
            model: 'custom',
            customModel: ''
        });
    },

    /**
     * Save provider settings
     * @param {Object} settings - Provider settings
     */
    setProviderSettings(settings) {
        this.set(this.KEYS.PROVIDER_SETTINGS, settings);
    },

    // ==================== Saved Configurations ====================

    /**
     * Get all saved configurations
     * @returns {Array} Array of saved configs
     */
    getSavedConfigs() {
        return this.get(this.KEYS.SAVED_CONFIGS, []);
    },

    /**
     * Save a new configuration
     * @param {Object} config - Configuration to save
     * @returns {Object} Saved config with ID
     */
    saveConfig(config) {
        const configs = this.getSavedConfigs();
        const newConfig = {
            id: Utils.generateId(),
            name: config.name || 'Unnamed Config',
            createdAt: Date.now(),
            ...config
        };
        configs.push(newConfig);
        this.set(this.KEYS.SAVED_CONFIGS, configs);
        return newConfig;
    },

    /**
     * Update an existing configuration
     * @param {string} id - Config ID
     * @param {Object} updates - Updates to apply
     * @returns {Object|null} Updated config or null
     */
    updateConfig(id, updates) {
        const configs = this.getSavedConfigs();
        const index = configs.findIndex(c => c.id === id);
        if (index === -1) return null;
        configs[index] = { ...configs[index], ...updates, updatedAt: Date.now() };
        this.set(this.KEYS.SAVED_CONFIGS, configs);
        return configs[index];
    },

    /**
     * Delete a configuration
     * @param {string} id - Config ID
     * @returns {boolean} Success status
     */
    deleteConfig(id) {
        const configs = this.getSavedConfigs();
        const filtered = configs.filter(c => c.id !== id);
        if (filtered.length === configs.length) return false;
        this.set(this.KEYS.SAVED_CONFIGS, filtered);
        return true;
    },

    /**
     * Get a configuration by ID
     * @param {string} id - Config ID
     * @returns {Object|null} Config or null
     */
    getConfigById(id) {
        const configs = this.getSavedConfigs();
        return configs.find(c => c.id === id) || null;
    },

    /**
     * Import configurations from JSON
     * @param {Array} importedConfigs - Configs to import
     * @param {boolean} replace - Replace existing configs
     * @returns {number} Number of imported configs
     */
    importConfigs(importedConfigs, replace = false) {
        if (!Array.isArray(importedConfigs)) return 0;
        
        let configs = replace ? [] : this.getSavedConfigs();
        let count = 0;
        
        importedConfigs.forEach(config => {
            // Validate config structure
            if (config && typeof config === 'object' && config.name) {
                const newConfig = {
                    id: Utils.generateId(),
                    name: config.name,
                    createdAt: Date.now(),
                    provider: config.provider || 'openai_compatible',
                    baseUrl: config.baseUrl || '',
                    apiKey: config.apiKey || '',
                    model: config.model || 'custom',
                    customModel: config.customModel || ''
                };
                configs.push(newConfig);
                count++;
            }
        });
        
        this.set(this.KEYS.SAVED_CONFIGS, configs);
        return count;
    },

    /**
     * Export configurations as JSON string
     * @returns {string} JSON string of configs
     */
    exportConfigs() {
        const configs = this.getSavedConfigs();
        // Remove sensitive data (API keys) from export
        const sanitizedConfigs = configs.map(config => ({
            name: config.name,
            provider: config.provider,
            baseUrl: config.baseUrl,
            model: config.model,
            customModel: config.customModel
            // API key is intentionally excluded
        }));
        return Utils.stringifyJSON(sanitizedConfigs);
    },

    // ==================== Last Active Tab ====================

    /**
     * Get last active tab
     * @returns {string} Tab name
     */
    getLastTab() {
        return this.get(this.KEYS.LAST_TAB, 'text');
    },

    /**
     * Save last active tab
     * @param {string} tab - Tab name
     */
    setLastTab(tab) {
        this.set(this.KEYS.LAST_TAB, tab);
    },

    // ==================== Generation Options ====================

    /**
     * Get text generation options
     * @returns {Object} Text options
     */
    getTextOptions() {
        return this.get(this.KEYS.TEXT_OPTIONS, {
            systemPromptEnabled: true,
            systemPrompt: '',
            temperatureEnabled: false,
            temperature: 1.0,
            maxTokensEnabled: false,
            maxTokens: 4096,
            streamingEnabled: true
        });
    },

    /**
     * Save text generation options
     * @param {Object} options - Text options
     */
    setTextOptions(options) {
        this.set(this.KEYS.TEXT_OPTIONS, options);
    },

    /**
     * Get image generation options
     * @returns {Object} Image options
     */
    getImageOptions() {
        return this.get(this.KEYS.IMAGE_OPTIONS, {
            prompt: '',
            modelType: 'default',
            size: '1024x1024',
            quality: 'standard',
            aspectRatio: '1:1'
        });
    },

    /**
     * Save image generation options
     * @param {Object} options - Image options
     */
    setImageOptions(options) {
        this.set(this.KEYS.IMAGE_OPTIONS, options);
    },

    /**
     * Get audio generation options
     * @returns {Object} Audio options
     */
    getAudioOptions() {
        return this.get(this.KEYS.AUDIO_OPTIONS, {
            audioType: 'tts',
            text: '',
            voice: 'alloy',
            format: 'mp3'
        });
    },

    /**
     * Save audio generation options
     * @param {Object} options - Audio options
     */
    setAudioOptions(options) {
        this.set(this.KEYS.AUDIO_OPTIONS, options);
    },

    /**
     * Get video generation options
     * @returns {Object} Video options
     */
    getVideoOptions() {
        return this.get(this.KEYS.VIDEO_OPTIONS, {
            prompt: '',
            endpoint: '/videos/generations',
            duration: 5
        });
    },

    /**
     * Save video generation options
     * @param {Object} options - Video options
     */
    setVideoOptions(options) {
        this.set(this.KEYS.VIDEO_OPTIONS, options);
    },

    // ==================== Model List ====================

    /**
     * Get saved model list
     * @returns {Array} Array of model IDs
     */
    getModelList() {
        return this.get(this.KEYS.MODEL_LIST, []);
    },

    /**
     * Save model list
     * @param {Array} models - Array of model IDs
     */
    setModelList(models) {
        this.set(this.KEYS.MODEL_LIST, models);
    }
};

// Make Storage available globally
window.Storage = Storage;
