#!/usr/bin/env node
/**
 * Claude CLI Template
 * Full Claude Code capabilities with your branding
 *
 * This is YOUR Claude Code - same power, your branding.
 * Run `agent` and start building.
 */
import React from 'react';
import { render } from 'ink';
import { ConversationalAgent } from './conversation.js';
import { App } from './ui/App.js';
import { buildMcpConfig, checkAllMcpServers, formatMcpStatus, DEFAULT_MCP_SERVERS } from './features/mcp.js';
import { discoverAllCommands, formatCommandList } from './features/commands.js';
import { PluginManager, formatPluginList } from './features/plugins.js';
import { SessionService } from './services/sessions.js';
import { BRANDING } from './branding.js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
// Read version from package.json
function getVersion() {
    try {
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const pkgPath = join(__dirname, '../package.json');
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        return pkg.version || '0.0.0';
    }
    catch {
        return '0.0.0';
    }
}
/**
 * Show MCP server status
 */
async function showMcpStatus() {
    console.log('\nDefault MCP Servers:');
    for (const [name, config] of Object.entries(DEFAULT_MCP_SERVERS)) {
        const type = config.type;
        const url = 'url' in config ? config.url : config.command;
        console.log(`  ${name}: ${type} - ${url}`);
    }
    console.log('\nChecking connectivity...\n');
    const servers = buildMcpConfig({ useDefaultMcpServers: true });
    const results = await checkAllMcpServers(servers);
    console.log(formatMcpStatus(results));
}
/**
 * Show available slash commands
 */
function showCommands() {
    const commands = discoverAllCommands();
    console.log('\n' + formatCommandList(commands));
    console.log('\nUsage: /command [arguments]');
    console.log('\nAdd custom commands:');
    console.log('  - User commands: ~/.claude/commands/*.md');
    console.log('  - Project commands: ./.claude/commands/*.md');
}
/**
 * Install a plugin
 */
async function installPlugin(source) {
    console.log(`\nInstalling plugin from: ${source}`);
    const manager = new PluginManager();
    const result = await manager.install(source);
    if (result.success && result.plugin) {
        console.log(`\nSuccessfully installed: ${result.plugin.manifest.name} v${result.plugin.manifest.version}`);
        console.log(`  ${result.plugin.manifest.description}`);
        if (result.plugin.commands.length > 0) {
            console.log(`  Commands: ${result.plugin.commands.map(c => '/' + c.name).join(', ')}`);
        }
        const mcpCount = Object.keys(result.plugin.mcpServers).length;
        if (mcpCount > 0) {
            console.log(`  MCP Servers: ${Object.keys(result.plugin.mcpServers).join(', ')}`);
        }
    }
    else {
        console.error(`\nFailed to install plugin: ${result.error}`);
        process.exit(1);
    }
}
/**
 * Uninstall a plugin
 */
async function uninstallPlugin(name) {
    console.log(`\nUninstalling plugin: ${name}`);
    const manager = new PluginManager();
    const result = await manager.uninstall(name);
    if (result.success) {
        console.log(`\nSuccessfully uninstalled: ${name}`);
    }
    else {
        console.error(`\nFailed to uninstall plugin: ${result.error}`);
        process.exit(1);
    }
}
/**
 * List installed plugins
 */
