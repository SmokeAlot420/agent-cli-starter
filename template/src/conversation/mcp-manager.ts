/**
 * MCP Manager Module
 *
 * Manages MCP (Model Context Protocol) server configuration and lifecycle.
 */

import { buildMcpConfig, type McpOptions, type McpServersConfig, type McpServerConfig } from '../features/mcp.js';

/**
 * MCP Manager class for server lifecycle management
 */
export class McpManager {
  private servers: McpServersConfig;
  private readonly mcpOptions?: McpOptions;

  constructor(mcpOptions?: McpOptions) {
    this.mcpOptions = mcpOptions;
    this.servers = this.buildServers();
  }

  /**
   * Build MCP server configuration from options
   */
  private buildServers(): McpServersConfig {
    if (!this.mcpOptions) {
      return buildMcpConfig();
    }
    return buildMcpConfig(this.mcpOptions);
  }

  /**
   * Get current MCP server configuration
   */
  getServers(): McpServersConfig {
    return { ...this.servers };
  }

  /**
   * Add a new MCP server at runtime
   */
  addServer(name: string, config: McpServerConfig): void {
    this.servers[name] = config;
  }

  /**
   * Remove an MCP server
   */
  removeServer(name: string): boolean {
    if (name in this.servers) {
      delete this.servers[name];
      return true;
    }
    return false;
  }

  /**
   * Reload MCP configuration from file and defaults
   */
  reload(): void {
    this.servers = this.buildServers();
  }

  /**
   * Check if any servers are configured
   */
  hasServers(): boolean {
    return Object.keys(this.servers).length > 0;
  }

  /**
   * Get server count
   */
  getServerCount(): number {
    return Object.keys(this.servers).length;
  }
}
