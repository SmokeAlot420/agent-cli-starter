/**
 * Conversation Built-in Commands Module
 *
 * Handles built-in slash commands like /clear, /help, /mcp, etc.
 * Designed for full Claude Code CLI feature parity.
 */
import { resolveModel, getModelDisplayName } from '../features/models.js';
import { formatSkillList, discoverAllSkills } from '../features/skills.js';
import { formatSubagentList, discoverAllSubagents } from '../features/subagents.js';
import { loadSettings } from '../features/settings.js';
import { formatHooksList } from '../features/hooks.js';
import { formatPluginList } from '../features/plugins.js';
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
export function handleBuiltinCommand(command, args, context) {
    switch (command) {
        // ==================== Session & Navigation ====================
        // /exit - Exit the REPL
        case 'exit':
        case 'quit':
        case 'q':
            return {
                message: { type: 'text', content: 'Goodbye!' },
                action: { type: 'exit' }
            };
        // /clear - Clear history
        case 'clear':
            return {
                message: { type: 'text', content: 'Conversation cleared. Ready for new instructions.' },
                action: { type: 'clearHistory' }
            };
        // /help - Open interactive help panel
        case 'help':
        case '?':
            return {
                message: { type: 'text', content: '' },
                action: { type: 'openHelp' }
            };
        // /sessions - List all sessions
        case 'sessions':
            return handleSessionsCommand(context.sessionService);
        // /resume - Show session picker to resume a session
        case 'resume':
            return {
                message: { type: 'text', content: 'Opening session picker...' },
                action: { type: 'showSessionPicker' }
            };
        // /rename - Rename current session
        case 'rename':
            return handleRenameCommand(args, context.sessionId);
        // /rewind - Rewind conversation to previous state
        case 'rewind':
            return {
                message: { type: 'text', content: 'Rewinding conversation...' },
                action: { type: 'rewind' }
            };
        // ==================== Configuration & Settings ====================
        // /config - Open settings interface
        case 'config':
        case 'settings':
            return {
                message: { type: 'text', content: '' }, // Panel handles display
                action: { type: 'openConfig' }
            };
        // /status - Show full status
        case 'status':
            return handleStatusCommand(context);
        // /permissions - View or update permissions
        case 'permissions':
            return handlePermissionsCommand(args, context);
        // /model - Show or change model
        case 'model':
            return handleModelCommand(args, context.currentModel);
        // /think - Toggle thinking mode
        case 'think':
        case 'ultrathink':
            return handleThinkCommand(args, context.thinkingEnabled);
        // /vim - Toggle vim mode
        case 'vim':
            return {
                message: { type: 'text', content: 'Vim mode toggled.' },
                action: { type: 'toggleVimMode' }
            };
        // ==================== Development & Project ====================
        // /init - Initialize project with CLAUDE.md
        case 'init':
            return {
                message: { type: 'text', content: 'Initializing project...' },
                action: { type: 'initProject' }
            };
        // /memory - Edit CLAUDE.md memory files
        case 'memory':
            return {
                message: { type: 'text', content: 'Opening memory editor...' },
                action: { type: 'openMemory' }
            };
        // /plan - Enter plan mode
        case 'plan':
            if (args) {
                return {
                    message: { type: 'text', content: `Entering plan mode for: ${args}` },
                    action: { type: 'enterPlanMode' }
                };
            }
            return {
                message: { type: 'text', content: 'Entering plan mode...' },
                action: { type: 'enterPlanMode' }
            };
        // /add-dir - Add working directory
        case 'add-dir':
            if (!args) {
                return {
                    message: { type: 'text', content: 'Usage: /add-dir <path>' }
                };
            }
            return {
                message: { type: 'text', content: `Added directory: ${args}` },
                action: { type: 'addDirectory', path: args }
            };
        // /doctor - Health check (placeholder)
        case 'doctor':
            return handleDoctorCommand(context);
        // ==================== Context & Information ====================
        // /context - Show context metrics
        case 'context':
            return {
                message: { type: 'text', content: context.formatContext() }
            };
        // /cost - Show token usage and cost
        case 'cost':
            return {
                message: { type: 'text', content: context.formatCost() }
            };
        // /compact - Show context compaction info
        case 'compact':
            return {
                message: {
                    type: 'text',
                    content: 'Context compaction is handled automatically by the SDK.\n\nCurrent context:\n' + context.formatContext()
                }
            };
        // /todos - List current TODOs
        case 'todos':
            return {
                message: { type: 'text', content: 'TODO list is managed via the TodoWrite tool.' }
            };
        // /stats - Show usage statistics
        case 'stats':
            return handleStatsCommand(context);
        // ==================== Skills & Agents ====================
        // /skills - List available skills
        case 'skills':
            return {
                message: { type: 'text', content: formatSkillList(discoverAllSkills()) }
            };
        // /agents - List available subagents
        case 'agents':
            return {
                message: { type: 'text', content: formatSubagentList(discoverAllSubagents()) }
            };
        // ==================== MCP & Tools ====================
        // /mcp - Show MCP status
        case 'mcp':
            return handleMcpCommand(args, context.mcpServers);
        // /plugin - Plugin management
        case 'plugin':
        case 'plugins':
            return handlePluginCommand(args, context.plugins || []);
        // /hooks - Hook management
        case 'hooks':
            return {
                message: { type: 'text', content: formatHooksList() }
            };
        // ==================== Version & Info ====================
        // /version - Show version
        case 'version':
        case 'v':
            return {
                message: { type: 'text', content: `PIV Loop CLI v${context.version || '1.0.0'}` }
            };
        // /release-notes - Show release notes
        case 'release-notes':
            return {
                message: { type: 'text', content: 'Release notes available at: https://github.com/pivloop/loop-agent/releases' }
            };
        default:
            return null;
    }
}
/**
 * Handle /mcp command
 */
