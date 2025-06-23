// --- DOM Element References ---
const providerSelect = document.getElementById('provider-select');
const apiKeyInput = document.getElementById('api-key-input');
const baseUrlContainer = document.getElementById('base-url-container');
const baseUrlInput = document.getElementById('base-url-input');
const modelInput = document.getElementById('model-input');
const promptInput = document.getElementById('prompt-input');
const sendButton = document.getElementById('send-button');
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

// Audio Options
const audioOptionsContainer = document.getElementById('audio-options-container');
const audioTypeSelect = document.getElementById('audio-type-select');
const sttInputContainer = document.getElementById('stt-input-container');
const audioFileInput = document.getElementById('audio-file-input');
const voiceOptionsContainer = document.getElementById('voice-options-container');
const voiceInput = document.getElementById('voice-input');
const recorderControls = document.getElementById('recorder-controls');
const recordBtn = document.getElementById('record-btn');
const recordingPreview = document.getElementById('recording-preview');
const outputAudio = document.getElementById('output-audio');
const downloadAudio = document.getElementById('download-audio');

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
const uploadTextBtn = document.getElementById('upload-text-btn');
const uploadPreviewContainer = document.getElementById('upload-preview-container');
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

// --- STATE VARIABLES ---
let recordedChunks = [];
let mediaRecorder;
let lastRequestPayload = null;
let lastApiResponse = null;
let microphonePermissionStatus = 'prompt'; // 'granted', 'denied', 'prompt'
let uploadedFiles = []; // Holds an array of files to attach

// Request cancellation and UI state management
let currentAbortController = null;
let isRequestActive = false;
let originalSendButtonText = 'Generate';

// Statistics tracking
let sessionStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalTokensUsed: 0,
    averageResponseTime: 0,
    requestHistory: []
};

/**
 * Renders a small preview or icon of the uploaded file, with a remove button.
 */
function renderUploadPreview() {
    uploadPreviewContainer.innerHTML = ''; // Clear existing previews
    if (uploadedFiles.length === 0) {
        uploadPreviewContainer.style.display = 'none';
        return;
    }

    uploadedFiles.forEach((file, index) => {
    const previewWrapper = document.createElement('div');
    previewWrapper.className = 'file-preview-wrapper';
    previewWrapper.style.display = 'inline-flex';
    previewWrapper.style.alignItems = 'center';
    previewWrapper.style.gap = '4px';

    // Thumbnail or icon
    if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.className = 'file-preview-thumbnail';
        img.style.width = '32px';
        img.style.height = '32px';
        img.style.objectFit = 'cover';
        previewWrapper.appendChild(img);
    } else {
        const icon = document.createElement('span');
        icon.textContent = '📄';
        icon.className = 'file-preview-icon';
        icon.style.fontSize = '24px';
        previewWrapper.appendChild(icon);
    }

    // Filename label
    const label = document.createElement('span');
    label.textContent = file.name;
    label.style.fontSize = '12px';
    previewWrapper.appendChild(label);

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '×';
    removeBtn.title = 'Remove file';
    removeBtn.className = 'remove-file-btn';
    removeBtn.style.border = 'none';
    removeBtn.style.background = 'transparent';
    removeBtn.style.cursor = 'pointer';
    removeBtn.style.fontSize = '16px';
    removeBtn.onclick = () => {
        uploadedFiles.splice(index, 1); // Remove the file from the array by index
        renderUploadPreview(); // Re-render the previews
        // If you were saving uploadedFile to settings, you'd update settings here too
    };
    previewWrapper.appendChild(removeBtn);
    uploadPreviewContainer.appendChild(previewWrapper);
    }); // End of forEach

    uploadPreviewContainer.style.display = 'flex'; // Use flex to display items in a row
    uploadPreviewContainer.style.flexWrap = 'wrap'; // Allow items to wrap
    uploadPreviewContainer.style.gap = '8px';      // Add some space between preview items
}


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

    modelInput.value = await getStoredValue(LAST_MODEL_KEY) || 'gpt-4o'; // Default model
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
        enableTopPCheckbox.checked = typeof en === "boolean" ? en : true;
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
    await setStoredValue(LAST_MODEL_KEY, modelInput.value);
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

