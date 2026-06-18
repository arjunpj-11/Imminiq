import { generateDashboardInsights } from '../../../../infrastructure/ai/ai.service'
import { DashboardDomainError } from '../../domain/errors/dashboard-domain.error'
import type { DashboardInsightGeneratorContract } from '../../domain/services/dashboard-insight-generator.interface'

export class AIDashboardInsightGenerator
  implements DashboardInsightGeneratorContract {
  async generate(userData: string): Promise<string> {
    try {
      const insight = await generateDashboardInsights(userData)

      if (!insight) {
        throw new DashboardDomainError(
          'DASHBOARD_INSIGHT_EMPTY',
          'Dashboard insight generation returned an empty response'
        )
      }

      return insight
    } catch (error) {
      if (error instanceof DashboardDomainError) {
        throw error
      }

      throw new DashboardDomainError(
        'DASHBOARD_INSIGHT_GENERATION_FAILED',
        'Dashboard insight generation failed'
      )
    }
  }
}

export const aiDashboardInsightGenerator = new AIDashboardInsightGenerator()
