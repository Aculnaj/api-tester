// Get references to the relevant HTML elements
const providerSelect = document.getElementById('provider-select');
const apiKeyInput = document.getElementById('api-key-input');
const baseUrlContainer = document.getElementById('base-url-container');
const baseUrlInput = document.getElementById('base-url-input');
const modelInput = document.getElementById('model-input');
const promptInput = document.getElementById('prompt-input');
const sendButton = document.getElementById('send-button');
const outputArea = document.getElementById('output-area');
const outputText = document.getElementById('output-text'); // Specific element for text
const outputImage = document.getElementById('output-image'); // Specific element for image
const generationTypeText = document.getElementById('generation-type-text');
const generationTypeImage = document.getElementById('generation-type-image');
const imageOptionsContainer = document.getElementById('image-options-container');
const qualityOptionsContainer = document.getElementById('quality-options-container');
const qualitySelect = document.getElementById('quality-select');
const enableQualityCheckbox = document.getElementById('enable-quality-checkbox');
const enableQualityContainer = document.querySelector('.enable-quality-container');
const customQualityInput = document.getElementById('custom-quality-input'); // New
const imageWidthInput = document.getElementById('image-width-input');
const imageHeightInput = document.getElementById('image-height-input');
const statsArea = document.getElementById('stats-area');

// Audio generation elements
const generationTypeAudio = document.getElementById('generation-type-audio');
const audioOptionsContainer = document.getElementById('audio-options-container');
const audioTypeSelect = document.getElementById('audio-type-select');
const sttInputContainer = document.getElementById('stt-input-container');
const audioFileInput = document.getElementById('audio-file-input');
const outputAudio = document.getElementById('output-audio');
const downloadAudio = document.getElementById('download-audio');
const downloadImageBtn = document.getElementById('download-image-btn'); // New button for image download
const voiceOptionsContainer = document.getElementById('voice-options-container');
const voiceInput = document.getElementById('voice-input');
const recorderControls = document.getElementById('recorder-controls');
const recordBtn = document.getElementById('record-btn');
const recordingPreview = document.getElementById('recording-preview');
let recordedChunks = [];
let mediaRecorder;
let lastRequestPayload = null; // Variable to store the last request payload
let lastApiResponse = null;    // Variable to store the last API response
const payloadContainer = document.getElementById('payload-container');
const togglePayloadBtn = document.getElementById('toggle-payload-btn');
const payloadDisplayArea = document.getElementById('payload-display-area');
const toggleResponseBtn = document.getElementById('toggle-response-btn');     // New
const responseDisplayArea = document.getElementById('response-display-area'); // New

// Model container reposition support
const modelContainer = document.getElementById('model-container');
const modelContainerOriginalParent = modelContainer.parentNode;
const modelContainerOriginalNextSibling = modelContainer.nextElementSibling;

// --- Storage Helpers (with fallback to localStorage when not in Electron) ---
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


// --- Settings Persistence ---
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

const THEME_SETTING_KEY = 'userTheme'; // 'system', 'light', 'dark'

// Helper function for browser-based theme storage
function saveThemeToLocalStorage(theme) {
    try {
        localStorage.setItem(THEME_SETTING_KEY, theme);
        return true;
    } catch (e) {
        console.error('Failed to save theme to localStorage:', e);
        return false;
    }
}

// Helper function to get theme from browser storage
function getThemeFromLocalStorage() {
    try {
        return localStorage.getItem(THEME_SETTING_KEY) || 'system';
    } catch (e) {
        console.error('Failed to get theme from localStorage:', e);
        return 'system';
    }
}

// Function to determine if dark mode should be used based on system preference
function getSystemDarkMode() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Listen for system color scheme changes
function setupSystemThemeListener(callback) {
    if (window.matchMedia) {
        const matcher = window.matchMedia('(prefers-color-scheme: dark)');
        matcher.addEventListener('change', (e) => {
            callback(e.matches);
        });
    }
}

