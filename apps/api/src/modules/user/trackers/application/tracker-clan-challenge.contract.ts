import type { TrackerClanChallenge, TrackerClanChallengeHistory } from '../domain';
import type {
  AnswerTrackerClanNodePayloadDTO,
  ChooseTrackerClanCheckpointPayloadDTO,
  CreateTrackerClanChallengePayloadDTO,
  ExtendTrackerClanChallengePayloadDTO,
  SubmitTrackerClanChallengePayloadDTO,
  TrackerAccessPayloadDTO,
  TrackerClanChallengeAccessPayloadDTO,
} from './tracker.dto';

export interface ITrackerClanChallengeServiceContract {
  list(input: TrackerAccessPayloadDTO): Promise<TrackerClanChallenge[]>;
  get(input: TrackerClanChallengeAccessPayloadDTO): Promise<TrackerClanChallenge>;
  history(input: TrackerClanChallengeAccessPayloadDTO): Promise<TrackerClanChallengeHistory>;
  active(userId: string): Promise<TrackerClanChallenge | null>;
  create(input: CreateTrackerClanChallengePayloadDTO): Promise<TrackerClanChallenge>;
  accept(input: TrackerClanChallengeAccessPayloadDTO): Promise<TrackerClanChallenge>;
  decline(input: TrackerClanChallengeAccessPayloadDTO): Promise<TrackerClanChallenge>;
  cancel(input: TrackerClanChallengeAccessPayloadDTO): Promise<TrackerClanChallenge>;
  quit(input: TrackerClanChallengeAccessPayloadDTO): Promise<TrackerClanChallenge>;
  extend(input: ExtendTrackerClanChallengePayloadDTO): Promise<TrackerClanChallenge>;
  submit(input: SubmitTrackerClanChallengePayloadDTO): Promise<TrackerClanChallenge>;
  chooseCheckpoint(input: ChooseTrackerClanCheckpointPayloadDTO): Promise<TrackerClanChallenge>;
  answerNode(input: AnswerTrackerClanNodePayloadDTO): Promise<TrackerClanChallenge>;
  usePower(input: TrackerClanChallengeAccessPayloadDTO): Promise<TrackerClanChallenge>;
}
