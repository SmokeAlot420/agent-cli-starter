/**
 * Conversation Type Guards
 *
 * Type-safe guards for SDK message types to eliminate unsafe type assertions.
 */
/**
 * Check if a content block is a thinking block
 */
export function isThinkingBlock(block) {
    return (typeof block === 'object' &&
        block !== null &&
        'type' in block &&
        block.type === 'thinking' &&
        'thinking' in block &&
        typeof block.thinking === 'string');
}
/**
 * Check if a content block is a tool_use block
 */
export function isToolUseBlock(block) {
    return (typeof block === 'object' &&
        block !== null &&
        'type' in block &&
        block.type === 'tool_use' &&
        'name' in block &&
        typeof block.name === 'string' &&
        'input' in block);
}
/**
 * Check if a content block is a text block
 */
export function isTextBlock(block) {
    return (typeof block === 'object' &&
        block !== null &&
        'type' in block &&
        block.type === 'text' &&
        'text' in block &&
        typeof block.text === 'string');
}
/**
 * Check if message is a stream event with text delta
 */
export function isTextDeltaStreamEvent(msg) {
    if (typeof msg !== 'object' || msg === null)
        return false;
    if (!('type' in msg) || msg.type !== 'stream_event')
        return false;
    const streamMsg = msg;
    if (typeof streamMsg.event !== 'object' || streamMsg.event === null)
        return false;
    const event = streamMsg.event;
    if (event.type !== 'content_block_delta')
        return false;
    const delta = event.delta;
    return delta?.type === 'text_delta' && typeof delta?.text === 'string';
}
/**
 * Extract text from a text delta stream event
 */
export function getTextFromStreamEvent(msg) {
    return msg.event.delta.text;
}
//# sourceMappingURL=type-guards.js.map