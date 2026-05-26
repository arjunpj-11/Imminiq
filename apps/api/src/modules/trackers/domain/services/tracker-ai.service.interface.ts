import type { GeneratedLessonData } from '../types/lesson-practice.types'

export interface TrackerAIServiceContract {
  generateLesson(input: {
    trackerTitle: string
    topicTitle?: string
    subtopicTitle: string
    subtopicDescription: string
    level: 'beginner' | 'intermediate' | 'advanced'
  }): Promise<GeneratedLessonData>

  chatWithLessonTutor(input: {
    lessonTitle: string
    lessonContent: string
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
  }): Promise<string>

  generateLessonPracticeQuestions(input: {
    lessonTitle: string
    lessonSummary: string
    lessonExplanation: string
    count?: number
  }): Promise<{ questions: string[] }>

  generateLessonQuestionSolution(input: {
    lessonTitle: string
    lessonExplanation: string
    question: string
  }): Promise<string>

  chatWithLessonQuestionSolutionDoubt(input: {
    lessonTitle: string
    lessonExplanation: string
    question: string
    solution: string
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
  }): Promise<string>

  generateLessonVisualization(input: {
    title: string
    summary: string
    explanation: string
    lessonType: string
    tags: string[]
    difficulty: string
    codeExample?: unknown
  }): Promise<{
    html: string
    visualTitle: string
    visualDescription: string
  }>

  generateCodeHint(input: {
    lessonTitle: string
    practiceTitle: string
    practiceDescription: string
    expectedOutput: string
    sourceCode: string
    actualOutput?: string
    errorOutput?: string
    hintCount: number
  }): Promise<{
    mode: 'hint' | 'issue'
    title: string
    explanation: string
  }>

  generateOptimizedCodeSolution(input: {
    lessonTitle: string
    practiceTitle: string
    practiceDescription: string
    sourceCode: string
    language: string
  }): Promise<unknown>

  verifyNonCodingAnswer(input: {
    lessonTitle: string
    lessonExplanation: string
    question: string
    expectedAnswer: string
    userAnswer: string
  }): Promise<{
    verdict?: 'correct' | 'partially_correct' | 'incorrect'
    score?: number
    [key: string]: unknown
  }>

  verifyTrackerTopic(input: {
    trackerTitle: string
    topicTitle: string
    topicDescription: string
    existingTopics: Array<{ id: string; title: string; description: string }>
  }): Promise<unknown>

  verifyTrackerSubtopic(input: {
    trackerTitle: string
    topicTitle: string
    topicDescription: string
    subtopicTitle: string
    subtopicDescription: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    existingSubtopics: Array<{
      id: string
      title: string
      description: string
      difficulty: string
    }>
  }): Promise<unknown>
}
