import { AITokenUsage } from '../../../../../infrastructure/database/models/ai-token-usage.model';
import { AdminConsoleSettings } from '../../../../../infrastructure/database/models/admin-console-settings.model';
import type {
  AdminAITokenSpend,
  AdminAITokenSpendBreakdown,
  AdminAITokenSpendPoint,
  AdminAITokenSpendRange,
} from '../../domain/entities/admin-ai-token-spend.entity';
import type { IAdminAITokenSpendRepository } from '../../domain/repositories/admin-ai-token-spend.repository.interface';

type AggregateRow = {
  _id: string | null;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  requests: number;
};

const totalsStage = {
  promptTokens: { $sum: '$promptTokens' },
  completionTokens: { $sum: '$completionTokens' },
  totalTokens: { $sum: '$totalTokens' },
  requests: { $sum: 1 },
};

const toBreakdown = (row: AggregateRow): AdminAITokenSpendBreakdown => ({
  key: row._id ?? 'other',
  promptTokens: row.promptTokens,
  completionTokens: row.completionTokens,
  totalTokens: row.totalTokens,
  requests: row.requests,
});

export class MongoAdminAITokenSpendRepository implements IAdminAITokenSpendRepository {
  async get({ from, to, days }: AdminAITokenSpendRange): Promise<AdminAITokenSpend> {
    const createdAt = { $gte: from, $lte: to };
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const periodMs = to.getTime() - from.getTime() + 1;
    const previousTo = new Date(from.getTime() - 1);
    const previousFrom = new Date(previousTo.getTime() - periodMs + 1);
    const [summaryRows, dailyRows, categoryRows, providerRows, todayRows, previousRows, monthRows, settings] = await Promise.all([
      AITokenUsage.aggregate<AggregateRow>([
        { $match: { createdAt } },
        { $group: { _id: null, ...totalsStage } },
      ]),
      AITokenUsage.aggregate<AggregateRow>([
        { $match: { createdAt } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            ...totalsStage,
          },
        },
        { $sort: { _id: 1 } },
      ]),
      AITokenUsage.aggregate<AggregateRow>([
        { $match: { createdAt } },
        { $group: { _id: '$category', ...totalsStage } },
        { $sort: { totalTokens: -1 } },
      ]),
      AITokenUsage.aggregate<AggregateRow>([
        { $match: { createdAt } },
        { $group: { _id: '$provider', ...totalsStage } },
        { $sort: { totalTokens: -1 } },
      ]),
      AITokenUsage.aggregate<{ _id: null; totalTokens: number }>([
        { $match: { createdAt: { $gte: todayStart } } },
        { $group: { _id: null, totalTokens: { $sum: '$totalTokens' } } },
      ]),
      AITokenUsage.aggregate<{ _id: null; totalTokens: number }>([
        { $match: { createdAt: { $gte: previousFrom, $lte: previousTo } } },
        { $group: { _id: null, totalTokens: { $sum: '$totalTokens' } } },
      ]),
      AITokenUsage.aggregate<{ _id: null; totalTokens: number }>([
        { $match: { createdAt: { $gte: monthStart } } },
        { $group: { _id: null, totalTokens: { $sum: '$totalTokens' } } },
      ]),
      AdminConsoleSettings.findOne({ key: 'global' })
        .select({ aiMonthlyTokenBudget: 1, aiBudgetWarningPercent: 1, _id: 0 })
        .lean(),
    ]);

    const summary = summaryRows[0];
    const totalTokens = summary?.totalTokens ?? 0;
    const previousPeriodTokens = previousRows[0]?.totalTokens ?? 0;
    const monthlyLimit = settings?.aiMonthlyTokenBudget ?? 10_000_000;
    const warningPercent = settings?.aiBudgetWarningPercent ?? 80;
    const monthTokens = monthRows[0]?.totalTokens ?? 0;
    const utilizationPercent = Number(((monthTokens / monthlyLimit) * 100).toFixed(1));
    return {
      rangeDays: days,
      rangeFrom: from.toISOString().slice(0, 10),
      rangeTo: to.toISOString().slice(0, 10),
      summary: {
        totalTokens,
        promptTokens: summary?.promptTokens ?? 0,
        completionTokens: summary?.completionTokens ?? 0,
        requests: summary?.requests ?? 0,
        todayTokens: todayRows[0]?.totalTokens ?? 0,
        previousPeriodTokens,
        changePercent:
          previousPeriodTokens > 0
            ? Number((((totalTokens - previousPeriodTokens) / previousPeriodTokens) * 100).toFixed(1))
            : null,
      },
      budget: {
        monthlyLimit,
        monthTokens,
        utilizationPercent,
        warningPercent,
        status:
          monthTokens >= monthlyLimit
            ? 'exceeded'
            : utilizationPercent >= warningPercent
              ? 'warning'
              : 'within_budget',
      },
      daily: dailyRows.map((row): AdminAITokenSpendPoint => ({
        date: row._id ?? '',
        promptTokens: row.promptTokens,
        completionTokens: row.completionTokens,
        totalTokens: row.totalTokens,
        requests: row.requests,
      })),
      byCategory: categoryRows.map(toBreakdown),
      byProvider: providerRows.map(toBreakdown),
    };
  }
}

export const mongoAdminAITokenSpendRepository = new MongoAdminAITokenSpendRepository();
