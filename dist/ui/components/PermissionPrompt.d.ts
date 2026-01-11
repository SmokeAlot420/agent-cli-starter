/**
 * PermissionPrompt Component
 *
 * Displays an interactive permission prompt for dangerous tool executions.
 * User can press Y (allow once), A (always allow), or N (deny).
 */
import React from 'react';
import type { PermissionRequest, PermissionResponse } from '../hooks/usePermission.js';
/** Props for PermissionPrompt component */
export interface PermissionPromptProps {
    /** The pending permission request */
    request: PermissionRequest;
    /** Callback when user responds */
    onRespond: (response: PermissionResponse) => void;
}
/**
 * Interactive permission prompt component
 *
 * @example
 * ```tsx
 * {pendingRequest && (
 *   <PermissionPrompt
 *     request={pendingRequest}
 *     onRespond={respond}
 *   />
 * )}
 * ```
 */
export declare function PermissionPrompt({ request, onRespond }: PermissionPromptProps): React.ReactElement;
//# sourceMappingURL=PermissionPrompt.d.ts.map