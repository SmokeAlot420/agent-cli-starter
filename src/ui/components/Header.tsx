/**
 * Header Component
 * Displays branding with ASCII art, working directory, and mode
 */

import React from 'react';
import { Box, Text } from 'ink';
import { BRANDING } from '../../branding.js';

export interface HeaderProps {
  /** Current working directory */
  cwd: string;
  /** Operating mode */
  mode: 'interactive' | 'oneshot';
  /** Whether verbose output is enabled */
  verbose: boolean;
  /** Whether to show the ASCII art logo (default: true) */
  showLogo?: boolean;
}

/**
 * Header component with customizable branding and ASCII art
 */
export const Header: React.FC<HeaderProps> = ({ cwd, mode, verbose, showLogo = true }) => {
  return (
    <Box
      flexDirection="column"
      marginBottom={1}
    >
      {showLogo && (
        <Box flexDirection="column" marginBottom={0}>
          <Text color={BRANDING.logoColor}>{BRANDING.logo}</Text>
        </Box>
      )}
      <Box>
        <Text bold color={BRANDING.logoColor}>{BRANDING.productName}</Text>
        <Text dimColor> - {BRANDING.tagline}</Text>
      </Box>
      <Text dimColor>{BRANDING.subtitle}</Text>
      <Box marginTop={1}>
        <Text color="gray">📁 </Text>
        <Text>{cwd}</Text>
      </Box>
      <Box>
        <Text color="gray">Mode: </Text>
        <Text color={mode === 'interactive' ? 'green' : 'yellow'}>
          {mode === 'interactive' ? 'Interactive' : 'One-shot'}
        </Text>
        {verbose && (
          <>
            <Text color="gray"> | </Text>
            <Text color="magenta">Verbose</Text>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Header;
