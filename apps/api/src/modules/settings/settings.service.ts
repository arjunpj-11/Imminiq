import type {
  UpdateAccountPayload,
  UpdateAIBehaviourPayload,
  UpdateAppearancePayload,
  UpdateCodeEditorPayload,
  UpdateCompilerPayload,
  UpdateEmailDigestPayload,
  UpdateGesturesPayload,
  UpdateLearningJourneyPayload,
  UpdateNotificationsPayload,
  UpdatePrivacyPayload,
  UpdateQuietHoursPayload,
} from './application/dtos/settings.dto'
import {
  SettingsMapper,
  type SettingsMapperContract,
} from './application/mappers/settings.mapper'
import { AcceptTermsUseCase } from './application/use-cases/accept-terms.usecase'
import { GetAllSettingsUseCase } from './application/use-cases/get-all-settings.usecase'
import { GetAppearanceSettingsUseCase } from './application/use-cases/get-appearance-settings.usecase'
import { GetGestureSettingsUseCase } from './application/use-cases/get-gesture-settings.usecase'
import { GetNotificationSettingsUseCase } from './application/use-cases/get-notification-settings.usecase'
import { GetPrivacySettingsUseCase } from './application/use-cases/get-privacy-settings.usecase'
import { ResetSettingsToDefaultsUseCase } from './application/use-cases/reset-settings-to-defaults.usecase'
import { UpdateAccountSettingsUseCase } from './application/use-cases/update-account-settings.usecase'
import { UpdateAIBehaviourUseCase } from './application/use-cases/update-ai-behaviour.usecase'
import { UpdateAppearanceUseCase } from './application/use-cases/update-appearance.usecase'
import { UpdateCodeEditorUseCase } from './application/use-cases/update-code-editor.usecase'
import { UpdateCompilerUseCase } from './application/use-cases/update-compiler.usecase'
import { UpdateCookieConsentUseCase } from './application/use-cases/update-cookie-consent.usecase'
import { UpdateEmailDigestUseCase } from './application/use-cases/update-email-digest.usecase'
import { UpdateGesturesUseCase } from './application/use-cases/update-gestures.usecase'
import { UpdateLearningJourneyUseCase } from './application/use-cases/update-learning-journey.usecase'
import { UpdateNotificationsUseCase } from './application/use-cases/update-notifications.usecase'
import { UpdatePrivacyUseCase } from './application/use-cases/update-privacy.usecase'
import { UpdateQuietHoursUseCase } from './application/use-cases/update-quiet-hours.usecase'
import type { SettingsRepositoryContract } from './domain/repositories/settings.repository.interface'
import { mongoSettingsRepository } from './infrastructure/repositories/mongo-settings.repository'

export class SettingsService {
  private readonly getAllSettingsUseCase: GetAllSettingsUseCase
  private readonly getAppearanceSettingsUseCase: GetAppearanceSettingsUseCase
  private readonly getNotificationSettingsUseCase: GetNotificationSettingsUseCase
  private readonly getPrivacySettingsUseCase: GetPrivacySettingsUseCase
  private readonly getGestureSettingsUseCase: GetGestureSettingsUseCase
  private readonly updateAccountSettingsUseCase: UpdateAccountSettingsUseCase
  private readonly updateAppearanceUseCase: UpdateAppearanceUseCase
  private readonly updateNotificationsUseCase: UpdateNotificationsUseCase
  private readonly updateQuietHoursUseCase: UpdateQuietHoursUseCase
  private readonly updateEmailDigestUseCase: UpdateEmailDigestUseCase
  private readonly updatePrivacyUseCase: UpdatePrivacyUseCase
  private readonly updateCodeEditorUseCase: UpdateCodeEditorUseCase
  private readonly updateCompilerUseCase: UpdateCompilerUseCase
  private readonly updateAIBehaviourUseCase: UpdateAIBehaviourUseCase
  private readonly updateLearningJourneyUseCase: UpdateLearningJourneyUseCase
  private readonly updateGesturesUseCase: UpdateGesturesUseCase
  private readonly updateCookieConsentUseCase: UpdateCookieConsentUseCase
  private readonly acceptTermsUseCase: AcceptTermsUseCase
  private readonly resetSettingsToDefaultsUseCase: ResetSettingsToDefaultsUseCase

