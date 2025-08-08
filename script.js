// --- DOM Element References ---
const providerSelect = document.getElementById('provider-select');
const apiKeyInput = document.getElementById('api-key-input');
const baseUrlContainer = document.getElementById('base-url-container');
const baseUrlInput = document.getElementById('base-url-input');
const modelSelect = document.getElementById('model-select');
const customModelInput = document.getElementById('custom-model-input');
const refreshModelsBtn = document.getElementById('refresh-models-btn');
const promptInput = document.getElementById('prompt-input');
const sendButton = document.getElementById('send-button');
const stopButton = document.getElementById('stop-button');
const outputArea = document.getElementById('output-area');
const outputText = document.getElementById('output-text');
const outputImage = document.getElementById('output-image');
const statsArea = document.getElementById('stats-area');
const enableStreamingCheckbox = document.getElementById('enable-streaming-checkbox');
const loadingIndicator = document.getElementById('loading-indicator');

// Generation Type Radios
const generationTypeRadios = document.querySelectorAll('input[name="generation-type"]');

// Image Options
const imageOptionsContainer = document.getElementById('image-options-container');
const qualityOptionsContainer = document.getElementById('quality-options-container');
const qualitySelect = document.getElementById('quality-select');
const enableQualityCheckbox = document.getElementById('enable-quality-checkbox');
const enableQualityContainer = document.querySelector('.enable-quality-container');
const customQualityInput = document.getElementById('custom-quality-input');
const imageWidthInput = document.getElementById('image-width-input');
const imageHeightInput = document.getElementById('image-height-input');
const downloadImageBtn = document.getElementById('download-image-btn');

/* --- Audio Controls (new location: Generation Task) --- */
const audioGenerationControls = document.getElementById('audio-generation-controls');
const audioTypeRow = document.getElementById('audio-type-row');
const audioTypeSelect = document.getElementById('audio-type-select');
const sttInputContainer = document.querySelector('#audio-generation-controls #stt-input-container');
const audioFileInput = document.querySelector('#audio-generation-controls #audio-file-input');
const voiceOptionsContainer = document.querySelector('#audio-generation-controls #voice-options-container');
const voiceInput = document.querySelector('#audio-generation-controls #voice-input');
const recorderControls = document.querySelector('#audio-generation-controls #recorder-controls');
const recordBtn = document.querySelector('#audio-generation-controls #record-btn');
const recordingPreview = document.querySelector('#audio-generation-controls #recording-preview');
const outputAudio = document.getElementById('output-audio');
const downloadAudio = document.getElementById('download-audio');
/* --- TTS/Audio Advanced Options - ensure only one block declaration. --- */
const ttsFormatOptions = document.getElementById('tts-format-options');
const ttsFormatSelect = document.getElementById('tts-format-select');
const customTtsFormatInput = document.getElementById('custom-tts-format-input');
const sttStreamingContainer = document.getElementById('stt-streaming-advanced-container');
const sttStreamingCheckbox = document.getElementById('stt-streaming-checkbox');
/* --- Removed duplicate TTS format/block declarations (handled above for deduplication) --- */

// Video Options
const videoOptionsContainer = document.getElementById('video-options-container');
const videoAspectRatioEnabled = document.getElementById('video-aspect-ratio-enabled');
const videoAspectRatioSelect = document.getElementById('video-aspect-ratio');
const aspectRatioGroup = document.getElementById('aspect-ratio-group');
const videoDurationInput = document.getElementById('video-duration');
const outputVideo = document.getElementById('output-video');
const downloadVideoBtn = document.getElementById('download-video-btn');

// Text Generation Options
const textGenerationOptions = document.getElementById('text-generation-options');
const systemPromptInput = document.getElementById('system-prompt-input');
const enableSystemPromptCheckbox = document.getElementById('enable-system-prompt-checkbox');
const temperatureInput = document.getElementById('temperature-input');
const temperatureValue = document.getElementById('temperature-value');
const enableTemperatureCheckbox = document.getElementById('enable-temperature-checkbox');
const topPInput = document.getElementById('top-p-input');
const topPValue = document.getElementById('top-p-value');
const enableTopPCheckbox = document.getElementById('enable-top-p-checkbox');
const maxTokensInput = document.getElementById('max-tokens-input');
const enableMaxTokensCheckbox = document.getElementById('enable-max-tokens-checkbox');
const inferenceEffortInput = document.getElementById('inference-effort-input');
const enableInferenceEffortCheckbox = document.getElementById('enable-inference-effort-checkbox');

// Payload/Response Display
const payloadContainer = document.getElementById('payload-container');
const togglePayloadBtn = document.getElementById('toggle-payload-btn');
const payloadDisplayArea = document.getElementById('payload-display-area');
const toggleResponseBtn = document.getElementById('toggle-response-btn');
const responseDisplayArea = document.getElementById('response-display-area');

// Model Container
const modelContainer = document.getElementById('model-container');

// Provider Configurations
const configNameInput = document.getElementById('config-name-input');
const saveConfigBtn = document.getElementById('save-config-btn');
const savedConfigsList = document.getElementById('saved-configs-list');


// --- STATE VARIABLES ---
let recordedChunks = [];
let mediaRecorder;
let lastRequestPayload = null;
let lastApiResponse = null;
let microphonePermissionStatus = 'prompt'; // 'granted', 'denied', 'prompt'
let currentRequestController = null; // To track and cancel ongoing requests

// --- STORAGE HELPERS ---
// These functions handle getting and setting values in Electron store or localStorage.
// They are used by the settings persistence functions.

async function getStoredValue(key) {
    // Try Electron Store first
    if (window.electronAPI && window.electronAPI.getStoreValue) {
        try {
            return await window.electronAPI.getStoreValue(key);
        } catch (error) {
            console.error('Error getting value from Electron store:', key, error);
        }
    }
    
    // If not in Electron or Electron store failed, try localStorage
    try {
        const storedValue = localStorage.getItem(`app_storage_${key}`);
        if (storedValue !== null) {
            return JSON.parse(storedValue);
        }
    } catch (error) {
        console.error('Error getting value from localStorage:', key, error);
    }
    
    return undefined;
}

async function setStoredValue(key, value) {
    // Try Electron Store first
    if (window.electronAPI && window.electronAPI.setStoreValue) {
        try {
            await window.electronAPI.setStoreValue(key, value);
            return true; // Successfully stored in Electron
        } catch (error) {
            console.error('Error setting value in Electron store:', key, error);
        }
    }
    
    // If not in Electron or Electron store failed, use localStorage
    try {
        localStorage.setItem(`app_storage_${key}`, JSON.stringify(value));
        return true; // Successfully stored in localStorage
    } catch (error) {
        console.error('Error setting value in localStorage:', key, error);
        return false;
    }
}

// --- SETTINGS PERSISTENCE ---
// Functions for loading and saving user settings and API credentials.

const API_CREDENTIALS_KEY_PREFIX = 'apiCredentials';
const LAST_PROVIDER_KEY = 'lastProvider';
const LAST_MODEL_KEY = 'lastModel';
const LAST_PROMPT_KEY = 'lastPrompt';
const LAST_GENERATION_TYPE_KEY = 'lastGenerationType';
const LAST_IMAGE_QUALITY_KEY = 'lastImageQuality';
const LAST_ENABLE_QUALITY_KEY = 'lastEnableQuality';
const LAST_CUSTOM_IMAGE_QUALITY_KEY = 'lastCustomImageQuality';
const LAST_IMAGE_WIDTH_KEY = 'lastImageWidth';
const LAST_IMAGE_HEIGHT_KEY = 'lastImageHeight';
const LAST_AUDIO_TYPE_KEY = 'lastAudioType';
const LAST_VOICE_KEY = 'lastVoice';
const LAST_VIDEO_DURATION_KEY = 'lastVideoDuration';
const LAST_VIDEO_ASPECT_RATIO_ENABLED_KEY = 'lastVideoAspectRatioEnabled';
const LAST_VIDEO_ASPECT_RATIO_KEY = 'lastVideoAspectRatio';
const LAST_STREAMING_ENABLED_KEY = 'lastStreamingEnabled';

const LAST_ENABLE_SYSTEM_PROMPT_KEY = 'lastEnableSystemPrompt';
const LAST_ENABLE_TEMPERATURE_KEY = 'lastEnableTemperature';
const LAST_ENABLE_TOP_P_KEY = 'lastEnableTopP';
const LAST_ENABLE_MAX_TOKENS_KEY = 'lastEnableMaxTokens';
const LAST_ENABLE_INFERENCE_EFFORT_KEY = 'lastEnableInferenceEffort';

const LAST_SYSTEM_PROMPT_KEY = 'lastSystemPrompt';
const LAST_TEMPERATURE_KEY = 'lastTemperature';
const LAST_TOP_P_KEY = 'lastTopP';
const LAST_MAX_TOKENS_KEY = 'lastMaxTokens';
const LAST_INFERENCE_EFFORT_KEY = 'lastInferenceEffort';
const LAST_SELECTED_MODEL_OPTION_KEY = 'lastSelectedModelOption';
const LAST_CUSTOM_MODEL_NAME_KEY = 'lastCustomModelName';
const SAVED_PROVIDER_CONFIGS_KEY = 'savedProviderConfigurations';

// Loads API credentials for the given provider from storage.
async function loadProviderCredentials(provider) {
    if (!provider) return;
    const credentials = await getStoredValue(`${API_CREDENTIALS_KEY_PREFIX}.${provider}`);
    if (credentials) {
        apiKeyInput.value = credentials.apiKey || '';
        if (baseUrlInput) { // Check if baseUrlInput exists
            baseUrlInput.value = credentials.baseUrl || '';
        }
    } else {
        apiKeyInput.value = '';
        if (baseUrlInput) {
            baseUrlInput.value = '';
        }
    }
    toggleBaseUrlInput(); // Ensure visibility is correct after loading
}

// Saves API credentials for the given provider to storage.
async function saveProviderCredentials(provider) {
    if (!provider) return;
    const apiKey = apiKeyInput.value;
    const baseUrl = baseUrlInput ? baseUrlInput.value : ''; // Check if baseUrlInput exists
    await setStoredValue(`${API_CREDENTIALS_KEY_PREFIX}.${provider}`, { apiKey, baseUrl });
}

/**
 * Loads general application settings from storage.
 * Extended: Now also loads enable/disable state for parameter toggles.
 */
async function loadGeneralSettings() {
    const lastProvider = await getStoredValue(LAST_PROVIDER_KEY);
    if (lastProvider) providerSelect.value = lastProvider;

    // modelInput.value = await getStoredValue(LAST_MODEL_KEY) || 'gpt-4o'; // Default model (Now handled by populateModelDropdown)
    promptInput.value = await getStoredValue(LAST_PROMPT_KEY) || '';

    const lastGenerationType = await getStoredValue(LAST_GENERATION_TYPE_KEY);
    if (lastGenerationType) {
        const radio = document.querySelector(`input[name="generation-type"][value="${lastGenerationType}"]`);
        if (radio) radio.checked = true;
    }

    const lastEnableQuality = await getStoredValue(LAST_ENABLE_QUALITY_KEY);
    if (enableQualityCheckbox) { // Check if exists
        enableQualityCheckbox.checked = typeof lastEnableQuality === 'boolean' ? lastEnableQuality : true; // Default to true
    }

    const lastQuality = await getStoredValue(LAST_IMAGE_QUALITY_KEY);
    if (qualitySelect) { // Check if exists
        qualitySelect.value = lastQuality || 'standard'; // Default quality
    }

    const lastCustomQuality = await getStoredValue(LAST_CUSTOM_IMAGE_QUALITY_KEY);
    if (customQualityInput) { // Check if exists
        customQualityInput.value = lastCustomQuality || '';
    }


    if (imageWidthInput) imageWidthInput.value = await getStoredValue(LAST_IMAGE_WIDTH_KEY) || '1024';
    if (imageHeightInput) imageHeightInput.value = await getStoredValue(LAST_IMAGE_HEIGHT_KEY) || '1024';

    const lastAudioType = await getStoredValue(LAST_AUDIO_TYPE_KEY);
    if (audioTypeSelect) { // Check if exists
         audioTypeSelect.value = lastAudioType || 'tts';
    }

    if (voiceInput) voiceInput.value = await getStoredValue(LAST_VOICE_KEY) || 'alloy';

    // Load video settings
    if (videoDurationInput) videoDurationInput.value = await getStoredValue(LAST_VIDEO_DURATION_KEY) || '5';

    const lastVideoAspectRatioEnabled = await getStoredValue(LAST_VIDEO_ASPECT_RATIO_ENABLED_KEY);
    if (videoAspectRatioEnabled) {
        videoAspectRatioEnabled.checked = typeof lastVideoAspectRatioEnabled === 'boolean' ? lastVideoAspectRatioEnabled : false;
    }

    const lastVideoAspectRatio = await getStoredValue(LAST_VIDEO_ASPECT_RATIO_KEY);
    if (videoAspectRatioSelect) {
        videoAspectRatioSelect.value = lastVideoAspectRatio || '16:9';
    }

    const lastStreamingEnabled = await getStoredValue(LAST_STREAMING_ENABLED_KEY);
    if (enableStreamingCheckbox) {
        // Default to true if not found in storage (current behavior is streaming on)
        enableStreamingCheckbox.checked = typeof lastStreamingEnabled === 'boolean' ? lastStreamingEnabled : true;
    }

    // --- NEW: Load enable toggles for each param ---
    if (enableSystemPromptCheckbox) {
        const en = await getStoredValue(LAST_ENABLE_SYSTEM_PROMPT_KEY);
        enableSystemPromptCheckbox.checked = typeof en === "boolean" ? en : true;
    }
    if (enableTemperatureCheckbox) {
        const en = await getStoredValue(LAST_ENABLE_TEMPERATURE_KEY);
        enableTemperatureCheckbox.checked = typeof en === "boolean" ? en : true;
    }
    if (enableTopPCheckbox) {
        const en = await getStoredValue(LAST_ENABLE_TOP_P_KEY);
        enableTopPCheckbox.checked = typeof en === "boolean" ? en : false;
    }
    if (enableMaxTokensCheckbox) {
        const en = await getStoredValue(LAST_ENABLE_MAX_TOKENS_KEY);
        enableMaxTokensCheckbox.checked = typeof en === "boolean" ? en : true;
    }
    if (enableInferenceEffortCheckbox) {
        const en = await getStoredValue(LAST_ENABLE_INFERENCE_EFFORT_KEY);
        enableInferenceEffortCheckbox.checked = typeof en === "boolean" ? en : true;
    }

    // Load text generation settings
    systemPromptInput.value = await getStoredValue(LAST_SYSTEM_PROMPT_KEY) || '';
    const lastTemp = await getStoredValue(LAST_TEMPERATURE_KEY);
    temperatureInput.value = lastTemp !== undefined ? lastTemp : 1;
    temperatureValue.textContent = parseFloat(temperatureInput.value).toFixed(1);
    const lastTopP = await getStoredValue(LAST_TOP_P_KEY);
    topPInput.value = lastTopP !== undefined ? lastTopP : 1;
    topPValue.textContent = parseFloat(topPInput.value).toFixed(2);
    maxTokensInput.value = await getStoredValue(LAST_MAX_TOKENS_KEY) || '';
    inferenceEffortInput.value = await getStoredValue(LAST_INFERENCE_EFFORT_KEY) || '';

    // NEW: Enable/disable input fields
    if (enableSystemPromptCheckbox) systemPromptInput.disabled = !enableSystemPromptCheckbox.checked;
    if (enableTemperatureCheckbox) temperatureInput.disabled = !enableTemperatureCheckbox.checked;
    if (enableTopPCheckbox) topPInput.disabled = !enableTopPCheckbox.checked;
    if (enableMaxTokensCheckbox) maxTokensInput.disabled = !enableMaxTokensCheckbox.checked;
    if (enableInferenceEffortCheckbox) inferenceEffortInput.disabled = !enableInferenceEffortCheckbox.checked;

    toggleGenerationOptions(); // Update UI based on loaded settings
    toggleBaseUrlInput(); // Ensure base URL visibility
}

