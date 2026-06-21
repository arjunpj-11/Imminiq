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
import type { TrackerAIServiceContract } from '../../domain/services/tracker-ai.service.interface'

type GatewayReturn<T extends keyof TrackerAIServiceContract> = Awaited<
  ReturnType<TrackerAIServiceContract[T]>
>

export class AiTrackerGateway implements TrackerAIServiceContract {
  generateLesson(
    input: Parameters<TrackerAIServiceContract['generateLesson']>[0],
  ): ReturnType<TrackerAIServiceContract['generateLesson']> {
    return this.runGateway<GatewayReturn<'generateLesson'>>(
      () => generateLesson(input) as ReturnType<TrackerAIServiceContract['generateLesson']>,
      'LESSON_GENERATION_FAILED',
    )
  }

  chatWithLessonTutor(
    input: Parameters<TrackerAIServiceContract['chatWithLessonTutor']>[0],
  ): ReturnType<TrackerAIServiceContract['chatWithLessonTutor']> {
    return this.runGateway<GatewayReturn<'chatWithLessonTutor'>>(
      () => chatWithLessonTutor(input) as ReturnType<TrackerAIServiceContract['chatWithLessonTutor']>,
      'LESSON_CHAT_FAILED',
    )
  }

  generateLessonPracticeQuestions(
    input: Parameters<TrackerAIServiceContract['generateLessonPracticeQuestions']>[0],
  ): ReturnType<TrackerAIServiceContract['generateLessonPracticeQuestions']> {
    return this.runGateway<GatewayReturn<'generateLessonPracticeQuestions'>>(
      () => generateLessonPracticeQuestions(input) as ReturnType<TrackerAIServiceContract['generateLessonPracticeQuestions']>,
      'LESSON_QUESTIONS_GENERATION_FAILED',
    )
  }

  generateLessonQuestionSolution(
    input: Parameters<TrackerAIServiceContract['generateLessonQuestionSolution']>[0],
  ): ReturnType<TrackerAIServiceContract['generateLessonQuestionSolution']> {
    return this.runGateway<GatewayReturn<'generateLessonQuestionSolution'>>(
      () => generateLessonQuestionSolution(input) as ReturnType<TrackerAIServiceContract['generateLessonQuestionSolution']>,
      'QUESTION_SOLUTION_GENERATION_FAILED',
    )
  }

  chatWithLessonQuestionSolutionDoubt(
    input: Parameters<TrackerAIServiceContract['chatWithLessonQuestionSolutionDoubt']>[0],
  ): ReturnType<TrackerAIServiceContract['chatWithLessonQuestionSolutionDoubt']> {
    return this.runGateway<GatewayReturn<'chatWithLessonQuestionSolutionDoubt'>>(
      () => chatWithLessonQuestionSolutionDoubt(input) as ReturnType<TrackerAIServiceContract['chatWithLessonQuestionSolutionDoubt']>,
      'QUESTION_SOLUTION_CHAT_FAILED',
    )
  }

  generateLessonVisualization(
    input: Parameters<TrackerAIServiceContract['generateLessonVisualization']>[0],
  ): ReturnType<TrackerAIServiceContract['generateLessonVisualization']> {
    return this.runGateway<GatewayReturn<'generateLessonVisualization'>>(
      () => generateLessonVisualization(input) as ReturnType<TrackerAIServiceContract['generateLessonVisualization']>,
      'LESSON_VISUALIZATION_GENERATION_FAILED',
    )
  }

  generateCodeHint(
    input: Parameters<TrackerAIServiceContract['generateCodeHint']>[0],
  ): ReturnType<TrackerAIServiceContract['generateCodeHint']> {
    return this.runGateway<GatewayReturn<'generateCodeHint'>>(
      () => generateCodeHint(input) as ReturnType<TrackerAIServiceContract['generateCodeHint']>,
      'CODE_HINT_GENERATION_FAILED',
    )
  }

  generateOptimizedCodeSolution(
    input: Parameters<TrackerAIServiceContract['generateOptimizedCodeSolution']>[0],
  ): ReturnType<TrackerAIServiceContract['generateOptimizedCodeSolution']> {
    return this.runGateway<GatewayReturn<'generateOptimizedCodeSolution'>>(
      () => generateOptimizedCodeSolution(input) as ReturnType<TrackerAIServiceContract['generateOptimizedCodeSolution']>,
      'OPTIMIZED_CODE_GENERATION_FAILED',
    )
  }

  verifyNonCodingAnswer(
    input: Parameters<TrackerAIServiceContract['verifyNonCodingAnswer']>[0],
  ): ReturnType<TrackerAIServiceContract['verifyNonCodingAnswer']> {
    return this.runGateway<GatewayReturn<'verifyNonCodingAnswer'>>(
      () => verifyNonCodingAnswer(input) as ReturnType<TrackerAIServiceContract['verifyNonCodingAnswer']>,
      'LESSON_ANSWER_VERIFICATION_FAILED',
    )
  }

  verifyTrackerTopic(
    input: Parameters<TrackerAIServiceContract['verifyTrackerTopic']>[0],
  ): ReturnType<TrackerAIServiceContract['verifyTrackerTopic']> {
    return this.runGateway<GatewayReturn<'verifyTrackerTopic'>>(
      () => verifyTrackerTopic(input) as ReturnType<TrackerAIServiceContract['verifyTrackerTopic']>,
      'TOPIC_VERIFICATION_FAILED',
    )
  }

  verifyTrackerSubtopic(
    input: Parameters<TrackerAIServiceContract['verifyTrackerSubtopic']>[0],
  ): ReturnType<TrackerAIServiceContract['verifyTrackerSubtopic']> {
    return this.runGateway<GatewayReturn<'verifyTrackerSubtopic'>>(
      () => verifyTrackerSubtopic(input) as ReturnType<TrackerAIServiceContract['verifyTrackerSubtopic']>,
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

export const aiTrackerGateway = new AiTrackerGateway()
