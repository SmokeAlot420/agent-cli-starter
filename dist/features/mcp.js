/**
 * MCP Server Configuration & Management
 *
 * Provides default MCP servers and utilities for loading/merging MCP configurations.
 * Default servers are configured in src/branding.ts
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { SAFE_ENV_VARS, SAFE_ENV_VAR_PREFIXES, MCP_HEALTH_CHECK_TIMEOUT, MCP_CACHE_TTL } from '../constants.js';
import { logWarning } from '../utils/errors.js';
import { defaultMcpServers, cloudMcpServers } from '../branding.js';
/** Cached MCP config with timestamp */
let mcpConfigCache = null;
/**
 * Clear the MCP config cache
 * Call this when config is modified externally
 */
export function clearMcpCache() {
    mcpConfigCache = null;
}
/**
 * Default MCP servers from branding configuration
 */
export const DEFAULT_MCP_SERVERS = defaultMcpServers;
/**
 * Cloud-only MCP servers (no local server required)
 */
export const CLOUD_MCP_SERVERS = cloudMcpServers;
/**
 * Load MCP configuration from .mcp.json file
 *
 * Supports variable expansion: ${VAR} and ${VAR:-default}
 * Uses caching with configurable TTL (MCP_CACHE_TTL constant).
 *
 * @param projectPath - Optional project directory to search for .mcp.json
 * @returns Parsed and expanded MCP configuration, or null if not found
 *
 * @example
 * ```typescript
 * // Load from current directory
 * const config = loadMcpConfig();
 *
 * // Load from specific project
 * const config = loadMcpConfig('/path/to/project');
 * ```
 */
export function loadMcpConfig(projectPath) {
    const cacheKey = projectPath || process.cwd();
    // Check cache validity
    if (mcpConfigCache &&
        mcpConfigCache.path === cacheKey &&
        Date.now() - mcpConfigCache.timestamp < MCP_CACHE_TTL) {
        return { ...mcpConfigCache.config };
    }
    const configPaths = [
        projectPath ? join(projectPath, '.mcp.json') : null,
        join(process.cwd(), '.mcp.json')
    ].filter(Boolean);
    for (const configPath of configPaths) {
        if (existsSync(configPath)) {
            try {
                const content = readFileSync(configPath, 'utf-8');
                const config = JSON.parse(content);
                const expanded = expandEnvVariables(config.mcpServers || config);
                // Update cache
                mcpConfigCache = {
                    config: expanded,
                    timestamp: Date.now(),
                    path: cacheKey
                };
                return expanded;
            }
            catch (error) {
                console.warn(`Failed to load MCP config from ${configPath}:`, error);
            }
        }
    }
    return null;
}
/**
 * Expand environment variables in config
 *
 * Supports ${VAR} and ${VAR:-default} syntax.
 * Only expands variables that pass isAllowedEnvVar() security check.
 *
 * Security: Blocked variables are replaced with empty string or default value.
 * A warning is logged when a variable is blocked.
 *
 * @param config - MCP servers configuration with potential ${VAR} references
 * @returns Configuration with environment variables expanded
 */
function expandEnvVariables(config) {
    const expanded = {};
    for (const [name, serverConfig] of Object.entries(config)) {
        expanded[name] = expandServerConfig(serverConfig);
    }
    return expanded;
}
/**
 * Check if an environment variable name is allowed for expansion
 *
 * Security: Only allows variables in SAFE_ENV_VARS set or matching SAFE_ENV_VAR_PREFIXES.
 * This prevents accidental exposure of sensitive environment variables in config files.
 *
 * @param name - Environment variable name to check
 * @returns true if variable is safe to expand
 */
