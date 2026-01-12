import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
/** Mode display configuration */
const MODE_CONFIG = {
    acceptEdits: { text: 'accept edits on', color: 'green' },
    plan: { text: 'plan mode on', color: 'cyan' },
    bypassPermissions: { text: 'bypass on', color: 'red' }
};
const DEFAULT_MODE = { text: 'normal', color: 'gray' };
/**
 * Get mode indicator for display
 */
function getModeIndicator(mode, showThinking) {
    const config = MODE_CONFIG[mode] || DEFAULT_MODE;
    const text = showThinking ? `${config.text} | thinking` : config.text;
    return { text, color: config.color };
}
/**
 * Get color for context usage based on percentage
 */
function getContextColor(usage) {
    if (usage >= 75)
        return 'red';
    if (usage >= 50)
        return 'yellow';
    return 'green';
}
/** Thinking state display configuration */
const STATE_CONFIG = {
    thinking: { text: 'Thinking...', color: 'magenta' },
    tool_use: { text: 'Using tools', color: 'yellow' },
    idle: { text: 'Ready', color: 'green' }
};
/**
 * Get display text for thinking state
 */
function getStateDisplay(state) {
    return STATE_CONFIG[state];
}
/**
 * StatusBar component for bottom of screen
 */
export const StatusBar = ({ contextUsage, thinkingState, permissionMode, showThinking = false, isProcessing = false }) => {
    const stateDisplay = getStateDisplay(thinkingState);
    const contextColor = getContextColor(contextUsage);
    const modeDisplay = getModeIndicator(permissionMode, showThinking);
    return (_jsxs(Box, { borderStyle: "single", borderColor: "gray", paddingX: 1, justifyContent: "space-between", marginTop: 1, children: [_jsxs(Box, { children: [_jsx(Text, { dimColor: true, children: "Context: " }), _jsxs(Text, { color: contextColor, children: [contextUsage, "%"] })] }), _jsx(Box, { children: _jsx(Text, { color: stateDisplay.color, children: stateDisplay.text }) }), _jsxs(Box, { children: [_jsx(Text, { color: modeDisplay.color, children: modeDisplay.text }), isProcessing ? (_jsx(Text, { color: "yellow", children: " | Esc to cancel" })) : (_jsx(Text, { dimColor: true, children: " | Shift+Tab mode | Ctrl+C exit" }))] })] }));
};
export default StatusBar;
//# sourceMappingURL=StatusBar.js.map