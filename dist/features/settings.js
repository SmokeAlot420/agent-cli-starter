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
/** Cached settings */
let settingsCache = null;
/**
 * Clear the settings cache
 */
export function clearSettingsCache() {
    settingsCache = null;
}
/**
 * Get settings file paths for a working directory
 */
export function getSettingsPaths(cwd = process.cwd()) {
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
export function loadSettingsFile(filePath) {
    if (!existsSync(filePath)) {
        return null;
    }
    try {
        const content = readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
    }
    catch (error) {
        console.warn(`Failed to load settings from ${filePath}:`, error);
        return null;
    }
}
/**
 * Save settings to a file
 */
export function saveSettingsFile(filePath, settings) {
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
export function mergeSettings(...sources) {
    const result = {};
    for (const source of sources) {
        if (!source)
            continue;
        for (const [key, value] of Object.entries(source)) {
            if (value === undefined)
                continue;
            // Deep merge objects (except arrays)
            if (typeof value === 'object' &&
                value !== null &&
                !Array.isArray(value) &&
                typeof result[key] === 'object' &&
                result[key] !== null &&
                !Array.isArray(result[key])) {
                result[key] = { ...result[key], ...value };
            }
            else {
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
export function loadSettings(cwd = process.cwd(), commandLineOverrides = {}) {
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
    const merged = mergeSettings(getDefaultSettings(), userSettings, projectSettings, localSettings, managedSettings);
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
export function getDefaultSettings() {
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
export function getSetting(key, settings) {
    const allSettings = settings || loadSettings();
    return allSettings[key];
}
/**
 * Update a setting in a specific scope
 */
export function updateSetting(key, value, scope = 'user', cwd = process.cwd()) {
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
export function formatSettings(settings) {
    const lines = ['Current Settings:', ''];
    const displayKeys = [
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
export function checkPermission(tool, pattern, settings) {
    const allSettings = settings || loadSettings();
    const permissions = allSettings.permissions;
    if (!permissions)
        return 'ask';
    const toolRules = permissions[tool];
    if (!toolRules)
        return 'ask';
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
function matchesPattern(value, pattern) {
    // Convert glob pattern to regex
    const regexPattern = pattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape special chars
        .replace(/\*/g, '.*') // * -> .*
        .replace(/\?/g, '.'); // ? -> .
    try {
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(value);
    }
    catch {
        return false;
    }
}
/**
 * Get hooks for a specific event
 */
export function getHooksForEvent(event, settings) {
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
export function areHooksDisabled(settings) {
    const allSettings = settings || loadSettings();
    return !!allSettings.disableAllHooks;
}
//# sourceMappingURL=settings.js.map