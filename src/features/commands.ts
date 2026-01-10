/**
 * Slash Commands System
 *
 * Discovers and executes slash commands from:
 * - Built-in commands (.claude/commands/)
 * - User commands (~/.claude/commands/)
 * - Project commands (./.claude/commands/)
 * - Plugin commands
 */

import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, basename, extname, dirname } from 'path';
import { homedir } from 'os';
import matter from 'gray-matter';
import { COMMAND_CACHE_TTL } from '../constants.js';

/**
 * Command cache structure
 */
interface CommandCache {
  /** Discovered commands */
  commands: SlashCommand[];
  /** Cache creation timestamp */
  timestamp: number;
  /** Paths that were searched */
  paths: string[];
}

/** Cached commands with timestamp */
let commandCache: CommandCache | null = null;

/**
 * Clear the command cache
 * Call this when commands are modified externally
 */
export function clearCommandCache(): void {
  commandCache = null;
}

/**
 * Slash command definition
 */
export interface SlashCommand {
  /** Command name (without /) */
  name: string;
  /** Command description */
  description: string;
  /** Command source path */
  source: string;
  /** Source type */
  sourceType: 'builtin' | 'user' | 'project' | 'plugin';
  /** Raw markdown content */
  content: string;
  /** Frontmatter metadata */
  metadata: CommandMetadata;
}

/**
 * Command frontmatter metadata
 */
export interface CommandMetadata {
  /** Command description */
  description?: string;
  /** Hint for argument input */
  argumentHint?: string;
  /** Tools allowed for this command */
  allowedTools?: string[];
  /** Model override */
  model?: string;
  /** Disable model invocation (just expand template) */
  disableModelInvocation?: boolean;
}

/**
 * Parsed command invocation
 */
export interface ParsedCommand {
  /** Command name */
  command: string;
  /** Arguments passed to command */
  args: string;
  /** Individual arguments */
  argList: string[];
}

/**
 * Parse a slash command invocation
 *
 * @param input - User input string to parse
 * @returns ParsedCommand object or null if not a valid command
 *
 * @example
 * ```typescript
 * parseCommand('/plan Add user auth')
 * // Returns: { command: 'plan', args: 'Add user auth', argList: ['Add', 'user', 'auth'] }
 *
 * parseCommand('/commit')
 * // Returns: { command: 'commit', args: '', argList: [] }
 *
 * parseCommand('not a command')
 * // Returns: null
 * ```
 */
export function parseCommand(input: string): ParsedCommand | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith('/')) {
    return null;
  }

  // Extract command and args
  const match = trimmed.match(/^\/(\S+)(?:\s+(.*))?$/);
  if (!match) {
    return null;
  }

  const command = match[1];
  const args = match[2] || '';
  const argList = args.split(/\s+/).filter(Boolean);

  return { command, args, argList };
}

/**
 * Get the default command search paths
 */
export function getDefaultCommandPaths(): string[] {
  const paths: string[] = [];

  // Built-in commands (in the package)
  const packageDir = dirname(new URL(import.meta.url).pathname);
  // Handle Windows paths
  const normalizedPackageDir = packageDir.startsWith('/') && process.platform === 'win32'
    ? packageDir.slice(1)
    : packageDir;
  const builtinPath = join(normalizedPackageDir, '..', '..', '.claude', 'commands');
  if (existsSync(builtinPath)) {
    paths.push(builtinPath);
  }

  // User commands (~/.claude/commands/)
  const userPath = join(homedir(), '.claude', 'commands');
  if (existsSync(userPath)) {
    paths.push(userPath);
  }

  // Project commands (./.claude/commands/)
  const projectPath = join(process.cwd(), '.claude', 'commands');
  if (existsSync(projectPath)) {
    paths.push(projectPath);
  }

  return paths;
}

/**
 * Discover all commands in a directory
 */
