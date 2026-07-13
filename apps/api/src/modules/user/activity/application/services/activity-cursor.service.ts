import { ActivityApplicationError } from '../activity-application.error';

export type ActivityCursorValue = {
  occurredAt: Date;
  id: string;
};

export class ActivityCursorCodec {
  encode(value: ActivityCursorValue): string {
    const serialized = JSON.stringify({
      occurredAt: value.occurredAt.toISOString(),
      id: value.id,
    });

    return Buffer.from(serialized, 'utf8').toString('base64url');
  }

  decode(cursor?: string): ActivityCursorValue | undefined {
    if (!cursor) {
      return undefined;
    }

    try {
      const raw = Buffer.from(cursor, 'base64url').toString('utf8');
      const parsed = JSON.parse(raw) as {
        occurredAt?: unknown;
        id?: unknown;
      };

      if (
        typeof parsed.occurredAt !== 'string' ||
        typeof parsed.id !== 'string' ||
        parsed.id.length === 0
      ) {
        throw ActivityApplicationError.invalidCursor();
      }

      const occurredAt = new Date(parsed.occurredAt);

      if (Number.isNaN(occurredAt.getTime())) {
        throw ActivityApplicationError.invalidCursor();
      }

      return {
        occurredAt,
        id: parsed.id,
      };
    } catch (error) {
      if (error instanceof ActivityApplicationError) {
        throw error;
      }

      throw ActivityApplicationError.invalidCursor();
    }
  }
}

export type ActivityCursorCodecContract = Pick<ActivityCursorCodec, 'encode' | 'decode'>;
