export type DataPrivacyRequestType = 'access' | 'export' | 'delete' | 'correction';
export type DataPrivacyRequestInput = { type: DataPrivacyRequestType; details: string };
export type DataPrivacyRequestDTO = {
  id: string;
  type: DataPrivacyRequestType;
  details: string;
  status: string;
  resolutionNote?: string | null;
  downloadUrl?: string | null;
  dueAt: Date;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface IDataPrivacyRequestService {
  list(userId: string): Promise<DataPrivacyRequestDTO[]>;
  submit(userId: string, input: DataPrivacyRequestInput): Promise<DataPrivacyRequestDTO>;
  cancel(userId: string, requestId: string): Promise<DataPrivacyRequestDTO>;
}
