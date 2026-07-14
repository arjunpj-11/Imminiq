import { AITokenUsage } from '../../../../infrastructure/database/models/ai-token-usage.model';
import type {
  AdminAITokenSpend,
  AdminAITokenSpendBreakdown,
  AdminAITokenSpendPoint,
  AdminAITokenSpendRange,
} from '../domain/ai-token-spend.entity';
import type { IAdminAITokenSpendRepository } from '../domain/ai-token-spend.repository.interface';

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
    const [summaryRows, dailyRows, categoryRows, providerRows, todayRows] = await Promise.all([
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
    ]);

    const summary = summaryRows[0];
    return {
      rangeDays: days,
      rangeFrom: from.toISOString().slice(0, 10),
      rangeTo: to.toISOString().slice(0, 10),
      summary: {
        totalTokens: summary?.totalTokens ?? 0,
        promptTokens: summary?.promptTokens ?? 0,
        completionTokens: summary?.completionTokens ?? 0,
        requests: summary?.requests ?? 0,
        todayTokens: todayRows[0]?.totalTokens ?? 0,
      },
      daily: dailyRows.map(
        (row): AdminAITokenSpendPoint => ({
          date: row._id ?? '',
          promptTokens: row.promptTokens,
          completionTokens: row.completionTokens,
          totalTokens: row.totalTokens,
          requests: row.requests,
        })
      ),
      byCategory: categoryRows.map(toBreakdown),
      byProvider: providerRows.map(toBreakdown),
    };
  }
}

export const mongoAdminAITokenSpendRepository = new MongoAdminAITokenSpendRepository();
