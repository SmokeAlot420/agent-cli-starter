/**
 * Conversational Agent Module
 *
 * Full Claude Code capabilities with PIV methodology and custom branding.
 * This module provides a complete wrapper around Claude Code's functionality.
 */

// Core agent class
export { ConversationalAgent } from './agent.js';

// Type guards
export {
  isThinkingBlock,
  isToolUseBlock,
  isTextBlock,
  isTextDeltaStreamEvent
} from './type-guards.js';

// Query builder
export { buildQueryOptions, type QueryBuildOptions } from './query-builder.js';

// MCP Manager
export { McpManager } from './mcp-manager.js';

// Types
export type {
  ConversationMessage,
  PermissionMode,
  SettingSource,
  HookEvent,
  HookCallback,
  HookMatcher,
  SandboxSettings,
  AgentDefinition,
  OutputFormat,
  ConversationalAgentOptions,
  PermissionRequest,
  PermissionResponse,
  PermissionResult,
  CanUseToolCallback
} from './types.js';

// Constants
export {
  PERMISSION_MODE_CYCLE,
  PERMISSION_MODE_LABELS
} from './types.js';

// Re-export MCP types for backwards compatibility
export type {
  McpServerConfig,
  McpStdioServerConfig,
  McpHttpServerConfig,
  McpSseServerConfig,
  McpServersConfig
} from '../features/mcp.js';

// Re-export command types for backwards compatibility
export type { SlashCommand, CommandMetadata } from '../features/commands.js';

// Default export
export { ConversationalAgent as default } from './agent.js';
