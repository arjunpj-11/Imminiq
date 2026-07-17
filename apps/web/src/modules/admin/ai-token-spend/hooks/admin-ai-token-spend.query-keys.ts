export const adminAITokenSpendKeys = {
  all: ["admin", "ai-token-spend"] as const,
  range: (range: { from: string; to: string }) =>
    [...adminAITokenSpendKeys.all, range] as const,
};
