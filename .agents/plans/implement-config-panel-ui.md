# Feature: Claude Code-style /config Tabbed UI

The following plan should be complete, but validate documentation and codebase patterns before implementing.

Pay special attention to naming of existing utils, types, and models. Import from the right files.

## Feature Description

Create a Claude Code-style `/config` command with an interactive tabbed UI displaying Status, Config, and Usage information. Users can navigate between tabs with arrow keys and close with Escape.

## User Story

As a CLI user
I want to view my configuration in a clean tabbed interface
So that I can quickly see status, settings, and usage without text dumping

## Problem Statement

Currently `/config` is just a markdown prompt that dumps raw text. This doesn't match Claude Code's polished tabbed UI and creates a poor user experience.

## Solution Statement

Create a ConfigPanel component with three tabs (Status | Config | Usage), keyboard navigation, and proper integration with App.tsx following existing panel patterns (McpPanel, SessionPicker).

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**: UI components, hooks, App.tsx integration
**Dependencies**: ink, react, existing MCP health system

---

## CONTEXT REFERENCES

### Relevant Codebase Files - MUST READ BEFORE IMPLEMENTING!

- `src/ui/components/panels/McpPanel.tsx` (all) - **PRIMARY PATTERN**: Panel with keyboard nav, useInput, conditional rendering
- `src/ui/hooks/useSessionPicker.ts` (all) - **Hook pattern**: open/close state, callbacks, return interface
- `src/ui/hooks/useMcpHealth.ts` (all) - **Async state**: polling, loading states
- `src/ui/App.tsx` (lines 80-200) - **Integration pattern**: how panels are triggered, rendered, keyboard handled
- `src/conversation/commands.ts` (lines 154-161) - **Command handler**: 'openConfig' action already exists!
- `src/branding.ts` (all) - **Version/product info**: productName, tagline, logoColor
- `src/constants.ts` (all) - **Model config**: DEFAULT_MODEL, ULTRATHINK_TOKENS

### New Files to Create

- `src/ui/components/ConfigPanel.tsx` - Main tabbed panel component
- `src/ui/hooks/useConfigPanel.ts` - Panel state management hook
- `tests/ui/config-panel.test.tsx` - Component tests

### Files to Update

- `src/ui/App.tsx` - Add ConfigPanel integration
- `src/ui/components/index.ts` - Export ConfigPanel
- `src/ui/hooks/index.ts` - Export useConfigPanel
- `src/conversation/commands.ts` - Wire up 'openConfig' action

### Patterns to Follow

**Panel Component Pattern (from McpPanel.tsx):**
```tsx
export const ConfigPanel: React.FC<ConfigPanelProps> = ({ onClose, ... }) => {
  const [activeTab, setActiveTab] = useState<'status' | 'config' | 'usage'>('status');

  useInput((input, key) => {
    if (key.leftArrow || (key.shift && key.tab)) {
      // Previous tab
    }
    if (key.rightArrow || key.tab) {
      // Next tab
    }
    if (key.escape) {
      onClose();
    }
  });

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="gray">
      {/* Tab bar */}
      {/* Tab content */}
      {/* Help footer */}
    </Box>
  );
};
```

**Hook Pattern (from useSessionPicker.ts):**
```tsx
export interface UseConfigPanelReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  // ... tab state if managed here
}

export function useConfigPanel(): UseConfigPanelReturn {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  return { isOpen, open, close };
}
```

**App.tsx Integration Pattern:**
```tsx
// In App component
const configPanel = useConfigPanel();

// In onAction handler
if (action === 'openConfig') {
  configPanel.open();
}

// In render
{configPanel.isOpen && <ConfigPanel onClose={configPanel.close} ... />}
```

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation - Create Hook

Create the useConfigPanel hook to manage panel open/close state.

### Phase 2: Core Implementation - Create ConfigPanel Component

Build the ConfigPanel with:
- Tab bar (Status | Config | Usage)
- Tab content areas
- Keyboard navigation
- Escape to close

