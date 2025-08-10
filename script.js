// --- DOM Element References ---
const dom = {
    providerSelect: document.getElementById('provider-select'),
    apiKeyInput: document.getElementById('api-key-input'),
    baseUrlContainer: document.getElementById('base-url-container'),
    baseUrlInput: document.getElementById('base-url-input'),
    modelSelect: document.getElementById('model-select'),
    customModelInput: document.getElementById('custom-model-input'),
    refreshModelsBtn: document.getElementById('refresh-models-btn'),
    promptInput: document.getElementById('prompt-input'),
    sendButton: document.getElementById('send-button'),
    stopButton: document.getElementById('stop-button'),
    outputArea: document.getElementById('output-area'),
    outputText: document.getElementById('output-text'),
    outputImage: document.getElementById('output-image'),
    statsArea: document.getElementById('stats-area'),
    enableStreamingCheckbox: document.getElementById('enable-streaming-checkbox'),
    loadingIndicator: document.getElementById('loading-indicator'),
    generationTypeRadios: document.querySelectorAll('input[name="generation-type"]'),
    imageOptionsContainer: document.getElementById('image-options-container'),
    imageModelTypeSelect: document.getElementById('image-model-type-select'),
    imageQualityContainer: document.getElementById('image-quality-container'),
    qualityOptionsContainer: document.getElementById('quality-options-container'),
    qualitySelect: document.getElementById('quality-select'),
    enableQualityCheckbox: document.getElementById('enable-quality-checkbox'),
    enableQualityContainer: document.querySelector('.enable-quality-container'),
    customQualityInput: document.getElementById('custom-quality-input'),
    imageResolutionContainer: document.getElementById('image-resolution-container'),
    imageResolutionSelect: document.getElementById('image-resolution-select'),
    imageResolutionInputs: document.getElementById('image-resolution-inputs'),
    fluxOrientationSelect: document.getElementById('flux-orientation-select'),
    fluxAspectRatioSelect: document.getElementById('flux-aspect-ratio-select'),
    fluxStepsInput: document.getElementById('flux-steps-input'),
    imageAspectRatioContainer: document.getElementById('image-aspect-ratio-container'),
    imageAspectRatioSelect: document.getElementById('image-aspect-ratio-select'),
    downloadImageBtn: document.getElementById('download-image-btn'),
    audioOptionsContainer: document.getElementById('audio-options-container'),
    audioTypeSelect: document.getElementById('audio-type-select'),
    sttInputContainer: document.getElementById('stt-input-container'),
    audioFileInput: document.getElementById('audio-file-input'),
    voiceOptionsContainer: document.getElementById('voice-options-container'),
    voiceSelect: document.getElementById('voice-select'),
    ttsInstructionsInput: document.getElementById('tts-instructions-input'),
    responseFormatSelect: document.getElementById('response-format-select'),
    enableSttStreamingCheckbox: document.getElementById('enable-stt-streaming-checkbox'),
    outputAudio: document.getElementById('output-audio'),
    downloadAudio: document.getElementById('download-audio'),
    videoOptionsContainer: document.getElementById('video-options-container'),
    videoAspectRatioEnabled: document.getElementById('video-aspect-ratio-enabled'),
    videoAspectRatioSelect: document.getElementById('video-aspect-ratio'),
    aspectRatioGroup: document.getElementById('aspect-ratio-group'),
    videoDurationInput: document.getElementById('video-duration'),
    outputVideo: document.getElementById('output-video'),
    downloadVideoBtn: document.getElementById('download-video-btn'),
    textGenerationOptions: document.getElementById('text-generation-options'),
    systemPromptInput: document.getElementById('system-prompt-input'),
    enableSystemPromptCheckbox: document.getElementById('enable-system-prompt-checkbox'),
    temperatureInput: document.getElementById('temperature-input'),
    temperatureValue: document.getElementById('temperature-value'),
    enableTemperatureCheckbox: document.getElementById('enable-temperature-checkbox'),
    topPInput: document.getElementById('top-p-input'),
    topPValue: document.getElementById('top-p-value'),
    enableTopPCheckbox: document.getElementById('enable-top-p-checkbox'),
    maxTokensInput: document.getElementById('max-tokens-input'),
    enableMaxTokensCheckbox: document.getElementById('enable-max-tokens-checkbox'),
    topKInput: document.getElementById('top-k-input'),
    topKValue: document.getElementById('top-k-value'),
    enableTopKCheckbox: document.getElementById('enable-top-k-checkbox'),
    reasoningEffortSelect: document.getElementById('reasoning-effort-select'),
    enableReasoningEffortCheckbox: document.getElementById('enable-reasoning-effort-checkbox'),
    paramNameInput: document.getElementById('param-name-input'),
    paramValueInput: document.getElementById('param-value-input'),
    addParamBtn: document.getElementById('add-param-btn'),
    customParamsList: document.getElementById('custom-params-list'),
    enableCustomParamsCheckbox: document.getElementById('enable-custom-params-checkbox'),
    payloadContainer: document.getElementById('payload-container'),
    togglePayloadBtn: document.getElementById('toggle-payload-btn'),
    payloadDisplayArea: document.getElementById('payload-display-area'),
    toggleResponseBtn: document.getElementById('toggle-response-btn'),
    responseDisplayArea: document.getElementById('response-display-area'),
    modelContainer: document.getElementById('model-container'),
    configNameInput: document.getElementById('config-name-input'),
    saveConfigBtn: document.getElementById('save-config-btn'),
    savedConfigsList: document.getElementById('saved-configs-list'),
    clearAllDataBtn: document.getElementById('clear-all-data-btn'),
};

// --- Custom Parameters Management ---
let customParameters = {};

function addCustomParameter(name, value) {
    if (!name || !name.trim()) return false;
    
    // Try to parse the value as JSON if possible, otherwise keep as string
    let parsedValue;
    try {
        parsedValue = JSON.parse(value);
    } catch {
        // If it's not valid JSON, try to determine the type
        if (!isNaN(value) && !isNaN(parseFloat(value))) {
            parsedValue = parseFloat(value);
        } else if (value.toLowerCase() === 'true') {
            parsedValue = true;
        } else if (value.toLowerCase() === 'false') {
            parsedValue = false;
        } else {
            parsedValue = value;
        }
    }
    
    customParameters[name.trim()] = parsedValue;
    renderCustomParameters();
    return true;
}

function removeCustomParameter(name) {
    delete customParameters[name];
    renderCustomParameters();
}

function renderCustomParameters() {
    if (!dom.customParamsList) return;
    
    dom.customParamsList.innerHTML = '';
    
    for (const [name, value] of Object.entries(customParameters)) {
        const paramItem = document.createElement('div');
        paramItem.className = 'custom-param-item';
        paramItem.innerHTML = `
            <div class="param-display">
                <span class="param-name">"${name}"</span>: <span class="param-value">${JSON.stringify(value)}</span>
            </div>
            <button type="button" class="remove-param-btn" data-param="${name}" title="Remove Parameter">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                </svg>
            </button>
        `;
        dom.customParamsList.appendChild(paramItem);
    }
}

// --- STATE VARIABLES ---
let lastRequestPayload = null;
let lastApiResponse = null;
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
const LAST_IMAGE_MODEL_TYPE_KEY = 'lastImageModelType';
const LAST_IMAGE_QUALITY_KEY = 'lastImageQuality';
const LAST_ENABLE_QUALITY_KEY = 'lastEnableQuality';
const LAST_CUSTOM_IMAGE_QUALITY_KEY = 'lastCustomImageQuality';
const LAST_IMAGE_RESOLUTION_KEY = 'lastImageResolution';
const LAST_IMAGE_ASPECT_RATIO_KEY = 'lastImageAspectRatio';
const LAST_FLUX_ORIENTATION_KEY = 'lastFluxOrientation';
const LAST_FLUX_ASPECT_RATIO_KEY = 'lastFluxAspectRatio';
const LAST_FLUX_STEPS_KEY = 'lastFluxSteps';
const LAST_AUDIO_TYPE_KEY = 'lastAudioType';
const LAST_VOICE_SELECT_KEY = 'lastVoiceSelect';
const LAST_TTS_INSTRUCTIONS_KEY = 'lastTtsInstructions';
const LAST_RESPONSE_FORMAT_KEY = 'lastResponseFormat';
const LAST_VIDEO_DURATION_KEY = 'lastVideoDuration';
const LAST_VIDEO_ASPECT_RATIO_ENABLED_KEY = 'lastVideoAspectRatioEnabled';
const LAST_VIDEO_ASPECT_RATIO_KEY = 'lastVideoAspectRatio';
const LAST_STREAMING_ENABLED_KEY = 'lastStreamingEnabled';

const LAST_ENABLE_SYSTEM_PROMPT_KEY = 'lastEnableSystemPrompt';
const LAST_ENABLE_TEMPERATURE_KEY = 'lastEnableTemperature';
const LAST_ENABLE_TOP_P_KEY = 'lastEnableTopP';
const LAST_ENABLE_TOP_K_KEY = 'lastEnableTopK';
const LAST_ENABLE_MAX_TOKENS_KEY = 'lastEnableMaxTokens';
const LAST_ENABLE_REASONING_EFFORT_KEY = 'lastEnableReasoningEffort';
const LAST_ENABLE_CUSTOM_PARAMS_KEY = 'lastEnableCustomParams';
const LAST_ENABLE_STT_STREAMING_KEY = 'lastEnableSttStreaming';

const LAST_SYSTEM_PROMPT_KEY = 'lastSystemPrompt';
const LAST_TEMPERATURE_KEY = 'lastTemperature';
const LAST_TOP_P_KEY = 'topP';
const LAST_TOP_K_KEY = 'lastTopK';
const LAST_MAX_TOKENS_KEY = 'lastMaxTokens';
const LAST_REASONING_EFFORT_KEY = 'lastReasoningEffort';
const LAST_CUSTOM_PARAMS_KEY = 'lastCustomParams';
const LAST_SELECTED_MODEL_OPTION_KEY = 'lastSelectedModelOption';
const LAST_CUSTOM_MODEL_NAME_KEY = 'lastCustomModelName';
const SAVED_PROVIDER_CONFIGS_KEY = 'savedProviderConfigurations';

// Loads API credentials for the given provider from storage.
async function loadProviderCredentials(provider) {
    if (!provider) return;
    const credentials = await getStoredValue(`${API_CREDENTIALS_KEY_PREFIX}.${provider}`);
    if (credentials) {
        dom.apiKeyInput.value = credentials.apiKey || '';
        if (dom.baseUrlInput) { // Check if dom.baseUrlInput exists
            dom.baseUrlInput.value = credentials.baseUrl || '';
        }
    } else {
        dom.apiKeyInput.value = '';
        if (dom.baseUrlInput) {
            dom.baseUrlInput.value = '';
        }
    }
    toggleBaseUrlInput(); // Ensure visibility is correct after loading
}

// Saves API credentials for the given provider to storage.
async function saveProviderCredentials(provider) {
    if (!provider) return;
    const apiKey = dom.apiKeyInput.value;
    const baseUrl = dom.baseUrlInput ? dom.baseUrlInput.value : ''; // Check if dom.baseUrlInput exists
    await setStoredValue(`${API_CREDENTIALS_KEY_PREFIX}.${provider}`, { apiKey, baseUrl });
}

