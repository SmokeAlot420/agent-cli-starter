/**
 * Model Selector Hook
 * Manages state for the /model interactive selector
 */
import { useState, useCallback } from 'react';
export function useModelSelector(options = {}) {
    const { currentModel: initialModel = 'opus', onSelect } = options;
    const [isOpen, setIsOpen] = useState(false);
    const [currentModel, setCurrentModel] = useState(initialModel);
    const open = useCallback(() => {
        setIsOpen(true);
    }, []);
    const close = useCallback(() => {
        setIsOpen(false);
    }, []);
    const selectModel = useCallback((model) => {
        setCurrentModel(model);
        if (onSelect) {
            onSelect(model);
        }
        setIsOpen(false);
    }, [onSelect]);
    return {
        isOpen,
        currentModel,
        open,
        close,
        selectModel
    };
}
export default useModelSelector;
//# sourceMappingURL=useModelSelector.js.map