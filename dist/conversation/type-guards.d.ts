/**
 * Conversation Type Guards
 *
 * Type-safe guards for SDK message types to eliminate unsafe type assertions.
 */
/**
 * Check if a content block is a thinking block
 */
export declare function isThinkingBlock(block: unknown): block is {
    type: 'thinking';
    thinking: string;
};
/**
 * Check if a content block is a tool_use block
 */
export declare function isToolUseBlock(block: unknown): block is {
    type: 'tool_use';
    name: string;
    input: unknown;
    id: string;
};
/**
 * Check if a content block is a text block
 */
export declare function isTextBlock(block: unknown): block is {
    type: 'text';
    text: string;
};
/**
 * Check if message is a stream event with text delta
 */
export declare function isTextDeltaStreamEvent(msg: unknown): msg is {
    type: 'stream_event';
    event: {
        type: 'content_block_delta';
        delta: {
            type: 'text_delta';
            text: string;
        };
    };
};
/**
 * Extract text from a text delta stream event
 */
export declare function getTextFromStreamEvent(msg: {
    type: 'stream_event';
    event: {
        delta: {
            text: string;
        };
    };
}): string;
//# sourceMappingURL=type-guards.d.ts.map