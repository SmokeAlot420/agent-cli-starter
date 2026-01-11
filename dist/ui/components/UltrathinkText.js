import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Text } from 'ink';
/**
 * Phosphor gradient colors for each letter position
 * Creates a dark green -> bright green -> cyan glow effect
 */
const PHOSPHOR_COLORS = [
    'green', // U
    'green', // L
    'green', // T
    'greenBright', // R
    'greenBright', // A
    'greenBright', // T
    'cyan', // H
    'cyan', // I
    'cyan', // N
    'cyan', // K
];
const ULTRATHINK_LETTERS = 'ULTRATHINK'.split('');
/**
 * Renders "ULTRATHINK" with terminal phosphor gradient
 *
 * @example
 * ```tsx
 * <UltrathinkText />
 * // Renders: ULTRATHINK with green->cyan gradient
 *
 * <UltrathinkText bold />
 * // Renders: ULTRATHINK bold with gradient
 * ```
 */
export function UltrathinkText({ bold = false }) {
    return (_jsx(_Fragment, { children: ULTRATHINK_LETTERS.map((letter, index) => (_jsx(Text, { color: PHOSPHOR_COLORS[index], bold: bold, children: letter }, index))) }));
}
export default UltrathinkText;
//# sourceMappingURL=UltrathinkText.js.map