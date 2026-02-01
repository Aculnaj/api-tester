# Gemini Native API ve Google Vertex AI Entegrasyon Planı

## Özet
Bu plan, API Tester v2 projesine aşağıdaki özellikleri eklemeyi kapsar:
1. **Google Vertex AI** provider'ı (sabit baseUrl, API key authentication)
2. **Gemini Compatible** provider'ı (native Gemini API formatı)
3. Mevcut **Gemini** provider'ını native API formatına çevirme

> **Not:** Anthropic Compatible provider'ı sonraki aşamada eklenecek (v1/messages desteği ile birlikte).

## Mevcut Durum Analizi

### Mevcut Provider Yapısı
Proje şu anda OpenAI-compatible API formatını temel alıyor:
- Endpoint: `/chat/completions`
- Request format: `{ model, messages: [{role, content}], stream, ... }`
- Response format: `{ choices: [{message: {content}}], usage }`

### Gemini Mevcut Durumu
Şu anda `gemini` provider'ı OpenAI compatibility layer kullanıyor:
```javascript
gemini: {
    name: 'Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    // OpenAI compatible format kullanıyor
}
```

## API Format Karşılaştırması

### 1. Gemini Native API Format

**Endpoint:**
- Non-streaming: `POST /v1beta/models/{model}:generateContent`
- Streaming: `POST /v1beta/models/{model}:streamGenerateContent?alt=sse`

**Request Format:**
```json
{
  "contents": [
    {
      "role": "user",
      "parts": [{ "text": "Hello" }]
    },
    {
      "role": "model", 
      "parts": [{ "text": "Hi there!" }]
    }
  ],
  "systemInstruction": {
    "parts": [{ "text": "You are a helpful assistant" }]
  },
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 1024
  }
}
```

**Response Format:**
```json
{
  "candidates": [
    {
      "content": {
        "role": "model",
        "parts": [{ "text": "Response text" }]
      }
    }
  ],
  "usageMetadata": {
    "promptTokenCount": 10,
    "candidatesTokenCount": 50,
    "totalTokenCount": 60
  }
}
```

**Authentication:**
- Header: `x-goog-api-key: YOUR_API_KEY`

### 2. Google Vertex AI Format

**Endpoint:**
```
POST https://{LOCATION}-aiplatform.googleapis.com/v1/projects/{PROJECT_ID}/locations/{LOCATION}/publishers/google/models/{MODEL_ID}:generateContent
```

**Request Format:** Gemini native ile aynı

**Authentication:**
- Header: `Authorization: Bearer {ACCESS_TOKEN}`
- Access token: `gcloud auth print-access-token` ile alınır

### 3. Anthropic Native API Format

**Endpoint:** `POST /v1/messages`

**Request Format:**
```json
{
  "model": "claude-3-opus-20240229",
  "max_tokens": 1024,
  "system": "You are a helpful assistant",
  "messages": [
    { "role": "user", "content": "Hello" }
  ]
}
```

**Response Format:**
```json
{
  "content": [{ "type": "text", "text": "Response" }],
  "usage": {
    "input_tokens": 10,
    "output_tokens": 50
  }
}
```

## Uygulama Planı

### Adım 1: providers.js - Yeni Provider Konfigürasyonları

```javascript
// Gemini Compatible (Native API)
gemini_compatible: {
    name: 'Gemini Compatible',
    baseUrl: '',
    placeholder: 'https://generativelanguage.googleapis.com/v1beta',
    models: [],
    supportsStreaming: true,
    supportsModels: true,
    supportedModes: ['text', 'image', 'audio', 'video'],
    apiFormat: 'gemini'  // Yeni alan
},

// Google Vertex AI
vertex_ai: {
    name: 'Google Vertex AI',
    baseUrl: '',
    placeholder: 'https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT/locations/us-central1/publishers/google',
    models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'],
    supportsStreaming: true,
    supportsModels: false,  // Vertex AI model listesi farklı çalışıyor
    supportedModes: ['text', 'image', 'audio', 'video'],
    apiFormat: 'gemini'
},

// Anthropic Compatible
anthropic_compatible: {
    name: 'Anthropic Compatible',
    baseUrl: '',
    placeholder: 'https://api.anthropic.com/v1',
    models: [],
    supportsStreaming: true,
    supportsModels: true,
    supportedModes: ['text'],
    apiFormat: 'anthropic'
}
```