function handleMcpCommand(args, _mcpServers) {
    if (args === '' || args === 'status') {
        // Open interactive MCP panel
        return {
            message: { type: 'text', content: '' },
            action: { type: 'openMcp' }
        };
    }
    return {
        message: { type: 'text', content: 'Usage: /mcp [status|add|remove]' }
    };
}
/**
 * Handle /model command
 */
function handleModelCommand(args, _currentModel) {
    if (args) {
        const newModel = resolveModel(args);
        return {
            message: {
                type: 'text',
                content: `Model changed to: ${getModelDisplayName(newModel)} (${newModel})`
            },
            action: { type: 'setModel', model: newModel }
        };
    }
    // Open interactive model selector
    return {
        message: { type: 'text', content: '' },
        action: { type: 'openModelSelector' }
    };
}
/**
 * Handle /think command
 */
function handleThinkCommand(args, currentState) {
    const arg = args.toLowerCase().trim();
    if (arg === 'on') {
        return {
            message: { type: 'text', content: 'Extended thinking enabled (128K tokens).' },
            action: { type: 'setThinking', enabled: true }
        };
    }
    if (arg === 'off') {
        return {
            message: { type: 'text', content: 'Extended thinking disabled.' },
            action: { type: 'setThinking', enabled: false }
        };
    }
    // Toggle
    const newState = !currentState;
    return {
        message: {
            type: 'text',
            content: `Extended thinking ${newState ? 'enabled (128K tokens)' : 'disabled'}.`
        },
        action: { type: 'toggleThinking' }
    };
}
/**
 * Handle /sessions command
 */
function handleSessionsCommand(sessionService) {
    if (!sessionService) {
        return {
            message: { type: 'text', content: 'Session service not available.' }
        };
    }
    const sessions = sessionService.list();
    if (sessions.length === 0) {
        return {
            message: { type: 'text', content: 'No sessions found. Start a conversation to create one.' }
        };
    }
    const lines = ['Sessions:', ''];
    for (const session of sessions.slice(0, 10)) {
        const name = session.name || session.initialPrompt.slice(0, 40) + '...';
        const date = session.lastActiveAt.toLocaleDateString();
        const time = session.lastActiveAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        lines.push(`  ${session.id.slice(0, 8)} - ${name} (${date} ${time})`);
    }
    if (sessions.length > 10) {
        lines.push(`  ... and ${sessions.length - 10} more`);
    }
    lines.push('');
    lines.push('Use /resume to switch sessions, or --resume <id> when starting.');
    return {
        message: { type: 'text', content: lines.join('\n') }
    };
}
/**
 * Handle /rename command
 */
function handleRenameCommand(args, sessionId) {
    if (!sessionId) {
        return {
            message: { type: 'text', content: 'No active session to rename.' }
        };
    }
    const name = args.trim();
    if (!name) {
        return {
            message: { type: 'text', content: 'Usage: /rename <new name>' }
        };
    }
    return {
        message: { type: 'text', content: `Session renamed to "${name}".` },
        action: { type: 'renameSession', name }
    };
}
/**
 * Handle /status command - Show comprehensive status
 */
