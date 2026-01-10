/**
 * Conversation Streaming Module
 *
 * Handles SDK message processing and stream event handling.
 */

import type {
  SDKMessage,
  SDKAssistantMessage,
  SDKResultMessage,
  SDKToolProgressMessage
} from '@anthropic-ai/claude-agent-sdk';
import type { ConversationMessage } from './types.js';
import { isThinkingBlock, isToolUseBlock, isTextDeltaStreamEvent, getTextFromStreamEvent } from './type-guards.js';

/**
 * Process SDK message and extract displayable content
 *
 * @param msg - SDK message from the query stream
 * @param verbose - Whether to include verbose output (tool calls, thinking)
 * @returns Array of conversation messages to display
 */
export function processSDKMessage(msg: SDKMessage, verbose: boolean): ConversationMessage[] {
  const chunks: ConversationMessage[] = [];

  switch (msg.type) {
    case 'assistant': {
      const assistantMsg = msg as SDKAssistantMessage;
      // Extract text from content blocks
      for (const block of assistantMsg.message.content) {
        if (block.type === 'text' && 'text' in block) {
          chunks.push({ type: 'text', content: block.text });
        } else if (isThinkingBlock(block)) {
          // Extended thinking - only show in verbose mode
          if (verbose) {
            chunks.push({
              type: 'thinking',
              content: `[Thinking: ${block.thinking.substring(0, 100)}...]`
            });
          }
        } else if (isToolUseBlock(block)) {
          // Tool use block - always show (not just verbose)
          // Extract meaningful info from input for display
          const input = block.input as Record<string, unknown>;
          let summary = '';

          // Try to extract file path or command for display
          if (input.file_path) summary = String(input.file_path);
          else if (input.path) summary = String(input.path);
          else if (input.command) summary = String(input.command).slice(0, 50);
          else if (input.pattern) summary = `pattern: "${input.pattern}"`;
          else if (input.query) summary = `query: "${String(input.query).slice(0, 30)}"`;
          else if (input.url) summary = String(input.url);

          chunks.push({
            type: 'tool_use',
            content: summary || block.name,
            metadata: { tool: block.name, input: block.input, summary }
          });
        }
      }
      break;
    }

    case 'tool_progress': {
      // Tool progress - always show elapsed time
      const progressMsg = msg as SDKToolProgressMessage;
      chunks.push({
        type: 'tool_use',
        content: `${progressMsg.tool_name}`,
        metadata: {
          tool: progressMsg.tool_name,
          elapsed: progressMsg.elapsed_time_seconds,
          isProgress: true
        }
      });
      break;
    }

    case 'result': {
      // Result message contains the final summary - but we already streamed the text
      // Only show errors, not the duplicate result text
      const resultMsg = msg as SDKResultMessage;
      if (resultMsg.subtype !== 'success' && 'errors' in resultMsg) {
        chunks.push({
          type: 'error',
          content: `Errors: ${resultMsg.errors.join(', ')}`
        });
      }
      // Don't output resultMsg.result - it duplicates the streamed text
      break;
    }

    case 'stream_event': {
      // Handle streaming text deltas using type guard
      if (isTextDeltaStreamEvent(msg)) {
        chunks.push({ type: 'text', content: getTextFromStreamEvent(msg) });
      }
      break;
    }
  }

  return chunks;
}