async function applyTheme(themeToApply, osShouldUseDark) {
    console.log('Applying theme:', { themeToApply, osShouldUseDark });
    if (themeToApply === 'system') {
        document.body.classList.toggle('dark-mode', osShouldUseDark);
    } else if (themeToApply === 'dark') {
        document.body.classList.add('dark-mode');
    } else { // 'light'
        document.body.classList.remove('dark-mode');
    }

    // Theme mode buttons
    const btnSystem = document.getElementById('theme-btn-system');
    const btnLight = document.getElementById('theme-btn-light');
    const btnDark = document.getElementById('theme-btn-dark');
    if (btnSystem && btnLight && btnDark) {
        btnSystem.classList.remove('active');
        btnLight.classList.remove('active');
        btnDark.classList.remove('active');
        if (themeToApply === 'system') btnSystem.classList.add('active');
        else if (themeToApply === 'light') btnLight.classList.add('active');
        else btnDark.classList.add('active');
    }
}

async function initializeTheme() {
    // Setup for when we're in Electron environment
    if (window.electronAPI && window.electronAPI.onThemeUpdated && window.electronAPI.setThemePreference && window.electronAPI.getThemePreference) {
        console.log('Initializing theme in Electron environment');
        
        // Listen for theme updates from main process
        window.electronAPI.onThemeUpdated(({ theme, shouldUseDark }) => {
            console.log('Renderer: theme-updated received from main:', { theme, shouldUseDark });
            applyTheme(theme, shouldUseDark);
        });

        // Get initial theme state from main process
        let initialThemeState;
        try {
            initialThemeState = await window.electronAPI.getThemePreference();
            if (initialThemeState) {
                console.log('Renderer: Initial theme state received:', initialThemeState);
                applyTheme(initialThemeState.theme, initialThemeState.shouldUseDark);
            } else {
                console.warn('Renderer: Did not receive initial theme state.');
                applyTheme('system', getSystemDarkMode());
            }
        } catch (error) {
            console.error('Renderer: Error getting initial theme preference:', error);
            applyTheme('system', getSystemDarkMode());
        }

        // Theme mode button logic for Electron
        const btnSystem = document.getElementById('theme-btn-system');
        const btnLight = document.getElementById('theme-btn-light');
        const btnDark = document.getElementById('theme-btn-dark');
        if (btnSystem && btnLight && btnDark) {
            btnSystem.onclick = async () => {
                await window.electronAPI.setThemePreference('system');
            };
            btnLight.onclick = async () => {
                await window.electronAPI.setThemePreference('light');
            };
            btnDark.onclick = async () => {
                await window.electronAPI.setThemePreference('dark');
            };
        }
    }
    // Setup for when we're in a browser (no Electron)
    else {
        console.log('Initializing theme in browser environment');
        
        // Get initial theme from localStorage
        const savedTheme = getThemeFromLocalStorage();
        const isDarkMode = getSystemDarkMode();
        
        // Apply the initial theme
        applyTheme(savedTheme, isDarkMode);
        
        // Setup system theme change listener
        setupSystemThemeListener((isDark) => {
            if (getThemeFromLocalStorage() === 'system') {
                applyTheme('system', isDark);
            }
        });
        
        // Theme mode button logic for browser
        const btnSystem = document.getElementById('theme-btn-system');
        const btnLight = document.getElementById('theme-btn-light');
        const btnDark = document.getElementById('theme-btn-dark');
        if (btnSystem && btnLight && btnDark) {
            btnSystem.onclick = () => {
                saveThemeToLocalStorage('system');
                applyTheme('system', getSystemDarkMode());
            };
            btnLight.onclick = () => {
                saveThemeToLocalStorage('light');
                applyTheme('light', false);
            };
            btnDark.onclick = () => {
                saveThemeToLocalStorage('dark');
                applyTheme('dark', true);
            };
        }
    }
}

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

async function saveProviderCredentials(provider) {
    if (!provider) return;
    const apiKey = apiKeyInput.value;
    const baseUrl = baseUrlInput ? baseUrlInput.value : ''; // Check if baseUrlInput exists
    await setStoredValue(`${API_CREDENTIALS_KEY_PREFIX}.${provider}`, { apiKey, baseUrl });
}

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

    toggleGenerationOptions(); // Update UI based on loaded settings
    toggleBaseUrlInput(); // Ensure base URL visibility
}

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
}

