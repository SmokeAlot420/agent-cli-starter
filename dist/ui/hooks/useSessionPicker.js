/**
 * useSessionPicker Hook
 * Manages session picker state with filtering and keyboard navigation
 */
import { useState, useMemo, useCallback } from 'react';
/**
 * Format relative time for display
 */
export function formatTimeAgo(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60)
        return 'just now';
    if (seconds < 3600)
        return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400)
        return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800)
        return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
}
/**
 * Hook for managing session picker state
 */
export function useSessionPicker(options = {}) {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [allSessions, setAllSessions] = useState(options.sessions ?? []);
    // Filter sessions by name or initial prompt
    const filteredSessions = useMemo(() => {
        if (!filter) {
            return allSessions;
        }
        const lowerFilter = filter.toLowerCase();
        return allSessions.filter(session => {
            const name = session.name?.toLowerCase() ?? '';
            const prompt = session.initialPrompt.toLowerCase();
            return name.includes(lowerFilter) || prompt.includes(lowerFilter);
        });
    }, [allSessions, filter]);
    /**
     * Open picker with sessions
     */
    const open = useCallback((sessions) => {
        setAllSessions(sessions);
        setIsOpen(true);
        setFilter('');
        setSelectedIndex(0);
    }, []);
    /**
     * Close picker
     */
    const close = useCallback(() => {
        setIsOpen(false);
        setFilter('');
        setSelectedIndex(0);
    }, []);
    /**
     * Update filter
     */
    const updateFilter = useCallback((newFilter) => {
        setFilter(newFilter);
        setSelectedIndex(0);
    }, []);
    /**
     * Select next item
     */
    const selectNext = useCallback(() => {
        setSelectedIndex(prev => {
            const maxIndex = filteredSessions.length - 1;
            return Math.min(prev + 1, Math.max(0, maxIndex));
        });
    }, [filteredSessions.length]);
    /**
     * Select previous item
     */
    const selectPrev = useCallback(() => {
        setSelectedIndex(prev => Math.max(prev - 1, 0));
    }, []);
    /**
     * Get selected session
     */
    const getSelected = useCallback(() => {
        if (filteredSessions.length === 0) {
            return null;
        }
        return filteredSessions[selectedIndex] ?? null;
    }, [filteredSessions, selectedIndex]);
    /**
     * Confirm selection and call onSelect
     */
    const confirmSelection = useCallback(() => {
        const selected = getSelected();
        if (selected && options.onSelect) {
            options.onSelect(selected);
        }
        close();
    }, [getSelected, options, close]);
    /**
     * Request new session
     */
    const requestNew = useCallback(() => {
        if (options.onNew) {
            options.onNew();
        }
        close();
    }, [options, close]);
    return {
        isOpen,
        filter,
        selectedIndex,
        filteredSessions,
        open,
        close,
        updateFilter,
        selectNext,
        selectPrev,
        getSelected,
        confirmSelection,
        requestNew
    };
}
export default useSessionPicker;
//# sourceMappingURL=useSessionPicker.js.map