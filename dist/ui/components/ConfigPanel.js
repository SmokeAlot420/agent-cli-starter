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
export const ConfigPanel = ({ activeTab, status, settings, usage, mcpServers = {}, selectedSettingIndex = 0, onClose, onNextTab, onPrevTab, onSelectNextSetting, onSelectPrevSetting, onActivateSetting }) => {
    // Keyboard handling
    useInput((input, key) => {
        if (key.escape) {
            onClose();
        }
        else if (activeTab === 'config') {
            // In Config tab: up/down navigate settings, Enter activates
            if (key.upArrow) {
                onSelectPrevSetting?.();
            }
            else if (key.downArrow) {
                onSelectNextSetting?.();
            }
            else if (key.return) {
                onActivateSetting?.();
            }
            else if (key.rightArrow || (key.tab && !key.shift)) {
                onNextTab();
            }
            else if (key.leftArrow || (key.shift && key.tab)) {
                onPrevTab();
            }
        }
        else {
            // Other tabs: left/right navigate tabs
            if (key.rightArrow || (key.tab && !key.shift)) {
                onNextTab();
            }
            else if (key.leftArrow || (key.shift && key.tab)) {
                onPrevTab();
            }
        }
    });
    return (_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "gray", paddingX: 1, marginTop: 1, children: [_jsxs(Box, { marginBottom: 1, children: [_jsx(Text, { dimColor: true, children: "Settings: " }), TABS.map((tab, idx) => (_jsxs(React.Fragment, { children: [idx > 0 && _jsx(Text, { dimColor: true, children: "  " }), activeTab === tab ? (_jsxs(Text, { bold: true, inverse: true, children: [" ", TAB_LABELS[tab], " "] })) : (_jsx(Text, { dimColor: true, children: TAB_LABELS[tab] }))] }, tab))), _jsx(Text, { dimColor: true, children: "  (\u2190/\u2192 or tab to cycle)" })] }), _jsx(Box, { marginBottom: 1, children: _jsx(Text, { dimColor: true, children: '─'.repeat(60) }) }), _jsxs(Box, { flexDirection: "column", minHeight: 10, children: [activeTab === 'status' && (_jsx(StatusTab, { status: status, mcpServers: mcpServers })), activeTab === 'config' && (_jsx(EditableConfigTab, { settings: settings, model: status.model, selectedIndex: selectedSettingIndex })), activeTab === 'usage' && (_jsx(UsageTab, { usage: usage }))] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: activeTab === 'config'
                        ? '↑↓ Navigate | Enter: Change | ←→ Tabs | Esc: Close'
                        : '←→ or Tab: Navigate tabs | Esc: Close' }) })] }));
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
// Editable Config Tab Content
const EditableConfigTab = ({ settings, model, selectedIndex }) => {
    // Settings in order: model, thinking, permission, verbose
    const settingRows = [
        { label: 'Model', value: model, valueColor: 'cyan' },
        { label: 'Thinking mode', value: settings.thinkingMode ? 'on' : 'off', valueColor: settings.thinkingMode ? 'green' : 'gray' },
        { label: 'Permission mode', value: settings.permissionMode, valueColor: undefined },
        { label: 'Verbose output', value: settings.verboseOutput ? 'on' : 'off', valueColor: settings.verboseOutput ? 'green' : 'gray' }
    ];
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { dimColor: true, children: "Configure preferences (Enter to change)" }), _jsx(Box, { height: 1 }), settingRows.map((row, idx) => {
                const isSelected = idx === selectedIndex;
                const indicator = isSelected ? '\u25b8 ' : '  ';
                return (_jsxs(Box, { children: [_jsx(Text, { color: isSelected ? 'cyan' : undefined, bold: isSelected, children: indicator }), _jsx(Text, { color: isSelected ? 'cyan' : 'gray', bold: isSelected, children: (row.label + ': ').padEnd(18) }), _jsx(Text, { color: row.valueColor, bold: isSelected, children: row.value })] }, row.label));
            })] }));
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