  constructor(
    private readonly settingsRepository: SettingsRepositoryContract,
    private readonly settingsMapper: SettingsMapperContract,
  ) {
    this.getAllSettingsUseCase = new GetAllSettingsUseCase(
      this.settingsRepository,
      this.settingsMapper,
    )

    this.getAppearanceSettingsUseCase = new GetAppearanceSettingsUseCase(
      this.settingsRepository,
      this.settingsMapper,
    )

    this.getNotificationSettingsUseCase = new GetNotificationSettingsUseCase(
      this.settingsRepository,
      this.settingsMapper,
    )

    this.getPrivacySettingsUseCase = new GetPrivacySettingsUseCase(
      this.settingsRepository,
      this.settingsMapper,
    )

    this.getGestureSettingsUseCase = new GetGestureSettingsUseCase(
      this.settingsRepository,
      this.settingsMapper,
    )

    this.updateAccountSettingsUseCase = new UpdateAccountSettingsUseCase(
      this.settingsRepository,
      this.settingsMapper,
    )

    this.updateAppearanceUseCase = new UpdateAppearanceUseCase(
      this.settingsRepository,
      this.settingsMapper,
    )

    this.updateNotificationsUseCase = new UpdateNotificationsUseCase(
      this.settingsRepository,
      this.settingsMapper,
    )

    this.updateQuietHoursUseCase = new UpdateQuietHoursUseCase(
      this.settingsRepository,
      this.settingsMapper,
    )

    this.updateEmailDigestUseCase = new UpdateEmailDigestUseCase(
      this.settingsRepository,
      this.settingsMapper,
    )

    this.updatePrivacyUseCase = new UpdatePrivacyUseCase(
      this.settingsRepository,
      this.settingsMapper,
    )

    this.updateCodeEditorUseCase = new UpdateCodeEditorUseCase(
      this.settingsRepository,
      this.settingsMapper,
    )

    this.updateCompilerUseCase = new UpdateCompilerUseCase(
      this.settingsRepository,
      this.settingsMapper,
    )

    this.updateAIBehaviourUseCase = new UpdateAIBehaviourUseCase(
      this.settingsRepository,
      this.settingsMapper,
    )

    this.updateLearningJourneyUseCase = new UpdateLearningJourneyUseCase(
      this.settingsRepository,
      this.settingsMapper,
    )

    this.updateGesturesUseCase = new UpdateGesturesUseCase(
      this.settingsRepository,
      this.settingsMapper,
    )

    this.updateCookieConsentUseCase = new UpdateCookieConsentUseCase(
      this.settingsRepository,
      this.settingsMapper,
    )

    this.acceptTermsUseCase = new AcceptTermsUseCase(
      this.settingsRepository,
      this.settingsMapper,
    )

    this.resetSettingsToDefaultsUseCase = new ResetSettingsToDefaultsUseCase(
      this.settingsRepository,
      this.settingsMapper,
    )
  }

  getAllSettings(userId: string) {
    return this.getAllSettingsUseCase.execute(userId)
  }

  getAppearanceSettings(userId: string) {
    return this.getAppearanceSettingsUseCase.execute(userId)
  }

  getNotificationSettings(userId: string) {
    return this.getNotificationSettingsUseCase.execute(userId)
  }

  getPrivacySettings(userId: string) {
    return this.getPrivacySettingsUseCase.execute(userId)
  }

  getGestureSettings(userId: string) {
    return this.getGestureSettingsUseCase.execute(userId)
  }

  updateAccountSettings(userId: string, payload: UpdateAccountPayload) {
    return this.updateAccountSettingsUseCase.execute(userId, payload)
  }

  updateAppearance(userId: string, payload: UpdateAppearancePayload) {
    return this.updateAppearanceUseCase.execute(userId, payload)
  }

  updateNotifications(userId: string, payload: UpdateNotificationsPayload) {
    return this.updateNotificationsUseCase.execute(userId, payload)
  }

  updateQuietHours(userId: string, payload: UpdateQuietHoursPayload) {
    return this.updateQuietHoursUseCase.execute(userId, payload)
  }

  updateEmailDigest(userId: string, payload: UpdateEmailDigestPayload) {
    return this.updateEmailDigestUseCase.execute(userId, payload)
  }

  updatePrivacy(userId: string, payload: UpdatePrivacyPayload) {
    return this.updatePrivacyUseCase.execute(userId, payload)
  }

  updateCodeEditor(userId: string, payload: UpdateCodeEditorPayload) {
    return this.updateCodeEditorUseCase.execute(userId, payload)
  }

  updateCompiler(userId: string, payload: UpdateCompilerPayload) {
    return this.updateCompilerUseCase.execute(userId, payload)
  }

  updateAIBehaviour(userId: string, payload: UpdateAIBehaviourPayload) {
    return this.updateAIBehaviourUseCase.execute(userId, payload)
  }

  updateLearningJourney(
    userId: string,
    payload: UpdateLearningJourneyPayload,
  ) {
    return this.updateLearningJourneyUseCase.execute(userId, payload)
  }

  updateGestures(userId: string, payload: UpdateGesturesPayload) {
    return this.updateGesturesUseCase.execute(userId, payload)
  }

  updateCookieConsent(userId: string, cookieConsent: boolean) {
    return this.updateCookieConsentUseCase.execute(userId, cookieConsent)
  }

  acceptTerms(userId: string) {
    return this.acceptTermsUseCase.execute(userId)
  }

  resetToDefaults(userId: string) {
    return this.resetSettingsToDefaultsUseCase.execute(userId)
  }
}

const settingsRepository = mongoSettingsRepository
const settingsMapper = new SettingsMapper()

export const settingsService = new SettingsService(
  settingsRepository,
  settingsMapper,
)
