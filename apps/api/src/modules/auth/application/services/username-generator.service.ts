import { AuthApplicationError } from '../errors/auth-application.error'
import type { AuthUserRepositoryContract } from '../../domain/repositories/auth-user.repository.interface'
import type { RandomNumberGeneratorContract } from '../../domain/services/random-number-generator.service.interface'

export interface UsernameGeneratorServiceContract {
  generateRegistrationUsername(data: {
    email?: string
    fullName: string
  }): Promise<string>
  generateUsername(fullName: string): Promise<string>
  generateUniqueUsernameFromSource(source: string): Promise<string>
}

export class UsernameGeneratorService implements UsernameGeneratorServiceContract {
  constructor(
    private readonly authRepository: AuthUserRepositoryContract,
    private readonly randomNumberGenerator: RandomNumberGeneratorContract
  ) {}

  async generateRegistrationUsername(data: {
    email?: string
    fullName: string
  }): Promise<string> {
    const source = data.email
      ? data.email.split('@')[0]
      : data.fullName

    return this.generateUniqueUsernameFromSource(source)
  }

  async generateUsername(fullName: string): Promise<string> {
    return this.generateUniqueUsernameFromSource(fullName)
  }

  async generateUniqueUsernameFromSource(source: string): Promise<string> {
    const alphanumericSource = source
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]/g, '')

    const sanitizedBase =
      this.trimOuterUnderscores(
        this.collapseRepeatedUnderscores(alphanumericSource)
      ).slice(0, 24) || 'user'

    const base =
      sanitizedBase.length >= 3
        ? sanitizedBase
        : `${sanitizedBase}user`.slice(0, 24)

    if (!(await this.authRepository.usernameExists(base))) {
      return base
    }

    for (let attempt = 0; attempt < 60; attempt += 1) {
      const suffix = this.randomNumberGenerator
        .integer(10, 100000)
        .toString()
      const separator = attempt % 2 === 0 ? '_' : ''
      const maxBaseLength = 30 - separator.length - suffix.length
      const candidateBase = base.slice(0, Math.max(3, maxBaseLength))
      const candidate = `${candidateBase}${separator}${suffix}`

      if (!(await this.authRepository.usernameExists(candidate))) {
        return candidate
      }
    }

    throw AuthApplicationError.usernameGenerationFailed()
  }

  private collapseRepeatedUnderscores(value: string): string {
    let result = ''
    let previousWasUnderscore = false

    for (const character of value) {
      if (character === '_') {
        if (!previousWasUnderscore) {
          result += character
        }

        previousWasUnderscore = true
        continue
      }

      previousWasUnderscore = false
      result += character
    }

    return result
  }

  private trimOuterUnderscores(value: string): string {
    let start = 0
    let end = value.length

    while (start < end && value[start] === '_') {
      start += 1
    }

    while (end > start && value[end - 1] === '_') {
      end -= 1
    }

    return value.slice(start, end)
  }
}
