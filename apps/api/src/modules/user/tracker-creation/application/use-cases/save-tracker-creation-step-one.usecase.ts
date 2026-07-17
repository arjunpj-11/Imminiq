import type { ITrackerCreationResponseCommandRepository } from '../../domain/repositories/tracker-creation-response-command.repository.interface';
import type {
  TrackerCreationResponseRecordDTO,
  SaveTrackerCreationStepOnePayloadDTO,
} from '../tracker-creation.dto';
import type { ITrackerCreationMapper } from '../tracker-creation.mapper';

export interface ISaveTrackerCreationStepOneUseCase {
  execute(
    userId: string,
    payload: SaveTrackerCreationStepOnePayloadDTO
  ): Promise<TrackerCreationResponseRecordDTO | null>;
}

export class SaveTrackerCreationStepOneUseCase implements ISaveTrackerCreationStepOneUseCase {
  constructor(
    private readonly _trackerCreationRepository: ITrackerCreationResponseCommandRepository,
    private readonly _trackerCreationMapper: ITrackerCreationMapper
  ) {}

  async execute(
    userId: string,
    payload: SaveTrackerCreationStepOnePayloadDTO
  ): Promise<TrackerCreationResponseRecordDTO | null> {
    const response = await this._trackerCreationRepository.saveStep1({
      userId,
      topic: payload.topic,
      goal: payload.goal,
      preferredLanguage: payload.preferredLanguage,
    });

    return this._trackerCreationMapper.toResponseDto(response);
  }
}
