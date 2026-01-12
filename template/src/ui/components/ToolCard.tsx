/**
 * ToolCard Component
 * Display tool usage in a styled card
 */

import React from 'react';
import { Box, Text } from 'ink';

export interface ToolCardProps {
  /** Name of the tool being used */
  tool: string;
  /** Tool input parameters */
  input: unknown;
  /** Whether to show detailed input */
  verbose: boolean;
  /** Elapsed time in seconds */
  elapsed?: number;
}

/**
 * Get icon for tool type
 */
function getToolIcon(tool: string): string {
  const toolLower = tool.toLowerCase();
  if (toolLower.includes('read') || toolLower.includes('file')) return '📄';
  if (toolLower.includes('write') || toolLower.includes('edit')) return '✏️';
  if (toolLower.includes('bash') || toolLower.includes('shell')) return '💻';
  if (toolLower.includes('glob') || toolLower.includes('search')) return '🔍';
  if (toolLower.includes('grep')) return '🔎';
  if (toolLower.includes('web') || toolLower.includes('fetch')) return '🌐';
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
  return 'yellow';
}

/**
 * Format input for display
 */
function formatInput(input: unknown, maxLength = 100): string {
  try {
    const str = JSON.stringify(input, null, 2);
    if (str.length > maxLength) {
      return str.slice(0, maxLength) + '...';
    }
    return str;
  } catch {
    return String(input);
  }
}

/**
 * ToolCard component for displaying tool usage
 */
export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  input,
  verbose,
  elapsed
}) => {
  const icon = getToolIcon(tool);
  const color = getToolColor(tool);

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor={color}
      paddingX={1}
      marginY={1}
    >
      {/* Tool header */}
      <Box>
        <Text>{icon} </Text>
        <Text color={color} bold>{tool}</Text>
        {elapsed !== undefined && (
          <Text dimColor> ({elapsed}s)</Text>
        )}
      </Box>

      {/* Tool input (only in verbose mode) */}
      {verbose && input !== undefined && input !== null ? (
        <Box marginTop={1}>
          <Text dimColor>{formatInput(input, 200)}</Text>
        </Box>
      ) : null}
    </Box>
  );
};

export default ToolCard;
