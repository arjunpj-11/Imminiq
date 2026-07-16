export type AdminAITokenSpendPoint = {
  date: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  requests: number;
};

export type AdminAITokenSpendBreakdown = Omit<AdminAITokenSpendPoint, 'date'> & { key: string };

export type AdminAITokenSpend = {
  rangeDays: number;
  rangeFrom: string;
  rangeTo: string;
  summary: {
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    requests: number;
    todayTokens: number;
    previousPeriodTokens: number;
    changePercent: number | null;
  };
  budget: {
    monthlyLimit: number;
    monthTokens: number;
    utilizationPercent: number;
    warningPercent: number;
    status: 'within_budget' | 'warning' | 'exceeded';
  };
  daily: AdminAITokenSpendPoint[];
  byCategory: AdminAITokenSpendBreakdown[];
  byProvider: AdminAITokenSpendBreakdown[];
};