/**
 * Loads general application settings from storage.
 * Extended: Now also loads enable/disable state for parameter toggles.
 */
async function loadGeneralSettings() {
    const lastProvider = await getStoredValue(LAST_PROVIDER_KEY);
    if (lastProvider) dom.providerSelect.value = lastProvider;

    // dom.modelInput.value = await getStoredValue(LAST_MODEL_KEY) || 'gpt-4o'; // Default model (Now handled by populateModelDropdown)
    dom.promptInput.value = await getStoredValue(LAST_PROMPT_KEY) || '';

    const lastGenerationType = await getStoredValue(LAST_GENERATION_TYPE_KEY);
    if (lastGenerationType) {
        const radio = document.querySelector(`input[name="generation-type"][value="${lastGenerationType}"]`);
        if (radio) radio.checked = true;
    }

    const lastEnableQuality = await getStoredValue(LAST_ENABLE_QUALITY_KEY);
    if (dom.enableQualityCheckbox) { // Check if exists
        dom.enableQualityCheckbox.checked = typeof lastEnableQuality === 'boolean' ? lastEnableQuality : true; // Default to true
    }

    // Load image model type
    const lastImageModelType = await getStoredValue(LAST_IMAGE_MODEL_TYPE_KEY);
    if (dom.imageModelTypeSelect) {
        dom.imageModelTypeSelect.value = lastImageModelType || '';
    }

    const lastQuality = await getStoredValue(LAST_IMAGE_QUALITY_KEY);
    if (dom.qualitySelect) { // Check if exists
        dom.qualitySelect.value = lastQuality || 'standard'; // Default quality
    }

    const lastCustomQuality = await getStoredValue(LAST_CUSTOM_IMAGE_QUALITY_KEY);
    if (dom.customQualityInput) { // Check if exists
        dom.customQualityInput.value = lastCustomQuality || '';
    }

    // Load image resolution
    const lastImageResolution = await getStoredValue(LAST_IMAGE_RESOLUTION_KEY);
    if (dom.imageResolutionSelect) {
        dom.imageResolutionSelect.value = lastImageResolution || '1024x1024';
    }

    // Load image aspect ratio
    const lastImageAspectRatio = await getStoredValue(LAST_IMAGE_ASPECT_RATIO_KEY);
    if (dom.imageAspectRatioSelect) {
        dom.imageAspectRatioSelect.value = lastImageAspectRatio || '1:1';
    }

    // Load FLUX settings
    const lastFluxOrientation = await getStoredValue(LAST_FLUX_ORIENTATION_KEY);
    if (dom.fluxOrientationSelect) {
        dom.fluxOrientationSelect.value = lastFluxOrientation || 'landscape';
    }
    
    const lastFluxAspectRatio = await getStoredValue(LAST_FLUX_ASPECT_RATIO_KEY);
    if (dom.fluxAspectRatioSelect) {
        dom.fluxAspectRatioSelect.value = lastFluxAspectRatio || '1:1';
    }
    
    // Load FLUX steps
    const lastFluxSteps = await getStoredValue(LAST_FLUX_STEPS_KEY);
    if (dom.fluxStepsInput) {
        dom.fluxStepsInput.value = lastFluxSteps || '0';
    }
    // Update the displayed value
    const fluxStepsValue = document.getElementById('flux-steps-value');
    if (fluxStepsValue && dom.fluxStepsInput) {
        fluxStepsValue.textContent = dom.fluxStepsInput.value;
    }

    
    const lastAudioType = await getStoredValue(LAST_AUDIO_TYPE_KEY);
    if (dom.audioTypeSelect) { // Check if exists
         dom.audioTypeSelect.value = lastAudioType || 'tts';
    }

    if (dom.voiceSelect) dom.voiceSelect.value = await getStoredValue(LAST_VOICE_SELECT_KEY) || 'alloy';
    if (dom.ttsInstructionsInput) dom.ttsInstructionsInput.value = await getStoredValue(LAST_TTS_INSTRUCTIONS_KEY) || '';
    if (dom.responseFormatSelect) dom.responseFormatSelect.value = await getStoredValue(LAST_RESPONSE_FORMAT_KEY) || 'mp3';

    // Load video settings
    if (dom.videoDurationInput) dom.videoDurationInput.value = await getStoredValue(LAST_VIDEO_DURATION_KEY) || '5';

    const lastVideoAspectRatioEnabled = await getStoredValue(LAST_VIDEO_ASPECT_RATIO_ENABLED_KEY);
    if (dom.videoAspectRatioEnabled) {
        dom.videoAspectRatioEnabled.checked = typeof lastVideoAspectRatioEnabled === 'boolean' ? lastVideoAspectRatioEnabled : false;
    }

    const lastVideoAspectRatio = await getStoredValue(LAST_VIDEO_ASPECT_RATIO_KEY);
    if (dom.videoAspectRatioSelect) {
        dom.videoAspectRatioSelect.value = lastVideoAspectRatio || '16:9';
    }

    const lastStreamingEnabled = await getStoredValue(LAST_STREAMING_ENABLED_KEY);
    if (dom.enableStreamingCheckbox) {
        // Default to true if not found in storage (current behavior is streaming on)
        dom.enableStreamingCheckbox.checked = typeof lastStreamingEnabled === 'boolean' ? lastStreamingEnabled : true;
    }

    // --- NEW: Load enable toggles for each param ---
    if (dom.enableSystemPromptCheckbox) {
        const en = await getStoredValue(LAST_ENABLE_SYSTEM_PROMPT_KEY);
        dom.enableSystemPromptCheckbox.checked = typeof en === "boolean" ? en : true;
    }
    if (dom.enableTemperatureCheckbox) {
        const en = await getStoredValue(LAST_ENABLE_TEMPERATURE_KEY);
        dom.enableTemperatureCheckbox.checked = typeof en === "boolean" ? en : false;
    }
    if (dom.enableTopPCheckbox) {
        const en = await getStoredValue(LAST_ENABLE_TOP_P_KEY);
        dom.enableTopPCheckbox.checked = typeof en === "boolean" ? en : false;
    }
    if (dom.enableTopKCheckbox) {
        const en = await getStoredValue(LAST_ENABLE_TOP_K_KEY);
        dom.enableTopKCheckbox.checked = typeof en === "boolean" ? en : false;
    }
    if (dom.enableMaxTokensCheckbox) {
        const en = await getStoredValue(LAST_ENABLE_MAX_TOKENS_KEY);
        dom.enableMaxTokensCheckbox.checked = typeof en === "boolean" ? en : false;
    }
    if (dom.enableReasoningEffortCheckbox) {
        const en = await getStoredValue(LAST_ENABLE_REASONING_EFFORT_KEY);
        dom.enableReasoningEffortCheckbox.checked = typeof en === "boolean" ? en : false;
    }
    if (dom.enableCustomParamsCheckbox) {
        const en = await getStoredValue(LAST_ENABLE_CUSTOM_PARAMS_KEY);
        dom.enableCustomParamsCheckbox.checked = typeof en === "boolean" ? en : false;
    }
    if (dom.enableSttStreamingCheckbox) {
        const en = await getStoredValue(LAST_ENABLE_STT_STREAMING_KEY);
        dom.enableSttStreamingCheckbox.checked = typeof en === "boolean" ? en : false;
    }

    // Load text generation settings
    dom.systemPromptInput.value = await getStoredValue(LAST_SYSTEM_PROMPT_KEY) || '';
    const lastTemp = await getStoredValue(LAST_TEMPERATURE_KEY);
    dom.temperatureInput.value = lastTemp !== undefined ? lastTemp : 1;
    dom.temperatureValue.textContent = parseFloat(dom.temperatureInput.value).toFixed(1);
    const lastTopP = await getStoredValue(LAST_TOP_P_KEY);
    dom.topPInput.value = lastTopP !== undefined ? lastTopP : 1;
    dom.topPValue.textContent = parseFloat(dom.topPInput.value).toFixed(2);
    const lastTopK = await getStoredValue(LAST_TOP_K_KEY);
    dom.topKInput.value = lastTopK !== undefined ? lastTopK : 50;
    dom.topKValue.textContent = dom.topKInput.value;
    dom.maxTokensInput.value = await getStoredValue(LAST_MAX_TOKENS_KEY) || '1024';
    dom.reasoningEffortSelect.value = await getStoredValue(LAST_REASONING_EFFORT_KEY) || 'medium';
    // Load custom parameters from storage
    const storedCustomParams = await getStoredValue(LAST_CUSTOM_PARAMS_KEY);
    if (storedCustomParams) {
        try {
            customParameters = JSON.parse(storedCustomParams);
            renderCustomParameters();
        } catch (e) {
            console.warn('Failed to parse stored custom parameters:', e);
        }
    }

    // Remove disabled state logic - only use visibility control
    // Elements should never be disabled, only hidden when toggle is off

    toggleGenerationOptions(); // Update UI based on loaded settings
    toggleBaseUrlInput(); // Ensure base URL visibility
    updateAllToggleVisibility();
}

/**
 * Saves general application settings to storage.
 * Extended: Speichert auch die Enable/Disable-Schalter für Parameter.
 */
