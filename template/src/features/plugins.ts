/**
 * Plugin System
 *
 * Manages plugin installation, loading, and lifecycle.
 * Supports:
 * - Local plugins (directory path)
 * - GitHub plugins (github:owner/repo or full URL)
 * - Plugin registry (optional)
 */

import { existsSync } from 'fs';
import { mkdir, readFile, writeFile, rm, readdir } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import { spawnSync } from 'child_process';
import { loadMcpConfig, type McpServersConfig } from './mcp.js';
import { discoverCommandsInDir, type SlashCommand } from './commands.js';
import { GIT_CLONE_TIMEOUT } from '../constants.js';
import { logWarning } from '../utils/errors.js';

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
export type PluginSource =
  | { type: 'local'; path: string }
  | { type: 'github'; owner: string; repo: string; ref?: string }
  | { type: 'registry'; name: string };

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
export const PLUGINS_DIR = join(homedir(), '.claude', 'plugins');

/**
 * Plugins registry file
 */
export const PLUGINS_REGISTRY_FILE = join(homedir(), '.claude', 'plugins.json');

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
export function parsePluginSource(source: string): PluginSource {
  // Local path
  if (source.startsWith('./') || source.startsWith('/') || source.startsWith('\\') || /^[a-zA-Z]:/.test(source)) {
    return { type: 'local', path: source };
  }

  // GitHub shorthand: github:owner/repo or github:owner/repo#ref
  if (source.startsWith('github:')) {
    const rest = source.slice(7);
    const [ownerRepo, ref] = rest.split('#');
    const [owner, repo] = ownerRepo.split('/');
    return { type: 'github', owner, repo, ref };
  }

  // GitHub URL
  const githubMatch = source.match(/github\.com\/([^/]+)\/([^/#]+)(?:#(.+))?/);
  if (githubMatch) {
    return {
      type: 'github',
      owner: githubMatch[1],
      repo: githubMatch[2].replace(/\.git$/, ''),
      ref: githubMatch[3]
    };
  }

  // Registry (future)
  return { type: 'registry', name: source };
}

/**
 * Validate GitHub source to prevent command injection
 *
 * Security: Ensures owner, repo, and ref only contain safe characters
 * (alphanumeric, underscore, hyphen, period) to prevent shell injection
 * when these values are passed to git commands.
 *
 * @param source - GitHub source with owner, repo, and optional ref
 * @throws {Error} If owner, repo, or ref contains invalid characters
 */
function validateGitHubSource(source: { owner: string; repo: string; ref?: string }): void {
  const validName = /^[a-zA-Z0-9_.-]+$/;

  if (!validName.test(source.owner)) {
    throw new Error(`Invalid GitHub owner: ${source.owner}`);
  }
  if (!validName.test(source.repo)) {
    throw new Error(`Invalid GitHub repo: ${source.repo}`);
  }
  if (source.ref && !validName.test(source.ref)) {
    throw new Error(`Invalid Git ref: ${source.ref}`);
  }
}

/**
 * Ensure plugins directory exists
 */
export async function ensurePluginsDir(): Promise<void> {
  if (!existsSync(PLUGINS_DIR)) {
    await mkdir(PLUGINS_DIR, { recursive: true });
  }
}

/**
 * Load plugin manifest from a directory
 */
export async function loadPluginManifest(pluginPath: string): Promise<PluginManifest | null> {
  const manifestPath = join(pluginPath, '.claude-plugin', 'plugin.json');

  if (!existsSync(manifestPath)) {
    return null;
  }

  try {
    const content = await readFile(manifestPath, 'utf-8');
    return JSON.parse(content) as PluginManifest;
  } catch {
    logWarning('plugins:loadManifest', `Failed to parse manifest at ${manifestPath}`);
    return null;
  }
}

/**
 * Load a plugin from a directory
 */
export async function loadPlugin(pluginPath: string, source: string): Promise<LoadedPlugin | null> {
  const manifest = await loadPluginManifest(pluginPath);

  if (!manifest) {
    return null;
  }

  // Load commands if specified
  let commands: SlashCommand[] = [];
  if (manifest.commands) {
    const commandsPath = join(pluginPath, manifest.commands);
    if (existsSync(commandsPath)) {
      commands = discoverCommandsInDir(commandsPath, 'plugin');
    }
  }

  // Load MCP servers if specified
  let mcpServers: McpServersConfig = {};
  if (manifest.mcpServers) {
    const mcpPath = join(pluginPath, manifest.mcpServers);
    if (existsSync(mcpPath)) {
      const loaded = loadMcpConfig(mcpPath);
      if (loaded) {
        mcpServers = loaded;
      }
    }
  }

  return {
    manifest,
    path: pluginPath,
    source,
    commands,
    mcpServers,
    enabled: true
  };
}

/**
 * Get installed plugins registry
 */
export async function getInstalledPlugins(): Promise<Record<string, { source: string; enabled: boolean }>> {
  if (!existsSync(PLUGINS_REGISTRY_FILE)) {
    return {};
  }

  try {
    const content = await readFile(PLUGINS_REGISTRY_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    logWarning('plugins:registry', `Failed to load plugins registry: ${error instanceof Error ? error.message : error}`);
    return {};
  }
}

/**
 * Save installed plugins registry
 */
async function saveInstalledPlugins(plugins: Record<string, { source: string; enabled: boolean }>): Promise<void> {
  await ensurePluginsDir();
  await writeFile(PLUGINS_REGISTRY_FILE, JSON.stringify(plugins, null, 2));
}

/**
 * Plugin Manager class
 */
export class PluginManager {
  private loadedPlugins: Map<string, LoadedPlugin> = new Map();
  private initialized: boolean = false;

  constructor() {
    // Constructor can't be async, call init() for async initialization
  }

  /**
   * Initialize the plugin manager (async)
   */
  async init(): Promise<void> {
    if (this.initialized) return;
    await ensurePluginsDir();
    this.initialized = true;
  }

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
  async install(source: string): Promise<PluginInstallResult> {
    await this.init();
    const parsed = parsePluginSource(source);

    try {
      let pluginPath: string;
      let pluginName: string;

      switch (parsed.type) {
        case 'local': {
          // For local plugins, use the path directly
          if (!existsSync(parsed.path)) {
            return { success: false, error: `Path not found: ${parsed.path}` };
          }

          const manifest = await loadPluginManifest(parsed.path);
          if (!manifest) {
            return { success: false, error: 'No plugin manifest found (.claude-plugin/plugin.json)' };
          }

          pluginPath = parsed.path;
          pluginName = manifest.name;
          break;
        }

        case 'github': {
          // Validate input to prevent command injection
          validateGitHubSource(parsed);

          // Clone from GitHub
          pluginName = parsed.repo;
          pluginPath = join(PLUGINS_DIR, pluginName);

          // Remove existing if present
          if (existsSync(pluginPath)) {
            await rm(pluginPath, { recursive: true, force: true });
          }

          const repoUrl = `https://github.com/${parsed.owner}/${parsed.repo}.git`;

          // Use spawnSync with array args to prevent injection
          const args = ['clone', '--depth', '1'];
          if (parsed.ref) {
            args.push('--branch', parsed.ref);
          }
          args.push(repoUrl, pluginPath);

          const result = spawnSync('git', args, {
            stdio: 'pipe',
            timeout: GIT_CLONE_TIMEOUT
          });

          if (result.status !== 0) {
            const stderr = result.stderr?.toString() || 'Unknown error';
            throw new Error(`Git clone failed: ${stderr}`);
          }

          const manifest = await loadPluginManifest(pluginPath);
          if (!manifest) {
            await rm(pluginPath, { recursive: true, force: true });
            return { success: false, error: 'No plugin manifest found in repository' };
          }

          pluginName = manifest.name;
          break;
        }

        case 'registry': {
          // Registry support (future)
          return { success: false, error: 'Plugin registry not yet implemented' };
        }
      }

      // Load the plugin
      const plugin = await loadPlugin(pluginPath, source);
      if (!plugin) {
        return { success: false, error: 'Failed to load plugin after installation' };
      }

      // Register in plugins list
      const installed = await getInstalledPlugins();
      installed[pluginName] = { source, enabled: true };
      await saveInstalledPlugins(installed);

      // Add to loaded plugins
      this.loadedPlugins.set(pluginName, plugin);

      return { success: true, plugin };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Uninstall a plugin
   */
  async uninstall(name: string): Promise<{ success: boolean; error?: string }> {
    const installed = await getInstalledPlugins();

    if (!installed[name]) {
      return { success: false, error: `Plugin not installed: ${name}` };
    }

    try {
      // Remove from disk if in plugins directory
      const pluginPath = join(PLUGINS_DIR, name);
      if (existsSync(pluginPath)) {
        await rm(pluginPath, { recursive: true, force: true });
      }

      // Remove from registry
      delete installed[name];
      await saveInstalledPlugins(installed);

      // Remove from loaded
      this.loadedPlugins.delete(name);

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Enable a plugin
   */
  async enable(name: string): Promise<boolean> {
    const installed = await getInstalledPlugins();
    if (!installed[name]) return false;

    installed[name].enabled = true;
    await saveInstalledPlugins(installed);

    const plugin = this.loadedPlugins.get(name);
    if (plugin) {
      plugin.enabled = true;
    }

    return true;
  }

  /**
   * Disable a plugin
   */
  async disable(name: string): Promise<boolean> {
    const installed = await getInstalledPlugins();
    if (!installed[name]) return false;

    installed[name].enabled = false;
    await saveInstalledPlugins(installed);

    const plugin = this.loadedPlugins.get(name);
    if (plugin) {
      plugin.enabled = false;
    }

    return true;
  }

  /**
   * List all installed plugins
   */
  list(): LoadedPlugin[] {
    return Array.from(this.loadedPlugins.values());
  }

  /**
   * Get a specific plugin
   */
  get(name: string): LoadedPlugin | undefined {
    return this.loadedPlugins.get(name);
  }

  /**
   * Load all installed plugins
   */
  async loadAll(): Promise<void> {
    await this.init();
    const installed = await getInstalledPlugins();

    for (const [name, info] of Object.entries(installed)) {
      if (!info.enabled) continue;

      // Determine plugin path
      let pluginPath: string;
      const parsed = parsePluginSource(info.source);

      if (parsed.type === 'local') {
        pluginPath = parsed.path;
      } else {
        pluginPath = join(PLUGINS_DIR, name);
      }

      if (!existsSync(pluginPath)) continue;

      const plugin = await loadPlugin(pluginPath, info.source);
      if (plugin) {
        this.loadedPlugins.set(name, plugin);
      }
    }
  }

  /**
   * Get all commands from enabled plugins
   */
  getAllCommands(): SlashCommand[] {
    const commands: SlashCommand[] = [];

    for (const plugin of this.loadedPlugins.values()) {
      if (plugin.enabled) {
        commands.push(...plugin.commands);
      }
    }

    return commands;
  }

  /**
   * Get all MCP servers from enabled plugins
   */
  getAllMcpServers(): McpServersConfig {
    const servers: McpServersConfig = {};

    for (const plugin of this.loadedPlugins.values()) {
      if (plugin.enabled) {
        Object.assign(servers, plugin.mcpServers);
      }
    }

    return servers;
  }
}

/**
 * Format plugin list for display
 */
export function formatPluginList(plugins: LoadedPlugin[]): string {
  if (plugins.length === 0) {
    return 'No plugins installed.\n\nInstall plugins with:\n  pivloop --install-plugin github:owner/repo\n  pivloop --install-plugin ./local-plugin';
  }

  const lines: string[] = ['Installed Plugins:', ''];

  for (const plugin of plugins) {
    const status = plugin.enabled ? '✓' : '○';
    const commands = plugin.commands.length > 0 ? ` (${plugin.commands.length} commands)` : '';
    const mcpCount = Object.keys(plugin.mcpServers).length;
    const mcp = mcpCount > 0 ? ` (${mcpCount} MCP servers)` : '';

    lines.push(`  ${status} ${plugin.manifest.name} v${plugin.manifest.version}`);
    lines.push(`    ${plugin.manifest.description}${commands}${mcp}`);
    if (plugin.manifest.author) {
      lines.push(`    by ${plugin.manifest.author}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * List plugins from disk without loading them
 */
export async function listInstalledPluginNames(): Promise<string[]> {
  if (!existsSync(PLUGINS_DIR)) {
    return [];
  }

  try {
    const entries = await readdir(PLUGINS_DIR, { withFileTypes: true });
    return entries
      .filter(e => e.isDirectory())
      .map(e => e.name);
  } catch (error) {
    logWarning('plugins:list', `Failed to list plugins directory: ${error instanceof Error ? error.message : error}`);
    return [];
  }
}
