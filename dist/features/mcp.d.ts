/**
 * MCP Server Configuration & Management
 *
 * Provides default MCP servers and utilities for loading/merging MCP configurations.
 * Default servers are configured in src/branding.ts
 */
/**
 * Clear the MCP config cache
 * Call this when config is modified externally
 */
export declare function clearMcpCache(): void;
/**
 * MCP Server configuration types (matching SDK)
 */
export interface McpStdioServerConfig {
    type: 'stdio';
    command: string;
    args?: string[];
    env?: Record<string, string>;
}
export interface McpHttpServerConfig {
    type: 'http';
    url: string;
    headers?: Record<string, string>;
}
export interface McpSseServerConfig {
    type: 'sse';
    url: string;
    headers?: Record<string, string>;
}
export type McpServerConfig = McpStdioServerConfig | McpHttpServerConfig | McpSseServerConfig;
export type McpServersConfig = Record<string, McpServerConfig>;
/**
 * Default MCP servers from branding configuration
 */
export declare const DEFAULT_MCP_SERVERS: McpServersConfig;
/**
 * Cloud-only MCP servers (no local server required)
 */
export declare const CLOUD_MCP_SERVERS: McpServersConfig;
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
export declare function loadMcpConfig(projectPath?: string): McpServersConfig | null;
/**
 * Merge MCP server configurations
 * User config takes precedence over defaults
 */
export declare function mergeMcpServers(defaults: McpServersConfig, user: McpServersConfig | null): McpServersConfig;
/**
 * Options for MCP configuration
 */
export interface McpOptions {
    /** Use bundled default MCP servers (archon, crawl4ai, context7). Default: true */
    useDefaultMcpServers?: boolean;
    /** Only use cloud MCP servers (no localhost required). Default: false */
    cloudOnly?: boolean;
    /** Path to .mcp.json config file */
    mcpConfigPath?: string;
    /** Additional MCP servers to include */
    additionalServers?: McpServersConfig;
    /** Servers to exclude from defaults */
    excludeServers?: string[];
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
export declare function buildMcpConfig(options?: McpOptions): McpServersConfig;
/**
 * Check if an MCP server is reachable
 */
export declare function checkMcpServerHealth(name: string, config: McpServerConfig): Promise<{
    connected: boolean;
    error?: string;
}>;
/**
 * Check health of all configured MCP servers
 */
export declare function checkAllMcpServers(servers: McpServersConfig): Promise<Record<string, {
    connected: boolean;
    error?: string;
}>>;
/**
 * Get a summary of MCP server status
 */
export declare function formatMcpStatus(results: Record<string, {
    connected: boolean;
    error?: string;
}>): string;
//# sourceMappingURL=mcp.d.ts.map