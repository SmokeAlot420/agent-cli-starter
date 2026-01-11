import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text, useInput } from 'ink';
const SOURCE_LABELS = {
    user: 'User-level',
    project: 'Project-level',
    local: 'Local .claude'
};
const SOURCE_DESCRIPTIONS = {
    user: 'Global memory (~/.claude/CLAUDE.md)',
    project: 'Project root (./CLAUDE.md)',
    local: 'Hidden local (./.claude/CLAUDE.md)'
};
/**
 * MemoryEditor displays a list of CLAUDE.md files for editing
 */
export const MemoryEditor = ({ files, selectedIndex, onSelectNext, onSelectPrev, onEdit, onClose }) => {
    // Keyboard handling
    useInput((input, key) => {
        if (key.escape) {
            onClose();
        }
        else if (key.upArrow) {
            onSelectPrev();
        }
        else if (key.downArrow) {
            onSelectNext();
        }
        else if (key.return) {
            const selected = files[selectedIndex];
            if (selected) {
                onEdit(selected);
            }
        }
    });
    // Handle empty state
    if (files.length === 0) {
        return (_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "gray", paddingX: 1, children: [_jsx(Text, { bold: true, color: "cyan", children: "Memory Files" }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, italic: true, children: "No memory files found" }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "Press Esc to close" }) })] }));
    }
    return (_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "cyan", paddingX: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, color: "cyan", children: "Memory Files (CLAUDE.md)" }) }), files.map((file, index) => {
                const isSelected = index === selectedIndex;
                const indicator = isSelected ? '\u25b8 ' : '  ';
                const sourceLabel = SOURCE_LABELS[file.source] || file.source;
                const sourceDesc = SOURCE_DESCRIPTIONS[file.source] || '';
                return (_jsxs(Box, { flexDirection: "column", marginY: 0, children: [_jsxs(Box, { children: [_jsx(Text, { color: isSelected ? 'cyan' : 'white', bold: isSelected, children: indicator }), _jsx(Text, { color: isSelected ? 'cyan' : 'white', bold: isSelected, children: sourceLabel }), file.exists ? (_jsx(Text, { color: "green", children: " [exists]" })) : (_jsx(Text, { color: "yellow", children: " [create new]" }))] }), _jsx(Box, { marginLeft: 4, children: _jsx(Text, { dimColor: true, children: sourceDesc }) })] }, file.path));
            }), _jsx(Box, { marginTop: 1, children: _jsxs(Text, { dimColor: true, children: ['\u2191\u2193', " Navigate | Enter: Edit | Esc: Cancel"] }) })] }));
};
export default MemoryEditor;
//# sourceMappingURL=MemoryEditor.js.map