### Adım 2: providers.js - Yeni Fonksiyonlar

#### 2.1 API Format Belirleme
```javascript
getApiFormat(providerId) {
    const config = this.getConfig(providerId);
    return config.apiFormat || 'openai';  // Default: OpenAI compatible
}
```

#### 2.2 Gemini Request Builder
```javascript
buildGeminiRequest(options) {
    const { model, messages, stream, temperature, maxTokens } = options;
    
    const body = {
        contents: []
    };
    
    // System prompt ayrı alan
    const systemMessage = messages.find(m => m.role === 'system');
    if (systemMessage) {
        body.systemInstruction = {
            parts: [{ text: systemMessage.content }]
        };
    }
    
    // User/assistant mesajları
    messages.filter(m => m.role !== 'system').forEach(msg => {
        body.contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: this.buildGeminiParts(msg.content)
        });
    });
    
    // Generation config
    body.generationConfig = {};
    if (temperature !== undefined) {
        body.generationConfig.temperature = temperature;
    }
    if (maxTokens !== undefined) {
        body.generationConfig.maxOutputTokens = maxTokens;
    }
    
    return body;
}

buildGeminiParts(content) {
    if (typeof content === 'string') {
        return [{ text: content }];
    }
    // Multi-modal content için
    return content.map(part => {
        if (part.type === 'text') {
            return { text: part.text };
        }
        if (part.type === 'image_url') {
            return {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: part.image_url.url  // Base64 veya URL
                }
            };
        }
        return part;
    });
}
```

#### 2.3 Gemini Endpoint Builder
```javascript
getGeminiEndpoint(provider, model, stream) {
    if (provider === 'vertex_ai') {
        const action = stream ? 'streamGenerateContent' : 'generateContent';
        return `/models/${model}:${action}`;
    }
    
    // Gemini Compatible
    const action = stream ? 'streamGenerateContent' : 'generateContent';
    const streamParam = stream ? '?alt=sse' : '';
    return `/models/${model}:${action}${streamParam}`;
}
```

#### 2.4 Header Builder Güncelleme
```javascript
getHeaders(providerId, apiKey) {
    const headers = {
        'Content-Type': 'application/json'
    };

    const apiFormat = this.getApiFormat(providerId);
    
    if (apiFormat === 'gemini') {
        if (providerId === 'vertex_ai') {
            // Vertex AI OAuth token kullanır
            headers['Authorization'] = `Bearer ${apiKey}`;
        } else {
            // Gemini API key
            headers['x-goog-api-key'] = apiKey;
        }
    } else if (apiFormat === 'anthropic' || providerId === 'anthropic' || providerId === 'anthropic_compatible') {
        headers['x-api-key'] = apiKey;
        headers['anthropic-version'] = '2023-06-01';
        headers['anthropic-dangerous-direct-browser-access'] = 'true';
    } else {
        headers['Authorization'] = `Bearer ${apiKey}`;
    }

    return headers;
}
```

### Adım 3: text.js - Gemini Response Handler

#### 3.1 Streaming Response Handler
```javascript
async handleGeminiStreamingResponse(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let content = '';
    let buffer = '';
    
    // ... UI setup ...
    
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
                    const chunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    
                    if (chunk) {
                        content += chunk;
                        // Update UI
                    }
                    
                    // Usage metadata
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
    
    return { content, rawResponse: /* ... */ };
}
```

#### 3.2 Non-Streaming Response Handler
```javascript
async handleGeminiNonStreamingResponse(response) {
    const data = await response.json();
    
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (data.usageMetadata) {
        this.stats.promptTokens = data.usageMetadata.promptTokenCount || 0;
        this.stats.completionTokens = data.usageMetadata.candidatesTokenCount || 0;
        this.stats.totalTokens = data.usageMetadata.totalTokenCount || 0;
    }
    
    return { content, rawResponse: data };
}
```