export function discoverCommandsInDir(
  dirPath: string,
  sourceType: 'builtin' | 'user' | 'project' | 'plugin'
): SlashCommand[] {
  const commands: SlashCommand[] = [];

  if (!existsSync(dirPath)) {
    return commands;
  }

  try {
    const files = readdirSync(dirPath, { withFileTypes: true });

    for (const file of files) {
      if (file.isFile() && extname(file.name) === '.md') {
        const name = basename(file.name, '.md');
        const filePath = join(dirPath, file.name);
        const content = readFileSync(filePath, 'utf-8');

        // Parse frontmatter
        const { data, content: body } = matter(content);
        const metadata: CommandMetadata = {
          description: data.description,
          argumentHint: data['argument-hint'],
          allowedTools: data['allowed-tools'],
          model: data.model,
          disableModelInvocation: data['disable-model-invocation']
        };

        commands.push({
          name,
          description: metadata.description || `Run /${name} command`,
          source: filePath,
          sourceType,
          content: body.trim(),
          metadata
        });
      } else if (file.isDirectory()) {
        // Recursively discover commands in subdirectories
        // These are namespaced as "subdir/command"
        const subCommands = discoverCommandsInDir(
          join(dirPath, file.name),
          sourceType
        );

        for (const cmd of subCommands) {
          cmd.name = `${file.name}/${cmd.name}`;
          commands.push(cmd);
        }
      }
    }
  } catch (error) {
    console.warn(`Failed to discover commands in ${dirPath}:`, error);
  }

  return commands;
}

/**
 * Get the built-in commands path for this package
 */
function getBuiltinCommandsPath(): string | null {
  const packageDir = dirname(new URL(import.meta.url).pathname);
  // Handle Windows paths
  const normalizedPackageDir = packageDir.startsWith('/') && process.platform === 'win32'
    ? packageDir.slice(1)
    : packageDir;
  const builtinPath = join(normalizedPackageDir, '..', '..', '.claude', 'commands');
  return existsSync(builtinPath) ? builtinPath : null;
}

/**
 * Discover all available commands
 *
 * Searches built-in, user, and project directories for slash command definitions.
 * Results are cached for performance (30 second TTL).
 *
 * @param additionalPaths - Additional paths to search for commands
 * @returns Array of discovered slash commands
 *
 * @example
 * ```typescript
 * const commands = discoverAllCommands();
 * console.log(commands.map(c => c.name)); // ['plan', 'commit', 'review', ...]
 *
 * // With additional paths
 * const commands = discoverAllCommands(['/path/to/custom/commands']);
 * ```
 */
export function discoverAllCommands(additionalPaths: string[] = []): SlashCommand[] {
  // Check cache validity
  const cacheKey = additionalPaths.sort().join(':');
  if (commandCache &&
      commandCache.paths.join(':') === cacheKey &&
      Date.now() - commandCache.timestamp < COMMAND_CACHE_TTL) {
    return [...commandCache.commands];
  }

  const commands: SlashCommand[] = [];
  const seenNames = new Set<string>();

  // Get the builtin path for comparison
  const builtinPath = getBuiltinCommandsPath();
  const userPath = join(homedir(), '.claude', 'commands');

  // Get default paths
  const defaultPaths = getDefaultCommandPaths();

  // Process built-in first, then user, then project
  // Later commands override earlier ones with same name
  const allPaths = [...defaultPaths, ...additionalPaths];

  for (const path of allPaths) {
    // Determine source type based on path
    let sourceType: 'builtin' | 'user' | 'project' | 'plugin' = 'project';

    // Normalize paths for comparison
    const normalizedPath = path.replace(/\\/g, '/').toLowerCase();
    const normalizedBuiltin = builtinPath?.replace(/\\/g, '/').toLowerCase();
    const normalizedUser = userPath.replace(/\\/g, '/').toLowerCase();

    if (normalizedBuiltin && normalizedPath === normalizedBuiltin) {
      sourceType = 'builtin';
    } else if (normalizedPath.startsWith(normalizedUser)) {
      sourceType = 'user';
    }

    const pathCommands = discoverCommandsInDir(path, sourceType);

    for (const cmd of pathCommands) {
      // Remove existing command with same name (later paths override)
      if (seenNames.has(cmd.name)) {
        const idx = commands.findIndex(c => c.name === cmd.name);
        if (idx >= 0) {
          commands.splice(idx, 1);
        }
      }

      commands.push(cmd);
      seenNames.add(cmd.name);
    }
  }

  // Update cache
  commandCache = {
    commands: [...commands],
    timestamp: Date.now(),
    paths: additionalPaths.sort()
  };

  return commands;
}

/**
 * Get a specific command by name
 */
