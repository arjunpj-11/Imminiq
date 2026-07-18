import type {
  ITrackerClanChallengeNotifier,
  ITrackerClanChallengeQuestionGenerator,
  ITrackerClanChallengeRepository,
  TrackerClanChallenge,
} from '../../domain';
import { TrackerApplicationError } from '../tracker-application.error';

export interface ITrackerClanChallengeUseCase {
  list(input: { trackerId: string; userId: string }): Promise<TrackerClanChallenge[]>;
  create(input: {
    trackerId: string;
    userId: string;
    opponentId?: string;
    durationMinutes: number;
    questionCount: number;
  }): Promise<TrackerClanChallenge>;
  accept(input: { trackerId: string; challengeId: string; userId: string }): Promise<TrackerClanChallenge>;
  decline(input: { trackerId: string; challengeId: string; userId: string }): Promise<TrackerClanChallenge>;
  cancel(input: { trackerId: string; challengeId: string; userId: string }): Promise<TrackerClanChallenge>;
  submit(input: {
    trackerId: string;
    challengeId: string;
    userId: string;
    answers: Array<{ questionId: string; answer: string }>;
  }): Promise<TrackerClanChallenge>;
  chooseCheckpoint(input: { trackerId: string; challengeId: string; userId: string; decision: 'attempt' | 'skip' }): Promise<TrackerClanChallenge>;
  answerNode(input: { trackerId: string; challengeId: string; userId: string; answer: string }): Promise<TrackerClanChallenge>;
  usePower(input: { trackerId: string; challengeId: string; userId: string }): Promise<TrackerClanChallenge>;
}

export class TrackerClanChallengeUseCase implements ITrackerClanChallengeUseCase {
  constructor(
    private readonly clans: ITrackerClanChallengeRepository,
    private readonly questionGenerator: ITrackerClanChallengeQuestionGenerator,
    private readonly notifier: ITrackerClanChallengeNotifier
  ) {}

  async list(input: { trackerId: string; userId: string }) {
    const challenges = await this.clans.listChallenges(input);
    if (!challenges) throw TrackerApplicationError.forbidden('Join this guild to view battles');
    return challenges;
  }

  async create(input: {
    trackerId: string;
    userId: string;
    opponentId?: string;
    durationMinutes: number;
    questionCount: number;
  }) {
    const context = await this.clans.getChallengeQuestionContext({
      trackerId: input.trackerId,
      challengerId: input.userId,
      opponentId: input.opponentId,
    });
    if (!context) {
      throw TrackerApplicationError.forbidden(
        'A guild challenge needs eligible members and at least one roadmap topic'
      );
    }
    const questions = await this.questionGenerator.generate({
      context,
      questionCount: input.questionCount,
      durationMinutes: input.durationMinutes,
    });
    const challenge = await this.clans.createChallenge({
      trackerId: input.trackerId,
      challengerId: input.userId,
      opponentId: input.opponentId,
      durationMinutes: input.durationMinutes,
      questionCount: input.questionCount,
      questions,
    });
    return this.announce(
      input.trackerId,
      challenge,
      'A guild challenge needs eligible members and at least one roadmap topic'
    );
  }

  async accept(input: { trackerId: string; challengeId: string; userId: string }) {
    return this.announce(
      input.trackerId,
      await this.clans.acceptChallenge(input),
      'This challenge is no longer available to accept'
    );
  }

  async decline(input: { trackerId: string; challengeId: string; userId: string }) {
    return this.announce(
      input.trackerId,
      await this.clans.declineChallenge(input),
      'Only the directly challenged member can decline this battle'
    );
  }

  async cancel(input: { trackerId: string; challengeId: string; userId: string }) {
    return this.announce(
      input.trackerId,
      await this.clans.cancelChallenge(input),
      'Only the challenger can cancel an unaccepted battle'
    );
  }

  async submit(input: {
    trackerId: string;
    challengeId: string;
    userId: string;
    answers: Array<{ questionId: string; answer: string }>;
  }) {
    return this.announce(
      input.trackerId,
      await this.clans.submitChallenge(input),
      'This battle cannot accept your submission'
    );
  }

  async chooseCheckpoint(input: { trackerId: string; challengeId: string; userId: string; decision: 'attempt' | 'skip' }) {
    return this.announce(input.trackerId, await this.clans.chooseChallengeCheckpoint(input), 'This checkpoint decision is no longer available');
  }

  async answerNode(input: { trackerId: string; challengeId: string; userId: string; answer: string }) {
    return this.announce(input.trackerId, await this.clans.answerChallengeNode(input), 'This battle cannot accept that answer');
  }

  async usePower(input: { trackerId: string; challengeId: string; userId: string }) {
    return this.announce(input.trackerId, await this.clans.useChallengePower(input), 'No push-back power is available');
  }

  private announce(trackerId: string, challenge: TrackerClanChallenge | null, message: string) {
    if (!challenge) throw TrackerApplicationError.forbidden(message);
    this.notifier.notify({
      id: challenge.id,
      trackerId,
      status: challenge.status,
      challengerId: challenge.challenger.userId,
      opponentId: challenge.opponent?.userId ?? null,
    });
    return challenge;
  }
}
