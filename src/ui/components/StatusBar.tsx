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

/**
 * Get mode indicator for display
 */
function getModeIndicator(mode: string, showThinking: boolean): { text: string; color: string } {
  let modeText = '';
  let modeColor = 'gray';

  switch (mode) {
    case 'acceptEdits':
      modeText = 'accept edits on';
      modeColor = 'green';
      break;
    case 'plan':
      modeText = 'plan mode on';
      modeColor = 'cyan';
      break;
    case 'bypassPermissions':
      modeText = 'bypass on';
      modeColor = 'red';
      break;
    default:
      modeText = 'normal';
      modeColor = 'gray';
  }

  if (showThinking) {
    modeText += ' | thinking';
  }

  return { text: modeText, color: modeColor };
}

/**
 * Get color for context usage based on percentage
 */
function getContextColor(usage: number): string {
  if (usage < 50) return 'green';
  if (usage < 75) return 'yellow';
  return 'red';
}

/**
 * Get display text for thinking state
 */
function getStateDisplay(state: ThinkingState): { text: string; color: string } {
  switch (state) {
    case 'thinking':
      return { text: 'Thinking...', color: 'magenta' };
    case 'tool_use':
      return { text: 'Using tools', color: 'yellow' };
    default:
      return { text: 'Ready', color: 'green' };
  }
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
