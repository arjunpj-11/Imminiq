export interface IDashboardInsightGenerator {
  generate(userData: string): Promise<string>
}
