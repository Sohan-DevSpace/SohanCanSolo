export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIOptions {
  systemPrompt?: string
  messages?: AIMessage[]
  prompt?: string
  imageUrls?: string[]
  maxTokens?: number
  temperature?: number
  preferredProvider?: 'gemini' | 'openrouter'
  model?: string
}

export interface AIResponse {
  success: boolean
  text: string
  provider: 'gemini' | 'openrouter' | 'fallback'
  error?: string
}

// 1. Call Gemini AI via Google Generative Language REST API (Multimodal / Vision Enabled)
async function callGemini(options: AIOptions): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set')
  }

  const modelCandidateList = [
    options.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash-latest',
    'gemini-2.0-flash-exp'
  ]

  // Remove duplicate entries
  const candidateModels = Array.from(new Set(modelCandidateList))

  const userParts: any[] = []

  // If image URLs provided, fetch and add base64 inline_data for visual recognition
  if (options.imageUrls && options.imageUrls.length > 0) {
    for (const url of options.imageUrls.slice(0, 2)) {
      try {
        const imgRes = await fetch(url)
        if (imgRes.ok) {
          const arrayBuffer = await imgRes.arrayBuffer()
          const base64Data = Buffer.from(arrayBuffer).toString('base64')
          const mimeType = imgRes.headers.get('content-type') || 'image/jpeg'
          userParts.push({
            inline_data: {
              mime_type: mimeType,
              data: base64Data
            }
          })
        }
      } catch (e) {
        console.warn(`[GEMINI VISION] Image fetch skipped for ${url}:`, e)
      }
    }
  }

  if (options.prompt) {
    userParts.push({ text: options.prompt })
  }

  const contents: any[] = []

  if (options.messages && options.messages.length > 0) {
    options.messages.forEach((msg) => {
      if (msg.role !== 'system') {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        })
      }
    })
  } else {
    contents.push({
      role: 'user',
      parts: userParts
    })
  }

  const systemText = options.systemPrompt || (options.messages?.find(m => m.role === 'system')?.content)

  const payload: any = {
    contents,
    generationConfig: {
      maxOutputTokens: Math.min(options.maxTokens || 1500, 2000),
      temperature: options.temperature ?? 0.7
    }
  }

  if (systemText) {
    payload.system_instruction = {
      parts: [{ text: systemText }]
    }
  }

  let lastError: Error | null = null

  for (const modelName of candidateModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`Gemini API HTTP ${response.status}: ${errorBody}`)
      }

      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) {
        throw new Error('Gemini API returned an empty response candidate')
      }

      return text
    } catch (err: any) {
      console.warn(`[GEMINI MODEL RETRY] Gemini model ${modelName} failed: ${err.message}. Retrying next Gemini model...`)
      lastError = err
    }
  }

  throw lastError || new Error('All Gemini candidate models failed')
}

// 2. Call OpenRouter AI via Chat Completions API
async function callOpenRouter(options: AIOptions): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set')
  }

  const endpoint = 'https://openrouter.ai/api/v1/chat/completions'
  const messagesToSend: any[] = []

  const systemText = options.systemPrompt || options.messages?.find(m => m.role === 'system')?.content
  if (systemText) {
    messagesToSend.push({ role: 'system', content: systemText })
  }

  const hasImages = options.imageUrls && options.imageUrls.length > 0

  if (options.messages && options.messages.length > 0) {
    options.messages.forEach((msg) => {
      if (msg.role !== 'system') {
        messagesToSend.push(msg)
      }
    })
  } else {
    const userContent: any[] = []
    if (hasImages && options.imageUrls) {
      options.imageUrls.slice(0, 2).forEach(url => {
        userContent.push({ type: 'image_url', image_url: { url } })
      })
    }
    userContent.push({ type: 'text', text: options.prompt || 'Describe the apparel item.' })
    messagesToSend.push({ role: 'user', content: userContent })
  }

  // Choose appropriate candidate models (Vision-capable if imageUrls are present)
  let candidateModels: string[] = []
  if (hasImages) {
    candidateModels = [
      'google/gemini-2.5-flash',
      'google/gemini-2.0-flash-001',
      'meta-llama/llama-3.2-11b-vision-instruct',
      'openrouter/auto'
    ]
  } else {
    candidateModels = (options.model && options.model !== 'openrouter/free') 
      ? [options.model, 'openrouter/auto', 'deepseek/deepseek-chat', 'meta-llama/llama-3.3-70b-instruct']
      : ['openrouter/auto', 'deepseek/deepseek-chat', 'meta-llama/llama-3.3-70b-instruct']
  }

  let lastError: Error | null = null

  for (const modelCandidate of candidateModels) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'Alpona Merch Studio',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelCandidate,
          messages: messagesToSend,
          max_tokens: Math.min(options.maxTokens || 1500, 1500),
          temperature: options.temperature ?? 0.7
        })
      })

      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`OpenRouter API [${modelCandidate}] HTTP ${response.status}: ${errorBody}`)
      }

      const data = await response.json()
      const text = data.choices?.[0]?.message?.content
      if (!text) {
        throw new Error(`OpenRouter API [${modelCandidate}] returned empty choices`)
      }

      return text
    } catch (err: any) {
      console.warn(`[OPENROUTER MODEL FAILOVER] Model ${modelCandidate} failed (${err.message}). Retrying next model...`)
      lastError = err
    }
  }

  throw lastError || new Error('All OpenRouter candidate models failed')
}

