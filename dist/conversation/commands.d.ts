/**
 * Conversation Built-in Commands Module
 *
 * Handles built-in slash commands like /clear, /help, /mcp, etc.
 * Designed for full Claude Code CLI feature parity.
 */
import type { ConversationMessage } from './types.js';
import type { SlashCommand } from '../features/commands.js';
import type { McpServersConfig } from '../features/mcp.js';
import type { ContextManager } from '../features/context.js';
import type { SessionService } from '../services/sessions.js';
import { type LoadedPlugin } from '../features/plugins.js';
/**
 * Result of handling a built-in command
 */
export interface BuiltinCommandResult {
    /** Message to display to user */
    message: ConversationMessage;
    /** Action to perform (for commands that modify state) */
    action?: BuiltinCommandAction;
}
/**
 * Actions that commands can request
 */
export type BuiltinCommandAction = {
    type: 'clearHistory';
} | {
    type: 'setModel';
    model: string;
} | {
    type: 'setThinking';
    enabled: boolean;
} | {
    type: 'toggleThinking';
} | {
    type: 'showSessionPicker';
} | {
    type: 'renameSession';
    name: string;
} | {
    type: 'exit';
} | {
    type: 'openConfig';
} | {
    type: 'openMcp';
} | {
    type: 'openModelSelector';
} | {
    type: 'openMemory';
} | {
    type: 'openHelp';
} | {
    type: 'enterPlanMode';
} | {
    type: 'initProject';
} | {
    type: 'addDirectory';
    path: string;
} | {
    type: 'toggleVimMode';
} | {
    type: 'rewind';
};
/**
 * Context needed by command handlers
 */
export interface CommandContext {
    /** Discovered slash commands */
    commands: SlashCommand[];
    /** Configured MCP servers */
    mcpServers: McpServersConfig;
    /** Context manager for metrics */
    contextManager: ContextManager;
    /** Current model */
    currentModel: string;
    /** Current thinking state */
    thinkingEnabled: boolean;
    /** Permission mode label */
    permissionModeLabel: string;
    /** Format status function */
    formatStatus: () => string;
    /** Format context function */
    formatContext: () => string;
    /** Format cost function */
    formatCost: () => string;
    /** Session service for session commands (optional) */
    sessionService?: SessionService;
    /** Current session ID (optional) */
    sessionId?: string;
    /** Loaded plugins (optional) */
    plugins?: LoadedPlugin[];
    /** Current working directory */
    cwd?: string;
    /** Version string */
    version?: string;
}
/**
 * Handle a built-in slash command
 *
 * Supports all Claude Code CLI commands for full feature parity:
 * - Session & Navigation: /exit, /help, /resume, /rename, /clear, /rewind
 * - Configuration: /config, /status, /settings, /permissions, /model, /theme, /vim
 * - Development: /init, /doctor, /memory, /plan
 * - Context: /context, /cost, /stats, /todos
 * - Skills & Agents: /skills, /agents
 * - MCP & Plugins: /mcp, /plugin, /hooks
 * - And more...
 *
 * @param command - The command name (without /)
 * @param args - Arguments passed to the command
 * @param context - Context needed by handlers
 * @returns Result if command was handled, null if not a built-in command
 */
export declare function handleBuiltinCommand(command: string, args: string, context: CommandContext): BuiltinCommandResult | null;
/**
 * Get list of all built-in command names
 */
export declare function getBuiltinCommandNames(): string[];
//# sourceMappingURL=commands.d.ts.map