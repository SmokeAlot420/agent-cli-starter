import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
/**
 * Get mode indicator for display
 */
function getModeIndicator(mode, showThinking) {
    let modeText = '';
    let modeColor = 'gray';
    switch (mode) {
        case 'acceptEdits':
            modeText = 'accept edits on';
            modeColor = 'green';
            break;
        case 'plan':
            modeText = 'plan mode on';
            modeColor = 'cyan';
            break;
        case 'bypassPermissions':
            modeText = 'bypass on';
            modeColor = 'red';
            break;
        default:
            modeText = 'normal';
            modeColor = 'gray';
    }
    if (showThinking) {
        modeText += ' | thinking';
    }
    return { text: modeText, color: modeColor };
}
/**
 * Get color for context usage based on percentage
 */
function getContextColor(usage) {
    if (usage < 50)
        return 'green';
    if (usage < 75)
        return 'yellow';
    return 'red';
}
/**
 * Get display text for thinking state
 */
function getStateDisplay(state) {
    switch (state) {
        case 'thinking':
            return { text: 'Thinking...', color: 'magenta' };
        case 'tool_use':
            return { text: 'Using tools', color: 'yellow' };
        default:
            return { text: 'Ready', color: 'green' };
    }
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