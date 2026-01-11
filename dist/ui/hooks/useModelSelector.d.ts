/**
 * Model Selector Hook
 * Manages state for the /model interactive selector
 */
export interface UseModelSelectorOptions {
    /** Current model */
    currentModel?: string;
    /** Callback when model is selected */
    onSelect?: (model: string) => void;
}
export interface UseModelSelectorReturn {
    /** Whether selector is open */
    isOpen: boolean;
    /** Current model being displayed */
    currentModel: string;
    /** Open the selector */
    open: () => void;
    /** Close the selector */
    close: () => void;
    /** Select a model and close */
    selectModel: (model: string) => void;
}
export declare function useModelSelector(options?: UseModelSelectorOptions): UseModelSelectorReturn;
export default useModelSelector;
//# sourceMappingURL=useModelSelector.d.ts.map