/**
 * useMcpHealth Hook
 * Real-time MCP server health polling with automatic refresh
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { checkAllMcpServers } from '../../features/mcp.js';
/** Default polling interval in milliseconds */
const DEFAULT_POLL_INTERVAL = 5000;
/**
 * Hook for polling MCP server health status
 *
 * @param servers - MCP server configuration to monitor
 * @param pollInterval - Polling interval in ms (default: 5000)
 * @returns Health status, loading state, and refresh function
 */
export function useMcpHealth(servers, pollInterval = DEFAULT_POLL_INTERVAL) {
    const [health, setHealth] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(null);
    const intervalRef = useRef(null);
    const mountedRef = useRef(true);
    /**
     * Check health of all servers
     */
    const checkHealth = useCallback(async () => {
        if (!mountedRef.current)
            return;
        setIsLoading(true);
        try {
            const results = await checkAllMcpServers(servers);
            // Only update state if still mounted
            if (mountedRef.current) {
                const now = new Date();
                const healthMap = {};
                for (const [name, status] of Object.entries(results)) {
                    healthMap[name] = {
                        connected: status.connected,
                        error: status.error,
                        lastChecked: now
                    };
                }
                setHealth(healthMap);
                setLastRefresh(now);
            }
        }
        catch (error) {
            // Handle unexpected errors gracefully
            if (mountedRef.current) {
                const now = new Date();
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                const healthMap = {};
                // Mark all servers as errored
                for (const name of Object.keys(servers)) {
                    healthMap[name] = {
                        connected: false,
                        error: errorMessage,
                        lastChecked: now
                    };
                }
                setHealth(healthMap);
                setLastRefresh(now);
            }
        }
        finally {
            if (mountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [servers]);
    /**
     * Manual refresh function
     */
    const refresh = useCallback(async () => {
        await checkHealth();
    }, [checkHealth]);
    // Initial check and polling setup
    useEffect(() => {
        mountedRef.current = true;
        // Initial health check
        checkHealth();
        // Set up polling interval
        intervalRef.current = setInterval(() => {
            checkHealth();
        }, pollInterval);
        // Cleanup on unmount
        return () => {
            mountedRef.current = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [checkHealth, pollInterval]);
    return {
        health,
        isLoading,
        lastRefresh,
        refresh
    };
}
export default useMcpHealth;
//# sourceMappingURL=useMcpHealth.js.map