/**
 * Saves general application settings to storage.
 * Extended: Speichert auch die Enable/Disable-Schalter für Parameter.
 */
async function saveGeneralSettings() {
    await setStoredValue(LAST_PROVIDER_KEY, providerSelect.value);
    if (modelSelect) {
        // Save the actual model name to be used in the API call
        const modelToSave = modelSelect.value === 'custom' ? customModelInput.value.trim() : modelSelect.value;
        await setStoredValue(LAST_MODEL_KEY, modelToSave);

        // Save the state of the dropdown and custom input for UI restoration
        await setStoredValue(LAST_SELECTED_MODEL_OPTION_KEY, modelSelect.value);
        if (modelSelect.value === 'custom') {
            await setStoredValue(LAST_CUSTOM_MODEL_NAME_KEY, customModelInput.value.trim());
        }
    }
    await setStoredValue(LAST_PROMPT_KEY, promptInput.value);
    const generationType = document.querySelector('input[name="generation-type"]:checked');
    if (generationType) await setStoredValue(LAST_GENERATION_TYPE_KEY, generationType.value);

    if (enableQualityCheckbox) await setStoredValue(LAST_ENABLE_QUALITY_KEY, enableQualityCheckbox.checked);
    if (qualitySelect) await setStoredValue(LAST_IMAGE_QUALITY_KEY, qualitySelect.value);
    if (customQualityInput) await setStoredValue(LAST_CUSTOM_IMAGE_QUALITY_KEY, customQualityInput.value);
    if (imageWidthInput) await setStoredValue(LAST_IMAGE_WIDTH_KEY, imageWidthInput.value);
    if (imageHeightInput) await setStoredValue(LAST_IMAGE_HEIGHT_KEY, imageHeightInput.value);
    if (audioTypeSelect) await setStoredValue(LAST_AUDIO_TYPE_KEY, audioTypeSelect.value);
    if (voiceInput) await setStoredValue(LAST_VOICE_KEY, voiceInput.value);
    if (enableStreamingCheckbox) await setStoredValue(LAST_STREAMING_ENABLED_KEY, enableStreamingCheckbox.checked);

    // Save new param enable toggles
    if (enableSystemPromptCheckbox) await setStoredValue(LAST_ENABLE_SYSTEM_PROMPT_KEY, enableSystemPromptCheckbox.checked);
    if (enableTemperatureCheckbox) await setStoredValue(LAST_ENABLE_TEMPERATURE_KEY, enableTemperatureCheckbox.checked);
    if (enableTopPCheckbox) await setStoredValue(LAST_ENABLE_TOP_P_KEY, enableTopPCheckbox.checked);
    if (enableMaxTokensCheckbox) await setStoredValue(LAST_ENABLE_MAX_TOKENS_KEY, enableMaxTokensCheckbox.checked);
    if (enableInferenceEffortCheckbox) await setStoredValue(LAST_ENABLE_INFERENCE_EFFORT_KEY, enableInferenceEffortCheckbox.checked);

    // Save video settings
    if (videoDurationInput) await setStoredValue(LAST_VIDEO_DURATION_KEY, videoDurationInput.value);
    if (videoAspectRatioEnabled) await setStoredValue(LAST_VIDEO_ASPECT_RATIO_ENABLED_KEY, videoAspectRatioEnabled.checked);
    if (videoAspectRatioSelect) await setStoredValue(LAST_VIDEO_ASPECT_RATIO_KEY, videoAspectRatioSelect.value);

    // Save text generation settings
    await setStoredValue(LAST_SYSTEM_PROMPT_KEY, systemPromptInput.value);
    await setStoredValue(LAST_TEMPERATURE_KEY, temperatureInput.value);
    await setStoredValue(LAST_TOP_P_KEY, topPInput.value);
    await setStoredValue(LAST_MAX_TOKENS_KEY, maxTokensInput.value);
    await setStoredValue(LAST_INFERENCE_EFFORT_KEY, inferenceEffortInput.value);
}

// --- THEME MANAGEMENT ---
const THEME_KEY = 'user-theme';

// Applies the selected theme ('light', 'dark', or 'system')
function applyTheme(theme) {
    // Determine if dark mode should be active
    const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    // Toggle the 'dark-mode' class on the body
    document.body.classList.toggle('dark-mode', isDarkMode);

    // Update the UI of the theme buttons
    document.querySelectorAll('.theme-mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`.theme-mode-btn[data-theme-mode="${theme}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// Saves the user's theme preference
function saveTheme(theme) {
    setStoredValue(THEME_KEY, theme);
}

// Initializes the theme based on stored preference or system settings
async function initializeTheme() {
    // Use 'system' as the default theme
    const savedTheme = await getStoredValue(THEME_KEY) || 'system';
    
    // Apply the theme on initial load
    applyTheme(savedTheme);

    // Add event listeners to all theme buttons
    document.querySelectorAll('.theme-mode-btn[data-theme-mode]').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme-mode');
            applyTheme(theme);
            saveTheme(theme);

            // If in Electron, notify the main process
            if (window.electronAPI && window.electronAPI.setThemePreference) {
                window.electronAPI.setThemePreference(theme);
            }
        });
    });

    // Listen for changes in the system's color scheme preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', async () => {
        const currentTheme = await getStoredValue(THEME_KEY) || 'system';
        // Re-apply the theme only if the current setting is 'system'
        if (currentTheme === 'system') {
            applyTheme('system');
        }
    });

    // Handle theme synchronization with the Electron main process
    if (window.electronAPI) {
        // Listen for theme updates pushed from the main process
        window.electronAPI.onThemeUpdated(({ theme }) => {
            console.log('Renderer received theme update from main:', theme);
            applyTheme(theme);
        });

        // Fetch the initial theme preference from the main process on startup
        try {
            const initialState = await window.electronAPI.getThemePreference();
            if (initialState && initialState.theme) {
                applyTheme(initialState.theme);
            }
        } catch (err) {
            console.error("Error getting initial theme from Electron main:", err);
        }
    }
}

// --- PROVIDER CONFIGURATION MANAGEMENT ---

// Renders the list of saved provider configurations into the UI.
async function renderSavedConfigs() {
    const configs = await getStoredValue(SAVED_PROVIDER_CONFIGS_KEY) || {};
    savedConfigsList.innerHTML = ''; // Clear the list first

    const configContainer = document.getElementById('saved-configs-list-container');

    if (Object.keys(configs).length === 0) {
        // Hide the container if there are no configs, as it contains the HR and title
        if(configContainer) configContainer.style.display = 'none';
        return;
    }
    
    // Show the container if there are configs
    if(configContainer) configContainer.style.display = 'block';

    for (const name in configs) {
        if (Object.hasOwnProperty.call(configs, name)) {
            const configItem = document.createElement('div');
            configItem.className = 'saved-config-item';
            
            // Sanitize the name for use in data attributes
            const sanitizedName = name.replace(/"/g, '&quot;').replace(/'/g, '&#39;');

            configItem.innerHTML = `
                <span class="config-name">${sanitizedName}</span>
                <div class="config-buttons">
                    <button class="config-btn restore-btn" data-config-name="${sanitizedName}">Restore</button>
                    <button class="config-btn delete-btn" data-config-name="${sanitizedName}">Delete</button>
                </div>
            `;
            savedConfigsList.appendChild(configItem);
        }
    }
}

// Saves the current provider settings as a named configuration.
async function saveConfiguration() {
    const name = configNameInput.value.trim();
    if (!name) {
        displayError("Please enter a name for the configuration.");
        return;
    }

    const currentProvider = providerSelect.value;
    const currentApiKey = apiKeyInput.value.trim();
    const currentBaseUrl = baseUrlInput.value.trim();

    if (!currentApiKey) {
        displayError("API Key cannot be empty when saving a configuration.");
        return;
    }

    const configs = await getStoredValue(SAVED_PROVIDER_CONFIGS_KEY) || {};
    
    configs[name] = {
        provider: currentProvider,
        apiKey: currentApiKey,
        baseUrl: currentBaseUrl
    };

    await setStoredValue(SAVED_PROVIDER_CONFIGS_KEY, configs);
    
    // Clear the input and re-render the list
    configNameInput.value = '';
    await renderSavedConfigs();
}

// Restores a saved provider configuration into the main form fields.
async function restoreConfiguration(name) {
    const configs = await getStoredValue(SAVED_PROVIDER_CONFIGS_KEY) || {};
    const configToRestore = configs[name];

    if (!configToRestore) {
        displayError(`Configuration "${name}" not found.`);
        return;
    }

    // Populate the form fields
    providerSelect.value = configToRestore.provider;
    apiKeyInput.value = configToRestore.apiKey;
    baseUrlInput.value = configToRestore.baseUrl || '';

    // Also populate the name input for easy re-saving
    configNameInput.value = name;

    // --- Manually trigger the necessary updates ---

    // 1. Save the newly restored credentials to the specific provider's slot
    await saveProviderCredentials(configToRestore.provider);
    
    // 2. Save the new provider selection as the last used one
    await setStoredValue(LAST_PROVIDER_KEY, configToRestore.provider);

    // 3. Update the UI based on the new provider
    toggleBaseUrlInput();
    
    // 4. Fetch the models for the new provider
    await fetchModels();
}

// Deletes a saved provider configuration.
async function deleteConfiguration(name) {
    const configs = await getStoredValue(SAVED_PROVIDER_CONFIGS_KEY) || {};
    
    if (configs[name]) {
        delete configs[name];
        await setStoredValue(SAVED_PROVIDER_CONFIGS_KEY, configs);
        
        // If the deleted config's name is in the input, clear it
        if (configNameInput.value === name) {
            configNameInput.value = '';
        }

        await renderSavedConfigs();
    }
}

// --- UI MANIPULATION ---
// Functions that control the visibility and state of UI elements.

// Function to show or hide the Base URL input based on the selected provider
function toggleBaseUrlInput() {
    const selectedProvider = providerSelect.value;
    baseUrlContainer.style.display = selectedProvider === 'openai_compatible' ? 'block' : 'none';
    if (selectedProvider !== 'openai_compatible') {
        baseUrlInput.value = ''; // Clear the input if hidden
    }
}

// Function to toggle aspect ratio visibility for video generation
function toggleAspectRatio() {
    const aspectRatioEnabled = videoAspectRatioEnabled.checked;
    
    if (aspectRatioEnabled) {
        aspectRatioGroup.style.display = 'block';
        aspectRatioGroup.classList.remove('disabled');
    } else {
        aspectRatioGroup.style.display = 'none';
        aspectRatioGroup.classList.add('disabled');
    }
}

// --- MODEL MANAGEMENT ---

// Fetches the list of available models from the provider's API.
async function fetchModels() {
    const provider = providerSelect.value;
    const apiKey = apiKeyInput.value.trim();
    const baseUrl = baseUrlInput.value.trim();

    // Don't fetch for providers that don't support it or if key is missing
    if (!apiKey || ['claude', 'deepseek'].includes(provider)) {
        populateModelDropdown([]); // Populate with just "Custom"
        return;
    }

    let apiUrl = '';
    let headers = { 'Authorization': `Bearer ${apiKey}` };

    if (provider === 'openai') {
        apiUrl = 'https://api.openai.com/v1/models';
    } else if (provider === 'openai_compatible') {
        if (!baseUrl) {
            populateModelDropdown([]); // Can't fetch without base URL
            return;
        }
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        apiUrl = `${cleanBaseUrl}/models`;
    } else if (provider === 'openrouter') {
        apiUrl = 'https://openrouter.ai/api/v1/models';
    } else {
        populateModelDropdown([]); // Unsupported provider for this feature
        return;
    }

    try {
        const response = await fetch(apiUrl, { headers: headers });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData?.error?.message || `Failed to fetch models (${response.status})`;
            console.error('Model fetch error:', errorMessage);
            displayError(`Could not fetch models: ${errorMessage}`);
            populateModelDropdown([]); // Show custom at least
            return;
        }
        const data = await response.json();
        const models = data.data || []; // OpenAI and OpenRouter use `data` field
        populateModelDropdown(models);
    } catch (error) {
        console.error('Error fetching models:', error);
        displayError(`Network error while fetching models: ${error.message}`);
        populateModelDropdown([]); // Show custom at least
    }
}

