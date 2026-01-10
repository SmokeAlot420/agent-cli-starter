/**
 * McpPanel Component
 * Interactive MCP server management panel with keyboard navigation
 */

import React, { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import Spinner from 'ink-spinner';
import { ServerCard } from './ServerCard.js';
import { ServerActions, type ServerAction } from './ServerActions.js';
import { useMcpHealth } from '../../hooks/useMcpHealth.js';
import type { McpServersConfig, McpServerConfig } from '../../../features/mcp.js';

export interface McpPanelProps {
  /** MCP server configuration to display */
  servers: McpServersConfig;
  /** Callback when panel should close */
  onClose: () => void;
  /** Optional callback for server actions */
  onServerAction?: (server: string, action: ServerAction) => void;
}

/**
 * Get server type from config
 */
function getServerType(config: McpServerConfig): 'stdio' | 'http' | 'sse' {
  return config.type;
}

/**
 * McpPanel provides an interactive server management interface
 */
export const McpPanel: React.FC<McpPanelProps> = ({
  servers,
  onClose,
  onServerAction
}) => {
  const serverNames = Object.keys(servers);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const [actionServer, setActionServer] = useState<string | null>(null);

  // Health polling
  const { health, isLoading, refresh } = useMcpHealth(servers);

  // Handle keyboard input when action menu is not open
  useInput((input, key) => {
    if (showActions) return; // Let ServerActions handle input

    // Navigation
    if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex(prev => Math.min(serverNames.length - 1, prev + 1));
    }

    // Open action menu
    if (key.return && serverNames.length > 0) {
      setActionServer(serverNames[selectedIndex]);
      setShowActions(true);
    }

    // Refresh health
    if (input === 'r' || input === 'R') {
      refresh();
    }

    // Close panel
    if (key.escape) {
      onClose();
    }
  });

  /**
   * Handle action selection from menu
   */
  const handleAction = useCallback((action: ServerAction) => {
    if (actionServer && onServerAction) {
      onServerAction(actionServer, action);
    }
    setShowActions(false);
    setActionServer(null);
  }, [actionServer, onServerAction]);

  /**
   * Handle action menu cancel
   */
  const handleActionCancel = useCallback(() => {
    setShowActions(false);
    setActionServer(null);
  }, []);

  // Empty state
  if (serverNames.length === 0) {
    return (
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="gray"
        paddingX={2}
        paddingY={1}
      >
        <Text bold color="cyan">MCP Servers</Text>
        <Box marginY={1}>
          <Text dimColor>No MCP servers configured.</Text>
        </Box>
        <Text dimColor>Esc: Close</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {/* Main panel */}
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="gray"
        paddingX={1}
      >
        {/* Header */}
        <Box justifyContent="space-between" marginBottom={1}>
          <Text bold color="cyan">MCP Servers</Text>
          <Box>
            {isLoading && (
              <Box marginRight={1}>
                <Text color="yellow">
                  <Spinner type="dots" />
                </Text>
              </Box>
            )}
            <Text dimColor>
              {serverNames.length} server{serverNames.length !== 1 ? 's' : ''}
            </Text>
          </Box>
        </Box>

        {/* Server list */}
        <Box flexDirection="column">
          {serverNames.map((name, index) => {
            const config = servers[name];
            const serverHealth = health[name];

            return (
              <ServerCard
                key={name}
                name={name}
                type={getServerType(config)}
                connected={serverHealth?.connected ?? false}
                error={serverHealth?.error}
                isSelected={index === selectedIndex}
                lastChecked={serverHealth?.lastChecked}
              />
            );
          })}
        </Box>

        {/* Help footer */}
        <Box marginTop={1} borderStyle="single" borderColor="gray" borderTop borderBottom={false} borderLeft={false} borderRight={false}>
          <Text dimColor>
            ↑↓ Navigate | Enter: Actions | r: Refresh | Esc: Close
          </Text>
        </Box>
      </Box>

      {/* Action menu overlay */}
      {showActions && actionServer && (
        <Box marginTop={1}>
          <ServerActions
            serverName={actionServer}
            isConnected={health[actionServer]?.connected ?? false}
            onAction={handleAction}
            onCancel={handleActionCancel}
          />
        </Box>
      )}
    </Box>
  );
};

export default McpPanel;
