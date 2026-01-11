import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * HelpPanel Component
 * Interactive tabbed help panel
 */
import React from 'react';
import { Box, Text, useInput } from 'ink';
const TAB_LABELS = {
    commands: 'Commands',
    shortcuts: 'Shortcuts',
    tips: 'Tips'
};
const TABS = ['commands', 'shortcuts', 'tips'];
export const HelpPanel = ({ activeTab, onClose, onNextTab, onPrevTab }) => {
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
    return (_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "cyan", paddingX: 1, marginTop: 1, children: [_jsxs(Box, { marginBottom: 1, children: [_jsx(Text, { bold: true, color: "cyan", children: "Help: " }), TABS.map((tab, idx) => (_jsxs(React.Fragment, { children: [idx > 0 && _jsx(Text, { dimColor: true, children: "  " }), activeTab === tab ? (_jsxs(Text, { bold: true, inverse: true, children: [" ", TAB_LABELS[tab], " "] })) : (_jsx(Text, { dimColor: true, children: TAB_LABELS[tab] }))] }, tab))), _jsx(Text, { dimColor: true, children: "  (\u2190/\u2192 to navigate)" })] }), _jsx(Box, { marginBottom: 1, children: _jsx(Text, { dimColor: true, children: '─'.repeat(60) }) }), _jsxs(Box, { flexDirection: "column", minHeight: 12, children: [activeTab === 'commands' && _jsx(CommandsTab, {}), activeTab === 'shortcuts' && _jsx(ShortcutsTab, {}), activeTab === 'tips' && _jsx(TipsTab, {})] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "\u2190\u2192 or Tab: Navigate tabs | Esc: Close" }) })] }));
};
// Commands Tab Content
const CommandsTab = () => {
    const commandGroups = [
        {
            title: 'Session',
            commands: [
                { cmd: '/clear', desc: 'Clear conversation' },
                { cmd: '/resume', desc: 'Resume previous session' },
                { cmd: '/sessions', desc: 'List all sessions' }
            ]
        },
        {
            title: 'Settings',
            commands: [
                { cmd: '/config', desc: 'Open settings panel' },
                { cmd: '/model', desc: 'Change model' },
                { cmd: '/think', desc: 'Toggle thinking mode' }
            ]
        },
        {
            title: 'Info',
            commands: [
                { cmd: '/status', desc: 'Show status' },
                { cmd: '/context', desc: 'Show context usage' },
                { cmd: '/cost', desc: 'Show token costs' }
            ]
        },
        {
            title: 'Tools',
            commands: [
                { cmd: '/mcp', desc: 'MCP servers' },
                { cmd: '/memory', desc: 'Edit CLAUDE.md' },
                { cmd: '/plan', desc: 'Enter plan mode' }
            ]
        }
    ];
    return (_jsx(Box, { flexDirection: "column", children: commandGroups.map((group, gIdx) => (_jsxs(Box, { flexDirection: "column", marginBottom: gIdx < commandGroups.length - 1 ? 1 : 0, children: [_jsx(Text, { bold: true, color: "cyan", children: group.title }), group.commands.map(({ cmd, desc }) => (_jsxs(Box, { children: [_jsx(Text, { color: "green", children: cmd.padEnd(12) }), _jsx(Text, { dimColor: true, children: desc })] }, cmd)))] }, group.title))) }));
};
// Shortcuts Tab Content
const ShortcutsTab = () => {
    const shortcuts = [
        { key: 'Esc', desc: 'Interrupt / Cancel / Close panel' },
        { key: 'Ctrl+C', desc: 'Exit application' },
        { key: 'Ctrl+R', desc: 'Open session picker' },
        { key: 'Shift+Tab', desc: 'Cycle permission mode' },
        { key: 'Tab', desc: 'Insert autocomplete / Navigate' },
        { key: '↑ / ↓', desc: 'Navigate lists / History' },
        { key: '← / →', desc: 'Navigate tabs' },
        { key: 'Enter', desc: 'Submit / Select / Activate' }
    ];
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { bold: true, color: "cyan", children: "Keyboard Shortcuts" }), _jsx(Box, { height: 1 }), shortcuts.map(({ key, desc }) => (_jsxs(Box, { children: [_jsx(Text, { color: "yellow", children: key.padEnd(14) }), _jsx(Text, { dimColor: true, children: desc })] }, key)))] }));
};
// Tips Tab Content
const TipsTab = () => {
    const tips = [
        'Type / to see all available commands',
        'Use /config to change settings interactively',
        'Press Shift+Tab to quickly change permission mode',
        '/model opens a selector to switch between models',
        'Commands auto-complete as you type',
        '/clear resets the conversation but keeps settings',
        'Use /resume to continue previous sessions',
        '/think toggles extended thinking mode for complex tasks'
    ];
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { bold: true, color: "cyan", children: "Quick Tips" }), _jsx(Box, { height: 1 }), tips.map((tip, idx) => (_jsxs(Box, { children: [_jsx(Text, { color: "gray", children: "\u2022 " }), _jsx(Text, { children: tip })] }, idx)))] }));
};
export default HelpPanel;
//# sourceMappingURL=HelpPanel.js.map