/**
 * Executes AI completion with automatic failover between Gemini AI and OpenRouter.
 * Supports image URLs for vision multimodal recognition!
 */
export async function generateTextWithFailover(options: AIOptions): Promise<AIResponse> {
  const primaryProvider = options.preferredProvider || 'gemini'

  if (primaryProvider === 'gemini') {
    try {

      const text = await callGemini(options)
      return { success: true, text, provider: 'gemini' }
    } catch (geminiError: any) {
      console.warn(`[AI ENGINE FAILOVER] Gemini AI failed (${geminiError.message}). Seamlessly failing over to OpenRouter AI...`)
      try {
        const text = await callOpenRouter(options)
        return { success: true, text, provider: 'openrouter' }
      } catch (openRouterError: any) {
        console.error(`[AI ENGINE CRITICAL] Both Gemini AI and OpenRouter AI failed! OpenRouter error: ${openRouterError.message}`)
        return {
          success: false,
          text: '',
          provider: 'fallback',
          error: `Gemini: ${geminiError.message} | OpenRouter: ${openRouterError.message}`
        }
      }
    }
  } else {
    try {

      const text = await callOpenRouter(options)
      return { success: true, text, provider: 'openrouter' }
    } catch (openRouterError: any) {
      console.warn(`[AI ENGINE FAILOVER] OpenRouter AI failed (${openRouterError.message}). Seamlessly failing over to Gemini AI...`)
      try {
        const text = await callGemini(options)
        return { success: true, text, provider: 'gemini' }
      } catch (geminiError: any) {
        console.error(`[AI ENGINE CRITICAL] Both OpenRouter AI and Gemini AI failed! Gemini error: ${geminiError.message}`)
        return {
          success: false,
          text: '',
          provider: 'fallback',
          error: `OpenRouter: ${openRouterError.message} | Gemini: ${geminiError.message}`
        }
      }
    }
  }
}

/**
 * Safely extracts and parses JSON payload from AI text responses,
 * handling markdown codeblocks and surrounding conversational text.
 */
export function parseAIJsonResponse<T = any>(text: string, defaultFallback: T): T {
  if (!text || typeof text !== 'string') return defaultFallback
  try {
    let cleaned = text.trim()

    // 1. Remove Markdown Code Block wrappers (```json ... ``` or ``` ...)
    if (cleaned.includes('```')) {
      cleaned = cleaned.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim()
    }

    // 2. Extract first valid JSON object ({...}) or array ([...]) if preamble text exists
    const jsonObjMatch = cleaned.match(/\{[\s\S]*\}/)
    const jsonArrMatch = cleaned.match(/\[[\s\S]*\]/)

    if (jsonObjMatch && (!jsonArrMatch || (jsonObjMatch.index ?? 0) <= (jsonArrMatch.index ?? 0))) {
      cleaned = jsonObjMatch[0]
    } else if (jsonArrMatch) {
      cleaned = jsonArrMatch[0]
    }

    return JSON.parse(cleaned) as T
  } catch (err) {
    console.warn('[AI PARSER] JSON parse failed, returning fallback. Raw Text:', text.slice(0, 100))
    return defaultFallback
  }
}