### Phase 3: Integration - Wire into App.tsx

Connect ConfigPanel to App.tsx and command system.

### Phase 4: Testing & Validation

Add tests and verify functionality.

---

## STEP-BY-STEP TASKS

### Task 1: CREATE `src/ui/hooks/useConfigPanel.ts`

**IMPLEMENT**: Hook for managing config panel open/close state and gathering config data

**PATTERN**: Follow `useSessionPicker.ts` structure (lines 1-182)

**IMPORTS**:
```tsx
import { useState, useCallback, useMemo } from 'react';
import { BRANDING } from '../../branding.js';
import { DEFAULT_MODEL, ULTRATHINK_TOKENS } from '../../constants.js';
```

**CODE**:
```tsx
/**
 * Config Panel Hook
 * Manages state for the /config tabbed UI panel
 */

import { useState, useCallback } from 'react';
import { BRANDING } from '../../branding.js';
import { DEFAULT_MODEL, ULTRATHINK_TOKENS } from '../../constants.js';

export type ConfigTab = 'status' | 'config' | 'usage';

export interface ConfigStatus {
  version: string;
  productName: string;
  sessionId?: string;
  cwd: string;
  model: string;
  modelId: string;
  thinkingTokens: number;
}

export interface ConfigSettings {
  thinkingMode: boolean;
  verboseOutput: boolean;
  permissionMode: string;
}

export interface ConfigUsage {
  contextPercent: number;
  // Future: tokens, cost, etc.
}

export interface UseConfigPanelOptions {
  cwd?: string;
  sessionId?: string;
  model?: string;
  thinkingEnabled?: boolean;
  verbose?: boolean;
  permissionMode?: string;
  contextPercent?: number;
}

export interface UseConfigPanelReturn {
  isOpen: boolean;
  activeTab: ConfigTab;
  status: ConfigStatus;
  settings: ConfigSettings;
  usage: ConfigUsage;
  open: () => void;
  close: () => void;
  setTab: (tab: ConfigTab) => void;
  nextTab: () => void;
  prevTab: () => void;
}

const TABS: ConfigTab[] = ['status', 'config', 'usage'];

export function useConfigPanel(
  options: UseConfigPanelOptions = {}
): UseConfigPanelReturn {
  const {
    cwd = process.cwd(),
    sessionId,
    model = 'opus',
    thinkingEnabled = false,
    verbose = false,
    permissionMode = 'default',
    contextPercent = 0
  } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ConfigTab>('status');

  // Build status info
  const status: ConfigStatus = {
    version: '1.0.0',
    productName: BRANDING.productName,
    sessionId,
    cwd,
    model,
    modelId: DEFAULT_MODEL,
    thinkingTokens: ULTRATHINK_TOKENS
  };

  // Build settings info
  const settings: ConfigSettings = {
    thinkingMode: thinkingEnabled,
    verboseOutput: verbose,
    permissionMode
  };

  // Build usage info
  const usage: ConfigUsage = {
    contextPercent
  };

  const open = useCallback(() => {
    setIsOpen(true);
    setActiveTab('status');
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const setTab = useCallback((tab: ConfigTab) => {
    setActiveTab(tab);
  }, []);

  const nextTab = useCallback(() => {
    setActiveTab(current => {
      const idx = TABS.indexOf(current);
      return TABS[(idx + 1) % TABS.length];
    });
  }, []);

  const prevTab = useCallback(() => {
    setActiveTab(current => {
      const idx = TABS.indexOf(current);
      return TABS[(idx - 1 + TABS.length) % TABS.length];
    });
  }, []);

  return {
    isOpen,
    activeTab,
    status,
    settings,
    usage,
    open,
    close,
    setTab,
    nextTab,
    prevTab
  };
}

export default useConfigPanel;
```

**VALIDATE**: `cd /c/Users/Degen/claude-cli-template && npx tsc --noEmit src/ui/hooks/useConfigPanel.ts`

