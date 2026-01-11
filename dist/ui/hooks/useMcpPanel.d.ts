/**
 * MCP Panel Hook
 * Manages state for the /mcp interactive panel
 */
import type { McpServersConfig } from '../../features/mcp.js';
export interface UseMcpPanelOptions {
    /** Initial servers config */
    servers?: McpServersConfig;
}
export interface UseMcpPanelReturn {
    /** Whether panel is open */
    isOpen: boolean;
    /** Current servers config */
    servers: McpServersConfig;
    /** Open the panel with servers */
    open: (servers: McpServersConfig) => void;
    /** Close the panel */
    close: () => void;
}
export declare function useMcpPanel(options?: UseMcpPanelOptions): UseMcpPanelReturn;
export default useMcpPanel;
//# sourceMappingURL=useMcpPanel.d.ts.map