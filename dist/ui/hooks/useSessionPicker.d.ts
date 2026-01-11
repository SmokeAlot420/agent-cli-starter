/**
 * useSessionPicker Hook
 * Manages session picker state with filtering and keyboard navigation
 */
import type { SessionListItem } from '../../types/index.js';
/**
 * Options for useSessionPicker hook
 */
export interface UseSessionPickerOptions {
    /** Pre-loaded sessions (optional, for testing) */
    sessions?: SessionListItem[];
    /** Callback when session is selected */
    onSelect?: (session: SessionListItem) => void;
    /** Callback when new session is requested */
    onNew?: () => void;
}
/**
 * Return type for useSessionPicker hook
 */
export interface UseSessionPickerReturn {
    /** Whether picker is open */
    isOpen: boolean;
    /** Current search filter */
    filter: string;
    /** Currently selected index */
    selectedIndex: number;
    /** Sessions matching current filter */
    filteredSessions: SessionListItem[];
    /** Open the picker */
    open: (sessions: SessionListItem[]) => void;
    /** Close the picker */
    close: () => void;
    /** Update search filter */
    updateFilter: (filter: string) => void;
    /** Move selection down */
    selectNext: () => void;
    /** Move selection up */
    selectPrev: () => void;
    /** Get currently selected session */
    getSelected: () => SessionListItem | null;
    /** Confirm selection */
    confirmSelection: () => void;
    /** Request new session */
    requestNew: () => void;
}
/**
 * Format relative time for display
 */
export declare function formatTimeAgo(date: Date): string;
/**
 * Hook for managing session picker state
 */
export declare function useSessionPicker(options?: UseSessionPickerOptions): UseSessionPickerReturn;
export default useSessionPicker;
//# sourceMappingURL=useSessionPicker.d.ts.map