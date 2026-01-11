/**
 * useCommandAutocomplete Hook
 * Manages slash command autocomplete state with filtering and keyboard navigation
 */

import { useState, useMemo, useCallback } from 'react';
import { discoverAllCommands, type SlashCommand } from '../../features/commands.js';

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
export function useCommandAutocomplete(
  options: UseCommandAutocompleteOptions = {}
): UseCommandAutocompleteReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);

  const maxVisible = options.maxVisible ?? 8;

  // Get all commands (cached by discoverAllCommands with 30s TTL)
  const allCommands = useMemo(() => {
    return options.commands ?? discoverAllCommands();
  }, [options.commands]);

  // Filter commands by prefix match on name
  const filteredCommands = useMemo(() => {
    if (!filter) {
      return allCommands;
    }
    const lowerFilter = filter.toLowerCase();
    return allCommands.filter(cmd =>
      cmd.name.toLowerCase().startsWith(lowerFilter)
    );
  }, [allCommands, filter]);

  /**
   * Open autocomplete dropdown
   */
  const open = useCallback((initialFilter: string = '') => {
    setIsOpen(true);
    setFilter(initialFilter);
    setSelectedIndex(0);
    setScrollOffset(0);
  }, []);

  /**
   * Close autocomplete dropdown
   */
  const close = useCallback(() => {
    setIsOpen(false);
    setFilter('');
    setSelectedIndex(0);
    setScrollOffset(0);
  }, []);

  /**
   * Update filter text (resets selection)
   */
  const updateFilter = useCallback((newFilter: string) => {
    setFilter(newFilter);
    setSelectedIndex(0);
    setScrollOffset(0);
  }, []);

  /**
   * Move selection to next item (clamp to bounds, scroll viewport if needed)
   */
  const selectNext = useCallback(() => {
    setSelectedIndex(prev => {
      const maxIndex = filteredCommands.length - 1;
      const newIndex = Math.min(prev + 1, maxIndex);

      // Scroll down if selection moves below viewport
      setScrollOffset(currentOffset => {
        if (newIndex >= currentOffset + maxVisible) {
          return newIndex - maxVisible + 1;
        }
        return currentOffset;
      });

      return newIndex;
    });
  }, [filteredCommands.length, maxVisible]);

  /**
   * Move selection to previous item (clamp to bounds, scroll viewport if needed)
   */
  const selectPrev = useCallback(() => {
    setSelectedIndex(prev => {
      const newIndex = Math.max(prev - 1, 0);

      // Scroll up if selection moves above viewport
      setScrollOffset(currentOffset => {
        if (newIndex < currentOffset) {
          return newIndex;
        }
        return currentOffset;
      });

      return newIndex;
    });
  }, []);

  /**
   * Get currently selected command
   */
  const getSelected = useCallback((): SlashCommand | null => {
    if (filteredCommands.length === 0) {
      return null;
    }
    return filteredCommands[selectedIndex] ?? null;
  }, [filteredCommands, selectedIndex]);

  return {
    isOpen,
    filter,
    selectedIndex,
    scrollOffset,
    filteredCommands,
    open,
    close,
    updateFilter,
    selectNext,
    selectPrev,
    getSelected
  };
}

export default useCommandAutocomplete;
