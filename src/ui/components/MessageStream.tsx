/**
 * MessageStream Component
 * Displays streaming conversation messages
 */

import React from 'react';
import { Box, Text } from 'ink';
import type { ConversationMessage } from '../../conversation.js';
import { UltrathinkText } from './UltrathinkText.js';

/**
 * Get icon for tool type
 */
function getToolIcon(tool: string): string {
  const toolLower = tool.toLowerCase();
  if (toolLower.includes('read')) return '📖';
  if (toolLower.includes('write')) return '📝';
  if (toolLower.includes('edit')) return '✏️';
  if (toolLower.includes('bash')) return '💻';
  if (toolLower.includes('glob')) return '📁';
  if (toolLower.includes('grep')) return '🔍';
  if (toolLower.includes('web') || toolLower.includes('fetch')) return '🌐';
  if (toolLower.includes('task')) return '🤖';
  if (toolLower.includes('todo')) return '📋';
  return '🔧';
}

/**
 * Get color for tool type
 */
function getToolColor(tool: string): string {
  const toolLower = tool.toLowerCase();
  if (toolLower.includes('read')) return 'blue';
  if (toolLower.includes('write') || toolLower.includes('edit')) return 'green';
  if (toolLower.includes('bash')) return 'magenta';
  if (toolLower.includes('glob') || toolLower.includes('grep')) return 'cyan';
  if (toolLower.includes('task')) return 'yellow';
  return 'gray';
}

export interface MessageStreamProps {
  /** Array of messages to display */
  messages: ConversationMessage[];
  /** Whether currently streaming */
  streaming: boolean;
  /** Show tool usage in verbose mode */
  verbose?: boolean;
}

/**
 * Check if content starts with ultrathink prefix (case-insensitive)
 */
function hasUltrathinkPrefix(content: string): boolean {
  return content.toLowerCase().startsWith('ultrathink:');
}

/**
 * Render text with ultrathink gradient if prefix is present
 */
function renderTextContent(content: string): React.ReactElement {
  if (hasUltrathinkPrefix(content)) {
    // Extract the rest of the message after "ultrathink:"
    const restOfMessage = content.slice(11); // Length of "ultrathink:"
    return (
      <Text>
        <UltrathinkText bold />
        <Text>:</Text>
        <Text>{restOfMessage}</Text>
      </Text>
    );
  }
  return <Text>{content}</Text>;
}

/**
 * Single message block component
 */
const MessageBlock: React.FC<{ message: ConversationMessage; verbose?: boolean }> = ({
  message,
  verbose
}) => {
  switch (message.type) {
    case 'user':
      return (
        <Box marginBottom={1}>
          <Text color="cyan">❯ </Text>
          <Text>{message.content}</Text>
        </Box>
      );

    case 'text':
    case 'result':
      return renderTextContent(message.content);

    case 'tool_use': {
      // Always show tool usage (not just verbose mode)
      const toolName = message.metadata?.tool as string || 'Tool';
      const summary = message.metadata?.summary as string || message.content;
      const elapsed = message.metadata?.elapsed as number | undefined;
      const isProgress = message.metadata?.isProgress as boolean | undefined;

      // Skip progress updates if we already showed the initial tool call
      if (isProgress) return null;

      const icon = getToolIcon(toolName);
      const color = getToolColor(toolName);

      return (
        <Box paddingLeft={1}>
          <Text>{icon} </Text>
          <Text color={color} bold>{toolName.padEnd(8)}</Text>
          <Text dimColor> {summary}</Text>
          {elapsed !== undefined && (
            <Text dimColor> ({elapsed.toFixed(1)}s)</Text>
          )}
        </Box>
      );
    }

    case 'tool_result':
      if (!verbose) return null;
      return (
        <Box paddingX={1}>
          <Text dimColor>↳ {message.content.slice(0, 100)}</Text>
          {message.content.length > 100 && <Text dimColor>...</Text>}
        </Box>
      );

    case 'thinking':
      if (!verbose) return null;
      return (
        <Box paddingX={1}>
          <Text color="magenta" dimColor>[Thinking: {message.content.slice(0, 50)}...]</Text>
        </Box>
      );

    case 'error':
      return (
        <Box paddingX={1} marginY={1}>
          <Text color="red">Error: {message.content}</Text>
        </Box>
      );

    default:
      return null;
  }
};

/**
 * MessageStream component for displaying conversation
 */
export const MessageStream: React.FC<MessageStreamProps> = ({
  messages,
  streaming,
  verbose = false
}) => {
  return (
    <Box flexDirection="column" flexGrow={1} paddingX={1}>
      {messages.map((message, index) => (
        <MessageBlock key={index} message={message} verbose={verbose} />
      ))}
      {streaming && messages.length === 0 && (
        <Text dimColor>Waiting for response...</Text>
      )}
    </Box>
  );
};

export default MessageStream;
