/**
 * UI Components Barrel Export
 * All Ink-based terminal UI components
 */

// Header - Loop Agent branding and info
export { Header } from './Header.js';
export type { HeaderProps } from './Header.js';

// StatusBar - Bottom bar with context usage and state
export { StatusBar } from './StatusBar.js';
export type { StatusBarProps, ThinkingState } from './StatusBar.js';

// ThinkingIndicator - Animated spinner with elapsed time
export { ThinkingIndicator } from './ThinkingIndicator.js';
export type { ThinkingIndicatorProps } from './ThinkingIndicator.js';

// MessageStream - Display conversation messages
export { MessageStream } from './MessageStream.js';
export type { MessageStreamProps } from './MessageStream.js';

// InputPrompt - Rich text input
export { InputPrompt } from './InputPrompt.js';
export type { InputPromptProps } from './InputPrompt.js';

// ToolCard - Tool usage display
export { ToolCard } from './ToolCard.js';
export type { ToolCardProps } from './ToolCard.js';

// CommandAutocomplete - Slash command autocomplete dropdown
export { CommandAutocomplete } from './CommandAutocomplete.js';
export type { CommandAutocompleteProps } from './CommandAutocomplete.js';

// Panels - Interactive panel components
export { McpPanel, ServerCard, ServerActions } from './panels/index.js';
export type { McpPanelProps, ServerCardProps, ServerActionsProps, ServerAction } from './panels/index.js';

// PermissionPrompt - Interactive permission approval
export { PermissionPrompt } from './PermissionPrompt.js';
export type { PermissionPromptProps } from './PermissionPrompt.js';

// UltrathinkText - Terminal phosphor gradient for ULTRATHINK
export { UltrathinkText } from './UltrathinkText.js';
export type { UltrathinkTextProps } from './UltrathinkText.js';

// ColorizedTextInput - Text input with per-character ultrathink coloring
export { ColorizedTextInput } from './ColorizedTextInput.js';
export type { ColorizedTextInputProps } from './ColorizedTextInput.js';

// SessionPicker - Session selection dropdown
export { SessionPicker } from './SessionPicker.js';
export type { SessionPickerProps } from './SessionPicker.js';

// ConfigPanel - Claude Code-style tabbed config panel
export { ConfigPanel } from './ConfigPanel.js';
export type { ConfigPanelProps } from './ConfigPanel.js';

// ModelSelector - Interactive model selection panel
export { ModelSelector } from './ModelSelector.js';
export type { ModelSelectorProps } from './ModelSelector.js';

// MemoryEditor - Interactive CLAUDE.md file selector
export { MemoryEditor } from './MemoryEditor.js';
export type { MemoryEditorProps } from './MemoryEditor.js';

// HelpPanel - Interactive tabbed help panel
export { HelpPanel } from './HelpPanel.js';
export type { HelpPanelProps } from './HelpPanel.js';
