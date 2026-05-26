export interface DashboardInsightGenerator {
  generate(userData: string): Promise<string>
}
