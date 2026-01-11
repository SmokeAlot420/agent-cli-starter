/**
 * useAgent Hook
 * React hook to manage ConversationalAgent state and streaming
 */
import { type ConversationMessage, type ConversationalAgentOptions, type PermissionMode, type CanUseToolCallback } from '../../conversation.js';
export interface UseAgentOptions extends ConversationalAgentOptions {
    /** Callback when context usage changes */
    onContextChange?: (usage: number) => void;
    /** Custom permission handler for interactive tool approval */
    canUseTool?: CanUseToolCallback;
    /** Callback when SDK creates/resumes session (receives session_id from system.init) */
    onSessionCreated?: (sessionId: string) => void;
    /** Callback when first user message is sent (to update session with initial prompt) */
    onFirstMessage?: (sessionId: string, prompt: string) => void;
    /** Callback when a message is received (for persistence) */
    onMessage?: (sessionId: string, message: ConversationMessage) => void;
    /** Initial messages to display (loaded from storage on resume) */
    initialMessages?: ConversationMessage[];
    /** Callback when a command action is received (e.g., showSessionPicker) */
    onAction?: (action: string, data?: Record<string, unknown>) => void;
    /** Callback to load messages for a session (for session picker resume) */
    onLoadMessages?: (sessionId: string) => ConversationMessage[];
}
export interface UseAgentReturn {
    /** Array of conversation messages */
    messages: ConversationMessage[];
    /** Whether currently processing a request */
    isProcessing: boolean;
    /** Estimated context usage (0-100) */
    contextUsage: number;
    /** Current permission mode */
    permissionMode: PermissionMode;
    /** Whether verbose thinking is shown */
    showThinking: boolean;
    /** Current model display name */
    modelName: string;
    /** Current session ID (from SDK's system.init) */
    sessionId: string | undefined;
    /** Send a message and stream response */
    sendMessage: (text: string) => Promise<void>;
    /** Interrupt current processing */
    interrupt: () => void;
    /** Clear conversation history */
    clearHistory: () => void;
    /** Cycle to next permission mode (Shift+Tab) */
    cyclePermissionMode: () => PermissionMode;
    /** Toggle verbose thinking display (Ctrl+O) */
    toggleShowThinking: () => boolean;
    /** Resume a different session (hot swap) */
    resumeSession: (sessionId: string) => void;
}
/**
 * Hook to manage ConversationalAgent state
 */
export declare function useAgent(options?: UseAgentOptions): UseAgentReturn;
export default useAgent;
//# sourceMappingURL=useAgent.d.ts.map