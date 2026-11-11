import OpenAI from 'openai'

// Unified AI client — works with NVIDIA NIM and OpenAI
// Swap provider by changing env vars only, zero code changes
const apiKey = process.env.AI_API_KEY || 'dummy-key-for-init'
const baseURL = process.env.AI_BASE_URL || 'https://integrate.api.nvidia.com/v1'

export const ai = new OpenAI({
  apiKey,
  baseURL,
})

export const MODEL = process.env.AI_MODEL || 'meta/llama-3.1-70b-instruct'

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// ─── Generic Chat Completion ──────────────────────────────────

export async function chat(
  messages: ChatMessage[],
  options?: {
    temperature?: number
    maxTokens?: number
  }
): Promise<string> {
  if (!process.env.AI_API_KEY) {
    return 'AI Service: Please configure AI_API_KEY in your .env file to enable intelligent responses.'
  }

  try {
    const response = await ai.chat.completions.create({
      model: MODEL,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1024,
    })
    return response.choices[0]?.message?.content ?? ''
  } catch (error: unknown) {
    console.error('AI Error:', error)
    return 'AI service is temporarily unavailable. Please try again shortly.'
  }
}

// ─── Customer Support Chat ────────────────────────────────────

export async function supportChat(
  userMessage: string,
  context: { orderInfo?: string; productInfo?: string }
): Promise<string> {
  const systemPrompt = `You are WhatsyMart's friendly AI customer support assistant.
You help customers with orders, products, and marketplace inquiries.
Be concise, polite, and helpful.
${context.orderInfo ? `\nOrder context: ${context.orderInfo}` : ''}
${context.productInfo ? `\nProduct context: ${context.productInfo}` : ''}
If you cannot resolve the inquiry directly, advise the customer that a human Customer Support agent will assist them.`

  return chat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    { temperature: 0.5, maxTokens: 512 }
  )
}

// ─── Product Description Generator ───────────────────────────

export async function generateProductDescription(
  productName: string,
  category: string,
  tags: string[]
): Promise<string> {
  return chat(
    [
      {
        role: 'system',
        content:
          'You are an e-commerce copywriter. Write compelling, SEO-friendly product descriptions under 120 words. Highlight quality, features, and utility.',
      },
      {
        role: 'user',
        content: `Product: ${productName}\nCategory: ${category}\nTags: ${tags.join(', ')}\n\nWrite product description:`,
      },
    ],
    { temperature: 0.8, maxTokens: 200 }
  )
}

// ─── Complaint Auto-Triage ────────────────────────────────────

export async function triageComplaint(description: string): Promise<{
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  suggestedCategory: string
  summary: string
}> {
  if (!process.env.AI_API_KEY) {
    return { priority: 'NORMAL', suggestedCategory: 'other', summary: description.slice(0, 100) }
  }

  const result = await chat(
    [
      {
        role: 'system',
        content: `You are a marketplace complaint triage assistant. Analyze the complaint and return valid JSON with:
- "priority": "LOW" | "NORMAL" | "HIGH" | "URGENT"
- "suggestedCategory": "fraud" | "counterfeit" | "harassment" | "wrong_item" | "prohibited" | "other"
- "summary": one-sentence concise summary
Return ONLY valid JSON.`,
      },
      { role: 'user', content: description },
    ],
    { temperature: 0.2, maxTokens: 150 }
  )

  try {
    return JSON.parse(result)
  } catch {
    return { priority: 'NORMAL', suggestedCategory: 'other', summary: description.slice(0, 100) }
  }
}
