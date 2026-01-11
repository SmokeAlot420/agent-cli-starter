import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
/**
 * Format elapsed time for display
 */
function formatElapsed(seconds) {
    if (seconds < 60) {
        return `${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
}
/**
 * ThinkingIndicator with animated spinner
 */
export const ThinkingIndicator = ({ active, tool, elapsed }) => {
    if (!active) {
        return null;
    }
    const message = tool ? `Using ${tool}` : 'Thinking';
    return (_jsxs(Box, { paddingX: 1, marginY: 1, children: [_jsx(Text, { color: "magenta", children: _jsx(Spinner, { type: "dots" }) }), _jsxs(Text, { color: "magenta", children: [" ", message, "... "] }), _jsxs(Text, { dimColor: true, children: ["(", formatElapsed(elapsed), ")"] })] }));
};
export default ThinkingIndicator;
//# sourceMappingURL=ThinkingIndicator.js.map