// Populates the model dropdown with a list of models.
async function populateModelDropdown(models) {
    const lastSelectedOption = await getStoredValue(LAST_SELECTED_MODEL_OPTION_KEY);
    const lastCustomName = await getStoredValue(LAST_CUSTOM_MODEL_NAME_KEY);

    modelSelect.innerHTML = ''; // Clear existing options

    // Add the "Custom" option first
    const customOption = document.createElement('option');
    customOption.value = 'custom';
    customOption.textContent = 'Custom...';
    modelSelect.appendChild(customOption);

    // Sort models by ID (name)
    if (Array.isArray(models)) {
        models.sort((a, b) => a.id.localeCompare(b.id));
        // Add models from the API
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.id;
            modelSelect.appendChild(option);
        });
    }

    // Try to restore the last selection from the dropdown's state
    if (lastSelectedOption && Array.from(modelSelect.options).some(opt => opt.value === lastSelectedOption)) {
        modelSelect.value = lastSelectedOption;
    } else {
        // Fallback to a default if no selection was stored or it's no longer valid
        const defaultModel = 'gpt-4o'; // A sensible default
        if(Array.from(modelSelect.options).some(opt => opt.value === defaultModel)) {
            modelSelect.value = defaultModel;
        } else if (modelSelect.options.length > 1) {
            modelSelect.selectedIndex = 1; // Select the first model in the list
        }
    }
    
    // If the last selected option was 'custom', restore the custom input text
    if (modelSelect.value === 'custom' && lastCustomName) {
        customModelInput.value = lastCustomName;
    }
    
    // Trigger the change handler to set UI visibility correctly
    handleModelSelectionChange();
}


// Handles changes in the model selection dropdown.
function handleModelSelectionChange() {
    if (modelSelect.value === 'custom') {
        customModelInput.style.display = 'block';
    } else {
        customModelInput.style.display = 'none';
    }
    saveGeneralSettings(); // Save the new selection state
}

// --- UI MANIPULATION (Refactored) ---

// Main function to control UI visibility based on generation type
function toggleGenerationOptions() {
    const generationType = document.querySelector('input[name="generation-type"]:checked')?.value;
    if (!generationType) return;

    // Hide all advanced/parameter groups
    textGenerationOptions.style.display = 'none';
    imageOptionsContainer.style.display = 'none';
    videoOptionsContainer.style.display = 'none';
    if (audioGenerationControls) audioGenerationControls.style.display = 'none';
    // audioTypeRow is now for Advanced Options, not Generation Task. Hide by default.
    // only show dropdown when Audio is selected
    if (audioTypeRow) audioTypeRow.style.display = generationType === 'audio' ? 'block' : 'none';
    if (ttsFormatOptions) ttsFormatOptions.style.display = 'none';
    if (sttStreamingContainer) sttStreamingContainer.style.display = 'none';

    // Always show prompt input, but hide for STT
    promptInput.style.display = 'block';

    // Configure UI based on the selected generation type
    switch (generationType) {
        case 'text':
            textGenerationOptions.style.display = 'block';
            document.getElementById('prompt-label').textContent = 'Prompt:';
            break;
        case 'image':
            imageOptionsContainer.style.display = 'block';
            document.getElementById('prompt-label').textContent = 'Prompt / Image Description:';
            const enableQualityToggle = document.getElementById('enable-quality-checkbox');
            if (enableQualityToggle) {
                 qualityOptionsContainer.style.display = enableQualityToggle.checked ? 'block' : 'none';
                 customQualityInput.style.display = (enableQualityToggle.checked && qualitySelect.value === 'custom') ? 'block' : 'none';
            }
            break;
        case 'audio':
            // Audio Type select always appears as first row of Generation Task for AUDIO (not in Advanced)
            if (audioTypeRow) audioTypeRow.style.display = 'block';

            // Show audio controls section for prompt/upload/record (but not audio type switcher itself)
            if (audioGenerationControls) audioGenerationControls.style.display = 'block';

            // Get audio type
            const audioType = audioTypeSelect ? audioTypeSelect.value : 'tts';

            // Show/hide TTS and STT advanced options (replacement for legacy toggles)
            if (audioType === 'tts') {
                const ttsAdv = document.getElementById('tts-advanced-options');
                if (ttsAdv) ttsAdv.style.display = 'block';
                const sttAdv = document.getElementById('stt-advanced-options');
                if (sttAdv) sttAdv.style.display = 'none';
            } else if (audioType === 'stt') {
                const ttsAdv = document.getElementById('tts-advanced-options');
                if (ttsAdv) ttsAdv.style.display = 'none';
                const sttAdv = document.getElementById('stt-advanced-options');
                if (sttAdv) sttAdv.style.display = 'block';
            } else {
                const ttsAdv = document.getElementById('tts-advanced-options');
                if (ttsAdv) ttsAdv.style.display = 'none';
                const sttAdv = document.getElementById('stt-advanced-options');
                if (sttAdv) sttAdv.style.display = 'none';
            }

            // Show audio sub-options
            if (audioType === 'tts') {
                if (voiceOptionsContainer) voiceOptionsContainer.style.display = 'block';
                if (sttInputContainer) sttInputContainer.style.display = 'none';
                if (recorderControls) recorderControls.style.display = 'none';
                promptInput.style.display = 'block';
                document.getElementById('prompt-label').textContent = 'Text to Speak:';
            } else { // STT
                if (voiceOptionsContainer) voiceOptionsContainer.style.display = 'none';
                if (sttInputContainer) sttInputContainer.style.display = 'block';
                if (recorderControls) recorderControls.style.display = 'block';
                promptInput.style.display = 'none'; // Prompt input is not used for STT
                document.getElementById('prompt-label').textContent = 'Upload or Record Audio:';
            }
            break;
        case 'video':
            videoOptionsContainer.style.display = 'block';
            document.getElementById('prompt-label').textContent = 'Video Description:';
            const aspectRatioToggle = document.getElementById('video-aspect-ratio-enabled');
            if (aspectRatioToggle) {
                 aspectRatioGroup.style.display = aspectRatioToggle.checked ? 'block' : 'none';
            }
            break;
    }
}


// Function to check microphone permission status
async function checkMicrophonePermission() {
    try {
        // Check if the browser supports permissions API
        if (navigator.permissions && navigator.permissions.query) {
            const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
            microphonePermissionStatus = permissionStatus.state;
            
            // Listen for permission changes
            permissionStatus.onchange = () => {
                microphonePermissionStatus = permissionStatus.state;
                updateMicrophoneUI();
            };
            
            return microphonePermissionStatus;
        } else {
            // For browsers that don't support permissions API, we can't check proactively
            return 'prompt';
        }
    } catch (error) {
        console.error('Error checking microphone permission:', error);
        return 'prompt';
    }
}

// Function to request microphone permission proactively
async function requestMicrophonePermission() {
    try {
        // The getUserMedia call will trigger the permission prompt
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // If we get here, permission was granted
        microphonePermissionStatus = 'granted';
        
        // Stop the tracks immediately since we're just checking permission
        stream.getTracks().forEach(track => track.stop());
        
        updateMicrophoneUI();
        return true;
    } catch (error) {
        // Permission denied or other error
        microphonePermissionStatus = 'denied';
        updateMicrophoneUI();
        console.error('Microphone permission error:', error);
        return false;
    }
}

// Function to update UI based on microphone permission status
function updateMicrophoneUI() {
    // Create status element if it doesn't exist
    let micStatusEl = document.getElementById('mic-status');
    if (!micStatusEl && recorderControls) {
        micStatusEl = document.createElement('div');
        micStatusEl.id = 'mic-status';
        micStatusEl.style.marginBottom = '8px';
        recorderControls.insertBefore(micStatusEl, recordBtn);
    }
    
    // Update the status message and styling
    if (micStatusEl) {
        if (microphonePermissionStatus === 'granted') {
            micStatusEl.innerHTML = '🎤 <span style="color: green;">Microphone access granted</span>';
            recordBtn.disabled = false;
        } else if (microphonePermissionStatus === 'denied') {
            micStatusEl.innerHTML = '🚫 <span style="color: red;">Microphone access denied</span> <button id="retry-mic-btn">Request Access</button>';
            recordBtn.disabled = true;
            
            // Add event listener to retry button
            const retryBtn = document.getElementById('retry-mic-btn');
            if (retryBtn) {
                retryBtn.onclick = () => {
                    requestMicrophonePermission();
                };
            }
        } else {
            // prompt state
            micStatusEl.innerHTML = '🎤 <span style="color: orange;">Microphone permission needed</span> <button id="request-mic-btn">Allow Microphone</button>';
            recordBtn.disabled = false;
            
            // Add event listener to request button
            const requestBtn = document.getElementById('request-mic-btn');
            if (requestBtn) {
                requestBtn.onclick = () => {
                    requestMicrophonePermission();
                };
            }
        }
    }
}


// --- HELPER FUNCTIONS ---
// Utility functions used by other parts of the script.

// Displays an error message in the output area.
function displayError(message) {
    console.error('Error:', message);

    // Render error message and add a centered "Copy" button
    outputText.innerHTML = `
        <span style="color: red;">Error: ${message}</span><br>
        <button id="copy-error-btn" class="copy-btn">
            Copy
        </button>
    `;

    // Add click handler to copy the error text to the clipboard
    const copyBtn = document.getElementById('copy-error-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(message).then(() => {
                const original = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => (copyBtn.textContent = original), 2000);
            }).catch(err => {
                console.error('Clipboard copy failed:', err);
            });
        }, { once: true }); // once ensures no duplicate listeners
    }

    // Display the error panel
    outputImage.style.display = 'none';
    outputImage.src = '';
    outputArea.style.display = 'block';
    outputArea.style.borderColor = 'red';
}

// Clears the output area, stats, and resets payload/response displays.
function clearOutput() {
    outputText.innerHTML = '';
    outputImage.style.display = 'none';
    outputImage.src = '';
    downloadImageBtn.style.display = 'none'; // Hide image download button
    downloadImageBtn.href = '';
    outputAudio.style.display = 'none';
    outputAudio.src = '';
    downloadAudio.style.display = 'none';
    downloadAudio.href = '';
    outputVideo.style.display = 'none';
    outputVideo.src = '';
    downloadVideoBtn.style.display = 'none';
    downloadVideoBtn.href = '';
    outputArea.style.display = 'none';
    outputArea.style.borderColor = '#ccc';
    statsArea.style.display = 'none'; // Hide stats area too
    statsArea.innerHTML = '';
    payloadContainer.style.display = 'none'; // Hide payload container
    payloadDisplayArea.style.display = 'none'; // Hide payload display
    responseDisplayArea.style.display = 'none'; // Hide response display
    togglePayloadBtn.textContent = 'Show Request'; // Reset button text
    togglePayloadBtn.classList.remove('active');
    toggleResponseBtn.textContent = 'Show Response'; // Reset button text
    toggleResponseBtn.classList.remove('active');
    lastRequestPayload = null; // Reset stored payload
    lastApiResponse = null;    // Reset stored response
    if (loadingIndicator) hideLoader(); // Ensure loader is hidden
}

// --- LOADER FUNCTIONS ---
// Functions to show and hide the loading indicator.
function showLoader() {
    if (loadingIndicator) loadingIndicator.style.display = 'flex';
}

function hideLoader() {
    if (loadingIndicator) loadingIndicator.style.display = 'none';
}

function showStopButton() {
    if (sendButton) sendButton.style.display = 'none';
    if (stopButton) stopButton.style.display = 'inline-block';
}

function hideStopButton() {
    if (stopButton) stopButton.style.display = 'none';
    if (sendButton) sendButton.style.display = 'inline-block';
}

