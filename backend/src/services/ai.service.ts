interface GroqMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export function isAiConfigured(): boolean {
  const apiKey = process.env.GROQ_API_KEY
  return Boolean(apiKey && apiKey !== 'gsk_your_key_here')
}

/** Strip markdown fences and parse a JSON payload from an LLM reply. Returns null if unparseable. */
export function parseJsonReply<T>(text: string): T | null {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const start = cleaned.search(/[[{]/)
  if (start === -1) return null
  try {
    return JSON.parse(cleaned.slice(start)) as T
  } catch {
    return null
  }
}

export async function callGroq(messages: GroqMessage[]): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!isAiConfigured()) {
    throw new Error('GROQ_API_KEY not configured')
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(20_000),
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Groq API error: ${response.status} - ${error}`)
  }

  const data = (await response.json()) as { choices: { message: { content: string } }[] }
  return data.choices[0]?.message?.content || 'No response from AI.'
}