---

### Task 2: CREATE `src/ui/components/ConfigPanel.tsx`

**IMPLEMENT**: Tabbed panel component with Status, Config, Usage tabs

**PATTERN**: Follow `McpPanel.tsx` structure for keyboard handling and layout

**IMPORTS**:
```tsx
import React from 'react';
import { Box, Text, useInput } from 'ink';
import type { ConfigTab, ConfigStatus, ConfigSettings, ConfigUsage } from '../hooks/useConfigPanel.js';
```

**CODE**:
```tsx
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
```

**VALIDATE**: `cd /c/Users/Degen/claude-cli-template && npx tsc --noEmit src/ui/components/ConfigPanel.tsx`

---

### Task 3: UPDATE `src/ui/hooks/index.ts`

**IMPLEMENT**: Export the new useConfigPanel hook

**PATTERN**: Follow existing export pattern in file

**ADD** at end of file:
```tsx
export { useConfigPanel } from './useConfigPanel.js';
export type {
  UseConfigPanelOptions,
  UseConfigPanelReturn,
  ConfigTab,
  ConfigStatus,
  ConfigSettings,
  ConfigUsage
} from './useConfigPanel.js';
```

**VALIDATE**: `cd /c/Users/Degen/claude-cli-template && npx tsc --noEmit src/ui/hooks/index.ts`

---

### Task 4: UPDATE `src/ui/components/index.ts`

**IMPLEMENT**: Export the new ConfigPanel component

**PATTERN**: Follow existing export pattern in file

**ADD** at end of file:
```tsx
export { ConfigPanel } from './ConfigPanel.js';
export type { ConfigPanelProps } from './ConfigPanel.js';
```

**VALIDATE**: `cd /c/Users/Degen/claude-cli-template && npx tsc --noEmit src/ui/components/index.ts`

---

### Task 5: UPDATE `src/ui/App.tsx`

**IMPLEMENT**: Integrate ConfigPanel into the App component

**PATTERN**: Follow SessionPicker integration pattern (lines 80-200)

**CHANGES**:

1. **Add import** at top:
```tsx
import { ConfigPanel } from './components/ConfigPanel.js';
import { useConfigPanel } from './hooks/useConfigPanel.js';
```

2. **Add hook** after sessionPicker hook (around line 95):
```tsx
const configPanel = useConfigPanel({
  cwd,
  sessionId: agent.sessionId,
  model: agentOptions?.model || 'opus',
  thinkingEnabled: agent.thinkingEnabled || false,
  verbose,
  permissionMode: agentOptions?.permissionMode || 'default',
  contextPercent: contextUsage
});
```

3. **Add to onAction handler** (around line 125):
```tsx
if (action === 'openConfig') {
  configPanel.open();
}
```

4. **Add keyboard handler** for config panel (after session picker keyboard handler):
```tsx
useInput(
  (input, key) => {
    if (!configPanel.isOpen) return;

    if (key.escape) {
      configPanel.close();
    } else if (key.rightArrow || (key.tab && !key.shift)) {
      configPanel.nextTab();
    } else if (key.leftArrow || (key.shift && key.tab)) {
      configPanel.prevTab();
    }
  },
  { isActive: configPanel.isOpen }
);
```

5. **Add render** (after SessionPicker render, around line 265):
```tsx
{configPanel.isOpen && (
  <ConfigPanel
    activeTab={configPanel.activeTab}
    status={configPanel.status}
    settings={configPanel.settings}
    usage={configPanel.usage}
    mcpServers={mcpHealth}
    onClose={configPanel.close}
    onNextTab={configPanel.nextTab}
    onPrevTab={configPanel.prevTab}
    onSetTab={configPanel.setTab}
  />
)}
```

6. **Update InputPrompt condition** to hide when config panel is open:
```tsx
{mode === 'interactive' && !pendingRequest && !sessionPicker.isOpen && !configPanel.isOpen && (
```