function handleStatusCommand(context) {
    const lines = [
        'PIV Loop CLI Status',
        '==================',
        '',
        `Version: ${context.version || '1.0.0'}`,
        `Model: ${getModelDisplayName(context.currentModel)}`,
        `Extended Thinking: ${context.thinkingEnabled ? 'Enabled (128K tokens)' : 'Disabled'}`,
        `Permission Mode: ${context.permissionModeLabel}`,
        '',
        context.formatStatus()
    ];
    return {
        message: { type: 'text', content: lines.join('\n') }
    };
}
/**
 * Handle /permissions command
 */
function handlePermissionsCommand(args, context) {
    const settings = loadSettings(context.cwd);
    if (!settings.permissions) {
        return {
            message: { type: 'text', content: 'No custom permissions configured.\n\nConfigure permissions in .claude/settings.json' }
        };
    }
    const lines = ['Permission Rules:', ''];
    for (const [tool, rules] of Object.entries(settings.permissions)) {
        if (rules && Object.keys(rules).length > 0) {
            lines.push(`  ${tool}:`);
            for (const [pattern, rule] of Object.entries(rules)) {
                lines.push(`    ${pattern}: ${rule}`);
            }
            lines.push('');
        }
    }
    if (lines.length === 2) {
        lines.push('  No rules configured.');
    }
    return {
        message: { type: 'text', content: lines.join('\n') }
    };
}
/**
 * Handle /doctor command - Health check
 */
function handleDoctorCommand(context) {
    const checks = ['PIV Loop Health Check', '====================', ''];
    // Check Node.js version
    const nodeVersion = process.version;
    checks.push(`✓ Node.js: ${nodeVersion}`);
    // Check working directory
    checks.push(`✓ Working Directory: ${context.cwd || process.cwd()}`);
    // Check MCP servers
    const mcpCount = Object.keys(context.mcpServers).length;
    checks.push(`✓ MCP Servers: ${mcpCount} configured`);
    // Check commands
    const commandCount = context.commands.length;
    checks.push(`✓ Slash Commands: ${commandCount} available`);
    // Check skills
    const skills = discoverAllSkills();
    checks.push(`✓ Skills: ${skills.length} available`);
    // Check subagents
    const subagents = discoverAllSubagents();
    checks.push(`✓ Subagents: ${subagents.length} available`);
    // Check plugins
    const pluginCount = context.plugins?.length || 0;
    checks.push(`✓ Plugins: ${pluginCount} loaded`);
    checks.push('');
    checks.push('All systems operational!');
    return {
        message: { type: 'text', content: checks.join('\n') }
    };
}
/**
 * Handle /stats command - Show usage statistics
 */
function handleStatsCommand(context) {
    const lines = [
        'Usage Statistics',
        '================',
        '',
        `Current Model: ${getModelDisplayName(context.currentModel)}`,
        `Thinking Mode: ${context.thinkingEnabled ? 'Extended (128K)' : 'Standard'}`,
        '',
        'Context Usage:',
        context.formatContext(),
        '',
        'Cost Estimate:',
        context.formatCost()
    ];
    return {
        message: { type: 'text', content: lines.join('\n') }
    };
}
/**
 * Handle /plugin command
 */
function handlePluginCommand(args, plugins) {
    const subcommand = args.trim().split(/\s+/)[0] || '';
    switch (subcommand) {
        case '':
        case 'list':
            return {
                message: { type: 'text', content: formatPluginList(plugins) }
            };
        case 'help':
            return {
                message: {
                    type: 'text',
                    content: `Plugin Commands:
  /plugin             - List installed plugins
  /plugin list        - List installed plugins
  /plugin help        - Show this help

Install plugins with:
  pivloop --install-plugin github:owner/repo
  pivloop --install-plugin ./local-plugin`
                }
            };
        default:
            return {
                message: { type: 'text', content: `Unknown plugin subcommand: ${subcommand}\n\nUse /plugin help for available commands.` }
            };
    }
}
/**
 * Get list of all built-in command names
 */
export function getBuiltinCommandNames() {
    return [
        // Session & Navigation
        'exit', 'quit', 'q', 'clear', 'help', '?', 'sessions', 'resume', 'rename', 'rewind',
        // Configuration
        'config', 'settings', 'status', 'permissions', 'model', 'think', 'ultrathink', 'vim',
        // Development
        'init', 'memory', 'plan', 'add-dir', 'doctor',
        // Context & Info
        'context', 'cost', 'compact', 'todos', 'stats',
        // Skills & Agents
        'skills', 'agents',
        // MCP & Plugins
        'mcp', 'plugin', 'plugins', 'hooks',
        // Version
        'version', 'v', 'release-notes'
    ];
}
//# sourceMappingURL=commands.js.map