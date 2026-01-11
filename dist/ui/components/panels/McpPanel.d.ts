/**
 * McpPanel Component
 * Interactive MCP server management panel with keyboard navigation
 */
import React from 'react';
import { type ServerAction } from './ServerActions.js';
import type { McpServersConfig } from '../../../features/mcp.js';
export interface McpPanelProps {
    /** MCP server configuration to display */
    servers: McpServersConfig;
    /** Callback when panel should close */
    onClose: () => void;
    /** Optional callback for server actions */
    onServerAction?: (server: string, action: ServerAction) => void;
}
/**
 * McpPanel provides an interactive server management interface
 */
export declare const McpPanel: React.FC<McpPanelProps>;
export default McpPanel;
//# sourceMappingURL=McpPanel.d.ts.map