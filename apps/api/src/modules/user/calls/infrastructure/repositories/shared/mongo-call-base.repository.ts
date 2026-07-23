import { CallDomainError } from '../../../domain/call-domain.error';

export abstract class MongoCallBaseRepository {
  protected async execute<T>(code: string, message: string, operation: () => Promise<T>) {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof CallDomainError) throw error;
      console.error('Call repository operation failed', {
        code,
        message,
        originalError: error instanceof Error ? error.message : error,
      });
      throw new CallDomainError(code, message);
    }
  }
}
