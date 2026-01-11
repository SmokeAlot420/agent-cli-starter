/**
 * useAgent Hook
 * React hook to manage ConversationalAgent state and streaming
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { ConversationalAgent } from '../../conversation.js';
/**
 * Estimate context usage from message count and content length
 * This is a rough approximation - real usage would need API token counting
 */
function estimateContextUsage(messages) {
    // Rough estimate: 4 chars per token, 200K token context window
    const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    const estimatedTokens = totalChars / 4;
    const contextWindow = 200000; // 200K context
    const usage = Math.min(100, Math.round((estimatedTokens / contextWindow) * 100));
    return usage;
}
/**
 * Hook to manage ConversationalAgent state
 */
export function useAgent(options = {}) {
    // Destructure new options
    const { onContextChange, canUseTool, onSessionCreated, onFirstMessage, onMessage, initialMessages, onAction, onLoadMessages, ...agentOptions } = options;
    // Initialize messages with any previously loaded messages (for session resume)
    const [messages, setMessages] = useState(initialMessages || []);
    const [isProcessing, setIsProcessing] = useState(false);
    const [contextUsage, setContextUsage] = useState(0);
    const [permissionMode, setPermissionMode] = useState('acceptEdits');
    const [showThinking, setShowThinking] = useState(false);
    const [modelName, setModelName] = useState('Opus 4.5');
    const [sessionId, setSessionId] = useState(undefined);
    const agentRef = useRef(null);
    // Store callbacks in refs to avoid stale closures
    // This is critical - the empty dependency array means callbacks would otherwise be stale
    const onSessionCreatedRef = useRef(onSessionCreated);
    const onFirstMessageRef = useRef(onFirstMessage);
    const onMessageRef = useRef(onMessage);
    const onActionRef = useRef(onAction);
    const onLoadMessagesRef = useRef(onLoadMessages);
    // Keep refs updated when callbacks change
    useEffect(() => {
        onSessionCreatedRef.current = onSessionCreated;
        onFirstMessageRef.current = onFirstMessage;
        onMessageRef.current = onMessage;
        onActionRef.current = onAction;
        onLoadMessagesRef.current = onLoadMessages;
    }, [onSessionCreated, onFirstMessage, onMessage, onAction, onLoadMessages]);
    // Initialize agent on mount (or when canUseTool changes)
    useEffect(() => {
        agentRef.current = new ConversationalAgent({
            ...agentOptions,
            canUseTool,
            // Pass session callback - SDK will call this with session_id from system.init
            // Using refs to avoid stale closures since this effect only runs once
            onSessionCreated: (newSessionId) => {
                setSessionId(newSessionId);
                if (onSessionCreatedRef.current) {
                    onSessionCreatedRef.current(newSessionId);
                }
            },
            // Pass first message callback to update session with initial prompt
            onFirstMessage: (sid, prompt) => {
                if (onFirstMessageRef.current) {
                    onFirstMessageRef.current(sid, prompt);
                }
            }
        });
        // Sync initial state from agent
        if (agentRef.current) {
            setPermissionMode(agentRef.current.getPermissionMode());
            setShowThinking(agentRef.current.isShowThinking());
            setModelName(agentRef.current.getModelDisplayName());
            // Sync session ID if agent already has one (e.g., from resume)
            const existingSessionId = agentRef.current.getSessionId();
            if (existingSessionId) {
                setSessionId(existingSessionId);
            }
        }
        return () => {
            if (agentRef.current) {
                agentRef.current.close();
                agentRef.current = null;
            }
        };
        // Intentionally only run on mount - agent is created once
    }, []);
    // Update canUseTool when the callback changes (e.g., permission mode cycling)
    useEffect(() => {
        if (agentRef.current && canUseTool) {
            agentRef.current.updateOptions({ canUseTool });
        }
    }, [canUseTool]);
    // Update context usage when messages change
    useEffect(() => {
        const usage = estimateContextUsage(messages);
        setContextUsage(usage);
        if (onContextChange) {
            onContextChange(usage);
        }
    }, [messages, onContextChange]);
    // Store sessionId in a ref for use in sendMessage without causing re-renders
    const sessionIdRef = useRef(sessionId);
    useEffect(() => {
        sessionIdRef.current = sessionId;
    }, [sessionId]);
    /**
     * Send a message and stream the response
     */
    const sendMessage = useCallback(async (text) => {
        if (!agentRef.current || isProcessing) {
            return;
        }
        setIsProcessing(true);
        // Add user message to chat display BEFORE streaming response
        const userMessage = { type: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        // Save user message to persistent storage
        if (sessionIdRef.current && onMessageRef.current) {
            onMessageRef.current(sessionIdRef.current, userMessage);
        }
        try {
            // Stream response chunks
            for await (const chunk of agentRef.current.chat(text)) {
                // Check for command actions (e.g., showSessionPicker from /resume)
                if (chunk.metadata?.action && onActionRef.current) {
                    onActionRef.current(chunk.metadata.action, chunk.metadata);
                }
                setMessages(prev => [...prev, chunk]);
                // Save each message to persistent storage
                if (sessionIdRef.current && onMessageRef.current) {
                    onMessageRef.current(sessionIdRef.current, chunk);
                }
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorChunk = {
                type: 'error',
                content: `Error: ${errorMessage}`
            };
            setMessages(prev => [...prev, errorChunk]);
            // Save error to persistent storage
            if (sessionIdRef.current && onMessageRef.current) {
                onMessageRef.current(sessionIdRef.current, errorChunk);
            }
        }
        finally {
            setIsProcessing(false);
        }
    }, [isProcessing]);
    /**
     * Interrupt current processing
     */
    const interrupt = useCallback(() => {
        if (agentRef.current) {
            agentRef.current.interrupt().catch(() => {
                // Interrupt errors are expected when there's nothing to interrupt
            });
        }
    }, []);
    /**
     * Clear conversation history
     */
    const clearHistory = useCallback(() => {
        setMessages([]);
        if (agentRef.current) {
            agentRef.current.clearHistory();
        }
    }, []);
    /**
     * Cycle permission mode (Shift+Tab)
     */
    const cyclePermissionMode = useCallback(() => {
        if (agentRef.current) {
            const newMode = agentRef.current.cyclePermissionMode();
            setPermissionMode(newMode);
            return newMode;
        }
        return permissionMode;
    }, [permissionMode]);
    /**
     * Toggle verbose thinking display (Ctrl+O)
     */
    const toggleShowThinking = useCallback(() => {
        if (agentRef.current) {
            const newState = agentRef.current.toggleShowThinking();
            setShowThinking(newState);
            return newState;
        }
        const newState = !showThinking;
        setShowThinking(newState);
        return newState;
    }, [showThinking]);
    /**
     * Resume a different session (hot swap from session picker)
     */
    const resumeSession = useCallback((newSessionId) => {
        // 1. Close current agent
        if (agentRef.current) {
            agentRef.current.close();
            agentRef.current = null;
        }
        // 2. Load messages for new session
        const loadedMessages = onLoadMessagesRef.current?.(newSessionId) || [];
        setMessages(loadedMessages);
        setSessionId(newSessionId);
        // 3. Create new agent with resume option
        agentRef.current = new ConversationalAgent({
            ...agentOptions,
            resume: newSessionId,
            canUseTool,
            onSessionCreated: (sid) => {
                setSessionId(sid);
                if (onSessionCreatedRef.current) {
                    onSessionCreatedRef.current(sid);
                }
            },
            onFirstMessage: (sid, prompt) => {
                if (onFirstMessageRef.current) {
                    onFirstMessageRef.current(sid, prompt);
                }
            }
        });
        // 4. Sync state from new agent
        if (agentRef.current) {
            setPermissionMode(agentRef.current.getPermissionMode());
            setShowThinking(agentRef.current.isShowThinking());
            setModelName(agentRef.current.getModelDisplayName());
        }
    }, [agentOptions, canUseTool]);
    return {
        messages,
        isProcessing,
        contextUsage,
        permissionMode,
        showThinking,
        modelName,
        sessionId,
        sendMessage,
        interrupt,
        clearHistory,
        cyclePermissionMode,
        toggleShowThinking,
        resumeSession
    };
}
export default useAgent;
//# sourceMappingURL=useAgent.js.map