// Function to show or hide the Base URL input based on the selected provider
function toggleBaseUrlInput() {
    const selectedProvider = providerSelect.value;
    baseUrlContainer.style.display = selectedProvider === 'openai_compatible' ? 'block' : 'none';
    if (selectedProvider !== 'openai_compatible') {
        baseUrlInput.value = ''; // Clear the input if hidden
    }
}

// Add an event listener to the provider select dropdown
providerSelect.addEventListener('change', async () => {
    // Save credentials for the PREVIOUS provider
    // To get the previous provider, we need to be careful as the value has already changed.
    // This is a bit tricky. A better way would be to store the previous value before it changes.
    // For now, we'll rely on loading to implicitly handle this,
    // but saving on 'input' for API key/base URL is more robust.
    // Let's call saveGeneralSettings which saves the new provider.
    await saveGeneralSettings();
    await loadProviderCredentials(providerSelect.value);
    toggleBaseUrlInput(); // Original line, good to keep
});

// Function to show/hide image-specific options
function toggleGenerationOptions() {
    // Hide voice input by default on every switch
    voiceOptionsContainer.style.display = 'none';
    const generationType = document.querySelector('input[name="generation-type"]:checked').value;
    const showText = generationType === 'text'; // Determine text mode early for reposition logic

    // Image Options
    const showImage = generationType === 'image';
    imageOptionsContainer.style.display = showImage ? 'block' : 'none';
    if (enableQualityContainer) {
        enableQualityContainer.style.display = showImage ? 'block' : 'none';
    }
    if (qualityOptionsContainer) {
        qualityOptionsContainer.style.display = (showImage && enableQualityCheckbox.checked) ? 'block' : 'none';
    }
    if (customQualityInput) {
        customQualityInput.style.display = (showImage && enableQualityCheckbox.checked && qualitySelect.value === 'custom') ? 'block' : 'none';
    }

    // Audio Options
    const showAudio = generationType === 'audio';
    audioOptionsContainer.style.display = showAudio ? 'block' : 'none';

    if (showAudio) {
        const audioType = audioTypeSelect.value;
        if (audioType === 'tts') {
            // For TTS: show text prompt, hide file input & recorder, show voice input
            promptInput.style.display = 'block';
            sttInputContainer.style.display = 'none';
            recorderControls.style.display = 'none';
            voiceOptionsContainer.style.display = 'block';
            document.getElementById('prompt-label').textContent = 'Text to Speak:';
        } else {
            // For STT: show file input & recorder, hide text prompt & voice input
            sttInputContainer.style.display = 'block';
            recorderControls.style.display = 'block';
            promptInput.style.display = 'none';
            voiceOptionsContainer.style.display = 'none';
            document.getElementById('prompt-label').textContent = 'Upload or Record Audio:';
        }
    }


    // Text Options
    if (showText) {
        promptInput.style.display = 'block';
        document.getElementById('prompt-label').textContent = 'Prompt:';
    }

    // Reset prompt label for image when selected
    if (generationType === 'image') {
        promptInput.style.display = 'block';
        document.getElementById('prompt-label').textContent = 'Prompt / Image Description:';
    }
  // Reposition Model Name field based on generation type
  if (showImage) {
      imageOptionsContainer.insertBefore(modelContainer, enableQualityContainer);
  } else if (showAudio) {
      // Different placement based on Audio Type (TTS vs STT)
      if (audioTypeSelect.value === 'tts') {
          // TTS: model before voice input
          voiceOptionsContainer.parentNode.insertBefore(modelContainer, voiceOptionsContainer);
      } else {
          // STT: model before audio file/recorder inputs
          audioOptionsContainer.insertBefore(modelContainer, sttInputContainer);
      }
  } else {
      modelContainerOriginalParent.insertBefore(modelContainer, modelContainerOriginalNextSibling);
  }
}

// Add event listeners to radio buttons to toggle image options
document.querySelectorAll('input[name="generation-type"]').forEach(radio => {
    radio.addEventListener('change', toggleGenerationOptions);
});
audioTypeSelect.addEventListener('change', toggleGenerationOptions);

