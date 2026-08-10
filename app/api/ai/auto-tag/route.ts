import { createApiHandler, apiSuccess, apiError } from '@/lib/api/handler'
import { generateTextWithFailover } from '@/lib/ai/provider'
import { z } from 'zod'

const autoTagSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  imageUrls: z.array(z.string()).optional()
})

export const POST = createApiHandler({
  auth: 'admin',
  schema: autoTagSchema,
  handler: async ({ body }) => {
    try {
      const { title, description = '', imageUrls } = body

      const systemPrompt = `You are an expert e-commerce catalog taxonomist for a streetwear & apparel print-on-demand brand.
Output JSON format only:
{
  "suggested_tags": ["streetwear", "minimalist", ...],
  "suggested_category": "T-Shirts",
  "suggested_badges": {
    "is_bestseller": false,
    "is_trending": true,
    "is_new_arrival": true
  }
}`

      const userPrompt = `Product Title: ${title}
Product Description: ${description}`

      const aiResult = await generateTextWithFailover({
        systemPrompt,
        prompt: userPrompt,
        imageUrls: imageUrls && imageUrls.length > 0 ? imageUrls.slice(0, 1) : undefined,
        maxTokens: 700,
        temperature: 0.3,
        preferredProvider: 'gemini'
      })

      if (!aiResult.success) {
        return apiError('AI_ERROR', aiResult.error || 'Auto-tagging failed.', 502)
      }

      let text = aiResult.text || ''
      if (text.includes('```')) {
        const match = text.match(/```(?:json)?([\s\S]*?)```/)
        if (match && match[1]) text = match[1].trim()
      }

      const parsed = JSON.parse(text.trim())

      return apiSuccess({
        ...parsed,
        provider: aiResult.provider
      })

    } catch (err: any) {
      console.error('AI Auto-Tag Error:', err)
      return apiError('INTERNAL_ERROR', err.message || 'Auto-tagging failed.', 500)
    }
  }
})
