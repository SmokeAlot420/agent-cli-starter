import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Loop Agent App Component
 * Main application composing all UI components
 */
import { useEffect, useMemo, useState } from 'react';
import { Box, useInput } from 'ink';
import { Header, StatusBar, ThinkingIndicator, MessageStream, InputPrompt, PermissionPrompt, SessionPicker, ConfigPanel } from './components/index.js';
import { useAgent, useThinking, useKeyboard, usePermission, useSessionPicker, useConfigPanel } from './hooks/index.js';
import { BrandingProvider } from './context/BrandingContext.js';
/**
 * Main App component
 */
export const App = ({ cwd, mode, branding, verbose, agentOptions = {}, initialPrompt, resumeSessionId, initialMessages, onSessionCreated, onFirstMessage, onMessage, onShowSessions, onSessionSelect, onLoadMessages }) => {
    // Track current permission mode for callback creation
    const [currentPermissionMode, setCurrentPermissionMode] = useState(agentOptions.permissionMode || 'acceptEdits');
    // Permission state (must be declared before useAgent to provide callback)
    const { pendingRequest, respond, createCanUseToolCallback } = usePermission();
    // Create permission callback based on current mode
    // Memoize to avoid unnecessary agent updates
    const canUseTool = useMemo(() => createCanUseToolCallback(currentPermissionMode), [createCanUseToolCallback, currentPermissionMode]);
    // Agent state (declared before session picker so resumeSession is available)
    const { messages, isProcessing, contextUsage, permissionMode, showThinking, sessionId: _sessionId, // Reserved for future use (e.g., display in Header)
    sendMessage, interrupt, clearHistory, cyclePermissionMode: agentCyclePermissionMode, toggleShowThinking, resumeSession } = useAgent({
        ...agentOptions,
        workingDirectory: cwd,
        verbose,
        canUseTool,
        // Session support: resume from CLI flag or onSessionCreated callback
        resume: resumeSessionId,
        initialMessages, // Previous messages to display on resume
        onSessionCreated,
        onFirstMessage,
        onMessage, // Save messages as they stream
        onLoadMessages, // Load messages for session picker resume
        // Handle command actions (e.g., showSessionPicker from /resume)
        onAction: (action, _data) => {
            if (action === 'showSessionPicker') {
                showSessionPicker();
            }
            else if (action === 'openConfig') {
                configPanel.open();
            }
            // Future: handle other actions like 'openMcpPanel', etc.
        }
    });
    // Session picker state (after useAgent so we can use resumeSession)
    const sessionPicker = useSessionPicker({
        onSelect: (session) => {
            // Hot swap to selected session
            resumeSession(session.id);
            // Also call external handler if provided
            if (onSessionSelect) {
                onSessionSelect(session);
            }
        },
        onNew: () => {
            // Close picker and let user type in input
            sessionPicker.close();
        }
    });
    // Config panel state
    const configPanel = useConfigPanel({
        cwd,
        sessionId: _sessionId,
        model: agentOptions?.model || 'opus',
        thinkingEnabled: showThinking,
        verbose,
        permissionMode: permissionMode,
        contextPercent: contextUsage
    });
    // Show session picker (Ctrl+R or /resume command action)
    const showSessionPicker = () => {
        if (onShowSessions) {
            const sessions = onShowSessions();
            sessionPicker.open(sessions);
        }
    };
    // Wrap cyclePermissionMode to update our local state too
    const cyclePermissionMode = () => {
        const newMode = agentCyclePermissionMode();
        setCurrentPermissionMode(newMode);
        return newMode;
    };
    // Thinking state
    const { isThinking, currentTool, elapsed, startThinking, stopThinking, setTool } = useThinking();
    // Keyboard shortcuts (Escape to interrupt only when no panels are open)
    const panelsOpen = sessionPicker.isOpen || configPanel.isOpen;
    useKeyboard({
        onClear: clearHistory,
        onInterrupt: interrupt,
        onCycleMode: cyclePermissionMode,
        onToggleThinking: toggleShowThinking,
        onShowSessions: showSessionPicker,
        enabled: true,
        isProcessing: isProcessing && !panelsOpen // Escape interrupts only when processing and no panels open
    });
    // Session picker keyboard navigation
    // This handles arrow keys, Enter, Esc when picker is open
    useInput((input, key) => {
        if (!sessionPicker.isOpen)
            return;
        if (key.downArrow) {
            sessionPicker.selectNext();
        }
        else if (key.upArrow) {
            sessionPicker.selectPrev();
        }
        else if (key.return) {
            sessionPicker.confirmSelection();
        }
        else if (key.escape) {
            sessionPicker.close();
        }
        else if (input.toLowerCase() === 'n') {
            sessionPicker.requestNew();
        }
        // Future: 'd' for delete, '/' for search mode
    }, { isActive: sessionPicker.isOpen });
    // Config panel keyboard navigation
    // This is handled by the ConfigPanel component itself via useInput
    // Sync thinking state with processing
    useEffect(() => {
        if (isProcessing && !isThinking) {
            startThinking();
        }
        else if (!isProcessing && isThinking) {
            stopThinking();
        }
    }, [isProcessing, isThinking, startThinking, stopThinking]);
    // Update tool from messages
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.type === 'tool_use' && lastMessage.metadata?.tool) {
            setTool(lastMessage.metadata.tool);
        }
        else if (lastMessage?.type !== 'tool_use') {
            setTool(null);
        }
    }, [messages, setTool]);
    // Run initial prompt in oneshot mode
    useEffect(() => {
        if (mode === 'oneshot' && initialPrompt) {
            sendMessage(initialPrompt);
        }
        // Intentionally only run once on mount with initial prompt
    }, []);
    // Determine thinking state for status bar
    const thinkingState = isProcessing
        ? (currentTool ? 'tool_use' : 'thinking')
        : 'idle';
    return (_jsx(BrandingProvider, { branding: branding, children: _jsxs(Box, { flexDirection: "column", minHeight: 20, children: [_jsx(Header, { cwd: cwd, mode: mode, verbose: verbose }), _jsx(Box, { flexDirection: "column", flexGrow: 1, minHeight: 10, children: _jsx(MessageStream, { messages: messages, streaming: isProcessing, verbose: verbose }) }), _jsx(ThinkingIndicator, { active: isThinking, tool: currentTool ?? undefined, elapsed: elapsed }), pendingRequest && (_jsx(PermissionPrompt, { request: pendingRequest, onRespond: respond })), sessionPicker.isOpen && (_jsx(SessionPicker, { sessions: sessionPicker.filteredSessions, selectedIndex: sessionPicker.selectedIndex, filter: sessionPicker.filter })), configPanel.isOpen && (_jsx(ConfigPanel, { activeTab: configPanel.activeTab, status: configPanel.status, settings: configPanel.settings, usage: configPanel.usage, onClose: configPanel.close, onNextTab: configPanel.nextTab, onPrevTab: configPanel.prevTab, onSetTab: configPanel.setTab })), mode === 'interactive' && !pendingRequest && !sessionPicker.isOpen && !configPanel.isOpen && (_jsx(InputPrompt, { onSubmit: sendMessage, disabled: isProcessing, placeholder: "Ask me anything..." })), _jsx(StatusBar, { contextUsage: contextUsage, thinkingState: thinkingState, permissionMode: permissionMode, showThinking: showThinking, isProcessing: isProcessing })] }) }));
};
export default App;
//# sourceMappingURL=App.js.map