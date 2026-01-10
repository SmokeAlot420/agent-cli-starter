/**
 * Settings System
 *
 * Hierarchical settings configuration with multiple scopes:
 * 1. Managed (managed-settings.json) - Organization-wide, highest precedence
 * 2. Command line args - Temporary overrides
 * 3. Local (.claude/settings.local.json) - Personal project overrides
 * 4. Project (.claude/settings.json) - Team shared settings
 * 5. User (~/.claude/settings.json) - Personal global settings
 *
 * Later scopes override earlier ones for the same key.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { SETTINGS_CACHE_TTL } from '../constants.js';

/**
 * Settings cache structure
 */
interface SettingsCache {
  /** Merged settings */
  settings: PIVSettings;
  /** Cache creation timestamp */
  timestamp: number;
  /** Working directory used */
  cwd: string;
}

/** Cached settings */
let settingsCache: SettingsCache | null = null;

/**
 * Clear the settings cache
 */
export function clearSettingsCache(): void {
  settingsCache = null;
}

/**
 * Permission rule types
 */
export type PermissionRule = 'allow' | 'ask' | 'deny';

/**
 * Permission rules configuration
 */
export interface PermissionRules {
  /** Bash command patterns */
  Bash?: Record<string, PermissionRule>;
  /** Read file patterns */
  Read?: Record<string, PermissionRule>;
  /** Write file patterns */
  Write?: Record<string, PermissionRule>;
  /** Edit file patterns */
  Edit?: Record<string, PermissionRule>;
  /** WebFetch domain patterns */
  WebFetch?: Record<string, PermissionRule>;
  /** Task/subagent patterns */
  Task?: Record<string, PermissionRule>;
  /** Glob patterns */
  Glob?: Record<string, PermissionRule>;
  /** Grep patterns */
  Grep?: Record<string, PermissionRule>;
  /** Catch-all rules */
  [tool: string]: Record<string, PermissionRule> | undefined;
}

/**
 * Hook configuration
 */
export interface HookConfig {
  /** Hook event type */
  event: HookEvent;
  /** Matcher for specific tools/operations */
  matcher?: string;
  /** Bash command to execute */
  command?: string;
  /** AI prompt for hook */
  prompt?: string;
  /** Timeout in milliseconds */
  timeout?: number;
}

/**
 * Hook event types
 */
export type HookEvent =
  | 'PreToolUse'
  | 'PostToolUse'
  | 'PermissionRequest'
  | 'UserPromptSubmit'
  | 'Notification'
  | 'Stop'
  | 'SubagentStop'
  | 'PreCompact'
  | 'SessionStart'
  | 'SessionEnd';

/**
 * Sandbox configuration
 */
export interface SandboxConfig {
  /** Enable bash sandboxing */
  enabled?: boolean;
  /** Auto-approve sandboxed commands */
  autoAllowBashIfSandboxed?: boolean;
  /** Commands to exclude from sandbox */
  excludedCommands?: string[];
  /** Network configuration */
  network?: {
    /** Allow localhost binding */
    allowLocalBinding?: boolean;
    /** Allowed Unix socket paths */
    allowUnixSockets?: string[];
  };
}

/**
 * Attribution configuration for git
 */
export interface AttributionConfig {
  /** Git commit author name */
  authorName?: string;
  /** Git commit author email */
  authorEmail?: string;
  /** Include co-author line */
  includeCoAuthor?: boolean;
}

/**
 * Status line configuration
 */
export interface StatusLineConfig {
  /** Enable custom status line */
  enabled?: boolean;
  /** Command to run for status */
  command?: string;
  /** Refresh interval in ms */
  refreshInterval?: number;
}

/**
 * File suggestion configuration
 */
export interface FileSuggestionConfig {
  /** Custom command for @ autocomplete */
  command?: string;
  /** Respect .gitignore */
  respectGitignore?: boolean;
  /** Maximum suggestions */
  maxSuggestions?: number;
}

/**
 * PIV Loop settings structure
 */
