/**
 * useKeyboard Hook
 * Handle global keyboard shortcuts
 */

import { useInput, useApp } from 'ink';

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
export function useKeyboard(options: UseKeyboardOptions = {}): void {
  const {
    onExit,
    onClear,
    onInterrupt,
    onCycleMode,
    onToggleThinking,
    onShowSessions,
    enabled = true
  } = options;
  const { exit } = useApp();

  useInput(
    (input, key) => {
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
    },
    { isActive: enabled }
  );
}

export default useKeyboard;
