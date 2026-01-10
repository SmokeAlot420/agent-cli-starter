/**
 * Features Module
 *
 * Central export point for all PIV Loop CLI features.
 */

// Commands system
export * from './commands.js';

// Skills system
export * from './skills.js';

// Subagents system
export * from './subagents.js';

// Settings system - export with renames to avoid conflicts
export {
  clearSettingsCache,
  type PermissionRule,
  type PermissionRules,
  type HookConfig,
  type HookEvent,
  type SandboxConfig,
  type AttributionConfig,
  type StatusLineConfig,
  type FileSuggestionConfig,
  type PIVSettings,
  type SettingsPaths,
  type SettingsSource,
  getSettingsPaths,
  loadSettingsFile,
  saveSettingsFile,
  mergeSettings,
  loadSettings,
  getDefaultSettings,
  getSetting,
  updateSetting,
  formatSettings,
  checkPermission,
  getHooksForEvent as getSettingsHooksForEvent,
  areHooksDisabled
} from './settings.js';

// Hooks system
export * from './hooks.js';

// MCP integration
export * from './mcp.js';

// Plugins system
export * from './plugins.js';

// Models
export * from './models.js';

// Context management
export * from './context.js';