// Single button recorder toggle
recordBtn.addEventListener('click', async () => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        // Start recording
        recordedChunks = [];
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = e => {
                if (e.data.size > 0) recordedChunks.push(e.data);
            };
            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                recordingPreview.src = url;
                recordingPreview.style.display = 'block';
                // Update record button label
                recordBtn.textContent = 'Start Recording';
            };
            mediaRecorder.start();
            recordBtn.textContent = 'Stop Recording';
            recordingPreview.style.display = 'none';
        } catch (err) {
            displayError('Microphone access denied or unavailable.');
        }
    } else {
        // Stop recording
        mediaRecorder.stop();
    }
});
enableQualityCheckbox.addEventListener('change', () => {
    if (qualityOptionsContainer) {
        qualityOptionsContainer.style.display = enableQualityCheckbox.checked ? 'block' : 'none';
    }
    if (customQualityInput) {
        customQualityInput.style.display = 'none';
    }
});

// Show/hide custom quality input when 'custom' option is selected
qualitySelect.addEventListener('change', () => {
    if (enableQualityCheckbox.checked && qualitySelect.value === 'custom' && customQualityInput) {
        customQualityInput.style.display = 'block';
    } else if (customQualityInput) {
        customQualityInput.style.display = 'none';
    }
});


// --- Helper to display errors ---
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

// --- Clear Output ---
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
}

