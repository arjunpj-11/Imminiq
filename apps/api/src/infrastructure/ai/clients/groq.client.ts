import Groq from 'groq-sdk';
import { env } from '../../../config/env';

export const groq = new Groq({ apiKey: env.GROQ_API_KEY });

export const groqChat = async (
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  model = 'llama-3.3-70b-versatile'
) => {
  const response = await groq.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    max_tokens: 2048,
  });

  return response.choices[0].message.content;
};
