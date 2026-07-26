import { Types } from 'mongoose';
import { CallDomainError } from '../../../domain/call-domain.error';

export class MongoCallNormalizer {
  static toObjectId(value: string, code = 'INVALID_CALL_ID') {
    if (!Types.ObjectId.isValid(value))
      throw new CallDomainError(code, 'Call identifier is invalid');
    return new Types.ObjectId(value);
  }
}
