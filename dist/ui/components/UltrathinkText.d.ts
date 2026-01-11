/**
 * UltrathinkText Component
 *
 * Renders "ULTRATHINK" with a terminal phosphor gradient effect.
 * Colors flow from forest green -> bright green -> cyan
 * mimicking old-school CRT monitor glow aesthetics.
 */
import React from 'react';
/** Props for UltrathinkText component */
export interface UltrathinkTextProps {
    /** Whether to render in bold */
    bold?: boolean;
}
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
export declare function UltrathinkText({ bold }: UltrathinkTextProps): React.ReactElement;
export default UltrathinkText;
//# sourceMappingURL=UltrathinkText.d.ts.map