export function getCommand(name: string, commands?: SlashCommand[]): SlashCommand | null {
  const allCommands = commands || discoverAllCommands();
  return allCommands.find(cmd => cmd.name === name) || null;
}

/**
 * Expand a command template with arguments
 *
 * Supports:
 * - $ARGUMENTS - All arguments as a string
 * - $1, $2, etc. - Individual arguments
 * - @file.txt - Include file contents
 * - !command - Run bash command and include output
 */
export function expandCommandTemplate(
  template: string,
  args: string,
  argList: string[]
): string {
  let expanded = template;

  // Replace $ARGUMENTS with all arguments
  expanded = expanded.replace(/\$ARGUMENTS/g, args);

  // Replace $1, $2, etc. with individual arguments
  for (let i = 0; i < argList.length; i++) {
    const placeholder = new RegExp(`\\$${i + 1}`, 'g');
    expanded = expanded.replace(placeholder, argList[i]);
  }

  // Remove any remaining $N placeholders
  expanded = expanded.replace(/\$\d+/g, '');

  // TODO: Handle @file references
  // TODO: Handle !command execution

  return expanded.trim();
}

/**
 * Execute a slash command and return the expanded prompt
 *
 * This doesn't actually run the agent - it just prepares the prompt.
 * The caller should then send this to the agent.
 */
export function executeCommand(
  commandName: string,
  args: string,
  commands?: SlashCommand[]
): { prompt: string; metadata: CommandMetadata } | null {
  const command = getCommand(commandName, commands);

  if (!command) {
    return null;
  }

  const argList = args.split(/\s+/).filter(Boolean);
  const prompt = expandCommandTemplate(command.content, args, argList);

  return {
    prompt,
    metadata: command.metadata
  };
}

/**
 * Format commands for display
 */
export function formatCommandList(commands: SlashCommand[]): string {
  const lines: string[] = ['Available Commands:'];

  // Group by source type
  const groups: Record<string, SlashCommand[]> = {
    builtin: [],
    user: [],
    project: [],
    plugin: []
  };

  for (const cmd of commands) {
    groups[cmd.sourceType].push(cmd);
  }

  for (const [type, cmds] of Object.entries(groups)) {
    if (cmds.length > 0) {
      lines.push(`\n  ${type.charAt(0).toUpperCase() + type.slice(1)}:`);
      for (const cmd of cmds.sort((a, b) => a.name.localeCompare(b.name))) {
        const hint = cmd.metadata.argumentHint ? ` <${cmd.metadata.argumentHint}>` : '';
        lines.push(`    /${cmd.name}${hint} - ${cmd.description}`);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Built-in command definitions
 * These are the default commands shipped with the SDK
 */
export const BUILTIN_COMMANDS: Record<string, { description: string; content: string }> = {
  plan: {
    description: 'Create an implementation plan for a feature',
    content: `Create a detailed implementation plan for the following:

$ARGUMENTS

Think through:
1. What components/files need to be created or modified
2. What's the right order of implementation
3. What tests should be written
4. What potential issues might arise

Be thorough but concise.`
  },

  execute: {
    description: 'Execute a plan or task',
    content: `Execute the following task:

$ARGUMENTS

Follow the PIV methodology:
1. Plan your approach
2. Implement the changes
3. Validate the results
4. Iterate if needed`
  },

  validate: {
    description: 'Run validation checks',
    content: `Run validation for the current project:

1. Type checking (npm run typecheck or equivalent)
2. Linting
3. Tests
4. Build verification

Report any issues found and suggest fixes.`
  },

  review: {
    description: 'Review code changes',
    content: `Review the following code or changes:

$ARGUMENTS

Focus on:
1. Code quality and best practices
2. Potential bugs or issues
3. Performance considerations
4. Suggestions for improvement`
  },

  commit: {
    description: 'Create a git commit with conventional format',
    content: `Create a git commit for the current changes.

Follow conventional commit format:
- type(scope): description
- Types: feat, fix, docs, style, refactor, test, chore

Check git status, stage appropriate files, and create the commit.`
  },

  clear: {
    description: 'Clear conversation history',
    content: `[System: Clear the current conversation history and start fresh.]`
  },

  help: {
    description: 'Show available commands and help',
    content: `Show available slash commands and how to use them.

List all commands with their descriptions and argument hints.`
  }
};
