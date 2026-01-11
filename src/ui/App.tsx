/**
 * Loop Agent App Component
 * Main application composing all UI components
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Box, useInput } from 'ink';

import {
  Header,
  StatusBar,
  ThinkingIndicator,
  MessageStream,
  InputPrompt,
  PermissionPrompt,
  SessionPicker,
  ConfigPanel,
  McpPanel,
  ModelSelector,
  MemoryEditor,
  HelpPanel,
  type ThinkingState
} from './components/index.js';
import {
  useAgent,
  useThinking,
  useKeyboard,
  usePermission,
  useSessionPicker,
  useConfigPanel,
  useMcpPanel,
  useModelSelector,
  useMemoryEditor,
  useHelpPanel
} from './hooks/index.js';
import type { ConversationalAgentOptions, PermissionMode, ConversationMessage } from '../conversation.js';
import type { McpServersConfig } from '../features/mcp.js';
import type { SessionListItem } from '../types/index.js';
import { BrandingProvider } from './context/BrandingContext.js';
import type { BrandingConfig } from '../branding.js';

export interface AppProps {
  /** Working directory for file operations */
  cwd: string;
  /** Operating mode */
  mode: 'interactive' | 'oneshot';
  /** Custom branding configuration (optional, defaults to template branding) */
  branding?: BrandingConfig;
  /** Whether to show verbose output */
  verbose: boolean;
  /** Agent options */
  agentOptions?: ConversationalAgentOptions;
  /** Initial prompt (for oneshot mode) */
  initialPrompt?: string;
  /** Session ID to resume (from CLI --resume flag) */
  resumeSessionId?: string;
  /** Previous messages to display on resume */
  initialMessages?: ConversationMessage[];
  /** Callback when SDK creates session (to store in SessionService) */
  onSessionCreated?: (sessionId: string) => void;
  /** Callback when first user message is sent (to update session with initial prompt) */
  onFirstMessage?: (sessionId: string, prompt: string) => void;
  /** Callback when a message is received (to save for persistence) */
  onMessage?: (sessionId: string, message: ConversationMessage) => void;
  /** Callback to show session picker (loads sessions from SessionService) */
  onShowSessions?: () => SessionListItem[];
  /** Callback when session is selected from picker (external handler, if any) */
  onSessionSelect?: (session: SessionListItem) => void;
  /** Callback to load messages for a session (for session picker resume) */
  onLoadMessages?: (sessionId: string) => ConversationMessage[];
}

/**
 * Main App component
 */
