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
/**
 * Clear the settings cache
 */
export declare function clearSettingsCache(): void;
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
export type HookEvent = 'PreToolUse' | 'PostToolUse' | 'PermissionRequest' | 'UserPromptSubmit' | 'Notification' | 'Stop' | 'SubagentStop' | 'PreCompact' | 'SessionStart' | 'SessionEnd';
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
export declare function getSettingsPaths(cwd?: string): SettingsPaths;
/**
 * Load settings from a file
 */
export declare function loadSettingsFile(filePath: string): PIVSettings | null;
/**
 * Save settings to a file
 */
export declare function saveSettingsFile(filePath: string, settings: PIVSettings): void;
/**
 * Deep merge settings objects
 * Later objects override earlier ones
 */
export declare function mergeSettings(...sources: (PIVSettings | null)[]): PIVSettings;
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
export declare function loadSettings(cwd?: string, commandLineOverrides?: PIVSettings): PIVSettings;
/**
 * Get default settings
 */
export declare function getDefaultSettings(): PIVSettings;
/**
 * Get a specific setting value
 */
export declare function getSetting<K extends keyof PIVSettings>(key: K, settings?: PIVSettings): PIVSettings[K] | undefined;
/**
 * Update a setting in a specific scope
 */
export declare function updateSetting(key: keyof PIVSettings, value: unknown, scope?: 'user' | 'project' | 'local', cwd?: string): void;
/**
 * Format settings for display
 */
export declare function formatSettings(settings: PIVSettings): string;
/**
 * Check if a permission is allowed for a tool/pattern
 */
export declare function checkPermission(tool: string, pattern: string, settings?: PIVSettings): PermissionRule;
/**
 * Get hooks for a specific event
 */
export declare function getHooksForEvent(event: HookEvent, settings?: PIVSettings): HookConfig[];
/**
 * Check if hooks are disabled
 */
export declare function areHooksDisabled(settings?: PIVSettings): boolean;
//# sourceMappingURL=settings.d.ts.map