### Adım 4: index.html - UI Güncellemeleri

```html
<select class="form-select" id="provider-select">
    <option value="aetherapi" selected>AetherAPI</option>
    <option value="openai_compatible">OpenAI Compatible</option>
    <option value="anthropic_compatible">Anthropic Compatible</option>
    <option value="gemini_compatible">Gemini Compatible</option>
    <option value="openai">OpenAI</option>
    <option value="openrouter">OpenRouter</option>
    <option value="gemini">Gemini (OpenAI Compat)</option>
    <option value="vertex_ai">Google Vertex AI</option>
    <option value="anthropic">Anthropic</option>
    <!-- ... diğer provider'lar ... -->
</select>
```

### Adım 5: forms.js - Placeholder Güncellemesi

```javascript
updateBaseUrlVisibility(provider) {
    const baseUrlContainer = document.getElementById('base-url-container');
    const baseUrlInput = document.getElementById('base-url-input');
    
    const config = Providers.getConfig(provider);
    
    if (provider === 'openai_compatible' || 
        provider === 'anthropic_compatible' || 
        provider === 'gemini_compatible' ||
        provider === 'vertex_ai') {
        baseUrlContainer.classList.remove('hidden');
        baseUrlInput.placeholder = config.placeholder || 'https://api.example.com/v1';
    } else {
        baseUrlContainer.classList.add('hidden');
    }
}
```

## Dosya Değişiklikleri Özeti

| Dosya | Değişiklik Türü | Açıklama |
|-------|-----------------|----------|
| `js/api/providers.js` | Güncelleme | Yeni provider'lar, API format fonksiyonları, Gemini request builder |
| `js/api/text.js` | Güncelleme | Gemini streaming/non-streaming response handler'ları |
| `js/ui/forms.js` | Güncelleme | Base URL placeholder mantığı |
| `index.html` | Güncelleme | Provider dropdown'a yeni seçenekler |

## Akış Diyagramı

```mermaid
flowchart TD
    A[Kullanıcı Generate tıklar] --> B{Provider API Format?}
    
    B -->|openai| C[buildChatRequest]
    B -->|gemini| D[buildGeminiRequest]
    B -->|anthropic| E[buildAnthropicRequest]
    
    C --> F[OpenAI Endpoint: /chat/completions]
    D --> G{Streaming?}
    E --> H[Anthropic Endpoint: /messages]
    
    G -->|Yes| I[/models/model:streamGenerateContent?alt=sse]
    G -->|No| J[/models/model:generateContent]
    
    F --> K[handleStreamingResponse / handleNonStreamingResponse]
    I --> L[handleGeminiStreamingResponse]
    J --> M[handleGeminiNonStreamingResponse]
    H --> K
    
    K --> N[Display Result]
    L --> N
    M --> N
```

## Placeholder URL'ler

| Provider | Placeholder URL |
|----------|-----------------|
| OpenAI Compatible | `https://api.example.com/v1` |
| Anthropic Compatible | `https://api.anthropic.com/v1` |
| Gemini Compatible | `https://generativelanguage.googleapis.com/v1beta` |
| Google Vertex AI | `https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT/locations/us-central1/publishers/google` |

## Notlar

1. **Vertex AI Authentication**: Vertex AI, OAuth 2.0 access token gerektirir. Kullanıcılar `gcloud auth print-access-token` komutuyla token alabilir. Bu token'lar kısa ömürlüdür (1 saat).

2. **Gemini API Key**: Gemini Compatible için standart API key kullanılır, `x-goog-api-key` header'ı ile gönderilir.

3. **Streaming Format**: Gemini native API, `?alt=sse` query parametresi ile SSE formatında streaming destekler.

4. **Model Listesi**: Gemini native API için model listesi endpoint'i: `GET /v1beta/models`

5. **Mevcut Gemini Provider**: Mevcut `gemini` provider'ı OpenAI compatibility layer kullanmaya devam edecek. Yeni `gemini_compatible` provider'ı native format kullanacak.
