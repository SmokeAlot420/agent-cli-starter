/**
 * useKeyboard Hook
 * Handle global keyboard shortcuts
 */
import { useRef, useEffect } from 'react';
import { useInput, useApp } from 'ink';
/**
 * Hook to handle global keyboard shortcuts
 */
export function useKeyboard(options = {}) {
    const { onExit, onClear, onInterrupt, onCycleMode, onToggleThinking, onShowSessions, enabled = true, isProcessing = false } = options;
    const { exit } = useApp();
    // Use ref to avoid stale closure - isProcessing may change between renders
    // but the useInput callback captures the initial value in its closure
    const isProcessingRef = useRef(isProcessing);
    useEffect(() => {
        isProcessingRef.current = isProcessing;
    }, [isProcessing]);
    useInput((input, key) => {
        // Ctrl+C - Exit
        if (key.ctrl && input === 'c') {
            if (onExit) {
                onExit();
            }
            exit();
            return;
        }
        // Ctrl+L - Clear
        if (key.ctrl && input === 'l') {
            if (onClear) {
                onClear();
            }
            return;
        }
        // Ctrl+D - Interrupt (always, no isProcessing check)
        if (key.ctrl && input === 'd') {
            if (onInterrupt) {
                onInterrupt();
            }
            return;
        }
        // Escape - Interrupt (always call, interrupt() handles "nothing to interrupt")
        // Panels have their own useInput with isActive, so they take priority
        if (key.escape) {
            if (onInterrupt) {
                onInterrupt();
            }
            return;
        }
        // Shift+Tab - Cycle permission mode
        if (key.shift && key.tab) {
            if (onCycleMode) {
                onCycleMode();
            }
            return;
        }
        // Ctrl+O - Toggle verbose thinking
        if (key.ctrl && input === 'o') {
            if (onToggleThinking) {
                onToggleThinking();
            }
            return;
        }
        // Ctrl+R - Show session picker
        if (key.ctrl && input === 'r') {
            if (onShowSessions) {
                onShowSessions();
            }
            return;
        }
    }, { isActive: enabled });
}
export default useKeyboard;
//# sourceMappingURL=useKeyboard.js.map