// --- API Call Logic for Text ---
async function callTextApi(provider, apiKey, baseUrl, model, prompt) {
    clearOutput();
    outputText.innerHTML = 'Sending text request...';
    outputArea.style.display = 'block';

    let apiUrl = '';
    let headers = {};
    let body = {};

    // Configure based on provider
    switch (provider) {
        case 'openai':
            apiUrl = 'https://api.openai.com/v1/chat/completions';
            headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
            body = { model: model, messages: [{ role: 'user', content: prompt }], stream: false };
            break;
        case 'deepseek':
            apiUrl = 'https://api.deepseek.com/chat/completions';
            headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
            body = { model: model, messages: [{ role: 'user', content: prompt }], stream: false };
            break;
        case 'openai_compatible':
            if (!baseUrl) return displayError('Base URL is required for OpenAI Compatible provider.');
            const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            apiUrl = `${cleanBaseUrl}/chat/completions`;
            headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
            body = { model: model, messages: [{ role: 'user', content: prompt }], stream: false };
            break;
        case 'claude':
            apiUrl = 'https://api.anthropic.com/v1/messages';
            headers = { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' };
            body = { model: model, max_tokens: 1024, messages: [{ role: 'user', content: prompt }] };
            break;
        case 'openrouter':
            apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
            headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
            body = { model: model, messages: [{ role: 'user', content: prompt }], stream: false };
            break;
        case 'voidai_api':
            apiUrl = 'https://api.voidai.app/v1/chat/completions';
            headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
            body = { model: model, messages: [{ role: 'user', content: prompt }], stream: false };
            break;
        default:
            return displayError('Unknown provider selected for text generation.');
    }

    // Store payload before sending
    lastRequestPayload = JSON.stringify(body, null, 2);
    payloadContainer.style.display = 'block';

    // Make the API call
    const startTime = performance.now(); // Record start time
    try {
        const response = await fetch(apiUrl, { method: 'POST', headers: headers, body: JSON.stringify(body) });
        const endTime = performance.now(); // Record end time
        const durationInSeconds = (endTime - startTime) / 1000;

        // Clone the response to read JSON and still have response object available if needed
        const responseClone = response.clone();
        let data;
        try {
            data = await response.json(); 
            lastApiResponse = JSON.stringify(data, null, 2); // Store the successful JSON response
        } catch (jsonError) {
            console.error("Failed to parse JSON response:", jsonError);
            const textResponse = await responseClone.text(); // Try getting text if JSON fails
            lastApiResponse = `Response was not valid JSON:\n${textResponse}`;
            data = null; // Indicate that data parsing failed
        }
        
        console.log("Text API Response Data:", data);

        if (!response.ok) {
            // If response was not ok, lastApiResponse already contains text/JSON error
            const errorMsg = data?.error?.message || data?.detail || lastApiResponse || `HTTP Error ${response.status}`;
            throw new Error(`API Error (${response.status}): ${errorMsg}`);
        }

        // If response is ok but data parsing failed earlier
        if (!data) {
             throw new Error("Received OK response but failed to parse JSON content.");
        }

        // Extract content
        let aiContent = '';
        if (provider === 'claude') {
            if (data.content && data.content.length > 0 && data.content[0].text) aiContent = data.content[0].text;
            else throw new Error('Could not find text content in Claude response.');
        } else { // OpenAI/Compatible/Deepseek/OpenRouter
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
            const totalTokens = usage.total_tokens || (promptTokens + completionTokens); // Calculate if not provided
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
             statsArea.innerHTML = '<span>Usage data not available in response.</span>'; // Indicate missing data
             statsArea.style.display = 'block';
        }


    } catch (error) {
        // lastApiResponse might contain error details already
        displayError(error.message);
        statsArea.style.display = 'none'; // Hide stats on error
    }
}

// --- API Call Logic for Images (OpenAI DALL-E Example) ---
async function callImageApi(provider, apiKey, baseUrl, model, prompt) {
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
    } else if (provider === 'voidai_api') {
        apiUrl = 'https://api.voidai.app/v1/images/generations';
    } else if (provider === 'openai_compatible') {
        if (!baseUrl) {
            return displayError('Base URL is required for OpenAI Compatible image generation.');
        }
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        apiUrl = `${cleanBaseUrl}/images/generations`;
    } else {
        return displayError(`Image generation is currently only supported for OpenAI, voidai API, and potentially OpenAI Compatible providers in this example.`);
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
        body.quality = qualitySelect.value;
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
            body: JSON.stringify(body)
        });

        const endTime = performance.now();
        const durationInSeconds = ((endTime - startTime) / 1000).toFixed(2);

        const responseClone = response.clone();
        let data;
        try {
            data = await response.json();
            lastApiResponse = JSON.stringify(data, null, 2);
        } catch (jsonError) {
            console.error("Failed to parse JSON response:", jsonError);
            const textResponse = await responseClone.text();
            lastApiResponse = `Response was not valid JSON:\n${textResponse}`;
            data = null;
        }

        console.log("Image API Response Data:", data);

        if (!response.ok) {
            const errorMsg = data?.error?.message || lastApiResponse || `HTTP Error ${response.status}`;
            throw new Error(`API Error (${response.status}): ${errorMsg}`);
        }

        if (!data) {
            throw new Error("Received OK response but failed to parse JSON content.");
        }

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
                
                const retryResponseClone = retryResponse.clone();
                let retryData;
                try {
                    retryData = await retryResponse.json();
                    lastApiResponse = JSON.stringify(retryData, null, 2); // Store retry response
                } catch (retryJsonError) {
                    console.error("Failed to parse JSON response on retry:", retryJsonError);
                    const retryTextResponse = await retryResponseClone.text();
                    lastApiResponse = `Retry response was not valid JSON:\n${retryTextResponse}`;
                    retryData = null;
                }
                
                if (!retryResponse.ok) {
                    const errMsg2 = retryData?.error?.message || lastApiResponse || `HTTP Error ${retryResponse.status}`;
                    throw new Error(`API Error (${retryResponse.status}): ${errMsg2}`);
                }
                
                if (!retryData) {
                    throw new Error("Received OK retry response but failed to parse JSON content.");
                }
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
            displayError(error.message);
        }
    }
}


