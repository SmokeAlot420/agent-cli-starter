import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * ModelSelector Component
 * Interactive model selection panel
 */
import { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { MODELS, getModelDisplayName } from '../../features/models.js';
const MODEL_OPTIONS = [
    { alias: 'opus', model: MODELS.OPUS, description: 'Most capable, extended thinking' },
    { alias: 'sonnet', model: MODELS.SONNET, description: 'Fast and capable' },
    { alias: 'haiku', model: MODELS.HAIKU, description: 'Fastest, most economical' }
];
/**
 * ModelSelector displays a list of available models for selection
 */
export const ModelSelector = ({ currentModel, onSelect, onClose }) => {
    // Find current model index for initial selection
    const initialIndex = MODEL_OPTIONS.findIndex(opt => opt.model === currentModel);
    const [selectedIndex, setSelectedIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
    // Keyboard handling
    useInput((input, key) => {
        if (key.escape) {
            onClose();
        }
        else if (key.upArrow) {
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        }
        else if (key.downArrow) {
            setSelectedIndex(prev => Math.min(prev + 1, MODEL_OPTIONS.length - 1));
        }
        else if (key.return) {
            const selected = MODEL_OPTIONS[selectedIndex];
            if (selected) {
                onSelect(selected.model);
            }
        }
    });
    return (_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "cyan", paddingX: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, color: "cyan", children: "Select Model" }) }), MODEL_OPTIONS.map((option, index) => {
                const isSelected = index === selectedIndex;
                const isCurrent = option.model === currentModel;
                const indicator = isSelected ? '\u25b8 ' : '  ';
                return (_jsxs(Box, { flexDirection: "column", marginY: 0, children: [_jsxs(Box, { children: [_jsx(Text, { color: isSelected ? 'cyan' : 'white', bold: isSelected, children: indicator }), _jsx(Text, { color: isSelected ? 'cyan' : 'white', bold: isSelected, children: option.alias }), isCurrent && (_jsx(Text, { color: "green", children: " (current)" }))] }), _jsx(Box, { marginLeft: 4, children: _jsxs(Text, { dimColor: true, children: [getModelDisplayName(option.model), " - ", option.description] }) })] }, option.alias));
            }), _jsx(Box, { marginTop: 1, children: _jsxs(Text, { dimColor: true, children: ['\u2191\u2193', " Navigate | Enter: Select | Esc: Cancel"] }) })] }));
};
export default ModelSelector;
//# sourceMappingURL=ModelSelector.js.map