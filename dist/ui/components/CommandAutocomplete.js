import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
/**
 * Get color for command source type
 */
function getSourceColor(sourceType) {
    switch (sourceType) {
        case 'builtin':
            return 'blue';
        case 'user':
            return 'green';
        case 'project':
            return 'yellow';
        case 'plugin':
            return 'magenta';
        default:
            return 'white';
    }
}
/**
 * CommandAutocomplete displays a dropdown of filtered slash commands
 *
 * @example
 * ```tsx
 * <CommandAutocomplete
 *   commands={filteredCommands}
 *   selectedIndex={0}
 *   maxVisible={8}
 * />
 * ```
 */
export const CommandAutocomplete = ({ commands, selectedIndex, maxVisible = 8 }) => {
    // Handle empty commands
    if (commands.length === 0) {
        return (_jsx(Box, { flexDirection: "column", borderStyle: "round", borderColor: "gray", paddingX: 1, marginLeft: 2, children: _jsx(Text, { dimColor: true, italic: true, children: "No commands match" }) }));
    }
    // Determine visible range with scrolling
    const totalCommands = commands.length;
    const visibleCommands = commands.slice(0, maxVisible);
    const hasMore = totalCommands > maxVisible;
    return (_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "cyan", paddingX: 1, marginLeft: 2, children: [visibleCommands.map((cmd, index) => {
                const isSelected = index === selectedIndex;
                const color = getSourceColor(cmd.sourceType);
                const indicator = isSelected ? '\u25b8 ' : '  ';
                const argHint = cmd.metadata.argumentHint
                    ? ` <${cmd.metadata.argumentHint}>`
                    : '';
                return (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Box, { children: [_jsx(Text, { color: isSelected ? 'cyan' : 'white', bold: isSelected, children: indicator }), _jsxs(Text, { color: color, bold: isSelected, children: ["/", cmd.name] }), _jsx(Text, { dimColor: true, children: argHint })] }), _jsx(Box, { marginLeft: 4, children: _jsx(Text, { dimColor: true, children: cmd.description }) })] }, cmd.name));
            }), hasMore && (_jsx(Box, { marginTop: 0, children: _jsxs(Text, { dimColor: true, italic: true, children: ['\u25bc', " ", totalCommands - maxVisible, " more..."] }) })), _jsx(Box, { marginTop: 1, children: _jsxs(Text, { dimColor: true, children: ['\u2191\u2193', " Navigate | Tab/Enter: Select | Esc: Close"] }) })] }));
};
export default CommandAutocomplete;
//# sourceMappingURL=CommandAutocomplete.js.map