/**
 * ModelSelector Component
 * Interactive model selection panel
 */
import React from 'react';
export interface ModelSelectorProps {
    /** Currently selected model */
    currentModel: string;
    /** Callback when model is selected */
    onSelect: (model: string) => void;
    /** Callback when closed */
    onClose: () => void;
}
/**
 * ModelSelector displays a list of available models for selection
 */
export declare const ModelSelector: React.FC<ModelSelectorProps>;
export default ModelSelector;
//# sourceMappingURL=ModelSelector.d.ts.map