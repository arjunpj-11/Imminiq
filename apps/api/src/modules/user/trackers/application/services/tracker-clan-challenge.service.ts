import type {
  ITrackerClanChallengeNotifier,
  ITrackerClanNotificationNotifier,
  ITrackerClanChallengeQuestionGenerator,
  ITrackerClanChallengeRepository,
  TrackerClanChallenge,
  TrackerClanChallengeQuestionContext,
} from '../../domain';
import type { ITrackerClanChallengeServiceContract } from '../tracker-clan-challenge.contract';
import type {
  AnswerTrackerClanNodePayloadDTO,
  ChooseTrackerClanCheckpointPayloadDTO,
  CreateTrackerClanChallengePayloadDTO,
  ExtendTrackerClanChallengePayloadDTO,
  SubmitTrackerClanChallengePayloadDTO,
  TrackerAccessPayloadDTO,
  TrackerClanChallengeAccessPayloadDTO,
} from '../tracker.dto';
import { TrackerApplicationError } from '../tracker-application.error';

export class TrackerClanChallengeService implements ITrackerClanChallengeServiceContract {
  constructor(
    private readonly _clans: ITrackerClanChallengeRepository,
    private readonly _questionGenerator: ITrackerClanChallengeQuestionGenerator,
    private readonly _notifier: ITrackerClanChallengeNotifier,
    private readonly _notifications?: ITrackerClanNotificationNotifier
  ) {}

  async list(input: TrackerAccessPayloadDTO) {
    const challenges = await this._clans.listChallenges(input);
    if (!challenges) throw TrackerApplicationError.forbidden('Join this guild to view battles');
    return challenges;
  }

  async get(input: TrackerClanChallengeAccessPayloadDTO) {
    const challenge = await this._clans.getChallenge(input);
    if (!challenge) throw TrackerApplicationError.forbidden('This battle is not available to you');
    return challenge;
  }

  async history(input: TrackerClanChallengeAccessPayloadDTO) {
    const history = await this._clans.getChallengeHistory(input);
    if (!history) {
      throw TrackerApplicationError.forbidden(
        'Battle history is available to competitors after the battle ends'
      );
    }
    return history;
  }

  active(userId: string) {
    return this._clans.getActiveChallenge(userId);
  }

  async create(input: CreateTrackerClanChallengePayloadDTO) {
    if (
      !(await this._clans.canCreateChallenge({
        challengerId: input.userId,
        opponentId: input.opponentId,
      }))
    ) {
      throw TrackerApplicationError.forbidden(
        'Finish your current guild battle before starting another challenge'
      );
    }
    const context = await this._clans.getChallengeQuestionContext({
      trackerId: input.trackerId,
      challengerId: input.userId,
      opponentId: input.opponentId,
    });
    if (!context) {
      throw TrackerApplicationError.forbidden(
        'A guild challenge needs eligible members and at least one roadmap topic'
      );
    }
    const questions = await this.generateQuestions(
      context,
      input.questionCount * 2,
      input.durationMinutes
    );
    const challenge = await this._clans.createChallenge({
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
      await this._notifications?.notify({
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

  async accept(input: TrackerClanChallengeAccessPayloadDTO) {
    const challenge = this.announce(
      input.trackerId,
      await this._clans.acceptChallenge(input),
      'This challenge is no longer available to accept'
    );
    await this._notifications?.notify({
      userId: challenge.challenger.userId,
      type: 'tracker_clan_challenge_accepted',
      message: `${challenge.opponent?.name ?? 'A guild member'} accepted your guild challenge.`,
      deepLink: `/trackers/${input.trackerId}/clan/challenges/${challenge.id}`,
      eventId: `${challenge.id}:accepted`,
      metadata: { trackerId: input.trackerId, challengeId: challenge.id },
    });
    return challenge;
  }

  async decline(input: TrackerClanChallengeAccessPayloadDTO) {
    const challenge = this.announce(
      input.trackerId,
      await this._clans.declineChallenge(input),
      'Only the directly challenged member can decline this battle'
    );
    await this._notifications?.notify({
      userId: challenge.challenger.userId,
      type: 'tracker_clan_challenge_declined',
      message: `${challenge.opponent?.name ?? 'The invited member'} declined your guild challenge.`,
      deepLink: `/trackers/${input.trackerId}/clan`,
      eventId: `${challenge.id}:declined`,
      metadata: { trackerId: input.trackerId, challengeId: challenge.id },
    });
    return challenge;
  }

  async cancel(input: TrackerClanChallengeAccessPayloadDTO) {
    const challenge = this.announce(
      input.trackerId,
      await this._clans.cancelChallenge(input),
      'Only the challenger can cancel an unaccepted battle'
    );
    if (challenge.opponent) {
      await this._notifications?.notify({
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

  async quit(input: TrackerClanChallengeAccessPayloadDTO) {
    const challenge = this.announce(
      input.trackerId,
      await this._clans.quitChallenge(input),
      'This battle is no longer available to quit'
    );
    await this.notifyCompletion(challenge);
    return challenge;
  }

  async extend(input: ExtendTrackerClanChallengePayloadDTO) {
    const extension = await this._clans.getChallengeExtensionContext(input);
    if (!extension) {
      throw TrackerApplicationError.forbidden('Extra questions are not available for this battle');
    }
    const questions = await this.generateQuestions(extension.context, input.questionCount, 10);
    return this.announce(
      input.trackerId,
      await this._clans.appendChallengeQuestions({
        ...input,
        expectedQuestionCount: extension.existingQuestionCount,
        questions,
      }),
      'Extra questions are no longer needed for this battle'
    );
  }

  async submit(input: SubmitTrackerClanChallengePayloadDTO) {
    const challenge = this.announce(
      input.trackerId,
      await this._clans.submitChallenge(input),
      'This battle cannot accept your submission'
    );
    await this.notifyCompletion(challenge);
    return challenge;
  }

  async chooseCheckpoint(input: ChooseTrackerClanCheckpointPayloadDTO) {
    const challenge = this.announce(
      input.trackerId,
      await this._clans.chooseChallengeCheckpoint(input),
      'This checkpoint decision is no longer available'
    );
    await this.notifyCompletion(challenge);
    return challenge;
  }

  async answerNode(input: AnswerTrackerClanNodePayloadDTO) {
    const challenge = this.announce(
      input.trackerId,
      await this._clans.answerChallengeNode(input),
      'This battle cannot accept that answer'
    );
    await this.notifyCompletion(challenge);
    return challenge;
  }

  async usePower(input: TrackerClanChallengeAccessPayloadDTO) {
    return this.announce(
      input.trackerId,
      await this._clans.useChallengePower(input),
      'No push-back power is available'
    );
  }

  private announce(trackerId: string, challenge: TrackerClanChallenge | null, message: string) {
    if (!challenge) throw TrackerApplicationError.forbidden(message);
    this._notifier.notify({
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
        this._notifications?.notify({
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

  private async generateQuestions(
    context: TrackerClanChallengeQuestionContext,
    questionCount: number,
    durationMinutes: number
  ) {
    const batchSizes = Array.from({ length: Math.ceil(questionCount / 10) }, (_, index) =>
      Math.min(10, questionCount - index * 10)
    );
    const batches = await Promise.all(
      batchSizes.map((batchSize) =>
        this._questionGenerator.generate({ context, questionCount: batchSize, durationMinutes })
      )
    );
    return batches.flat();
  }
}