function listPlugins() {
    const manager = new PluginManager();
    manager.loadAll();
    const plugins = manager.list();
    console.log('\n' + formatPluginList(plugins));
}
async function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        workingDirectory: process.cwd(),
        verbose: false,
        maxTurns: 50
    };
    const requestParts = [];
    let interactive = false;
    let i = 0;
    while (i < args.length) {
        const arg = args[i];
        if (arg === '--cwd' || arg === '-d') {
            options.workingDirectory = args[++i] || process.cwd();
        }
        else if (arg === '--max-turns' || arg === '-m') {
            options.maxTurns = parseInt(args[++i] || '50', 10);
        }
        else if (arg === '--interactive' || arg === '-i') {
            interactive = true;
        }
        else if (arg === '--verbose' || arg === '-V') {
            options.verbose = true;
        }
        else if (arg === '--help' || arg === '-h') {
            printHelp();
            process.exit(0);
        }
        else if (arg === '--version' || arg === '-v') {
            console.log(`${BRANDING.productName} v${getVersion()}`);
            process.exit(0);
            // Model flags
        }
        else if (arg === '--model') {
            options.model = args[++i];
        }
        else if (arg === '--max-thinking') {
            options.maxThinkingTokens = parseInt(args[++i] || '128000', 10);
        }
        else if (arg === '--max-budget') {
            options.maxBudgetUsd = parseFloat(args[++i] || '0');
            // Permission flags
        }
        else if (arg === '--permission') {
            options.permissionMode = args[++i];
        }
        else if (arg === '--allow-tools') {
            options.allowedTools = args[++i]?.split(',') || [];
        }
        else if (arg === '--disallow-tools') {
            options.disallowedTools = args[++i]?.split(',') || [];
            // MCP flags
        }
        else if (arg === '--mcp') {
            try {
                options.mcpServers = JSON.parse(args[++i] || '{}');
            }
            catch {
                console.error('Error: --mcp requires valid JSON');
                process.exit(1);
            }
        }
        else if (arg === '--no-default-mcp') {
            options.useDefaultMcpServers = false;
        }
        else if (arg === '--cloud-only') {
            options.cloudOnly = true;
        }
        else if (arg === '--mcp-config') {
            options.mcpConfigPath = args[++i];
        }
        else if (arg === '--mcp-status') {
            await showMcpStatus();
            process.exit(0);
            // Command flags
        }
        else if (arg === '--list-commands') {
            showCommands();
            process.exit(0);
            // Plugin flags
        }
        else if (arg === '--install-plugin') {
            const pluginSource = args[++i];
            if (!pluginSource) {
                console.error('Error: --install-plugin requires a source (github:owner/repo or path)');
                process.exit(1);
            }
            await installPlugin(pluginSource);
            process.exit(0);
        }
        else if (arg === '--uninstall-plugin') {
            const pluginName = args[++i];
            if (!pluginName) {
                console.error('Error: --uninstall-plugin requires a plugin name');
                process.exit(1);
            }
            await uninstallPlugin(pluginName);
            process.exit(0);
        }
        else if (arg === '--list-plugins') {
            listPlugins();
            process.exit(0);
            // Session flags
        }
        else if (arg === '--resume') {
            options.resume = args[++i];
        }
        else if (arg === '--continue') {
            options.continueSession = true;
            // Sandbox flags
        }
        else if (arg === '--sandbox') {
            options.sandboxEnabled = true;
            // Settings flags
        }
        else if (arg === '--setting-sources') {
            options.settingSources = args[++i]?.split(',');
        }
        else if (arg === '--no-personality') {
            options.disablePIVPersonality = true;
            // Environment flags
        }
        else if (arg === '--env') {
            const envArg = args[++i] || '';
            const eqIndex = envArg.indexOf('=');
            if (eqIndex > 0) {
                const key = envArg.substring(0, eqIndex);
                const value = envArg.substring(eqIndex + 1);
                if (!options.env)
                    options.env = {};
                options.env[key] = value;
            }
        }
        else if (!arg.startsWith('-')) {
            requestParts.push(arg);
        }
        i++;
    }
    return {
        request: requestParts.join(' '),
        options,
        interactive
    };
}
function printHelp() {
    const cmd = BRANDING.cliCommand;
    console.log(`
${BRANDING.productName} - ${BRANDING.tagline}

USAGE:
  ${cmd}                             Start interactive session
  ${cmd} -i                          Start interactive session
  ${cmd} <request>                   One-shot mode
  ${cmd} "Add user authentication"

BASIC OPTIONS:
  -i, --interactive       Start interactive session (default if no request)
  -d, --cwd <dir>         Working directory (default: current)
  -m, --max-turns <n>     Maximum agent turns (default: 50)
  -V, --verbose           Show tool calls and thinking
  -h, --help              Show this help message
  -v, --version           Show version

MODEL OPTIONS:
  --model <name>          Override model (default: claude-opus-4-5-20251101)
  --max-thinking <n>      Max thinking tokens (default: 128000)
  --max-budget <usd>      Budget limit in USD

PERMISSION OPTIONS:
  --permission <mode>     Permission mode: default|acceptEdits|bypassPermissions
  --allow-tools <list>    Comma-separated tool whitelist
  --disallow-tools <list> Comma-separated tool blacklist

MCP OPTIONS:
  --mcp <json>            Additional MCP server config as JSON
                          Example: --mcp '{"myserver":{"command":"npx","args":["-y","my-mcp"]}}'
  --no-default-mcp        Disable bundled MCP servers
  --cloud-only            Only use cloud MCP servers (skip localhost servers)
  --mcp-config <path>     Custom .mcp.json config file path
  --mcp-status            Show MCP server status and connectivity

COMMAND OPTIONS:
  --list-commands         Show available slash commands

PLUGIN OPTIONS:
  --install-plugin <src>  Install plugin (github:owner/repo or local path)
  --uninstall-plugin <n>  Uninstall plugin by name
  --list-plugins          Show installed plugins

SESSION OPTIONS:
  --resume <id>           Resume session by ID
  --continue              Continue most recent session

SANDBOX OPTIONS:
  --sandbox               Enable sandbox mode for secure execution

ADVANCED OPTIONS:
  --setting-sources <list>  Setting sources: user,project,local
  --no-personality          Disable custom personality (raw Claude Code)
  --env <key>=<value>       Set environment variable (repeatable)

EXAMPLES:
  ${cmd}                                      # Interactive mode
  ${cmd} "Fix the login bug"                  # One-shot mode
  ${cmd} -i --cwd ./my-project                # Interactive in specific dir
  ${cmd} -V "Build a REST API"                # Verbose - see tool usage
  ${cmd} --model claude-sonnet-4-20250514     # Use Sonnet instead of Opus
  ${cmd} --permission acceptEdits             # Auto-accept file edits
  ${cmd} --sandbox "Run untrusted code"       # Sandboxed execution

CAPABILITIES:
  Full Claude Code equivalent:

  - Read, Write, Edit files
  - Run bash commands
  - Search with Glob and Grep
  - Web search and fetch
  - Subagent delegation
  - MCP server integration
  - Slash commands (/plan, /execute, /validate, /review, /commit)
  - Plugin system (install from GitHub or local)
  - Hooks and sandbox support
  - Extended thinking (128K tokens)
  - Opus 4.5 intelligence

  Say "hello" and start building!
`);
}
/**
 * Check if running in a TTY environment
 */
