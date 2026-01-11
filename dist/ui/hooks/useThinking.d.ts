/**
 * useThinking Hook
 * Track thinking/tool usage state with elapsed timer
 */
export interface UseThinkingReturn {
    /** Whether agent is currently thinking */
    isThinking: boolean;
    /** Current tool being used (if any) */
    currentTool: string | null;
    /** Elapsed time in seconds since thinking started */
    elapsed: number;
    /** Start thinking state */
    startThinking: () => void;
    /** Stop thinking state */
    stopThinking: () => void;
    /** Set current tool */
    setTool: (tool: string | null) => void;
}
/**
 * Hook to track thinking state with timer
 */
export declare function useThinking(): UseThinkingReturn;
export default useThinking;
//# sourceMappingURL=useThinking.d.ts.map