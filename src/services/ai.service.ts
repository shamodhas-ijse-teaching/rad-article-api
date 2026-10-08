import { GoogleGenAI } from "@google/genai"

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables")
}

const ai = new GoogleGenAI({ apiKey })

const MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-3.8-flash",
  "gemini-3.8-flash-lite"
]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const generateArticleDescription = async (
  title: string,
  content: string
): Promise<string> => {
  const contentExcerpt = content.substring(0, 4000)

  const prompt = `You are an elite academic peer-reviewer and lead technical editor. 
Compose a comprehensive, eloquently written research-paper-style Abstract and Executive Synopsis for the following technical publication.

Title: "${title}"
Source Material Excerpt:
"${contentExcerpt}"

Requirements:
1. Depth & Length: Provide a substantive overview (approximately 150–220 words).
2. Structure: 
   - State the core thesis and domain context.
   - Summarize the underlying technical concepts, architectural decisions, or methodologies discussed.
   - Conclude with the practical impact and takeaways for software engineers and researchers.
3. Tone: Sophisticated, authoritative, academic, and engaging.
4. Formatting: Return clean, contiguous prose without section labels.`

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: 0.6,
            maxOutputTokens: 800
          }
        })

        const text = response.text?.trim()
        if (text) return text
      } catch (error: any) {
        const statusCode = error?.status || error?.error?.code

        if (statusCode === 503 || statusCode === 429) {
          await delay(attempt * 1000)
          continue
        }

        break
      }
    }
  }

  return content.substring(0, 250).replace(/\n/g, " ") + "..."
}
