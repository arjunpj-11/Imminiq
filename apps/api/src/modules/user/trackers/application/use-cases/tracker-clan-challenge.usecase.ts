import type {
  ITrackerClanChallengeNotifier,
  ITrackerClanNotificationNotifier,
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
    private readonly notifier: ITrackerClanChallengeNotifier,
    private readonly notifications?: ITrackerClanNotificationNotifier
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
    const announced = this.announce(
      input.trackerId,
      challenge,
      'A guild challenge needs eligible members and at least one roadmap topic'
    );
    if (announced.opponent) {
      await this.notifications?.notify({
        userId: announced.opponent.userId,
        type: 'tracker_clan_challenge_received',
        message: `${announced.challenger.name} challenged you to a guild battle.`,
        deepLink: `/trackers/${input.trackerId}/clan/challenges/${announced.id}`,
        eventId: `${announced.id}:received`,
        metadata: { trackerId: input.trackerId, challengeId: announced.id },
      });
    }
    return announced;
  }

  async accept(input: { trackerId: string; challengeId: string; userId: string }) {
    const challenge = this.announce(
      input.trackerId,
      await this.clans.acceptChallenge(input),
      'This challenge is no longer available to accept'
    );
    await this.notifications?.notify({
      userId: challenge.challenger.userId,
      type: 'tracker_clan_challenge_accepted',
      message: `${challenge.opponent?.name ?? 'A guild member'} accepted your guild challenge.`,
      deepLink: `/trackers/${input.trackerId}/clan/challenges/${challenge.id}`,
      eventId: `${challenge.id}:accepted`,
      metadata: { trackerId: input.trackerId, challengeId: challenge.id },
    });
    return challenge;
  }

  async decline(input: { trackerId: string; challengeId: string; userId: string }) {
    const challenge = this.announce(
      input.trackerId,
      await this.clans.declineChallenge(input),
      'Only the directly challenged member can decline this battle'
    );
    await this.notifications?.notify({
      userId: challenge.challenger.userId,
      type: 'tracker_clan_challenge_declined',
      message: `${challenge.opponent?.name ?? 'The invited member'} declined your guild challenge.`,
      deepLink: `/trackers/${input.trackerId}/clan`,
      eventId: `${challenge.id}:declined`,
      metadata: { trackerId: input.trackerId, challengeId: challenge.id },
    });
    return challenge;
  }

  async cancel(input: { trackerId: string; challengeId: string; userId: string }) {
    const challenge = this.announce(
      input.trackerId,
      await this.clans.cancelChallenge(input),
      'Only the challenger can cancel an unaccepted battle'
    );
    if (challenge.opponent) {
      await this.notifications?.notify({
        userId: challenge.opponent.userId,
        type: 'tracker_clan_challenge_cancelled',
        message: `${challenge.challenger.name} cancelled the guild challenge.`,
        deepLink: `/trackers/${input.trackerId}/clan`,
        eventId: `${challenge.id}:cancelled`,
        metadata: { trackerId: input.trackerId, challengeId: challenge.id },
      });
    }
    return challenge;
  }

  async submit(input: {
    trackerId: string;
    challengeId: string;
    userId: string;
    answers: Array<{ questionId: string; answer: string }>;
  }) {
    const challenge = this.announce(
      input.trackerId,
      await this.clans.submitChallenge(input),
      'This battle cannot accept your submission'
    );
    await this.notifyCompletion(challenge);
    return challenge;
  }

  async chooseCheckpoint(input: { trackerId: string; challengeId: string; userId: string; decision: 'attempt' | 'skip' }) {
    const challenge = this.announce(input.trackerId, await this.clans.chooseChallengeCheckpoint(input), 'This checkpoint decision is no longer available');
    await this.notifyCompletion(challenge);
    return challenge;
  }

  async answerNode(input: { trackerId: string; challengeId: string; userId: string; answer: string }) {
    const challenge = this.announce(input.trackerId, await this.clans.answerChallengeNode(input), 'This battle cannot accept that answer');
    await this.notifyCompletion(challenge);
    return challenge;
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

  private async notifyCompletion(challenge: TrackerClanChallenge) {
    if (challenge.status !== 'completed' || !challenge.opponent) return;
    const participants = [challenge.challenger, challenge.opponent];
    const winner = participants.find((participant) => participant.userId === challenge.winnerId);
    await Promise.all(
      participants.map((participant) =>
        this.notifications?.notify({
          userId: participant.userId,
          type: 'tracker_clan_challenge_completed',
          message: winner
            ? `${winner.name} won your guild challenge.`
            : 'Your guild challenge ended in a draw.',
          deepLink: `/trackers/${challenge.trackerId}/clan/challenges/${challenge.id}`,
          eventId: `${challenge.id}:completed`,
          metadata: { trackerId: challenge.trackerId, challengeId: challenge.id },
        })
      )
    );
  }
}