// --- UI MANIPULATION (Refactored) ---

// Main function to control UI visibility based on generation type
function toggleGenerationOptions() {
    const generationType = document.querySelector('input[name="generation-type"]:checked')?.value;
    if (!generationType) return;

    // Hide all advanced option groups first
    textGenerationOptions.style.display = 'none';
    imageOptionsContainer.style.display = 'none';
    audioOptionsContainer.style.display = 'none';
    videoOptionsContainer.style.display = 'none';

    // Always show prompt input, but hide for STT
    promptInput.style.display = 'block';
    // Hide upload button by default; show only for text generation
    uploadTextBtn.style.display = 'none';


    // Configure UI based on the selected generation type
    switch (generationType) {
        case 'text':
            textGenerationOptions.style.display = 'block';
            document.getElementById('prompt-label').textContent = 'Prompt:';
            // Show upload button for text generation
            uploadTextBtn.style.display = 'inline-block';
            break;
        case 'image':
            imageOptionsContainer.style.display = 'block';
            document.getElementById('prompt-label').textContent = 'Prompt / Image Description:';
            // Visibility of quality options container is now primarily controlled by its toggle
            // but ensure it's hidden if the main image options are hidden.
             const enableQualityToggle = document.getElementById('enable-quality-checkbox');
            if (enableQualityToggle) {
                 qualityOptionsContainer.style.display = enableQualityToggle.checked ? 'block' : 'none';
                 customQualityInput.style.display = (enableQualityToggle.checked && qualitySelect.value === 'custom') ? 'block' : 'none';
             }
            break;
        case 'audio':
            audioOptionsContainer.style.display = 'block';
            const audioTypeSelectEl = document.getElementById('audio-type-select');
            const audioTypeToggle = document.querySelector('.param-toggle[data-param-id="audio-type-select"]');
            const audioType = audioTypeSelectEl ? audioTypeSelectEl.value : 'tts';

            // Only show audio sub-options if the audio type select is enabled and its toggle is checked
            if (audioTypeSelectEl && audioTypeToggle && audioTypeToggle.checked) {
                if (audioType === 'tts') {
                    voiceOptionsContainer.style.display = 'block';
                    sttInputContainer.style.display = 'none';
                    recorderControls.style.display = 'none';
                    document.getElementById('prompt-label').textContent = 'Text to Speak:';
                } else { // STT
                    voiceOptionsContainer.style.display = 'none';
                    sttInputContainer.style.display = 'block';
                    recorderControls.style.display = 'block';
                    promptInput.style.display = 'none'; // Prompt input is not used for STT
                    uploadTextBtn.style.display = 'none'; // Upload Text button is not used for STT
                    document.getElementById('prompt-label').textContent = 'Upload or Record Audio:';
                }
            } else {
                 // If audio type select is disabled or its toggle is off, hide all audio sub-options
                voiceOptionsContainer.style.display = 'none';
                sttInputContainer.style.display = 'none';
                recorderControls.style.display = 'none';
                // Restore prompt input visibility and Upload File button for other types if audio section is off
                 promptInput.style.display = 'block';
                 uploadTextBtn.style.display = 'inline-block'; // Re-show the upload button
            }
            break;
        case 'video':
            videoOptionsContainer.style.display = 'block';
            document.getElementById('prompt-label').textContent = 'Video Description:';
            // Aspect ratio group visibility is now primarily controlled by its toggle
            const aspectRatioToggle = document.getElementById('video-aspect-ratio-enabled');
            if (aspectRatioToggle) {
                 aspectRatioGroup.style.display = aspectRatioToggle.checked ? 'block' : 'none';
            }
             // Ensure Upload File button is hidden for video
             uploadTextBtn.style.display = 'none';
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
function showLoader(message = 'Loading...') {
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
        const loadingText = loadingIndicator.querySelector('p');
        if (loadingText) loadingText.textContent = message;
    }

    // Show progress container
    const progressContainer = document.getElementById('progress-container');
    if (progressContainer) {
        progressContainer.style.display = 'block';
        const progressText = document.getElementById('progress-text');
        if (progressText) progressText.textContent = message;
    }
}

function hideLoader() {
    if (loadingIndicator) loadingIndicator.style.display = 'none';

    // Hide progress container
    const progressContainer = document.getElementById('progress-container');
    if (progressContainer) {
        progressContainer.style.display = 'none';
    }
}

function updateProgress(percentage, message) {
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.getElementById('progress-text');

    if (progressBar) {
        progressBar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
    }

    if (progressText && message) {
        progressText.textContent = message;
    }
}

// --- REQUEST CANCELLATION FUNCTIONS ---
// Functions to handle request cancellation and UI state management.

function startRequest() {
    isRequestActive = true;
    currentAbortController = new AbortController();

    // Update send button to show cancel option
    sendButton.textContent = 'Cancel Request';
    sendButton.classList.add('cancel-mode');
    sendButton.style.backgroundColor = 'var(--error-color)';

    // Update session stats
    sessionStats.totalRequests++;
}

function endRequest(success = true) {
    isRequestActive = false;
    currentAbortController = null;

    // Reset send button
    sendButton.textContent = originalSendButtonText;
    sendButton.classList.remove('cancel-mode');
    sendButton.style.backgroundColor = '';

    // Update session stats
    if (success) {
        sessionStats.successfulRequests++;
    } else {
        sessionStats.failedRequests++;
    }
}

function cancelCurrentRequest() {
    if (currentAbortController && isRequestActive) {
        currentAbortController.abort();
        endRequest(false);
        hideLoader();
        displayError('Request was cancelled by user.');

        // Add to request history
        sessionStats.requestHistory.push({
            timestamp: new Date().toISOString(),
            status: 'cancelled',
            duration: 0
        });

        updateSessionStatsDisplay();
    }
}

// --- COPY TO CLIPBOARD FUNCTIONS ---
// Functions to handle copying response text to clipboard.

async function copyToClipboard(text) {
    try {
        // Try modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            return copyToClipboardFallback(text);
        }
    } catch (error) {
        console.error('Clipboard copy failed:', error);
        return copyToClipboardFallback(text);
    }
}