// --- API RESPONSE HELPER ---
// Handles common API response processing tasks like JSON parsing and error checking.
async function handleApiResponse(response) {
    // Clone the response to read JSON and still have response object available if needed
    const responseClone = response.clone();
    let data;
    try {
        data = await response.json();
        lastApiResponse = JSON.stringify(data, null, 2); // Store the successful JSON response
    } catch (jsonError) {
        console.error("Failed to parse JSON response:", jsonError);
        const textResponse = await responseClone.text(); // Try getting text if JSON fails
        lastApiResponse = `Response was not valid JSON:\n${textResponse}`; // Store raw text response
        // If response.ok is true, but JSON parsing failed, we still want to throw an error
        // because we expected JSON. If response.ok is false, the error thrown below will include this.
        if (response.ok) {
            throw new Error("Received OK response but failed to parse JSON content. Raw response: " + textResponse);
        }
        data = null; // Indicate that data parsing failed
    }

    if (!response.ok) {
        // If response was not ok, lastApiResponse (set above) contains text/JSON error details if available
        // Otherwise, construct a generic error.
        const errorMsg = data?.error?.message || data?.detail || (typeof lastApiResponse === 'string' && lastApiResponse.startsWith('Response was not valid JSON:') ? lastApiResponse : null) || `HTTP Error ${response.status}`;
        throw new Error(errorMsg);
    }

    // If response is ok but data parsing failed earlier (and wasn't caught by the explicit throw above)
    // This case should ideally be covered, but as a safeguard:
    if (data === null && response.ok) {
         throw new Error("Received OK response but failed to parse JSON content, and data is null.");
    }
    return data;
}


// --- API CALLS ---
// Functions responsible for making API calls to different providers and generation types.

/**
 * Handles text generation API calls.
 * Parameter-Toggles werden ausgewertet: Parameter werden nur gesendet, wenn der jeweilige Switch aktiviert ist.
 */
async function callTextApi(provider, apiKey, baseUrl, model, prompt) {
    showLoader(); // Show loader at the start
    showStopButton(); // Show stop button
    clearOutput();
    outputText.innerHTML = 'Sending text request...';
    outputArea.style.display = 'block';

    let apiUrl = '';
    let headers = {};
    const streamEnabled = enableStreamingCheckbox ? enableStreamingCheckbox.checked : true;

    // Create AbortController for cancellation
    const controller = new AbortController();
    const { signal } = controller;
    currentRequestController = controller; // Store reference for cancellation

    // Construct messages array
    const messages = [];
    // System Prompt nur senden, wenn Toggle aktiv
    if (enableSystemPromptCheckbox?.checked && systemPromptInput.value.trim()) {
        messages.push({ role: 'system', content: systemPromptInput.value.trim() });
    }
    messages.push({ role: 'user', content: prompt });

    // Base body
    let body = {
        model: model,
        messages: messages,
        stream: streamEnabled,
        stream_options: { include_usage: true }
    };

    // Add optional parameters ONLY IF ENABLED
    if (enableTemperatureCheckbox?.checked && temperatureInput.value) body.temperature = parseFloat(temperatureInput.value);
    if (enableTopPCheckbox?.checked && topPInput.value) body.top_p = parseFloat(topPInput.value);
    if (enableMaxTokensCheckbox?.checked && maxTokensInput.value) body.max_tokens = parseInt(maxTokensInput.value, 10);
    if (enableInferenceEffortCheckbox?.checked && inferenceEffortInput && inferenceEffortInput.value.trim()) {
        body.reasoning_effort = inferenceEffortInput.value.trim();
    }


    // Configure based on provider
    switch (provider) {
        case 'openai':
            apiUrl = 'https://api.openai.com/v1/chat/completions';
            headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
            break;
        case 'deepseek':
            apiUrl = 'https://api.deepseek.com/chat/completions';
            headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
            body.stream = false; // Override for Deepseek
            break;
        case 'openai_compatible':
            if (!baseUrl) {
                hideLoader();
                hideStopButton();
                return displayError('Base URL is required for OpenAI Compatible provider.');
            }
            const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            apiUrl = `${cleanBaseUrl}/chat/completions`;
            headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
            break;
        case 'claude':
            apiUrl = 'https://api.anthropic.com/v1/messages';
            headers = { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' };
            // Claude has a different body structure
            body = {
                model: model,
                system: systemPromptInput.value.trim() || undefined,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: parseInt(maxTokensInput.value, 10) || 4096,
                temperature: parseFloat(temperatureInput.value),
                top_p: parseFloat(topPInput.value)
            };
            delete body.stream; // Claude doesn't use the 'stream' property here
            break;
        case 'openrouter':
            apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
            headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
            // OpenRouter uses a standard body, but we can disable stream for safety
            body.stream = false;
            break;
        default:
            hideLoader();
            hideStopButton();
            return displayError('Unknown provider selected for text generation.');
    }

    // Store payload before sending
    lastRequestPayload = JSON.stringify(body, null, 2);
    payloadContainer.style.display = 'block';

    // Make the API call
    const startTime = performance.now(); // Record start time
    try {
        const response = await fetch(apiUrl, { method: 'POST', headers: headers, body: JSON.stringify(body), signal });
        const endTime = performance.now(); // Record end time
        const durationInSeconds = (endTime - startTime) / 1000;

        if (body.stream && (provider === 'openai' || provider === 'openai_compatible')) {
            if (!response.ok) {
                // Attempt to parse error from stream-initialization HTTP error
                let errorData;
                try {
                    errorData = await response.json();
                    lastApiResponse = JSON.stringify(errorData, null, 2);
                } catch (e) {
                    const errorText = await response.text();
                    lastApiResponse = `Stream connection error: ${response.status}\n${errorText}`;
                    errorData = { error: { message: `Stream connection error: ${response.status}. ${errorText}` } };
                }
                throw new Error(errorData.error?.message || `Stream connection error: ${response.status}`);
            }
            // Handle streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            outputText.innerHTML = `<strong>${model}:</strong><br>`; // Initialize output area
            outputArea.style.borderColor = '#ccc'; // Reset border color
            let contentBuffer = "";
            let accumulatedResponse = "";

            // --- LIVE PROMPT TOKENS: Calculate once outside processStream so always shown ---
            function estimateTokens(text) {
                // Estimate tokens as number of whitespace-separated units in text
                if (!text) return 0;
                return text.trim().length > 0 ? text.trim().split(/\s+/).length : 0;
            }
             // Prompt tokens estimated from user + system prompt (if enabled)
             const systemPromptText = (enableSystemPromptCheckbox?.checked && systemPromptInput?.value?.trim()) ? systemPromptInput.value.trim() : "";
             const promptTokensEstimate = estimateTokens(prompt) + estimateTokens(systemPromptText);

            // New: Buffer for all provider responses during streaming (to reconstruct original)
            let streamedProviderJsons = [];
            // Accumulate for merged pretty JSON:
            let streamedTopMeta = null;
            let streamedFinishReason = null;
            let streamedAllDeltas = [];
            let streamedUsage = null; // To store usage data from stream

            async function processStream() {
                // --- Live Stats for Streaming ---
                let lastLiveStatsUpdate = 0;
                let streamedTokenCount = 0; // content tokens (not reasoning)
                let firstTokenTime = null; // Track when the first token arrives (delta.content)
                let seenDone = false; // Track if [DONE] arrived before reader reports done
                let reasoningTokenCount = 0; // accumulate delta.reasoning_content tokens
                let sawReasoning = false; // whether any reasoning chunks arrived

                while (true) {
                    // Check if the request was aborted
                    if (signal.aborted) {
                        reader.cancel();
                        throw new DOMException('Request cancelled by user', 'AbortError');
                    }

                    const { done, value } = await reader.read();
                    const now = performance.now();
                    const elapsed = (now - startTime) / 1000;

                    if (done) {
                         // Final update with all stats at completion
                         // Prefer server-provided usage (including reasoning_tokens) when available
                         let promptTokensFinal, completionTokensFinal, totalTokensFinal, reasoningTokensFinal = 0;
                        
                         if (streamedUsage && (streamedUsage.prompt_tokens !== undefined || streamedUsage.completion_tokens !== undefined)) {
                             promptTokensFinal = Number(streamedUsage.prompt_tokens ?? 0);
                             completionTokensFinal = Number(streamedUsage.completion_tokens ?? 0);
                             totalTokensFinal = Number(streamedUsage.total_tokens ?? (promptTokensFinal + completionTokensFinal));
                             reasoningTokensFinal = Number((streamedUsage.completion_tokens_details && streamedUsage.completion_tokens_details.reasoning_tokens) ?? 0);
                        
                             // Time calculations
                             const ttftSecNum = firstTokenTime ? ((firstTokenTime - startTime) / 1000) : null; // TTFT is at first "content" arrival (not reasoning_content)
                             const elapsedSecNum = elapsed; // already in seconds
                             const sinceFirstSecNum = ttftSecNum !== null ? Math.max(0, elapsedSecNum - ttftSecNum) : elapsedSecNum;
                        
                             // Token breakdown
                             const realCompletionTokens = Math.max(0, completionTokensFinal - reasoningTokensFinal);
                        
                             // TPS calculations as requested:
                             // - Reasoning TPS: reasoning_tokens / TTFT
                             // - Completion TPS: (completion_tokens - reasoning_tokens) / time since first token
                             // - Total TPS (displayed next to "Total Tokens"): completion_tokens / total time
                             const reasoningTps = (ttftSecNum && ttftSecNum > 0 && reasoningTokensFinal > 0) ? (reasoningTokensFinal / ttftSecNum).toFixed(2) : "…";
                             const completionTps = (sinceFirstSecNum > 0 && realCompletionTokens > 0) ? (realCompletionTokens / sinceFirstSecNum).toFixed(2) : "…";
                             const totalTps = (elapsedSecNum > 0 && completionTokensFinal > 0) ? (completionTokensFinal / elapsedSecNum).toFixed(2) : "…";
                        
                             const ttftDisplay = ttftSecNum !== null ? `${ttftSecNum.toFixed(2)}s` : "…";
                        
                             statsArea.innerHTML = `
                                 <div><strong>Time:</strong> ${elapsedSecNum.toFixed(2)}s</div>
                                 <div><strong>Time to First Token:</strong> ${ttftDisplay}</div>
                                 <div><strong>Prompt Tokens:</strong> ${promptTokensFinal}</div>
                                 <div><strong>Reasoning Tokens:</strong> ${reasoningTokensFinal} (${reasoningTps} tps)</div>
                                 <div><strong>Completion Tokens:</strong> ${realCompletionTokens} (${completionTps} tps)</div>
                                 <div><strong>Total Tokens:</strong> ${totalTokensFinal} (${totalTps} tps)</div>
                             `;
                             statsArea.style.display = 'block';
                         } else {
                             // Fallback to previous estimation logic when usage isn't available
                             let promptTokensEst = promptTokensEstimate;
                             let completionTokensEst = estimateTokens(contentBuffer);
                             let totalTokensEst = promptTokensEst + completionTokensEst;
                             const timeSinceFirstToken = firstTokenTime ? (now - firstTokenTime) / 1000 : elapsed;
                             const tokensPerSecondFinal = (timeSinceFirstToken > 0 && completionTokensEst > 0)
                                 ? (completionTokensEst / timeSinceFirstToken).toFixed(2) : "…";
                             const timeToFirstToken = firstTokenTime ? ((firstTokenTime - startTime) / 1000).toFixed(2) : "…";
                        
                             statsArea.innerHTML = `
                                 <span><strong>Time:</strong> ${elapsed.toFixed(2)}s</span>
                                 <span><strong>Time to First Token:</strong> ${timeToFirstToken}s</span>
                                 <span><strong>Tokens/Sec:</strong> ${tokensPerSecondFinal}</span>
                                 <span><strong>Prompt Tokens:</strong> ${promptTokensEst}</span>
                                 <span><strong>Completion Tokens:</strong> ${completionTokensEst}</span>
                                 <span><strong>Total Tokens:</strong> ${totalTokensEst}</span>
                                 <br><small>Live stats update – values estimated from streamed content.</small>
                             `;
                             statsArea.style.display = 'block';
                         }

                        // Ensure any final buffered content is displayed (though typically not needed with SSE)
                        if (accumulatedResponse.startsWith("data: ")) {
                            const jsonStr = accumulatedResponse.substring(6).trim();
                            if (jsonStr && jsonStr !== "[DONE]") {
                                streamedProviderJsons.push(jsonStr);
                                try {
                                    const parsed = JSON.parse(jsonStr);
                                    if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                                        const textChunk = parsed.choices[0].delta.content;
                                        outputText.innerHTML += textChunk.replace(/\n/g, '<br>');
                                    }
                                } catch (e) {
                                    console.warn("Error parsing final streamed JSON chunk:", e, "Chunk:", jsonStr);
                                }
                            }
                        }
                        break;
                    }

                    accumulatedResponse += decoder.decode(value, { stream: true });
                    let lines = accumulatedResponse.split('\n');
                    accumulatedResponse = lines.pop() || "";

                    let updateStatsNow = false;

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const jsonStr = line.substring(6).trim();
                            if (jsonStr === "[DONE]") {
                                // Mark that the provider ended the stream; finalize after loop
                                seenDone = true;
                                continue;
                            }
                            streamedProviderJsons.push(jsonStr);
                            try {
                                const parsed = JSON.parse(jsonStr);
                                streamedTopMeta = parsed; // Last non-empty JSON has latest meta (id, created, model, etc.)
                                streamedAllDeltas.push(parsed.choices[0] && parsed.choices[0].delta ? parsed.choices[0].delta : {});
                                
                                // Capture usage data if available
                                if (parsed.usage) {
                                    streamedUsage = parsed.usage;
                                }
                                
                                // Reasoning content accumulation (does not trigger TTFT)
                                if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.reasoning_content) {
                                    const rChunk = parsed.choices[0].delta.reasoning_content;
                                    reasoningTokenCount += estimateTokens(rChunk);
                                    sawReasoning = true;
                                }
                                
                                // The actual text:
                                if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                                    const textChunk = parsed.choices[0].delta.content;
                                    contentBuffer += textChunk;
                                    outputText.innerHTML += textChunk.replace(/\n/g, '<br>');
                                    streamedTokenCount = estimateTokens(contentBuffer);
                                    updateStatsNow = true;
                                }
                                // Finish reason may only come on last chunk (OpenAI)
                                if (parsed.choices && parsed.choices[0] && parsed.choices[0].finish_reason) {
                                    streamedFinishReason = parsed.choices[0].finish_reason;
                                }
                            } catch (e) {
                                console.warn("Error parsing streamed JSON chunk:", e, "Chunk:", jsonStr);
                            }
                        }
                    }

                    // Track first token time
                    if (firstTokenTime === null && updateStatsNow) {
                        firstTokenTime = now;
                    }

                    // Live update stats after chunk or every ~120ms
                    if (updateStatsNow || (now - lastLiveStatsUpdate > 120)) {
                        lastLiveStatsUpdate = now;
                        const elapsedSec = (now - startTime) / 1000;
                        const ttftSecNum = firstTokenTime ? ((firstTokenTime - startTime) / 1000) : null;
                        const timeToFirstTokenDisplay = ttftSecNum !== null ? `${ttftSecNum.toFixed(2)}s` : "…";

                        // Live counts
                        const completionTokensLive = streamedTokenCount; // content tokens only
                        const reasoningTokensLive = reasoningTokenCount;

                        // TPS live calculations
                        const reasoningDivTpsDen = (ttftSecNum !== null ? ttftSecNum : elapsedSec);
                        const reasoningTpsLive = (reasoningTokensLive > 0 && reasoningDivTpsDen > 0) ? (reasoningTokensLive / reasoningDivTpsDen).toFixed(2) : "…";
                        const completionTpsLive = (ttftSecNum !== null && (elapsedSec - ttftSecNum) > 0 && completionTokensLive > 0)
                            ? (completionTokensLive / (elapsedSec - ttftSecNum)).toFixed(2) : "…";
                        const totalTokensLive = promptTokensEstimate + reasoningTokensLive + completionTokensLive;
                        const totalTpsLive = ((reasoningTokensLive + completionTokensLive) > 0 && elapsedSec > 0)
                            ? ((reasoningTokensLive + completionTokensLive) / elapsedSec).toFixed(2) : "…";

                        // Build reasoning line only if we actually saw reasoning chunks
                        const reasoningLine = (sawReasoning && reasoningTokensLive > 0)
                            ? `<div><strong>Reasoning Tokens:</strong> ${reasoningTokensLive} (${reasoningTpsLive} tps)</div>`
                            : "";

                        statsArea.innerHTML = `
                            <div><strong>Time:</strong> ${elapsedSec.toFixed(2)}s</div>
                            <div><strong>Time to First Token:</strong> ${timeToFirstTokenDisplay}</div>
                            <div><strong>Prompt Tokens:</strong> ${promptTokensEstimate}</div>
                            ${reasoningLine}
                            <div><strong>Completion Tokens:</strong> ${completionTokensLive} (${completionTpsLive} tps)</div>
                            <div><strong>Total Tokens:</strong> ${totalTokensLive} (${totalTpsLive} tps)</div>
                        `;
                        statsArea.style.display = 'block';
                    }
                    
                    // If [DONE] was seen, render final stats using server usage (if present) and exit
                    if (seenDone) {
                        // Prefer server-provided usage (including reasoning_tokens)
                        let promptTokensFinal = 0, completionTokensFinal = 0, totalTokensFinal = promptTokensEstimate + streamedTokenCount, reasoningTokensFinal = 0;
                        if (streamedUsage && (streamedUsage.prompt_tokens !== undefined || streamedUsage.completion_tokens !== undefined)) {
                            promptTokensFinal = Number(streamedUsage.prompt_tokens ?? 0);
                            completionTokensFinal = Number(streamedUsage.completion_tokens ?? 0);
                            totalTokensFinal = Number(streamedUsage.total_tokens ?? (promptTokensFinal + completionTokensFinal));
                            reasoningTokensFinal = Number((streamedUsage.completion_tokens_details && streamedUsage.completion_tokens_details.reasoning_tokens) ?? 0);
                        } else {
                            // fallback to estimates
                            promptTokensFinal = promptTokensEstimate;
                            completionTokensFinal = streamedTokenCount;
                            totalTokensFinal = promptTokensFinal + completionTokensFinal;
                        }
                        const elapsedSecNum = (now - startTime) / 1000;
                        const ttftSecNum = firstTokenTime ? ((firstTokenTime - startTime) / 1000) : null;
                        const sinceFirstSecNum = ttftSecNum !== null ? Math.max(0, elapsedSecNum - ttftSecNum) : elapsedSecNum;
                        const realCompletionTokens = Math.max(0, completionTokensFinal - reasoningTokensFinal);
                        const reasoningTps = (ttftSecNum && ttftSecNum > 0 && reasoningTokensFinal > 0) ? (reasoningTokensFinal / ttftSecNum).toFixed(2) : "…";
                        const completionTps = (sinceFirstSecNum > 0 && realCompletionTokens > 0) ? (realCompletionTokens / sinceFirstSecNum).toFixed(2) : "…";
                        const totalTps = (elapsedSecNum > 0 && completionTokensFinal > 0) ? (completionTokensFinal / elapsedSecNum).toFixed(2) : "…";
                        const ttftDisplay = ttftSecNum !== null ? `${ttftSecNum.toFixed(2)}s` : "…";
                        statsArea.innerHTML = `
                            <div><strong>Time:</strong> ${elapsedSecNum.toFixed(2)}s</div>
                            <div><strong>Time to First Token:</strong> ${ttftDisplay}</div>
                            <div><strong>Prompt Tokens:</strong> ${promptTokensFinal}</div>
                            <div><strong>Reasoning Tokens:</strong> ${reasoningTokensFinal} (${reasoningTps} tps)</div>
                            <div><strong>Completion Tokens:</strong> ${realCompletionTokens} (${completionTps} tps)</div>
                            <div><strong>Total Tokens:</strong> ${totalTokensFinal} (${totalTps} tps)</div>
                        `;
                        statsArea.style.display = 'block';
                        break; // Exit while(true)
                    }
                }
            }
            await processStream();
            // Reconstruct pretty, merged JSON response if possible
            if (streamedTopMeta) {
                // Compose full content:
                const fullContent = streamedAllDeltas
                  .map(d => d.content || "")
                  .join("");
                // Start with top meta, but remove choices
                const resp = {};
                for (const k of Object.keys(streamedTopMeta)) {
                  if (k !== "choices") resp[k] = streamedTopMeta[k];
                }
                resp.choices = [
                  {
                    finish_reason: streamedFinishReason || null,
                    message: {
                      role: (streamedTopMeta.choices && streamedTopMeta.choices[0] && streamedTopMeta.choices[0].delta && streamedTopMeta.choices[0].delta.role) || "assistant",
                      content: fullContent
                    }
                  }
                ];
                lastApiResponse = JSON.stringify(resp, null, 2);
            } else {
                // Fallback: dump all received JSON lines, as before
                const jsonl = streamedProviderJsons
                  .filter(js => js && js !== "[DONE]")
                  .map(js => js.trim())
                  .join('\n');
                lastApiResponse = jsonl || '{ "error": "no provider response captured (streaming)" }';
            }

        } else {
            // Existing non-streaming logic
            const data = await handleApiResponse(response); // handleApiResponse is for non-streaming
            console.log("Text API Response Data (Non-Streaming):", data);
            lastApiResponse = JSON.stringify(data, null, 2); // Keep this for non-streaming

            // Extract content
            let aiContent = '';
            if (provider === 'claude') {
                if (data.content && data.content.length > 0 && data.content[0].text) aiContent = data.content[0].text;
                else throw new Error('Could not find text content in Claude response.');
            } else { // OpenAI/Compatible (non-streaming), Deepseek, OpenRouter
                if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) aiContent = data.choices[0].message.content;
                else throw new Error('Could not find message content in API response.');
            }

            // Display the AI response
            outputText.innerHTML = `<strong>${model}:</strong><br>${aiContent.replace(/\n/g, '<br>')}`;
            outputArea.style.borderColor = '#ccc';

            // Calculate and display stats if usage data is available
            if (data.usage) {
                const usage = data.usage;
                const promptTokens = usage.prompt_tokens || 0;
                const completionTokens = usage.completion_tokens || 0;
                const totalTokens = usage.total_tokens || (promptTokens + completionTokens);
                let tokensPerSecond = 0;

                if (durationInSeconds > 0 && completionTokens > 0) {
                    tokensPerSecond = (completionTokens / durationInSeconds).toFixed(2);
                }

                statsArea.innerHTML = `
                    <span><strong>Time:</strong> ${durationInSeconds.toFixed(2)}s</span>
                    <span><strong>Tokens/Sec:</strong> ${tokensPerSecond}</span>
                    <span><strong>Prompt Tokens:</strong> ${promptTokens}</span>
                    <span><strong>Completion Tokens:</strong> ${completionTokens}</span>
                    <span><strong>Total Tokens:</strong> ${totalTokens}</span>
                `;
                statsArea.style.display = 'block';
            } else {
                 statsArea.innerHTML = `<span><strong>Time:</strong> ${durationInSeconds.toFixed(2)}s</span><br><span>Usage data not available in response.</span>`;
                 statsArea.style.display = 'block';
            }
        }
} catch (error) {
    // Handle cancellation
    if (error.name === 'AbortError') {
        outputText.innerHTML = 'Request cancelled by user.';
        outputArea.style.borderColor = 'orange';
        statsArea.style.display = 'none';
    } else {
        // lastApiResponse might contain error details already
        displayError(error.message); // displayError will hide loader
        statsArea.style.display = 'none'; // Hide stats on error
    }
} finally {
    hideLoader(); // Ensure loader is hidden
    hideStopButton(); // Hide stop button
    currentRequestController = null; // Clear controller reference
}
}