export interface PIVSettings {
  /** Default AI model */
  model?: string;
  /** Permission rules */
  permissions?: PermissionRules;
  /** Environment variables */
  env?: Record<string, string>;
  /** Hook configurations */
  hooks?: HookConfig[];
  /** Output style */
  outputStyle?: string;
  /** Force login method */
  forceLoginMethod?: 'claudeai' | 'console';
  /** Git attribution */
  attributions?: AttributionConfig;
  /** Sandbox settings */
  sandbox?: SandboxConfig;
  /** Status line */
  statusLine?: StatusLineConfig;
  /** File suggestion */
  fileSuggestion?: FileSuggestionConfig;
  /** Preferred response language */
  language?: string;
  /** Enable extended thinking by default */
  alwaysThinkingEnabled?: boolean;
  /** Auto-delete sessions after N days */
  cleanupPeriodDays?: number;
  /** Company announcements */
  companyAnnouncements?: string[];
  /** Enabled plugins */
  enabledPlugins?: string[];
  /** Extra marketplace sources */
  extraKnownMarketplaces?: string[];
  /** Disable all hooks */
  disableAllHooks?: boolean;
  /** Custom settings */
  [key: string]: unknown;
}

/**
 * Settings file paths
 */
export interface SettingsPaths {
  /** Managed settings (organization) */
  managed: string;
  /** User settings (personal global) */
  user: string;
  /** Project settings (team shared) */
  project: string;
  /** Local settings (personal project) */
  local: string;
}

/**
 * Settings source tracking
 */
export interface SettingsSource {
  /** Key name */
  key: string;
  /** Source file */
  source: 'managed' | 'commandLine' | 'local' | 'project' | 'user' | 'default';
  /** Value */
  value: unknown;
}

/**
 * Get settings file paths for a working directory
 */
export function getSettingsPaths(cwd: string = process.cwd()): SettingsPaths {
  return {
    managed: join(cwd, 'managed-settings.json'),
    user: join(homedir(), '.claude', 'settings.json'),
    project: join(cwd, '.claude', 'settings.json'),
    local: join(cwd, '.claude', 'settings.local.json')
  };
}

/**
 * Load settings from a file
 */
export function loadSettingsFile(filePath: string): PIVSettings | null {
  if (!existsSync(filePath)) {
    return null;
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as PIVSettings;
  } catch (error) {
    console.warn(`Failed to load settings from ${filePath}:`, error);
    return null;
  }
}

/**
 * Save settings to a file
 */
export function saveSettingsFile(filePath: string, settings: PIVSettings): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(filePath, JSON.stringify(settings, null, 2));
}

/**
 * Deep merge settings objects
 * Later objects override earlier ones
 */
export function mergeSettings(...sources: (PIVSettings | null)[]): PIVSettings {
  const result: PIVSettings = {};

  for (const source of sources) {
    if (!source) continue;

    for (const [key, value] of Object.entries(source)) {
      if (value === undefined) continue;

      // Deep merge objects (except arrays)
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        typeof result[key] === 'object' &&
        result[key] !== null &&
        !Array.isArray(result[key])
      ) {
        result[key] = { ...(result[key] as object), ...value };
      } else {
        result[key] = value;
      }
    }
  }

  return result;
}

/**
 * Load all settings with hierarchy
 *
 * Order (later overrides earlier):
 * 1. User (~/.claude/settings.json)
 * 2. Project (.claude/settings.json)
 * 3. Local (.claude/settings.local.json)
 * 4. Managed (managed-settings.json) - Highest precedence
 *
 * @param cwd - Working directory
 * @param commandLineOverrides - Command line argument overrides
 * @returns Merged settings
 */
export function loadSettings(
  cwd: string = process.cwd(),
  commandLineOverrides: PIVSettings = {}
): PIVSettings {
  // Check cache
  if (settingsCache &&
      settingsCache.cwd === cwd &&
      Date.now() - settingsCache.timestamp < SETTINGS_CACHE_TTL) {
    // Apply command line overrides to cached settings
    return mergeSettings(settingsCache.settings, commandLineOverrides);
  }

  const paths = getSettingsPaths(cwd);

  // Load in order of precedence (lowest to highest)
  const userSettings = loadSettingsFile(paths.user);
  const projectSettings = loadSettingsFile(paths.project);
  const localSettings = loadSettingsFile(paths.local);
  const managedSettings = loadSettingsFile(paths.managed);

  // Merge settings
  const merged = mergeSettings(
    getDefaultSettings(),
    userSettings,
    projectSettings,
    localSettings,
    managedSettings
  );

  // Update cache (without command line overrides)
  settingsCache = {
    settings: merged,
    timestamp: Date.now(),
    cwd
  };

  // Apply command line overrides
  return mergeSettings(merged, commandLineOverrides);
}