async function saveGeneralSettings() {
    await setStoredValue(LAST_PROVIDER_KEY, dom.providerSelect.value);
    if (dom.modelSelect) {
        // Save the actual model name to be used in the API call
        const modelToSave = dom.modelSelect.value === 'custom' ? dom.customModelInput.value.trim() : dom.modelSelect.value;
        await setStoredValue(LAST_MODEL_KEY, modelToSave);

        // Save the state of the dropdown and custom input for UI restoration
        await setStoredValue(LAST_SELECTED_MODEL_OPTION_KEY, dom.modelSelect.value);
        if (dom.modelSelect.value === 'custom') {
            await setStoredValue(LAST_CUSTOM_MODEL_NAME_KEY, dom.customModelInput.value.trim());
        }
    }
    await setStoredValue(LAST_PROMPT_KEY, dom.promptInput.value);
    const generationType = document.querySelector('input[name="generation-type"]:checked');
    if (generationType) await setStoredValue(LAST_GENERATION_TYPE_KEY, generationType.value);

    if (dom.enableQualityCheckbox) await setStoredValue(LAST_ENABLE_QUALITY_KEY, dom.enableQualityCheckbox.checked);
    if (dom.imageModelTypeSelect) await setStoredValue(LAST_IMAGE_MODEL_TYPE_KEY, dom.imageModelTypeSelect.value);
    if (dom.qualitySelect) await setStoredValue(LAST_IMAGE_QUALITY_KEY, dom.qualitySelect.value);
    if (dom.customQualityInput) await setStoredValue(LAST_CUSTOM_IMAGE_QUALITY_KEY, dom.customQualityInput.value);
    if (dom.imageResolutionSelect) await setStoredValue(LAST_IMAGE_RESOLUTION_KEY, dom.imageResolutionSelect.value);
    if (dom.imageAspectRatioSelect) await setStoredValue(LAST_IMAGE_ASPECT_RATIO_KEY, dom.imageAspectRatioSelect.value);
    if (dom.fluxOrientationSelect) await setStoredValue(LAST_FLUX_ORIENTATION_KEY, dom.fluxOrientationSelect.value);
    if (dom.fluxAspectRatioSelect) await setStoredValue(LAST_FLUX_ASPECT_RATIO_KEY, dom.fluxAspectRatioSelect.value);
    if (dom.fluxStepsInput) await setStoredValue(LAST_FLUX_STEPS_KEY, dom.fluxStepsInput.value);
    if (dom.audioTypeSelect) await setStoredValue(LAST_AUDIO_TYPE_KEY, dom.audioTypeSelect.value);
    if (dom.voiceSelect) await setStoredValue(LAST_VOICE_SELECT_KEY, dom.voiceSelect.value);
    if (dom.ttsInstructionsInput) await setStoredValue(LAST_TTS_INSTRUCTIONS_KEY, dom.ttsInstructionsInput.value);
    if (dom.responseFormatSelect) await setStoredValue(LAST_RESPONSE_FORMAT_KEY, dom.responseFormatSelect.value);
    if (dom.enableStreamingCheckbox) await setStoredValue(LAST_STREAMING_ENABLED_KEY, dom.enableStreamingCheckbox.checked);

    // Save new param enable toggles
    if (dom.enableSystemPromptCheckbox) await setStoredValue(LAST_ENABLE_SYSTEM_PROMPT_KEY, dom.enableSystemPromptCheckbox.checked);
    if (dom.enableTemperatureCheckbox) await setStoredValue(LAST_ENABLE_TEMPERATURE_KEY, dom.enableTemperatureCheckbox.checked);
    if (dom.enableTopPCheckbox) await setStoredValue(LAST_ENABLE_TOP_P_KEY, dom.enableTopPCheckbox.checked);
    if (dom.enableTopKCheckbox) await setStoredValue(LAST_ENABLE_TOP_K_KEY, dom.enableTopKCheckbox.checked);
    if (dom.enableMaxTokensCheckbox) await setStoredValue(LAST_ENABLE_MAX_TOKENS_KEY, dom.enableMaxTokensCheckbox.checked);
    if (dom.enableReasoningEffortCheckbox) await setStoredValue(LAST_ENABLE_REASONING_EFFORT_KEY, dom.enableReasoningEffortCheckbox.checked);
    if (dom.enableCustomParamsCheckbox) await setStoredValue(LAST_ENABLE_CUSTOM_PARAMS_KEY, dom.enableCustomParamsCheckbox.checked);
    if (dom.enableSttStreamingCheckbox) await setStoredValue(LAST_ENABLE_STT_STREAMING_KEY, dom.enableSttStreamingCheckbox.checked);

    // Save video settings
    if (dom.videoDurationInput) await setStoredValue(LAST_VIDEO_DURATION_KEY, dom.videoDurationInput.value);
    if (dom.videoAspectRatioEnabled) await setStoredValue(LAST_VIDEO_ASPECT_RATIO_ENABLED_KEY, dom.videoAspectRatioEnabled.checked);
    if (dom.videoAspectRatioSelect) await setStoredValue(LAST_VIDEO_ASPECT_RATIO_KEY, dom.videoAspectRatioSelect.value);

    // Save text generation settings
    await setStoredValue(LAST_SYSTEM_PROMPT_KEY, dom.systemPromptInput.value);
    await setStoredValue(LAST_TEMPERATURE_KEY, dom.temperatureInput.value);
    await setStoredValue(LAST_TOP_P_KEY, dom.topPInput.value);
    await setStoredValue(LAST_TOP_K_KEY, dom.topKInput.value);
    await setStoredValue(LAST_MAX_TOKENS_KEY, dom.maxTokensInput.value);
    await setStoredValue(LAST_REASONING_EFFORT_KEY, dom.reasoningEffortSelect.value);
    await setStoredValue(LAST_CUSTOM_PARAMS_KEY, JSON.stringify(customParameters));
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
    dom.savedConfigsList.innerHTML = ''; // Clear the list first

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
            dom.savedConfigsList.appendChild(configItem);
        }
    }
}

// Saves the current provider settings as a named configuration.
async function saveConfiguration() {
    const name = dom.configNameInput.value.trim();
    if (!name) {
        displayError("Please enter a name for the configuration.");
        return;
    }

    const currentProvider = dom.providerSelect.value;
    const currentApiKey = dom.apiKeyInput.value.trim();
    const currentBaseUrl = dom.baseUrlInput.value.trim();

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
    dom.configNameInput.value = '';
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
    dom.providerSelect.value = configToRestore.provider;
    dom.apiKeyInput.value = configToRestore.apiKey;
    dom.baseUrlInput.value = configToRestore.baseUrl || '';

    // Also populate the name input for easy re-saving
    dom.configNameInput.value = name;

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
        if (dom.configNameInput.value === name) {
            dom.configNameInput.value = '';
        }

        await renderSavedConfigs();
    }
}

// --- CLEAR ALL DATA FUNCTIONALITY ---

// Clears all stored data for the current site
async function clearAllStorageData() {
    try {
        // Clear Electron Store if available
        if (window.electronAPI && window.electronAPI.clearAllStore) {
            await window.electronAPI.clearAllStore();
        }
        
        // Clear localStorage with our app prefix
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('app_storage_')) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        
        // Also clear any other potential storage keys that might not have the prefix
        const otherKeys = [
            'user-theme',
            'apiCredentials',
            'lastProvider',
            'lastModel',
            'savedProviderConfigurations'
        ];
        
        otherKeys.forEach(key => {
            localStorage.removeItem(key);
            localStorage.removeItem(`app_storage_${key}`);
        });
        
        console.log('All storage data cleared successfully');
        return true;
        
    } catch (error) {
        console.error('Error clearing storage data:', error);
        return false;
    }
}

// --- PARAMETER VALIDATION ---
// Function to validate parameter compatibility with selected provider
function validateParameterCompatibility(provider) {
    let warnings = [];
    
    // Top K parameter - only supported by OpenAI Compatible, Deepseek, OpenRouter
    if (dom.enableTopKCheckbox?.checked && !['openai_compatible', 'deepseek', 'openrouter'].includes(provider)) {
        warnings.push('Top K parameter is not supported by ' + provider + '. It will be ignored.');
    }
    
    // Reasoning effort - primarily for Antrophic and some OpenAI models
    if (dom.enableReasoningEffortCheckbox?.checked && !['antrophic', 'openai'].includes(provider)) {
        warnings.push('Reasoning effort parameter may not be supported by ' + provider + '.');
    }
    
    // Custom parameters - mainly for OpenAI Compatible and OpenRouter
    if (dom.enableCustomParamsCheckbox?.checked && !['openai_compatible', 'openrouter'].includes(provider)) {
        warnings.push('Custom parameters may not be fully supported by ' + provider + '.');
    }
    
    return warnings;
}

// --- UI MANIPULATION ---
// Functions that control the visibility and state of UI elements.

// Function to show or hide the Base URL input based on the selected provider
function toggleBaseUrlInput() {
    const selectedProvider = dom.providerSelect.value;
    dom.baseUrlContainer.style.display = selectedProvider === 'openai_compatible' ? 'block' : 'none';
    if (selectedProvider !== 'openai_compatible') {
        dom.baseUrlInput.value = ''; // Clear the input if hidden
    }
}

// Function to toggle aspect ratio visibility for video generation
function toggleAspectRatio() {
    const aspectRatioEnabled = dom.videoAspectRatioEnabled.checked;
    
    if (aspectRatioEnabled) {
        dom.aspectRatioGroup.style.display = 'block';
        dom.aspectRatioGroup.classList.remove('disabled');
    } else {
        dom.aspectRatioGroup.style.display = 'none';
        dom.aspectRatioGroup.classList.add('disabled');
    }
}

// --- MODEL MANAGEMENT ---

// Fetches the list of available models from the provider's API.
async function fetchModels() {
    const provider = dom.providerSelect.value;
    const apiKey = dom.apiKeyInput.value.trim();
    const baseUrl = dom.baseUrlInput.value.trim();

    // Don't fetch for providers that don't support it or if key is missing
    if (!apiKey || ['deepseek'].includes(provider)) {
        populateModelDropdown([]); // Populate with just "Custom"
        return;
    }

    let apiUrl = '';
    let headers = {};

    if (provider === 'openai') {
        apiUrl = 'https://api.openai.com/v1/models';
        headers = { 'Authorization': `Bearer ${apiKey}` };
    } else if (provider === 'openai_compatible') {
        if (!baseUrl) {
            populateModelDropdown([]); // Can't fetch without base URL
            return;
        }
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        apiUrl = `${cleanBaseUrl}/models`;
        headers = { 'Authorization': `Bearer ${apiKey}` };
    } else if (provider === 'openrouter') {
        apiUrl = 'https://openrouter.ai/api/v1/models';
        headers = { 'Authorization': `Bearer ${apiKey}` };
    } else if (provider === 'antrophic') {
        apiUrl = 'https://api.anthropic.com/v1/models';
        headers = {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        };
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

    dom.modelSelect.innerHTML = ''; // Clear existing options

    // Add the "Custom" option first
    const customOption = document.createElement('option');
    customOption.value = 'custom';
    customOption.textContent = 'Custom...';
    dom.modelSelect.appendChild(customOption);

    // Sort models by ID (name)
    if (Array.isArray(models)) {
        models.sort((a, b) => a.id.localeCompare(b.id));
        // Add models from the API
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.id;
            dom.modelSelect.appendChild(option);
        });
    }

    // Try to restore the last selection from the dropdown's state
    if (lastSelectedOption && Array.from(dom.modelSelect.options).some(opt => opt.value === lastSelectedOption)) {
        dom.modelSelect.value = lastSelectedOption;
    } else {
        // Fallback to a default if no selection was stored or it's no longer valid
        const defaultModel = 'gpt-4o'; // A sensible default
        if(Array.from(dom.modelSelect.options).some(opt => opt.value === defaultModel)) {
            dom.modelSelect.value = defaultModel;
        } else if (dom.modelSelect.options.length > 1) {
            dom.modelSelect.selectedIndex = 1; // Select the first model in the list
        }
    }
    
    // If the last selected option was 'custom', restore the custom input text
    if (dom.modelSelect.value === 'custom' && lastCustomName) {
        dom.customModelInput.value = lastCustomName;
    }
    
    // Trigger the change handler to set UI visibility correctly
    handleModelSelectionChange();
}


// Handles changes in the model selection dropdown.
function handleModelSelectionChange() {
    if (dom.modelSelect.value === 'custom') {
        dom.customModelInput.style.display = 'block';
    } else {
        dom.customModelInput.style.display = 'none';
    }
    
    // Automatically detect and set image model type based on model name
    const generationType = document.querySelector('input[name="generation-type"]:checked')?.value;
    if (generationType === 'image' && dom.imageModelTypeSelect) {
        const selectedModel = dom.modelSelect.value === 'custom' 
            ? dom.customModelInput.value.trim() 
            : dom.modelSelect.value;
        
        if (selectedModel) {
            const lowerModel = selectedModel.toLowerCase();
            if (lowerModel.includes('dall-e-2')) {
                dom.imageModelTypeSelect.value = 'dalle2';
            } else if (lowerModel.includes('dall-e-3')) {
                dom.imageModelTypeSelect.value = 'dalle3';
            } else if (lowerModel.includes('gpt-image-1')) {
                dom.imageModelTypeSelect.value = 'gptimage1';
            } else if (lowerModel.includes('flux') || lowerModel.includes('black-forest-labs')) {
                dom.imageModelTypeSelect.value = 'flux';
            } else if (lowerModel.includes('imagen')) {
                dom.imageModelTypeSelect.value = 'imagen';
            }
            
            // Update UI based on the auto-selected model type
            updateImageOptionsUI();
        }
    }
    
    saveGeneralSettings(); // Save the new selection state
}

