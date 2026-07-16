export interface IDataPrivacyRequestService {
  list(userId: string): Promise<object[]>;
  submit(userId: string, input: { type: 'access' | 'export' | 'delete' | 'correction'; details: string }): Promise<object>;
  cancel(userId: string, requestId: string): Promise<object>;
}
