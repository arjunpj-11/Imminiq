import type {
  TrackerDTO,
} from '../tracker.dto';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface';
import type { CreateTrackerInput } from '../../domain/trackers.types';

export interface ICreateTrackerUseCase {
  execute(input: CreateTrackerInput): Promise<TrackerDTO>;
}

export class CreateTrackerUseCase implements ICreateTrackerUseCase {
  constructor(
    private readonly _trackerRepository: Pick<ITrackerRepository, 'createTracker'>,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: CreateTrackerInput): Promise<TrackerDTO> {
    const tracker = await this._trackerRepository.createTracker(input);

    return this._trackerMapper.toTrackerDto(tracker);
  }
}
