import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { UltrathinkText } from './UltrathinkText.js';
/**
 * Get icon for tool type
 */
function getToolIcon(tool) {
    const toolLower = tool.toLowerCase();
    if (toolLower.includes('read'))
        return '📖';
    if (toolLower.includes('write'))
        return '📝';
    if (toolLower.includes('edit'))
        return '✏️';
    if (toolLower.includes('bash'))
        return '💻';
    if (toolLower.includes('glob'))
        return '📁';
    if (toolLower.includes('grep'))
        return '🔍';
    if (toolLower.includes('web') || toolLower.includes('fetch'))
        return '🌐';
    if (toolLower.includes('task'))
        return '🤖';
    if (toolLower.includes('todo'))
        return '📋';
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
    if (toolLower.includes('task'))
        return 'yellow';
    return 'gray';
}
/**
 * Check if content starts with ultrathink prefix (case-insensitive)
 */
function hasUltrathinkPrefix(content) {
    return content.toLowerCase().startsWith('ultrathink:');
}
/**
 * Render text with ultrathink gradient if prefix is present
 */
function renderTextContent(content) {
    if (hasUltrathinkPrefix(content)) {
        // Extract the rest of the message after "ultrathink:"
        const restOfMessage = content.slice(11); // Length of "ultrathink:"
        return (_jsxs(Text, { children: [_jsx(UltrathinkText, { bold: true }), _jsx(Text, { children: ":" }), _jsx(Text, { children: restOfMessage })] }));
    }
    return _jsx(Text, { children: content });
}
/**
 * Single message block component
 */
const MessageBlock = ({ message, verbose }) => {
    switch (message.type) {
        case 'user':
            return (_jsxs(Box, { marginBottom: 1, children: [_jsx(Text, { color: "cyan", children: "\u276F " }), _jsx(Text, { children: message.content })] }));
        case 'text':
        case 'result':
            return renderTextContent(message.content);
        case 'tool_use': {
            // Always show tool usage (not just verbose mode)
            const toolName = message.metadata?.tool || 'Tool';
            const summary = message.metadata?.summary || message.content;
            const elapsed = message.metadata?.elapsed;
            const isProgress = message.metadata?.isProgress;
            // Skip progress updates if we already showed the initial tool call
            if (isProgress)
                return null;
            const icon = getToolIcon(toolName);
            const color = getToolColor(toolName);
            return (_jsxs(Box, { paddingLeft: 1, children: [_jsxs(Text, { children: [icon, " "] }), _jsx(Text, { color: color, bold: true, children: toolName.padEnd(8) }), _jsxs(Text, { dimColor: true, children: [" ", summary] }), elapsed !== undefined && (_jsxs(Text, { dimColor: true, children: [" (", elapsed.toFixed(1), "s)"] }))] }));
        }
        case 'tool_result':
            if (!verbose)
                return null;
            return (_jsxs(Box, { paddingX: 1, children: [_jsxs(Text, { dimColor: true, children: ["\u21B3 ", message.content.slice(0, 100)] }), message.content.length > 100 && _jsx(Text, { dimColor: true, children: "..." })] }));
        case 'thinking':
            if (!verbose)
                return null;
            return (_jsx(Box, { paddingX: 1, children: _jsxs(Text, { color: "magenta", dimColor: true, children: ["[Thinking: ", message.content.slice(0, 50), "...]"] }) }));
        case 'error':
            return (_jsx(Box, { paddingX: 1, marginY: 1, children: _jsxs(Text, { color: "red", children: ["Error: ", message.content] }) }));
        default:
            return null;
    }
};
/**
 * MessageStream component for displaying conversation
 */
export const MessageStream = ({ messages, streaming, verbose = false }) => {
    return (_jsxs(Box, { flexDirection: "column", flexGrow: 1, paddingX: 1, children: [messages.map((message, index) => (_jsx(MessageBlock, { message: message, verbose: verbose }, index))), streaming && messages.length === 0 && (_jsx(Text, { dimColor: true, children: "Waiting for response..." }))] }));
};
export default MessageStream;
//# sourceMappingURL=MessageStream.js.map