import { generateDashboardInsights } from '../../../../infrastructure/ai/ai.service'
import type { DashboardInsightGenerator } from '../../domain/services/dashboard-insight-generator.interface'

export const aiDashboardInsightGenerator: DashboardInsightGenerator = {
  generate: async (userData: string) => {
    const insight = await generateDashboardInsights(userData)

    if (!insight) {
      throw new Error('Dashboard insight generation returned an empty response')
    }

    return insight
  },
}
