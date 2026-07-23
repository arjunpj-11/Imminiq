import { ChatDomainError } from '../../../domain/chat-domain.error';

export abstract class MongoChatBaseRepository {
  protected async execute<T>(
    code: string,
    message: string,
    operation: () => Promise<T>
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof ChatDomainError) throw error;
      console.error('Chat repository operation failed', {
        code,
        message,
        originalError:
          error instanceof Error
            ? { name: error.name, message: error.message, stack: error.stack }
            : error,
      });
      throw new ChatDomainError(code, message);
    }
  }
}
