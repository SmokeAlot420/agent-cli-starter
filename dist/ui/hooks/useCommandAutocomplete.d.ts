/**
 * useCommandAutocomplete Hook
 * Manages slash command autocomplete state with filtering and keyboard navigation
 */
import { type SlashCommand } from '../../features/commands.js';
/**
 * Options for useCommandAutocomplete hook
 */
export interface UseCommandAutocompleteOptions {
    /** Optional pre-loaded commands (defaults to discoverAllCommands()) */
    commands?: SlashCommand[];
    /** Maximum visible items in dropdown (default: 8) */
    maxVisible?: number;
}
/**
 * Return type for useCommandAutocomplete hook
 */
export interface UseCommandAutocompleteReturn {
    /** Whether autocomplete dropdown is open */
    isOpen: boolean;
    /** Current filter text (without leading /) */
    filter: string;
    /** Currently selected index in filtered list */
    selectedIndex: number;
    /** Scroll offset for viewport (first visible item index) */
    scrollOffset: number;
    /** Commands matching current filter */
    filteredCommands: SlashCommand[];
    /** Open autocomplete with optional initial filter */
    open: (initialFilter?: string) => void;
    /** Close autocomplete */
    close: () => void;
    /** Update filter text (resets selection to 0) */
    updateFilter: (filter: string) => void;
    /** Move selection down (clamped to list bounds) */
    selectNext: () => void;
    /** Move selection up (clamped to list bounds) */
    selectPrev: () => void;
    /** Get currently selected command or null */
    getSelected: () => SlashCommand | null;
}
/**
 * Hook for managing slash command autocomplete state
 *
 * @param options - Optional configuration including pre-loaded commands
 * @returns Autocomplete state and control functions
 *
 * @example
 * ```typescript
 * const autocomplete = useCommandAutocomplete();
 *
 * // Open when user types /
 * autocomplete.open('');
 *
 * // Update filter as user types
 * autocomplete.updateFilter('pl'); // Filters to /plan, /plan-feature, etc.
 *
 * // Navigate with arrow keys
 * autocomplete.selectNext();
 * autocomplete.selectPrev();
 *
 * // Get selected command
 * const selected = autocomplete.getSelected();
 * if (selected) {
 *   console.log(selected.name); // 'plan'
 * }
 * ```
 */
export declare function useCommandAutocomplete(options?: UseCommandAutocompleteOptions): UseCommandAutocompleteReturn;
export default useCommandAutocomplete;
//# sourceMappingURL=useCommandAutocomplete.d.ts.map