// Handles changes in the image model type selection
function handleImageModelTypeChange() {
    updateImageOptionsUI();
    saveGeneralSettings(); // Save the new selection state
}

// Updates the image options UI based on the selected model type
function updateImageOptionsUI() {
    const modelType = dom.imageModelTypeSelect ? dom.imageModelTypeSelect.value : '';
    
    // Reset UI elements
    if (dom.imageQualityContainer) dom.imageQualityContainer.style.display = 'none';
    if (dom.imageResolutionContainer) dom.imageResolutionContainer.style.display = 'block';
    if (dom.imageResolutionSelect) dom.imageResolutionSelect.style.display = 'block';
    if (dom.imageResolutionInputs) dom.imageResolutionInputs.style.display = 'none';
    if (dom.imageAspectRatioContainer) dom.imageAspectRatioContainer.style.display = 'none';
    
    // Clear resolution options
    if (dom.imageResolutionSelect) {
        dom.imageResolutionSelect.innerHTML = '';
    }
    
    // Update UI based on model type
    switch (modelType) {
        case 'dalle2':
            // Show quality options (but disable for DALL-E-2)
            if (dom.imageQualityContainer) dom.imageQualityContainer.style.display = 'none';
            
            // Show standard resolution elements
            if (dom.imageResolutionContainer) dom.imageResolutionContainer.style.display = 'block';
            const dalle2Label = dom.imageResolutionContainer.querySelector('label[for="image-resolution-select"]');
            if (dalle2Label) dalle2Label.style.display = 'block';
            if (dom.imageResolutionSelect) dom.imageResolutionSelect.style.display = 'block';
            if (dom.imageResolutionInputs) dom.imageResolutionInputs.style.display = 'none';
            
            // Update resolution options for DALL-E-2
            if (dom.imageResolutionSelect) {
                dom.imageResolutionSelect.innerHTML = `
                    <option value="256x256">256x256</option>
                    <option value="512x512">512x512</option>
                    <option value="1024x1024" selected>1024x1024</option>
                `;
            }
            break;
            
        case 'dalle3':
            // Show quality options for DALL-E-3
            if (dom.imageQualityContainer) dom.imageQualityContainer.style.display = 'block';
            if (dom.qualitySelect) {
                // Update quality options for DALL-E-3
                dom.qualitySelect.innerHTML = `
                    <option value="standard" selected>Standard</option>
                    <option value="hd">HD</option>
                `;
            }
            
            // Show standard resolution elements
            if (dom.imageResolutionContainer) dom.imageResolutionContainer.style.display = 'block';
            const dalle3Label = dom.imageResolutionContainer.querySelector('label[for="image-resolution-select"]');
            if (dalle3Label) dalle3Label.style.display = 'block';
            if (dom.imageResolutionSelect) dom.imageResolutionSelect.style.display = 'block';
            if (dom.imageResolutionInputs) dom.imageResolutionInputs.style.display = 'none';
            
            // Update resolution options for DALL-E-3
            if (dom.imageResolutionSelect) {
                dom.imageResolutionSelect.innerHTML = `
                    <option value="1024x1024" selected>1024x1024</option>
                    <option value="1792x1024">1792x1024</option>
                    <option value="1024x1792">1024x1792</option>
                `;
            }
            break;
            
        case 'gptimage1':
            // Show quality options for GPT-IMAGE-1
            if (dom.imageQualityContainer) dom.imageQualityContainer.style.display = 'block';
            if (dom.qualitySelect) {
                // Update quality options for GPT-IMAGE-1
                dom.qualitySelect.innerHTML = `
                    <option value="auto" selected>Auto</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                `;
            }
            
            // Update resolution options for GPT-IMAGE-1
            if (dom.imageResolutionSelect) {
                dom.imageResolutionSelect.innerHTML = `
                    <option value="1024x1024" selected>1024x1024</option>
                    <option value="1536x1024">1536x1024</option>
                    <option value="1024x1536">1024x1536</option>
                `;
            }
            break;
            
        case 'flux':
            // Hide quality options for FLUX models
            if (dom.imageQualityContainer) dom.imageQualityContainer.style.display = 'none';
            
            // Show container but hide standard resolution elements, show FLUX-specific inputs
            if (dom.imageResolutionContainer) dom.imageResolutionContainer.style.display = 'block';
            // Hide the standard resolution label and dropdown
            const fluxLabel = dom.imageResolutionContainer.querySelector('label[for="image-resolution-select"]');
            if (fluxLabel) fluxLabel.style.display = 'none';
            if (dom.imageResolutionSelect) dom.imageResolutionSelect.style.display = 'none';
            // Show FLUX-specific inputs
            if (dom.imageResolutionInputs) dom.imageResolutionInputs.style.display = 'block';
            
            // Initialize FLUX steps slider value display
            if (dom.fluxStepsInput) {
                const fluxStepsValue = document.getElementById('flux-steps-value');
                if (fluxStepsValue) {
                    fluxStepsValue.textContent = dom.fluxStepsInput.value;
                }
            }
            break;
            
        case 'imagen':
            // Hide quality and resolution options for IMAGEN models
            if (dom.imageQualityContainer) dom.imageQualityContainer.style.display = 'none';
            if (dom.imageResolutionContainer) dom.imageResolutionContainer.style.display = 'none';
            
            // Show aspect ratio options
            if (dom.imageAspectRatioContainer) dom.imageAspectRatioContainer.style.display = 'block';
            break;
            
        default:
            // Hide all options if no model type is selected
            if (dom.imageQualityContainer) dom.imageQualityContainer.style.display = 'none';
            if (dom.imageResolutionContainer) dom.imageResolutionContainer.style.display = 'none';
            if (dom.imageAspectRatioContainer) dom.imageAspectRatioContainer.style.display = 'none';
    }
    
    // Update note text
    const imageModelNote = document.getElementById('image-model-note');
    if (imageModelNote) {
        if (modelType) {
            imageModelNote.textContent = `Configured for ${dom.imageModelTypeSelect.options[dom.imageModelTypeSelect.selectedIndex].text}`;
        } else {
            imageModelNote.textContent = 'Please select a model type to configure image generation options.';
        }
    }
}

// --- UI MANIPULATION (Refactored) ---

function updateAllToggleVisibility() {
    const parameterToggles = {
        'enable-system-prompt-checkbox': {
            group: document.getElementById('system-prompt-group')
        },
        'enable-temperature-checkbox': {
            group: document.getElementById('temperature-group'),
            input: dom.temperatureInput,
            valueDisplay: dom.temperatureValue,
            defaultValue: '1',
            toFixed: 1
        },
        'enable-top-p-checkbox': {
            group: document.getElementById('top-p-group'),
            input: dom.topPInput,
            valueDisplay: dom.topPValue,
            defaultValue: '1',
            toFixed: 2
        },
        'enable-top-k-checkbox': {
            group: document.getElementById('top-k-group'),
            input: dom.topKInput,
            valueDisplay: dom.topKValue,
            defaultValue: '50'
        },
        'enable-max-tokens-checkbox': {
            group: document.getElementById('max-tokens-group'),
            input: dom.maxTokensInput,
            defaultValue: '1024'
        },
        'enable-reasoning-effort-checkbox': {
            group: document.getElementById('reasoning-effort-group')
        },
        'enable-custom-params-checkbox': {
            group: document.getElementById('custom-params-group')
        },
        'enable-quality-checkbox': {
            group: document.getElementById('quality-options-container'),
        },
    };

    Object.keys(parameterToggles).forEach(checkboxId => {
        const checkbox = document.getElementById(checkboxId);
        const config = parameterToggles[checkboxId];
        const group = config.group;

        if (checkbox && group) {
            if (checkbox.checked) {
                group.style.display = '';
            } else {
                group.style.display = 'none';
                if (config.input) {
                    config.input.value = config.defaultValue;
                    if (config.valueDisplay) {
                        if (config.toFixed) {
                            config.valueDisplay.textContent = parseFloat(config.defaultValue).toFixed(config.toFixed);
                        } else {
                            config.valueDisplay.textContent = config.defaultValue;
                        }
                    }
                }
            }
        }
    });
}

// Main function to control UI visibility based on generation type
function toggleGenerationOptions() {
    const generationType = document.querySelector('input[name="generation-type"]:checked')?.value;
    if (!generationType) return;

    // Hide all advanced option groups first
    dom.textGenerationOptions.style.display = 'none';
    dom.imageOptionsContainer.style.display = 'none';
    dom.audioOptionsContainer.style.display = 'none';
    dom.videoOptionsContainer.style.display = 'none';

    // Always show prompt input, but hide for STT
    dom.promptInput.style.display = 'block';

    // Hide audio input container by default
    const audioInputContainer = document.getElementById('audio-input-container');
    if (audioInputContainer) audioInputContainer.style.display = 'none';


    // Configure UI based on the selected generation type
    switch (generationType) {
        case 'text':
            dom.textGenerationOptions.style.display = 'block';
            const promptLabelElText = document.getElementById('prompt-label');
            if (promptLabelElText) {
                promptLabelElText.style.display = 'inline-block';
                promptLabelElText.textContent = 'Prompt:';
            }
            break;
        case 'image':
            dom.imageOptionsContainer.style.display = 'block';
            const promptLabelElImage = document.getElementById('prompt-label');
            if (promptLabelElImage) {
                promptLabelElImage.style.display = 'inline-block';
                promptLabelElImage.textContent = 'Prompt / Image Description:';
            }
            // Update image options UI based on selected model type
            updateImageOptionsUI();
            break;
        case 'audio':
            
            dom.audioOptionsContainer.style.display = 'block';
            const audioInputContainer = document.getElementById('audio-input-container');
            if (audioInputContainer) audioInputContainer.style.display = 'block';
            const audioTypeSelectEl = document.getElementById('audio-type-select');
            const audioType = audioTypeSelectEl ? audioTypeSelectEl.value : 'tts';
            const promptLabel = document.getElementById('prompt-label');
            const enableSttStreamingContainer = document.querySelector('.enable-streaming-container');

            // Always show audio sub-options based on audio type selection
            if (audioType === 'tts') {
                if (enableSttStreamingContainer) enableSttStreamingContainer.style.display = 'none';
                dom.voiceOptionsContainer.style.display = 'block';
                if (dom.sttInputContainer) dom.sttInputContainer.style.display = 'none';
                promptLabel.style.display = 'inline-block'; // Show label for TTS
                promptLabel.textContent = 'Text to Speak:';
                dom.promptInput.style.display = 'block';
            } else { // STT
                if (enableSttStreamingContainer) enableSttStreamingContainer.style.display = 'block';
                dom.voiceOptionsContainer.style.display = 'none';
                if (dom.sttInputContainer) dom.sttInputContainer.style.display = 'block';
                promptLabel.style.display = 'none'; // Hide label for STT
                dom.promptInput.style.display = 'none'; // Prompt input is not used for STT
            }
            break;
        case 'video':
            dom.videoOptionsContainer.style.display = 'block';
            document.getElementById('prompt-label').textContent = 'Video Description:';
            // Aspect ratio group visibility is now primarily controlled by its toggle
            const aspectRatioToggle = document.getElementById('video-aspect-ratio-enabled');
            if (aspectRatioToggle) {
                 dom.aspectRatioGroup.style.display = aspectRatioToggle.checked ? 'block' : 'none';
            }
            break;
    }
}