// Handles image generation API calls.
async function callImageApi(provider, apiKey, baseUrl, model, prompt) {
    showLoader(); // Show loader at the start
    showStopButton(); // Show stop button
    clearOutput();
    outputText.innerHTML = 'Sending image request...'; // Use text area for status
    outputArea.style.display = 'block';
    statsArea.style.display = 'none'; // Will show stats later if successful

    // Create AbortController for cancellation
    const controller = new AbortController();
    const { signal } = controller;
    currentRequestController = controller; // Store reference for cancellation

    let apiUrl = '';
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };

    // Determine API URL based on provider
    if (provider === 'openai') {
        apiUrl = 'https://api.openai.com/v1/images/generations';
    } else if (provider === 'openai_compatible') {
        if (!baseUrl) {
            hideLoader();
            hideStopButton();
            return displayError('Base URL is required for OpenAI Compatible image generation.');
        }
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        apiUrl = `${cleanBaseUrl}/images/generations`;
    } else {
        hideLoader();
        hideStopButton();
        return displayError(`Image generation is currently only supported for OpenAI and potentially OpenAI Compatible providers in this example.`);
    }

    // Get custom width and height, provide defaults if empty
    const width = imageWidthInput.value.trim() || '1024';
    const height = imageHeightInput.value.trim() || '1024';
    const customSize = `${width}x${height}`;
    const body = {
        model: model,
        prompt: prompt,
        n: 1,
        size: customSize,
        response_format: "url"
    };
    // Include quality parameter only if enabled
    if (provider === 'openai_compatible' && enableQualityCheckbox.checked && qualitySelect) {
        if (qualitySelect.value === 'custom' && customQualityInput) {
            if (customQualityInput.value.trim() === '') {
                // Potentially display an error or use a default if custom quality is selected but empty
                console.warn("Custom quality selected but input is empty. API might reject or use default.");
                // Not setting body.quality here, or explicitly setting to a default if API requires it
            } else {
                body.quality = customQualityInput.value.trim();
            }
        } else if (qualitySelect.value !== 'custom') {
            body.quality = qualitySelect.value;
        }
        // If qualitySelect.value is 'custom' but customQualityInput is missing, body.quality remains unset.
    }

    // Store payload before sending
    lastRequestPayload = JSON.stringify(body, null, 2);
    payloadContainer.style.display = 'block';

    // Record start time for timing stats
    const startTime = performance.now();
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
            signal: signal
        });

        const endTime = performance.now();
        const durationInSeconds = ((endTime - startTime) / 1000).toFixed(2);

        const data = await handleApiResponse(response);
        console.log("Image API Response Data:", data);

        // Extract image (URL or base64) and show stats
        if (data.data && data.data.length > 0) {
            const item = data.data[0];
            let imageUrl = '';
            
            if (item.url) {
                imageUrl = item.url;
                outputText.innerHTML = `Image generated successfully by ${model}.`;
                outputImage.src = imageUrl;
                outputImage.style.display = 'block';
                outputArea.style.borderColor = '#ccc';
                downloadImageBtn.href = imageUrl;
                downloadImageBtn.download = `image-${model}-${Date.now()}.png`; // Suggest a filename
                downloadImageBtn.style.display = 'inline-block';
            } else if (item.b64_json) {
                const imageData = `data:image/png;base64,${item.b64_json}`;
                imageUrl = imageData;
                outputText.innerHTML = `Image generated successfully by ${model}.`;
                outputImage.src = imageData;
                outputImage.style.display = 'block';
                outputArea.style.borderColor = '#ccc';
                downloadImageBtn.href = imageData;
                downloadImageBtn.download = `image-${model}-${Date.now()}.png`; // Suggest a filename
                downloadImageBtn.style.display = 'inline-block';
            } else {
                throw new Error('Could not find image data in API response.');
            }

            // Display stats
            let statsHtml = `
                <span><strong>Generation Time:</strong> ${durationInSeconds}s</span>
                <span><strong>Resolution:</strong> ${width}x${height}</span>
                <span><strong>Model:</strong> ${model}</span>
            `;
            
            // Add quality if enabled
            if (enableQualityCheckbox.checked && qualitySelect) {
                statsHtml += `<span><strong>Quality:</strong> ${qualitySelect.value}</span>`;
            }

            // Add provider-specific data
            if (data.created) {
                statsHtml += `<span><strong>Created:</strong> ${new Date(data.created * 1000).toLocaleString()}</span>`;
            }
            
            // Check for credit usage if available
            if (data.usage && data.usage.prompt_tokens) {
                statsHtml += `<span><strong>Prompt Tokens:</strong> ${data.usage.prompt_tokens}</span>`;
            }
            
            statsArea.innerHTML = statsHtml;
            statsArea.style.display = 'block';
            
            // Once image loads, we can get the actual dimensions
            outputImage.onload = () => {
                const actualWidth = outputImage.naturalWidth;
                const actualHeight = outputImage.naturalHeight;
                
                // Find and update the resolution span
                const resolutionSpan = statsArea.querySelector('span:nth-child(2)');
                if (resolutionSpan) {
                    resolutionSpan.innerHTML = `<strong>Resolution:</strong> ${actualWidth}x${actualHeight}`;
                }
            };
        } else {
            throw new Error('Could not find image in API response.');
        }

    } catch (error) {
        // Handle cancellation
        if (error.name === 'AbortError') {
            outputText.innerHTML = 'Request cancelled by user.';
            outputArea.style.borderColor = 'orange';
            statsArea.style.display = 'none';
        } else {
            if (error.message.includes('Invalid quality')) {
                console.warn('Invalid quality parameter unsupported, retrying without quality...');
                // Retry without quality param
                const fallbackBody = { ...body };
                delete fallbackBody.quality;
                try {
                    const retryStartTime = performance.now();
                    const retryResponse = await fetch(apiUrl, {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(fallbackBody),
                        signal: signal
                    });
                    
                    const retryEndTime = performance.now();
                    const retryDuration = ((retryEndTime - retryStartTime) / 1000).toFixed(2);

                    const retryData = await handleApiResponse(retryResponse); // Use helper for retry
                    
                    // Extract image URL
                    if (retryData.data && retryData.data.length > 0 && retryData.data[0].url) {
                        const imageUrl2 = retryData.data[0].url;
                        outputText.innerHTML = `Image generated successfully by ${model}.`;
                        outputImage.src = imageUrl2;
                        outputImage.style.display = 'block';
                        outputArea.style.borderColor = '#ccc';
                        
                        // Display stats for retry
                        statsArea.innerHTML = `
                            <span><strong>Generation Time:</strong> ${retryDuration}s</span>
                            <span><strong>Resolution:</strong> ${width}x${height}</span>
                            <span><strong>Model:</strong> ${model}</span>
                            <span><strong>Note:</strong> Quality param was removed due to API incompatibility</span>
                        `;
                        statsArea.style.display = 'block';
                        
                        // Update resolution on image load
                        outputImage.onload = () => {
                            const actualWidth = outputImage.naturalWidth;
                            const actualHeight = outputImage.naturalHeight;
                            const resolutionSpan = statsArea.querySelector('span:nth-child(2)');
                            if (resolutionSpan) {
                                resolutionSpan.innerHTML = `<strong>Resolution:</strong> ${actualWidth}x${actualHeight}`;
                            }
                        };
                        
                        downloadImageBtn.href = imageUrl2;
                        downloadImageBtn.download = `image-${model}-${Date.now()}-retry.png`;
                        downloadImageBtn.style.display = 'inline-block';
                        
                        return;
                    } else {
                        throw new Error('Could not find image URL in API response after retry.');
                    }
                } catch (retryError) {
                    // Handle cancellation during retry
                    if (retryError.name === 'AbortError') {
                        outputText.innerHTML = 'Request cancelled by user.';
                        outputArea.style.borderColor = 'orange';
                        statsArea.style.display = 'none';
                    } else {
                        displayError(retryError.message);
                    }
                    return;
                }
            } else {
                displayError(error.message); // displayError will hide loader
            }
        }
    } finally {
        hideLoader(); // Ensure loader is hidden
        hideStopButton(); // Hide stop button
        currentRequestController = null; // Clear controller reference
    }
}