function copyToClipboardFallback(text) {
    try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
    } catch (error) {
        console.error('Fallback clipboard copy failed:', error);
        return false;
    }
}

function showCopyButton(responseText) {
    // Remove existing copy button if present
    const existingCopyBtn = document.getElementById('copy-response-btn');
    if (existingCopyBtn) {
        existingCopyBtn.remove();
    }

    // Create copy button
    const copyBtn = document.createElement('button');
    copyBtn.id = 'copy-response-btn';
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Copy Response';
    copyBtn.title = 'Copy response to clipboard';

    copyBtn.addEventListener('click', async () => {
        const success = await copyToClipboard(responseText);

        if (success) {
            // Show success feedback
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.style.backgroundColor = 'var(--success-color)';

            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.backgroundColor = '';
            }, 2000);
        } else {
            // Show error feedback
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copy Failed';
            copyBtn.style.backgroundColor = 'var(--error-color)';

            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.backgroundColor = '';
            }, 2000);
        }
    });

    // Insert copy button after the output text
    outputText.parentNode.insertBefore(copyBtn, outputText.nextSibling);
}

// --- ENHANCED STATISTICS FUNCTIONS ---
// Functions to track and display comprehensive statistics.

function updateSessionStatsDisplay() {
    const sessionStatsContainer = document.getElementById('session-stats-container');
    if (!sessionStatsContainer) return;

    const successRate = sessionStats.totalRequests > 0
        ? ((sessionStats.successfulRequests / sessionStats.totalRequests) * 100).toFixed(1)
        : 0;

    sessionStatsContainer.innerHTML = `
        <div class="session-stats-grid">
            <div class="stat-item">
                <span class="stat-label">Total Requests:</span>
                <span class="stat-value">${sessionStats.totalRequests}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Success Rate:</span>
                <span class="stat-value">${successRate}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Avg Response Time:</span>
                <span class="stat-value">${sessionStats.averageResponseTime.toFixed(2)}s</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Tokens:</span>
                <span class="stat-value">${sessionStats.totalTokensUsed}</span>
            </div>
        </div>
    `;
}

