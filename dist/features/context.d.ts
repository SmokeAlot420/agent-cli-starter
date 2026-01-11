/**
 * Context Management & Auto-Compact
 *
 * Provides context tracking and automatic compaction support.
 * The SDK handles auto-compact automatically via `/compact` command,
 * this module provides visibility and monitoring.
 */
/**
 * Token usage tracking for cost calculation
 */
export interface TokenUsage {
    /** Input tokens consumed */
    inputTokens: number;
    /** Output tokens generated */
    outputTokens: number;
    /** Thinking tokens used */
    thinkingTokens: number;
    /** Total tokens */
    totalTokens: number;
}
/**
 * Context usage metrics
 */
export interface ContextMetrics {
    /** Estimated token count (approximation) */
    estimatedTokens: number;
    /** Number of messages in conversation */
    messageCount: number;
    /** Number of user messages */
    userMessages: number;
    /** Number of assistant messages */
    assistantMessages: number;
    /** Last time context was compacted */
    lastCompactedAt?: Date;
    /** Number of times compacted in this session */
    compactionCount: number;
    /** Token usage for cost tracking */
    tokenUsage: TokenUsage;
}
/**
 * Compaction event information
 */
export interface CompactionEvent {
    /** When compaction occurred */
    timestamp: Date;
    /** Messages before compaction */
    messagesBefore: number;
    /** Messages after compaction */
    messagesAfter: number;
    /** Tokens before (estimated) */
    tokensBefore: number;
    /** Tokens after (estimated) */
    tokensAfter: number;
    /** Summary generated during compaction */
    summary?: string;
}
/**
 * Context threshold configuration
 */
export interface ContextThresholds {
    /** Token threshold to suggest compaction (default: 100000) */
    tokenWarning: number;
    /** Token threshold for automatic compaction (default: 150000) */
    tokenCritical: number;
    /** Message count to suggest compaction (default: 50) */
    messageWarning: number;
    /** Message count for automatic compaction (default: 100) */
    messageCritical: number;
}
/**
 * Estimate token count for a string
 * Uses simple heuristic: ~4 characters per token for English text
 */
export declare function estimateTokens(text: string): number;
/**
 * Context status levels
 */
export type ContextStatus = 'healthy' | 'warning' | 'critical';
/**
 * Context Manager
 *
 * Tracks conversation context and provides compaction awareness.
 * Note: The SDK handles actual compaction; this provides monitoring.
 */
export declare class ContextManager {
    private metrics;
    private compactionHistory;
    private thresholds;
    constructor(thresholds?: Partial<ContextThresholds>);
    /**
     * Track a user message
     */
    trackUserMessage(content: string): void;
    /**
     * Track an assistant message
     */
    trackAssistantMessage(content: string): void;
    /**
     * Record a compaction event
     */
    recordCompaction(summary?: string, messagesAfter?: number, tokensAfter?: number): void;
    /**
     * Get current context metrics
     */
    getMetrics(): ContextMetrics;
    /**
     * Get compaction history
     */
    getCompactionHistory(): CompactionEvent[];
    /**
     * Get current context status
     */
    getStatus(): ContextStatus;
    /**
     * Check if compaction is recommended
     */
    shouldCompact(): boolean;
    /**
     * Get context usage percentage (based on critical thresholds)
     */
    getUsagePercent(): number;
    /**
     * Format metrics for display
     */
    formatMetrics(): string;
    /**
     * Reset all metrics (for new session)
     */
    reset(): void;
    /**
     * Track token usage from a response
     */
    trackTokenUsage(input: number, output: number, thinking?: number): void;
    /**
     * Get current token usage
     */
    getTokenUsage(): TokenUsage;
    /**
     * Format token usage for display
     */
    formatTokenUsage(model?: string): string;
    /**
     * Get thresholds
     */
    getThresholds(): ContextThresholds;
    /**
     * Update thresholds
     */
    setThresholds(thresholds: Partial<ContextThresholds>): void;
}
/**
 * Parse compact_boundary message metadata
 */
export declare function parseCompactMetadata(metadata: Record<string, unknown>): Partial<CompactionEvent> | null;
/**
 * Create a /compact command prompt
 */
export declare function createCompactPrompt(customInstructions?: string): string;
//# sourceMappingURL=context.d.ts.map