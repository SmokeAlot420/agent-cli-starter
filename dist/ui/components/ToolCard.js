import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Box, Text } from 'ink';
/**
 * Get icon for tool type
 */
function getToolIcon(tool) {
    const toolLower = tool.toLowerCase();
    if (toolLower.includes('read') || toolLower.includes('file'))
        return '📄';
    if (toolLower.includes('write') || toolLower.includes('edit'))
        return '✏️';
    if (toolLower.includes('bash') || toolLower.includes('shell'))
        return '💻';
    if (toolLower.includes('glob') || toolLower.includes('search'))
        return '🔍';
    if (toolLower.includes('grep'))
        return '🔎';
    if (toolLower.includes('web') || toolLower.includes('fetch'))
        return '🌐';
    return '🔧';
}
/**
 * Get color for tool type
 */
function getToolColor(tool) {
    const toolLower = tool.toLowerCase();
    if (toolLower.includes('read'))
        return 'blue';
    if (toolLower.includes('write') || toolLower.includes('edit'))
        return 'green';
    if (toolLower.includes('bash'))
        return 'magenta';
    if (toolLower.includes('glob') || toolLower.includes('grep'))
        return 'cyan';
    return 'yellow';
}
/**
 * Format input for display
 */
function formatInput(input, maxLength = 100) {
    try {
        const str = JSON.stringify(input, null, 2);
        if (str.length > maxLength) {
            return str.slice(0, maxLength) + '...';
        }
        return str;
    }
    catch {
        return String(input);
    }
}
/**
 * ToolCard component for displaying tool usage
 */
export const ToolCard = ({ tool, input, verbose, elapsed }) => {
    const icon = getToolIcon(tool);
    const color = getToolColor(tool);
    return (_jsxs(Box, { flexDirection: "column", borderStyle: "single", borderColor: color, paddingX: 1, marginY: 1, children: [_jsxs(Box, { children: [_jsxs(Text, { children: [icon, " "] }), _jsx(Text, { color: color, bold: true, children: tool }), elapsed !== undefined && (_jsxs(Text, { dimColor: true, children: [" (", elapsed, "s)"] }))] }), verbose && input !== undefined && input !== null ? (_jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: formatInput(input, 200) }) })) : null] }));
};
export default ToolCard;
//# sourceMappingURL=ToolCard.js.map