/**
 * Get default settings
 */
export function getDefaultSettings(): PIVSettings {
  return {
    model: 'claude-opus-4-5-20251101',
    alwaysThinkingEnabled: false,
    cleanupPeriodDays: 30,
    sandbox: {
      enabled: false,
      autoAllowBashIfSandboxed: false
    },
    attributions: {
      includeCoAuthor: true,
      authorName: 'Claude',
      authorEmail: 'noreply@anthropic.com'
    }
  };
}

/**
 * Get a specific setting value
 */
export function getSetting<K extends keyof PIVSettings>(
  key: K,
  settings?: PIVSettings
): PIVSettings[K] | undefined {
  const allSettings = settings || loadSettings();
  return allSettings[key];
}

/**
 * Update a setting in a specific scope
 */
export function updateSetting(
  key: keyof PIVSettings,
  value: unknown,
  scope: 'user' | 'project' | 'local' = 'user',
  cwd: string = process.cwd()
): void {
  const paths = getSettingsPaths(cwd);
  const filePath = paths[scope];

  const current = loadSettingsFile(filePath) || {};
  current[key] = value;

  saveSettingsFile(filePath, current);
  clearSettingsCache();
}

/**
 * Format settings for display
 */
export function formatSettings(settings: PIVSettings): string {
  const lines: string[] = ['Current Settings:', ''];

  const displayKeys: (keyof PIVSettings)[] = [
    'model',
    'alwaysThinkingEnabled',
    'language',
    'cleanupPeriodDays'
  ];

  for (const key of displayKeys) {
    if (settings[key] !== undefined) {
      lines.push(`  ${key}: ${JSON.stringify(settings[key])}`);
    }
  }

  if (settings.permissions) {
    lines.push('');
    lines.push('  Permissions:');
    for (const [tool, rules] of Object.entries(settings.permissions)) {
      if (rules && Object.keys(rules).length > 0) {
        lines.push(`    ${tool}:`);
        for (const [pattern, rule] of Object.entries(rules)) {
          lines.push(`      ${pattern}: ${rule}`);
        }
      }
    }
  }

  if (settings.hooks && settings.hooks.length > 0) {
    lines.push('');
    lines.push(`  Hooks: ${settings.hooks.length} configured`);
  }

  return lines.join('\n');
}

/**
 * Check if a permission is allowed for a tool/pattern
 */
export function checkPermission(
  tool: string,
  pattern: string,
  settings?: PIVSettings
): PermissionRule {
  const allSettings = settings || loadSettings();
  const permissions = allSettings.permissions;

  if (!permissions) return 'ask';

  const toolRules = permissions[tool];
  if (!toolRules) return 'ask';

  // Check for exact match first
  if (toolRules[pattern]) {
    return toolRules[pattern];
  }

  // Check for wildcard matches
  for (const [rulePattern, rule] of Object.entries(toolRules)) {
    if (matchesPattern(pattern, rulePattern)) {
      return rule;
    }
  }

  // Default to ask
  return 'ask';
}

/**
 * Match a value against a glob-like pattern
 */
function matchesPattern(value: string, pattern: string): boolean {
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape special chars
    .replace(/\*/g, '.*') // * -> .*
    .replace(/\?/g, '.'); // ? -> .

  try {
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(value);
  } catch {
    return false;
  }
}

/**
 * Get hooks for a specific event
 */
export function getHooksForEvent(
  event: HookEvent,
  settings?: PIVSettings
): HookConfig[] {
  const allSettings = settings || loadSettings();

  if (allSettings.disableAllHooks) {
    return [];
  }

  if (!allSettings.hooks) {
    return [];
  }

  return allSettings.hooks.filter(h => h.event === event);
}

/**
 * Check if hooks are disabled
 */
export function areHooksDisabled(settings?: PIVSettings): boolean {
  const allSettings = settings || loadSettings();
  return !!allSettings.disableAllHooks;
}
