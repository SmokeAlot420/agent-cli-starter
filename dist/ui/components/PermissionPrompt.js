import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text, useInput } from 'ink';
/**
 * Format tool input for display
 */
function formatInput(toolName, input) {
    // For Bash, show the command
    if (toolName === 'Bash' && typeof input.command === 'string') {
        const cmd = input.command;
        return cmd.length > 60 ? cmd.substring(0, 60) + '...' : cmd;
    }
    // For Write/Edit, show the file path
    if ((toolName === 'Write' || toolName === 'Edit') && typeof input.file_path === 'string') {
        return input.file_path;
    }
    // For NotebookEdit, show notebook path
    if (toolName === 'NotebookEdit' && typeof input.notebook_path === 'string') {
        return input.notebook_path;
    }
    // Fallback to JSON (truncated)
    const json = JSON.stringify(input);
    return json.length > 60 ? json.substring(0, 60) + '...' : json;
}
/**
 * Interactive permission prompt component
 *
 * @example
 * ```tsx
 * {pendingRequest && (
 *   <PermissionPrompt
 *     request={pendingRequest}
 *     onRespond={respond}
 *   />
 * )}
 * ```
 */
export function PermissionPrompt({ request, onRespond }) {
    // Handle Y/A/N keyboard input
    useInput((input) => {
        const key = input.toLowerCase();
        if (key === 'y') {
            onRespond('allow');
        }
        else if (key === 'a') {
            onRespond('always');
        }
        else if (key === 'n') {
            onRespond('deny');
        }
    });
    return (_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "yellow", paddingX: 1, marginY: 1, children: [_jsx(Text, { bold: true, color: "yellow", children: "Permission Required" }), _jsx(Text, { children: " " }), _jsxs(Text, { children: ["Tool: ", _jsx(Text, { bold: true, children: request.toolName })] }), _jsx(Text, { dimColor: true, children: formatInput(request.toolName, request.toolInput) }), request.decisionReason && (_jsxs(Text, { dimColor: true, children: ["Reason: ", request.decisionReason] })), _jsx(Text, { children: " " }), _jsxs(Box, { children: [_jsx(Text, { color: "green", children: "[Y]" }), _jsx(Text, { children: " Allow once  " }), _jsx(Text, { color: "cyan", children: "[A]" }), _jsx(Text, { children: " Always allow  " }), _jsx(Text, { color: "red", children: "[N]" }), _jsx(Text, { children: " Deny" })] })] }));
}
//# sourceMappingURL=PermissionPrompt.js.map