// Handles Text-to-Speech (TTS) API calls.
async function callTtsApi(provider, apiKey, baseUrl, model, text, voice, format) {
    showLoader(); // Show loader at the start
    showStopButton(); // Show stop button
    clearOutput();
    outputText.innerHTML = 'Generating TTS...';
    outputAudio.style.display = 'none';
    downloadAudio.style.display = 'none';
    outputArea.style.display = 'block';

    // Create AbortController for cancellation
    const controller = new AbortController();
    const { signal } = controller;
    currentRequestController = controller; // Store reference for cancellation

    let apiUrl = '';
    let headers = {};
    let body = {};

    switch(provider) {
        case 'openai':
            apiUrl = 'https://api.openai.com/v1/audio/speech';
            headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
            body = { model: model, input: text, voice: voice, ...(format && { response_format: format }) };
            break;
        case 'openai_compatible':
            if (!baseUrl) {
                hideLoader();
                hideStopButton();
                return displayError('Base URL is required for OpenAI Compatible TTS.');
            }
            const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            apiUrl = `${cleanBase}/audio/speech`;
            headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
            body = { model: model, input: text, voice: voice, ...(format && { response_format: format }) };
            break;
        default:
            hideLoader();
            hideStopButton();
            return displayError('TTS is only supported for OpenAI and OpenAI Compatible providers.');
    }

    // Store payload before sending
    lastRequestPayload = JSON.stringify(body, null, 2);
    payloadContainer.style.display = 'block';

    // Record start time for timing stats
    const startTime = performance.now();
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
            signal: signal
        });
        
        const endTime = performance.now();
        const durationInSeconds = ((endTime - startTime) / 1000).toFixed(2);
        
        // For TTS, the successful response is the audio blob, not JSON
        // We store info about the response headers or status for debugging
        if (!response.ok) {
            const msg = await response.text();
            lastApiResponse = `TTS API Error (${response.status}):\n${msg}`;
            throw new Error(msg);
        } else {
            // Successful audio response
            lastApiResponse = `Status: ${response.status} ${response.statusText}\nContent-Type: ${response.headers.get('Content-Type') || 'N/A'}\nContent-Length: ${response.headers.get('Content-Length') || 'N/A'}`;
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        outputAudio.src = url;
        outputAudio.preload = 'metadata';
        
        // Display initial stats
        statsArea.innerHTML = `
            <span><strong>Generation Time:</strong> ${durationInSeconds}s</span>
            <span><strong>File Size:</strong> ${(blob.size / 1024).toFixed(2)} KB</span>
            <span><strong>Model:</strong> ${model}</span>
            <span><strong>Voice:</strong> ${voice}</span>
            <span><strong>Characters:</strong> ${text.length}</span>
        `;
        statsArea.style.display = 'block';
        
        outputAudio.addEventListener('loadedmetadata', () => {
            // Update stats with audio duration
            const audioDuration = outputAudio.duration.toFixed(2);
            const statsSpans = statsArea.querySelectorAll('span');
            
            // Add audio duration if available
            if (audioDuration && audioDuration > 0) {
                statsArea.innerHTML += `<span><strong>Audio Length:</strong> ${audioDuration}s</span>`;
                
                // Calculate characters per second
                const charsPerSecond = (text.length / audioDuration).toFixed(2);
                statsArea.innerHTML += `<span><strong>Chars/Second:</strong> ${charsPerSecond}</span>`;
            }
            
            outputAudio.style.display = 'block';
            downloadAudio.href = url;
            downloadAudio.download = `${model}-${voice}-tts.mp3`; // Changed to mp3 as it's common for OpenAI TTS
            downloadAudio.style.display = 'inline';
            outputText.innerHTML = `<strong>Voice:</strong> ${voice}`;
            outputText.style.display = 'block';
        }, { once: true });
        
        outputAudio.load();
    } catch (err) {
        // Handle cancellation
        if (err.name === 'AbortError') {
            outputText.innerHTML = 'Request cancelled by user.';
            outputArea.style.borderColor = 'orange';
            statsArea.style.display = 'none';
        } else {
            // lastApiResponse might be set from the !response.ok block
            displayError(err.message); // displayError will hide loader
            statsArea.style.display = 'none'; // Hide stats on error
        }
    } finally {
        hideLoader(); // Ensure loader is hidden
        hideStopButton(); // Hide stop button
        currentRequestController = null; // Clear controller reference
    }
}

// Handles Speech-to-Text (STT) API calls.
async function callSttApi(provider, apiKey, baseUrl, model, file, streaming = true) {
    showLoader(); // Show loader at the start
    showStopButton(); // Show stop button
    clearOutput();
    outputText.innerHTML = 'Transcribing audio...';
    outputArea.style.display = 'block';
    outputImage.style.display = 'none';
    outputAudio.style.display = 'none';
    downloadAudio.style.display = 'none';

    // Create AbortController for cancellation
    const controller = new AbortController();
    const { signal } = controller;
    currentRequestController = controller; // Store reference for cancellation

    // Can't easily stringify FormData, so we store what we can
    const payloadInfo = {
        provider: provider,
        model: model,
        fileName: file.name,
        fileSizeKB: (file.size / 1024).toFixed(2),
        fileType: file.type,
        streaming: streaming
    };
    lastRequestPayload = JSON.stringify(payloadInfo, null, 2);
    payloadContainer.style.display = 'block';

    // Record start time for timing stats
    const startTime = performance.now();
    const fileSize = (file.size / 1024).toFixed(2); // KB
    
    try {
        let apiUrl = '';
        let headers = { 'Authorization': `Bearer ${apiKey}` };
        // Determine endpoint based on provider
        if (provider === 'openai') {
            apiUrl = 'https://api.openai.com/v1/audio/transcriptions';
        } else if (provider === 'openai_compatible') {
            if (!baseUrl) {
                hideLoader();
                hideStopButton();
                return displayError('Base URL is required for OpenAI Compatible STT.');
            }
            const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            apiUrl = `${cleanBase}/audio/transcriptions`;
        } else {
            hideLoader();
            hideStopButton();
            return displayError('STT is not supported for selected provider.');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', model);
        // Attach streaming flag if api supports (OpenAI does)
        if (typeof streaming !== "undefined" && streaming !== null) {
            formData.append('stream', streaming ? "true" : "false");
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: formData,
            signal: signal
        });

        const endTime = performance.now();
        const durationInSeconds = ((endTime - startTime) / 1000).toFixed(2);

        // Check for streaming (OpenAI style: SSE Multipart)
        const isStreamingMode = !!streaming && response && response.headers.get("content-type") && response.headers.get("content-type").includes("text/event-stream");
        if (isStreamingMode) {
            // SSE "streaming" response. Parse line-by-line.
            let partialTranscript = "";
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let done = false;
            outputText.innerHTML = `<strong>Transcribed by ${model} (partial):</strong><br>`;
            while (!done) {
                const { value, done: streamDone } = await reader.read();
                done = streamDone;
                if (value) {
                    const chunk = decoder.decode(value);
                    // Each SSE chunk: look for lines starting with "data: "
                    chunk.split("\n").forEach(line => {
                        if (line.startsWith("data: ")) {
                            const dataStr = line.replace("data: ", "").trim();
                            if (dataStr && dataStr !== "[DONE]") {
                                try {
                                    const parsed = JSON.parse(dataStr);
                                    if (parsed.text || parsed.transcript || parsed.partial) {
                                        const token = parsed.text || parsed.transcript || parsed.partial;
                                        partialTranscript += token;
                                        outputText.innerHTML = `<strong>Transcribed by ${model} (partial):</strong><br>${partialTranscript.replace(/\\n/g, '<br>')}`;
                                    }
                                } catch {
                                    // Not valid JSON, skip
                                }
                            }
                        }
                    });
                }
            }
            // Final stats for streaming STT
            outputText.innerHTML = `<strong>Transcribed by ${model}:</strong><br>${partialTranscript.replace(/\\n/g, '<br>')}`;
            statsArea.innerHTML = `
                <span><strong>Transcription Time:</strong> ${durationInSeconds}s</span>
                <span><strong>File Size:</strong> ${fileSize} KB</span>
                <span><strong>Model:</strong> ${model}</span>
                <span><strong>Characters Generated:</strong> ${partialTranscript.length}</span>
                <span><strong>Mode:</strong> Streaming</span>
            `;
            statsArea.style.display = 'block';
            lastApiResponse = partialTranscript;
        } else {
            // Non-streaming response (regular)
            const data = await handleApiResponse(response);
            const transcript = data.text || data.transcript || JSON.stringify(data);
            outputText.innerHTML = `<strong>Transcribed by ${model}:</strong><br>${transcript.replace(/\\n/g, '<br>')}`;
            // Display stats
            statsArea.innerHTML = `
                <span><strong>Transcription Time:</strong> ${durationInSeconds}s</span>
                <span><strong>File Size:</strong> ${fileSize} KB</span>
                <span><strong>Model:</strong> ${model}</span>
                <span><strong>Characters Generated:</strong> ${transcript.length}</span>
            `;
            // Add file duration if we can get it
            if (file.type.includes('audio')) {
                const audio = new Audio();
                audio.src = URL.createObjectURL(file);
                audio.onloadedmetadata = () => {
                    const audioDuration = audio.duration.toFixed(2);
                    if (audioDuration && audioDuration > 0) {
                        statsArea.innerHTML += `<span><strong>Audio Length:</strong> ${audioDuration}s</span>`;
                        // Add processing speed relative to audio length
                        const processingRatio = (audioDuration / durationInSeconds).toFixed(2);
                        statsArea.innerHTML += `<span><strong>Processing Speed:</strong> ${processingRatio}x realtime</span>`;
                    }
                };
                audio.load();
            }
            // If we have usage data, show it
            if (data.usage) {
                if (data.usage.prompt_tokens) {
                    statsArea.innerHTML += `<span><strong>Prompt Tokens:</strong> ${data.usage.prompt_tokens}</span>`;
                }
                if (data.usage.completion_tokens) {
                    statsArea.innerHTML += `<span><strong>Completion Tokens:</strong> ${data.usage.completion_tokens}</span>`;
                }
                if (data.usage.total_tokens) {
                    statsArea.innerHTML += `<span><strong>Total Tokens:</strong> ${data.usage.total_tokens}</span>`;
                }
            }
            statsArea.style.display = 'block';
        }
    } catch (err) {
        // Handle cancellation
        if (err.name === 'AbortError') {
            outputText.innerHTML = 'Request cancelled by user.';
            outputArea.style.borderColor = 'orange';
            statsArea.style.display = 'none';
        } else {
            // lastApiResponse might contain error details
            displayError(err.message); // displayError will hide loader
            statsArea.style.display = 'none'; // Hide stats on error
        }
    } finally {
        hideLoader(); // Ensure loader is hidden
        hideStopButton(); // Hide stop button
        currentRequestController = null; // Clear controller reference
    }
}