export const App: React.FC<AppProps> = ({
  cwd,
  mode,
  branding,
  verbose,
  agentOptions = {},
  initialPrompt,
  resumeSessionId,
  initialMessages,
  onSessionCreated,
  onFirstMessage,
  onMessage,
  onShowSessions,
  onSessionSelect,
  onLoadMessages
}) => {
  // Track current permission mode for callback creation
  const [currentPermissionMode, setCurrentPermissionMode] = useState<PermissionMode>(
    agentOptions.permissionMode || 'acceptEdits'
  );

  // Permission state (must be declared before useAgent to provide callback)
  const {
    pendingRequest,
    respond,
    createCanUseToolCallback
  } = usePermission();

  // Create permission callback based on current mode
  // Memoize to avoid unnecessary agent updates
  const canUseTool = useMemo(
    () => createCanUseToolCallback(currentPermissionMode),
    [createCanUseToolCallback, currentPermissionMode]
  );

  // Agent state (declared before session picker so resumeSession is available)
  const {
    messages,
    isProcessing,
    contextUsage,
    permissionMode,
    showThinking,
    sessionId: _sessionId, // Reserved for future use (e.g., display in Header)
    sendMessage,
    interrupt,
    clearHistory,
    cyclePermissionMode: agentCyclePermissionMode,
    toggleShowThinking,
    resumeSession
  } = useAgent({
    ...agentOptions,
    workingDirectory: cwd,
    verbose,
    canUseTool,
    // Session support: resume from CLI flag or onSessionCreated callback
    resume: resumeSessionId,
    initialMessages,  // Previous messages to display on resume
    onSessionCreated,
    onFirstMessage,
    onMessage,  // Save messages as they stream
    onLoadMessages,  // Load messages for session picker resume
    // Handle command actions (e.g., showSessionPicker from /resume)
    onAction: (action: string, data?: Record<string, unknown>) => {
      if (action === 'showSessionPicker') {
        showSessionPicker();
      } else if (action === 'openConfig') {
        configPanel.open();
      } else if (action === 'openMcp') {
        // Open MCP panel with current servers
        const servers = (data?.servers as McpServersConfig) || {};
        mcpPanel.open(servers);
      } else if (action === 'openModelSelector') {
        modelSelector.open();
      } else if (action === 'openMemory') {
        memoryEditor.open();
      } else if (action === 'openHelp') {
        helpPanel.open();
      }
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

  // Wrap cyclePermissionMode to update our local state too
  const cyclePermissionMode = () => {
    const newMode = agentCyclePermissionMode();
    setCurrentPermissionMode(newMode);
    return newMode;
  };

  // Config panel state
  const configPanel = useConfigPanel({
    cwd,
    sessionId: _sessionId,
    model: agentOptions?.model || 'opus',
    thinkingEnabled: showThinking,
    verbose,
    permissionMode: permissionMode,
    contextPercent: contextUsage,
    // Editable setting callbacks
    onChangeModel: () => {
      configPanel.close();
      modelSelector.open();
    },
    onToggleThinking: toggleShowThinking,
    onCyclePermission: cyclePermissionMode
    // Note: verbose toggle would need to be added to useAgent if needed
  });

  // MCP panel state
  const mcpPanel = useMcpPanel();

  // Model selector state
  const modelSelector = useModelSelector({
    currentModel: agentOptions?.model || 'opus',
    onSelect: (model) => {
      // Send /model command to change the model
      sendMessage(`/model ${model}`);
    }
  });

  // Memory editor state
  const memoryEditor = useMemoryEditor({ cwd });

  // Help panel state
  const helpPanel = useHelpPanel();

  // Show session picker (Ctrl+R or /resume command action)
  const showSessionPicker = () => {
    if (onShowSessions) {
      const sessions = onShowSessions();
      sessionPicker.open(sessions);
    }
  };

  // Thinking state
  const {
    isThinking,
    currentTool,
    elapsed,
    startThinking,
    stopThinking,
    setTool
  } = useThinking();

  // Keyboard shortcuts (Escape to interrupt only when no panels are open)
  const panelsOpen = sessionPicker.isOpen || configPanel.isOpen || mcpPanel.isOpen || modelSelector.isOpen || memoryEditor.isOpen || helpPanel.isOpen;
  useKeyboard({
    onClear: clearHistory,
    onInterrupt: interrupt,
    onCycleMode: cyclePermissionMode,
    onToggleThinking: toggleShowThinking,
    onShowSessions: showSessionPicker,
    enabled: true,
    isProcessing: isProcessing && !panelsOpen  // Escape interrupts only when processing and no panels open
  });

  // Session picker keyboard navigation
  // This handles arrow keys, Enter, Esc when picker is open
  useInput(
    (input, key) => {
      if (!sessionPicker.isOpen) return;

      if (key.downArrow) {
        sessionPicker.selectNext();
      } else if (key.upArrow) {
        sessionPicker.selectPrev();
      } else if (key.return) {
        sessionPicker.confirmSelection();
      } else if (key.escape) {
        sessionPicker.close();
      } else if (input.toLowerCase() === 'n') {
        sessionPicker.requestNew();
      }
      // Future: 'd' for delete, '/' for search mode
    },
    { isActive: sessionPicker.isOpen }
  );

  // Config panel keyboard navigation
  // This is handled by the ConfigPanel component itself via useInput

  // Sync thinking state with processing
  useEffect(() => {
    if (isProcessing && !isThinking) {
      startThinking();
    } else if (!isProcessing && isThinking) {
      stopThinking();
    }
  }, [isProcessing, isThinking, startThinking, stopThinking]);

  // Update tool from messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.type === 'tool_use' && lastMessage.metadata?.tool) {
      setTool(lastMessage.metadata.tool as string);
    } else if (lastMessage?.type !== 'tool_use') {
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
  const thinkingState: ThinkingState = isProcessing
    ? (currentTool ? 'tool_use' : 'thinking')
    : 'idle';

  return (
    <BrandingProvider branding={branding}>
      <Box flexDirection="column" minHeight={20}>
        {/* Header with branding */}
        <Header cwd={cwd} mode={mode} verbose={verbose} />

      {/* Message stream area */}
      <Box flexDirection="column" flexGrow={1} minHeight={10}>
        <MessageStream
          messages={messages}
          streaming={isProcessing}
          verbose={verbose}
        />
      </Box>

      {/* Thinking indicator when active */}
      <ThinkingIndicator
        active={isThinking}
        tool={currentTool ?? undefined}
        elapsed={elapsed}
      />

      {/* Permission prompt when awaiting user approval */}
      {pendingRequest && (
        <PermissionPrompt
          request={pendingRequest}
          onRespond={respond}
        />
      )}

      {/* Session picker when open (Ctrl+R or /resume) */}
      {sessionPicker.isOpen && (
        <SessionPicker
          sessions={sessionPicker.filteredSessions}
          selectedIndex={sessionPicker.selectedIndex}
          filter={sessionPicker.filter}
        />
      )}

      {/* Config panel when open (/config) */}
      {configPanel.isOpen && (
        <ConfigPanel
          activeTab={configPanel.activeTab}
          status={configPanel.status}
          settings={configPanel.settings}
          usage={configPanel.usage}
          selectedSettingIndex={configPanel.selectedSettingIndex}
          onClose={configPanel.close}
          onNextTab={configPanel.nextTab}
          onPrevTab={configPanel.prevTab}
          onSetTab={configPanel.setTab}
          onSelectNextSetting={configPanel.selectNextSetting}
          onSelectPrevSetting={configPanel.selectPrevSetting}
          onActivateSetting={configPanel.activateSetting}
        />
      )}

      {/* MCP panel when open (/mcp) */}
      {mcpPanel.isOpen && (
        <McpPanel
          servers={mcpPanel.servers}
          onClose={mcpPanel.close}
        />
      )}

      {/* Model selector when open (/model) */}
      {modelSelector.isOpen && (
        <ModelSelector
          currentModel={modelSelector.currentModel}
          onSelect={modelSelector.selectModel}
          onClose={modelSelector.close}
        />
      )}

      {/* Memory editor when open (/memory) */}
      {memoryEditor.isOpen && (
        <MemoryEditor
          files={memoryEditor.files}
          selectedIndex={memoryEditor.selectedIndex}
          onSelectNext={memoryEditor.selectNext}
          onSelectPrev={memoryEditor.selectPrev}
          onEdit={(file) => {
            // Open the file in external editor or show content
            // For now, just send a message to read/edit the file
            memoryEditor.close();
            sendMessage(`Please help me edit ${file.path}`);
          }}
          onClose={memoryEditor.close}
        />
      )}

      {/* Help panel when open (/help) */}
      {helpPanel.isOpen && (
        <HelpPanel
          activeTab={helpPanel.activeTab}
          onClose={helpPanel.close}
          onNextTab={helpPanel.nextTab}
          onPrevTab={helpPanel.prevTab}
        />
      )}

      {/* Input prompt (only in interactive mode, hidden during panels) */}
      {mode === 'interactive' && !pendingRequest && !panelsOpen && (
        <InputPrompt
          onSubmit={sendMessage}
          disabled={isProcessing}
          placeholder="Ask me anything..."
        />
      )}

      {/* Status bar */}
      <StatusBar
        contextUsage={contextUsage}
        thinkingState={thinkingState}
        permissionMode={permissionMode}
        showThinking={showThinking}
        isProcessing={isProcessing}
      />
      </Box>
    </BrandingProvider>
  );
};

export default App;
