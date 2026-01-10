/**
 * ThinkingIndicator Component
 * Animated spinner with elapsed time and tool name
 */

import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';

export interface ThinkingIndicatorProps {
  /** Whether thinking is active */
  active: boolean;
  /** Current tool being used (if any) */
  tool?: string;
  /** Elapsed time in seconds */
  elapsed: number;
}

/**
 * Format elapsed time for display
 */
function formatElapsed(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

/**
 * ThinkingIndicator with animated spinner
 */
export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({
  active,
  tool,
  elapsed
}) => {
  if (!active) {
    return null;
  }

  const message = tool ? `Using ${tool}` : 'Thinking';

  return (
    <Box paddingX={1} marginY={1}>
      <Text color="magenta">
        <Spinner type="dots" />
      </Text>
      <Text color="magenta"> {message}... </Text>
      <Text dimColor>({formatElapsed(elapsed)})</Text>
    </Box>
  );
};

export default ThinkingIndicator;
