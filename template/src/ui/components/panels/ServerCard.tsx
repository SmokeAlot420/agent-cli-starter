/**
 * ServerCard Component
 * Individual MCP server status card with selection highlighting
 */

import React from 'react';
import { Box, Text } from 'ink';

export interface ServerCardProps {
  /** Server name */
  name: string;
  /** Server transport type */
  type: 'stdio' | 'http' | 'sse';
  /** Whether server is connected/healthy */
  connected: boolean;
  /** Error message if connection failed */
  error?: string;
  /** Whether this card is currently selected */
  isSelected: boolean;
  /** When health was last checked */
  lastChecked?: Date;
}

/**
 * Get color for connection status
 */
function getStatusColor(connected: boolean): string {
  return connected ? 'green' : 'red';
}

/**
 * Get color for type badge
 */
function getTypeColor(type: 'stdio' | 'http' | 'sse'): string {
  switch (type) {
    case 'http':
      return 'cyan';
    case 'sse':
      return 'magenta';
    case 'stdio':
      return 'yellow';
    default:
      return 'gray';
  }
}

/**
 * Format last checked time for display
 */
function formatLastChecked(date?: Date): string {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
}

/**
 * ServerCard displays a single MCP server's status
 */
export const ServerCard: React.FC<ServerCardProps> = ({
  name,
  type,
  connected,
  error,
  isSelected,
  lastChecked
}) => {
  const statusColor = getStatusColor(connected);
  const typeColor = getTypeColor(type);
  const statusDot = connected ? '●' : '○';
  const statusText = connected ? 'connected' : 'offline';

  return (
    <Box
      paddingX={1}
      borderStyle={isSelected ? 'round' : undefined}
      borderColor={isSelected ? 'cyan' : undefined}
    >
      {/* Status indicator */}
      <Box width={2}>
        <Text color={statusColor}>{statusDot}</Text>
      </Box>

      {/* Server name */}
      <Box width={16}>
        <Text bold={isSelected} color={isSelected ? 'cyan' : undefined}>
          {name}
        </Text>
      </Box>

      {/* Type badge */}
      <Box width={8}>
        <Text color={typeColor}>{type}</Text>
      </Box>

      {/* Status text */}
      <Box width={12}>
        <Text color={statusColor}>{statusText}</Text>
      </Box>

      {/* Last checked */}
      {lastChecked && (
        <Box>
          <Text dimColor>{formatLastChecked(lastChecked)}</Text>
        </Box>
      )}

      {/* Error message if present */}
      {error && !connected && (
        <Box marginLeft={1}>
          <Text color="red" dimColor>
            ({error})
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default ServerCard;
