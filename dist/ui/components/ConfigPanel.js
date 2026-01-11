import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * ConfigPanel Component
 * Claude Code-style tabbed configuration panel
 */
import React from 'react';
import { Box, Text, useInput } from 'ink';
const TAB_LABELS = {
    status: 'Status',
    config: 'Config',
    usage: 'Usage'
};
const TABS = ['status', 'config', 'usage'];
export const ConfigPanel = ({ activeTab, status, settings, usage, mcpServers = {}, onClose, onNextTab, onPrevTab }) => {
    // Keyboard handling
    useInput((input, key) => {
        if (key.escape) {
            onClose();
        }
        else if (key.rightArrow || (key.tab && !key.shift)) {
            onNextTab();
        }
        else if (key.leftArrow || (key.shift && key.tab)) {
            onPrevTab();
        }
    });
    return (_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "gray", paddingX: 1, marginTop: 1, children: [_jsxs(Box, { marginBottom: 1, children: [_jsx(Text, { dimColor: true, children: "Settings: " }), TABS.map((tab, idx) => (_jsxs(React.Fragment, { children: [idx > 0 && _jsx(Text, { dimColor: true, children: "  " }), activeTab === tab ? (_jsxs(Text, { bold: true, inverse: true, children: [" ", TAB_LABELS[tab], " "] })) : (_jsx(Text, { dimColor: true, children: TAB_LABELS[tab] }))] }, tab))), _jsx(Text, { dimColor: true, children: "  (\u2190/\u2192 or tab to cycle)" })] }), _jsx(Box, { marginBottom: 1, children: _jsx(Text, { dimColor: true, children: '─'.repeat(60) }) }), _jsxs(Box, { flexDirection: "column", minHeight: 10, children: [activeTab === 'status' && (_jsx(StatusTab, { status: status, mcpServers: mcpServers })), activeTab === 'config' && (_jsx(ConfigTab, { settings: settings })), activeTab === 'usage' && (_jsx(UsageTab, { usage: usage }))] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "escape to close" }) })] }));
};
// Status Tab Content
const StatusTab = ({ status, mcpServers }) => {
    const serverNames = Object.keys(mcpServers);
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(ConfigRow, { label: "Version", value: status.version }), status.sessionId && (_jsx(ConfigRow, { label: "Session ID", value: status.sessionId })), _jsx(ConfigRow, { label: "cwd", value: status.cwd }), _jsx(Box, { height: 1 }), _jsx(ConfigRow, { label: "Model", value: `${status.model} (${status.modelId})` }), serverNames.length > 0 && (_jsxs(Box, { children: [_jsx(Text, { dimColor: true, children: 'MCP servers: '.padEnd(20) }), _jsx(Text, { children: serverNames.map((name, idx) => {
                            const server = mcpServers[name];
                            const icon = server.connected ? '✓' : '✗';
                            const color = server.connected ? 'green' : 'red';
                            return (_jsxs(Text, { children: [idx > 0 && ', ', name, " ", _jsx(Text, { color: color, children: icon })] }, name));
                        }) })] })), _jsx(ConfigRow, { label: "Thinking tokens", value: status.thinkingTokens.toLocaleString() })] }));
};
// Config Tab Content
const ConfigTab = ({ settings }) => {
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { dimColor: true, children: "Configure preferences" }), _jsx(Box, { height: 1 }), _jsx(ConfigRow, { label: "Thinking mode", value: settings.thinkingMode ? 'true' : 'false', valueColor: settings.thinkingMode ? 'green' : 'gray' }), _jsx(ConfigRow, { label: "Verbose output", value: settings.verboseOutput ? 'true' : 'false', valueColor: settings.verboseOutput ? 'green' : 'gray' }), _jsx(ConfigRow, { label: "Permission mode", value: settings.permissionMode })] }));
};
// Usage Tab Content
const UsageTab = ({ usage }) => {
    const contextColor = usage.contextPercent > 80 ? 'red' :
        usage.contextPercent > 60 ? 'yellow' : 'green';
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { dimColor: true, children: "Session usage statistics" }), _jsx(Box, { height: 1 }), _jsxs(Box, { children: [_jsx(Text, { dimColor: true, children: 'Context used: '.padEnd(20) }), _jsxs(Text, { color: contextColor, children: [usage.contextPercent, "%"] })] })] }));
};
// Helper component for consistent row formatting
const ConfigRow = ({ label, value, valueColor }) => (_jsxs(Box, { children: [_jsx(Text, { dimColor: true, children: (label + ': ').padEnd(20) }), _jsx(Text, { color: valueColor, children: value })] }));
export default ConfigPanel;
//# sourceMappingURL=ConfigPanel.js.map