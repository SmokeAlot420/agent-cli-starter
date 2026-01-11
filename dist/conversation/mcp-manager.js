/**
 * MCP Manager Module
 *
 * Manages MCP (Model Context Protocol) server configuration and lifecycle.
 */
import { buildMcpConfig } from '../features/mcp.js';
/**
 * MCP Manager class for server lifecycle management
 */
export class McpManager {
    servers;
    mcpOptions;
    constructor(mcpOptions) {
        this.mcpOptions = mcpOptions;
        this.servers = this.buildServers();
    }
    /**
     * Build MCP server configuration from options
     */
    buildServers() {
        if (!this.mcpOptions) {
            return buildMcpConfig();
        }
        return buildMcpConfig(this.mcpOptions);
    }
    /**
     * Get current MCP server configuration
     */
    getServers() {
        return { ...this.servers };
    }
    /**
     * Add a new MCP server at runtime
     */
    addServer(name, config) {
        this.servers[name] = config;
    }
    /**
     * Remove an MCP server
     */
    removeServer(name) {
        if (name in this.servers) {
            delete this.servers[name];
            return true;
        }
        return false;
    }
    /**
     * Reload MCP configuration from file and defaults
     */
    reload() {
        this.servers = this.buildServers();
    }
    /**
     * Check if any servers are configured
     */
    hasServers() {
        return Object.keys(this.servers).length > 0;
    }
    /**
     * Get server count
     */
    getServerCount() {
        return Object.keys(this.servers).length;
    }
}
//# sourceMappingURL=mcp-manager.js.map