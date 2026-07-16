export type AdminMockTestModerationEmail = {
  to: string;
  ownerName: string;
  testTitle: string;
  action: 'suspended' | 'deleted' | 'restored';
  reason: string;
};

export interface IAdminMockTestEmailProvider {
  queueModerationEmail(input: AdminMockTestModerationEmail): Promise<void>;
}
