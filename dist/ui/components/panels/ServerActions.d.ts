/**
 * ServerActions Component
 * Action menu for MCP server operations using SelectInput
 */
import React from 'react';
export type ServerAction = 'view' | 'connect' | 'disconnect' | 'remove';
export interface ServerActionsProps {
    /** Name of the server being acted upon */
    serverName: string;
    /** Whether the server is currently connected */
    isConnected: boolean;
    /** Callback when an action is selected */
    onAction: (action: ServerAction) => void;
    /** Callback when user cancels (escape key) */
    onCancel: () => void;
}
/**
 * ServerActions provides an action menu for server operations
 */
export declare const ServerActions: React.FC<ServerActionsProps>;
export default ServerActions;
//# sourceMappingURL=ServerActions.d.ts.map