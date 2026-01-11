/**
 * Plugin System
 *
 * Manages plugin installation, loading, and lifecycle.
 * Supports:
 * - Local plugins (directory path)
 * - GitHub plugins (github:owner/repo or full URL)
 * - Plugin registry (optional)
 */
import { type McpServersConfig } from './mcp.js';
import { type SlashCommand } from './commands.js';
/**
 * Plugin manifest structure
 * Located at .claude-plugin/plugin.json in the plugin directory
 */
export interface PluginManifest {
    /** Plugin name (unique identifier) */
    name: string;
    /** Plugin version (semver) */
    version: string;
    /** Human-readable description */
    description: string;
    /** Plugin author */
    author?: string;
    /** Repository URL */
    repository?: string;
    /** Path to commands directory (relative to plugin root) */
    commands?: string;
    /** Path to MCP config file (relative to plugin root) */
    mcpServers?: string;
    /** Path to hooks directory (relative to plugin root) */
    hooks?: string;
    /** Minimum SDK version required */
    minSdkVersion?: string;
    /** Keywords for search/discovery */
    keywords?: string[];
}
/**
 * Loaded plugin with resolved paths and content
 */
export interface LoadedPlugin {
    /** Plugin manifest */
    manifest: PluginManifest;
    /** Installation path */
    path: string;
    /** Installation source (local path or GitHub URL) */
    source: string;
    /** Discovered slash commands */
    commands: SlashCommand[];
    /** MCP server configurations */
    mcpServers: McpServersConfig;
    /** Whether plugin is enabled */
    enabled: boolean;
}
/**
 * Plugin installation source types
 */
export type PluginSource = {
    type: 'local';
    path: string;
} | {
    type: 'github';
    owner: string;
    repo: string;
    ref?: string;
} | {
    type: 'registry';
    name: string;
};
/**
 * Plugin registry entry (for future registry support)
 */
export interface PluginRegistryEntry {
    name: string;
    description: string;
    author: string;
    repository: string;
    version: string;
    downloads?: number;
}
/**
 * Plugin installation result
 */
export interface PluginInstallResult {
    success: boolean;
    plugin?: LoadedPlugin;
    error?: string;
}
/**
 * Default plugins directory
 */
export declare const PLUGINS_DIR: string;
/**
 * Plugins registry file
 */
export declare const PLUGINS_REGISTRY_FILE: string;
/**
 * Parse a plugin source string into a PluginSource object
 *
 * Supports:
 * - "./path/to/plugin" or "/absolute/path" -> local
 * - "github:owner/repo" -> GitHub
 * - "github:owner/repo#ref" -> GitHub with ref
 * - "https://github.com/owner/repo" -> GitHub
 * - "plugin-name" -> registry (future)
 *
 * @param source - Plugin source string in any supported format
 * @returns Parsed PluginSource with type and relevant fields
 *
 * @example
 * ```typescript
 * parsePluginSource('./my-plugin')
 * // Returns: { type: 'local', path: './my-plugin' }
 *
 * parsePluginSource('github:anthropics/claude-plugins#v1.0.0')
 * // Returns: { type: 'github', owner: 'anthropics', repo: 'claude-plugins', ref: 'v1.0.0' }
 * ```
 */
export declare function parsePluginSource(source: string): PluginSource;
/**
 * Ensure plugins directory exists
 */
export declare function ensurePluginsDir(): Promise<void>;
/**
 * Load plugin manifest from a directory
 */
export declare function loadPluginManifest(pluginPath: string): Promise<PluginManifest | null>;
/**
 * Load a plugin from a directory
 */
export declare function loadPlugin(pluginPath: string, source: string): Promise<LoadedPlugin | null>;
/**
 * Get installed plugins registry
 */
export declare function getInstalledPlugins(): Promise<Record<string, {
    source: string;
    enabled: boolean;
}>>;
/**
 * Plugin Manager class
 */
export declare class PluginManager {
    private loadedPlugins;
    private initialized;
    constructor();
    /**
     * Initialize the plugin manager (async)
     */
    init(): Promise<void>;
    /**
     * Install a plugin from source
     *
     * Supports local paths and GitHub repositories.
     * For GitHub sources, clones the repo to ~/.claude/plugins/.
     *
     * @param source - Plugin source (local path, github:owner/repo, or full URL)
     * @returns Installation result with success status and loaded plugin or error
     *
     * @example
     * ```typescript
     * const manager = new PluginManager();
     * await manager.init();
     *
     * // Install from GitHub
     * const result = await manager.install('github:anthropics/claude-code-plugins');
     *
     * // Install local plugin
     * const result = await manager.install('./my-local-plugin');
     *
     * if (result.success) {
     *   console.log(`Installed: ${result.plugin.manifest.name}`);
     * }
     * ```
     */
    install(source: string): Promise<PluginInstallResult>;
    /**
     * Uninstall a plugin
     */
    uninstall(name: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Enable a plugin
     */
    enable(name: string): Promise<boolean>;
    /**
     * Disable a plugin
     */
    disable(name: string): Promise<boolean>;
    /**
     * List all installed plugins
     */
    list(): LoadedPlugin[];
    /**
     * Get a specific plugin
     */
    get(name: string): LoadedPlugin | undefined;
    /**
     * Load all installed plugins
     */
    loadAll(): Promise<void>;
    /**
     * Get all commands from enabled plugins
     */
    getAllCommands(): SlashCommand[];
    /**
     * Get all MCP servers from enabled plugins
     */
    getAllMcpServers(): McpServersConfig;
}
/**
 * Format plugin list for display
 */
export declare function formatPluginList(plugins: LoadedPlugin[]): string;
/**
 * List plugins from disk without loading them
 */
export declare function listInstalledPluginNames(): Promise<string[]>;
//# sourceMappingURL=plugins.d.ts.map