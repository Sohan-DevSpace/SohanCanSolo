import { generateTextWithFailover } from '@/lib/ai/provider'

export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OpenRouterCompletionOptions {
  model?: string
  messages: OpenRouterMessage[]
  temperature?: number
  max_tokens?: number
  preferredProvider?: 'gemini' | 'openrouter'
}

/**
 * Resilient AI Client with Dual Provider Failover:
 * Tries Gemini AI first. If Gemini fails, seamlessly switches to OpenRouter!
 */
export async function getOpenRouterCompletion(options: OpenRouterCompletionOptions) {
  const result = await generateTextWithFailover({
    messages: options.messages,
    maxTokens: options.max_tokens,
    temperature: options.temperature,
    preferredProvider: options.preferredProvider || 'gemini'
  })

  if (!result.success) {
    throw new Error(`AI Completion failed on all providers: ${result.error}`)
  }

  return {
    choices: [
      {
        message: {
          role: 'assistant',
          content: result.text
        }
      }
    ],
    providerUsed: result.provider
  }
}
