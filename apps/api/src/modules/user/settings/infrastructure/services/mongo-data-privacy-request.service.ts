import { DataPrivacyRequest } from '../../../../../infrastructure/database/models/data-privacy-request.model';
import { ServiceError } from '../../../../../shared/errors/service.error';

export interface IDataPrivacyRequestService {
  list(userId: string): Promise<object[]>;
  submit(userId: string, input: { type: 'access' | 'export' | 'delete' | 'correction'; details: string }): Promise<object>;
  cancel(userId: string, requestId: string): Promise<object>;
}

const output = (row: Record<string, unknown>) => ({
  id: String(row._id),
  type: row.type,
  details: row.details,
  status: row.status,
  resolutionNote: row.resolutionNote,
  downloadUrl: row.downloadUrl,
  dueAt: row.dueAt,
  completedAt: row.completedAt,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export class DataPrivacyRequestService implements IDataPrivacyRequestService {
  async list(userId: string) {
    const rows = await DataPrivacyRequest.find({ userId }).sort({ createdAt: -1 }).lean();
    return rows.map((row) => output(row as unknown as Record<string, unknown>));
  }

  async submit(
    userId: string,
    input: { type: 'access' | 'export' | 'delete' | 'correction'; details: string }
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
