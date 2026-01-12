/**
 * HelpPanel Component
 * Interactive tabbed help panel
 */

import React from 'react';
import { Box, Text, useInput } from 'ink';
import type { HelpTab } from '../hooks/useHelpPanel.js';

export interface HelpPanelProps {
  /** Currently active tab */
  activeTab: HelpTab;
  /** Callback when panel should close */
  onClose: () => void;
  /** Callback to go to next tab */
  onNextTab: () => void;
  /** Callback to go to previous tab */
  onPrevTab: () => void;
}

const TAB_LABELS: Record<HelpTab, string> = {
  commands: 'Commands',
  shortcuts: 'Shortcuts',
  tips: 'Tips'
};

const TABS: HelpTab[] = ['commands', 'shortcuts', 'tips'];

export const HelpPanel: React.FC<HelpPanelProps> = ({
  activeTab,
  onClose,
  onNextTab,
  onPrevTab
}) => {
  // Keyboard handling
  useInput((input, key) => {
    if (key.escape) {
      onClose();
    } else if (key.rightArrow || (key.tab && !key.shift)) {
      onNextTab();
    } else if (key.leftArrow || (key.shift && key.tab)) {
      onPrevTab();
    }
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      paddingX={1}
      marginTop={1}
    >
      {/* Tab Bar */}
      <Box marginBottom={1}>
        <Text bold color="cyan">Help: </Text>
        {TABS.map((tab, idx) => (
          <React.Fragment key={tab}>
            {idx > 0 && <Text dimColor>  </Text>}
            {activeTab === tab ? (
              <Text bold inverse> {TAB_LABELS[tab]} </Text>
            ) : (
              <Text dimColor>{TAB_LABELS[tab]}</Text>
            )}
          </React.Fragment>
        ))}
        <Text dimColor>  (←/→ to navigate)</Text>
      </Box>

      {/* Divider */}
      <Box marginBottom={1}>
        <Text dimColor>{'─'.repeat(60)}</Text>
      </Box>

      {/* Tab Content */}
      <Box flexDirection="column" minHeight={12}>
        {activeTab === 'commands' && <CommandsTab />}
        {activeTab === 'shortcuts' && <ShortcutsTab />}
        {activeTab === 'tips' && <TipsTab />}
      </Box>

      {/* Help Footer */}
      <Box marginTop={1}>
        <Text dimColor>←→ or Tab: Navigate tabs | Esc: Close</Text>
      </Box>
    </Box>
  );
};

// Commands Tab Content
const CommandsTab: React.FC = () => {
  const commandGroups = [
    {
      title: 'Session',
      commands: [
        { cmd: '/clear', desc: 'Clear conversation' },
        { cmd: '/resume', desc: 'Resume previous session' },
        { cmd: '/sessions', desc: 'List all sessions' }
      ]
    },
    {
      title: 'Settings',
      commands: [
        { cmd: '/config', desc: 'Open settings panel' },
        { cmd: '/model', desc: 'Change model' },
        { cmd: '/think', desc: 'Toggle thinking mode' }
      ]
    },
    {
      title: 'Info',
      commands: [
        { cmd: '/status', desc: 'Show status' },
        { cmd: '/context', desc: 'Show context usage' },
        { cmd: '/cost', desc: 'Show token costs' }
      ]
    },
    {
      title: 'Tools',
      commands: [
        { cmd: '/mcp', desc: 'MCP servers' },
        { cmd: '/memory', desc: 'Edit CLAUDE.md' },
        { cmd: '/plan', desc: 'Enter plan mode' }
      ]
    }
  ];

  return (
    <Box flexDirection="column">
      {commandGroups.map((group, gIdx) => (
        <Box key={group.title} flexDirection="column" marginBottom={gIdx < commandGroups.length - 1 ? 1 : 0}>
          <Text bold color="cyan">{group.title}</Text>
          {group.commands.map(({ cmd, desc }) => (
            <Box key={cmd}>
              <Text color="green">{cmd.padEnd(12)}</Text>
              <Text dimColor>{desc}</Text>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};

// Shortcuts Tab Content
const ShortcutsTab: React.FC = () => {
  const shortcuts = [
    { key: 'Esc', desc: 'Interrupt / Cancel / Close panel' },
    { key: 'Ctrl+C', desc: 'Exit application' },
    { key: 'Ctrl+R', desc: 'Open session picker' },
    { key: 'Shift+Tab', desc: 'Cycle permission mode' },
    { key: 'Tab', desc: 'Insert autocomplete / Navigate' },
    { key: '↑ / ↓', desc: 'Navigate lists / History' },
    { key: '← / →', desc: 'Navigate tabs' },
    { key: 'Enter', desc: 'Submit / Select / Activate' }
  ];

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">Keyboard Shortcuts</Text>
      <Box height={1} />
      {shortcuts.map(({ key, desc }) => (
        <Box key={key}>
          <Text color="yellow">{key.padEnd(14)}</Text>
          <Text dimColor>{desc}</Text>
        </Box>
      ))}
    </Box>
  );
};

// Tips Tab Content
const TipsTab: React.FC = () => {
  const tips = [
    'Type / to see all available commands',
    'Use /config to change settings interactively',
    'Press Shift+Tab to quickly change permission mode',
    '/model opens a selector to switch between models',
    'Commands auto-complete as you type',
    '/clear resets the conversation but keeps settings',
    'Use /resume to continue previous sessions',
    '/think toggles extended thinking mode for complex tasks'
  ];

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">Quick Tips</Text>
      <Box height={1} />
      {tips.map((tip, idx) => (
        <Box key={idx}>
          <Text color="gray">• </Text>
          <Text>{tip}</Text>
        </Box>
      ))}
    </Box>
  );
};

export default HelpPanel;
