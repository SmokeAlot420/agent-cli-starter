/**
 * InputPrompt Component
 * Rich text input with styled prompt and slash command autocomplete
 */
import React from 'react';
export interface InputPromptProps {
    /** Callback when user submits input */
    onSubmit: (value: string) => void;
    /** Whether input is disabled (e.g., during processing) */
    disabled: boolean;
    /** Placeholder text when empty */
    placeholder?: string;
}
/**
 * InputPrompt with styled prompt character and slash command autocomplete
 *
 * Features:
 * - Type `/` to open command autocomplete
 * - Filter commands as you type
 * - Up/Down arrows to navigate
 * - Tab/Enter to select command
 * - Escape to close autocomplete
 */
export declare const InputPrompt: React.FC<InputPromptProps>;
export default InputPrompt;
//# sourceMappingURL=InputPrompt.d.ts.map