// Universal function to extract video URL from various API response structures.
function extractVideoUrl(responseData) {
    console.log('Extracting video URL from response:', responseData);
    
    if (!responseData) {
        console.error('No response data provided to extractVideoUrl');
        return null;
    }
    
    // Collection of all found URLs with priority scoring
    const foundUrls = [];
    
    // Recursive function to find all URLs in the response
    function findAllUrls(obj, path = '', depth = 0) {
        if (depth > 10) return; // Prevent infinite recursion
        
        if (typeof obj === 'string') {
            // Check if it's a valid URL
            if (isValidUrl(obj)) {
                const priority = calculateUrlPriority(obj, path);
                foundUrls.push({ url: obj, path: path, priority: priority });
                console.log(`Found URL at ${path}: ${obj} (priority: ${priority})`);
            }
        } else if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
                findAllUrls(item, `${path}[${index}]`, depth + 1);
            });
        } else if (obj && typeof obj === 'object') {
            Object.entries(obj).forEach(([key, value]) => {
                const newPath = path ? `${path}.${key}` : key;
                findAllUrls(value, newPath, depth + 1);
            });
        }
    }
    
    // Helper function to check if a string is a valid URL
    function isValidUrl(string) {
        try {
            // Must be a URL starting with http/https
            if (!string.startsWith('http://') && !string.startsWith('https://')) {
                return false;
            }
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    // Function to calculate URL priority based on context and content
    function calculateUrlPriority(url, path) {
        let priority = 0;
        const pathLower = path.toLowerCase();
        const urlLower = url.toLowerCase();
        
        // High priority: video-specific fields
        if (pathLower.includes('video_url') || pathLower.includes('videourl')) {
            priority += 100;
        }
        
        // High priority: video-related field names
        if (pathLower.includes('video') && pathLower.includes('url')) {
            priority += 90;
        }
        
        // Medium-high priority: common video response structures
        if (pathLower.includes('data') && pathLower.includes('url')) {
            priority += 80;
        }
        
        if (pathLower.includes('result') && pathLower.includes('url')) {
            priority += 75;
        }
        
        if (pathLower.includes('output') && (pathLower.includes('url') || pathLower === 'output')) {
            priority += 70;
        }
        
        // Medium priority: general URL fields
        if (pathLower.endsWith('url') || pathLower === 'url') {
            priority += 60;
        }
        
        // URL content analysis
        // Very high priority: obvious video file extensions
        if (/\.(mp4|avi|mov|webm|mkv|m4v|3gp|flv|wmv)(\?|$)/i.test(url)) {
            priority += 200;
        }
        
        // High priority: video-related domains or paths
        if (/\/video|\/v\/|\/watch|\/media|\/stream/i.test(url)) {
            priority += 50;
        }
        
        // Medium priority: common video hosting patterns
        if (/youtube|vimeo|cloudinary|amazonaws|blob:|streamable/i.test(url)) {
            priority += 40;
        }
        
        // Low priority: might be thumbnails or other media
        if (/thumbnail|thumb|preview|poster|image/i.test(pathLower)) {
            priority -= 30;
        }
        
        // Bonus for secure URLs
        if (url.startsWith('https://')) {
            priority += 5;
        }
        
        return priority;
    }
    
    // Find all URLs in the response
    findAllUrls(responseData);
    
    if (foundUrls.length === 0) {
        console.error('No URLs found in response. Available fields:', Object.keys(responseData));
        return null;
    }
    
    // Sort URLs by priority (highest first)
    foundUrls.sort((a, b) => b.priority - a.priority);
    
    console.log('All found URLs with priorities:', foundUrls);
    
    // Return the highest priority URL
    const bestUrl = foundUrls[0];
    console.log(`Selected best URL: ${bestUrl.url} from path: ${bestUrl.path} (priority: ${bestUrl.priority})`);
    
    return bestUrl.url;
}

// Sets up the video download button with appropriate event listeners.
function setupVideoDownload(videoUrl, model) {
    const fileName = `video-${model}-${Date.now()}.mp4`;
    
    // Get the download button and clear any existing listeners
    const downloadBtn = document.getElementById('download-video-btn');
    
    // Clone the button to remove all event listeners, then replace it
    const newDownloadBtn = downloadBtn.cloneNode(true);
    downloadBtn.parentNode.replaceChild(newDownloadBtn, downloadBtn);
    
    // Make sure the button is visible and properly styled
    newDownloadBtn.style.display = 'inline-block';
    newDownloadBtn.textContent = 'Download Video';
    newDownloadBtn.disabled = false;
    
    newDownloadBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        try {
            // Show download status
            const originalText = newDownloadBtn.textContent;
            newDownloadBtn.textContent = 'Downloading...';
            newDownloadBtn.disabled = true;
            
            // Fetch the video
            const response = await fetch(videoUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'video/*',
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
            }
            
            // Get the video blob
            const blob = await response.blob();
            
            // Create download link
            const downloadUrl = URL.createObjectURL(blob);
            const tempLink = document.createElement('a');
            tempLink.href = downloadUrl;
            tempLink.download = fileName;
            tempLink.style.display = 'none';
            
            // Trigger download
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            
            // Cleanup
            setTimeout(() => {
                URL.revokeObjectURL(downloadUrl);
            }, 1000);
            
            // Reset button
            newDownloadBtn.textContent = originalText;
            newDownloadBtn.disabled = false;
            
        } catch (error) {
            console.error('Download failed:', error);
            
            // Fallback: try to open in new tab
            console.log('Attempting fallback download method...');
            const tempLink = document.createElement('a');
            tempLink.href = videoUrl;
            tempLink.download = fileName;
            tempLink.target = '_blank';
            tempLink.rel = 'noopener noreferrer';
            tempLink.style.display = 'none';
            
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            
            // Reset button
            newDownloadBtn.textContent = 'Download Video';
            newDownloadBtn.disabled = false;
            
            // Show user-friendly message
            outputText.innerHTML += '<br><small style="color: orange;">Note: Direct download failed, opened video in new tab. You can right-click and "Save as..." to download.</small>';
        }
    });
}

// Handles video generation API calls.
async function callVideoApi(provider, apiKey, baseUrl, model, prompt) {
    showLoader(); // Show loader at the start
    clearOutput();
    outputText.innerHTML = 'Generating video...';
    outputArea.style.display = 'block';
    statsArea.style.display = 'none';

    const aspectRatioEnabled = videoAspectRatioEnabled.checked;
    const aspectRatio = videoAspectRatioSelect.value;
    const duration = parseInt(videoDurationInput.value);

    let apiUrl = '';
    let headers = {};
    let body = {};

    // Configure based on provider for direct API calls
    switch (provider) {
        case 'openai':
            // OpenAI doesn't have video generation yet, show placeholder
            displayError('OpenAI does not currently support video generation. Try using a different provider or a compatible service.');
            return;
        case 'openai_compatible':
            if (!baseUrl) return displayError('Base URL is required for OpenAI Compatible video generation.');
            const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            apiUrl = `${cleanBaseUrl}/videos/generations`;
            headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
            body = { model: model, prompt: prompt, duration: duration };
            if (aspectRatioEnabled) {
                body.aspect_ratio = aspectRatio;
            }
            break;
        case 'deepseek':
            displayError('Deepseek does not currently support video generation. Try using a different provider.');
            return;
        case 'claude':
            displayError('Claude does not currently support video generation. Try using a different provider.');
            return;
        case 'openrouter':
            // OpenRouter might have video models available
            apiUrl = 'https://openrouter.ai/api/v1/videos/generations';
            headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };

             const getToggleStateOpenRouter = (paramId) => {
                const toggle = document.querySelector(`.param-toggle[data-param-id="${paramId}"]`);
                return toggle ? toggle.checked : true;
            };

            body = { model: model, prompt: prompt }; // Start with required params

            // Include duration if toggled and has value
            if (getToggleStateOpenRouter('video-duration') && duration) {
                body.duration = duration;
            }

             // Include aspect ratio if its parent toggle is enabled and a value is selected
             const aspectRatioToggleOpenRouter = document.getElementById('video-aspect-ratio-enabled');
             if (aspectRatioToggleOpenRouter && aspectRatioToggleOpenRouter.checked && aspectRatio) {
                 body.aspect_ratio = aspectRatio;
             }
            break;
        default:
            return displayError('Video generation is not supported for the selected provider. Try OpenAI Compatible or OpenRouter.');
    }

    // Store payload before sending
    lastRequestPayload = JSON.stringify(body, null, 2);
    payloadContainer.style.display = 'block';

    // Record start time for timing stats
    const startTime = performance.now();
    
    try {
        // For providers that we know don't support video, displayError is called in the switch,
        // and displayError itself handles hideLoader. So no explicit hideLoader here is needed for these cases.
        // The 'return' in the switch for these providers will prevent further execution.

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });

        const endTime = performance.now();
        const durationInSeconds = ((endTime - startTime) / 1000).toFixed(2);

        const data = await handleApiResponse(response);
        console.log("Video API Response Data:", data);

        // Extract video URL and show stats - improved to handle multiple response formats
        let videoUrl = extractVideoUrl(data);
        
        if (videoUrl) {
            outputText.innerHTML = `Video generated successfully by ${model}.`;
            outputVideo.src = videoUrl;
            outputVideo.style.display = 'block';
            outputArea.style.borderColor = '#ccc';
            
            // Setup proper video download
            setupVideoDownload(videoUrl, model);
            downloadVideoBtn.style.display = 'inline-block';
            
            // Display stats
            let statsHtml = `
                <span><strong>Generation Time:</strong> ${durationInSeconds}s</span>
                <span><strong>Duration:</strong> ${duration}s</span>
                <span><strong>Model:</strong> ${model}</span>
            `;
            
            // Add aspect ratio if enabled
            if (aspectRatioEnabled) {
                statsHtml += `<span><strong>Aspect Ratio:</strong> ${aspectRatio}</span>`;
            }

            // Add provider-specific data
            if (data.created) {
                statsHtml += `<span><strong>Created:</strong> ${new Date(data.created * 1000).toLocaleString()}</span>`;
            }
            
            // Check for usage data if available
            if (data.usage && data.usage.prompt_tokens) {
                statsHtml += `<span><strong>Prompt Tokens:</strong> ${data.usage.prompt_tokens}</span>`;
            }
            
            statsArea.innerHTML = statsHtml;
            statsArea.style.display = 'block';
            
        } else {
            throw new Error('Could not find video URL in API response. Response structure: ' + JSON.stringify(data, null, 2));
        }

    } catch (error) {
        displayError(error.message); // displayError will hide loader
        statsArea.style.display = 'none';
    } finally {
        // Ensure loader is hidden for all other cases, including successful calls or other errors
        if (!(provider === 'openai' || provider === 'deepseek' || provider === 'claude')) {
            hideLoader();
        }
    }
}



// --- INITIALIZATION ---

