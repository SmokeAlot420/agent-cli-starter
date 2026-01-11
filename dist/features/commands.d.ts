/**
 * Slash Commands System
 *
 * Discovers and executes slash commands from:
 * - Built-in commands (.claude/commands/)
 * - User commands (~/.claude/commands/)
 * - Project commands (./.claude/commands/)
 * - Plugin commands
 */
/**
 * Clear the command cache
 * Call this when commands are modified externally
 */
export declare function clearCommandCache(): void;
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
export declare function parseCommand(input: string): ParsedCommand | null;
/**
 * Get the default command search paths
 */
export declare function getDefaultCommandPaths(): string[];
/**
 * Discover all commands in a directory
 */
export declare function discoverCommandsInDir(dirPath: string, sourceType: 'builtin' | 'user' | 'project' | 'plugin'): SlashCommand[];
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
export declare function discoverAllCommands(additionalPaths?: string[]): SlashCommand[];
/**
 * Get a specific command by name
 */
export declare function getCommand(name: string, commands?: SlashCommand[]): SlashCommand | null;
/**
 * Expand a command template with arguments
 *
 * Supports:
 * - $ARGUMENTS - All arguments as a string
 * - $1, $2, etc. - Individual arguments
 * - @file.txt - Include file contents
 * - !command - Run bash command and include output
 */
export declare function expandCommandTemplate(template: string, args: string, argList: string[]): string;
/**
 * Execute a slash command and return the expanded prompt
 *
 * This doesn't actually run the agent - it just prepares the prompt.
 * The caller should then send this to the agent.
 */
export declare function executeCommand(commandName: string, args: string, commands?: SlashCommand[]): {
    prompt: string;
    metadata: CommandMetadata;
} | null;
/**
 * Format commands for display
 */
export declare function formatCommandList(commands: SlashCommand[]): string;
/**
 * Built-in command definitions
 * These are the default commands shipped with the SDK
 */
export declare const BUILTIN_COMMANDS: Record<string, {
    description: string;
    content: string;
}>;
//# sourceMappingURL=commands.d.ts.map