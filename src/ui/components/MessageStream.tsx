/**
 * MessageStream Component
 * Displays streaming conversation messages
 */

import React from 'react';
import { Box, Text } from 'ink';
import type { ConversationMessage } from '../../conversation.js';
import { UltrathinkText } from './UltrathinkText.js';

/** Tool display configuration by keyword */
const TOOL_CONFIG: Array<{ keywords: string[]; icon: string; color: string }> = [
  { keywords: ['read'], icon: '📖', color: 'blue' },
  { keywords: ['write'], icon: '📝', color: 'green' },
  { keywords: ['edit'], icon: '✏️', color: 'green' },
  { keywords: ['bash'], icon: '💻', color: 'magenta' },
  { keywords: ['glob'], icon: '📁', color: 'cyan' },
  { keywords: ['grep'], icon: '🔍', color: 'cyan' },
  { keywords: ['web', 'fetch'], icon: '🌐', color: 'gray' },
  { keywords: ['task'], icon: '🤖', color: 'yellow' },
  { keywords: ['todo'], icon: '📋', color: 'gray' }
];

const DEFAULT_TOOL = { icon: '🔧', color: 'gray' };

/**
 * Get icon and color for tool type
 */
function getToolDisplay(tool: string): { icon: string; color: string } {
  const toolLower = tool.toLowerCase();
  for (const config of TOOL_CONFIG) {
    if (config.keywords.some(keyword => toolLower.includes(keyword))) {
      return { icon: config.icon, color: config.color };
    }
  }
  return DEFAULT_TOOL;
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

      const { icon, color } = getToolDisplay(toolName);

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
