# Feature: Make Slash Commands Interactive

The following plan should be complete, but it's important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils, types, and models. Import from the right files etc.

## Feature Description

Transform text-output slash commands (`/mcp`, `/model`, `/memory`) into interactive panel-based commands following the established `/config` → ConfigPanel pattern. Currently these commands just dump text - this feature adds proper interactive UI panels with keyboard navigation, selection, and actions.

## User Story

As a CLI user
I want slash commands like /mcp, /model, and /memory to open interactive panels
So that I can visually browse, select, and manage options instead of just seeing text output

## Problem Statement

Currently:
- `/mcp` outputs plain text list of servers - no actions possible
- `/model` outputs text list of models - requires typing `/model opus` to change
- `/memory` says "Opening memory editor..." but nothing happens (action not wired)

Users expect Claude Code-like interactive panels where they can navigate with arrow keys, select with Enter, and perform actions.

## Solution Statement

1. Wire existing `McpPanel` component to `/mcp` command via new `useMcpPanel` hook
2. Create `ModelSelector` component + `useModelSelector` hook for `/model` command
3. Create `MemoryEditor` component + `useMemoryEditor` hook for `/memory` command
4. Follow the established action pattern: command → action type → metadata → useAgent → App.tsx → hook.open()

## Feature Metadata

**Feature Type**: Enhancement
**Estimated Complexity**: Medium
**Primary Systems Affected**: UI components, hooks, commands.ts, agent.ts, App.tsx
**Dependencies**: ink-select-input (already installed)

---

## CONTEXT REFERENCES

### Relevant Codebase Files - IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

| File | Lines | Why |
|------|-------|-----|
| `src/ui/App.tsx` | 128-136 | **CRITICAL**: onAction callback pattern - how actions are routed to panels |
| `src/ui/App.tsx` | 155-164 | useConfigPanel initialization - pattern for new hooks |
| `src/ui/App.tsx` | 299-311 | ConfigPanel conditional render - pattern for new panels |
| `src/conversation/agent.ts` | 396-439 | **CRITICAL**: Action handling switch - must add new cases |
| `src/conversation/commands.ts` | 319-341 | `/mcp` handler - must change to return action |
| `src/conversation/commands.ts` | 346-361 | `/model` handler - must change to return action (no args case) |
| `src/conversation/commands.ts` | 196-202 | `/memory` handler - already returns openMemory action |
| `src/conversation/commands.ts` | 33-47 | BuiltinCommandAction type definition - add new action types |
| `src/ui/hooks/useConfigPanel.ts` | full | **PATTERN**: Hook structure to follow |
| `src/ui/hooks/useSessionPicker.ts` | full | **PATTERN**: Alternative hook pattern with filtering |
| `src/ui/components/panels/McpPanel.tsx` | full | **EXISTS**: Already built, just needs wiring |
| `src/ui/components/panels/ServerActions.tsx` | full | **PATTERN**: SelectInput usage for model selector |
| `src/features/models.ts` | full | Model constants, aliases, display names |
| `src/ui/hooks/index.ts` | full | Must export new hooks |
| `src/ui/components/index.ts` | full | Must export new components |

### New Files to Create

| File | Purpose |
|------|---------|
| `src/ui/hooks/useMcpPanel.ts` | Simple hook for MCP panel state (isOpen, open, close) |
| `src/ui/hooks/useModelSelector.ts` | Hook for model selector state |
| `src/ui/hooks/useMemoryEditor.ts` | Hook for memory editor state |
| `src/ui/components/ModelSelector.tsx` | Interactive model selection using SelectInput |
| `src/ui/components/MemoryEditor.tsx` | Interactive CLAUDE.md file viewer |

### Relevant Documentation

