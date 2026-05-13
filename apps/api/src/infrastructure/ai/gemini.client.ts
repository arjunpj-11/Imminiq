import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '../../config/env'

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)

export const geminiChat = async (
  prompt: string,
  system?: string
) => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    // model: 'gemini-2.0-flash'
    systemInstruction: system,
  })

  const result = await model.generateContent(prompt)
  return result.response.text()
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
  const lastMessage = messages[messages.length - 1].content
  const result = await chat.sendMessage(lastMessage)
  return result.response.text()
}