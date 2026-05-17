import { generateDashboardInsights } from '../../../../infrastructure/ai/ai.service'
import type { DashboardInsightGenerator } from '../../domain/gateways/dashboard-insight-generator.interface'

export const aiDashboardInsightGenerator: DashboardInsightGenerator = {
  generate: async (userData: string) => {
    return generateDashboardInsights(userData)
  },
}
