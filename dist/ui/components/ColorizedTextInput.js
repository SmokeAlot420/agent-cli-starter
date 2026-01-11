import { jsx as _jsx } from "react/jsx-runtime";
/**
 * ColorizedTextInput Component
 *
 * Custom text input that supports per-character coloring.
 * Detects "ultrathink:" prefix and applies phosphor gradient.
 * Based on ink-text-input source.
 */
import { useState, useEffect } from 'react';
import { Text, useInput } from 'ink';
import chalk from 'chalk';
// Phosphor gradient colors for ULTRATHINK prefix (all green, no cyan)
const PHOSPHOR_COLORS = [
    'green', 'green', 'green', // U, L, T
    'green', 'greenBright', 'greenBright', // R, A, T
    'greenBright', 'greenBright', 'greenBright', 'greenBright', // H, I, N, K
];
// Map color names to chalk functions
const COLOR_MAP = {
    green: (text) => chalk.green(text),
    greenBright: (text) => chalk.greenBright(text),
    cyan: (text) => chalk.cyan(text),
};
/**
 * Check if value starts with ultrathink prefix (case-insensitive, no colon required)
 */
function hasUltrathinkPrefix(value) {
    return value.toLowerCase().startsWith('ultrathink');
}
/**
 * Apply color to a character based on position in ultrathink prefix
 */
function colorizeChar(char, index, isCursor, hasPrefix) {
    // Apply ultrathink gradient color if within prefix (first 10 chars: "ultrathink")
    if (hasPrefix && index < 10) {
        const colorName = PHOSPHOR_COLORS[index] || 'greenBright';
        const colorFn = COLOR_MAP[colorName] || ((t) => t);
        const colored = colorFn(char);
        return isCursor ? chalk.inverse(colored) : colored;
    }
    // Regular character - just apply cursor if needed
    return isCursor ? chalk.inverse(char) : char;
}
export function ColorizedTextInput({ value: originalValue = '', placeholder = '', focus = true, mask, highlightPastedText = false, showCursor = true, onChange, onSubmit, }) {
    const [state, setState] = useState({
        cursorOffset: originalValue.length,
        cursorWidth: 0,
    });
    const { cursorOffset, cursorWidth } = state;
    // Keep cursor in bounds when value changes
    useEffect(() => {
        setState(previousState => {
            if (!focus || !showCursor) {
                return previousState;
            }
            const newValue = originalValue || '';
            if (previousState.cursorOffset > newValue.length - 1) {
                return {
                    cursorOffset: newValue.length,
                    cursorWidth: 0,
                };
            }
            return previousState;
        });
    }, [originalValue, focus, showCursor]);
    const cursorActualWidth = highlightPastedText ? cursorWidth : 0;
    const value = mask ? mask.repeat(originalValue.length) : originalValue;
    // Check for ultrathink prefix
    const hasPrefix = hasUltrathinkPrefix(originalValue);
    // Build rendered value with colors
    let renderedValue;
    let renderedPlaceholder = placeholder ? chalk.grey(placeholder) : undefined;
    if (showCursor && focus) {
        // Render placeholder with cursor
        renderedPlaceholder = placeholder.length > 0
            ? chalk.inverse(placeholder[0]) + chalk.grey(placeholder.slice(1))
            : chalk.inverse(' ');
        // Render value with colors and cursor
        renderedValue = value.length > 0 ? '' : chalk.inverse(' ');
        let i = 0;
        for (const char of value) {
            const isCursor = i >= cursorOffset - cursorActualWidth && i <= cursorOffset;
            renderedValue += colorizeChar(char, i, isCursor, hasPrefix);
            i++;
        }
        // Add cursor at end if needed
        if (value.length > 0 && cursorOffset === value.length) {
            renderedValue += chalk.inverse(' ');
        }
    }
    else {
        // No cursor - just colorize if prefix present
        if (hasPrefix && value.length > 0) {
            renderedValue = '';
            let i = 0;
            for (const char of value) {
                renderedValue += colorizeChar(char, i, false, hasPrefix);
                i++;
            }
        }
        else {
            renderedValue = value;
        }
    }
    // Handle keyboard input
    useInput((input, key) => {
        // Ignore navigation keys handled elsewhere
        if (key.upArrow || key.downArrow || (key.ctrl && input === 'c') ||
            key.tab || (key.shift && key.tab)) {
            return;
        }
        // Submit on Enter
        if (key.return) {
            if (onSubmit) {
                onSubmit(originalValue);
            }
            return;
        }
        let nextCursorOffset = cursorOffset;
        let nextValue = originalValue;
        let nextCursorWidth = 0;
        if (key.leftArrow) {
            if (showCursor) {
                nextCursorOffset--;
            }
        }
        else if (key.rightArrow) {
            if (showCursor) {
                nextCursorOffset++;
            }
        }
        else if (key.backspace || key.delete) {
            if (cursorOffset > 0) {
                nextValue = originalValue.slice(0, cursorOffset - 1) +
                    originalValue.slice(cursorOffset, originalValue.length);
                nextCursorOffset--;
            }
        }
        else {
            nextValue = originalValue.slice(0, cursorOffset) +
                input +
                originalValue.slice(cursorOffset, originalValue.length);
            nextCursorOffset += input.length;
            if (input.length > 1) {
                nextCursorWidth = input.length;
            }
        }
        // Keep cursor in bounds
        if (nextCursorOffset < 0) {
            nextCursorOffset = 0;
        }
        if (nextCursorOffset > nextValue.length) {
            nextCursorOffset = nextValue.length;
        }
        setState({
            cursorOffset: nextCursorOffset,
            cursorWidth: nextCursorWidth,
        });
        if (nextValue !== originalValue) {
            onChange(nextValue);
        }
    }, { isActive: focus });
    return (_jsx(Text, { children: placeholder
            ? value.length > 0
                ? renderedValue
                : renderedPlaceholder
            : renderedValue }));
}
export default ColorizedTextInput;
//# sourceMappingURL=ColorizedTextInput.js.map