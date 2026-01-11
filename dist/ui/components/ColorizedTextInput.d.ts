/**
 * ColorizedTextInput Component
 *
 * Custom text input that supports per-character coloring.
 * Detects "ultrathink:" prefix and applies phosphor gradient.
 * Based on ink-text-input source.
 */
import React from 'react';
export interface ColorizedTextInputProps {
    /** Current input value (controlled) */
    value: string;
    /** Placeholder when empty */
    placeholder?: string;
    /** Whether input is focused */
    focus?: boolean;
    /** Mask character for passwords */
    mask?: string;
    /** Highlight pasted text */
    highlightPastedText?: boolean;
    /** Show cursor */
    showCursor?: boolean;
    /** Called when value changes */
    onChange: (value: string) => void;
    /** Called on Enter */
    onSubmit?: (value: string) => void;
}
export declare function ColorizedTextInput({ value: originalValue, placeholder, focus, mask, highlightPastedText, showCursor, onChange, onSubmit, }: ColorizedTextInputProps): React.ReactElement;
export default ColorizedTextInput;
//# sourceMappingURL=ColorizedTextInput.d.ts.map