/* Binds all event listeners for the application. */
function bindEventListeners() {
    // Main actions
    sendButton.addEventListener('click', handleSendClick);
    stopButton.addEventListener('click', handleStopClick);
    togglePayloadBtn.addEventListener('click', handleTogglePayload);
    toggleResponseBtn.addEventListener('click', handleToggleResponse);
    providerSelect.addEventListener('change', handleProviderChange);
    modelSelect.addEventListener('change', handleModelSelectionChange);
    refreshModelsBtn.addEventListener('click', fetchModels);

        // Generation type and options
        generationTypeRadios.forEach(radio => {
            radio.addEventListener('click', handleGenerationTypeChange);
        });
        if (audioTypeSelect) audioTypeSelect.addEventListener('change', function() {
            handleAudioTypeChange();
            toggleGenerationOptions();
        });
        if (recordBtn) recordBtn.addEventListener('click', handleRecordClick);
        enableQualityCheckbox.addEventListener('change', handleEnableQualityChange);
        qualitySelect.addEventListener('change', handleQualitySelectChange);
        videoAspectRatioEnabled.addEventListener('change', handleAspectRatioToggle);
    
        // --- TTS Format Dropdown logic ---
        if (ttsFormatSelect) {
            ttsFormatSelect.addEventListener('change', function() {
                if (ttsFormatSelect.value === 'custom') {
                    if (customTtsFormatInput) customTtsFormatInput.style.display = 'block';
                } else {
                    if (customTtsFormatInput) customTtsFormatInput.style.display = 'none';
                }
            });
            // Hide custom input on load but restore if needed
            if (customTtsFormatInput) {
                if (ttsFormatSelect.value !== 'custom') {
                    customTtsFormatInput.style.display = 'none';
                }
            }
        }
    // --- Neue Sichtbarkeits-Logik: Umschaltbare Parameter wie Streaming ---
    function showOrHideParamGroup(groupId, checkboxEl) {
        const group = document.getElementById(groupId);
        if (!group || !checkboxEl) return;
        group.style.display = checkboxEl.checked ? '' : 'none';
    }

    // Listener und Initialzustand für alle Param-Switches
    if (enableSystemPromptCheckbox) {
        enableSystemPromptCheckbox.addEventListener('change', () => {
            showOrHideParamGroup('system-prompt-group', enableSystemPromptCheckbox);
            saveGeneralSettings();
        });
        showOrHideParamGroup('system-prompt-group', enableSystemPromptCheckbox);
    }
    if (enableTemperatureCheckbox) {
        enableTemperatureCheckbox.addEventListener('change', () => {
            showOrHideParamGroup('temperature-group', enableTemperatureCheckbox);
            saveGeneralSettings();
        });
        showOrHideParamGroup('temperature-group', enableTemperatureCheckbox);
    }
    if (enableTopPCheckbox) {
        enableTopPCheckbox.addEventListener('change', () => {
            showOrHideParamGroup('top-p-group', enableTopPCheckbox);
            saveGeneralSettings();
        });
        showOrHideParamGroup('top-p-group', enableTopPCheckbox);
    }
    if (enableMaxTokensCheckbox) {
        enableMaxTokensCheckbox.addEventListener('change', () => {
            showOrHideParamGroup('max-tokens-group', enableMaxTokensCheckbox);
            saveGeneralSettings();
        });
        showOrHideParamGroup('max-tokens-group', enableMaxTokensCheckbox);
    }
    if (enableInferenceEffortCheckbox) {
        enableInferenceEffortCheckbox.addEventListener('change', () => {
            showOrHideParamGroup('inference-effort-group', enableInferenceEffortCheckbox);
            saveGeneralSettings();
        });
        showOrHideParamGroup('inference-effort-group', enableInferenceEffortCheckbox);
    }

    temperatureInput.addEventListener('input', () => {
        temperatureValue.textContent = parseFloat(temperatureInput.value).toFixed(1);
        saveGeneralSettings();
    });
    topPInput.addEventListener('input', () => {
        topPValue.textContent = parseFloat(topPInput.value).toFixed(2);
        saveGeneralSettings();
    });


    // Inputs that trigger a settings save
    const inputsToSave = [
        customModelInput, promptInput, enableStreamingCheckbox, customQualityInput,
        imageWidthInput, imageHeightInput, voiceInput, videoDurationInput,
        videoAspectRatioSelect, systemPromptInput, maxTokensInput, inferenceEffortInput,
        // NEW: Checkbox toggles trigger save as well:
        enableSystemPromptCheckbox, enableTemperatureCheckbox, enableTopPCheckbox, enableMaxTokensCheckbox, enableInferenceEffortCheckbox
    ];
    inputsToSave.forEach(input => {
        if (input) { // Ensure element exists before adding listener
            input.addEventListener('input', saveGeneralSettings);
        }
    });
    
    // Special case for API credentials
    apiKeyInput.addEventListener('input', () => saveProviderCredentials(providerSelect.value));
    if (baseUrlInput) {
        baseUrlInput.addEventListener('input', () => saveProviderCredentials(providerSelect.value));
    }

    // Electron-specific listener
    const newWindowBtn = document.getElementById('open-new-window-btn');
    if (newWindowBtn) {
        if (window.electronAPI && window.electronAPI.send) {
            newWindowBtn.addEventListener('click', () => window.electronAPI.send('open-new-window'));
        } else {
            newWindowBtn.style.display = 'none'; // Hide if not in Electron
        }
    }

    // Listeners for all collapsible sections to save their state
    document.querySelectorAll('.settings-details').forEach(details => {
        details.addEventListener('toggle', () => {
            const key = `details-panel-open-${details.querySelector('summary').textContent.trim().replace(/\s+/g, '-')}`;
            setStoredValue(key, details.open);
        });
    });

    // --- Provider Configuration Listeners ---
    if (saveConfigBtn) {
        saveConfigBtn.addEventListener('click', saveConfiguration);
    }

    if (savedConfigsList) {
        savedConfigsList.addEventListener('click', (e) => {
            const target = e.target;
            // Ensure we are targeting a button with the correct data attribute
            if (target.tagName === 'BUTTON' && target.dataset.configName) {
                const configName = target.dataset.configName;

                if (target.classList.contains('restore-btn')) {
                    restoreConfiguration(configName);
                } else if (target.classList.contains('delete-btn')) {
                    // Add a confirmation dialog before deleting
                    if (confirm(`Are you sure you want to delete the "${configName}" configuration?`)) {
                        deleteConfiguration(configName);
                    }
                }
            }
        });
    }
}

// --- EVENT HANDLER FUNCTIONS ---

async function handleSendClick() {
    await saveProviderCredentials(providerSelect.value);
    await saveGeneralSettings();

    const provider = providerSelect.value;
    const apiKey = apiKeyInput.value.trim();
    const model = modelSelect.value === 'custom'
        ? customModelInput.value.trim()
        : modelSelect.value;
    const prompt = promptInput.value.trim();
    const baseUrl = baseUrlInput.value.trim();
    const generationType = document.querySelector('input[name="generation-type"]:checked').value;

    if (!apiKey) return displayError('Please enter your API Key.');
    if (!model) return displayError('Please enter the Model Name.');
    if (generationType === 'text' || generationType === 'image' || generationType === 'video') {
        if (!prompt) return displayError('Please enter a prompt or description.');
    }
    if (provider === 'openai_compatible' && !baseUrl) return displayError('Please enter the Base URL for OpenAI Compatible provider.');

    switch (generationType) {
        case 'text':
            callTextApi(provider, apiKey, baseUrl, model, prompt);
            break;
        case 'image':
            callImageApi(provider, apiKey, baseUrl, model, prompt);
            break;
        case 'audio':
            const audioType = audioTypeSelect.value;
            if (audioType === 'tts') {
                if (!prompt) return displayError('Please enter text for TTS.');
                const voice = voiceInput.value.trim();
                if (!voice) return displayError('Please enter a voice.');
                // Get format
                let selectedFormat = 'mp3';
                if (ttsFormatSelect) {
                    if (ttsFormatSelect.value === 'custom') {
                        selectedFormat = customTtsFormatInput.value || "custom";
                    } else {
                        selectedFormat = ttsFormatSelect.value;
                    }
                }
                callTtsApi(provider, apiKey, baseUrl, model, prompt, voice, selectedFormat);
            } else { // STT
                // Prefer file upload; fallback to mic. This allows STT without mic permissions!
                let file = null;
                if (audioFileInput && audioFileInput.files && audioFileInput.files.length > 0) {
                    file = audioFileInput.files[0];
                } else if (recordedChunks.length > 0) {
                    file = new File(recordedChunks, 'recording.webm', { type: 'audio/webm' });
                }
                if (!file) return displayError('Please upload or record an audio file for STT.');
                // Get streaming flag
                let sttStreaming = true;
                if (sttStreamingCheckbox) sttStreaming = sttStreamingCheckbox.checked;
                callSttApi(provider, apiKey, baseUrl, model, file, sttStreaming);
            }
            break;
        case 'video':
            const duration = parseInt(videoDurationInput.value);
            if (!duration || duration < 1 || duration > 60) return displayError('Please enter a valid duration (1-60 seconds).');
            callVideoApi(provider, apiKey, baseUrl, model, prompt);
            break;
        default:
            displayError('Invalid generation type selected.');
    }
}

function handleTogglePayload() {
    const isHidden = payloadDisplayArea.style.display === 'none';
    responseDisplayArea.style.display = 'none';
    toggleResponseBtn.classList.remove('active');
    if (isHidden) {
        payloadDisplayArea.textContent = lastRequestPayload || 'No request payload data available.';
        payloadDisplayArea.style.display = 'block';
        togglePayloadBtn.classList.add('active');
    } else {
        payloadDisplayArea.style.display = 'none';
        togglePayloadBtn.classList.remove('active');
    }
}

function handleToggleResponse() {
    const isHidden = responseDisplayArea.style.display === 'none';
    payloadDisplayArea.style.display = 'none';
    togglePayloadBtn.classList.remove('active');
    if (isHidden) {
        responseDisplayArea.textContent = lastApiResponse || 'No response data available.';
        responseDisplayArea.style.display = 'block';
        toggleResponseBtn.classList.add('active');
    } else {
        responseDisplayArea.style.display = 'none';
        toggleResponseBtn.classList.remove('active');
    }
}

async function handleProviderChange() {
    await saveGeneralSettings();
    await loadProviderCredentials(providerSelect.value);
    toggleBaseUrlInput();
    fetchModels(); // Refresh models when provider changes
}

async function handleGenerationTypeChange() {
    await saveGeneralSettings();
    toggleGenerationOptions();
}

async function handleAudioTypeChange() {
    await saveGeneralSettings();
    toggleGenerationOptions();
}

async function handleRecordClick() {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        recordedChunks = [];
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            microphonePermissionStatus = 'granted';
            updateMicrophoneUI();
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = e => e.data.size > 0 && recordedChunks.push(e.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'audio/webm' });
                recordingPreview.src = URL.createObjectURL(blob);
                recordingPreview.style.display = 'block';
                recordBtn.textContent = 'Start Recording';
                stream.getTracks().forEach(track => track.stop());
            };
            mediaRecorder.start();
            recordBtn.textContent = 'Stop Recording';
            recordingPreview.style.display = 'none';
        } catch (err) {
            microphonePermissionStatus = 'denied';
            updateMicrophoneUI();
            displayError('Microphone access denied or unavailable.');
        }
    } else {
        mediaRecorder.stop();
    }
}

// Handle stop button click to cancel ongoing requests
function handleStopClick() {
    if (currentRequestController) {
        currentRequestController.abort();
        currentRequestController = null;
        hideStopButton();
        hideLoader();
        outputText.innerHTML = 'Request cancelled by user.';
        outputArea.style.display = 'block';
        outputArea.style.borderColor = 'orange';
    }
}

async function handleEnableQualityChange() {
    qualityOptionsContainer.style.display = enableQualityCheckbox.checked ? 'block' : 'none';
    customQualityInput.style.display = (enableQualityCheckbox.checked && qualitySelect.value === 'custom') ? 'block' : 'none';
    await saveGeneralSettings();
}

async function handleQualitySelectChange() {
    customQualityInput.style.display = (enableQualityCheckbox.checked && qualitySelect.value === 'custom') ? 'block' : 'none';
    await saveGeneralSettings();
}

async function handleAspectRatioToggle() {
    await saveGeneralSettings();
    toggleAspectRatio();
}


// Main application initialization function.
async function initializeApp() {
    // Restore the open/closed state of all collapsible sections
    for (const details of document.querySelectorAll('.settings-details')) {
        const key = `details-panel-open-${details.querySelector('summary').textContent.trim().replace(/\s+/g, '-')}`;
        const isOpen = await getStoredValue(key);
        // Default to open if no value is stored, except for "Advanced Options"
        if (details.querySelector('summary').textContent.includes('Advanced')) {
            details.open = typeof isOpen === 'boolean' ? isOpen : false; // Default advanced to closed
        } else {
            details.open = typeof isOpen === 'boolean' ? isOpen : true; // Default others to open
        }
    }

    initializeTheme();
    await loadGeneralSettings();
    await loadProviderCredentials(providerSelect.value);
    toggleBaseUrlInput();
    await fetchModels(); // Fetch models on initial load
    await renderSavedConfigs(); // Render the list of saved configurations
    await checkMicrophonePermission();
    updateMicrophoneUI();
    bindEventListeners();
}

// --- APP START ---
document.addEventListener('DOMContentLoaded', initializeApp);