**VALIDATE**: `cd /c/Users/Degen/claude-cli-template && npx tsc --noEmit src/ui/App.tsx`

---

### Task 6: UPDATE `src/conversation/commands.ts`

**IMPLEMENT**: Wire up the 'config' command to trigger openConfig action

**LOCATE**: Find the switch statement in handleBuiltinCommand (around line 100)

**UPDATE** the 'config' case (if exists) or add it:
```tsx
case 'config':
case 'settings':
  return {
    message: null,  // No text output - panel handles display
    action: { type: 'openConfig' }
  };
```

**GOTCHA**: The 'openConfig' action type should already be defined in BuiltinCommandAction type

**VALIDATE**: `cd /c/Users/Degen/claude-cli-template && npx tsc --noEmit src/conversation/commands.ts`

---

### Task 7: CREATE `tests/ui/config-panel.test.tsx`

**IMPLEMENT**: Tests for ConfigPanel component

**PATTERN**: Follow `tests/ui/components.test.tsx` structure

**CODE**:
```tsx
/**
 * ConfigPanel Unit Tests
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from 'ink-testing-library';

import { ConfigPanel } from '../../src/ui/components/ConfigPanel.js';
import type { ConfigStatus, ConfigSettings, ConfigUsage } from '../../src/ui/hooks/useConfigPanel.js';

const mockStatus: ConfigStatus = {
  version: '1.0.0',
  productName: 'Fork Brand Ship',
  sessionId: 'test-session-123',
  cwd: '/test/path',
  model: 'opus',
  modelId: 'claude-opus-4-5-20251101',
  thinkingTokens: 128000
};

const mockSettings: ConfigSettings = {
  thinkingMode: true,
  verboseOutput: false,
  permissionMode: 'default'
};

const mockUsage: ConfigUsage = {
  contextPercent: 45
};

describe('ConfigPanel Component', () => {
  it('should render status tab by default', () => {
    const { lastFrame } = render(
      <ConfigPanel
        activeTab="status"
        status={mockStatus}
        settings={mockSettings}
        usage={mockUsage}
        onClose={() => {}}
        onNextTab={() => {}}
        onPrevTab={() => {}}
        onSetTab={() => {}}
      />
    );

    expect(lastFrame()).toContain('Status');
    expect(lastFrame()).toContain('Version');
    expect(lastFrame()).toContain('1.0.0');
    expect(lastFrame()).toContain('/test/path');
  });

  it('should render config tab', () => {
    const { lastFrame } = render(
      <ConfigPanel
        activeTab="config"
        status={mockStatus}
        settings={mockSettings}
        usage={mockUsage}
        onClose={() => {}}
        onNextTab={() => {}}
        onPrevTab={() => {}}
        onSetTab={() => {}}
      />
    );

    expect(lastFrame()).toContain('Config');
    expect(lastFrame()).toContain('Thinking mode');
    expect(lastFrame()).toContain('true');
  });

  it('should render usage tab', () => {
    const { lastFrame } = render(
      <ConfigPanel
        activeTab="usage"
        status={mockStatus}
        settings={mockSettings}
        usage={mockUsage}
        onClose={() => {}}
        onNextTab={() => {}}
        onPrevTab={() => {}}
        onSetTab={() => {}}
      />
    );

    expect(lastFrame()).toContain('Usage');
    expect(lastFrame()).toContain('45%');
  });

  it('should show tab navigation hint', () => {
    const { lastFrame } = render(
      <ConfigPanel
        activeTab="status"
        status={mockStatus}
        settings={mockSettings}
        usage={mockUsage}
        onClose={() => {}}
        onNextTab={() => {}}
        onPrevTab={() => {}}
        onSetTab={() => {}}
      />
    );

    expect(lastFrame()).toContain('tab to cycle');
    expect(lastFrame()).toContain('escape to close');
  });

  it('should show MCP servers when provided', () => {
    const { lastFrame } = render(
      <ConfigPanel
        activeTab="status"
        status={mockStatus}
        settings={mockSettings}
        usage={mockUsage}
        mcpServers={{
          context7: { connected: true },
          archon: { connected: false }
        }}
        onClose={() => {}}
        onNextTab={() => {}}
        onPrevTab={() => {}}
        onSetTab={() => {}}
      />
    );

    expect(lastFrame()).toContain('MCP servers');
    expect(lastFrame()).toContain('context7');
    expect(lastFrame()).toContain('archon');
  });
});

describe('useConfigPanel Hook', () => {
  it('should export from hooks index', async () => {
    const hooks = await import('../../src/ui/hooks/index.js');
    expect(typeof hooks.useConfigPanel).toBe('function');
  });
});
```

