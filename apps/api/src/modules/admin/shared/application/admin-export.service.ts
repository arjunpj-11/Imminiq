export interface IAdminExportService {
  users(query: { search: string; status: string }): Promise<string>;
  trackers(query: { search: string; status: string }): Promise<string>;
  mockTests(query: { search: string; status: string }): Promise<string>;
}
