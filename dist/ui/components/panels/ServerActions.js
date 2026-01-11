import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
/**
 * Get available actions based on connection state
 */
function getActions(isConnected) {
    const actions = [
        { label: 'View Details', value: 'view' }
    ];
    if (isConnected) {
        actions.push({ label: 'Disconnect', value: 'disconnect' });
    }
    else {
        actions.push({ label: 'Connect', value: 'connect' });
    }
    actions.push({ label: 'Remove Server', value: 'remove' });
    return actions;
}
/**
 * ServerActions provides an action menu for server operations
 */
export const ServerActions = ({ serverName, isConnected, onAction, onCancel }) => {
    const actions = getActions(isConnected);
    // Handle escape key to cancel
    useInput((input, key) => {
        if (key.escape) {
            onCancel();
        }
    });
    const handleSelect = (item) => {
        onAction(item.value);
    };
    return (_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "cyan", paddingX: 1, paddingY: 0, children: [_jsx(Box, { marginBottom: 1, children: _jsxs(Text, { bold: true, color: "cyan", children: ["Actions for ", serverName] }) }), _jsx(SelectInput, { items: actions, onSelect: handleSelect }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "\u2191\u2193 Navigate | Enter: Select | Esc: Cancel" }) })] }));
};
export default ServerActions;
//# sourceMappingURL=ServerActions.js.map