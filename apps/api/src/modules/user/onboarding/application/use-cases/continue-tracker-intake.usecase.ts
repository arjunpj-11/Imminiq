import type {
  ITrackerIntakeAgent,
  TrackerIntakeMessage,
} from '../../domain/services/tracker-intake-agent.interface';
import type { TrackerIntakeResponseDTO } from '../onboarding.dto';

export interface IContinueTrackerIntakeUseCase {
  execute(userId: string, messages: TrackerIntakeMessage[]): Promise<TrackerIntakeResponseDTO>;
}

export class ContinueTrackerIntakeUseCase implements IContinueTrackerIntakeUseCase {
  constructor(private readonly _trackerIntakeAgent: ITrackerIntakeAgent) {}

  execute(userId: string, messages: TrackerIntakeMessage[]): Promise<TrackerIntakeResponseDTO> {
    return this._trackerIntakeAgent.continueIntake(userId, messages);
  }
}
