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
  onClose: () => void;
  onNextTab: () => void;
  onPrevTab: () => void;
  onSetTab: (tab: ConfigTab) => void;
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
          <ConfigTab settings={settings} />
        )}
        {activeTab === 'usage' && (
          <UsageTab usage={usage} />
        )}
      </Box>

      {/* Help Footer */}
      <Box marginTop={1}>
        <Text dimColor>escape to close</Text>
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

// Config Tab Content
const ConfigTab: React.FC<{ settings: ConfigSettings }> = ({ settings }) => {
  return (
    <Box flexDirection="column">
      <Text dimColor>Configure preferences</Text>
      <Box height={1} />
      <ConfigRow
        label="Thinking mode"
        value={settings.thinkingMode ? 'true' : 'false'}
        valueColor={settings.thinkingMode ? 'green' : 'gray'}
      />
      <ConfigRow
        label="Verbose output"
        value={settings.verboseOutput ? 'true' : 'false'}
        valueColor={settings.verboseOutput ? 'green' : 'gray'}
      />
      <ConfigRow
        label="Permission mode"
        value={settings.permissionMode}
      />
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
