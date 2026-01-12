/**
 * PermissionPrompt Component
 *
 * Displays an interactive permission prompt for dangerous tool executions.
 * User can press Y (allow once), A (always allow), or N (deny).
 */

import React from 'react';
import { Box, Text, useInput } from 'ink';
import type { PermissionRequest, PermissionResponse } from '../hooks/usePermission.js';

/** Props for PermissionPrompt component */
export interface PermissionPromptProps {
  /** The pending permission request */
  request: PermissionRequest;
  /** Callback when user responds */
  onRespond: (response: PermissionResponse) => void;
}

/**
 * Format tool input for display
 */
function formatInput(toolName: string, input: Record<string, unknown>): string {
  // For Bash, show the command
  if (toolName === 'Bash' && typeof input.command === 'string') {
    const cmd = input.command;
    return cmd.length > 60 ? cmd.substring(0, 60) + '...' : cmd;
  }

  // For Write/Edit, show the file path
  if ((toolName === 'Write' || toolName === 'Edit') && typeof input.file_path === 'string') {
    return input.file_path;
  }

  // For NotebookEdit, show notebook path
  if (toolName === 'NotebookEdit' && typeof input.notebook_path === 'string') {
    return input.notebook_path;
  }

  // Fallback to JSON (truncated)
  const json = JSON.stringify(input);
  return json.length > 60 ? json.substring(0, 60) + '...' : json;
}

/**
 * Interactive permission prompt component
 *
 * @example
 * ```tsx
 * {pendingRequest && (
 *   <PermissionPrompt
 *     request={pendingRequest}
 *     onRespond={respond}
 *   />
 * )}
 * ```
 */
export function PermissionPrompt({ request, onRespond }: PermissionPromptProps): React.ReactElement {
  // Handle Y/A/N keyboard input
  useInput((input) => {
    const key = input.toLowerCase();
    if (key === 'y') {
      onRespond('allow');
    } else if (key === 'a') {
      onRespond('always');
    } else if (key === 'n') {
      onRespond('deny');
    }
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="yellow"
      paddingX={1}
      marginY={1}
    >
      {/* Header */}
      <Text bold color="yellow">Permission Required</Text>
      <Text> </Text>

      {/* Tool info */}
      <Text>
        Tool: <Text bold>{request.toolName}</Text>
      </Text>
      <Text dimColor>{formatInput(request.toolName, request.toolInput)}</Text>

      {/* Decision reason if provided */}
      {request.decisionReason && (
        <Text dimColor>Reason: {request.decisionReason}</Text>
      )}

      <Text> </Text>

      {/* Options */}
      <Box>
        <Text color="green">[Y]</Text>
        <Text> Allow once  </Text>
        <Text color="cyan">[A]</Text>
        <Text> Always allow  </Text>
        <Text color="red">[N]</Text>
        <Text> Deny</Text>
      </Box>
    </Box>
  );
}
