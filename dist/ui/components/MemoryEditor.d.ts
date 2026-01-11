/**
 * MemoryEditor Component
 * Interactive CLAUDE.md file selector
 */
import React from 'react';
import type { MemoryFile } from '../hooks/useMemoryEditor.js';
export interface MemoryEditorProps {
    /** Discovered memory files */
    files: MemoryFile[];
    /** Currently selected index */
    selectedIndex: number;
    /** Callback when navigating down */
    onSelectNext: () => void;
    /** Callback when navigating up */
    onSelectPrev: () => void;
    /** Callback when file is selected for editing */
    onEdit: (file: MemoryFile) => void;
    /** Callback when closed */
    onClose: () => void;
}
/**
 * MemoryEditor displays a list of CLAUDE.md files for editing
 */
export declare const MemoryEditor: React.FC<MemoryEditorProps>;
export default MemoryEditor;
//# sourceMappingURL=MemoryEditor.d.ts.map