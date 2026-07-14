import { AITokenUsage, type AITokenUsageCategory } from '../database/models/ai-token-usage.model';

export type { AITokenUsageCategory };

export type AITokenCounts = {
  promptTokens?: number | null;
  completionTokens?: number | null;
  totalTokens?: number | null;
};

export const recordAITokenUsage = (
  provider: string,
  model: string,
  category: AITokenUsageCategory,
  usage: AITokenCounts | undefined
) => {
  if (!usage) return;

  const promptTokens = Math.max(0, usage.promptTokens ?? 0);
  const completionTokens = Math.max(0, usage.completionTokens ?? 0);
  const totalTokens = Math.max(0, usage.totalTokens ?? promptTokens + completionTokens);
  if (!totalTokens) return;

  void AITokenUsage.create({
    provider,
    model,
    category,
    promptTokens,
    completionTokens,
    totalTokens,
  }).catch((error: unknown) => {
    console.error('[AI token usage] Failed to persist usage metadata', error);
  });
};
