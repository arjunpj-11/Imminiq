import type {
  UpdateSettingsAIBehaviourInput,
  UpdateSettingsAccountInput,
  UpdateSettingsAppearanceInput,
  UpdateSettingsCodeEditorInput,
  UpdateSettingsCompilerInput,
  UpdateSettingsEmailDigestInput,
  UpdateSettingsGesturesInput,
  UpdateSettingsLearningJourneyInput,
  UpdateSettingsNotificationTypesInput,
  UpdateSettingsNotificationsInput,
  UpdateSettingsPrivacyInput,
  UpdateSettingsQuietHoursInput,
} from '../../domain/repositories/settings-command.repository.interface'
import type { ISettingsRepository } from '../../domain/repositories/settings.repository.interface'
import { MongoSettingsUserRepository } from './internal/mongo-settings-user.repository'
import { MongoSettingsMapper } from './shared/mongo-settings.mapper'

type MongoSettingsRepositoryDependencies = {
  settingsRepository: MongoSettingsUserRepository
}

export class MongoSettingsRepository implements ISettingsRepository {
  private readonly _settingsRepository: MongoSettingsUserRepository

  constructor(
    mapper: MongoSettingsMapper = new MongoSettingsMapper(),
    dependencies: Partial<MongoSettingsRepositoryDependencies> = {},
  ) {
    this._settingsRepository =
      dependencies.settingsRepository ??
      new MongoSettingsUserRepository(mapper)
  }

  findByUserId(userId: string) {
    return this._settingsRepository.findByUserId(userId)
  }

  findOrCreate(userId: string) {
    return this._settingsRepository.findOrCreate(userId)
  }

  updateAppearance(input: UpdateSettingsAppearanceInput) {
    return this._settingsRepository.updateAppearance(input)
  }

  updateNotifications(input: UpdateSettingsNotificationsInput) {
    return this._settingsRepository.updateNotifications(input)
  }

  updateNotificationTypes(
    input: UpdateSettingsNotificationTypesInput,
  ) {
    return this._settingsRepository.updateNotificationTypes(input)
  }

  updatePrivacy(input: UpdateSettingsPrivacyInput) {
    return this._settingsRepository.updatePrivacy(input)
  }

  updateCodeEditor(input: UpdateSettingsCodeEditorInput) {
    return this._settingsRepository.updateCodeEditor(input)
  }

  updateCompiler(input: UpdateSettingsCompilerInput) {
    return this._settingsRepository.updateCompiler(input)
  }

  updateAIBehaviour(input: UpdateSettingsAIBehaviourInput) {
    return this._settingsRepository.updateAIBehaviour(input)
  }

  updateLearningJourney(
    input: UpdateSettingsLearningJourneyInput,
  ) {
    return this._settingsRepository.updateLearningJourney(input)
  }

  updateGestures(input: UpdateSettingsGesturesInput) {
    return this._settingsRepository.updateGestures(input)
  }

  updateQuietHours(input: UpdateSettingsQuietHoursInput) {
    return this._settingsRepository.updateQuietHours(input)
  }

  updateEmailDigest(input: UpdateSettingsEmailDigestInput) {
    return this._settingsRepository.updateEmailDigest(input)
  }

  updateAccountSettings(input: UpdateSettingsAccountInput) {
    return this._settingsRepository.updateAccountSettings(input)
  }

  resetToDefaults(userId: string) {
    return this._settingsRepository.resetToDefaults(userId)
  }
}

export const mongoSettingsRepository = new MongoSettingsRepository()
