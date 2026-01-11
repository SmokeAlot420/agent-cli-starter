/**
 * Conversation Streaming Module
 *
 * Handles SDK message processing and stream event handling.
 */
import type { SDKMessage } from '@anthropic-ai/claude-agent-sdk';
import type { ConversationMessage } from './types.js';
/**
 * Process SDK message and extract displayable content
 *
 * @param msg - SDK message from the query stream
 * @param verbose - Whether to include verbose output (tool calls, thinking)
 * @returns Array of conversation messages to display
 */
export declare function processSDKMessage(msg: SDKMessage, verbose: boolean): ConversationMessage[];
//# sourceMappingURL=streaming.d.ts.map