/**
 * Hooks System
 *
 * Hooks allow running custom code before/after tool executions and other events.
 * They can be used for:
 * - Running formatters/linters after file edits
 * - Blocking modifications to sensitive files
 * - Custom notifications
 * - Audit logging
 *
 * Hooks are configured in settings files or skill frontmatter.
 */
import { type HookConfig, type HookEvent } from './settings.js';
/**
 * Hook execution result
 */
export interface HookResult {
    /** Whether the hook passed */
    passed: boolean;
    /** Output from the hook */
    output?: string;
    /** Error message if failed */
    error?: string;
    /** Whether to block the operation */
    blocked?: boolean;
    /** Modified content (for decorating hooks) */
    modifiedContent?: string;
    /** Additional metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Hook execution context
 */
export interface HookContext {
    /** The event that triggered the hook */
    event: HookEvent;
    /** Tool name (for tool-related events) */
    tool?: string;
    /** Tool arguments */
    toolArgs?: Record<string, unknown>;
    /** Tool result (for PostToolUse) */
    toolResult?: unknown;
    /** File path (for file operations) */
    filePath?: string;
    /** File content */
    content?: string;
    /** Session ID */
    sessionId?: string;
    /** Project directory */
    projectDir?: string;
    /** User prompt (for UserPromptSubmit) */
    userPrompt?: string;
    /** Notification message (for Notification) */
    notificationMessage?: string;
}
/**
 * Hook matcher for filtering which hooks apply
 */
export interface HookMatcher {
    /** Tool name patterns (glob-like) */
    tools?: string[];
    /** File path patterns (glob-like) */
    paths?: string[];
    /** Command patterns (for Bash hooks) */
    commands?: string[];
}
/**
 * Extended hook configuration with runtime info
 */
export interface RuntimeHook extends HookConfig {
    /** Source of the hook */
    source: 'settings' | 'skill' | 'plugin';
    /** Source name (skill name, plugin name) */
    sourceName?: string;
    /** Parsed matcher */
    parsedMatcher?: HookMatcher;
}
/**
 * Parse a matcher string into a HookMatcher
 */
export declare function parseMatcher(matcher?: string): HookMatcher | undefined;
/**
 * Check if a hook matches the current context
 */
export declare function hookMatches(hook: RuntimeHook, context: HookContext): boolean;
/**
 * Execute a bash command hook
 */
export declare function executeBashHook(command: string, context: HookContext, timeout?: number): HookResult;
/**
 * Execute an AI prompt hook (stub for future implementation)
 */
export declare function executePromptHook(_prompt: string, _context: HookContext): HookResult;
/**
 * Execute a single hook
 */
export declare function executeHook(hook: RuntimeHook, context: HookContext): HookResult;
/**
 * Get all hooks for an event from various sources
 */
export declare function getHooksForEvent(event: HookEvent, additionalHooks?: RuntimeHook[]): RuntimeHook[];
/**
 * Run all hooks for an event
 *
 * @param event - The event type
 * @param context - Execution context
 * @param additionalHooks - Additional hooks from skills/plugins
 * @returns Combined result from all hooks
 */
export declare function runHooks(event: HookEvent, context: HookContext, additionalHooks?: RuntimeHook[]): HookResult;
/**
 * Run pre-tool hooks
 */
export declare function runPreToolHooks(tool: string, args: Record<string, unknown>, context?: Partial<HookContext>, additionalHooks?: RuntimeHook[]): HookResult;
/**
 * Run post-tool hooks
 */
export declare function runPostToolHooks(tool: string, args: Record<string, unknown>, result: unknown, context?: Partial<HookContext>, additionalHooks?: RuntimeHook[]): HookResult;
/**
 * Run user prompt submit hooks
 */
export declare function runUserPromptSubmitHooks(prompt: string, context?: Partial<HookContext>, additionalHooks?: RuntimeHook[]): HookResult;
/**
 * Run session start hooks
 */
export declare function runSessionStartHooks(sessionId: string, context?: Partial<HookContext>, additionalHooks?: RuntimeHook[]): HookResult;
/**
 * Run session end hooks
 */
export declare function runSessionEndHooks(sessionId: string, context?: Partial<HookContext>, additionalHooks?: RuntimeHook[]): HookResult;
/**
 * Run stop hooks (when Claude finishes responding)
 */
export declare function runStopHooks(context?: Partial<HookContext>, additionalHooks?: RuntimeHook[]): HookResult;
/**
 * Format hooks for display
 */
export declare function formatHooksList(event?: HookEvent): string;
//# sourceMappingURL=hooks.d.ts.map