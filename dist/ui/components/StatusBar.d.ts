/**
 * StatusBar Component
 * Bottom bar showing context usage, state, and shortcuts
 */
import React from 'react';
export type ThinkingState = 'idle' | 'thinking' | 'tool_use';
export interface StatusBarProps {
    /** Context/token usage percentage (0-100) */
    contextUsage: number;
    /** Current thinking state */
    thinkingState: ThinkingState;
    /** Permission mode */
    permissionMode: 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan' | string;
    /** Whether verbose thinking display is on */
    showThinking?: boolean;
    /** Whether agent is currently processing */
    isProcessing?: boolean;
}
/**
 * StatusBar component for bottom of screen
 */
export declare const StatusBar: React.FC<StatusBarProps>;
export default StatusBar;
//# sourceMappingURL=StatusBar.d.ts.map