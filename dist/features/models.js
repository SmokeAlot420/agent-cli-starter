/**
 * Model Aliases and Configuration
 *
 * Provides model aliases for easy switching and hybrid mode support.
 */
/** Full model identifiers */
export const MODELS = {
    OPUS: 'claude-opus-4-5-20251101',
    SONNET: 'claude-sonnet-4-20250514',
    HAIKU: 'claude-3-5-haiku-20241022'
};
/** Model aliases for easy reference */
export const MODEL_ALIASES = {
    // Primary aliases
    'opus': MODELS.OPUS,
    'sonnet': MODELS.SONNET,
    'haiku': MODELS.HAIKU,
    // Alternative names
    'default': MODELS.OPUS,
    'fast': MODELS.SONNET,
    'fastest': MODELS.HAIKU,
    'cheap': MODELS.HAIKU,
    'smart': MODELS.OPUS,
    // Full names also work
    [MODELS.OPUS]: MODELS.OPUS,
    [MODELS.SONNET]: MODELS.SONNET,
    [MODELS.HAIKU]: MODELS.HAIKU
};
/** Model pricing per 1M tokens (USD) */
export const MODEL_PRICING = {
    [MODELS.OPUS]: { input: 15.00, output: 75.00, thinking: 15.00 },
    [MODELS.SONNET]: { input: 3.00, output: 15.00, thinking: 3.00 },
    [MODELS.HAIKU]: { input: 0.80, output: 4.00 }
};
/** Default model */
export const DEFAULT_MODEL = MODELS.OPUS;
/**
 * Resolve a model alias to full model identifier
 */
export function resolveModel(aliasOrModel) {
    const normalized = aliasOrModel.toLowerCase().trim();
    return MODEL_ALIASES[normalized] || aliasOrModel;
}
/**
 * Get display name for a model
 */
export function getModelDisplayName(model) {
    if (model.includes('opus'))
        return 'Opus 4.5';
    if (model.includes('sonnet'))
        return 'Sonnet 4';
    if (model.includes('haiku'))
        return 'Haiku 3.5';
    return model;
}
/**
 * Get model alias from full model name
 */
export function getModelAlias(model) {
    if (model === MODELS.OPUS)
        return 'opus';
    if (model === MODELS.SONNET)
        return 'sonnet';
    if (model === MODELS.HAIKU)
        return 'haiku';
    return model;
}
/**
 * Calculate estimated cost for token usage
 */
export function calculateCost(model, inputTokens, outputTokens, thinkingTokens = 0) {
    const pricing = MODEL_PRICING[model] || MODEL_PRICING[MODELS.OPUS];
    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;
    const thinkingCost = pricing.thinking
        ? (thinkingTokens / 1_000_000) * pricing.thinking
        : 0;
    return inputCost + outputCost + thinkingCost;
}
/**
 * Format cost for display
 */
export function formatCost(cost) {
    if (cost < 0.01) {
        return `$${(cost * 100).toFixed(4)}c`;
    }
    return `$${cost.toFixed(4)}`;
}
/**
 * Format model list for display
 */
export function formatModelList(currentModel) {
    const lines = ['Available Models:', ''];
    const models = [
        { alias: 'opus', model: MODELS.OPUS, desc: 'Most capable, extended thinking' },
        { alias: 'sonnet', model: MODELS.SONNET, desc: 'Fast and capable' },
        { alias: 'haiku', model: MODELS.HAIKU, desc: 'Fastest, most economical' }
    ];
    for (const { alias, model, desc } of models) {
        const current = model === currentModel ? ' (current)' : '';
        lines.push(`  ${alias}${current}`);
        lines.push(`    ${getModelDisplayName(model)} - ${desc}`);
    }
    lines.push('');
    lines.push('Usage: /model <alias>');
    return lines.join('\n');
}
//# sourceMappingURL=models.js.map