function isAllowedEnvVar(name) {
    if (SAFE_ENV_VARS.has(name)) {
        return true;
    }
    return SAFE_ENV_VAR_PREFIXES.some(prefix => name.startsWith(prefix));
}
function expandServerConfig(config) {
    const expandString = (str) => {
        return str.replace(/\$\{([^}]+)\}/g, (match, expr) => {
            const [varName, defaultValue] = expr.split(':-');
            if (!isAllowedEnvVar(varName)) {
                logWarning('mcp:config', `Blocked env var expansion: ${varName}`);
                return defaultValue || '';
            }
            return process.env[varName] || defaultValue || '';
        });
    };
    if (config.type === 'stdio') {
        return {
            ...config,
            command: expandString(config.command),
            args: config.args?.map(expandString),
            env: config.env ? Object.fromEntries(Object.entries(config.env).map(([k, v]) => [k, expandString(v)])) : undefined
        };
    }
    if (config.type === 'http' || config.type === 'sse') {
        return {
            ...config,
            url: expandString(config.url),
            headers: config.headers ? Object.fromEntries(Object.entries(config.headers).map(([k, v]) => [k, expandString(v)])) : undefined
        };
    }
    return config;
}
/**
 * Merge MCP server configurations
 * User config takes precedence over defaults
 */
export function mergeMcpServers(defaults, user) {
    if (!user)
        return { ...defaults };
    return {
        ...defaults,
        ...user
    };
}
/**
 * Build final MCP server configuration based on options
 *
 * Merges configurations in order:
 * 1. Default servers (if useDefaultMcpServers is true)
 * 2. Config file servers (.mcp.json)
 * 3. Additional servers from options
 * 4. Removes excluded servers
 *
 * @param options - Configuration options for MCP server setup
 * @returns Final merged MCP server configuration
 *
 * @example
 * ```typescript
 * // Use defaults only
 * const servers = buildMcpConfig();
 *
 * // Cloud-only (no localhost required)
 * const servers = buildMcpConfig({ cloudOnly: true });
 *
 * // Add custom server, exclude archon
 * const servers = buildMcpConfig({
 *   additionalServers: { myServer: { type: 'http', url: 'http://localhost:9000' } },
 *   excludeServers: ['archon']
 * });
 * ```
 */
export function buildMcpConfig(options = {}) {
    const { useDefaultMcpServers = true, cloudOnly = false, mcpConfigPath, additionalServers = {}, excludeServers = [] } = options;
    let servers = {};
    // Start with defaults if enabled
    if (useDefaultMcpServers) {
        servers = cloudOnly ? { ...CLOUD_MCP_SERVERS } : { ...DEFAULT_MCP_SERVERS };
    }
    // Load from config file
    const fileConfig = loadMcpConfig(mcpConfigPath);
    if (fileConfig) {
        servers = { ...servers, ...fileConfig };
    }
    // Add additional servers
    servers = { ...servers, ...additionalServers };
    // Remove excluded servers
    for (const name of excludeServers) {
        delete servers[name];
    }
    return servers;
}
/**
 * Check if an MCP server is reachable
 */
export async function checkMcpServerHealth(name, config) {
    if (config.type === 'stdio') {
        // For stdio, we can't easily check without starting the process
        return { connected: true };
    }
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), MCP_HEALTH_CHECK_TIMEOUT);
        const response = await fetch(config.url, {
            method: 'GET',
            headers: config.headers,
            signal: controller.signal
        });
        clearTimeout(timeout);
        // Some MCP servers return 405 for GET, but that still means they're up
        if (response.ok || response.status === 405) {
            return { connected: true };
        }
        return { connected: false, error: `HTTP ${response.status}` };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { connected: false, error: message };
    }
}
/**
 * Check health of all configured MCP servers
 */
export async function checkAllMcpServers(servers) {
    const results = {};
    const checks = Object.entries(servers).map(async ([name, config]) => {
        results[name] = await checkMcpServerHealth(name, config);
    });
    await Promise.all(checks);
    return results;
}
/**
 * Get a summary of MCP server status
 */
export function formatMcpStatus(results) {
    const lines = ['MCP Server Status:'];
    for (const [name, status] of Object.entries(results)) {
        const icon = status.connected ? '✓' : '✗';
        const error = status.error ? ` (${status.error})` : '';
        lines.push(`  ${icon} ${name}${error}`);
    }
    return lines.join('\n');
}
//# sourceMappingURL=mcp.js.map