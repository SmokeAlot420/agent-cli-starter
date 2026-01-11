/**
 * ServerCard Component
 * Individual MCP server status card with selection highlighting
 */
import React from 'react';
export interface ServerCardProps {
    /** Server name */
    name: string;
    /** Server transport type */
    type: 'stdio' | 'http' | 'sse';
    /** Whether server is connected/healthy */
    connected: boolean;
    /** Error message if connection failed */
    error?: string;
    /** Whether this card is currently selected */
    isSelected: boolean;
    /** When health was last checked */
    lastChecked?: Date;
}
/**
 * ServerCard displays a single MCP server's status
 */
export declare const ServerCard: React.FC<ServerCardProps>;
export default ServerCard;
//# sourceMappingURL=ServerCard.d.ts.map