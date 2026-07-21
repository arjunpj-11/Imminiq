import type { MockTestAttemptEntity } from '../../domain/entities/mock-test-attempt.entity';
import { MockTestQuestionEntity } from '../../domain/entities/mock-test-question.entity';

export interface IAttemptQuestionSnapshotService {
  all(
    attempt: MockTestAttemptEntity,
    liveQuestions?: MockTestQuestionEntity[]
  ): MockTestQuestionEntity[];
  find(
    attempt: MockTestAttemptEntity,
    questionId: string,
    liveQuestion?: MockTestQuestionEntity | null
  ): MockTestQuestionEntity | null;
}

export class AttemptQuestionSnapshotService implements IAttemptQuestionSnapshotService {
  all(attempt: MockTestAttemptEntity, liveQuestions: MockTestQuestionEntity[] = []) {
    if (!attempt.questionSnapshot.length) return liveQuestions;
    return attempt.questionSnapshot
      .map((snapshot) => new MockTestQuestionEntity(snapshot))
      .sort((left, right) => left.order - right.order);
  }

  find(
    attempt: MockTestAttemptEntity,
    questionId: string,
    liveQuestion?: MockTestQuestionEntity | null
  ) {
    const snapshot = attempt.questionSnapshot.find((question) => question._id === questionId);
    if (snapshot) return new MockTestQuestionEntity(snapshot);
    return liveQuestion ?? null;
  }
}
