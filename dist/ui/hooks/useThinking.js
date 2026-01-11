/**
 * useThinking Hook
 * Track thinking/tool usage state with elapsed timer
 */
import { useState, useCallback, useRef, useEffect } from 'react';
/**
 * Hook to track thinking state with timer
 */
export function useThinking() {
    const [isThinking, setIsThinking] = useState(false);
    const [currentTool, setCurrentTool] = useState(null);
    const [elapsed, setElapsed] = useState(0);
    const startTimeRef = useRef(null);
    const intervalRef = useRef(null);
    /**
     * Start thinking and timer
     */
    const startThinking = useCallback(() => {
        setIsThinking(true);
        setElapsed(0);
        startTimeRef.current = Date.now();
        // Update elapsed every second
        intervalRef.current = setInterval(() => {
            if (startTimeRef.current) {
                const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
                setElapsed(elapsedSeconds);
            }
        }, 1000);
    }, []);
    /**
     * Stop thinking and timer
     */
    const stopThinking = useCallback(() => {
        setIsThinking(false);
        setCurrentTool(null);
        startTimeRef.current = null;
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);
    /**
     * Set current tool
     */
    const setTool = useCallback((tool) => {
        setCurrentTool(tool);
    }, []);
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);
    return {
        isThinking,
        currentTool,
        elapsed,
        startThinking,
        stopThinking,
        setTool
    };
}
export default useThinking;
//# sourceMappingURL=useThinking.js.map