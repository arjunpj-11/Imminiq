import type { ModerationAppealEntity } from '../../domain/entities/moderation-appeal.entity';
import type { RestrictedModerationUserEntity } from '../../domain/entities/restricted-moderation-user.entity';
import type {
  CreateModerationAppealInput,
  IModerationAppealRepository,
} from '../../domain/repositories/moderation-appeal.repository.interface';
import { MongoModerationAppealCaseRepository } from './internal/mongo-moderation-appeal-case.repository';
import { MongoModerationAppealRestrictedUserReader } from './internal/mongo-moderation-appeal-restricted-user.reader';
import { MongoModerationAppealUserRepository } from './internal/mongo-moderation-appeal-user.repository';
import { MongoModerationAppealMapper } from './shared/mongo-moderation-appeal.mapper';

type MongoModerationAppealRepositoryDependencies = {
  restrictedUserReader: MongoModerationAppealRestrictedUserReader;
  userRepository: MongoModerationAppealUserRepository;
  caseRepository: MongoModerationAppealCaseRepository;
};

export class MongoModerationAppealRepository implements IModerationAppealRepository {
  private readonly _userRepository: MongoModerationAppealUserRepository;
  private readonly _caseRepository: MongoModerationAppealCaseRepository;

  constructor(
    mapper: MongoModerationAppealMapper = new MongoModerationAppealMapper(),
    dependencies: Partial<MongoModerationAppealRepositoryDependencies> = {}
  ) {
    const restrictedUserReader =
      dependencies.restrictedUserReader ?? new MongoModerationAppealRestrictedUserReader();

    this._userRepository =
      dependencies.userRepository ??
      new MongoModerationAppealUserRepository(mapper, restrictedUserReader);

    this._caseRepository =
      dependencies.caseRepository ??
      new MongoModerationAppealCaseRepository(mapper, restrictedUserReader);
  }

  async findRestrictedUserByIdentifier(
    identifier: string
  ): Promise<RestrictedModerationUserEntity | null> {
    return this._userRepository.findRestrictedUserByIdentifier(identifier);
  }

  async findActiveAppealForUser(userId: string): Promise<ModerationAppealEntity | null> {
    return this._caseRepository.findActiveAppealForUser(userId);
  }

  async findLatestActiveAppealForRestrictedIdentifier(
    identifier: string
  ): Promise<ModerationAppealEntity | null> {
    return this._caseRepository.findLatestActiveAppealForRestrictedIdentifier(identifier);
  }

  async caseIdExists(caseId: string): Promise<boolean> {
    return this._caseRepository.caseIdExists(caseId);
  }

  async createAppeal(data: CreateModerationAppealInput): Promise<ModerationAppealEntity> {
    return this._caseRepository.createAppeal(data);
  }
}

export const mongoModerationAppealRepository = new MongoModerationAppealRepository();
