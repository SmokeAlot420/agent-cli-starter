/**
 * Conversational Agent Module
 *
 * Full Claude Code capabilities with PIV methodology and custom branding.
 * This module provides a complete wrapper around Claude Code's functionality.
 */
export { ConversationalAgent } from './agent.js';
export { isThinkingBlock, isToolUseBlock, isTextBlock, isTextDeltaStreamEvent } from './type-guards.js';
export { buildQueryOptions, type QueryBuildOptions } from './query-builder.js';
export { McpManager } from './mcp-manager.js';
export type { ConversationMessage, PermissionMode, SettingSource, HookEvent, HookCallback, HookMatcher, SandboxSettings, AgentDefinition, OutputFormat, ConversationalAgentOptions, PermissionRequest, PermissionResponse, PermissionResult, CanUseToolCallback } from './types.js';
export { PERMISSION_MODE_CYCLE, PERMISSION_MODE_LABELS } from './types.js';
export type { McpServerConfig, McpStdioServerConfig, McpHttpServerConfig, McpSseServerConfig, McpServersConfig } from '../features/mcp.js';
export type { SlashCommand, CommandMetadata } from '../features/commands.js';
export { ConversationalAgent as default } from './agent.js';
//# sourceMappingURL=index.d.ts.map