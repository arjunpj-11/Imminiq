export interface DashboardInsightGeneratorContract {
  generate(userData: string): Promise<string>
}
