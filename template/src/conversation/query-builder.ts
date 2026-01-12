/**
 * Query Builder Module
 *
 * Constructs query options for the Claude Agent SDK.
 */

import type { McpServersConfig } from '../features/mcp.js';
import type { CanUseToolCallback } from './types.js';

/**
 * Options for building a query
 */
export interface QueryBuildOptions {
  // Required
  model: string;
  maxTurns: number;
  workingDirectory: string;

  // Thinking
  thinkingTokens: number;

  // Permission mode
  permissionMode: string;
  isPlanMode: boolean;

  // System prompt
  systemPromptAppend: string;

  // MCP
  mcpServers: McpServersConfig;

  // Optional tool restrictions
  allowedTools?: string[];
  disallowedTools?: string[];

  // Optional configs
  fallbackModel?: string;
  maxBudgetUsd?: number;
  settingSources?: string[];
  agents?: Record<string, unknown>;
  hooks?: unknown;
  env?: Record<string, string>;
  additionalDirectories?: string[];
  sandbox?: unknown;
  resume?: string;
  forkSession?: boolean;
  continue?: boolean;
  outputFormat?: { type: 'json_schema'; schema: Record<string, unknown> };
  includePartialMessages?: boolean;
  enableFileCheckpointing?: boolean;

  /** Custom permission handler for interactive tool approval */
  canUseTool?: CanUseToolCallback;
}

/**
 * Build query options for the Claude Agent SDK
 */
export function buildQueryOptions(options: QueryBuildOptions): Record<string, unknown> {
  const queryOptions: Record<string, unknown> = {
    // Model settings
    model: options.model,
    maxTurns: options.maxTurns,
    maxThinkingTokens: options.thinkingTokens,

    // Use Claude Code's full toolset
    tools: {
      type: 'preset',
      preset: 'claude_code'
    },

    // System prompt with optional PIV additions
    systemPrompt: {
      type: 'preset',
      preset: 'claude_code',
      append: options.isPlanMode
        ? options.systemPromptAppend + '\n\n[PLAN MODE ACTIVE: You are in read-only exploration mode. You may NOT create, modify, or delete any files. Focus on understanding, researching, and planning only.]'
        : options.systemPromptAppend
    },

    // Working directory
    cwd: options.workingDirectory,

    // Permission mode
    permissionMode: options.isPlanMode ? 'default' : options.permissionMode
  };

  // Plan mode restrictions
  if (options.isPlanMode) {
    queryOptions.disallowedTools = [
      ...(options.disallowedTools || []),
      'Write', 'Edit', 'Bash', 'NotebookEdit'
    ];
  }

  // Optional configurations
  if (options.fallbackModel) {
    queryOptions.fallbackModel = options.fallbackModel;
  }

  if (options.maxBudgetUsd) {
    queryOptions.maxBudgetUsd = options.maxBudgetUsd;
  }

  if (Object.keys(options.mcpServers).length > 0) {
    queryOptions.mcpServers = options.mcpServers;
  }

  if (options.allowedTools && options.allowedTools.length > 0) {
    queryOptions.allowedTools = options.allowedTools;
  }

  if (options.disallowedTools && options.disallowedTools.length > 0 && !options.isPlanMode) {
    queryOptions.disallowedTools = options.disallowedTools;
  }

  if (options.settingSources && options.settingSources.length > 0) {
    queryOptions.settingSources = options.settingSources;
  }

  if (options.agents && Object.keys(options.agents).length > 0) {
    queryOptions.agents = options.agents;
  }

  if (options.hooks) {
    queryOptions.hooks = options.hooks;
  }

  if (options.env && Object.keys(options.env).length > 0) {
    queryOptions.env = options.env;
  }

  if (options.additionalDirectories && options.additionalDirectories.length > 0) {
    queryOptions.additionalDirectories = options.additionalDirectories;
  }

  if (options.sandbox) {
    queryOptions.sandbox = options.sandbox;
  }

  if (options.resume) {
    queryOptions.resume = options.resume;
  }

  if (options.forkSession) {
    queryOptions.forkSession = options.forkSession;
  }

  if (options.continue) {
    queryOptions.continue = options.continue;
  }

  if (options.outputFormat) {
    queryOptions.outputFormat = options.outputFormat;
  }

  if (options.includePartialMessages) {
    queryOptions.includePartialMessages = options.includePartialMessages;
  }

  if (options.enableFileCheckpointing) {
    queryOptions.enableFileCheckpointing = options.enableFileCheckpointing;
  }

  if (options.permissionMode === 'bypassPermissions') {
    queryOptions.allowDangerouslySkipPermissions = true;
  }

  // Custom permission handler for interactive prompts
  if (options.canUseTool) {
    queryOptions.canUseTool = options.canUseTool;
  }

  return queryOptions;
}