// --- HELPER FUNCTIONS ---
// Utility functions used by other parts of the script.

// Displays an error message in the output area.
function displayError(message) {
    console.error('Error:', message);

    // Render error message and add a centered "Copy" button
    dom.outputText.innerHTML = `
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
    dom.outputImage.style.display = 'none';
    dom.outputImage.src = '';
    dom.outputArea.style.display = 'block';
    dom.outputArea.style.borderColor = 'red';
}

// Clears the output area, stats, and resets payload/response displays.
function clearOutput() {
    dom.outputText.innerHTML = '';
    dom.outputImage.style.display = 'none';
    dom.outputImage.src = '';
    dom.downloadImageBtn.style.display = 'none'; // Hide image download button
    dom.downloadImageBtn.href = '';
    dom.outputAudio.style.display = 'none';
    dom.outputAudio.src = '';
    dom.downloadAudio.style.display = 'none';
    dom.downloadAudio.href = '';
    dom.outputVideo.style.display = 'none';
    dom.outputVideo.src = '';
    dom.downloadVideoBtn.style.display = 'none';
    dom.downloadVideoBtn.href = '';
    dom.outputArea.style.display = 'none';
    dom.outputArea.style.borderColor = '#ccc';
    dom.statsArea.style.display = 'none'; // Hide stats area too
    dom.statsArea.innerHTML = '';
    dom.payloadContainer.style.display = 'none'; // Hide payload container
    dom.payloadDisplayArea.style.display = 'none'; // Hide payload display
    dom.responseDisplayArea.style.display = 'none'; // Hide response display
    dom.togglePayloadBtn.textContent = 'Show Request'; // Reset button text
    dom.togglePayloadBtn.classList.remove('active');
    dom.toggleResponseBtn.textContent = 'Show Response'; // Reset button text
    dom.toggleResponseBtn.classList.remove('active');
    lastRequestPayload = null; // Reset stored payload
    lastApiResponse = null;    // Reset stored response
    if (dom.loadingIndicator) hideLoader(); // Ensure loader is hidden
}

// --- LOADER FUNCTIONS ---
// Functions to show and hide the loading indicator.
function showLoader() {
    if (dom.loadingIndicator) dom.loadingIndicator.style.display = 'flex';
}

function hideLoader() {
    if (dom.loadingIndicator) dom.loadingIndicator.style.display = 'none';
}

function showStopButton() {
    if (dom.sendButton) dom.sendButton.style.display = 'none';
    if (dom.stopButton) dom.stopButton.style.display = 'inline-block';
}

function hideStopButton() {
    if (dom.stopButton) dom.stopButton.style.display = 'none';
    if (dom.sendButton) dom.sendButton.style.display = 'inline-block';
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


// --- API HELPERS ---
function getApiUrl(provider, generationType, baseUrl) {
    const cleanBaseUrl = baseUrl ? (baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl) : '';

    const endpoints = {
        openai: {
            text: 'https://api.openai.com/v1/chat/completions',
            image: 'https://api.openai.com/v1/images/generations',
            audio: 'https://api.openai.com/v1/audio/speech',
            stt: 'https://api.openai.com/v1/audio/transcriptions',
        },
        openai_compatible: {
            text: `${cleanBaseUrl}/chat/completions`,
            image: `${cleanBaseUrl}/images/generations`,
            audio: `${cleanBaseUrl}/audio/speech`,
            stt: `${cleanBaseUrl}/audio/transcriptions`,
            video: `${cleanBaseUrl}/video/generations`,
        },
        deepseek: {
            text: 'https://api.deepseek.com/chat/completions',
        },
        antrophic: {
            text: 'https://api.anthropic.com/v1/messages',
        },
        openrouter: {
            text: 'https://openrouter.ai/api/v1/chat/completions',
        },
    };

    if (provider === 'openai_compatible' && !cleanBaseUrl) {
        return null;
    }
    
    if (generationType === 'audio') {
        const audioType = dom.audioTypeSelect.value;
        return endpoints[provider]?.[audioType === 'tts' ? 'audio' : 'stt'];
    }

    return endpoints[provider]?.[generationType];
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
    dom.outputText.innerHTML = 'Sending text request...';
    dom.outputArea.style.display = 'block';

    const apiUrl = getApiUrl(provider, 'text', baseUrl);
    if (!apiUrl) {
        hideLoader();
        hideStopButton();
        return displayError('Could not determine API URL. For OpenAI Compatible provider, Base URL is required.');
    }

    let headers = {};
    const streamEnabled = dom.enableStreamingCheckbox ? dom.enableStreamingCheckbox.checked : true;

    // Create AbortController for cancellation
    const controller = new AbortController();
    const { signal } = controller;
    currentRequestController = controller; // Store reference for cancellation

    // Construct messages array
    const messages = [];
    // System Prompt nur senden, wenn Toggle aktiv
    if (dom.enableSystemPromptCheckbox?.checked && dom.systemPromptInput.value.trim()) {
        messages.push({ role: 'system', content: dom.systemPromptInput.value.trim() });
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
    if (dom.enableTemperatureCheckbox?.checked && dom.temperatureInput.value) body.temperature = parseFloat(dom.temperatureInput.value);
    if (dom.enableTopPCheckbox?.checked && dom.topPInput.value) body.top_p = parseFloat(dom.topPInput.value);
    
    // Top K parameter (only for compatible providers)
    if (dom.enableTopKCheckbox?.checked && dom.topKInput.value && ['openai_compatible', 'deepseek', 'openrouter'].includes(provider)) {
        body.top_k = parseInt(dom.topKInput.value, 10);
    }
    
    if (dom.enableMaxTokensCheckbox?.checked && dom.maxTokensInput.value) body.max_tokens = parseInt(dom.maxTokensInput.value, 10);
    
    // Reasoning effort parameter
    if (dom.enableReasoningEffortCheckbox?.checked && dom.reasoningEffortSelect && dom.reasoningEffortSelect.value.trim()) {
        body.reasoning_effort = dom.reasoningEffortSelect.value.trim();
    }

    // Custom parameters support
    if (dom.enableCustomParamsCheckbox?.checked && Object.keys(customParameters).length > 0) {
        // Merge custom parameters with the body (custom params take precedence)
        Object.assign(body, customParameters);
    }


    // Configure based on provider
    switch (provider) {
        case 'openai':
        case 'deepseek':
        case 'openai_compatible':
        case 'openrouter':
            headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
            if (provider === 'deepseek' || provider === 'openrouter') {
                body.stream = false; // Override for Deepseek and OpenRouter
            }
            break;
        case 'antrophic':
            headers = { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' };
            // Antrophic has a different body structure - rebuild it properly
            body = {
                model: model,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: (dom.enableMaxTokensCheckbox?.checked && dom.maxTokensInput.value) ? parseInt(dom.maxTokensInput.value, 10) : 4096
            };
            
            // Add system prompt if enabled
            if (dom.enableSystemPromptCheckbox?.checked && dom.systemPromptInput.value.trim()) {
                body.system = dom.systemPromptInput.value.trim();
            }
            
            // Add optional parameters only if enabled
            if (dom.enableTemperatureCheckbox?.checked && dom.temperatureInput.value) {
                body.temperature = parseFloat(dom.temperatureInput.value);
            }
            if (dom.enableTopPCheckbox?.checked && dom.topPInput.value) {
                body.top_p = parseFloat(dom.topPInput.value);
            }
            if (dom.enableReasoningEffortCheckbox?.checked && dom.reasoningEffortSelect && dom.reasoningEffortSelect.value.trim()) {
                body.reasoning_effort = dom.reasoningEffortSelect.value.trim();
            }
            
            // Add custom parameters for Antrophic if enabled
            if (dom.enableCustomParamsCheckbox?.checked && Object.keys(customParameters).length > 0) {
                // Merge custom parameters with the body
                Object.assign(body, customParameters);
            }
            break;
        default:
            hideLoader();
            hideStopButton();
            return displayError('Unknown provider selected for text generation.');
    }

    // Store payload before sending
    lastRequestPayload = JSON.stringify(body, null, 2);
    dom.payloadContainer.style.display = 'block';

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
            dom.outputText.innerHTML = `<strong>${model}:</strong><br>`; // Initialize output area
            dom.outputArea.style.borderColor = '#ccc'; // Reset border color
            let contentBuffer = "";
            let accumulatedResponse = "";

            // --- LIVE PROMPT TOKENS: Calculate once outside processStream so always shown ---
            function estimateTokens(text) {
                // Estimate tokens as number of whitespace-separated units in text
                if (!text) return 0;
                return text.trim().length > 0 ? text.trim().split(/\s+/).length : 0;
            }
             // Prompt tokens estimated from user + system prompt (if enabled)
             const systemPromptText = (dom.enableSystemPromptCheckbox?.checked && dom.systemPromptInput?.value?.trim()) ? dom.systemPromptInput.value.trim() : "";
             const promptTokensEstimate = estimateTokens(prompt) + estimateTokens(systemPromptText);

            // New: Buffer for all provider responses during streaming (to reconstruct original)
            let streamedProviderJsons = [];
            // Accumulate for merged pretty JSON:
            let streamedTopMeta = null;
            let streamedFinishReason = null;
            let streamedAllDeltas = [];
            let streamedUsage = null; // To store usage data from stream
            let accumulatedContent = ""; // For final content
            let accumulatedReasoningContent = ""; // For reasoning content

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
                        
                             dom.statsArea.innerHTML = `
                                 <div><strong>Time:</strong> ${elapsedSecNum.toFixed(2)}s</div>
                                 <div><strong>Time to First Token:</strong> ${ttftDisplay}</div>
                                 <div><strong>Prompt Tokens:</strong> ${promptTokensFinal}</div>
                                 <div><strong>Reasoning Tokens:</strong> ${reasoningTokensFinal} (${reasoningTps} tps)</div>
                                 <div><strong>Completion Tokens:</strong> ${realCompletionTokens} (${completionTps} tps)</div>
                                 <div><strong>Total Tokens:</strong> ${totalTokensFinal} (${totalTps} tps)</div>
                             `;
                             dom.statsArea.style.display = 'block';
                         } else {
                             // Fallback to previous estimation logic when usage isn't available
                             let promptTokensEst = promptTokensEstimate;
                             let completionTokensEst = estimateTokens(contentBuffer);
                             let totalTokensEst = promptTokensEst + completionTokensEst;
                             const timeSinceFirstToken = firstTokenTime ? (now - firstTokenTime) / 1000 : elapsed;
                             const tokensPerSecondFinal = (timeSinceFirstToken > 0 && completionTokensEst > 0)
                                 ? (completionTokensEst / timeSinceFirstToken).toFixed(2) : "…";
                             const timeToFirstToken = firstTokenTime ? ((firstTokenTime - startTime) / 1000).toFixed(2) : "…";
                        
                             dom.statsArea.innerHTML = `
                                 <span><strong>Time:</strong> ${elapsed.toFixed(2)}s</span>
                                 <span><strong>Time to First Token:</strong> ${timeToFirstToken}s</span>
                                 <span><strong>Tokens/Sec:</strong> ${tokensPerSecondFinal}</span>
                                 <span><strong>Prompt Tokens:</strong> ${promptTokensEst}</span>
                                 <span><strong>Completion Tokens:</strong> ${completionTokensEst}</span>
                                 <span><strong>Total Tokens:</strong> ${totalTokensEst}</span>
                                 <br><small>Live stats update – values estimated from streamed content.</small>
                             `;
                             dom.statsArea.style.display = 'block';
                         }

                        // Ensure any final buffered content is displayed (though typically not needed with SSE)
                        if (accumulatedResponse.startsWith("data: ")) {
                            const jsonStr = accumulatedResponse.substring(6).trim();
                            if (jsonStr && jsonStr !== "[DONE]") {
                                try {
                                    const parsed = JSON.parse(jsonStr);
                                    if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                                        const textChunk = parsed.choices[0].delta.content;
                                        dom.outputText.innerHTML += textChunk.replace(/\n/g, '<br>');
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
                            try {
                                const parsed = JSON.parse(jsonStr);
                                streamedTopMeta = parsed; // Last non-empty JSON has latest meta (id, created, model, etc.)
                                streamedAllDeltas.push(parsed.choices[0] && parsed.choices[0].delta ? parsed.choices[0].delta : {});
                                
                                // Capture usage data if available
                                if (parsed.usage) {
                                    streamedUsage = parsed.usage;
                                }
                                
                                // Capture finish reason if available
                                if (parsed.choices && parsed.choices[0] && parsed.choices[0].finish_reason) {
                                    streamedFinishReason = parsed.choices[0].finish_reason;
                                }
                                
                                // Reasoning content accumulation (does not trigger TTFT)
                                if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.reasoning_content) {
                                    const rChunk = parsed.choices[0].delta.reasoning_content;
                                    accumulatedReasoningContent += rChunk;
                                    reasoningTokenCount += estimateTokens(rChunk);
                                    sawReasoning = true;
                                }
                                
                                // The actual text:
                                if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                                    const textChunk = parsed.choices[0].delta.content;
                                    contentBuffer += textChunk;
                                    accumulatedContent += textChunk;
                                    dom.outputText.innerHTML += textChunk.replace(/\n/g, '<br>');
                                    streamedTokenCount = estimateTokens(contentBuffer);
                                    updateStatsNow = true;
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

                        dom.statsArea.innerHTML = `
                            <div><strong>Time:</strong> ${elapsedSec.toFixed(2)}s</div>
                            <div><strong>Time to First Token:</strong> ${timeToFirstTokenDisplay}</div>
                            <div><strong>Prompt Tokens:</strong> ${promptTokensEstimate}</div>
                            ${reasoningLine}
                            <div><strong>Completion Tokens:</strong> ${completionTokensLive} (${completionTpsLive} tps)</div>
                            <div><strong>Total Tokens:</strong> ${totalTokensLive} (${totalTpsLive} tps)</div>
                        `;
                        dom.statsArea.style.display = 'block';
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
                        dom.statsArea.innerHTML = `
                            <div><strong>Time:</strong> ${elapsedSecNum.toFixed(2)}s</div>
                            <div><strong>Time to First Token:</strong> ${ttftDisplay}</div>
                            <div><strong>Prompt Tokens:</strong> ${promptTokensFinal}</div>
                            <div><strong>Reasoning Tokens:</strong> ${reasoningTokensFinal} (${reasoningTps} tps)</div>
                            <div><strong>Completion Tokens:</strong> ${realCompletionTokens} (${completionTps} tps)</div>
                            <div><strong>Total Tokens:</strong> ${totalTokensFinal} (${totalTps} tps)</div>
                        `;
                        dom.statsArea.style.display = 'block';
                        break; // Exit while(true)
                    }
                }
            }
            await processStream();
            
            // Reconstruct streaming response into standard chat completion format
            const reconstructedResponse = {
                id: streamedTopMeta?.id || "streaming_response_" + Date.now(),
                created: streamedTopMeta?.created || Math.floor(Date.now() / 1000),
                model: streamedTopMeta?.model || model,
                object: "chat.completion",
                choices: [
                    {
                        finish_reason: streamedFinishReason || "stop",
                        index: 0,
                        message: {
                            content: accumulatedContent,
                            role: "assistant"
                        }
                    }
                ],
                usage: streamedUsage || {
                    prompt_tokens: promptTokensEstimate,
                    completion_tokens: estimateTokens(accumulatedContent),
                    total_tokens: promptTokensEstimate + estimateTokens(accumulatedContent)
                }
            };
            
            // Add reasoning content if it exists
            if (accumulatedReasoningContent) {
                reconstructedResponse.choices[0].message.reasoning_content = accumulatedReasoningContent;
            }
            
            lastApiResponse = JSON.stringify(reconstructedResponse, null, 2);

        } else {
            // Existing non-streaming logic
            const data = await handleApiResponse(response); // handleApiResponse is for non-streaming
            console.log("Text API Response Data (Non-Streaming):", data);
            lastApiResponse = JSON.stringify(data, null, 2); // Keep this for non-streaming

            // Extract content
            let aiContent = '';
            if (provider === 'antrophic') {
                if (data.content && data.content.length > 0 && data.content[0].text) aiContent = data.content[0].text;
                else throw new Error('Could not find text content in Antrophic response.');
            } else { // OpenAI/Compatible (non-streaming), Deepseek, OpenRouter
                if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) aiContent = data.choices[0].message.content;
                else throw new Error('Could not find message content in API response.');
            }

            // Display the AI response
            dom.outputText.innerHTML = `<strong>${model}:</strong><br>${aiContent.replace(/\n/g, '<br>')}`;
            dom.outputArea.style.borderColor = '#ccc';

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

                dom.statsArea.innerHTML = `
                    <span><strong>Time:</strong> ${durationInSeconds.toFixed(2)}s</span>
                    <span><strong>Tokens/Sec:</strong> ${tokensPerSecond}</span>
                    <span><strong>Prompt Tokens:</strong> ${promptTokens}</span>
                    <span><strong>Completion Tokens:</strong> ${completionTokens}</span>
                    <span><strong>Total Tokens:</strong> ${totalTokens}</span>
                `;
                dom.statsArea.style.display = 'block';
            } else {
                 dom.statsArea.innerHTML = `<span><strong>Time:</strong> ${durationInSeconds.toFixed(2)}s</span><br><span>Usage data not available in response.</span>`;
                 dom.statsArea.style.display = 'block';
            }
        }
} catch (error) {
    // Handle cancellation
    if (error.name === 'AbortError') {
        dom.outputText.innerHTML = 'Request cancelled by user.';
        dom.outputArea.style.borderColor = 'orange';
        dom.statsArea.style.display = 'none';
    } else {
        // lastApiResponse might contain error details already
        displayError(error.message); // displayError will hide loader
        dom.statsArea.style.display = 'none'; // Hide stats on error
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
    dom.outputText.innerHTML = 'Sending image request...'; // Use text area for status
    dom.outputArea.style.display = 'block';
    dom.statsArea.style.display = 'none'; // Will show stats later if successful

    const apiUrl = getApiUrl(provider, 'image', baseUrl);
    if (!apiUrl) {
        hideLoader();
        hideStopButton();
        return displayError('Could not determine API URL for image generation.');
    }

    // Create AbortController for cancellation
    const controller = new AbortController();
    const { signal } = controller;
    currentRequestController = controller; // Store reference for cancellation

    let headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };

    // Get the selected model type
    const modelType = dom.imageModelTypeSelect ? dom.imageModelTypeSelect.value : '';
    
    // Prepare the request body based on model type
    const body = {
        model: model,
        prompt: prompt,
        n: 1,
        response_format: "url"
    };
    
    // Initialize width and height variables for stats display
    let width = '1024';
    let height = '1024';

    
    // Handle model-specific options
    switch (modelType) {
        case 'dalle2':
            // DALL-E-2: No quality option, specific resolutions
            const dalle2Resolution = dom.imageResolutionSelect.value || '1024x1024';
            body.size = dalle2Resolution;
            [width, height] = dalle2Resolution.split('x');
            break;
            
        case 'dalle3':
            // DALL-E-3: Quality options (standard, hd), specific resolutions
            const dalle3Resolution = dom.imageResolutionSelect.value || '1024x1024';
            body.size = dalle3Resolution;
            
            // Add quality parameter if enabled
            if (dom.enableQualityCheckbox.checked) {
                const qualityValue = dom.qualitySelect.value;
                if (qualityValue && qualityValue !== 'custom') {
                    body.quality = qualityValue;
                } else if (qualityValue === 'custom' && dom.customQualityInput.value.trim()) {
                    body.quality = dom.customQualityInput.value.trim();
                }
            }
            break;
            
        case 'gptimage1':
            // GPT-IMAGE-1: Quality options (auto, high, medium, low), specific resolutions
            const gptImageResolution = dom.imageResolutionSelect.value || '1024x1024';
            body.size = gptImageResolution;
            
            // Add quality parameter if enabled
            if (dom.enableQualityCheckbox.checked) {
                const qualityValue = dom.qualitySelect.value;
                if (qualityValue && qualityValue !== 'custom') {
                    body.quality = qualityValue;
                } else if (qualityValue === 'custom' && dom.customQualityInput.value.trim()) {
                    body.quality = dom.customQualityInput.value.trim();
                }
            }
            break;
            
        case 'flux':
            // FLUX models: No quality option, aspect ratio with orientation, optional steps parameter
            const fluxOrientation = dom.fluxOrientationSelect.value || 'landscape';
            const fluxAspectRatio = dom.fluxAspectRatioSelect.value || '1:1';
            
            // For FLUX models, we don't calculate width/height as they're not sent in request
            // Set empty values to avoid undefined variable errors
            width = '';
            height = '';

            // Convert aspect ratio based on orientation
            let finalAspectRatio = fluxAspectRatio;
            if (fluxOrientation === 'portrait' && fluxAspectRatio !== '1:1') {
                // Swap the ratio for portrait orientation
                const [ratioWidth, ratioHeight] = fluxAspectRatio.split(':');
                finalAspectRatio = `${ratioHeight}:${ratioWidth}`;
            }
            
            body.aspect_ratio = finalAspectRatio;
            body.n = 1; // FLUX models typically generate 1 image
            
            // Only include steps parameter if it's not the default value (0)
            const fluxSteps = dom.fluxStepsInput.value.trim();
            if (fluxSteps && parseInt(fluxSteps) > 0) {
                body.steps = parseInt(fluxSteps);
            }
            
            // Remove size parameter for FLUX models
            delete body.size;
            delete body.width;
            delete body.height;
            break;
            
        case 'imagen':
            // IMAGEN models: No quality or size options, aspect ratio only
            const aspectRatio = dom.imageAspectRatioSelect.value || '1:1';
            body.aspect_ratio = aspectRatio;
            // Remove size parameter for IMAGEN models
            delete body.size;
            break;
            
        default:
            // Default behavior for backward compatibility
            width = imageWidthInput.value.trim() || '1024';
            height = imageHeightInput.value.trim() || '1024';
            body.size = `${width}x${height}`;
            
            // Include quality parameter only if enabled
            if (provider === 'openai_compatible' && dom.enableQualityCheckbox.checked && dom.qualitySelect) {
                if (dom.qualitySelect.value === 'custom' && dom.customQualityInput) {
                    if (dom.customQualityInput.value.trim() === '') {
                        // Potentially display an error or use a default if custom quality is selected but empty
                        console.warn("Custom quality selected but input is empty. API might reject or use default.");
                        // Not setting body.quality here, or explicitly setting to a default if API requires it
                    } else {
                        body.quality = dom.customQualityInput.value.trim();
                    }
                } else if (dom.qualitySelect.value !== 'custom') {
                    body.quality = dom.qualitySelect.value;
                }
                // If dom.qualitySelect.value is 'custom' but dom.customQualityInput is missing, body.quality remains unset.
            }
    }

    // Store payload before sending
    lastRequestPayload = JSON.stringify(body, null, 2);
    dom.payloadContainer.style.display = 'block';

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
                dom.outputText.innerHTML = `Image generated successfully by ${model}.`;
                dom.outputImage.src = imageUrl;
                dom.outputImage.style.display = 'block';
                dom.outputArea.style.borderColor = '#ccc';
                dom.downloadImageBtn.href = imageUrl;
                dom.downloadImageBtn.download = `image-${model}-${Date.now()}.png`; // Suggest a filename
                dom.downloadImageBtn.style.display = 'inline-block';
            } else if (item.b64_json) {
                const imageData = `data:image/png;base64,${item.b64_json}`;
                imageUrl = imageData;
                dom.outputText.innerHTML = `Image generated successfully by ${model}.`;
                dom.outputImage.src = imageData;
                dom.outputImage.style.display = 'block';
                dom.outputArea.style.borderColor = '#ccc';
                dom.downloadImageBtn.href = imageData;
                dom.downloadImageBtn.download = `image-${model}-${Date.now()}.png`; // Suggest a filename
                dom.downloadImageBtn.style.display = 'inline-block';
            } else {
                throw new Error('Could not find image data in API response.');
            }

            // Display stats
            // Check if we're using aspect ratio instead of resolution
            const isAspectRatioModel = (modelType === 'flux' || modelType === 'imagen');
            const resolutionLabel = isAspectRatioModel ? 'Aspect Ratio' : 'Resolution';
            const resolutionValue = isAspectRatioModel ? 
                (modelType === 'flux' ? dom.fluxAspectRatioSelect.value : dom.imageAspectRatioSelect.value) :
                (width && height ? `${width}x${height}` : 'Will be determined from image');
            
            let statsHtml = `
                <span><strong>Generation Time:</strong> ${durationInSeconds}s</span>
                <span><strong>${resolutionLabel}:</strong> ${resolutionValue}</span>
                <span><strong>Model:</strong> ${model}</span>
            `;
            
            // Add quality if enabled
            if (dom.enableQualityCheckbox.checked && dom.qualitySelect) {
                statsHtml += `<span><strong>Quality:</strong> ${dom.qualitySelect.value}</span>`;
            }

            // Add provider-specific data
            if (data.created) {
                statsHtml += `<span><strong>Created:</strong> ${new Date(data.created * 1000).toLocaleString()}</span>`;
            }
            
            // Check for credit usage if available
            if (data.usage && data.usage.prompt_tokens) {
                statsHtml += `<span><strong>Prompt Tokens:</strong> ${data.usage.prompt_tokens}</span>`;
            }
            
            dom.statsArea.innerHTML = statsHtml;
            dom.statsArea.style.display = 'block';
            
            // Once image loads, we can get the actual dimensions
            dom.outputImage.onload = () => {
                const actualWidth = dom.outputImage.naturalWidth;
                const actualHeight = dom.outputImage.naturalHeight;
                
                // Find and update the resolution span
                const resolutionSpan = dom.statsArea.querySelector('span:nth-child(2)');
                if (resolutionSpan) {
                    // Check if we're using aspect ratio instead of resolution
                    const isAspectRatioModel = (modelType === 'flux' || modelType === 'imagen');
                    const resolutionLabel = isAspectRatioModel ? 'Actual Dimensions' : 'Resolution';
                    resolutionSpan.innerHTML = `<strong>${resolutionLabel}:</strong> ${actualWidth}x${actualHeight}`;
                }
            };
        } else {
            throw new Error('Could not find image in API response.');
        }

    } catch (error) {
        // Handle cancellation
        if (error.name === 'AbortError') {
            dom.outputText.innerHTML = 'Request cancelled by user.';
            dom.outputArea.style.borderColor = 'orange';
            dom.statsArea.style.display = 'none';
        } else {
            if (error.message.includes('Invalid quality')) {
                displayError(`Invalid quality setting for the selected model. Details: ${error.message}`);
            } else {
                displayError(error.message);
            }
            dom.statsArea.style.display = 'none';
        }
    } finally {
        hideLoader();
        hideStopButton();
        currentRequestController = null;
    }
}

// Handles audio generation API calls.
async function callAudioApi(provider, apiKey, baseUrl, model, prompt) {
    showLoader();
    showStopButton();
    clearOutput();
    dom.outputText.innerHTML = 'Sending audio request...';
    dom.outputArea.style.display = 'block';

    const controller = new AbortController();
    const { signal } = controller;
    currentRequestController = controller;

    const audioType = dom.audioTypeSelect.value;

    if (audioType === 'tts') {
        await callTextToSpeechApi(provider, apiKey, baseUrl, model, prompt, signal);
    } else if (audioType === 'stt') {
        await callSpeechToTextApi(provider, apiKey, baseUrl, model, signal);
    } else {
        hideLoader();
        hideStopButton();
        displayError('Invalid audio type selected.');
    }
}

// Handles Text-to-Speech (TTS) API calls.
async function callTextToSpeechApi(provider, apiKey, baseUrl, model, prompt, signal) {
    const apiUrl = getApiUrl(provider, 'audio', baseUrl);
    if (!apiUrl) {
        hideLoader();
        hideStopButton();
        return displayError('Could not determine API URL for TTS.');
    }

    let headers = { 'Authorization': `Bearer ${apiKey}` };

    const body = {
        model: model,
        input: prompt,
        voice: dom.voiceSelect.value,
        response_format: dom.responseFormatSelect.value,
    };
    
    // Add instructions if provided and model is not tts-1 or tts-1-hd
    if (dom.ttsInstructionsInput.value.trim() && !model.startsWith('tts-1')) {
        body.instructions = dom.ttsInstructionsInput.value.trim();
    }

    lastRequestPayload = JSON.stringify(body, null, 2);
    dom.payloadContainer.style.display = 'block';

    const startTime = performance.now();
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: signal
        });

        if (!response.ok) {
            // Try to parse JSON error first
            try {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `HTTP Error ${response.status}`);
            } catch (e) {
                // If JSON parsing fails, use the text response
                const errorText = await response.text();
                throw new Error(errorText || `HTTP Error ${response.status}`);
            }
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        dom.outputAudio.src = audioUrl;
        dom.outputAudio.style.display = 'block';
        
        dom.downloadAudio.href = audioUrl;
        dom.downloadAudio.download = `audio-${model}-${Date.now()}.${body.response_format}`;
        dom.downloadAudio.style.display = 'inline-block';
        
        dom.outputText.innerHTML = 'Audio generated successfully.';
        dom.outputArea.style.borderColor = '#ccc';

        const endTime = performance.now();
        const durationInSeconds = ((endTime - startTime) / 1000).toFixed(2);
        dom.statsArea.innerHTML = `<span><strong>Generation Time:</strong> ${durationInSeconds}s</span>`;
        dom.statsArea.style.display = 'block';

    } catch (error) {
        if (error.name === 'AbortError') {
            dom.outputText.innerHTML = 'Request cancelled by user.';
            dom.outputArea.style.borderColor = 'orange';
        } else {
            displayError(error.message);
        }
    } finally {
        hideLoader();
        hideStopButton();
        currentRequestController = null;
    }
}

// Handles Speech-to-Text (STT) API calls.
async function callSpeechToTextApi(provider, apiKey, baseUrl, model, signal) {
    const audioFile = dom.audioFileInput.files[0];
    if (!audioFile) {
        hideLoader();
        hideStopButton();
        return displayError('Please select an audio file for transcription.');
    }

    const apiUrl = getApiUrl(provider, 'stt', baseUrl);
    if (!apiUrl) {
        hideLoader();
        hideStopButton();
        return displayError('Could not determine API URL for STT.');
    }

    let headers = { 'Authorization': `Bearer ${apiKey}` };

    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', model);
    
    // Add streaming option if enabled
    if (dom.enableSttStreamingCheckbox.checked) {
        formData.append('stream', 'true');
    }

    lastRequestPayload = `FormData with file: ${audioFile.name}, model: ${model}`;
    dom.payloadContainer.style.display = 'block';

    const startTime = performance.now();
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: formData,
            signal: signal
        });

        const data = await handleApiResponse(response);
        
        dom.outputText.innerHTML = `<strong>Transcription:</strong><br>${data.text}`;
        dom.outputArea.style.borderColor = '#ccc';

        const endTime = performance.now();
        const durationInSeconds = ((endTime - startTime) / 1000).toFixed(2);
        dom.statsArea.innerHTML = `<span><strong>Transcription Time:</strong> ${durationInSeconds}s</span>`;
        dom.statsArea.style.display = 'block';

    } catch (error) {
        if (error.name === 'AbortError') {
            dom.outputText.innerHTML = 'Request cancelled by user.';
            dom.outputArea.style.borderColor = 'orange';
        } else {
            displayError(error.message);
        }
    } finally {
        hideLoader();
        hideStopButton();
        currentRequestController = null;
    }
}


// Handles video generation API calls.
async function callVideoApi(provider, apiKey, baseUrl, model, prompt) {
    showLoader();
    showStopButton();
    clearOutput();
    dom.outputText.innerHTML = 'Sending video request...';
    dom.outputArea.style.display = 'block';

    const controller = new AbortController();
    const { signal } = controller;
    currentRequestController = controller;

    const apiUrl = getApiUrl(provider, 'video', baseUrl);

    // This is a placeholder for a real video API endpoint
    if (!apiUrl) {
        hideLoader();
        hideStopButton();
        // Using a placeholder API for demonstration
        apiUrl = 'https://api.placeholder.com/video';
        // return displayError('Video generation is currently only supported for specific compatible providers.');
    }

    let headers = { 'Authorization': `Bearer ${apiKey}` };

    const body = {
        model: model,
        prompt: prompt,
        duration: parseInt(dom.videoDurationInput.value, 10) || 5,
    };

    if (dom.videoAspectRatioEnabled.checked) {
        body.aspect_ratio = dom.videoAspectRatioSelect.value;
    }

    lastRequestPayload = JSON.stringify(body, null, 2);
    dom.payloadContainer.style.display = 'block';

    const startTime = performance.now();
    try {
        // --- Placeholder Logic ---
        // Since there's no standard video generation API, we'll simulate a response.
        // In a real scenario, you would replace this with a fetch call.
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

        // Simulate a successful response with a placeholder video
        const placeholderVideoUrl = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4';
        
        dom.outputVideo.src = placeholderVideoUrl;
        dom.outputVideo.style.display = 'block';
        
        dom.downloadVideoBtn.href = placeholderVideoUrl;
        dom.downloadVideoBtn.download = `video-${model}-${Date.now()}.mp4`;
        dom.downloadVideoBtn.style.display = 'inline-block';
        
        dom.outputText.innerHTML = 'Video generated successfully (placeholder).';
        dom.outputArea.style.borderColor = '#ccc';

        const endTime = performance.now();
        const durationInSeconds = ((endTime - startTime) / 1000).toFixed(2);
        dom.statsArea.innerHTML = `<span><strong>Generation Time:</strong> ${durationInSeconds}s</span>`;
        dom.statsArea.style.display = 'block';

    } catch (error) {
        if (error.name === 'AbortError') {
            dom.outputText.innerHTML = 'Request cancelled by user.';
            dom.outputArea.style.borderColor = 'orange';
        } else {
            displayError(error.message);
        }
    } finally {
        hideLoader();
        hideStopButton();
        currentRequestController = null;
    }
}


// --- EVENT LISTENERS ---
// All event listeners are set up here when the DOM is ready.

document.addEventListener('DOMContentLoaded', () => {
    // --- Initial Setup ---
    initializeTheme();
    loadGeneralSettings().then(() => {
        // After general settings are loaded, load provider-specific credentials
        loadProviderCredentials(dom.providerSelect.value);
        // Update the visibility of the toggles
        updateAllToggleVisibility();
        
        // Fetch models asynchronously without blocking page initialization
        setTimeout(() => fetchModels(), 0);
    });
    renderSavedConfigs();
    toggleGenerationOptions(); // Set initial UI state based on default/loaded settings
    
    // --- Provider & Credentials ---
    dom.providerSelect.addEventListener('change', () => {
        const selectedProvider = dom.providerSelect.value;
        loadProviderCredentials(selectedProvider);
        saveGeneralSettings(); // Save the new provider selection
        fetchModels(); // Fetch models for the new provider immediately
    });

    dom.apiKeyInput.addEventListener('input', () => {
        saveProviderCredentials(dom.providerSelect.value);
    });

    dom.baseUrlInput.addEventListener('input', () => {
        saveProviderCredentials(dom.providerSelect.value);
    });

    // --- Model Selection ---
    dom.modelSelect.addEventListener('change', handleModelSelectionChange);
    dom.customModelInput.addEventListener('input', handleModelSelectionChange);
    
    // Refresh models when dropdown is clicked
    dom.modelSelect.addEventListener('click', () => {
        fetchModels();
    });
    dom.refreshModelsBtn.addEventListener('click', fetchModels);

    // --- Generation Type ---
    dom.generationTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            toggleGenerationOptions();
            saveGeneralSettings();
        });
    });

    // --- Main Action Buttons ---
    dom.sendButton.addEventListener('click', async () => {
        clearOutput();
        const provider = dom.providerSelect.value;
        const apiKey = dom.apiKeyInput.value.trim();
        const baseUrl = dom.baseUrlInput.value.trim();
        const model = dom.modelSelect.value === 'custom' ? dom.customModelInput.value.trim() : dom.modelSelect.value;
        const prompt = dom.promptInput.value.trim();
        const generationType = document.querySelector('input[name="generation-type"]:checked')?.value;

        if (!apiKey) {
            displayError('API Key is required.');
            return;
        }
        if (!model) {
            displayError('Model is required.');
            return;
        }
        if (!prompt && generationType !== 'audio') { // Prompt not needed for STT audio
            displayError('Prompt is required.');
            return;
        }

        // Validate parameters before sending
        const warnings = validateParameterCompatibility(provider);
        if (warnings.length > 0) {
            // For now, just log them. Could also show a confirmation dialog.
            console.warn('Parameter compatibility warnings:', warnings);
        }

        switch (generationType) {
            case 'text':
                await callTextApi(provider, apiKey, baseUrl, model, prompt);
                break;
            case 'image':
                await callImageApi(provider, apiKey, baseUrl, model, prompt);
                break;
            case 'audio':
                await callAudioApi(provider, apiKey, baseUrl, model, prompt);
                break;
            case 'video':
                await callVideoApi(provider, apiKey, baseUrl, model, prompt);
                break;
            default:
                displayError('Invalid generation type selected.');
        }
    });

    dom.stopButton.addEventListener('click', () => {
        if (currentRequestController) {
            currentRequestController.abort();
            console.log('Request cancellation sent.');
        }
    });

    // --- Settings Persistence (on input change) ---
    const inputsToSave = [
        dom.promptInput, dom.systemPromptInput, dom.temperatureInput, dom.topPInput,
        dom.topKInput, dom.maxTokensInput, dom.imageModelTypeSelect,
        dom.qualitySelect, dom.customQualityInput, dom.imageResolutionSelect,
        dom.imageAspectRatioSelect, dom.fluxOrientationSelect, dom.fluxAspectRatioSelect,
        dom.fluxStepsInput, dom.audioTypeSelect, dom.voiceSelect, dom.ttsInstructionsInput,
        dom.responseFormatSelect, dom.videoDurationInput, dom.videoAspectRatioSelect
    ];
    inputsToSave.forEach(input => {
        if (input) input.addEventListener('input', saveGeneralSettings);
    });
    
    const checkboxesToSave = [
        dom.enableStreamingCheckbox, dom.enableSystemPromptCheckbox, dom.enableTemperatureCheckbox,
        dom.enableTopPCheckbox, dom.enableTopKCheckbox, dom.enableMaxTokensCheckbox,
        dom.enableReasoningEffortCheckbox, dom.enableCustomParamsCheckbox, dom.enableQualityCheckbox,
        dom.enableSttStreamingCheckbox, dom.videoAspectRatioEnabled
    ];
    checkboxesToSave.forEach(checkbox => {
        if (checkbox) checkbox.addEventListener('change', saveGeneralSettings);
    });

    dom.temperatureInput.addEventListener('input', () => {
        dom.temperatureValue.textContent = parseFloat(dom.temperatureInput.value).toFixed(1);
    });
    dom.topPInput.addEventListener('input', () => {
        dom.topPValue.textContent = parseFloat(dom.topPInput.value).toFixed(2);
    });
    dom.topKInput.addEventListener('input', () => {
        dom.topKValue.textContent = dom.topKInput.value;
    });

    // --- Image & Video Options ---
    if (dom.imageModelTypeSelect) dom.imageModelTypeSelect.addEventListener('change', handleImageModelTypeChange);
    if (dom.qualitySelect) {
        dom.qualitySelect.addEventListener('change', () => {
            dom.customQualityInput.style.display = dom.qualitySelect.value === 'custom' ? 'block' : 'none';
            saveGeneralSettings();
        });
    }
    if (dom.videoAspectRatioEnabled) dom.videoAspectRatioEnabled.addEventListener('change', toggleAspectRatio);
    if (dom.fluxStepsInput) {
        dom.fluxStepsInput.addEventListener('input', () => {
            const fluxStepsValue = document.getElementById('flux-steps-value');
            if (fluxStepsValue) {
                fluxStepsValue.textContent = dom.fluxStepsInput.value;
            }
            saveGeneralSettings();
        });
    }


    // --- Audio Options ---
    if (dom.audioTypeSelect) {
        dom.audioTypeSelect.addEventListener('change', () => {
            toggleGenerationOptions(); // Re-render UI for TTS/STT
            saveGeneralSettings();
        });
    }

    


    // --- Parameter Toggles ---
    const parameterToggles = {
        'enable-system-prompt-checkbox': document.getElementById('system-prompt-group'),
        'enable-temperature-checkbox': document.getElementById('temperature-group'),
        'enable-top-p-checkbox': document.getElementById('top-p-group'),
        'enable-top-k-checkbox': document.getElementById('top-k-group'),
        'enable-max-tokens-checkbox': document.getElementById('max-tokens-group'),
        'enable-reasoning-effort-checkbox': document.getElementById('reasoning-effort-group'),
        'enable-custom-params-checkbox': document.getElementById('custom-params-group'),
        'enable-quality-checkbox': document.getElementById('quality-options-container'),
    };

    Object.keys(parameterToggles).forEach(checkboxId => {
        const checkbox = document.getElementById(checkboxId);
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                updateAllToggleVisibility();
                saveGeneralSettings();
            });
        }
    });

    // --- Payload/Response Display ---
    dom.togglePayloadBtn.addEventListener('click', () => {
        const isActive = dom.payloadDisplayArea.style.display === 'block';
        dom.payloadDisplayArea.style.display = isActive ? 'none' : 'block';
        dom.togglePayloadBtn.textContent = isActive ? 'Show Request' : 'Hide Request';
        dom.togglePayloadBtn.classList.toggle('active', !isActive);
        if (!isActive && lastRequestPayload) {
            dom.payloadDisplayArea.textContent = lastRequestPayload;
        }
    });

    dom.toggleResponseBtn.addEventListener('click', () => {
        const isActive = dom.responseDisplayArea.style.display === 'block';
        dom.responseDisplayArea.style.display = isActive ? 'none' : 'block';
        dom.toggleResponseBtn.textContent = isActive ? 'Show Response' : 'Hide Response';
        dom.toggleResponseBtn.classList.toggle('active', !isActive);
        if (!isActive && lastApiResponse) {
            dom.responseDisplayArea.textContent = lastApiResponse;
        }
    });

    // --- Provider Configurations ---
    dom.saveConfigBtn.addEventListener('click', saveConfiguration);
    dom.savedConfigsList.addEventListener('click', (event) => {
        const target = event.target;
        const configName = target.dataset.configName;
        if (!configName) return;

        if (target.classList.contains('restore-btn')) {
            restoreConfiguration(configName);
        } else if (target.classList.contains('delete-btn')) {
            if (confirm(`Are you sure you want to delete the "${configName}" configuration?`)) {
                deleteConfiguration(configName);
            }
        }
    });

    // --- Clear All Data ---
    dom.clearAllDataBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete ALL stored data, including API keys and configurations? This action cannot be undone.')) {
            const success = await clearAllStorageData();
            if (success) {
                alert('All storage data has been cleared. The application will now reload.');
                location.reload();
            } else {
                alert('There was an error clearing the data. Check the console for details.');
            }
        }
    });
    
    // --- New Window Button ---
    const openNewWindowBtn = document.getElementById('open-new-window-btn');
    if (openNewWindowBtn) {
        openNewWindowBtn.addEventListener('click', () => {
            if (window.electronAPI && window.electronAPI.openNewWindow) {
                window.electronAPI.openNewWindow();
            } else {
                // Fallback for web version
                window.open(location.href, '_blank');
            }
        });
    }

    // --- Custom Parameters Event Listeners ---
    if (dom.addParamBtn) {
        dom.addParamBtn.addEventListener('click', () => {
            const name = dom.paramNameInput.value.trim();
            const value = dom.paramValueInput.value.trim();
            
            if (name && value) {
                if (addCustomParameter(name, value)) {
                    dom.paramNameInput.value = '';
                    dom.paramValueInput.value = '';
                }
            }
        });
    }

    // Handle preset parameter buttons
    document.querySelectorAll('.param-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            const value = btn.dataset.value;
            
            if (name && value) {
                dom.paramNameInput.value = name;
                dom.paramValueInput.value = value;
            }
        });
    });

    // Handle parameter removal (using event delegation)
    if (dom.customParamsList) {
        dom.customParamsList.addEventListener('click', (e) => {
            if (e.target.closest('.remove-param-btn')) {
                const paramName = e.target.closest('.remove-param-btn').dataset.param;
                if (paramName) {
                    removeCustomParameter(paramName);
                }
            }
        });
    }

    // Allow adding parameters with Enter key
    if (dom.paramValueInput) {
        dom.paramValueInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                dom.addParamBtn.click();
            }
        });
    }
});