**VALIDATE**: `cd /c/Users/Degen/claude-cli-template && npm test -- --grep "ConfigPanel"`

---

### Task 8: Full Build and Test

**IMPLEMENT**: Run full validation suite

**COMMANDS**:
```bash
cd /c/Users/Degen/claude-cli-template
npm run build
npm test
```

**EXPECTED**: All tests pass, build succeeds

---

## TESTING STRATEGY

### Unit Tests

- ConfigPanel renders all three tabs correctly
- Tab navigation works (next/prev)
- Status info displays version, session, cwd, model
- Config info displays settings with correct values
- Usage info displays context percentage with color coding
- MCP servers show health icons
- Export checks for hook and component

### Integration Tests

- `/config` command triggers panel open
- Escape closes panel
- Arrow keys cycle tabs
- Panel hides input prompt when open

### Manual Testing

1. Run `agent`
2. Type `/config`
3. Verify Status tab shows version, cwd, model
4. Press → or Tab to switch to Config tab
5. Press → or Tab to switch to Usage tab
6. Press ← or Shift+Tab to go back
7. Press Escape to close
8. Verify input prompt reappears

---

## VALIDATION COMMANDS

### Level 1: TypeScript
```bash
cd /c/Users/Degen/claude-cli-template && npm run typecheck
```

### Level 2: Build
```bash
cd /c/Users/Degen/claude-cli-template && npm run build
```

### Level 3: Unit Tests
```bash
cd /c/Users/Degen/claude-cli-template && npm test
```

### Level 4: Manual Validation
```bash
cd /c/Users/Degen/claude-cli-template && agent
# Then type /config and test tab navigation
```

---

## ACCEPTANCE CRITERIA

- [ ] `/config` command opens tabbed panel
- [ ] Status tab shows: Version, Session ID, cwd, Model, MCP servers
- [ ] Config tab shows: Thinking mode, Verbose output, Permission mode
- [ ] Usage tab shows: Context percentage with color coding
- [ ] Arrow keys (←/→) cycle between tabs
- [ ] Tab key cycles tabs
- [ ] Escape closes panel
- [ ] Input prompt hidden while panel is open
- [ ] All existing tests pass
- [ ] New ConfigPanel tests pass
- [ ] TypeScript compiles without errors

---

## COMPLETION CHECKLIST

- [ ] useConfigPanel hook created and exported
- [ ] ConfigPanel component created and exported
- [ ] App.tsx integrates ConfigPanel
- [ ] commands.ts wires up 'config' to 'openConfig' action
- [ ] Tests written and passing
- [ ] Full build succeeds
- [ ] Manual testing confirms feature works
- [ ] Code follows existing patterns

---

## NOTES

**Design Decisions:**
- Tab state managed in hook, not component (follows existing patterns)
- MCP health info passed as prop from App (reuses useMcpHealth)
- Minimal keyboard shortcuts: arrows + tab + escape (matches Claude Code)
- No settings editing in v1 - display only (can add later)

**Future Enhancements:**
- Add Enter to edit settings
- Add session rename capability
- Add cost/token tracking to Usage tab
- Add keyboard shortcut (e.g., Ctrl+K) to open config
