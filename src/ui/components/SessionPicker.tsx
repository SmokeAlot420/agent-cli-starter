/**
 * SessionPicker Component
 * Interactive dropdown for selecting previous sessions
 */

import React from 'react';
import { Box, Text } from 'ink';
import type { SessionListItem } from '../../types/index.js';

/**
 * Props for SessionPicker component
 */
export interface SessionPickerProps {
  /** Sessions to display */
  sessions: SessionListItem[];
  /** Currently selected index */
  selectedIndex: number;
  /** Maximum visible items (default: 8) */
  maxVisible?: number;
  /** Whether picker is in filter mode */
  filter?: string;
}

/**
 * Format relative time
 */
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

/**
 * Truncate text with ellipsis
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * SessionPicker displays a list of previous sessions for selection
 */
export const SessionPicker: React.FC<SessionPickerProps> = ({
  sessions,
  selectedIndex,
  maxVisible = 8,
  filter = ''
}) => {
  // Handle empty state
  if (sessions.length === 0) {
    return (
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="gray"
        paddingX={1}
        paddingY={1}
      >
        <Text bold color="cyan">PIV Loop Sessions</Text>
        <Box marginTop={1}>
          <Text dimColor italic>
            {filter ? 'No sessions match your search' : 'No previous sessions'}
          </Text>
        </Box>
        <Box marginTop={1}>
          <Text dimColor>Press </Text>
          <Text color="green" bold>N</Text>
          <Text dimColor> to start a new session</Text>
        </Box>
      </Box>
    );
  }

  // Calculate visible range with scroll offset
  const totalSessions = sessions.length;
  let startIndex = 0;

  // Keep selection visible with scrolling
  if (selectedIndex >= maxVisible) {
    startIndex = selectedIndex - maxVisible + 1;
  }

  const visibleSessions = sessions.slice(startIndex, startIndex + maxVisible);
  const hasMore = totalSessions > startIndex + maxVisible;
  const hasScrolledDown = startIndex > 0;

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      paddingX={1}
    >
      {/* Header */}
      <Box marginBottom={1}>
        <Text bold color="cyan">PIV Loop Sessions</Text>
        <Text dimColor> ({totalSessions} total)</Text>
      </Box>

      {/* Scroll up indicator */}
      {hasScrolledDown && (
        <Box>
          <Text dimColor italic>{'\u25b2'} {startIndex} more above...</Text>
        </Box>
      )}

      {/* Session list */}
      {visibleSessions.map((session, displayIndex) => {
        const actualIndex = startIndex + displayIndex;
        const isSelected = actualIndex === selectedIndex;
        const indicator = isSelected ? '\u25b8 ' : '  ';
        const displayName = session.name ?? truncate(session.initialPrompt, 40);
        const timeAgo = formatTimeAgo(session.lastActiveAt);

        return (
          <Box key={session.id} flexDirection="column" marginY={0}>
            {/* Main line: indicator, name, time */}
            <Box>
              <Text color={isSelected ? 'cyan' : 'white'} bold={isSelected}>
                {indicator}
              </Text>
              <Text color={isSelected ? 'cyan' : 'white'} bold={isSelected}>
                {displayName}
              </Text>
              <Text dimColor>  </Text>
              <Text dimColor>{timeAgo}</Text>
              <Text dimColor>  </Text>
              <Text color="gray">{session.messageCount} msgs</Text>
            </Box>

            {/* Sub-line: git branch if available */}
            {session.gitBranch && (
              <Box marginLeft={4}>
                <Text dimColor>
                  {'\u2514'} branch: {session.gitBranch}
                </Text>
              </Box>
            )}
          </Box>
        );
      })}

      {/* Scroll down indicator */}
      {hasMore && (
        <Box>
          <Text dimColor italic>
            {'\u25bc'} {totalSessions - startIndex - maxVisible} more...
          </Text>
        </Box>
      )}

      {/* Help text */}
      <Box marginTop={1} flexDirection="column">
        <Text dimColor>
          {'\u2191\u2193'} Navigate | Enter: Resume | N: New | D: Delete | /: Search | Esc: Cancel
        </Text>
      </Box>
    </Box>
  );
};

export default SessionPicker;
