import type {
  ITrackerClanChallengeNotifier,
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
}

export class TrackerClanChallengeUseCase implements ITrackerClanChallengeUseCase {
  constructor(
    private readonly clans: ITrackerClanChallengeRepository,
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
    const challenge = await this.clans.createChallenge({
      trackerId: input.trackerId,
      challengerId: input.userId,
      opponentId: input.opponentId,
      durationMinutes: input.durationMinutes,
      questionCount: input.questionCount,
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