// --- API Call Logic for Audio ---
async function callTtsApi(provider, apiKey, baseUrl, model, text, voice) {
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
        case 'voidai_api':
            apiUrl = 'https://api.voidai.app/v1/audio/speech';
            headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
            body = { model: model, input: text, voice: voice };
            break;
        default:
            return displayError('TTS is only supported for OpenAI, OpenAI Compatible, and voidai API providers.');
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
        });
        
        const endTime = performance.now();
        const durationInSeconds = ((endTime - startTime) / 1000).toFixed(2);
        
        // For TTS, the successful response is the audio blob, not JSON
        // We store info about the response headers or status for debugging
        if (!response.ok) {
            const msg = await response.text();
            lastApiResponse = `TTS API Error (${response.status}):\n${msg}`;
            throw new Error(`TTS API Error (${response.status}): ${msg}`);
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
            downloadAudio.download = `${model}-${voice}-tts.wav`;
            downloadAudio.style.display = 'inline';
            outputText.innerHTML = `<strong>Voice:</strong> ${voice}`;
            outputText.style.display = 'block';
        }, { once: true });
        
        outputAudio.load();
    } catch (err) {
        // lastApiResponse might be set from the !response.ok block
        displayError(err.message);
        statsArea.style.display = 'none'; // Hide stats on error
    }
}



// --- API Call Logic for Speech-to-Text ---
async function callSttApi(provider, apiKey, baseUrl, model, file) {
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
        } else if (provider === 'voidai_api') {
            apiUrl = 'https://api.voidai.app/v1/audio/transcriptions';
        } else {
            return displayError('STT is not supported for selected provider.');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', model);

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: formData
        });

        const endTime = performance.now();
        const durationInSeconds = ((endTime - startTime) / 1000).toFixed(2);
        
        const responseClone = response.clone();
        let data;
        try {
            data = await response.json();
            lastApiResponse = JSON.stringify(data, null, 2);
        } catch (jsonError) {
             console.error("Failed to parse JSON response:", jsonError);
            const textResponse = await responseClone.text();
            lastApiResponse = `Response was not valid JSON:\n${textResponse}`;
            data = null;
        }

        if (!response.ok) {
            const errText = data?.text || data?.transcript || lastApiResponse || `HTTP Error ${response.status}`;
            throw new Error(`STT API Error (${response.status}): ${errText}`);
        }

        if (!data) {
            throw new Error("Received OK response but failed to parse JSON content.");
        }

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
        // lastApiResponse might contain error details
        displayError(err.message);
        statsArea.style.display = 'none'; // Hide stats on error
    }
}
// --- Main Event Listener ---
sendButton.addEventListener('click', async () => {
    // Save current provider's credentials and general settings before sending
    await saveProviderCredentials(providerSelect.value);
    await saveGeneralSettings();

    const provider = providerSelect.value;
    const apiKey = apiKeyInput.value.trim();
    const model = modelInput.value.trim();
    const prompt = promptInput.value.trim();
    const baseUrl = baseUrlInput.value.trim();
    const generationType = document.querySelector('input[name="generation-type"]:checked').value;

    // --- Basic Input Validation ---
    if (!apiKey) return displayError('Please enter your API Key.');
    if (!model) return displayError('Please enter the Model Name.');
    if (generationType === 'text' || generationType === 'image') {
        if (!prompt) return displayError('Please enter a prompt or description.');
    }
    if (provider === 'openai_compatible' && !baseUrl) return displayError('Please enter the Base URL for OpenAI Compatible provider.');

    // --- Route to appropriate API call ---
    if (generationType === 'text') {
        callTextApi(provider, apiKey, baseUrl, model, prompt);
    } else if (generationType === 'image') {
        callImageApi(provider, apiKey, baseUrl, model, prompt);
    } else if (generationType === 'audio') {
        const audioType = audioTypeSelect.value;
        if (audioType === 'tts') {
            if (!prompt) return displayError('Please enter text for TTS.');
            const voice = voiceInput.value.trim();
            if (!voice) return displayError('Please enter voice.');
            callTtsApi(provider, apiKey, baseUrl, model, prompt, voice);
        } else {
            let file;
            if (recordedChunks.length > 0) {
                file = new File(recordedChunks, 'recording.webm', { type: 'audio/webm' });
            } else {
                file = audioFileInput.files[0];
            }
            if (!file) return displayError('Please upload or record an audio file for STT.');
            callSttApi(provider, apiKey, baseUrl, model, file);
        }
    } else {
        displayError('Invalid generation type selected.');
    }
});

