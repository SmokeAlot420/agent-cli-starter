/**
 * StatusBar Component
 * Bottom bar showing context usage, state, and shortcuts
 */

import React from 'react';
import { Box, Text } from 'ink';

export type ThinkingState = 'idle' | 'thinking' | 'tool_use';

export interface StatusBarProps {
  /** Context/token usage percentage (0-100) */
  contextUsage: number;
  /** Current thinking state */
  thinkingState: ThinkingState;
  /** Permission mode */
  permissionMode: 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan' | string;
  /** Whether verbose thinking display is on */
  showThinking?: boolean;
  /** Whether agent is currently processing */
  isProcessing?: boolean;
}

/** Mode display configuration */
const MODE_CONFIG: Record<string, { text: string; color: string }> = {
  acceptEdits: { text: 'accept edits on', color: 'green' },
  plan: { text: 'plan mode on', color: 'cyan' },
  bypassPermissions: { text: 'bypass on', color: 'red' }
};

const DEFAULT_MODE = { text: 'normal', color: 'gray' };

/**
 * Get mode indicator for display
 */
function getModeIndicator(mode: string, showThinking: boolean): { text: string; color: string } {
  const config = MODE_CONFIG[mode] || DEFAULT_MODE;
  const text = showThinking ? `${config.text} | thinking` : config.text;
  return { text, color: config.color };
}

/**
 * Get color for context usage based on percentage
 */
function getContextColor(usage: number): string {
  if (usage >= 75) return 'red';
  if (usage >= 50) return 'yellow';
  return 'green';
}

/** Thinking state display configuration */
const STATE_CONFIG: Record<ThinkingState, { text: string; color: string }> = {
  thinking: { text: 'Thinking...', color: 'magenta' },
  tool_use: { text: 'Using tools', color: 'yellow' },
  idle: { text: 'Ready', color: 'green' }
};

/**
 * Get display text for thinking state
 */
function getStateDisplay(state: ThinkingState): { text: string; color: string } {
  return STATE_CONFIG[state];
}

/**
 * StatusBar component for bottom of screen
 */
export const StatusBar: React.FC<StatusBarProps> = ({
  contextUsage,
  thinkingState,
  permissionMode,
  showThinking = false,
  isProcessing = false
}) => {
  const stateDisplay = getStateDisplay(thinkingState);
  const contextColor = getContextColor(contextUsage);
  const modeDisplay = getModeIndicator(permissionMode, showThinking);

  return (
    <Box
      borderStyle="single"
      borderColor="gray"
      paddingX={1}
      justifyContent="space-between"
      marginTop={1}
    >
      {/* Left side: Context usage */}
      <Box>
        <Text dimColor>Context: </Text>
        <Text color={contextColor}>{contextUsage}%</Text>
      </Box>

      {/* Center: State indicator */}
      <Box>
        <Text color={stateDisplay.color}>{stateDisplay.text}</Text>
      </Box>

      {/* Right side: Mode and shortcuts */}
      <Box>
        <Text color={modeDisplay.color}>{modeDisplay.text}</Text>
        {isProcessing ? (
          <Text color="yellow"> | Esc to cancel</Text>
        ) : (
          <Text dimColor> | Shift+Tab mode | Ctrl+C exit</Text>
        )}
      </Box>
    </Box>
  );
};

export default StatusBar;
