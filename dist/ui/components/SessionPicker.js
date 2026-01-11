import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
/**
 * Format relative time
 */
function formatTimeAgo(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60)
        return 'just now';
    if (seconds < 3600)
        return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400)
        return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800)
        return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
}
/**
 * Truncate text with ellipsis
 */
function truncate(text, maxLength) {
    if (text.length <= maxLength)
        return text;
    return text.slice(0, maxLength - 3) + '...';
}
/**
 * SessionPicker displays a list of previous sessions for selection
 */
export const SessionPicker = ({ sessions, selectedIndex, maxVisible = 8, filter = '' }) => {
    // Handle empty state
    if (sessions.length === 0) {
        return (_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "gray", paddingX: 1, paddingY: 1, children: [_jsx(Text, { bold: true, color: "cyan", children: "PIV Loop Sessions" }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, italic: true, children: filter ? 'No sessions match your search' : 'No previous sessions' }) }), _jsxs(Box, { marginTop: 1, children: [_jsx(Text, { dimColor: true, children: "Press " }), _jsx(Text, { color: "green", bold: true, children: "N" }), _jsx(Text, { dimColor: true, children: " to start a new session" })] })] }));
    }
    // Calculate visible range with scroll offset
    const totalSessions = sessions.length;
    let startIndex = 0;
    // Keep selection visible with scrolling
    if (selectedIndex >= maxVisible) {
        startIndex = selectedIndex - maxVisible + 1;
    }
    const visibleSessions = sessions.slice(startIndex, startIndex + maxVisible);
    const hasMore = totalSessions > startIndex + maxVisible;
    const hasScrolledDown = startIndex > 0;
    return (_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "cyan", paddingX: 1, children: [_jsxs(Box, { marginBottom: 1, children: [_jsx(Text, { bold: true, color: "cyan", children: "PIV Loop Sessions" }), _jsxs(Text, { dimColor: true, children: [" (", totalSessions, " total)"] })] }), hasScrolledDown && (_jsx(Box, { children: _jsxs(Text, { dimColor: true, italic: true, children: ['\u25b2', " ", startIndex, " more above..."] }) })), visibleSessions.map((session, displayIndex) => {
                const actualIndex = startIndex + displayIndex;
                const isSelected = actualIndex === selectedIndex;
                const indicator = isSelected ? '\u25b8 ' : '  ';
                const displayName = session.name ?? truncate(session.initialPrompt, 40);
                const timeAgo = formatTimeAgo(session.lastActiveAt);
                return (_jsxs(Box, { flexDirection: "column", marginY: 0, children: [_jsxs(Box, { children: [_jsx(Text, { color: isSelected ? 'cyan' : 'white', bold: isSelected, children: indicator }), _jsx(Text, { color: isSelected ? 'cyan' : 'white', bold: isSelected, children: displayName }), _jsx(Text, { dimColor: true, children: "  " }), _jsx(Text, { dimColor: true, children: timeAgo }), _jsx(Text, { dimColor: true, children: "  " }), _jsxs(Text, { color: "gray", children: [session.messageCount, " msgs"] })] }), session.gitBranch && (_jsx(Box, { marginLeft: 4, children: _jsxs(Text, { dimColor: true, children: ['\u2514', " branch: ", session.gitBranch] }) }))] }, session.id));
            }), hasMore && (_jsx(Box, { children: _jsxs(Text, { dimColor: true, italic: true, children: ['\u25bc', " ", totalSessions - startIndex - maxVisible, " more..."] }) })), _jsx(Box, { marginTop: 1, flexDirection: "column", children: _jsxs(Text, { dimColor: true, children: ['\u2191\u2193', " Navigate | Enter: Resume | N: New | D: Delete | /: Search | Esc: Cancel"] }) })] }));
};
export default SessionPicker;
//# sourceMappingURL=SessionPicker.js.map