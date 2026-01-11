/**
 * useMcpHealth Hook
 * Real-time MCP server health polling with automatic refresh
 */
import { type McpServersConfig } from '../../features/mcp.js';
/**
 * Health status for a single MCP server
 */
export interface McpServerHealth {
    /** Whether the server is connected/reachable */
    connected: boolean;
    /** Error message if connection failed */
    error?: string;
    /** When this status was last checked */
    lastChecked: Date;
}
/**
 * Return type for useMcpHealth hook
 */
export interface UseMcpHealthReturn {
    /** Health status for each server by name */
    health: Record<string, McpServerHealth>;
    /** Whether a health check is currently in progress */
    isLoading: boolean;
    /** When the last refresh completed */
    lastRefresh: Date | null;
    /** Manually trigger a health refresh */
    refresh: () => Promise<void>;
}
/**
 * Hook for polling MCP server health status
 *
 * @param servers - MCP server configuration to monitor
 * @param pollInterval - Polling interval in ms (default: 5000)
 * @returns Health status, loading state, and refresh function
 */
export declare function useMcpHealth(servers: McpServersConfig, pollInterval?: number): UseMcpHealthReturn;
export default useMcpHealth;
//# sourceMappingURL=useMcpHealth.d.ts.map