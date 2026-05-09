import { geminiChat } from './gemini.client'
import { groqChat } from './groq.client'

// ============================================
// GEMINI 2.0 FLASH — complex generation tasks
// ============================================

export const generateRoadmap = (goal: string, level: string) =>
  geminiChat(
    `Generate a detailed learning roadmap for ${goal} at ${level} level`,
    'You are an expert learning path designer.'
  )

export const generateLesson = (topic: string) =>
  geminiChat(
    `Generate a detailed lesson for: ${topic}`,
    'You are an expert educator.'
  )

export const evaluateRoadmap = (roadmap: string) =>
  geminiChat(
    `Evaluate this roadmap for completeness and accuracy: ${roadmap}`,
    'You are a curriculum quality reviewer.'
  )

export const detectMissingTopics = (roadmap: string, targetRole: string) =>
  geminiChat(
    `Compare this roadmap against ${targetRole} requirements and list missing topics: ${roadmap}`,
    'You are a curriculum gap analyst.'
  )

export const analyzeTestPerformance = (results: string) =>
  geminiChat(
    `Analyze this test performance and identify weak areas: ${results}`,
    'You are a learning analytics expert.'
  )

export const generateDashboardInsights = (userData: string) =>
  geminiChat(
    `Generate personalized learning insights for this user: ${userData}`,
    'You are a personalized learning coach.'
  )

// ============================================
// GROQ LLAMA 3.3 70B — conversational tasks
// ============================================

export const chatWithTutor = (
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[]
) => groqChat(messages, 'llama-3.3-70b-versatile')

export const explainTopic = (topic: string) =>
  groqChat([
    { role: 'user', content: `Explain this topic clearly with examples: ${topic}` }
  ], 'llama-3.3-70b-versatile')

export const explainELI5 = (topic: string) =>
  groqChat([
    { role: 'user', content: `Explain this like I am 5 years old: ${topic}` }
  ], 'llama-3.3-70b-versatile')

export const generateMockQuestions = (topic: string, count: number) =>
  groqChat([
    { role: 'user', content: `Generate ${count} MCQ questions for: ${topic}. Return as JSON array.` }
  ], 'llama-3.3-70b-versatile')

export const reviewCode = (code: string, language: string) =>
  groqChat([
    { role: 'user', content: `Review this ${language} code and suggest improvements: ${code}` }
  ], 'llama-3.3-70b-versatile')

export const optimizeCode = (code: string, language: string) =>
  groqChat([
    { role: 'user', content: `Optimize this ${language} code: ${code}` }
  ], 'llama-3.3-70b-versatile')

export const simplifyLesson = (content: string) =>
  groqChat([
    { role: 'user', content: `Simplify this lesson in plain simple English: ${content}` }
  ], 'llama-3.3-70b-versatile')

export const generateCodeExample = (topic: string, language: string) =>
  groqChat([
    { role: 'user', content: `Generate a clear code example for ${topic} in ${language}` }
  ], 'llama-3.3-70b-versatile')

// ============================================
// GROQ LLAMA 3.1 8B — fast simple tasks
// ============================================

export const quickSummary = (content: string) =>
  groqChat([
    { role: 'user', content: `Summarize this in 2-3 sentences: ${content}` }
  ], 'llama-3.1-8b-instant')

export const generateTopicTags = (content: string) =>
  groqChat([
    { role: 'user', content: `Extract 5 relevant tags from this content as JSON array: ${content}` }
  ], 'llama-3.1-8b-instant')