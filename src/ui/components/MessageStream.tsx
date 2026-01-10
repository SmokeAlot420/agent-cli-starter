/**
 * MessageStream Component
 * Displays streaming conversation messages
 */

import React from 'react';
import { Box, Text } from 'ink';
import type { ConversationMessage } from '../../conversation.js';
import { UltrathinkText } from './UltrathinkText.js';

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

    case 'tool_use':
      if (!verbose) return null;
      return (
        <Box paddingX={1} marginY={1}>
          <Text color="yellow">🔧 {message.content}</Text>
        </Box>
      );

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
