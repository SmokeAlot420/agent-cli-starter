/**
 * ConfigPanel Component
 * Claude Code-style tabbed configuration panel
 */

import React from 'react';
import { Box, Text, useInput } from 'ink';
import type { ConfigTab, ConfigStatus, ConfigSettings, ConfigUsage } from '../hooks/useConfigPanel.js';

export interface ConfigPanelProps {
  activeTab: ConfigTab;
  status: ConfigStatus;
  settings: ConfigSettings;
  usage: ConfigUsage;
  mcpServers?: Record<string, { connected: boolean }>;
  /** Currently selected setting index in Config tab */
  selectedSettingIndex?: number;
  onClose: () => void;
  onNextTab: () => void;
  onPrevTab: () => void;
  onSetTab: (tab: ConfigTab) => void;
  /** Navigate to next setting in Config tab */
  onSelectNextSetting?: () => void;
  /** Navigate to previous setting in Config tab */
  onSelectPrevSetting?: () => void;
  /** Activate the selected setting */
  onActivateSetting?: () => void;
}

const TAB_LABELS: Record<ConfigTab, string> = {
  status: 'Status',
  config: 'Config',
  usage: 'Usage'
};

const TABS: ConfigTab[] = ['status', 'config', 'usage'];

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  activeTab,
  status,
  settings,
  usage,
  mcpServers = {},
  selectedSettingIndex = 0,
  onClose,
  onNextTab,
  onPrevTab,
  onSelectNextSetting,
  onSelectPrevSetting,
  onActivateSetting
}) => {
  // Keyboard handling
  useInput((input, key) => {
    if (key.escape) {
      onClose();
    } else if (activeTab === 'config') {
      // In Config tab: up/down navigate settings, Enter activates
      if (key.upArrow) {
        onSelectPrevSetting?.();
      } else if (key.downArrow) {
        onSelectNextSetting?.();
      } else if (key.return) {
        onActivateSetting?.();
      } else if (key.rightArrow || (key.tab && !key.shift)) {
        onNextTab();
      } else if (key.leftArrow || (key.shift && key.tab)) {
        onPrevTab();
      }
    } else {
      // Other tabs: left/right navigate tabs
      if (key.rightArrow || (key.tab && !key.shift)) {
        onNextTab();
      } else if (key.leftArrow || (key.shift && key.tab)) {
        onPrevTab();
      }
    }
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="gray"
      paddingX={1}
      marginTop={1}
    >
      {/* Tab Bar */}
      <Box marginBottom={1}>
        <Text dimColor>Settings: </Text>
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
        <Text dimColor>  (←/→ or tab to cycle)</Text>
      </Box>

      {/* Divider */}
      <Box marginBottom={1}>
        <Text dimColor>{'─'.repeat(60)}</Text>
      </Box>

      {/* Tab Content */}
      <Box flexDirection="column" minHeight={10}>
        {activeTab === 'status' && (
          <StatusTab status={status} mcpServers={mcpServers} />
        )}
        {activeTab === 'config' && (
          <EditableConfigTab
            settings={settings}
            model={status.model}
            selectedIndex={selectedSettingIndex}
          />
        )}
        {activeTab === 'usage' && (
          <UsageTab usage={usage} />
        )}
      </Box>

      {/* Help Footer */}
      <Box marginTop={1}>
        <Text dimColor>
          {activeTab === 'config'
            ? '↑↓ Navigate | Enter: Change | ←→ Tabs | Esc: Close'
            : '←→ or Tab: Navigate tabs | Esc: Close'}
        </Text>
      </Box>
    </Box>
  );
};

// Status Tab Content
const StatusTab: React.FC<{
  status: ConfigStatus;
  mcpServers: Record<string, { connected: boolean }>;
}> = ({ status, mcpServers }) => {
  const serverNames = Object.keys(mcpServers);

  return (
    <Box flexDirection="column">
      <ConfigRow label="Version" value={status.version} />
      {status.sessionId && (
        <ConfigRow label="Session ID" value={status.sessionId} />
      )}
      <ConfigRow label="cwd" value={status.cwd} />
      <Box height={1} />
      <ConfigRow
        label="Model"
        value={`${status.model} (${status.modelId})`}
      />
      {serverNames.length > 0 && (
        <Box>
          <Text dimColor>{'MCP servers: '.padEnd(20)}</Text>
          <Text>
            {serverNames.map((name, idx) => {
              const server = mcpServers[name];
              const icon = server.connected ? '✓' : '✗';
              const color = server.connected ? 'green' : 'red';
              return (
                <Text key={name}>
                  {idx > 0 && ', '}
                  {name} <Text color={color}>{icon}</Text>
                </Text>
              );
            })}
          </Text>
        </Box>
      )}
      <ConfigRow
        label="Thinking tokens"
        value={status.thinkingTokens.toLocaleString()}
      />
    </Box>
  );
};

// Editable Config Tab Content
const EditableConfigTab: React.FC<{
  settings: ConfigSettings;
  model: string;
  selectedIndex: number;
}> = ({ settings, model, selectedIndex }) => {
  // Settings in order: model, thinking, permission, verbose
  const settingRows = [
    { label: 'Model', value: model, valueColor: 'cyan' },
    { label: 'Thinking mode', value: settings.thinkingMode ? 'on' : 'off', valueColor: settings.thinkingMode ? 'green' : 'gray' },
    { label: 'Permission mode', value: settings.permissionMode, valueColor: undefined },
    { label: 'Verbose output', value: settings.verboseOutput ? 'on' : 'off', valueColor: settings.verboseOutput ? 'green' : 'gray' }
  ];

  return (
    <Box flexDirection="column">
      <Text dimColor>Configure preferences (Enter to change)</Text>
      <Box height={1} />
      {settingRows.map((row, idx) => {
        const isSelected = idx === selectedIndex;
        const indicator = isSelected ? '\u25b8 ' : '  ';
        return (
          <Box key={row.label}>
            <Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
              {indicator}
            </Text>
            <Text color={isSelected ? 'cyan' : 'gray'} bold={isSelected}>
              {(row.label + ': ').padEnd(18)}
            </Text>
            <Text color={row.valueColor} bold={isSelected}>{row.value}</Text>
          </Box>
        );
      })}
    </Box>
  );
};

// Usage Tab Content
const UsageTab: React.FC<{ usage: ConfigUsage }> = ({ usage }) => {
  const contextColor =
    usage.contextPercent > 80 ? 'red' :
    usage.contextPercent > 60 ? 'yellow' : 'green';

  return (
    <Box flexDirection="column">
      <Text dimColor>Session usage statistics</Text>
      <Box height={1} />
      <Box>
        <Text dimColor>{'Context used: '.padEnd(20)}</Text>
        <Text color={contextColor}>{usage.contextPercent}%</Text>
      </Box>
    </Box>
  );
};

// Helper component for consistent row formatting
const ConfigRow: React.FC<{
  label: string;
  value: string;
  valueColor?: string;
}> = ({ label, value, valueColor }) => (
  <Box>
    <Text dimColor>{(label + ': ').padEnd(20)}</Text>
    <Text color={valueColor}>{value}</Text>
  </Box>
);

export default ConfigPanel;
