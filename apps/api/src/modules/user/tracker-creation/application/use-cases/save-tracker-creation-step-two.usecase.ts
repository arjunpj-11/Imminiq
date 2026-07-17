import type { ITrackerCreationResponseCommandRepository } from '../../domain/repositories/tracker-creation-response-command.repository.interface';
import type {
  TrackerCreationResponseRecordDTO,
  SaveTrackerCreationStepTwoPayloadDTO,
} from '../tracker-creation.dto';
import type { ITrackerCreationMapper } from '../tracker-creation.mapper';

export interface ISaveTrackerCreationStepTwoUseCase {
  execute(
    userId: string,
    payload: SaveTrackerCreationStepTwoPayloadDTO
  ): Promise<TrackerCreationResponseRecordDTO | null>;
}

export class SaveTrackerCreationStepTwoUseCase implements ISaveTrackerCreationStepTwoUseCase {
  constructor(
    private readonly _trackerCreationRepository: ITrackerCreationResponseCommandRepository,
    private readonly _trackerCreationMapper: ITrackerCreationMapper
  ) {}

  async execute(
    userId: string,
    payload: SaveTrackerCreationStepTwoPayloadDTO
  ): Promise<TrackerCreationResponseRecordDTO | null> {
    const response = await this._trackerCreationRepository.saveStep2({
      userId,
      level: payload.level,
    });

    return this._trackerCreationMapper.toResponseDto(response);
  }
}
