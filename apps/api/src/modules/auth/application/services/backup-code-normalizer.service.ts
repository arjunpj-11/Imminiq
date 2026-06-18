export interface BackupCodeNormalizerServiceContract {
  normalize(code: string): string
}

export class BackupCodeNormalizerService
  implements BackupCodeNormalizerServiceContract {
  normalize(code: string): string {
    const compact = code
      .trim()
      .toUpperCase()
      .replace(/\s/g, '')
      .replace(/-/g, '')

    if (compact.length !== 10) {
      return code.trim().toUpperCase()
    }

    return `${compact.slice(0, 5)}-${compact.slice(5, 10)}`
  }
}
