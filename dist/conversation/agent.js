/**
 * Conversational Agent
 *
 * Full Claude Code capabilities with PIV methodology and custom branding.
 * This is a Claude Code equivalent - same tools, same power, YOUR branding.
 * Supports: MCP servers, Skills, Hooks, Sandbox, all permission modes.
 */
import { query } from '@anthropic-ai/claude-agent-sdk';
import { McpManager } from './mcp-manager.js';
import { buildQueryOptions } from './query-builder.js';
import { parseCommand, discoverAllCommands, executeCommand, formatCommandList } from '../features/commands.js';
import { ContextManager } from '../features/context.js';
import { resolveModel, getModelDisplayName } from '../features/models.js';
import { processSDKMessage } from './streaming.js';
import { handleBuiltinCommand } from './commands.js';
import { PERMISSION_MODE_CYCLE, PERMISSION_MODE_LABELS } from './types.js';
import { DEFAULT_MODEL, DEFAULT_THINKING_TOKENS, PIV_SYSTEM_PROMPT_APPEND } from './constants.js';
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
export class ConversationalAgent {
    options;
    conversationHistory = [];
    isRunning = false;
    currentQuery = null;
    abortRequested = false; // Fallback interrupt mechanism
    mcpManager;
    discoveredCommands = [];
    // Context and cost tracking
    contextManager = new ContextManager();
    // Permission mode cycling
    permissionModeIndex = 0;
    // Ultrathink support
    thinkingEnabled = true; // Default on (128K tokens)
    showThinking = false; // Verbose thinking display
    // Session management (SDK handles state internally, we just track the ID)
    sessionId;
    onSessionCreated;
    onFirstMessage;
    firstMessageSent = false;
    constructor(options = {}) {
        this.options = {
            workingDirectory: options.workingDirectory || process.cwd(),
            verbose: options.verbose || false,
            maxTurns: options.maxTurns || 50,
            ...options
        };
        // Initialize MCP Manager
        this.mcpManager = new McpManager({
            useDefaultMcpServers: this.options.useDefaultMcpServers ?? true,
            cloudOnly: this.options.cloudOnly ?? false,
            mcpConfigPath: this.options.mcpConfigPath,
            additionalServers: this.options.mcpServers
        });
        // Store session callbacks (SDK provides session_id in system.init message)
        this.onSessionCreated = options.onSessionCreated;
        this.onFirstMessage = options.onFirstMessage;
        // Discover slash commands
        this.discoveredCommands = this.discoverCommands();
    }
    /**
     * Get currently configured MCP servers
     */
    getMcpServers() {
        return this.mcpManager.getServers();
    }
    /**
     * Get current options (for inspection)
     */
    getOptions() {
        return { ...this.options };
    }
    /**
     * Update options dynamically
     */
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
    }
    /**
     * Add an MCP server at runtime
     */
    addMcpServer(name, config) {
        if (!this.options.mcpServers) {
            this.options.mcpServers = {};
        }
        this.options.mcpServers[name] = config;
        this.mcpManager.addServer(name, config);
    }
    /**
     * Remove an MCP server
     */
    removeMcpServer(name) {
        if (this.options.mcpServers) {
            delete this.options.mcpServers[name];
        }
        this.mcpManager.removeServer(name);
    }
    /**
     * Reload MCP configuration from file and defaults
     */
    reloadMcpConfig() {
        this.mcpManager.reload();
    }
    /**
     * Discover slash commands from all sources
     */
    discoverCommands() {
        return discoverAllCommands(this.options.commandSearchPaths || []);
    }
    /**
     * Get all available slash commands
     */
    getCommands() {
        return [...this.discoveredCommands];
    }
    /**
     * Get formatted command list for display
     */
    getCommandList() {
        return formatCommandList(this.discoveredCommands);
    }
    /**
     * Reload/refresh discovered commands
     */
    reloadCommands() {
        this.discoveredCommands = this.discoverCommands();
    }
    // ============ Permission Mode Cycling ============
    /**
     * Get current permission mode
     */
    getPermissionMode() {
        return this.options.permissionMode || PERMISSION_MODE_CYCLE[this.permissionModeIndex];
    }
    /**
     * Set permission mode directly
     */
    setPermissionMode(mode) {
        this.options.permissionMode = mode;
        const idx = PERMISSION_MODE_CYCLE.indexOf(mode);
        if (idx >= 0) {
            this.permissionModeIndex = idx;
        }
    }
    /**
     * Cycle to next permission mode (for Shift+Tab)
     * Returns the new mode
     */
    cyclePermissionMode() {
        this.permissionModeIndex = (this.permissionModeIndex + 1) % PERMISSION_MODE_CYCLE.length;
        const newMode = PERMISSION_MODE_CYCLE[this.permissionModeIndex];
        this.options.permissionMode = newMode;
        return newMode;
    }
    /**
     * Get permission mode display label
     */
    getPermissionModeLabel() {
        const mode = this.getPermissionMode();
        return PERMISSION_MODE_LABELS[mode] || '';
    }
    // ============ Model Switching ============
    /**
     * Get current model
     */
    getModel() {
        return this.options.model || DEFAULT_MODEL;
    }
    /**
     * Set model (supports aliases)
     */
    setModel(modelOrAlias) {
        const resolved = resolveModel(modelOrAlias);
        this.options.model = resolved;
        return resolved;
    }
    /**
     * Get model display name
     */
    getModelDisplayName() {
        return getModelDisplayName(this.getModel());
    }
    // ============ Thinking Control ============
    /**
     * Check if extended thinking is enabled
     */
    isThinkingEnabled() {
        return this.thinkingEnabled;
    }
    /**
     * Enable/disable extended thinking
     */
    setThinkingEnabled(enabled) {
        this.thinkingEnabled = enabled;
    }
    /**
     * Toggle thinking mode
     */
    toggleThinking() {
        this.thinkingEnabled = !this.thinkingEnabled;
        return this.thinkingEnabled;
    }
    /**
     * Check if verbose thinking display is on
     */
    isShowThinking() {
        return this.showThinking || this.options.verbose || false;
    }
    /**
     * Toggle verbose thinking display (for Ctrl+O)
     */
    toggleShowThinking() {
        this.showThinking = !this.showThinking;
        return this.showThinking;
    }
    // ============ Context & Cost ============
    /**
     * Get context manager for metrics
     */
    getContextManager() {
        return this.contextManager;
    }
    /**
     * Get token usage
     */
    getTokenUsage() {
        return this.contextManager.getTokenUsage();
    }
    /**
     * Format cost for display
     */
    formatCost() {
        return this.contextManager.formatTokenUsage(this.getModel());
    }
    /**
     * Format context for display
     */
    formatContext() {
        return this.contextManager.formatMetrics();
    }
    /**
     * Format full status
     */
    formatStatus() {
        const lines = [
            'Agent Status:',
            '',
            `  Model: ${this.getModelDisplayName()}`,
            `  Mode:  ${this.getPermissionModeLabel() || 'normal'}`,
            `  Think: ${this.thinkingEnabled ? 'enabled (128K)' : 'disabled'}`,
            '',
            `  MCP Servers: ${this.mcpManager.getServerCount()} configured`,
            `  Commands: ${this.discoveredCommands.length} available`,
            '',
            this.contextManager.formatMetrics()
        ];
        return lines.join('\n');
    }
    /**
     * Add a custom agent definition
     */
    addAgent(name, definition) {
        if (!this.options.agents) {
            this.options.agents = {};
        }
        this.options.agents[name] = definition;
    }
    /**
     * Send a message and stream the response
     * Uses Claude Code's full toolset with all configured capabilities
     */
    async *chat(message) {
        if (this.isRunning) {
            yield { type: 'error', content: 'Already processing a request. Please wait.' };
            return;
        }
        this.isRunning = true;
        this.abortRequested = false; // Reset abort flag at start
        // Check for ultrathink prefix
        let processedMessage = message;
        let forceMaxThinking = false;
        if (message.toLowerCase().startsWith('ultrathink:')) {
            processedMessage = message.slice(11).trim();
            forceMaxThinking = true;
        }
        // Check for slash command
        let commandMetadata = null;
        const parsed = parseCommand(processedMessage);
        if (parsed) {
            // Build command context for built-in handlers
            const commandContext = {
                commands: this.discoveredCommands,
                mcpServers: this.mcpManager.getServers(),
                contextManager: this.contextManager,
                currentModel: this.getModel(),
                thinkingEnabled: this.thinkingEnabled,
                permissionModeLabel: this.getPermissionModeLabel(),
                formatStatus: () => this.formatStatus(),
                formatContext: () => this.formatContext(),
                formatCost: () => this.formatCost()
            };
            // Try to handle as built-in command
            const builtinResult = handleBuiltinCommand(parsed.command, parsed.args, commandContext);
            if (builtinResult) {
                // Handle any actions from the command
                if (builtinResult.action) {
                    switch (builtinResult.action.type) {
                        case 'clearHistory':
                            this.clearHistory();
                            break;
                        case 'setModel':
                            this.options.model = builtinResult.action.model;
                            break;
                        case 'setThinking':
                            this.thinkingEnabled = builtinResult.action.enabled;
                            break;
                        case 'toggleThinking':
                            this.thinkingEnabled = !this.thinkingEnabled;
                            break;
                        case 'showSessionPicker':
                            // Action handled by UI layer - emit special message type
                            yield {
                                type: 'text',
                                content: builtinResult.message.content,
                                metadata: { action: 'showSessionPicker' }
                            };
                            this.isRunning = false;
                            return;
                        case 'renameSession':
                            // Action handled by UI layer - emit special message type
                            yield {
                                type: 'text',
                                content: builtinResult.message.content,
                                metadata: { action: 'renameSession', name: builtinResult.action.name }
                            };
                            this.isRunning = false;
                            return;
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
                        case 'openHelp':
                            // Action handled by UI layer - emit special message type
                            yield {
                                type: 'text',
                                content: builtinResult.message.content,
                                metadata: { action: 'openHelp' }
                            };
                            this.isRunning = false;
                            return;
                    }
                }
                yield builtinResult.message;
                this.isRunning = false;
                return;
            }
            // Not a built-in - try template commands
            const result = executeCommand(parsed.command, parsed.args, this.discoveredCommands);
            if (result) {
                processedMessage = result.prompt;
                commandMetadata = result.metadata;
                // If command has disableModelInvocation, just return the expanded template
                if (commandMetadata.disableModelInvocation) {
                    yield { type: 'text', content: processedMessage };
                    this.isRunning = false;
                    return;
                }
                if (this.options.verbose) {
                    yield {
                        type: 'tool_use',
                        content: `[Executing /${parsed.command}${parsed.args ? ' ' + parsed.args : ''}]`
                    };
                }
            }
            else {
                // Unknown command
                yield {
                    type: 'error',
                    content: `Unknown command: /${parsed.command}. Use /help to see available commands.`
                };
                this.isRunning = false;
                return;
            }
        }
        this.conversationHistory.push({ role: 'user', content: message });
        // Track first message for session context update
        const isFirstMessage = !this.firstMessageSent;
        if (isFirstMessage) {
            this.firstMessageSent = true;
        }
        try {
            // Build the full prompt with conversation context
            const fullPrompt = this.buildPromptWithHistory(processedMessage);
            // Build system prompt
            const systemPromptAppend = this.options.disablePIVPersonality
                ? (this.options.systemPromptAppend || '')
                : (PIV_SYSTEM_PROMPT_APPEND + (this.options.systemPromptAppend || ''));
            // Determine thinking tokens
            const thinkingTokens = (forceMaxThinking || this.thinkingEnabled)
                ? DEFAULT_THINKING_TOKENS
                : 0;
            // Handle plan mode - disable tools that modify files
            const currentMode = this.getPermissionMode();
            const isPlanMode = currentMode === 'plan';
            // Build query options using extracted module
            const queryBuildOptions = {
                model: this.options.model || DEFAULT_MODEL,
                maxTurns: this.options.maxTurns || 50,
                workingDirectory: this.options.workingDirectory || process.cwd(),
                thinkingTokens,
                permissionMode: this.options.permissionMode || 'acceptEdits',
                isPlanMode,
                systemPromptAppend,
                mcpServers: this.mcpManager.getServers(),
                allowedTools: this.options.allowedTools,
                disallowedTools: this.options.disallowedTools,
                fallbackModel: this.options.fallbackModel,
                maxBudgetUsd: this.options.maxBudgetUsd,
                settingSources: this.options.settingSources,
                agents: this.options.agents,
                hooks: this.options.hooks,
                env: this.options.env,
                additionalDirectories: this.options.additionalDirectories,
                sandbox: this.options.sandbox,
                resume: this.options.resume,
                forkSession: this.options.forkSession,
                continue: this.options.continue,
                outputFormat: this.options.outputFormat,
                includePartialMessages: this.options.includePartialMessages,
                enableFileCheckpointing: this.options.enableFileCheckpointing,
                canUseTool: this.options.canUseTool
            };
            const queryOptions = buildQueryOptions(queryBuildOptions);
            // Run query with all configured options
            this.currentQuery = query({
                prompt: fullPrompt,
                options: queryOptions
            });
            let fullResponse = '';
            // Stream all messages from the agent loop
            for await (const msg of this.currentQuery) {
                // Check abort flag (fallback if SDK interrupt doesn't work)
                if (this.abortRequested) {
                    yield { type: 'text', content: '\n\n[Interrupted by user]' };
                    break;
                }
                // Capture session_id from ANY SDK message (all message types have session_id)
                // This is more robust than only checking system.init
                if ('session_id' in msg && msg.session_id && !this.sessionId) {
                    this.sessionId = msg.session_id;
                    if (this.onSessionCreated) {
                        this.onSessionCreated(this.sessionId);
                    }
                    // If this is the first message, update session with the initial prompt
                    if (isFirstMessage && this.onFirstMessage) {
                        this.onFirstMessage(this.sessionId, message);
                    }
                }
                const chunks = processSDKMessage(msg, this.options.verbose || false);
                for (const chunk of chunks) {
                    if (chunk.type === 'text') {
                        fullResponse += chunk.content;
                    }
                    yield chunk;
                }
            }
            // Track assistant response
            if (fullResponse) {
                this.conversationHistory.push({ role: 'assistant', content: fullResponse });
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            yield {
                type: 'error',
                content: `Something went wrong: ${errorMessage}`
            };
        }
        finally {
            this.isRunning = false;
            this.currentQuery = null;
        }
    }
    /**
     * Build prompt with conversation history for context
     */
    buildPromptWithHistory(currentMessage) {
        // For the first message, just return it
        if (this.conversationHistory.length <= 1) {
            return currentMessage;
        }
        // Build context from recent history (last 5 exchanges)
        const recentHistory = this.conversationHistory.slice(-10);
        const historyContext = recentHistory
            .slice(0, -1) // Exclude the current message we just added
            .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
            .join('\n\n');
        return `Previous conversation:\n${historyContext}\n\nUser: ${currentMessage}`;
    }
    /**
     * Send a single message and get the full response (non-streaming)
     */
    async sendMessage(message) {
        let fullResponse = '';
        for await (const chunk of this.chat(message)) {
            if (chunk.type === 'text' || chunk.type === 'result') {
                fullResponse += chunk.content;
            }
        }
        return fullResponse;
    }
    /**
     * Get conversation history
     */
    getHistory() {
        return [...this.conversationHistory];
    }
    /**
     * Clear conversation history
     */
    clearHistory() {
        this.conversationHistory = [];
    }
    /**
     * Check if currently processing
     */
    isProcessing() {
        return this.isRunning;
    }
    /**
     * Interrupt current query if running
     */
    async interrupt() {
        // Set abort flag as fallback mechanism (SDK interrupt may not always work)
        this.abortRequested = true;
        if (this.currentQuery) {
            try {
                await this.currentQuery.interrupt();
            }
            catch {
                // SDK interrupt may throw - abort flag handles this case
            }
        }
    }
    /**
     * Close/cleanup
     */
    close() {
        this.conversationHistory = [];
        this.isRunning = false;
        this.currentQuery = null;
    }
    /**
     * Get current session ID (captured from SDK's system.init message)
     */
    getSessionId() {
        return this.sessionId;
    }
    /**
     * Set session ID (used when resuming a session)
     */
    setSessionId(sessionId) {
        this.sessionId = sessionId;
    }
}
//# sourceMappingURL=agent.js.map