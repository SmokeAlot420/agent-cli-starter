/**
 * Model Selector Hook
 * Manages state for the /model interactive selector
 */

import { useState, useCallback } from 'react';

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

export function useModelSelector(
  options: UseModelSelectorOptions = {}
): UseModelSelectorReturn {
  const { currentModel: initialModel = 'opus', onSelect } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState(initialModel);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const selectModel = useCallback((model: string) => {
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