function isTTY() {
    return process.stdin.isTTY === true && process.stdout.isTTY === true;
}
/**
 * Build full agent options from CLI options
 */
function buildAgentOptions(options) {
    return {
        // Core
        workingDirectory: options.workingDirectory,
        verbose: options.verbose,
        maxTurns: options.maxTurns,
        // Model
        model: options.model,
        maxThinkingTokens: options.maxThinkingTokens,
        maxBudgetUsd: options.maxBudgetUsd,
        // Permissions
        permissionMode: options.permissionMode,
        allowedTools: options.allowedTools,
        disallowedTools: options.disallowedTools,
        // MCP
        mcpServers: options.mcpServers,
        useDefaultMcpServers: options.useDefaultMcpServers,
        cloudOnly: options.cloudOnly,
        mcpConfigPath: options.mcpConfigPath,
        // Session
        resume: options.resume,
        continue: options.continueSession,
        // Sandbox
        sandbox: options.sandboxEnabled ? { enabled: true } : undefined,
        // Settings
        settingSources: options.settingSources,
        disablePIVPersonality: options.disablePIVPersonality,
        // Environment
        env: options.env
    };
}
/**
 * Interactive mode with Ink UI
 */
async function runInteractiveMode(options) {
    // Use Ink UI if TTY is available
    if (isTTY()) {
        // Initialize session service
        const sessionService = new SessionService(options.workingDirectory);
        // Determine which session to resume
        let resumeSessionId = options.resume;
        // --continue: resume most recent session
        if (options.continueSession && !resumeSessionId) {
            const sessions = sessionService.list();
            if (sessions.length > 0) {
                resumeSessionId = sessions[0].id;
                console.log(`Continuing session: ${sessions[0].name || sessions[0].initialPrompt.slice(0, 40)}...`);
            }
            else {
                console.log('No previous sessions found. Starting new session.');
            }
        }
        // Load previous messages for resumed session (for UI display)
        let initialMessages = [];
        if (resumeSessionId) {
            initialMessages = sessionService.getUIMessages(resumeSessionId);
        }
        // Track current session ID for session service updates
        // Note: currentSessionId is captured in callbacks for future features (e.g., auto-title on first message)
        let _currentSessionId = resumeSessionId;
        // Build agent options with resolved session ID
        // CRITICAL: When --continue resolved a session ID, we must set it in agentOptions
        // and clear the continue flag to avoid SDK confusion
        const agentOpts = buildAgentOptions(options);
        if (resumeSessionId) {
            agentOpts.resume = resumeSessionId;
            // Clear continue flag since we've already resolved it to a specific session
            delete agentOpts.continue;
        }
        // Session callbacks for App
        const onSessionCreated = (sessionId) => {
            _currentSessionId = sessionId;
            // Create session metadata in SQLite (SDK handles history internally)
            // Note: initialPrompt will be empty initially - updated on first message via onFirstMessage
            sessionService.createWithId(sessionId, '');
        };
        // Called when the first user message is sent - update session with the actual prompt
        const onFirstMessage = (sessionId, prompt) => {
            sessionService.updateInitialPrompt(sessionId, prompt);
        };
        const onShowSessions = () => {
            return sessionService.list();
        };
        const onSessionSelect = (_session) => {
            // Session is now resumed via hot swap in useAgent
            // This callback is for external logging/tracking if needed
        };
        // Load messages for a session (used by session picker resume)
        const onLoadMessages = (sessionId) => {
            return sessionService.getUIMessages(sessionId);
        };
        // Save messages to SQLite for persistence across restarts
        const onMessage = (sessionId, message) => {
            sessionService.appendUIMessage(sessionId, message);
        };
        const { waitUntilExit } = render(React.createElement(App, {
            cwd: options.workingDirectory,
            mode: 'interactive',
            verbose: options.verbose,
            agentOptions: agentOpts, // Use fixed options with resolved resume ID
            resumeSessionId,
            initialMessages, // Previous messages to display on resume
            onSessionCreated,
            onFirstMessage,
            onMessage, // Save messages as they stream
            onShowSessions,
            onSessionSelect,
            onLoadMessages // Load messages for session picker resume
        }));
        await waitUntilExit();
    }
    else {
        // Fallback to simple mode for non-TTY
        console.log('Non-TTY environment detected. Use one-shot mode:');
        console.log('  agent "Your request here"');
        process.exit(1);
    }
}
/**
 * One-shot mode - for scripting/CI
 * Uses simple streaming output, no fancy UI
 */
