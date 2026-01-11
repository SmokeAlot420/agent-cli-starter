/**
 * useKeyboard Hook
 * Handle global keyboard shortcuts
 */
export interface UseKeyboardOptions {
    /** Callback when user requests exit (Ctrl+C) */
    onExit?: () => void;
    /** Callback when user requests clear (Ctrl+L) */
    onClear?: () => void;
    /** Callback when user requests interrupt (Ctrl+D or Escape when processing) */
    onInterrupt?: () => void;
    /** Callback when user cycles permission mode (Shift+Tab) */
    onCycleMode?: () => void;
    /** Callback when user toggles verbose thinking (Ctrl+O) */
    onToggleThinking?: () => void;
    /** Callback when user shows session picker (Ctrl+R) */
    onShowSessions?: () => void;
    /** Whether to enable keyboard handling */
    enabled?: boolean;
    /** Whether agent is currently processing (enables Escape to interrupt) */
    isProcessing?: boolean;
}
/**
 * Hook to handle global keyboard shortcuts
 */
export declare function useKeyboard(options?: UseKeyboardOptions): void;
export default useKeyboard;
//# sourceMappingURL=useKeyboard.d.ts.map