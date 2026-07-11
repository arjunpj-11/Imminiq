import {
  chatWithLessonQuestionSolutionDoubt,
  chatWithLessonTutor,
  generateCodeHint,
  generateLesson,
  generateLessonPracticeQuestions,
  generateLessonQuestionSolution,
  generateLessonVisualization,
  generateOptimizedCodeSolution,
  verifyNonCodingAnswer,
  verifyTrackerSubtopic,
  verifyTrackerTopic,
} from '../../../../infrastructure/ai/ai.service'
import { TrackerDomainError } from '../../domain/errors/tracker-domain.error'
import type { TrackerAIGatewayContract } from '../../domain/services/tracker-ai.interface'

type GatewayReturn<T extends keyof TrackerAIGatewayContract> = Awaited<
  ReturnType<TrackerAIGatewayContract[T]>
>

export class AITrackerGateway implements TrackerAIGatewayContract {
  generateLesson(
    input: Parameters<TrackerAIGatewayContract['generateLesson']>[0],
  ): ReturnType<TrackerAIGatewayContract['generateLesson']> {
    return this.runGateway<GatewayReturn<'generateLesson'>>(
      () => generateLesson(input) as ReturnType<TrackerAIGatewayContract['generateLesson']>,
      'LESSON_GENERATION_FAILED',
    )
  }

  chatWithLessonTutor(
    input: Parameters<TrackerAIGatewayContract['chatWithLessonTutor']>[0],
  ): ReturnType<TrackerAIGatewayContract['chatWithLessonTutor']> {
    return this.runGateway<GatewayReturn<'chatWithLessonTutor'>>(
      () => chatWithLessonTutor(input) as ReturnType<TrackerAIGatewayContract['chatWithLessonTutor']>,
      'LESSON_CHAT_FAILED',
    )
  }

  generateLessonPracticeQuestions(
    input: Parameters<TrackerAIGatewayContract['generateLessonPracticeQuestions']>[0],
  ): ReturnType<TrackerAIGatewayContract['generateLessonPracticeQuestions']> {
    return this.runGateway<GatewayReturn<'generateLessonPracticeQuestions'>>(
      () => generateLessonPracticeQuestions(input) as ReturnType<TrackerAIGatewayContract['generateLessonPracticeQuestions']>,
      'LESSON_QUESTIONS_GENERATION_FAILED',
    )
  }

  generateLessonQuestionSolution(
    input: Parameters<TrackerAIGatewayContract['generateLessonQuestionSolution']>[0],
  ): ReturnType<TrackerAIGatewayContract['generateLessonQuestionSolution']> {
    return this.runGateway<GatewayReturn<'generateLessonQuestionSolution'>>(
      () => generateLessonQuestionSolution(input) as ReturnType<TrackerAIGatewayContract['generateLessonQuestionSolution']>,
      'QUESTION_SOLUTION_GENERATION_FAILED',
    )
  }

  chatWithLessonQuestionSolutionDoubt(
    input: Parameters<TrackerAIGatewayContract['chatWithLessonQuestionSolutionDoubt']>[0],
  ): ReturnType<TrackerAIGatewayContract['chatWithLessonQuestionSolutionDoubt']> {
    return this.runGateway<GatewayReturn<'chatWithLessonQuestionSolutionDoubt'>>(
      () => chatWithLessonQuestionSolutionDoubt(input) as ReturnType<TrackerAIGatewayContract['chatWithLessonQuestionSolutionDoubt']>,
      'QUESTION_SOLUTION_CHAT_FAILED',
    )
  }

  generateLessonVisualization(
    input: Parameters<TrackerAIGatewayContract['generateLessonVisualization']>[0],
  ): ReturnType<TrackerAIGatewayContract['generateLessonVisualization']> {
    return this.runGateway<GatewayReturn<'generateLessonVisualization'>>(
      () => generateLessonVisualization(input) as ReturnType<TrackerAIGatewayContract['generateLessonVisualization']>,
      'LESSON_VISUALIZATION_GENERATION_FAILED',
    )
  }

  generateCodeHint(
    input: Parameters<TrackerAIGatewayContract['generateCodeHint']>[0],
  ): ReturnType<TrackerAIGatewayContract['generateCodeHint']> {
    return this.runGateway<GatewayReturn<'generateCodeHint'>>(
      () => generateCodeHint(input) as ReturnType<TrackerAIGatewayContract['generateCodeHint']>,
      'CODE_HINT_GENERATION_FAILED',
    )
  }

  generateOptimizedCodeSolution(
    input: Parameters<TrackerAIGatewayContract['generateOptimizedCodeSolution']>[0],
  ): ReturnType<TrackerAIGatewayContract['generateOptimizedCodeSolution']> {
    return this.runGateway<GatewayReturn<'generateOptimizedCodeSolution'>>(
      () => generateOptimizedCodeSolution(input) as ReturnType<TrackerAIGatewayContract['generateOptimizedCodeSolution']>,
      'OPTIMIZED_CODE_GENERATION_FAILED',
    )
  }

  verifyNonCodingAnswer(
    input: Parameters<TrackerAIGatewayContract['verifyNonCodingAnswer']>[0],
  ): ReturnType<TrackerAIGatewayContract['verifyNonCodingAnswer']> {
    return this.runGateway<GatewayReturn<'verifyNonCodingAnswer'>>(
      () => verifyNonCodingAnswer(input) as ReturnType<TrackerAIGatewayContract['verifyNonCodingAnswer']>,
      'LESSON_ANSWER_VERIFICATION_FAILED',
    )
  }

  verifyTrackerTopic(
    input: Parameters<TrackerAIGatewayContract['verifyTrackerTopic']>[0],
  ): ReturnType<TrackerAIGatewayContract['verifyTrackerTopic']> {
    return this.runGateway<GatewayReturn<'verifyTrackerTopic'>>(
      () => verifyTrackerTopic(input) as ReturnType<TrackerAIGatewayContract['verifyTrackerTopic']>,
      'TOPIC_VERIFICATION_FAILED',
    )
  }

  verifyTrackerSubtopic(
    input: Parameters<TrackerAIGatewayContract['verifyTrackerSubtopic']>[0],
  ): ReturnType<TrackerAIGatewayContract['verifyTrackerSubtopic']> {
    return this.runGateway<GatewayReturn<'verifyTrackerSubtopic'>>(
      () => verifyTrackerSubtopic(input) as ReturnType<TrackerAIGatewayContract['verifyTrackerSubtopic']>,
      'SUBTOPIC_VERIFICATION_FAILED',
    )
  }

  private async runGateway<T>(
    operation: () => Promise<T>,
    code: string,
  ): Promise<T> {
    try {
      return await operation()
    } catch {
      throw new TrackerDomainError(code, 'Tracker AI gateway failed')
    }
  }
}

export const aiTrackerGateway = new AITrackerGateway()