// --- Payload Toggle Listener ---
togglePayloadBtn.addEventListener('click', () => {
    const isHidden = payloadDisplayArea.style.display === 'none';
    if (isHidden) {
        // Hide response if shown
        responseDisplayArea.style.display = 'none';
        toggleResponseBtn.classList.remove('active');
        
        if (lastRequestPayload) {
            payloadDisplayArea.textContent = lastRequestPayload;
        } else {
            payloadDisplayArea.textContent = 'No request payload data available.';
        }
        payloadDisplayArea.style.display = 'block';
        togglePayloadBtn.textContent = 'Hide Request';
        togglePayloadBtn.classList.add('active');
    } else {
        payloadDisplayArea.style.display = 'none';
        togglePayloadBtn.textContent = 'Show Request';
        togglePayloadBtn.classList.remove('active');
    }
});

// --- Response Toggle Listener ---
toggleResponseBtn.addEventListener('click', () => {
    const isHidden = responseDisplayArea.style.display === 'none';
    if (isHidden) {
        // Hide request if shown
        payloadDisplayArea.style.display = 'none';
        togglePayloadBtn.classList.remove('active');
        
        if (lastApiResponse) {
            responseDisplayArea.textContent = lastApiResponse;
        } else {
            responseDisplayArea.textContent = 'No response data available.';
        }
        responseDisplayArea.style.display = 'block';
        toggleResponseBtn.textContent = 'Hide Response';
        toggleResponseBtn.classList.add('active');
    } else {
        responseDisplayArea.style.display = 'none';
        toggleResponseBtn.textContent = 'Show Response';
        toggleResponseBtn.classList.remove('active');
    }
});

// Initial checks
toggleBaseUrlInput();
toggleGenerationOptions(); // Initialize generation options visibility on load

// Initial Load and Setup
document.addEventListener('DOMContentLoaded', async () => {
    initializeTheme(); // Initialize theme handling
    await loadGeneralSettings(); // Load general UI settings first
    await loadProviderCredentials(providerSelect.value); // Then load creds for the (potentially loaded) provider
    toggleBaseUrlInput(); // From original code
    toggleGenerationOptions(); // From original code
    
    // Add input/change listeners to save settings as they are modified
    apiKeyInput.addEventListener('input', () => saveProviderCredentials(providerSelect.value));
    if (baseUrlInput) { // Check if exists
        baseUrlInput.addEventListener('input', () => saveProviderCredentials(providerSelect.value));
    }
    modelInput.addEventListener('input', saveGeneralSettings);
    promptInput.addEventListener('input', saveGeneralSettings);

    document.querySelectorAll('input[name="generation-type"]').forEach(radio => {
        radio.addEventListener('change', async () => {
            await saveGeneralSettings();
            toggleGenerationOptions(); // existing call, this will correctly show/hide sections
        });
    });

    if (enableQualityCheckbox) enableQualityCheckbox.addEventListener('change', async () => {
        // When checkbox changes, directly update visibility of its dependent containers
        if (qualityOptionsContainer) {
            qualityOptionsContainer.style.display = enableQualityCheckbox.checked ? 'block' : 'none';
        }
        // Custom quality input visibility also depends on the quality dropdown
        if (customQualityInput) {
            customQualityInput.style.display = (enableQualityCheckbox.checked && qualitySelect.value === 'custom') ? 'block' : 'none';
        }
        await saveGeneralSettings(); // Save the checkbox state
    });

    if (qualitySelect) qualitySelect.addEventListener('change', async () => {
        // When quality dropdown changes, update visibility of custom input if quality is enabled
        if (customQualityInput) {
            customQualityInput.style.display = (enableQualityCheckbox.checked && qualitySelect.value === 'custom') ? 'block' : 'none';
        }
        await saveGeneralSettings(); // Save quality select state
    });

    if (customQualityInput) customQualityInput.addEventListener('input', saveGeneralSettings);
    if (imageWidthInput) imageWidthInput.addEventListener('input', saveGeneralSettings);
    if (imageHeightInput) imageHeightInput.addEventListener('input', saveGeneralSettings);
    if (audioTypeSelect) audioTypeSelect.addEventListener('change', async () => {
        await saveGeneralSettings();
        toggleGenerationOptions(); // existing call
    });
    if (voiceInput) voiceInput.addEventListener('input', saveGeneralSettings);

});
