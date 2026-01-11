import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
/**
 * Get color for connection status
 */
function getStatusColor(connected) {
    return connected ? 'green' : 'red';
}
/**
 * Get color for type badge
 */
function getTypeColor(type) {
    switch (type) {
        case 'http':
            return 'cyan';
        case 'sse':
            return 'magenta';
        case 'stdio':
            return 'yellow';
        default:
            return 'gray';
    }
}
/**
 * Format last checked time for display
 */
function formatLastChecked(date) {
    if (!date)
        return '';
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60)
        return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
}
/**
 * ServerCard displays a single MCP server's status
 */
export const ServerCard = ({ name, type, connected, error, isSelected, lastChecked }) => {
    const statusColor = getStatusColor(connected);
    const typeColor = getTypeColor(type);
    const statusDot = connected ? '●' : '○';
    const statusText = connected ? 'connected' : 'offline';
    return (_jsxs(Box, { paddingX: 1, borderStyle: isSelected ? 'round' : undefined, borderColor: isSelected ? 'cyan' : undefined, children: [_jsx(Box, { width: 2, children: _jsx(Text, { color: statusColor, children: statusDot }) }), _jsx(Box, { width: 16, children: _jsx(Text, { bold: isSelected, color: isSelected ? 'cyan' : undefined, children: name }) }), _jsx(Box, { width: 8, children: _jsx(Text, { color: typeColor, children: type }) }), _jsx(Box, { width: 12, children: _jsx(Text, { color: statusColor, children: statusText }) }), lastChecked && (_jsx(Box, { children: _jsx(Text, { dimColor: true, children: formatLastChecked(lastChecked) }) })), error && !connected && (_jsx(Box, { marginLeft: 1, children: _jsxs(Text, { color: "red", dimColor: true, children: ["(", error, ")"] }) }))] }));
};
export default ServerCard;
//# sourceMappingURL=ServerCard.js.map