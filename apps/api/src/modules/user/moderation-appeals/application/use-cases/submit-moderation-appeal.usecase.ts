import type { IModerationAppealCommandRepository } from '../../domain/repositories/moderation-appeal-command.repository.interface';
import type { IModerationAppealQueryRepository } from '../../domain/repositories/moderation-appeal-query.repository.interface';
import type {
  ISubmitModerationAppealPayloadDTO,
  ISubmitModerationAppealResultDTO,
} from '../moderation-appeal.dto';
import type { IModerationAppealMapper } from '../moderation-appeal.mapper';
import type { IModerationAppealSubmissionPolicy } from '../moderation-appeal-submission-policy.policy';
import type { IModerationAppealCaseIdAllocator } from '../services/moderation-appeal-case-id.service';
import { ModerationAppealApplicationError } from '../moderation-appeal-application.error';

type SubmitModerationAppealRepository = IModerationAppealQueryRepository &
  IModerationAppealCommandRepository;

export interface ISubmitModerationAppealUseCase {
  execute(payload: ISubmitModerationAppealPayloadDTO): Promise<ISubmitModerationAppealResultDTO>;
}

export class SubmitModerationAppealUseCase implements ISubmitModerationAppealUseCase {
  constructor(
    private readonly _moderationAppealRepository: SubmitModerationAppealRepository,
    private readonly _caseIdAllocator: IModerationAppealCaseIdAllocator,
    private readonly _moderationAppealSubmissionPolicy: IModerationAppealSubmissionPolicy,
    private readonly _moderationAppealMapper: IModerationAppealMapper
  ) {}

  async execute(
    payload: ISubmitModerationAppealPayloadDTO
  ): Promise<ISubmitModerationAppealResultDTO> {
    const user = await this._moderationAppealRepository.findRestrictedUserByIdentifier(
      payload.identifier
    );

    this._moderationAppealSubmissionPolicy.ensureRestrictedUserExists(user);

    if (user.id !== payload.userId) {
      throw ModerationAppealApplicationError.authorizationMismatch();
    }

    const existingAppeal = await this._moderationAppealRepository.findActiveAppealForUser(user.id);

    this._moderationAppealSubmissionPolicy.ensureNoActiveAppeal(existingAppeal);

    const caseId = await this._caseIdAllocator.generateUniqueCaseId();

    const appeal = await this._moderationAppealRepository.createAppeal({
      userId: user.id,
      caseId,
      identifier: payload.identifier,
      appealReason: payload.appealReason,
    });

    return this._moderationAppealMapper.toSubmitResult(appeal);
  }
}
