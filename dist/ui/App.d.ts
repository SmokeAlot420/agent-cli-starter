/**
 * Loop Agent App Component
 * Main application composing all UI components
 */
import React from 'react';
import type { ConversationalAgentOptions, ConversationMessage } from '../conversation.js';
import type { SessionListItem } from '../types/index.js';
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
export declare const App: React.FC<AppProps>;
export default App;
//# sourceMappingURL=App.d.ts.map