function addToRequestHistory(requestData) {
    sessionStats.requestHistory.push({
        timestamp: new Date().toISOString(),
        ...requestData
    });

    // Keep only last 50 requests to prevent memory issues
    if (sessionStats.requestHistory.length > 50) {
        sessionStats.requestHistory = sessionStats.requestHistory.slice(-50);
    }

    // Update average response time
    const successfulRequests = sessionStats.requestHistory.filter(req => req.status === 'success');
    if (successfulRequests.length > 0) {
        const totalTime = successfulRequests.reduce((sum, req) => sum + (req.duration || 0), 0);
        sessionStats.averageResponseTime = totalTime / successfulRequests.length;
    }
}

function displayEnhancedStats(requestData) {
    const {
        duration,
        responseSize,
        statusCode,
        statusText,
        tokenCount,
        model,
        provider,
        generationType
    } = requestData;

    let statsHtml = `
        <div class="stats-grid">
            <div class="stat-row">
                <span class="stat-label">Duration:</span>
                <span class="stat-value">${duration}ms</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Response Size:</span>
                <span class="stat-value">${formatBytes(responseSize)}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Status:</span>
                <span class="stat-value">${statusCode} ${statusText}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Model:</span>
                <span class="stat-value">${model}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Provider:</span>
                <span class="stat-value">${provider}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Type:</span>
                <span class="stat-value">${generationType}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Timestamp:</span>
                <span class="stat-value">${new Date().toLocaleString()}</span>
            </div>
    `;

    if (tokenCount && tokenCount > 0) {
        statsHtml += `
            <div class="stat-row">
                <span class="stat-label">Tokens:</span>
                <span class="stat-value">${tokenCount}</span>
            </div>
        `;
        sessionStats.totalTokensUsed += tokenCount;
    }

    statsHtml += '</div>';

    statsArea.innerHTML = statsHtml;
    statsArea.style.display = 'block';

    // Add to session history
    addToRequestHistory({
        status: 'success',
        duration: parseFloat(duration),
        responseSize,
        statusCode,
        model,
        provider,
        generationType,
        tokenCount: tokenCount || 0
    });

    updateSessionStatsDisplay();
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
    showLoader('Generating text response...'); // Show loader at the start
    clearOutput();
    outputText.innerHTML = 'Sending text request...';
    outputArea.style.display = 'block';

    // Prepare request start time for enhanced statistics
    const requestStartTime = performance.now();

    let apiUrl = '';
    let headers = {};
    const streamEnabled = enableStreamingCheckbox ? enableStreamingCheckbox.checked : true;

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
        stream: streamEnabled
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
            return displayError('Unknown provider selected for text generation.');
    }
