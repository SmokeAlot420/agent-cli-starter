/**
 * ServerActions Component
 * Action menu for MCP server operations using SelectInput
 */

import React from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';

export type ServerAction = 'view' | 'connect' | 'disconnect' | 'remove';

export interface ServerActionsProps {
  /** Name of the server being acted upon */
  serverName: string;
  /** Whether the server is currently connected */
  isConnected: boolean;
  /** Callback when an action is selected */
  onAction: (action: ServerAction) => void;
  /** Callback when user cancels (escape key) */
  onCancel: () => void;
}

interface ActionItem {
  label: string;
  value: ServerAction;
}

/**
 * Get available actions based on connection state
 */
function getActions(isConnected: boolean): ActionItem[] {
  const actions: ActionItem[] = [
    { label: 'View Details', value: 'view' }
  ];

  if (isConnected) {
    actions.push({ label: 'Disconnect', value: 'disconnect' });
  } else {
    actions.push({ label: 'Connect', value: 'connect' });
  }

  actions.push({ label: 'Remove Server', value: 'remove' });

  return actions;
}

/**
 * ServerActions provides an action menu for server operations
 */
export const ServerActions: React.FC<ServerActionsProps> = ({
  serverName,
  isConnected,
  onAction,
  onCancel
}) => {
  const actions = getActions(isConnected);

  // Handle escape key to cancel
  useInput((input, key) => {
    if (key.escape) {
      onCancel();
    }
  });

  const handleSelect = (item: ActionItem) => {
    onAction(item.value);
  };

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      paddingX={1}
      paddingY={0}
    >
      {/* Header */}
      <Box marginBottom={1}>
        <Text bold color="cyan">
          Actions for {serverName}
        </Text>
      </Box>

      {/* Action list */}
      <SelectInput
        items={actions}
        onSelect={handleSelect}
      />

      {/* Help text */}
      <Box marginTop={1}>
        <Text dimColor>
          ↑↓ Navigate | Enter: Select | Esc: Cancel
        </Text>
      </Box>
    </Box>
  );
};

export default ServerActions;
