import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * McpPanel Component
 * Interactive MCP server management panel with keyboard navigation
 */
import { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import Spinner from 'ink-spinner';
import { ServerCard } from './ServerCard.js';
import { ServerActions } from './ServerActions.js';
import { useMcpHealth } from '../../hooks/useMcpHealth.js';
/**
 * Get server type from config
 */
function getServerType(config) {
    return config.type;
}
/**
 * McpPanel provides an interactive server management interface
 */
export const McpPanel = ({ servers, onClose, onServerAction }) => {
    const serverNames = Object.keys(servers);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showActions, setShowActions] = useState(false);
    const [actionServer, setActionServer] = useState(null);
    // Health polling
    const { health, isLoading, refresh } = useMcpHealth(servers);
    // Handle keyboard input when action menu is not open
    useInput((input, key) => {
        if (showActions)
            return; // Let ServerActions handle input
        // Navigation
        if (key.upArrow) {
            setSelectedIndex(prev => Math.max(0, prev - 1));
        }
        else if (key.downArrow) {
            setSelectedIndex(prev => Math.min(serverNames.length - 1, prev + 1));
        }
        // Open action menu
        if (key.return && serverNames.length > 0) {
            setActionServer(serverNames[selectedIndex]);
            setShowActions(true);
        }
        // Refresh health
        if (input === 'r' || input === 'R') {
            refresh();
        }
        // Close panel
        if (key.escape) {
            onClose();
        }
    });
    /**
     * Handle action selection from menu
     */
    const handleAction = useCallback((action) => {
        if (actionServer && onServerAction) {
            onServerAction(actionServer, action);
        }
        setShowActions(false);
        setActionServer(null);
    }, [actionServer, onServerAction]);
    /**
     * Handle action menu cancel
     */
    const handleActionCancel = useCallback(() => {
        setShowActions(false);
        setActionServer(null);
    }, []);
    // Empty state
    if (serverNames.length === 0) {
        return (_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "gray", paddingX: 2, paddingY: 1, children: [_jsx(Text, { bold: true, color: "cyan", children: "MCP Servers" }), _jsx(Box, { marginY: 1, children: _jsx(Text, { dimColor: true, children: "No MCP servers configured." }) }), _jsx(Text, { dimColor: true, children: "Esc: Close" })] }));
    }
    return (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "gray", paddingX: 1, children: [_jsxs(Box, { justifyContent: "space-between", marginBottom: 1, children: [_jsx(Text, { bold: true, color: "cyan", children: "MCP Servers" }), _jsxs(Box, { children: [isLoading && (_jsx(Box, { marginRight: 1, children: _jsx(Text, { color: "yellow", children: _jsx(Spinner, { type: "dots" }) }) })), _jsxs(Text, { dimColor: true, children: [serverNames.length, " server", serverNames.length !== 1 ? 's' : ''] })] })] }), _jsx(Box, { flexDirection: "column", children: serverNames.map((name, index) => {
                            const config = servers[name];
                            const serverHealth = health[name];
                            return (_jsx(ServerCard, { name: name, type: getServerType(config), connected: serverHealth?.connected ?? false, error: serverHealth?.error, isSelected: index === selectedIndex, lastChecked: serverHealth?.lastChecked }, name));
                        }) }), _jsx(Box, { marginTop: 1, borderStyle: "single", borderColor: "gray", borderTop: true, borderBottom: false, borderLeft: false, borderRight: false, children: _jsx(Text, { dimColor: true, children: "\u2191\u2193 Navigate | Enter: Actions | r: Refresh | Esc: Close" }) })] }), showActions && actionServer && (_jsx(Box, { marginTop: 1, children: _jsx(ServerActions, { serverName: actionServer, isConnected: health[actionServer]?.connected ?? false, onAction: handleAction, onCancel: handleActionCancel }) }))] }));
};
export default McpPanel;
//# sourceMappingURL=McpPanel.js.map