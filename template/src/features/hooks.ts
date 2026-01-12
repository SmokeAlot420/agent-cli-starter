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

import { spawnSync } from 'child_process';
import { HOOK_TIMEOUT } from '../constants.js';
import {
  type HookConfig,
  type HookEvent,
  loadSettings,
  getHooksForEvent as getSettingsHooksForEvent,
  areHooksDisabled
} from './settings.js';

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
export function parseMatcher(matcher?: string): HookMatcher | undefined {
  if (!matcher) return undefined;

  // Simple parsing: tool patterns separated by commas
  // More complex syntax could be added (path:*, command:*, etc.)
  const parts = matcher.split(',').map(s => s.trim()).filter(Boolean);

  if (parts.length === 0) return undefined;

  return {
    tools: parts
  };
}

/**
 * Check if a hook matches the current context
 */
export function hookMatches(hook: RuntimeHook, context: HookContext): boolean {
  const matcher = hook.parsedMatcher || parseMatcher(hook.matcher);

  if (!matcher) {
    // No matcher = matches everything
    return true;
  }

  // Check tool match
  if (matcher.tools && context.tool) {
    const toolMatches = matcher.tools.some(pattern =>
      matchesGlob(context.tool!, pattern)
    );
    if (!toolMatches) return false;
  }

  // Check path match
  if (matcher.paths && context.filePath) {
    const pathMatches = matcher.paths.some(pattern =>
      matchesGlob(context.filePath!, pattern)
    );
    if (!pathMatches) return false;
  }

  // Check command match (for Bash)
  if (matcher.commands && context.toolArgs?.command) {
    const cmd = context.toolArgs.command as string;
    const cmdMatches = matcher.commands.some(pattern =>
      matchesGlob(cmd, pattern)
    );
    if (!cmdMatches) return false;
  }

  return true;
}

/**
 * Simple glob matching
 */
function matchesGlob(value: string, pattern: string): boolean {
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '{{DOUBLESTAR}}')
    .replace(/\*/g, '[^/]*')
    .replace(/{{DOUBLESTAR}}/g, '.*')
    .replace(/\?/g, '.');

  try {
    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(value);
  } catch {
    return value === pattern;
  }
}

/**
 * Execute a bash command hook
 */
