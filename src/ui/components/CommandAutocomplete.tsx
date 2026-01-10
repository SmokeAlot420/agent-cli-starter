/**
 * CommandAutocomplete Component
 * Dropdown menu showing filtered slash commands with selection indicator
 */

import React from 'react';
import { Box, Text } from 'ink';
import type { SlashCommand } from '../../features/commands.js';

/**
 * Props for CommandAutocomplete component
 */
export interface CommandAutocompleteProps {
  /** Filtered commands to display */
  commands: SlashCommand[];
  /** Currently selected index */
  selectedIndex: number;
  /** Maximum number of commands to show (default: 8) */
  maxVisible?: number;
}

/**
 * Get color for command source type
 */
function getSourceColor(sourceType: SlashCommand['sourceType']): string {
  switch (sourceType) {
    case 'builtin':
      return 'blue';
    case 'user':
      return 'green';
    case 'project':
      return 'yellow';
    case 'plugin':
      return 'magenta';
    default:
      return 'white';
  }
}

/**
 * CommandAutocomplete displays a dropdown of filtered slash commands
 *
 * @example
 * ```tsx
 * <CommandAutocomplete
 *   commands={filteredCommands}
 *   selectedIndex={0}
 *   maxVisible={8}
 * />
 * ```
 */
export const CommandAutocomplete: React.FC<CommandAutocompleteProps> = ({
  commands,
  selectedIndex,
  maxVisible = 8
}) => {
  // Handle empty commands
  if (commands.length === 0) {
    return (
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="gray"
        paddingX={1}
        marginLeft={2}
      >
        <Text dimColor italic>No commands match</Text>
      </Box>
    );
  }

  // Determine visible range with scrolling
  const totalCommands = commands.length;
  const visibleCommands = commands.slice(0, maxVisible);
  const hasMore = totalCommands > maxVisible;

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      paddingX={1}
      marginLeft={2}
    >
      {visibleCommands.map((cmd, index) => {
        const isSelected = index === selectedIndex;
        const color = getSourceColor(cmd.sourceType);
        const indicator = isSelected ? '\u25b8 ' : '  ';
        const argHint = cmd.metadata.argumentHint
          ? ` <${cmd.metadata.argumentHint}>`
          : '';

        return (
          <Box key={cmd.name} flexDirection="column">
            {/* Command name line */}
            <Box>
              <Text color={isSelected ? 'cyan' : 'white'} bold={isSelected}>
                {indicator}
              </Text>
              <Text color={color} bold={isSelected}>
                /{cmd.name}
              </Text>
              <Text dimColor>{argHint}</Text>
            </Box>
            {/* Description line */}
            <Box marginLeft={4}>
              <Text dimColor>{cmd.description}</Text>
            </Box>
          </Box>
        );
      })}

      {/* Scroll indicator */}
      {hasMore && (
        <Box marginTop={0}>
          <Text dimColor italic>
            {'\u25bc'} {totalCommands - maxVisible} more...
          </Text>
        </Box>
      )}

      {/* Help text */}
      <Box marginTop={1}>
        <Text dimColor>
          {'\u2191\u2193'} Navigate | Tab/Enter: Select | Esc: Close
        </Text>
      </Box>
    </Box>
  );
};

export default CommandAutocomplete;
