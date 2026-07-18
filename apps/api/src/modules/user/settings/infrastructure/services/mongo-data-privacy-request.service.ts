import { DataPrivacyRequest } from '../../../../../infrastructure/database/models/data-privacy-request.model';
import { ServiceError } from '../../../../../shared/errors/service.error';
import type {
  DataPrivacyRequestDTO,
  DataPrivacyRequestInput,
  IDataPrivacyRequestService,
} from '../../application/data-privacy-request.service';

const output = (row: Record<string, unknown>): DataPrivacyRequestDTO => ({
  id: String(row._id),
  type: row.type as DataPrivacyRequestDTO['type'],
  details: String(row.details ?? ''),
  status: String(row.status ?? ''),
  resolutionNote: row.resolutionNote as string | null | undefined,
  downloadUrl: row.downloadUrl as string | null | undefined,
  dueAt: row.dueAt as Date,
  completedAt: row.completedAt as Date | null | undefined,
  createdAt: row.createdAt as Date,
  updatedAt: row.updatedAt as Date,
});

export class DataPrivacyRequestService implements IDataPrivacyRequestService {
  async list(userId: string) {
    const rows = await DataPrivacyRequest.find({ userId }).sort({ createdAt: -1 }).lean();
    return rows.map((row) => output(row as unknown as Record<string, unknown>));
  }

  async submit(
    userId: string,
    input: DataPrivacyRequestInput
  ) {
    const duplicate = await DataPrivacyRequest.findOne({
      userId,
      type: input.type,
      status: { $in: ['pending', 'in_progress'] },
    }).lean();
    if (duplicate) {
      throw new ServiceError(
        'conflict',
        'PRIVACY_REQUEST_ALREADY_ACTIVE',
        'An active request of this type already exists'
      );
    }
    const row = await DataPrivacyRequest.create({
      userId,
      type: input.type,
      details: input.details,
      dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    return output(row.toObject() as unknown as Record<string, unknown>);
  }

  async cancel(userId: string, requestId: string) {
    const row = await DataPrivacyRequest.findOneAndUpdate(
      { _id: requestId, userId, status: 'pending' },
      { $set: { status: 'cancelled' } },
      { new: true }
    ).lean();
    if (!row) {
      throw new ServiceError('conflict', 'PRIVACY_REQUEST_NOT_CANCELLABLE', 'Only pending requests can be cancelled');
    }
    return output(row as unknown as Record<string, unknown>);
  }
}
