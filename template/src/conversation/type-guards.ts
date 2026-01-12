/**
 * Conversation Type Guards
 *
 * Type-safe guards for SDK message types to eliminate unsafe type assertions.
 */

/**
 * Check if a content block is a thinking block
 */
export function isThinkingBlock(
  block: unknown
): block is { type: 'thinking'; thinking: string } {
  return (
    typeof block === 'object' &&
    block !== null &&
    'type' in block &&
    (block as { type: string }).type === 'thinking' &&
    'thinking' in block &&
    typeof (block as { thinking: unknown }).thinking === 'string'
  );
}

/**
 * Check if a content block is a tool_use block
 */
export function isToolUseBlock(
  block: unknown
): block is { type: 'tool_use'; name: string; input: unknown; id: string } {
  return (
    typeof block === 'object' &&
    block !== null &&
    'type' in block &&
    (block as { type: string }).type === 'tool_use' &&
    'name' in block &&
    typeof (block as { name: unknown }).name === 'string' &&
    'input' in block
  );
}

/**
 * Check if a content block is a text block
 */
export function isTextBlock(
  block: unknown
): block is { type: 'text'; text: string } {
  return (
    typeof block === 'object' &&
    block !== null &&
    'type' in block &&
    (block as { type: string }).type === 'text' &&
    'text' in block &&
    typeof (block as { text: unknown }).text === 'string'
  );
}

/**
 * Check if message is a stream event with text delta
 */
export function isTextDeltaStreamEvent(
  msg: unknown
): msg is {
  type: 'stream_event';
  event: { type: 'content_block_delta'; delta: { type: 'text_delta'; text: string } };
} {
  if (typeof msg !== 'object' || msg === null) return false;
  if (!('type' in msg) || (msg as { type: string }).type !== 'stream_event') return false;

  const streamMsg = msg as { event?: unknown };
  if (typeof streamMsg.event !== 'object' || streamMsg.event === null) return false;

  const event = streamMsg.event as { type?: string; delta?: unknown };
  if (event.type !== 'content_block_delta') return false;

  const delta = event.delta as { type?: string; text?: string } | undefined;
  return delta?.type === 'text_delta' && typeof delta?.text === 'string';
}

/**
 * Extract text from a text delta stream event
 */
export function getTextFromStreamEvent(
  msg: { type: 'stream_event'; event: { delta: { text: string } } }
): string {
  return msg.event.delta.text;
}