// Prepare request start time
const startTime = performance.now(); // Record start time
// Send request with optional file attachment
let response;
if (uploadedFiles.length > 0) {
    console.log("[callTextApi] Files detected. Preparing FormData for upload...");
    const formData = new FormData();

    // Append each file. Most servers expect multiple files under the same field name.
    uploadedFiles.forEach((file, index) => {
        formData.append('files', file, file.name); // Standard: 'files' or 'files[]'
        console.log(`[callTextApi] Appended file to FormData: '${file.name}' as 'files'`);
    });

    // Append the original JSON body as a separate string field.
    // The server will need to parse this field from JSON.
    formData.append('request_json_payload', JSON.stringify(body));
    console.log("[callTextApi] Appended stringified JSON body as 'request_json_payload':", JSON.stringify(body));

    lastRequestPayload = `FormData: ${uploadedFiles.map(f => f.name).join(', ')} + JSON payload`;
    payloadContainer.style.display = 'block';
    
    const fetchHeaders = { ...headers };
    // CRITICAL: For FormData, DO NOT set Content-Type. The browser does this.
    delete fetchHeaders['Content-Type'];
    console.log("[callTextApi] Attempting to send FormData request to:", apiUrl);
    console.log("[callTextApi] Headers for FormData (Content-Type removed):", JSON.stringify(fetchHeaders));

    try {
        response = await fetch(apiUrl, {
            method: 'POST',
            headers: fetchHeaders,
            body: formData,
            signal: currentAbortController?.signal
        });
        console.log("[callTextApi] FormData request fetch completed. Response status:", response.status);
    } catch (fetchError) {
        console.error("[callTextApi] Fetch error during FormData request:", fetchError);
        displayError(`Network error during file upload: ${fetchError.message}`);
        hideLoader();
        // Clear files here as the request failed before server processing
        uploadedFiles = [];
        renderUploadPreview();
        return; // Exit if fetch itself failed
    }
    // Clear files and update preview after the request attempt, regardless of server success/failure for now.
    // This could be moved into a .finally of the server response processing if files should be kept on server error.
    uploadedFiles = [];
    renderUploadPreview();

} else {
    // No files uploaded, send as plain JSON
    console.log("[callTextApi] No files to upload. Sending plain JSON request.");
    lastRequestPayload = JSON.stringify(body, null, 2);
    payloadContainer.style.display = 'block';
    try {
        response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers, // Original headers with 'Content-Type': 'application/json'
            body: JSON.stringify(body),
            signal: currentAbortController?.signal
        });
        console.log("[callTextApi] Plain JSON request fetch completed. Response status:", response.status);
    } catch (fetchError) {
        console.error("[callTextApi] Fetch error during JSON request:", fetchError);
        displayError(`Network error: ${fetchError.message}`);
        hideLoader();
        return; // Exit if fetch itself failed
    }
}

