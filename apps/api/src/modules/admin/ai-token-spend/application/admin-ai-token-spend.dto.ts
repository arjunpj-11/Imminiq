export interface AdminAITokenSpendDTO {
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
  daily: Array<{
    date: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    requests: number;
  }>;
  byCategory: Array<{
    key: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    requests: number;
  }>;
  byProvider: AdminAITokenSpendDTO['byCategory'];
}
