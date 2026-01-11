/**
 * usePermission Hook
 *
 * Manages interactive permission prompts for dangerous tool executions.
 * Uses Promise-based async waiting to pause the agent until user responds.
 */
import { useState, useCallback, useRef } from 'react';
/** Tools that require permission prompts */
const DANGEROUS_TOOLS = ['Bash', 'Write', 'Edit', 'NotebookEdit'];
/**
 * Hook for managing interactive permission prompts.
 *
 * Key features:
 * - Promise-based waiting (pauses agent until user responds)
 * - Session memory for "Always Allow" decisions
 * - Respects permission mode settings
 *
 * @example
 * ```tsx
 * const { pendingRequest, respond, createCanUseToolCallback } = usePermission();
 * const canUseTool = createCanUseToolCallback(permissionMode);
 *
 * // Pass canUseTool to agent options
 * // Render PermissionPrompt when pendingRequest is set
 * ```
 */
export function usePermission() {
    const [pendingRequest, setPendingRequest] = useState(null);
    const [alwaysAllowedTools, setAlwaysAllowedTools] = useState(new Set());
    // Store Promise resolver for async waiting
    const resolverRef = useRef(null);
    /**
     * Check if a tool is in the always-allowed set
     */
    const isAlwaysAllowed = useCallback((toolName) => {
        return alwaysAllowedTools.has(toolName);
    }, [alwaysAllowedTools]);
    /**
     * Handle user response to permission prompt
     */
    const respond = useCallback((response) => {
        if (!resolverRef.current || !pendingRequest)
            return;
        if (response === 'allow') {
            // Allow this once
            resolverRef.current({
                behavior: 'allow',
                updatedInput: pendingRequest.toolInput
            });
        }
        else if (response === 'always') {
            // Add to always-allowed set and allow
            setAlwaysAllowedTools(prev => new Set([...prev, pendingRequest.toolName]));
            resolverRef.current({
                behavior: 'allow',
                updatedInput: pendingRequest.toolInput
            });
        }
        else {
            // Deny with message
            resolverRef.current({
                behavior: 'deny',
                message: 'User denied permission',
                interrupt: false
            });
        }
        // Clear state
        resolverRef.current = null;
        setPendingRequest(null);
    }, [pendingRequest]);
    /**
     * Create a canUseTool callback that respects permission mode
     */
    const createCanUseToolCallback = useCallback((permissionMode) => {
        return async (toolName, input, options) => {
            // Bypass mode - allow all tools without prompting
            if (permissionMode === 'bypassPermissions') {
                return { behavior: 'allow', updatedInput: input };
            }
            // Accept edits mode - allow file operations without prompting
            if (permissionMode === 'acceptEdits') {
                if (['Write', 'Edit', 'NotebookEdit'].includes(toolName)) {
                    return { behavior: 'allow', updatedInput: input };
                }
            }
            // Check if tool is in always-allowed set
            if (alwaysAllowedTools.has(toolName)) {
                return { behavior: 'allow', updatedInput: input };
            }
            // Non-dangerous tools - allow without prompting
            if (!DANGEROUS_TOOLS.includes(toolName)) {
                return { behavior: 'allow', updatedInput: input };
            }
            // Dangerous tool in default/acceptEdits mode - show prompt and wait
            return new Promise(resolve => {
                resolverRef.current = resolve;
                setPendingRequest({
                    toolName,
                    toolInput: input,
                    toolUseID: options.toolUseID,
                    decisionReason: options.decisionReason
                });
            });
        };
    }, [alwaysAllowedTools]);
    return {
        pendingRequest,
        alwaysAllowedTools,
        respond,
        isAlwaysAllowed,
        createCanUseToolCallback
    };
}
//# sourceMappingURL=usePermission.js.map