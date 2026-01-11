/**
 * Conversation Module Types
 *
 * Type definitions for the ConversationalAgent and related functionality.
 */
import type { McpServerConfig } from '../features/mcp.js';
/** Message from the conversation stream */
export interface ConversationMessage {
    type: 'text' | 'tool_use' | 'tool_result' | 'thinking' | 'result' | 'error' | 'user';
    content: string;
    metadata?: Record<string, unknown>;
}
/** Permission modes */
export type PermissionMode = 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan';
/** Permission mode cycle order for Shift+Tab cycling */
export declare const PERMISSION_MODE_CYCLE: PermissionMode[];
/** Permission mode display labels */
export declare const PERMISSION_MODE_LABELS: Record<PermissionMode, string>;
/** Permission request from SDK canUseTool callback */
export interface PermissionRequest {
    toolName: string;
    toolInput: Record<string, unknown>;
    toolUseID: string;
    decisionReason?: string;
}
/** User response to permission prompt */
export type PermissionResponse = 'allow' | 'always' | 'deny';
/** Permission result returned to SDK */
export type PermissionResult = {
    behavior: 'allow';
    updatedInput: Record<string, unknown>;
} | {
    behavior: 'deny';
    message: string;
    interrupt?: boolean;
};
/** canUseTool callback type for interactive permission prompts */
export type CanUseToolCallback = (toolName: string, input: Record<string, unknown>, options: {
    toolUseID: string;
    decisionReason?: string;
}) => Promise<PermissionResult>;
/** Setting sources for loading CLAUDE.md, skills, etc. */
export type SettingSource = 'user' | 'project' | 'local';
/** Hook events */
export type HookEvent = 'PreToolUse' | 'PostToolUse' | 'Stop' | 'Notification';
/** Hook callback type */
export type HookCallback = (input: Record<string, unknown>) => Promise<Record<string, unknown>>;
/** Hook matcher */
export interface HookMatcher {
    matcher: string | RegExp;
    hooks: HookCallback[];
}
/** Sandbox settings */
export interface SandboxSettings {
    enabled?: boolean;
    autoAllowBashIfSandboxed?: boolean;
    excludedCommands?: string[];
    network?: {
        allowLocalBinding?: boolean;
    };
}
/** Custom agent definition */
export interface AgentDefinition {
    description: string;
    prompt?: string;
    tools?: string[];
    model?: string;
}
/** Output format for structured responses */
export interface OutputFormat {
    type: 'json_schema';
    schema: Record<string, unknown>;
}
/** Full options for creating a conversational agent */
export interface ConversationalAgentOptions {
    /** Working directory for file operations */
    workingDirectory?: string;
    /** Enable verbose output (show tool calls) */
    verbose?: boolean;
    /** Maximum turns for agent loop */
    maxTurns?: number;
    /** Model to use (default: claude-opus-4-5-20251101) */
    model?: string;
    /** Fallback model if primary fails */
    fallbackModel?: string;
    /** Max thinking tokens (default: 128000) */
    maxThinkingTokens?: number;
    /** Budget limit in USD */
    maxBudgetUsd?: number;
    /** MCP server configurations */
    mcpServers?: Record<string, McpServerConfig>;
    /** Use bundled default MCP servers (archon, crawl4ai, context7). Default: true */
    useDefaultMcpServers?: boolean;
    /** Only use cloud MCP servers (no localhost required). Default: false */
    cloudOnly?: boolean;
    /** Path to .mcp.json config file */
    mcpConfigPath?: string;
    /** Allowed tools (whitelist) */
    allowedTools?: string[];
    /** Disallowed tools (blacklist) */
    disallowedTools?: string[];
    /** Permission mode */
    permissionMode?: PermissionMode;
    /** Allow bypassing permissions (required for bypassPermissions mode) */
    allowDangerouslySkipPermissions?: boolean;
    /** Custom permission handler for interactive tool approval */
    canUseTool?: CanUseToolCallback;
    /** Setting sources to load (CLAUDE.md, skills, etc.) */
    settingSources?: SettingSource[];
    /** Custom subagent definitions */
    agents?: Record<string, AgentDefinition>;
    /** Hooks for tool execution events */
    hooks?: Partial<Record<HookEvent, HookMatcher[]>>;
    /** Environment variables */
    env?: Record<string, string>;
    /** Additional directories to allow access */
    additionalDirectories?: string[];
    /** Sandbox settings for secure execution */
    sandbox?: SandboxSettings;
    /** Session ID to resume (uses SDK's built-in resume feature) */
    resume?: string;
    /** Fork session instead of continue */
    forkSession?: boolean;
    /** Continue most recent session */
    continue?: boolean;
    /** Callback when session is created (receives session_id from SDK's system.init message) */
    onSessionCreated?: (sessionId: string) => void;
    /** Callback when first user message is sent (to update session with initial prompt) */
    onFirstMessage?: (sessionId: string, prompt: string) => void;
    /** Structured output format */
    outputFormat?: OutputFormat;
    /** Include partial messages in stream */
    includePartialMessages?: boolean;
    /** Enable file checkpointing for rewinding */
    enableFileCheckpointing?: boolean;
    /** Custom system prompt append */
    systemPromptAppend?: string;
    /** Disable PIV personality (use raw Claude Code) */
    disablePIVPersonality?: boolean;
    /** Additional directories to search for slash commands */
    commandSearchPaths?: string[];
    /** Disable built-in slash commands */
    disableBuiltinCommands?: boolean;
}
//# sourceMappingURL=types.d.ts.map