/**
 * UI Hooks Barrel Export
 * Custom React hooks for UI state management
 */

// useAgent - Manage ConversationalAgent state
export { useAgent } from './useAgent.js';
export type { UseAgentOptions, UseAgentReturn } from './useAgent.js';

// useThinking - Track thinking state with timer
export { useThinking } from './useThinking.js';
export type { UseThinkingReturn } from './useThinking.js';

// useKeyboard - Handle global keyboard shortcuts
export { useKeyboard } from './useKeyboard.js';
export type { UseKeyboardOptions } from './useKeyboard.js';

// useMcpHealth - Real-time MCP server health polling
export { useMcpHealth } from './useMcpHealth.js';
export type { UseMcpHealthReturn, McpServerHealth } from './useMcpHealth.js';

// useCommandAutocomplete - Slash command autocomplete state
export { useCommandAutocomplete } from './useCommandAutocomplete.js';
export type { UseCommandAutocompleteReturn } from './useCommandAutocomplete.js';

// usePermission - Interactive permission prompts
export { usePermission } from './usePermission.js';
export type { UsePermissionReturn, PermissionRequest, PermissionResponse } from './usePermission.js';

// useSessionPicker - Session picker state management
export { useSessionPicker, formatTimeAgo } from './useSessionPicker.js';
export type {
  UseSessionPickerOptions,
  UseSessionPickerReturn
} from './useSessionPicker.js';
