/**
 * Header Component
 * Displays branding with ASCII art, working directory, and mode
 */

import React from 'react';
import { Box, Text } from 'ink';
import { useBranding } from '../context/BrandingContext.js';

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
export const Header: React.FC<HeaderProps> = ({ cwd, mode: _mode, verbose: _verbose, showLogo = true }) => {
  const branding = useBranding();

  return (
    <Box
      flexDirection="column"
      marginBottom={1}
    >
      {showLogo && (
        <Box flexDirection="column" marginBottom={0}>
          <Text color={branding.logoColor}>{branding.logo}</Text>
        </Box>
      )}
      <Box>
        <Text bold color={branding.logoColor}>{branding.productName}</Text>
        <Text dimColor> - {branding.tagline}</Text>
      </Box>
      <Text dimColor>{branding.subtitle}</Text>
      <Box marginTop={1}>
        <Text color="gray">📁 </Text>
        <Text>{cwd}</Text>
      </Box>
    </Box>
  );
};

export default Header;
