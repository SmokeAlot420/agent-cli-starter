/**
 * MCP Manager Module
 *
 * Manages MCP (Model Context Protocol) server configuration and lifecycle.
 */
import { type McpOptions, type McpServersConfig, type McpServerConfig } from '../features/mcp.js';
/**
 * MCP Manager class for server lifecycle management
 */
export declare class McpManager {
    private servers;
    private readonly mcpOptions?;
    constructor(mcpOptions?: McpOptions);
    /**
     * Build MCP server configuration from options
     */
    private buildServers;
    /**
     * Get current MCP server configuration
     */
    getServers(): McpServersConfig;
    /**
     * Add a new MCP server at runtime
     */
    addServer(name: string, config: McpServerConfig): void;
    /**
     * Remove an MCP server
     */
    removeServer(name: string): boolean;
    /**
     * Reload MCP configuration from file and defaults
     */
    reload(): void;
    /**
     * Check if any servers are configured
     */
    hasServers(): boolean;
    /**
     * Get server count
     */
    getServerCount(): number;
}
//# sourceMappingURL=mcp-manager.d.ts.map