/**
 * usePermission Hook
 *
 * Manages interactive permission prompts for dangerous tool executions.
 * Uses Promise-based async waiting to pause the agent until user responds.
 */
import type { PermissionMode, PermissionResult } from '../../conversation/types.js';
/** Permission request from SDK canUseTool callback */
export interface PermissionRequest {
    toolName: string;
    toolInput: Record<string, unknown>;
    toolUseID: string;
    decisionReason?: string;
}
/** User response to permission prompt */
export type PermissionResponse = 'allow' | 'always' | 'deny';
/** Return type for usePermission hook */
export interface UsePermissionReturn {
    /** Current pending permission request (null if none) */
    pendingRequest: PermissionRequest | null;
    /** Set of tools that have been "Always Allowed" this session */
    alwaysAllowedTools: ReadonlySet<string>;
    /** Handle user response to permission prompt */
    respond: (response: PermissionResponse) => void;
    /** Check if a tool is already always-allowed */
    isAlwaysAllowed: (toolName: string) => boolean;
    /** Create canUseTool callback for query options */
    createCanUseToolCallback: (permissionMode: PermissionMode) => (toolName: string, input: Record<string, unknown>, options: {
        toolUseID: string;
        decisionReason?: string;
    }) => Promise<PermissionResult>;
}
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
export declare function usePermission(): UsePermissionReturn;
//# sourceMappingURL=usePermission.d.ts.map