/**
 * Conversational Agent
 *
 * Full Claude Code capabilities with PIV methodology and custom branding.
 * This is a Claude Code equivalent - same tools, same power, YOUR branding.
 * Supports: MCP servers, Skills, Hooks, Sandbox, all permission modes.
 */
import type { McpServersConfig, McpServerConfig } from '../features/mcp.js';
import { type SlashCommand } from '../features/commands.js';
import { ContextManager, type TokenUsage } from '../features/context.js';
import type { ConversationMessage, PermissionMode, ConversationalAgentOptions, AgentDefinition } from './types.js';
/**
 * ConversationalAgent - Full Claude Code power with PIV branding
 *
 * Capabilities:
 * - Read, Write, Edit (file operations)
 * - Bash (shell commands)
 * - Glob, Grep (search)
 * - WebSearch, WebFetch (web access)
 * - Task (subagent delegation)
 * - Skill (custom skills from .claude/skills/)
 * - MCP servers (custom tool integrations)
 * - Hooks (execution callbacks)
 * - Sandbox (secure execution)
 * - And everything else Claude Code has
 */
export declare class ConversationalAgent {
    private options;
    private conversationHistory;
    private isRunning;
    private currentQuery;
    private abortRequested;
    private mcpManager;
    private discoveredCommands;
    private contextManager;
    private permissionModeIndex;
    private thinkingEnabled;
    private showThinking;
    private sessionId?;
    private onSessionCreated?;
    private onFirstMessage?;
    private firstMessageSent;
    constructor(options?: ConversationalAgentOptions);
    /**
     * Get currently configured MCP servers
     */
    getMcpServers(): McpServersConfig;
    /**
     * Get current options (for inspection)
     */
    getOptions(): ConversationalAgentOptions;
    /**
     * Update options dynamically
     */
    updateOptions(newOptions: Partial<ConversationalAgentOptions>): void;
    /**
     * Add an MCP server at runtime
     */
    addMcpServer(name: string, config: McpServerConfig): void;
    /**
     * Remove an MCP server
     */
    removeMcpServer(name: string): void;
    /**
     * Reload MCP configuration from file and defaults
     */
    reloadMcpConfig(): void;
    /**
     * Discover slash commands from all sources
     */
    private discoverCommands;
    /**
     * Get all available slash commands
     */
    getCommands(): SlashCommand[];
    /**
     * Get formatted command list for display
     */
    getCommandList(): string;
    /**
     * Reload/refresh discovered commands
     */
    reloadCommands(): void;
    /**
     * Get current permission mode
     */
    getPermissionMode(): PermissionMode;
    /**
     * Set permission mode directly
     */
    setPermissionMode(mode: PermissionMode): void;
    /**
     * Cycle to next permission mode (for Shift+Tab)
     * Returns the new mode
     */
    cyclePermissionMode(): PermissionMode;
    /**
     * Get permission mode display label
     */
    getPermissionModeLabel(): string;
    /**
     * Get current model
     */
    getModel(): string;
    /**
     * Set model (supports aliases)
     */
    setModel(modelOrAlias: string): string;
    /**
     * Get model display name
     */
    getModelDisplayName(): string;
    /**
     * Check if extended thinking is enabled
     */
    isThinkingEnabled(): boolean;
    /**
     * Enable/disable extended thinking
     */
    setThinkingEnabled(enabled: boolean): void;
    /**
     * Toggle thinking mode
     */
    toggleThinking(): boolean;
    /**
     * Check if verbose thinking display is on
     */
    isShowThinking(): boolean;
    /**
     * Toggle verbose thinking display (for Ctrl+O)
     */
    toggleShowThinking(): boolean;
    /**
     * Get context manager for metrics
     */
    getContextManager(): ContextManager;
    /**
     * Get token usage
     */
    getTokenUsage(): TokenUsage;
    /**
     * Format cost for display
     */
    formatCost(): string;
    /**
     * Format context for display
     */
    formatContext(): string;
    /**
     * Format full status
     */
    formatStatus(): string;
    /**
     * Add a custom agent definition
     */
    addAgent(name: string, definition: AgentDefinition): void;
    /**
     * Send a message and stream the response
     * Uses Claude Code's full toolset with all configured capabilities
     */
    chat(message: string): AsyncGenerator<ConversationMessage>;
    /**
     * Build prompt with conversation history for context
     */
    private buildPromptWithHistory;
    /**
     * Send a single message and get the full response (non-streaming)
     */
    sendMessage(message: string): Promise<string>;
    /**
     * Get conversation history
     */
    getHistory(): Array<{
        role: 'user' | 'assistant';
        content: string;
    }>;
    /**
     * Clear conversation history
     */
    clearHistory(): void;
    /**
     * Check if currently processing
     */
    isProcessing(): boolean;
    /**
     * Interrupt current query if running
     */
    interrupt(): Promise<void>;
    /**
     * Close/cleanup
     */
    close(): void;
    /**
     * Get current session ID (captured from SDK's system.init message)
     */
    getSessionId(): string | undefined;
    /**
     * Set session ID (used when resuming a session)
     */
    setSessionId(sessionId: string): void;
}
//# sourceMappingURL=agent.d.ts.map