// This outer try-catch handles processing the response (JSON parsing, error extraction from body)
// It assumes 'response' variable is set from one of the branches above.
try {
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
            // Prompt tokens estimated from user input (should match frontend logic)
            const promptTokensEstimate = estimateTokens(prompt);

            async function processStream() {
                // --- Live Stats for Streaming ---
                let lastLiveStatsUpdate = 0;
                let streamedTokenCount = 0;

                while (true) {
                    const { done, value } = await reader.read();
                    const now = performance.now();
                    const elapsed = (now - startTime) / 1000;

                    if (done) {
                        // Final update with all stats at completion
                        const completionTokensFinal = estimateTokens(contentBuffer);
                        const tokensPerSecondFinal = (elapsed > 0 && completionTokensFinal > 0)
                            ? (completionTokensFinal / elapsed).toFixed(2) : "…";
                        const totalTokensFinal = promptTokensEstimate + completionTokensFinal;

                        // Show copy button for successful streaming responses
                        showCopyButton(contentBuffer);

                        // Calculate enhanced statistics for streaming
                        const responseSize = new Blob([contentBuffer]).size;

                        displayEnhancedStats({
                            duration: (elapsed * 1000).toFixed(0), // Convert to milliseconds
                            responseSize: responseSize,
                            statusCode: response.status,
                            statusText: response.statusText,
                            tokenCount: totalTokensFinal,
                            model: model,
                            provider: provider,
                            generationType: 'text (streamed)'
                        });
                        // Ensure any final buffered content is displayed (though typically not needed with SSE)
                        if (accumulatedResponse.startsWith("data: ")) {
                            const jsonStr = accumulatedResponse.substring(6).trim();
                            if (jsonStr && jsonStr !== "[DONE]") {
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
                                // Stream is finished — handoff to the above "done" clause
                                return;
                            }
                            try {
                                const parsed = JSON.parse(jsonStr);
                                if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                                    const textChunk = parsed.choices[0].delta.content;
                                    contentBuffer += textChunk;
                                    outputText.innerHTML += textChunk.replace(/\n/g, '<br>');
                                    streamedTokenCount = estimateTokens(contentBuffer);
                                    updateStatsNow = true;
                                }
                            } catch (e) {
                                console.warn("Error parsing streamed JSON chunk:", e, "Chunk:", jsonStr);
                            }
                        }
                    }

                    // Live update stats after chunk or every ~120ms
                    if (updateStatsNow || (now - lastLiveStatsUpdate > 120)) {
                        lastLiveStatsUpdate = now;
                        let liveTokens = streamedTokenCount;
                        let liveTime = ((performance.now() - startTime) / 1000);
                        let tokensPerSecond = (liveTime > 0 && liveTokens > 0)
                            ? (liveTokens / liveTime).toFixed(2) : "…";
                        let totalTokens = promptTokensEstimate + liveTokens;

                        statsArea.innerHTML = `
                            <span><strong>Time:</strong> ${liveTime.toFixed(2)}s</span>
                            <span><strong>Tokens/Sec:</strong> ${tokensPerSecond}</span>
                            <span><strong>Prompt Tokens:</strong> ${promptTokensEstimate} (est)</span>
                            <span><strong>Completion Tokens:</strong> ${liveTokens} (est)</span>
                            <span><strong>Total Tokens:</strong> ${totalTokens} (est)</span>
                            <br><small>Live stats update – values estimated from streamed content.</small>
                        `;
                        statsArea.style.display = 'block';
                    }
                }
            }
            await processStream();
            // For streamed responses, lastApiResponse will show a summary,
            // as the full JSON is processed chunk by chunk and not stored as a single object.
            lastApiResponse = `{\n  "info": "Response was streamed.",\n  "model": "${model}",\n  "duration_seconds": ${durationInSeconds.toFixed(2)},\n  "accumulated_content_length": ${contentBuffer.length}\n}`;

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

            // Show copy button for successful text responses
            showCopyButton(aiContent);

            // Calculate enhanced statistics
            const responseSize = new Blob([aiContent]).size;
            const totalTokens = data.usage?.total_tokens || 0;

            displayEnhancedStats({
                duration: (durationInSeconds * 1000).toFixed(0), // Convert to milliseconds
                responseSize: responseSize,
                statusCode: response.status,
                statusText: response.statusText,
                tokenCount: totalTokens,
                model: model,
                provider: provider,
                generationType: 'text'
            });
        }

    } catch (error) {
        // Handle cancellation specifically
        if (error.name === 'AbortError') {
            // Request was cancelled, endRequest already called in cancelCurrentRequest
            return;
        }

        // lastApiResponse might contain error details already
        displayError(error.message); // displayError will hide loader
        statsArea.style.display = 'none'; // Hide stats on error
        endRequest(false); // Mark request as failed
    } finally {
        hideLoader(); // Ensure loader is hidden
        if (isRequestActive) {
            endRequest(true); // Mark request as successful if still active
        }
    }
}

// Handles image generation API calls.
async function callImageApi(provider, apiKey, baseUrl, model, prompt) {
    showLoader('Generating image...'); // Show loader at the start
    clearOutput();
    outputText.innerHTML = 'Sending image request...'; // Use text area for status
    outputArea.style.display = 'block';
    statsArea.style.display = 'none'; // Will show stats later if successful

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
            return displayError('Base URL is required for OpenAI Compatible image generation.');
        }
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        apiUrl = `${cleanBaseUrl}/images/generations`;
    } else {
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
            signal: currentAbortController?.signal
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
                    body: JSON.stringify(fallbackBody)
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
                displayError(retryError.message);
                return;
            }
        } else {
            // Handle cancellation specifically
            if (error.name === 'AbortError') {
                return;
            }
            displayError(error.message); // displayError will hide loader
            endRequest(false);
        }
    } finally {
        hideLoader();
        if (isRequestActive) {
            endRequest(true);
        }
    }
}

