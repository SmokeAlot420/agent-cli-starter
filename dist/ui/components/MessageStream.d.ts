/**
 * MessageStream Component
 * Displays streaming conversation messages
 */
import React from 'react';
import type { ConversationMessage } from '../../conversation.js';
export interface MessageStreamProps {
    /** Array of messages to display */
    messages: ConversationMessage[];
    /** Whether currently streaming */
    streaming: boolean;
    /** Show tool usage in verbose mode */
    verbose?: boolean;
}
/**
 * MessageStream component for displaying conversation
 */
export declare const MessageStream: React.FC<MessageStreamProps>;
export default MessageStream;
//# sourceMappingURL=MessageStream.d.ts.map