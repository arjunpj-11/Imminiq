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
import { TrackerDomainError } from '../../domain/tracker-domain.error'
import type { ITrackerAIGateway } from '../../domain/services/tracker-ai.interface'

type GatewayReturn<T extends keyof ITrackerAIGateway> = Awaited<
  ReturnType<ITrackerAIGateway[T]>
>

export class AITrackerGateway implements ITrackerAIGateway {
  generateLesson(
    input: Parameters<ITrackerAIGateway['generateLesson']>[0],
  ): ReturnType<ITrackerAIGateway['generateLesson']> {
    return this.runGateway<GatewayReturn<'generateLesson'>>(
      () => generateLesson(input) as ReturnType<ITrackerAIGateway['generateLesson']>,
      'LESSON_GENERATION_FAILED',
    )
  }

  chatWithLessonTutor(
    input: Parameters<ITrackerAIGateway['chatWithLessonTutor']>[0],
  ): ReturnType<ITrackerAIGateway['chatWithLessonTutor']> {
    return this.runGateway<GatewayReturn<'chatWithLessonTutor'>>(
      () => chatWithLessonTutor(input) as ReturnType<ITrackerAIGateway['chatWithLessonTutor']>,
      'LESSON_CHAT_FAILED',
    )
  }

  generateLessonPracticeQuestions(
    input: Parameters<ITrackerAIGateway['generateLessonPracticeQuestions']>[0],
  ): ReturnType<ITrackerAIGateway['generateLessonPracticeQuestions']> {
    return this.runGateway<GatewayReturn<'generateLessonPracticeQuestions'>>(
      () => generateLessonPracticeQuestions(input) as ReturnType<ITrackerAIGateway['generateLessonPracticeQuestions']>,
      'LESSON_QUESTIONS_GENERATION_FAILED',
    )
  }

  generateLessonQuestionSolution(
    input: Parameters<ITrackerAIGateway['generateLessonQuestionSolution']>[0],
  ): ReturnType<ITrackerAIGateway['generateLessonQuestionSolution']> {
    return this.runGateway<GatewayReturn<'generateLessonQuestionSolution'>>(
      () => generateLessonQuestionSolution(input) as ReturnType<ITrackerAIGateway['generateLessonQuestionSolution']>,
      'QUESTION_SOLUTION_GENERATION_FAILED',
    )
  }

  chatWithLessonQuestionSolutionDoubt(
    input: Parameters<ITrackerAIGateway['chatWithLessonQuestionSolutionDoubt']>[0],
  ): ReturnType<ITrackerAIGateway['chatWithLessonQuestionSolutionDoubt']> {
    return this.runGateway<GatewayReturn<'chatWithLessonQuestionSolutionDoubt'>>(
      () => chatWithLessonQuestionSolutionDoubt(input) as ReturnType<ITrackerAIGateway['chatWithLessonQuestionSolutionDoubt']>,
      'QUESTION_SOLUTION_CHAT_FAILED',
    )
  }

  generateLessonVisualization(
    input: Parameters<ITrackerAIGateway['generateLessonVisualization']>[0],
  ): ReturnType<ITrackerAIGateway['generateLessonVisualization']> {
    return this.runGateway<GatewayReturn<'generateLessonVisualization'>>(
      () => generateLessonVisualization(input) as ReturnType<ITrackerAIGateway['generateLessonVisualization']>,
      'LESSON_VISUALIZATION_GENERATION_FAILED',
    )
  }

  generateCodeHint(
    input: Parameters<ITrackerAIGateway['generateCodeHint']>[0],
  ): ReturnType<ITrackerAIGateway['generateCodeHint']> {
    return this.runGateway<GatewayReturn<'generateCodeHint'>>(
      () => generateCodeHint(input) as ReturnType<ITrackerAIGateway['generateCodeHint']>,
      'CODE_HINT_GENERATION_FAILED',
    )
  }

  generateOptimizedCodeSolution(
    input: Parameters<ITrackerAIGateway['generateOptimizedCodeSolution']>[0],
  ): ReturnType<ITrackerAIGateway['generateOptimizedCodeSolution']> {
    return this.runGateway<GatewayReturn<'generateOptimizedCodeSolution'>>(
      () => generateOptimizedCodeSolution(input) as ReturnType<ITrackerAIGateway['generateOptimizedCodeSolution']>,
      'OPTIMIZED_CODE_GENERATION_FAILED',
    )
  }

  verifyNonCodingAnswer(
    input: Parameters<ITrackerAIGateway['verifyNonCodingAnswer']>[0],
  ): ReturnType<ITrackerAIGateway['verifyNonCodingAnswer']> {
    return this.runGateway<GatewayReturn<'verifyNonCodingAnswer'>>(
      () => verifyNonCodingAnswer(input) as ReturnType<ITrackerAIGateway['verifyNonCodingAnswer']>,
      'LESSON_ANSWER_VERIFICATION_FAILED',
    )
  }

  verifyTrackerTopic(
    input: Parameters<ITrackerAIGateway['verifyTrackerTopic']>[0],
  ): ReturnType<ITrackerAIGateway['verifyTrackerTopic']> {
    return this.runGateway<GatewayReturn<'verifyTrackerTopic'>>(
      () => verifyTrackerTopic(input) as ReturnType<ITrackerAIGateway['verifyTrackerTopic']>,
      'TOPIC_VERIFICATION_FAILED',
    )
  }

  verifyTrackerSubtopic(
    input: Parameters<ITrackerAIGateway['verifyTrackerSubtopic']>[0],
  ): ReturnType<ITrackerAIGateway['verifyTrackerSubtopic']> {
    return this.runGateway<GatewayReturn<'verifyTrackerSubtopic'>>(
      () => verifyTrackerSubtopic(input) as ReturnType<ITrackerAIGateway['verifyTrackerSubtopic']>,
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