- [ink-select-input](https://github.com/vadimdemedes/ink-select-input) - SelectInput component for dropdown selection
- Already used in `ServerActions.tsx` - see that file for usage pattern

### Patterns to Follow

**Action Flow Pattern** (from /config):
```
1. User types /config
2. commands.ts handleBuiltinCommand returns { action: { type: 'openConfig' } }
3. agent.ts case 'openConfig': yields message with metadata: { action: 'openConfig' }
4. useAgent.ts detects chunk.metadata?.action, calls onAction('openConfig')
5. App.tsx onAction callback: if (action === 'openConfig') configPanel.open()
6. App.tsx renders: {configPanel.isOpen && <ConfigPanel ... />}
```

**Hook Pattern** (from useConfigPanel):
```typescript
export interface UseXxxPanelOptions {
  // Options interface
}

export interface UseXxxPanelReturn {
  isOpen: boolean;
  // Component-specific state
  open: () => void;
  close: () => void;
  // Component-specific methods
}

export function useXxxPanel(options: UseXxxPanelOptions = {}): UseXxxPanelReturn {
  const [isOpen, setIsOpen] = useState(false);
  // State management

  const open = useCallback(() => { setIsOpen(true); }, []);
  const close = useCallback(() => { setIsOpen(false); }, []);

  return { isOpen, open, close, ... };
}
```

**SelectInput Pattern** (from ServerActions.tsx):
```typescript
import SelectInput from 'ink-select-input';

interface Item {
  label: string;
  value: string;
}

const items: Item[] = [
  { label: 'Display Name', value: 'actual_value' },
];

<SelectInput items={items} onSelect={(item) => handleSelect(item.value)} />
```

**Panel Keyboard Pattern**:
```typescript
useInput((input, key) => {
  if (key.escape) {
    onClose();
  }
});
```

---

## IMPLEMENTATION PLAN

### Phase 1: Add Action Types

Update `BuiltinCommandAction` union type to include new actions.

### Phase 2: Create Hooks

Create `useMcpPanel`, `useModelSelector`, and `useMemoryEditor` hooks following established patterns.

### Phase 3: Create Components

Create `ModelSelector` and `MemoryEditor` components. McpPanel already exists.

### Phase 4: Wire Command Handlers

Update `/mcp` and `/model` in commands.ts to return action types instead of text.

### Phase 5: Wire Action Handlers

Update agent.ts to emit metadata for new actions.

### Phase 6: Wire App.tsx

Initialize hooks, handle actions in onAction callback, conditionally render panels.

### Phase 7: Export Updates

Update barrel exports in hooks/index.ts and components/index.ts.

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

---

### Task 1: UPDATE `src/conversation/commands.ts` - Add action types

**IMPLEMENT**: Add `openMcp` and `openModelSelector` to BuiltinCommandAction union type

**Location**: Lines 33-47

**Find this code**:
```typescript
export type BuiltinCommandAction =
  | { type: 'clearHistory' }
  | { type: 'setModel'; model: string }
  | { type: 'setThinking'; enabled: boolean }
  | { type: 'toggleThinking' }
  | { type: 'showSessionPicker' }
  | { type: 'renameSession'; name: string }
  | { type: 'exit' }
  | { type: 'openConfig' }
  | { type: 'openMemory' }
  | { type: 'enterPlanMode' }
  | { type: 'initProject' }
  | { type: 'addDirectory'; path: string }
  | { type: 'toggleVimMode' }
  | { type: 'rewind' };
```

**Replace with**:
```typescript
export type BuiltinCommandAction =
  | { type: 'clearHistory' }
  | { type: 'setModel'; model: string }
  | { type: 'setThinking'; enabled: boolean }
  | { type: 'toggleThinking' }
  | { type: 'showSessionPicker' }
  | { type: 'renameSession'; name: string }
  | { type: 'exit' }
  | { type: 'openConfig' }
  | { type: 'openMcp' }
  | { type: 'openModelSelector' }
  | { type: 'openMemory' }
  | { type: 'enterPlanMode' }
  | { type: 'initProject' }
  | { type: 'addDirectory'; path: string }
  | { type: 'toggleVimMode' }
  | { type: 'rewind' };
```

**VALIDATE**: `npm run typecheck`

---

### Task 2: UPDATE `src/conversation/commands.ts` - Change /mcp to return action

**IMPLEMENT**: Modify handleMcpCommand to return action instead of text for status view

**Location**: Lines 319-341 (handleMcpCommand function)

**Find this code**:
```typescript
function handleMcpCommand(args: string, mcpServers: McpServersConfig): BuiltinCommandResult {
  if (args === '' || args === 'status') {
    const serverList = Object.entries(mcpServers);
    if (serverList.length === 0) {
      return {
        message: { type: 'text', content: 'No MCP servers configured.' }
      };
    }

    const lines = ['MCP Servers:', ''];
    for (const [name, config] of serverList) {
      const type = config.type || 'stdio';
      lines.push(`  ${name} (${type})`);
    }
    return {
      message: { type: 'text', content: lines.join('\n') }
    };
  }

  return {
    message: { type: 'text', content: 'Usage: /mcp [status|add|remove]' }
  };
}
```

**Replace with**:
```typescript
function handleMcpCommand(args: string, _mcpServers: McpServersConfig): BuiltinCommandResult {
  if (args === '' || args === 'status') {
    // Open interactive MCP panel
    return {
      message: { type: 'text', content: '' },
      action: { type: 'openMcp' }
    };
  }

  return {
    message: { type: 'text', content: 'Usage: /mcp [status|add|remove]' }
  };
}
```

**VALIDATE**: `npm run typecheck`

---

### Task 3: UPDATE `src/conversation/commands.ts` - Change /model to return action

**IMPLEMENT**: Modify handleModelCommand to return action instead of text when no args provided

**Location**: Lines 346-361 (handleModelCommand function)

**Find this code**:
```typescript
function handleModelCommand(args: string, currentModel: string): BuiltinCommandResult {
  if (args) {
    const newModel = resolveModel(args);
    return {
      message: {
        type: 'text',
        content: `Model changed to: ${getModelDisplayName(newModel)} (${newModel})`
      },
      action: { type: 'setModel', model: newModel }
    };
  }

  return {
    message: { type: 'text', content: formatModelList(currentModel) }
  };
}
```

**Replace with**:
```typescript
function handleModelCommand(args: string, currentModel: string): BuiltinCommandResult {
  if (args) {
    const newModel = resolveModel(args);
    return {
      message: {
        type: 'text',
        content: `Model changed to: ${getModelDisplayName(newModel)} (${newModel})`
      },
      action: { type: 'setModel', model: newModel }
    };
  }

  // Open interactive model selector
  return {
    message: { type: 'text', content: '' },
    action: { type: 'openModelSelector' }
  };
}
```

**VALIDATE**: `npm run typecheck`

---

### Task 4: UPDATE `src/conversation/agent.ts` - Add action handlers

**IMPLEMENT**: Add case handlers for openMcp, openModelSelector, openMemory in chat() method

**Location**: Lines 396-439 (inside the switch statement for builtinResult.action.type)

**Find this code** (around line 430-438):
```typescript
            case 'openConfig':
              // Action handled by UI layer - emit special message type
              yield {
                type: 'text',
                content: builtinResult.message.content,
                metadata: { action: 'openConfig' }
              };
              this.isRunning = false;
              return;
          }
```

**Replace with**:
```typescript
            case 'openConfig':
              // Action handled by UI layer - emit special message type
              yield {
                type: 'text',
                content: builtinResult.message.content,
                metadata: { action: 'openConfig' }
              };
              this.isRunning = false;
              return;
            case 'openMcp':
              // Action handled by UI layer - emit special message type
              yield {
                type: 'text',
                content: builtinResult.message.content,
                metadata: { action: 'openMcp' }
              };
              this.isRunning = false;
              return;
            case 'openModelSelector':
              // Action handled by UI layer - emit special message type
              yield {
                type: 'text',
                content: builtinResult.message.content,
                metadata: { action: 'openModelSelector' }
              };
              this.isRunning = false;
              return;
            case 'openMemory':
              // Action handled by UI layer - emit special message type
              yield {
                type: 'text',
                content: builtinResult.message.content,
                metadata: { action: 'openMemory' }
              };
              this.isRunning = false;
              return;
          }
```

**VALIDATE**: `npm run typecheck`

---

### Task 5: CREATE `src/ui/hooks/useMcpPanel.ts`

**IMPLEMENT**: Create simple hook for MCP panel state management

**PATTERN**: Follow useConfigPanel.ts structure

```typescript
/**
 * MCP Panel Hook
 * Manages state for the /mcp interactive panel
 */

import { useState, useCallback } from 'react';
import type { McpServersConfig } from '../../features/mcp.js';

export interface UseMcpPanelOptions {
  /** Initial servers config */
  servers?: McpServersConfig;
}

export interface UseMcpPanelReturn {
  /** Whether panel is open */
  isOpen: boolean;
  /** Current servers config */
  servers: McpServersConfig;
  /** Open the panel with servers */
  open: (servers: McpServersConfig) => void;
  /** Close the panel */
  close: () => void;
}

export function useMcpPanel(
  options: UseMcpPanelOptions = {}
): UseMcpPanelReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [servers, setServers] = useState<McpServersConfig>(options.servers || {});

  const open = useCallback((newServers: McpServersConfig) => {
    setServers(newServers);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    servers,
    open,
    close
  };
}

export default useMcpPanel;
```

**VALIDATE**: `npm run typecheck`

---

### Task 6: CREATE `src/ui/hooks/useModelSelector.ts`

**IMPLEMENT**: Create hook for model selector state management

**PATTERN**: Follow useConfigPanel.ts structure

```typescript
/**
 * Model Selector Hook
 * Manages state for the /model interactive selector
 */

import { useState, useCallback } from 'react';

export interface UseModelSelectorOptions {
  /** Current model */
  currentModel?: string;
  /** Callback when model is selected */
  onSelect?: (model: string) => void;
}

export interface UseModelSelectorReturn {
  /** Whether selector is open */
  isOpen: boolean;
  /** Current model being displayed */
  currentModel: string;
  /** Open the selector */
  open: () => void;
  /** Close the selector */
  close: () => void;
  /** Select a model and close */
  selectModel: (model: string) => void;
}

export function useModelSelector(
  options: UseModelSelectorOptions = {}
): UseModelSelectorReturn {
  const { currentModel: initialModel = 'opus', onSelect } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState(initialModel);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const selectModel = useCallback((model: string) => {
    setCurrentModel(model);
    if (onSelect) {
      onSelect(model);
    }
    setIsOpen(false);
  }, [onSelect]);

  return {
    isOpen,
    currentModel,
    open,
    close,
    selectModel
  };
}

export default useModelSelector;
```

**VALIDATE**: `npm run typecheck`

---

### Task 7: CREATE `src/ui/hooks/useMemoryEditor.ts`

**IMPLEMENT**: Create hook for memory editor state management

**PATTERN**: Follow useSessionPicker.ts structure for list navigation

```typescript
/**
 * Memory Editor Hook
 * Manages state for the /memory interactive editor
 */

import { useState, useCallback, useMemo } from 'react';
import * as fs from 'fs';
import * as path from 'path';

export interface MemoryFile {
  /** File path */
  path: string;
  /** Display name */
  name: string;
  /** Source type (user, project, local) */
  source: 'user' | 'project' | 'local';
  /** Whether file exists */
  exists: boolean;
}

export interface UseMemoryEditorOptions {
  /** Current working directory */
  cwd?: string;
}

export interface UseMemoryEditorReturn {
  /** Whether editor is open */
  isOpen: boolean;
  /** Discovered memory files */
  files: MemoryFile[];
  /** Currently selected index */
  selectedIndex: number;
  /** Open the editor */
  open: () => void;
  /** Close the editor */
  close: () => void;
  /** Select next file */
  selectNext: () => void;
  /** Select previous file */
  selectPrev: () => void;
  /** Get currently selected file */
  getSelected: () => MemoryFile | null;
}

/**
 * Discover CLAUDE.md files in standard locations
 */
function discoverMemoryFiles(cwd: string): MemoryFile[] {
  const files: MemoryFile[] = [];

  // User-level CLAUDE.md (~/.claude/CLAUDE.md)
  const userHome = process.env.HOME || process.env.USERPROFILE || '';
  const userPath = path.join(userHome, '.claude', 'CLAUDE.md');
  files.push({
    path: userPath,
    name: 'User CLAUDE.md',
    source: 'user',
    exists: fs.existsSync(userPath)
  });

  // Project-level CLAUDE.md (cwd/CLAUDE.md)
  const projectPath = path.join(cwd, 'CLAUDE.md');
  files.push({
    path: projectPath,
    name: 'Project CLAUDE.md',
    source: 'project',
    exists: fs.existsSync(projectPath)
  });

  // Local .claude/CLAUDE.md (cwd/.claude/CLAUDE.md)
  const localPath = path.join(cwd, '.claude', 'CLAUDE.md');
  files.push({
    path: localPath,
    name: 'Local .claude/CLAUDE.md',
    source: 'local',
    exists: fs.existsSync(localPath)
  });

  return files;
}

export function useMemoryEditor(
  options: UseMemoryEditorOptions = {}
): UseMemoryEditorReturn {
  const { cwd = process.cwd() } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Discover files when opening
  const files = useMemo(() => {
    if (!isOpen) return [];
    return discoverMemoryFiles(cwd);
  }, [isOpen, cwd]);

  const open = useCallback(() => {
    setIsOpen(true);
    setSelectedIndex(0);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setSelectedIndex(0);
  }, []);

  const selectNext = useCallback(() => {
    setSelectedIndex(prev => Math.min(prev + 1, Math.max(0, files.length - 1)));
  }, [files.length]);

  const selectPrev = useCallback(() => {
    setSelectedIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const getSelected = useCallback((): MemoryFile | null => {
    if (files.length === 0) return null;
    return files[selectedIndex] ?? null;
  }, [files, selectedIndex]);

  return {
    isOpen,
    files,
    selectedIndex,
    open,
    close,
    selectNext,
    selectPrev,
    getSelected
  };
}

export default useMemoryEditor;
```

**VALIDATE**: `npm run typecheck`

---

### Task 8: CREATE `src/ui/components/ModelSelector.tsx`

**IMPLEMENT**: Create interactive model selector component using SelectInput

**PATTERN**: Follow ServerActions.tsx for SelectInput usage

```typescript
/**
 * ModelSelector Component
 * Interactive model selection panel using SelectInput
 */

import React from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import { MODELS, getModelDisplayName } from '../../features/models.js';

export interface ModelSelectorProps {
  /** Currently selected model */
  currentModel: string;
  /** Callback when model is selected */
  onSelect: (model: string) => void;
  /** Callback when panel should close */
  onClose: () => void;
}

interface ModelItem {
  label: string;
  value: string;
}

/**
 * Get model items for selection
 */
function getModelItems(currentModel: string): ModelItem[] {
  const models = [
    { alias: 'opus', model: MODELS.OPUS, desc: 'Most capable, extended thinking' },
    { alias: 'sonnet', model: MODELS.SONNET, desc: 'Fast and capable' },
    { alias: 'haiku', model: MODELS.HAIKU, desc: 'Fastest, most economical' }
  ];

  return models.map(({ alias, model, desc }) => {
    const isCurrent = model === currentModel;
    const displayName = getModelDisplayName(model);
    const label = isCurrent
      ? `${displayName} (${alias}) - ${desc} [current]`
      : `${displayName} (${alias}) - ${desc}`;

    return {
      label,
      value: model
    };
  });
}

/**
 * ModelSelector provides an interactive model selection interface
 */
export const ModelSelector: React.FC<ModelSelectorProps> = ({
  currentModel,
  onSelect,
  onClose
}) => {
  const items = getModelItems(currentModel);

  // Handle escape key to close
  useInput((input, key) => {
    if (key.escape) {
      onClose();
    }
  });

  const handleSelect = (item: ModelItem) => {
    onSelect(item.value);
  };

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      paddingX={2}
      paddingY={1}
    >
      {/* Header */}
      <Box marginBottom={1}>
        <Text bold color="cyan">Select Model</Text>
      </Box>

      {/* Model list */}
      <SelectInput
        items={items}
        onSelect={handleSelect}
      />

      {/* Help footer */}
      <Box marginTop={1} borderStyle="single" borderColor="gray" borderTop borderBottom={false} borderLeft={false} borderRight={false}>
        <Text dimColor>
          ↑↓ Navigate | Enter: Select | Esc: Cancel
        </Text>
      </Box>
    </Box>
  );
};

export default ModelSelector;
```

**VALIDATE**: `npm run typecheck`

---

### Task 9: CREATE `src/ui/components/MemoryEditor.tsx`

**IMPLEMENT**: Create interactive memory file viewer component

**PATTERN**: Follow McpPanel.tsx for structure and keyboard handling

```typescript
/**
 * MemoryEditor Component
 * Interactive CLAUDE.md file viewer with keyboard navigation
 */

import React from 'react';
import { Box, Text, useInput } from 'ink';
import type { MemoryFile } from '../hooks/useMemoryEditor.js';

export interface MemoryEditorProps {
  /** Memory files to display */
  files: MemoryFile[];
  /** Currently selected index */
  selectedIndex: number;
  /** Callback when panel should close */
  onClose: () => void;
  /** Callback to move selection down */
  onSelectNext: () => void;
  /** Callback to move selection up */
  onSelectPrev: () => void;
}

/**
 * Get status indicator for a memory file
 */
function getStatusIndicator(file: MemoryFile): string {
  return file.exists ? '✓' : '○';
}

/**
 * Get color for status indicator
 */
function getStatusColor(file: MemoryFile): string {
  return file.exists ? 'green' : 'gray';
}

/**
 * MemoryEditor provides an interactive memory file viewer
 */
export const MemoryEditor: React.FC<MemoryEditorProps> = ({
  files,
  selectedIndex,
  onClose,
  onSelectNext,
  onSelectPrev
}) => {
  // Handle keyboard input
  useInput((input, key) => {
    if (key.escape) {
      onClose();
    } else if (key.downArrow) {
      onSelectNext();
    } else if (key.upArrow) {
      onSelectPrev();
    }
  });

  // Empty state
  if (files.length === 0) {
    return (
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="gray"
        paddingX={2}
        paddingY={1}
      >
        <Text bold color="cyan">Memory Files (CLAUDE.md)</Text>
        <Box marginY={1}>
          <Text dimColor>No memory files found.</Text>
        </Box>
        <Text dimColor>Esc: Close</Text>
      </Box>
    );
  }

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="gray"
      paddingX={1}
    >
      {/* Header */}
      <Box justifyContent="space-between" marginBottom={1}>
        <Text bold color="cyan">Memory Files (CLAUDE.md)</Text>
        <Text dimColor>
          {files.filter(f => f.exists).length}/{files.length} exist
        </Text>
      </Box>

      {/* File list */}
      <Box flexDirection="column">
        {files.map((file, index) => {
          const isSelected = index === selectedIndex;
          const statusIndicator = getStatusIndicator(file);
          const statusColor = getStatusColor(file);

          return (
            <Box key={file.path} paddingX={1}>
              {/* Selection indicator */}
              <Text color={isSelected ? 'cyan' : undefined}>
                {isSelected ? '▶ ' : '  '}
              </Text>

              {/* Status */}
              <Text color={statusColor}>{statusIndicator} </Text>

              {/* File info */}
              <Box flexDirection="column">
                <Text bold={isSelected} color={isSelected ? 'cyan' : undefined}>
                  {file.name}
                </Text>
                <Text dimColor wrap="truncate">
                  {file.path}
                </Text>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Legend */}
      <Box marginTop={1}>
        <Text dimColor>✓ = exists, ○ = not found</Text>
      </Box>

      {/* Help footer */}
      <Box marginTop={1} borderStyle="single" borderColor="gray" borderTop borderBottom={false} borderLeft={false} borderRight={false}>
        <Text dimColor>
          ↑↓ Navigate | Esc: Close
        </Text>
      </Box>
    </Box>
  );
};

export default MemoryEditor;
```

**VALIDATE**: `npm run typecheck`

---

### Task 10: UPDATE `src/ui/hooks/index.ts` - Export new hooks

**IMPLEMENT**: Add exports for useMcpPanel, useModelSelector, useMemoryEditor

**Location**: End of file (after useConfigPanel exports)

**Add this code at the end**:
```typescript
// useMcpPanel - MCP panel state management
export { useMcpPanel } from './useMcpPanel.js';
export type {
  UseMcpPanelOptions,
  UseMcpPanelReturn
} from './useMcpPanel.js';

// useModelSelector - Model selector state management
export { useModelSelector } from './useModelSelector.js';
export type {
  UseModelSelectorOptions,
  UseModelSelectorReturn
} from './useModelSelector.js';

// useMemoryEditor - Memory editor state management
export { useMemoryEditor } from './useMemoryEditor.js';
export type {
  UseMemoryEditorOptions,
  UseMemoryEditorReturn,
  MemoryFile
} from './useMemoryEditor.js';
```

**VALIDATE**: `npm run typecheck`

---

### Task 11: UPDATE `src/ui/components/index.ts` - Export new components

**IMPLEMENT**: Add exports for ModelSelector and MemoryEditor

**Location**: End of file (after ConfigPanel export)

**Add this code at the end**:
```typescript
// ModelSelector - Interactive model selection
export { ModelSelector } from './ModelSelector.js';
export type { ModelSelectorProps } from './ModelSelector.js';

// MemoryEditor - Interactive CLAUDE.md viewer
export { MemoryEditor } from './MemoryEditor.js';
export type { MemoryEditorProps } from './MemoryEditor.js';
```

**VALIDATE**: `npm run typecheck`

---

### Task 12: UPDATE `src/ui/App.tsx` - Import new hooks and components

**IMPLEMENT**: Add imports for new hooks and components

**Location**: Lines 1-31 (imports section)

**Add to imports from './hooks/index.js'** (line 21-27):
```typescript
import {
  useAgent,
  useThinking,
  useKeyboard,
  usePermission,
  useSessionPicker,
  useConfigPanel,
  useMcpPanel,
  useModelSelector,
  useMemoryEditor
} from './hooks/index.js';
```

**Add to imports from './components/index.js'** (line 10-19):
```typescript
import {
  Header,
  StatusBar,
  ThinkingIndicator,
  MessageStream,
  InputPrompt,
  PermissionPrompt,
  SessionPicker,
  ConfigPanel,
  McpPanel,
  ModelSelector,
  MemoryEditor,
  type ThinkingState
} from './components/index.js';
```

**VALIDATE**: `npm run typecheck`

---

### Task 13: UPDATE `src/ui/App.tsx` - Initialize new hooks

**IMPLEMENT**: Initialize useMcpPanel, useModelSelector, useMemoryEditor hooks

**Location**: After configPanel initialization (around line 164)

**Add after configPanel hook**:
```typescript
  // MCP panel state
  const mcpPanel = useMcpPanel();

  // Model selector state
  const modelSelector = useModelSelector({
    currentModel: agentOptions?.model || 'opus',
    onSelect: (model) => {
      // Update agent model when selected
      // For now just close - full model switching needs agent update
      console.log('Model selected:', model);
    }
  });

  // Memory editor state
  const memoryEditor = useMemoryEditor({
    cwd
  });
```

**VALIDATE**: `npm run typecheck`

---

### Task 14: UPDATE `src/ui/App.tsx` - Handle new actions in onAction

**IMPLEMENT**: Add handlers for openMcp, openModelSelector, openMemory actions

**Location**: Lines 128-136 (onAction callback)

**Find this code**:
```typescript
    onAction: (action: string, _data?: Record<string, unknown>) => {
      if (action === 'showSessionPicker') {
        showSessionPicker();
      } else if (action === 'openConfig') {
        configPanel.open();
      }
      // Future: handle other actions like 'openMcpPanel', etc.
    }
```

**Replace with**:
```typescript
    onAction: (action: string, _data?: Record<string, unknown>) => {
      if (action === 'showSessionPicker') {
        showSessionPicker();
      } else if (action === 'openConfig') {
        configPanel.open();
      } else if (action === 'openMcp') {
        // Get current MCP servers from agent and open panel
        // Note: We need to access mcpServers somehow - for now use empty
        mcpPanel.open({});
      } else if (action === 'openModelSelector') {
        modelSelector.open();
      } else if (action === 'openMemory') {
        memoryEditor.open();
      }
    }
```

**GOTCHA**: Need to pass MCP servers to mcpPanel.open(). This requires accessing the agent's getMcpServers() method. For initial implementation, we can pass empty object and enhance later.

**VALIDATE**: `npm run typecheck`

---

### Task 15: UPDATE `src/ui/App.tsx` - Update panelsOpen check

**IMPLEMENT**: Include new panels in panelsOpen check for keyboard handling

**Location**: Line 192

**Find this code**:
```typescript
  const panelsOpen = sessionPicker.isOpen || configPanel.isOpen;
```

**Replace with**:
```typescript
  const panelsOpen = sessionPicker.isOpen || configPanel.isOpen || mcpPanel.isOpen || modelSelector.isOpen || memoryEditor.isOpen;
```

**VALIDATE**: `npm run typecheck`

---

### Task 16: UPDATE `src/ui/App.tsx` - Render new panels

**IMPLEMENT**: Add conditional rendering for McpPanel, ModelSelector, MemoryEditor

**Location**: After ConfigPanel render (around line 311)

**Add after ConfigPanel render block**:
```typescript
      {/* MCP panel when open (/mcp) */}
      {mcpPanel.isOpen && (
        <McpPanel
          servers={mcpPanel.servers}
          onClose={mcpPanel.close}
        />
      )}

      {/* Model selector when open (/model) */}
      {modelSelector.isOpen && (
        <ModelSelector
          currentModel={modelSelector.currentModel}
          onSelect={modelSelector.selectModel}
          onClose={modelSelector.close}
        />
      )}

      {/* Memory editor when open (/memory) */}
      {memoryEditor.isOpen && (
        <MemoryEditor
          files={memoryEditor.files}
          selectedIndex={memoryEditor.selectedIndex}
          onClose={memoryEditor.close}
          onSelectNext={memoryEditor.selectNext}
          onSelectPrev={memoryEditor.selectPrev}
        />
      )}
```

**VALIDATE**: `npm run typecheck`

---

### Task 17: UPDATE `src/ui/App.tsx` - Update InputPrompt condition

**IMPLEMENT**: Hide input when new panels are open

**Location**: Line 314 (InputPrompt condition)

**Find this code**:
```typescript
      {mode === 'interactive' && !pendingRequest && !sessionPicker.isOpen && !configPanel.isOpen && (
```

**Replace with**:
```typescript
      {mode === 'interactive' && !pendingRequest && !panelsOpen && (
```

**VALIDATE**: `npm run typecheck`

---

## TESTING STRATEGY

### Unit Tests

Design unit tests following existing patterns in `tests/` directory:

1. **Hook tests** (`tests/ui/hooks/`):
   - `useMcpPanel.test.ts`: Test open/close state transitions
   - `useModelSelector.test.ts`: Test model selection and callbacks
   - `useMemoryEditor.test.ts`: Test file discovery and navigation

2. **Component tests** (`tests/ui/components/`):
   - `ModelSelector.test.tsx`: Test rendering and SelectInput interaction
   - `MemoryEditor.test.tsx`: Test file list rendering and navigation

### Integration Tests

1. Test full action flow: `/mcp` command → action → panel opens
2. Test full action flow: `/model` command → action → selector opens
3. Test full action flow: `/memory` command → action → editor opens

### Edge Cases

- `/mcp` with no MCP servers configured
- `/model` when already on selected model
- `/memory` when no CLAUDE.md files exist
- Escape key closes panels correctly
- Multiple panels cannot open simultaneously

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and 100% feature correctness.

### Level 1: Syntax & Style

```bash
npm run typecheck
```

**Expected**: No type errors

### Level 2: Unit Tests

```bash
npm test
```

**Expected**: All tests pass

### Level 3: Build

```bash
npm run build
```

**Expected**: Build succeeds without errors

### Level 4: Manual Validation

1. **Test /mcp**:
   ```bash
   npm start
   # Type: /mcp
   # Expected: McpPanel opens with server list (or empty state)
   # Press Escape to close
   ```

2. **Test /model**:
   ```bash
   npm start
   # Type: /model
   # Expected: ModelSelector opens with 3 models, current marked
   # Use arrow keys to navigate
   # Press Enter to select (closes panel)
   # Press Escape to cancel
   ```

3. **Test /memory**:
   ```bash
   npm start
   # Type: /memory
   # Expected: MemoryEditor opens with CLAUDE.md file list
   # Use arrow keys to navigate
   # Press Escape to close
   ```

4. **Test /model with args still works**:
   ```bash
   npm start
   # Type: /model sonnet
   # Expected: Text output "Model changed to: Sonnet 4..."
   ```

---

## ACCEPTANCE CRITERIA

- [x] `/mcp` opens interactive McpPanel instead of text output
- [x] `/model` (no args) opens interactive ModelSelector instead of text output
- [x] `/model <alias>` still works with text output for quick switching
- [x] `/memory` opens interactive MemoryEditor
- [x] All panels close on Escape key
- [x] Panels use established patterns (hooks, actions, conditional render)
- [x] All validation commands pass with zero errors
- [x] No regressions in existing functionality
- [x] Code follows project conventions

---

## COMPLETION CHECKLIST

- [ ] Task 1: Add action types to BuiltinCommandAction
- [ ] Task 2: Update /mcp to return openMcp action
- [ ] Task 3: Update /model to return openModelSelector action
- [ ] Task 4: Add action handlers in agent.ts
- [ ] Task 5: Create useMcpPanel hook
- [ ] Task 6: Create useModelSelector hook
- [ ] Task 7: Create useMemoryEditor hook
- [ ] Task 8: Create ModelSelector component
- [ ] Task 9: Create MemoryEditor component
- [ ] Task 10: Export hooks in hooks/index.ts
- [ ] Task 11: Export components in components/index.ts
- [ ] Task 12: Import hooks and components in App.tsx
- [ ] Task 13: Initialize hooks in App.tsx
- [ ] Task 14: Handle actions in onAction callback
- [ ] Task 15: Update panelsOpen check
- [ ] Task 16: Render panels conditionally
- [ ] Task 17: Update InputPrompt condition
- [ ] All validation commands pass
- [ ] Manual testing confirms feature works

---

## NOTES

### Design Decisions

1. **McpPanel reuse**: The existing McpPanel component is fully functional. We just need to wire it up rather than recreate it.

2. **Model selection UX**: Using SelectInput for consistency with ServerActions. The current model is marked with [current] suffix.

3. **Memory editor scope**: Starting with read-only viewer. Future enhancement could add editing capability by opening files in external editor.

4. **MCP servers access**: The initial implementation passes an empty object to mcpPanel.open(). A future enhancement should access the agent's getMcpServers() method, which requires threading the agent reference or MCP config through props.

### Future Enhancements

1. **MCP panel actions**: Implement connect/disconnect/remove actions in the onServerAction callback
2. **Memory editor editing**: Add Enter key to open selected file in $EDITOR
3. **Model switching**: Actually change the agent's model when selected (requires setModel in useAgent)
4. **MCP servers in panel**: Pass actual MCP servers config to McpPanel

### Known Limitations

1. McpPanel currently receives empty servers config - needs MCP config passed through
2. Model selection doesn't actually change the agent's model yet
3. Memory editor is read-only - no editing capability
