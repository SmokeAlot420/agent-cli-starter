# Feature: Interactive /config and /help Commands

Same pattern as /mcp, /model, /memory - make them interactive panels.

## What We're Doing

1. **`/config`** - ConfigPanel exists but Config tab is read-only. Make it editable so users can change settings with arrow keys + Enter.

2. **`/help`** - Currently dumps text. Create HelpPanel with tabs (same pattern as ConfigPanel).

---

## STEP-BY-STEP TASKS

### Part A: Make /config Editable

#### Task 1: UPDATE `src/ui/hooks/useConfigPanel.ts`

Add state for selecting settings in Config tab and callbacks to change them:

```typescript
// Add to state
const [selectedSettingIndex, setSelectedSettingIndex] = useState(0);

// Add callbacks
const selectNextSetting = useCallback(() => {
  setSelectedSettingIndex(prev => Math.min(prev + 1, 3)); // 4 settings: model, thinking, permission, verbose
}, []);

const selectPrevSetting = useCallback(() => {
  setSelectedSettingIndex(prev => Math.max(prev - 1, 0));
}, []);

// Add to return
selectedSettingIndex,
selectNextSetting,
selectPrevSetting,
```

Also add callback props for actually changing settings:
```typescript
// In options
onChangeModel?: () => void;
onToggleThinking?: () => void;
onCyclePermission?: () => void;
onToggleVerbose?: () => void;
```

#### Task 2: UPDATE `src/ui/components/ConfigPanel.tsx`

Make ConfigTab show selection and handle Enter to activate:

- Add `selectedIndex` and callbacks to ConfigTab props
- Show `▸` indicator on selected row
- Handle up/down arrows and Enter when on Config tab
- Enter on Model → call onChangeModel (opens ModelSelector)
- Enter on Thinking → toggle
- Enter on Permission → cycle
- Enter on Verbose → toggle

#### Task 3: UPDATE `src/ui/App.tsx`

Pass the change callbacks to configPanel:

```typescript
const configPanel = useConfigPanel({
  // ...existing
  onChangeModel: () => modelSelector.open(),
  onToggleThinking: toggleShowThinking,
  onCyclePermission: cyclePermissionMode,
  // onToggleVerbose - need to add verbose toggle to useAgent or handle here
});
```

---

### Part B: Create Interactive /help

#### Task 4: UPDATE `src/conversation/commands.ts`

Add `openHelp` to action types and update /help handler:

```typescript
// Add to BuiltinCommandAction union
| { type: 'openHelp' }

// Update case
case 'help':
case '?':
  return {
    message: { type: 'text', content: '' },
    action: { type: 'openHelp' }
  };
```

#### Task 5: UPDATE `src/conversation/agent.ts`

Add handler for openHelp action (same pattern as openConfig):

```typescript
case 'openHelp':
  yield {
    type: 'text',
    content: builtinResult.message.content,
    metadata: { action: 'openHelp' }
  };
  this.isRunning = false;
  return;
```

#### Task 6: CREATE `src/ui/hooks/useHelpPanel.ts`

Same pattern as useConfigPanel - tabs + open/close:

```typescript
export type HelpTab = 'commands' | 'shortcuts' | 'tips';

export interface UseHelpPanelReturn {
  isOpen: boolean;
  activeTab: HelpTab;
  open: () => void;
  close: () => void;
  nextTab: () => void;
  prevTab: () => void;
}
```

#### Task 7: CREATE `src/ui/components/HelpPanel.tsx`

Same structure as ConfigPanel - tabs at top, content below, Esc to close:

- **Commands tab**: List commands grouped by type
- **Shortcuts tab**: Keyboard shortcuts
- **Tips tab**: Quick tips

#### Task 8: UPDATE exports

- `src/ui/hooks/index.ts` - export useHelpPanel
- `src/ui/components/index.ts` - export HelpPanel

#### Task 9: UPDATE `src/ui/App.tsx`

Wire up HelpPanel same way as ConfigPanel:

1. Import useHelpPanel, HelpPanel
2. Initialize hook: `const helpPanel = useHelpPanel();`
3. Add to onAction: `else if (action === 'openHelp') { helpPanel.open(); }`
4. Add to panelsOpen: `|| helpPanel.isOpen`
5. Render: `{helpPanel.isOpen && <HelpPanel ... />}`

#### Task 10: UPDATE test

Update `/help` test to expect `openHelp` action.

---

## VALIDATION

```bash
npm run typecheck
npm test
npm run build
```

Manual: Run `/config`, navigate Config tab, change settings. Run `/help`, tab through sections.