async function runOneShotMode(request, options) {
    // For non-TTY or simpler output, use streaming without Ink
    if (!isTTY()) {
        // Simple streaming for piped output
        const agent = new ConversationalAgent(buildAgentOptions(options));
        try {
            for await (const chunk of agent.chat(request)) {
                if (chunk.type === 'text' || chunk.type === 'result') {
                    process.stdout.write(chunk.content);
                }
                else if (chunk.type === 'error') {
                    process.stderr.write(`Error: ${chunk.content}\n`);
                }
            }
            process.stdout.write('\n');
            agent.close();
            process.exit(0);
        }
        catch (error) {
            console.error('Fatal Error:', error);
            agent.close();
            process.exit(1);
        }
    }
    else {
        // Use Ink UI for TTY with initial prompt
        const { waitUntilExit } = render(React.createElement(App, {
            cwd: options.workingDirectory,
            mode: 'oneshot',
            verbose: options.verbose,
            agentOptions: buildAgentOptions(options),
            initialPrompt: request
        }));
        await waitUntilExit();
    }
}
async function main() {
    const { request, options, interactive } = await parseArgs();
    // If no request provided, default to interactive mode
    if (!request || interactive) {
        await runInteractiveMode(options);
    }
    else {
        await runOneShotMode(request, options);
    }
}
main().catch(console.error);
//# sourceMappingURL=cli.js.map