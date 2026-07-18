import type { TrackerClanChallenge } from '../domain';
import type {
  AnswerTrackerClanNodePayloadDTO,
  ChooseTrackerClanCheckpointPayloadDTO,
  CreateTrackerClanChallengePayloadDTO,
  SubmitTrackerClanChallengePayloadDTO,
  TrackerAccessPayloadDTO,
  TrackerClanChallengeAccessPayloadDTO,
} from './tracker.dto';

export interface ITrackerClanChallengeServiceContract {
  list(input: TrackerAccessPayloadDTO): Promise<TrackerClanChallenge[]>;
  create(input: CreateTrackerClanChallengePayloadDTO): Promise<TrackerClanChallenge>;
  accept(input: TrackerClanChallengeAccessPayloadDTO): Promise<TrackerClanChallenge>;
  decline(input: TrackerClanChallengeAccessPayloadDTO): Promise<TrackerClanChallenge>;
  cancel(input: TrackerClanChallengeAccessPayloadDTO): Promise<TrackerClanChallenge>;
  submit(input: SubmitTrackerClanChallengePayloadDTO): Promise<TrackerClanChallenge>;
  chooseCheckpoint(input: ChooseTrackerClanCheckpointPayloadDTO): Promise<TrackerClanChallenge>;
  answerNode(input: AnswerTrackerClanNodePayloadDTO): Promise<TrackerClanChallenge>;
  usePower(input: TrackerClanChallengeAccessPayloadDTO): Promise<TrackerClanChallenge>;
}
