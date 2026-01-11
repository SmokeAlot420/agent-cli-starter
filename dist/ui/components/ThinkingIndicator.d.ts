/**
 * ThinkingIndicator Component
 * Animated spinner with elapsed time and tool name
 */
import React from 'react';
export interface ThinkingIndicatorProps {
    /** Whether thinking is active */
    active: boolean;
    /** Current tool being used (if any) */
    tool?: string;
    /** Elapsed time in seconds */
    elapsed: number;
}
/**
 * ThinkingIndicator with animated spinner
 */
export declare const ThinkingIndicator: React.FC<ThinkingIndicatorProps>;
export default ThinkingIndicator;
//# sourceMappingURL=ThinkingIndicator.d.ts.map