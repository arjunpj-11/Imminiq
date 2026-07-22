import type { IMockTestRepository } from '../../domain/repositories/mock-test.repository.interface';
import type { IMockTestQuestionRepository } from '../../domain/repositories/mock-test-question.repository.interface';
import type { IMockTestActivityRecorder } from '../../domain/services/mock-test-activity.interface';
import type { IMockTestsMapper } from '../mock-tests.mapper';
import type { IMockTestAIGateway } from '../../domain/services/mock-test-ai.interface';
import type {
  IMockTestQuestionBank,
  QuestionBankItem,
} from '../../domain/services/mock-test-question-bank.interface';
import type { GenerateMockTestPayloadDTO, MockTestDTO } from '../mock-tests.dto';
import { MockTestsApplicationError } from '../mock-tests-application.error';
import type { QuestionType } from '../../domain/value-objects/question-type.vo';

type GenerateMockTestRepository = IMockTestRepository & IMockTestQuestionRepository;

export interface IGenerateMockTestUseCase {
  execute(userId: string, payload: GenerateMockTestPayloadDTO): Promise<MockTestDTO>;
}

export class GenerateMockTestUseCase implements IGenerateMockTestUseCase {
  constructor(
    private readonly _repository: GenerateMockTestRepository,

    private readonly _aiGateway: IMockTestAIGateway,

    private readonly _questionBank: IMockTestQuestionBank,

    private readonly _activityRecorder: IMockTestActivityRecorder,
    private readonly _mapper: IMockTestsMapper
  ) {}

  async execute(userId: string, payload: GenerateMockTestPayloadDTO): Promise<MockTestDTO> {
    const topic = payload.topic?.trim();

    if (!topic || topic.length < 2) {
      throw MockTestsApplicationError.validation('Topic is required');
    }

    const difficulty = payload.difficulty || 'medium';

    const questionCount = payload.questionCount || 10;
    const questionTypes: QuestionType[] = payload.questionTypes?.length
      ? payload.questionTypes
      : ['mcq'];

    const isAIGenerated = this._questionBank.shouldUseAI();

    let questions: QuestionBankItem[];
    let title: string;
    let description: string;

    if (isAIGenerated) {
      const generated = await this._aiGateway.generateQuestions({
        topic,
        difficulty,
        questionCount,

        questionTypes,
      });

      if (!generated.questions?.length) {
        throw MockTestsApplicationError.aiGenerationFailed();
      }

      questions = await this._questionBank.saveToQuestionBank(topic, generated.questions);

      title = generated.title || `${topic} Mock Test`;

      description = generated.description || `Practice test for ${topic}`;
    } else {
      questions = await this._questionBank.sampleFromQuestionBank(
        topic,
        questionCount,
        difficulty,
        questionTypes
      );

      if (!questions.length) {
        throw MockTestsApplicationError.noQuestionsAvailable(topic);
      }

      title = `${topic} Mock Test`;
      description = `Practice test for ${topic}`;
    }

    const test = await this._repository.createTest({
      ownerId: userId,
      title,
      description,
      difficulty,

      timeLimitMinutes: payload.timeLimitMinutes || 30,

      passingScore: payload.passingScore || 60,

      questionCount: questions.length,
      tags: [topic],
      trackerId: payload.trackerId,
      isAIGenerated,
    });

    await this._repository.createQuestions(
      questions.map((question, index) => ({
        bankId: question.bankId,
        testId: test._id,
        type: question.type,
        question: question.question,
        options: question.options,

        correctAnswer: question.correctAnswer,

        explanation: question.explanation,

        difficulty: question.difficulty,

        order: index + 1,
        points: question.points,
        coding: question.coding,
      }))
    );

    /*
     * Record activity only after both the test and its
     * questions have been stored successfully.
     *
     * The event key is based on the created test ID, so the
     * same test cannot produce duplicate activity.
     */
    await this._activityRecorder.recordMockTestGenerated({
      userId,
      mockTestId: test._id,

      ...(test.trackerId
        ? {
            trackerId: test.trackerId,
          }
        : {}),

      testTitle: test.title,
      difficulty: test.difficulty,
      totalQuestions: test.questionCount,
    });

    return this._mapper.toMockTest(test);
  }
}
