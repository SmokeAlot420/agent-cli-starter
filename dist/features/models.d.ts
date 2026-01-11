/**
 * Model Aliases and Configuration
 *
 * Provides model aliases for easy switching and hybrid mode support.
 */
/** Full model identifiers */
export declare const MODELS: {
    readonly OPUS: "claude-opus-4-5-20251101";
    readonly SONNET: "claude-sonnet-4-20250514";
    readonly HAIKU: "claude-3-5-haiku-20241022";
};
/** Model aliases for easy reference */
export declare const MODEL_ALIASES: Record<string, string>;
/** Model pricing per 1M tokens (USD) */
export declare const MODEL_PRICING: Record<string, {
    input: number;
    output: number;
    thinking?: number;
}>;
/** Default model */
export declare const DEFAULT_MODEL: "claude-opus-4-5-20251101";
/**
 * Resolve a model alias to full model identifier
 */
export declare function resolveModel(aliasOrModel: string): string;
/**
 * Get display name for a model
 */
export declare function getModelDisplayName(model: string): string;
/**
 * Get model alias from full model name
 */
export declare function getModelAlias(model: string): string;
/**
 * Calculate estimated cost for token usage
 */
export declare function calculateCost(model: string, inputTokens: number, outputTokens: number, thinkingTokens?: number): number;
/**
 * Format cost for display
 */
export declare function formatCost(cost: number): string;
/**
 * Format model list for display
 */
export declare function formatModelList(currentModel: string): string;
//# sourceMappingURL=models.d.ts.map