// Handles Text-to-Speech (TTS) API calls.
async function callTtsApi(provider, apiKey, baseUrl, model, text, voice) {
    showLoader('Generating speech...'); // Show loader at the start
    clearOutput();
    outputText.innerHTML = 'Generating TTS...';
    outputAudio.style.display = 'none';
    downloadAudio.style.display = 'none';
    outputArea.style.display = 'block';

    let apiUrl = '';
    let headers = {};
    let body = {};

    switch(provider) {
        case 'openai':
            apiUrl = 'https://api.openai.com/v1/audio/speech';
            headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
            body = { model: model, input: text, voice: voice };
            break;
        case 'openai_compatible':
            if (!baseUrl) return displayError('Base URL is required for OpenAI Compatible TTS.');
            const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            apiUrl = `${cleanBase}/audio/speech`;
            headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
            body = { model: model, input: text, voice: voice };
            break;
        default:
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
            signal: currentAbortController?.signal
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
        // Handle cancellation specifically
        if (err.name === 'AbortError') {
            return;
        }
        // lastApiResponse might be set from the !response.ok block
        displayError(err.message); // displayError will hide loader
        statsArea.style.display = 'none'; // Hide stats on error
        endRequest(false);
    } finally {
        hideLoader(); // Ensure loader is hidden
        if (isRequestActive) {
            endRequest(true);
        }
    }
}

// Handles Speech-to-Text (STT) API calls.
async function callSttApi(provider, apiKey, baseUrl, model, file) {
    showLoader('Transcribing audio...'); // Show loader at the start
    clearOutput();
    outputText.innerHTML = 'Transcribing audio...';
    outputArea.style.display = 'block';
    outputImage.style.display = 'none';
    outputAudio.style.display = 'none';
    downloadAudio.style.display = 'none';

    // Can't easily stringify FormData, so we store what we can
    const payloadInfo = { 
        provider: provider,
        model: model,
        fileName: file.name,
        fileSizeKB: (file.size / 1024).toFixed(2),
        fileType: file.type
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
            if (!baseUrl) return displayError('Base URL is required for OpenAI Compatible STT.');
            const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            apiUrl = `${cleanBase}/audio/transcriptions`;
        } else {
            return displayError('STT is not supported for selected provider.');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', model);

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: formData,
            signal: currentAbortController?.signal
        });

        const endTime = performance.now();
        const durationInSeconds = ((endTime - startTime) / 1000).toFixed(2);
        
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
        
    } catch (err) {
        // Handle cancellation specifically
        if (err.name === 'AbortError') {
            return;
        }
        // lastApiResponse might contain error details
        displayError(err.message); // displayError will hide loader
        statsArea.style.display = 'none'; // Hide stats on error
        endRequest(false);
    } finally {
        hideLoader(); // Ensure loader is hidden
        if (isRequestActive) {
            endRequest(true);
        }
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
    showLoader('Generating video...'); // Show loader at the start
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
            body: JSON.stringify(body),
            signal: currentAbortController?.signal
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
        // Handle cancellation specifically
        if (error.name === 'AbortError') {
            return;
        }
        displayError(error.message); // displayError will hide loader
        statsArea.style.display = 'none';
        endRequest(false);
    } finally {
        // Ensure loader is hidden for all other cases, including successful calls or other errors
        if (!(provider === 'openai' || provider === 'deepseek' || provider === 'claude')) {
            hideLoader();
        }
        if (isRequestActive) {
            endRequest(true);
        }
    }
}



// --- INITIALIZATION ---

