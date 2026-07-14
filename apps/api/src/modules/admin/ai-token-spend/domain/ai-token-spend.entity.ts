export type AdminAITokenSpendRange = { from: Date; to: Date; days: number };

export type AdminAITokenSpendPoint = {
  date: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  requests: number;
};

export type AdminAITokenSpendBreakdown = {
  key: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  requests: number;
};

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
  };
  daily: AdminAITokenSpendPoint[];
  byCategory: AdminAITokenSpendBreakdown[];
  byProvider: AdminAITokenSpendBreakdown[];
};
