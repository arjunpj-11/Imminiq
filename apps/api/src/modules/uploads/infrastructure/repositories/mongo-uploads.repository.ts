import type {
  SaveUploadRecordInput,
  SetProfileAvatarUrlInput,
  SetProfileBannerUrlInput,
  SoftDeleteLatestProfileUploadInput,
  IUploadsRepository,
} from '../../domain/repositories/uploads.repository.interface'
import { MongoUploadsProfileRepository } from './internal/mongo-uploads-profile.repository'
import { MongoUploadsRecordRepository } from './internal/mongo-uploads-record.repository'
import { MongoUploadsMapper } from './shared/mongo-uploads.mapper'

type MongoUploadsRepositoryDependencies = {
  recordRepository: MongoUploadsRecordRepository
  profileRepository: MongoUploadsProfileRepository
}

export class MongoUploadsRepository implements IUploadsRepository {
  private readonly _recordRepository: MongoUploadsRecordRepository
  private readonly _profileRepository: MongoUploadsProfileRepository

  constructor(
    mapper: MongoUploadsMapper = new MongoUploadsMapper(),
    dependencies: Partial<MongoUploadsRepositoryDependencies> = {},
  ) {
    this._recordRepository =
      dependencies.recordRepository ??
      new MongoUploadsRecordRepository(mapper)

    this._profileRepository =
      dependencies.profileRepository ??
      new MongoUploadsProfileRepository()
  }

  async saveUploadRecord(input: SaveUploadRecordInput) {
    return this._recordRepository.saveUploadRecord(input)
  }

  async setAvatarUrl(input: SetProfileAvatarUrlInput) {
    return this._profileRepository.setAvatarUrl(input)
  }

  async clearAvatarUrl(userId: string) {
    return this._profileRepository.clearAvatarUrl(userId)
  }

  async setBannerUrl(input: SetProfileBannerUrlInput) {
    return this._profileRepository.setBannerUrl(input)
  }

  async clearBannerUrl(userId: string) {
    return this._profileRepository.clearBannerUrl(userId)
  }

  async softDeleteLatestProfileUpload(
    input: SoftDeleteLatestProfileUploadInput,
  ) {
    return this._recordRepository.softDeleteLatestProfileUpload(input)
  }
}

export const mongoUploadsRepository = new MongoUploadsRepository()