/**
 * Memory Editor Hook
 * Manages state for the /memory interactive editor
 */
export interface MemoryFile {
    /** File path */
    path: string;
    /** Display name */
    name: string;
    /** Source type (user, project, local) */
    source: 'user' | 'project' | 'local';
    /** Whether file exists */
    exists: boolean;
}
export interface UseMemoryEditorOptions {
    /** Current working directory */
    cwd?: string;
}
export interface UseMemoryEditorReturn {
    /** Whether editor is open */
    isOpen: boolean;
    /** Discovered memory files */
    files: MemoryFile[];
    /** Currently selected index */
    selectedIndex: number;
    /** Open the editor */
    open: () => void;
    /** Close the editor */
    close: () => void;
    /** Select next file */
    selectNext: () => void;
    /** Select previous file */
    selectPrev: () => void;
    /** Get currently selected file */
    getSelected: () => MemoryFile | null;
}
export declare function useMemoryEditor(options?: UseMemoryEditorOptions): UseMemoryEditorReturn;
export default useMemoryEditor;
//# sourceMappingURL=useMemoryEditor.d.ts.map