// Binds all event listeners for the application.
function bindEventListeners() {
    // Main actions
    sendButton.addEventListener('click', handleSendClick);
    togglePayloadBtn.addEventListener('click', handleTogglePayload);
    toggleResponseBtn.addEventListener('click', handleToggleResponse);
    providerSelect.addEventListener('change', handleProviderChange);

    // Generation type and options
    generationTypeRadios.forEach(radio => {
        radio.addEventListener('click', handleGenerationTypeChange);
    });
    audioTypeSelect.addEventListener('change', handleAudioTypeChange);
    recordBtn.addEventListener('click', handleRecordClick);
    enableQualityCheckbox.addEventListener('change', handleEnableQualityChange);
    qualitySelect.addEventListener('change', handleQualitySelectChange);
    videoAspectRatioEnabled.addEventListener('change', handleAspectRatioToggle);

    // --- NEUE SWITCH EVENT LISTENER ---
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

    uploadTextBtn.addEventListener('click', handleUploadText);
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
        modelInput, promptInput, enableStreamingCheckbox, customQualityInput,
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
}

// --- EVENT HANDLER FUNCTIONS ---

async function handleSendClick() {
    // Check if we should cancel current request
    if (isRequestActive) {
        cancelCurrentRequest();
        return;
    }

    await saveProviderCredentials(providerSelect.value);
    await saveGeneralSettings();

    const provider = providerSelect.value;
    const apiKey = apiKeyInput.value.trim();
    const model = modelInput.value.trim();
    const prompt = promptInput.value.trim();
    const baseUrl = baseUrlInput.value.trim();
    const generationType = document.querySelector('input[name="generation-type"]:checked').value;

    if (!apiKey) return displayError('Please enter your API Key.');
    if (!model) return displayError('Please enter the Model Name.');
    if (generationType === 'text' || generationType === 'image' || generationType === 'video') {
        if (!prompt) return displayError('Please enter a prompt or description.');
    }
    if (provider === 'openai_compatible' && !baseUrl) return displayError('Please enter the Base URL for OpenAI Compatible provider.');

    // Start the request (this will update UI and create abort controller)
    startRequest();

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
                callTtsApi(provider, apiKey, baseUrl, model, prompt, voice);
            } else { // STT
                const file = recordedChunks.length > 0 ? new File(recordedChunks, 'recording.webm', { type: 'audio/webm' }) : audioFileInput.files[0];
                if (!file) return displayError('Please upload or record an audio file for STT.');
                callSttApi(provider, apiKey, baseUrl, model, file);
            }
            break;
        case 'video':
            const duration = parseInt(videoDurationInput.value);
            if (!duration || duration < 1 || duration > 60) return displayError('Please enter a valid duration (1-60 seconds).');
            callVideoApi(provider, apiKey, baseUrl, model, prompt);
            break;
        default:
            displayError('Invalid generation type selected.');
            endRequest(false);
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

function handleUploadText() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '*/*'; // Accept all file types
    fileInput.onchange = e => {
        const newFile = e.target.files[0];
        if (newFile) {
            uploadedFiles.push(newFile); // Add to the array
            renderUploadPreview(); // Update the UI to show all previews
        }
        // saveGeneralSettings(); // Consider if persisting multiple files is needed
    };
    fileInput.click();
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

    // Store original button text
    originalSendButtonText = sendButton.textContent;

    // Show session stats container
    const sessionStatsContainer = document.getElementById('session-stats-container');
    if (sessionStatsContainer) {
        sessionStatsContainer.style.display = 'block';
        updateSessionStatsDisplay();
    }

    initializeTheme();
    await loadGeneralSettings();
    await loadProviderCredentials(providerSelect.value);
    toggleBaseUrlInput();
    await checkMicrophonePermission();
    updateMicrophoneUI();
    bindEventListeners();
    renderUploadPreview();
}

// --- APP START ---
document.addEventListener('DOMContentLoaded', initializeApp);
