/**
 * Context Management & Auto-Compact
 *
 * Provides context tracking and automatic compaction support.
 * The SDK handles auto-compact automatically via `/compact` command,
 * this module provides visibility and monitoring.
 */
const DEFAULT_THRESHOLDS = {
    tokenWarning: 100000,
    tokenCritical: 150000,
    messageWarning: 50,
    messageCritical: 100
};
/**
 * Estimate token count for a string
 * Uses simple heuristic: ~4 characters per token for English text
 */
export function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}
/**
 * Context Manager
 *
 * Tracks conversation context and provides compaction awareness.
 * Note: The SDK handles actual compaction; this provides monitoring.
 */
export class ContextManager {
    metrics = {
        estimatedTokens: 0,
        messageCount: 0,
        userMessages: 0,
        assistantMessages: 0,
        compactionCount: 0,
        tokenUsage: {
            inputTokens: 0,
            outputTokens: 0,
            thinkingTokens: 0,
            totalTokens: 0
        }
    };
    compactionHistory = [];
    thresholds;
    constructor(thresholds = {}) {
        this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
    }
    /**
     * Track a user message
     */
    trackUserMessage(content) {
        const tokens = estimateTokens(content);
        this.metrics.estimatedTokens += tokens;
        this.metrics.messageCount++;
        this.metrics.userMessages++;
    }
    /**
     * Track an assistant message
     */
    trackAssistantMessage(content) {
        const tokens = estimateTokens(content);
        this.metrics.estimatedTokens += tokens;
        this.metrics.messageCount++;
        this.metrics.assistantMessages++;
    }
    /**
     * Record a compaction event
     */
    recordCompaction(summary, messagesAfter, tokensAfter) {
        const event = {
            timestamp: new Date(),
            messagesBefore: this.metrics.messageCount,
            messagesAfter: messagesAfter ?? 1,
            tokensBefore: this.metrics.estimatedTokens,
            tokensAfter: tokensAfter ?? estimateTokens(summary || ''),
            summary
        };
        this.compactionHistory.push(event);
        this.metrics.lastCompactedAt = event.timestamp;
        this.metrics.compactionCount++;
        // Reset metrics post-compaction
        this.metrics.messageCount = event.messagesAfter;
        this.metrics.estimatedTokens = event.tokensAfter;
        // Keep user/assistant counts as approximations
        this.metrics.userMessages = Math.floor(event.messagesAfter / 2);
        this.metrics.assistantMessages = Math.ceil(event.messagesAfter / 2);
    }
    /**
     * Get current context metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Get compaction history
     */
    getCompactionHistory() {
        return [...this.compactionHistory];
    }
    /**
     * Get current context status
     */
    getStatus() {
        if (this.metrics.estimatedTokens >= this.thresholds.tokenCritical ||
            this.metrics.messageCount >= this.thresholds.messageCritical) {
            return 'critical';
        }
        if (this.metrics.estimatedTokens >= this.thresholds.tokenWarning ||
            this.metrics.messageCount >= this.thresholds.messageWarning) {
            return 'warning';
        }
        return 'healthy';
    }
    /**
     * Check if compaction is recommended
     */
    shouldCompact() {
        return this.getStatus() !== 'healthy';
    }
    /**
     * Get context usage percentage (based on critical thresholds)
     */
    getUsagePercent() {
        const tokenPercent = (this.metrics.estimatedTokens / this.thresholds.tokenCritical) * 100;
        const messagePercent = (this.metrics.messageCount / this.thresholds.messageCritical) * 100;
        return Math.max(tokenPercent, messagePercent);
    }
    /**
     * Format metrics for display
     */
    formatMetrics() {
        const status = this.getStatus();
        const statusIcon = status === 'healthy' ? '✓' : status === 'warning' ? '⚠' : '✗';
        const usage = this.getUsagePercent().toFixed(1);
        const lines = [
            `Context Status: ${statusIcon} ${status.toUpperCase()} (${usage}% used)`,
            '',
            `  Estimated Tokens: ${this.metrics.estimatedTokens.toLocaleString()}`,
            `  Messages: ${this.metrics.messageCount} (${this.metrics.userMessages} user, ${this.metrics.assistantMessages} assistant)`,
            `  Compactions: ${this.metrics.compactionCount}`
        ];
        if (this.metrics.lastCompactedAt) {
            lines.push(`  Last Compacted: ${this.metrics.lastCompactedAt.toLocaleString()}`);
        }
        if (this.shouldCompact()) {
            lines.push('');
            lines.push('  Tip: Use /compact to reduce context size');
        }
        return lines.join('\n');
    }
    /**
     * Reset all metrics (for new session)
     */
    reset() {
        this.metrics = {
            estimatedTokens: 0,
            messageCount: 0,
            userMessages: 0,
            assistantMessages: 0,
            compactionCount: 0,
            tokenUsage: {
                inputTokens: 0,
                outputTokens: 0,
                thinkingTokens: 0,
                totalTokens: 0
            }
        };
        this.compactionHistory = [];
    }
    /**
     * Track token usage from a response
     */
    trackTokenUsage(input, output, thinking = 0) {
        this.metrics.tokenUsage.inputTokens += input;
        this.metrics.tokenUsage.outputTokens += output;
        this.metrics.tokenUsage.thinkingTokens += thinking;
        this.metrics.tokenUsage.totalTokens += input + output + thinking;
    }
    /**
     * Get current token usage
     */
    getTokenUsage() {
        return { ...this.metrics.tokenUsage };
    }
    /**
     * Format token usage for display
     */
    formatTokenUsage(model = 'claude-opus-4-5-20251101') {
        const usage = this.metrics.tokenUsage;
        // Import pricing dynamically to avoid circular deps
        const pricing = {
            'claude-opus-4-5-20251101': { input: 15.00, output: 75.00, thinking: 15.00 },
            'claude-sonnet-4-20250514': { input: 3.00, output: 15.00, thinking: 3.00 },
            'claude-3-5-haiku-20241022': { input: 0.80, output: 4.00 }
        };
        const prices = pricing[model] || pricing['claude-opus-4-5-20251101'];
        const inputCost = (usage.inputTokens / 1_000_000) * prices.input;
        const outputCost = (usage.outputTokens / 1_000_000) * prices.output;
        const thinkingCost = prices.thinking
            ? (usage.thinkingTokens / 1_000_000) * prices.thinking
            : 0;
        const totalCost = inputCost + outputCost + thinkingCost;
        const formatCost = (cost) => {
            if (cost < 0.01)
                return `$${(cost * 100).toFixed(4)}c`;
            return `$${cost.toFixed(4)}`;
        };
        const lines = [
            'Token Usage:',
            '',
            `  Input:    ${usage.inputTokens.toLocaleString()} tokens`,
            `  Output:   ${usage.outputTokens.toLocaleString()} tokens`,
            `  Thinking: ${usage.thinkingTokens.toLocaleString()} tokens`,
            `  Total:    ${usage.totalTokens.toLocaleString()} tokens`,
            '',
            'Estimated Cost:',
            '',
            `  Input:    ${formatCost(inputCost)}`,
            `  Output:   ${formatCost(outputCost)}`,
            `  Thinking: ${formatCost(thinkingCost)}`,
            `  Total:    ${formatCost(totalCost)}`
        ];
        return lines.join('\n');
    }
    /**
     * Get thresholds
     */
    getThresholds() {
        return { ...this.thresholds };
    }
    /**
     * Update thresholds
     */
    setThresholds(thresholds) {
        this.thresholds = { ...this.thresholds, ...thresholds };
    }
}
/**
 * Parse compact_boundary message metadata
 */
export function parseCompactMetadata(metadata) {
    if (!metadata)
        return null;
    return {
        summary: metadata.summary,
        messagesAfter: metadata.message_count,
        tokensAfter: metadata.token_count
    };
}
/**
 * Create a /compact command prompt
 */
export function createCompactPrompt(customInstructions) {
    const base = 'Please compact the conversation history, summarizing key context while preserving important details.';
    if (customInstructions) {
        return `${base}\n\nAdditional instructions: ${customInstructions}`;
    }
    return base;
}
//# sourceMappingURL=context.js.map