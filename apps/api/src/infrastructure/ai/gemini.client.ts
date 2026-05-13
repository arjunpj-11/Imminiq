import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '../../config/env'

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)

type GeminiModel =
  | 'gemini-2.5-flash'
  | 'gemini-2.5-flash-lite'
  | 'gemini-3.1-flash-lite'

export const geminiChatWithModel = async (
  modelName: GeminiModel,
  prompt: string,
  system?: string
) => {
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: system,
  })

  const result = await model.generateContent(prompt)

  return result.response.text()
}

export const geminiChat = async (
  prompt: string,
  system?: string
) => {
  return geminiChatWithModel(
    'gemini-2.5-flash',
    prompt,
    system
  )
}

export const geminiFlashLiteChat = async (
  prompt: string,
  system?: string
) => {
  return geminiChatWithModel(
    'gemini-2.5-flash-lite',
    prompt,
    system
  )
}

export const gemini31FlashLiteChat = async (
  prompt: string,
  system?: string
) => {
  return geminiChatWithModel(
    'gemini-3.1-flash-lite',
    prompt,
    system
  )
}

export const geminiChatWithHistory = async (
  messages: { role: 'user' | 'model'; content: string }[],
  system?: string
) => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: system,
  })

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }))

  const chat = model.startChat({ history })

  const lastMessage =
    messages[messages.length - 1].content

  const result =
    await chat.sendMessage(lastMessage)

  return result.response.text()
}