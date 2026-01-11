/**
 * Subagents System
 *
 * Subagents are specialized AI assistants with their own context windows.
 * They can be configured with custom system prompts and tool access.
 *
 * Subagents can be stored in:
 * - ~/.claude/agents/ (personal/user subagents)
 * - .claude/agents/ (project subagents)
 * - Plugin subagents (via plugin.json)
 *
 * Subagent files are markdown with YAML frontmatter.
 */
/**
 * Clear the subagent cache
 */
export declare function clearSubagentCache(): void;
/**
 * Permission modes for subagents
 */
export type SubagentPermissionMode = 'default' | 'acceptEdits' | 'dontAsk' | 'bypassPermissions' | 'plan' | 'ignore';
/**
 * Model options for subagents
 */
export type SubagentModel = 'sonnet' | 'opus' | 'haiku' | 'inherit' | string;
/**
 * Subagent definition
 */
export interface Subagent {
    /** Unique identifier (lowercase, hyphens) */
    name: string;
    /** Description of when Claude should use this agent */
    description: string;
    /** Source file path */
    source: string;
    /** Source type */
    sourceType: 'builtin' | 'user' | 'project' | 'plugin';
    /** System prompt content */
    systemPrompt: string;
    /** Frontmatter metadata */
    metadata: SubagentMetadata;
}
/**
 * Subagent frontmatter metadata
 */
export interface SubagentMetadata {
    /** Subagent name */
    name?: string;
    /** Description for auto-triggering */
    description?: string;
    /** Allowed tools (comma-separated or array) */
    tools?: string[];
    /** Model alias or 'inherit' */
    model?: SubagentModel;
    /** Permission mode */
    permissionMode?: SubagentPermissionMode;
    /** Skills to auto-load (comma-separated or array) */
    skills?: string[];
    /** Maximum turns for this agent */
    maxTurns?: number;
    /** Custom metadata */
    [key: string]: unknown;
}
/**
 * Built-in subagent definitions
 */
export declare const BUILTIN_SUBAGENTS: Record<string, Omit<Subagent, 'source' | 'sourceType'>>;
/**
 * Get default subagent search paths
 */
export declare function getDefaultSubagentPaths(): string[];
/**
 * Discover subagents in a directory
 */
export declare function discoverSubagentsInDir(dirPath: string, sourceType: 'user' | 'project' | 'plugin'): Subagent[];
/**
 * Discover all available subagents
 *
 * Includes built-in subagents plus user and project definitions.
 *
 * @param additionalPaths - Additional paths to search
 * @returns Array of discovered subagents
 */
export declare function discoverAllSubagents(additionalPaths?: string[]): Subagent[];
/**
 * Get a specific subagent by name
 */
export declare function getSubagent(name: string, subagents?: Subagent[]): Subagent | null;
/**
 * Format subagents for display
 */
export declare function formatSubagentList(subagents: Subagent[]): string;
/**
 * Build subagent context for main agent system prompt
 */
export declare function buildSubagentContext(subagents: Subagent[]): string;
/**
 * Resolve model alias to actual model name
 */
export declare function resolveSubagentModel(model: SubagentModel | undefined, defaultModel: string): string;
//# sourceMappingURL=subagents.d.ts.map