export function executeBashHook(
  command: string,
  context: HookContext,
  timeout: number = HOOK_TIMEOUT
): HookResult {
  // Set up environment variables for the hook
  const env = {
    ...process.env,
    CLAUDE_PROJECT_DIR: context.projectDir || process.cwd(),
    CLAUDE_SESSION_ID: context.sessionId || '',
    CLAUDE_TOOL: context.tool || '',
    CLAUDE_FILE_PATH: context.filePath || '',
    CLAUDE_EVENT: context.event,
    PIV_PROJECT_DIR: context.projectDir || process.cwd(),
    PIV_SESSION_ID: context.sessionId || '',
    PIV_TOOL: context.tool || '',
    PIV_FILE_PATH: context.filePath || '',
    PIV_EVENT: context.event
  };

  try {
    const result = spawnSync(command, {
      shell: true,
      env,
      timeout,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Exit code 0 = passed
    // Non-zero = blocked/failed
    const passed = result.status === 0;

    // Try to parse JSON output for structured results
    let output = result.stdout?.toString() || '';
    let metadata: Record<string, unknown> | undefined;

    try {
      const parsed = JSON.parse(output);
      if (typeof parsed === 'object' && parsed !== null) {
        metadata = parsed;
        output = parsed.message || parsed.output || output;
      }
    } catch {
      // Not JSON, use raw output
    }

    return {
      passed,
      output: output.trim(),
      error: result.stderr?.toString().trim() || undefined,
      blocked: !passed,
      metadata
    };
  } catch (error) {
    return {
      passed: false,
      error: error instanceof Error ? error.message : 'Hook execution failed',
      blocked: false // Don't block on hook errors by default
    };
  }
}

/**
 * Execute an AI prompt hook (stub for future implementation)
 */
export function executePromptHook(
  _prompt: string,
  _context: HookContext
): HookResult {
  // AI-based hooks would require calling the model
  // This is a placeholder for future implementation
  return {
    passed: true,
    output: 'Prompt hooks not yet implemented'
  };
}

/**
 * Execute a single hook
 */
export function executeHook(
  hook: RuntimeHook,
  context: HookContext
): HookResult {
  // Check if hook matches context
  if (!hookMatches(hook, context)) {
    return { passed: true };
  }

  // Execute based on hook type
  if (hook.command) {
    return executeBashHook(hook.command, context, hook.timeout);
  }

  if (hook.prompt) {
    return executePromptHook(hook.prompt, context);
  }

  // No executable action
  return { passed: true };
}

/**
 * Get all hooks for an event from various sources
 */
export function getHooksForEvent(
  event: HookEvent,
  additionalHooks: RuntimeHook[] = []
): RuntimeHook[] {
  // Check if hooks are disabled
  if (areHooksDisabled()) {
    return [];
  }

  const hooks: RuntimeHook[] = [];

  // Get hooks from settings
  const settingsHooks = getSettingsHooksForEvent(event);
  for (const hook of settingsHooks) {
    hooks.push({
      ...hook,
      source: 'settings',
      parsedMatcher: parseMatcher(hook.matcher)
    });
  }

  // Add additional hooks (from skills, plugins)
  for (const hook of additionalHooks) {
    if (hook.event === event) {
      hooks.push({
        ...hook,
        parsedMatcher: parseMatcher(hook.matcher)
      });
    }
  }

  return hooks;
}

/**
 * Run all hooks for an event
 *
 * @param event - The event type
 * @param context - Execution context
 * @param additionalHooks - Additional hooks from skills/plugins
 * @returns Combined result from all hooks
 */
export function runHooks(
  event: HookEvent,
  context: HookContext,
  additionalHooks: RuntimeHook[] = []
): HookResult {
  const hooks = getHooksForEvent(event, additionalHooks);

  if (hooks.length === 0) {
    return { passed: true };
  }

  const results: HookResult[] = [];
  let blocked = false;
  let modifiedContent: string | undefined;

  for (const hook of hooks) {
    const result = executeHook(hook, context);
    results.push(result);

    if (result.blocked) {
      blocked = true;
    }

    if (result.modifiedContent) {
      modifiedContent = result.modifiedContent;
    }
  }

  // Aggregate results
  const passed = results.every(r => r.passed);
  const outputs = results
    .map(r => r.output)
    .filter(Boolean)
    .join('\n');
  const errors = results
    .map(r => r.error)
    .filter(Boolean)
    .join('\n');

  return {
    passed,
    output: outputs || undefined,
    error: errors || undefined,
    blocked,
    modifiedContent
  };
}

/**
 * Run pre-tool hooks
 */
export function runPreToolHooks(
  tool: string,
  args: Record<string, unknown>,
  context: Partial<HookContext> = {},
  additionalHooks: RuntimeHook[] = []
): HookResult {
  return runHooks('PreToolUse', {
    event: 'PreToolUse',
    tool,
    toolArgs: args,
    ...context
  }, additionalHooks);
}

/**
 * Run post-tool hooks
 */
export function runPostToolHooks(
  tool: string,
  args: Record<string, unknown>,
  result: unknown,
  context: Partial<HookContext> = {},
  additionalHooks: RuntimeHook[] = []
): HookResult {
  return runHooks('PostToolUse', {
    event: 'PostToolUse',
    tool,
    toolArgs: args,
    toolResult: result,
    ...context
  }, additionalHooks);
}

/**
 * Run user prompt submit hooks
 */
export function runUserPromptSubmitHooks(
  prompt: string,
  context: Partial<HookContext> = {},
  additionalHooks: RuntimeHook[] = []
): HookResult {
  return runHooks('UserPromptSubmit', {
    event: 'UserPromptSubmit',
    userPrompt: prompt,
    ...context
  }, additionalHooks);
}

/**
 * Run session start hooks
 */
export function runSessionStartHooks(
  sessionId: string,
  context: Partial<HookContext> = {},
  additionalHooks: RuntimeHook[] = []
): HookResult {
  return runHooks('SessionStart', {
    event: 'SessionStart',
    sessionId,
    ...context
  }, additionalHooks);
}

/**
 * Run session end hooks
 */
export function runSessionEndHooks(
  sessionId: string,
  context: Partial<HookContext> = {},
  additionalHooks: RuntimeHook[] = []
): HookResult {
  return runHooks('SessionEnd', {
    event: 'SessionEnd',
    sessionId,
    ...context
  }, additionalHooks);
}

/**
 * Run stop hooks (when Claude finishes responding)
 */
export function runStopHooks(
  context: Partial<HookContext> = {},
  additionalHooks: RuntimeHook[] = []
): HookResult {
  return runHooks('Stop', {
    event: 'Stop',
    ...context
  }, additionalHooks);
}

/**
 * Format hooks for display
 */
export function formatHooksList(event?: HookEvent): string {
  const settings = loadSettings();
  const hooks = settings.hooks || [];

  if (hooks.length === 0) {
    return 'No hooks configured.\n\nConfigure hooks in .claude/settings.json or ~/.claude/settings.json';
  }

  const filtered = event ? hooks.filter(h => h.event === event) : hooks;

  if (filtered.length === 0) {
    return event
      ? `No hooks configured for event: ${event}`
      : 'No hooks configured.';
  }

  const lines: string[] = ['Configured Hooks:', ''];

  // Group by event
  const byEvent: Record<string, HookConfig[]> = {};
  for (const hook of filtered) {
    if (!byEvent[hook.event]) {
      byEvent[hook.event] = [];
    }
    byEvent[hook.event].push(hook);
  }

  for (const [eventName, eventHooks] of Object.entries(byEvent)) {
    lines.push(`  ${eventName}:`);
    for (const hook of eventHooks) {
      const matcher = hook.matcher ? ` [${hook.matcher}]` : '';
      const type = hook.command ? 'bash' : hook.prompt ? 'prompt' : 'unknown';
      lines.push(`    - ${type}${matcher}`);
      if (hook.command) {
        lines.push(`      command: ${hook.command.slice(0, 50)}${hook.command.length > 50 ? '...' : ''}`);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}
