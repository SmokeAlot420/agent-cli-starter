/**
 * Help Panel Hook
 * Manages state for the /help interactive panel
 */
import { useState, useCallback } from 'react';
const TABS = ['commands', 'shortcuts', 'tips'];
export function useHelpPanel(options = {}) {
    const { initialTab = 'commands' } = options;
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(initialTab);
    const open = useCallback(() => {
        setIsOpen(true);
        setActiveTab('commands');
    }, []);
    const close = useCallback(() => {
        setIsOpen(false);
    }, []);
    const setTab = useCallback((tab) => {
        setActiveTab(tab);
    }, []);
    const nextTab = useCallback(() => {
        setActiveTab(current => {
            const idx = TABS.indexOf(current);
            return TABS[(idx + 1) % TABS.length];
        });
    }, []);
    const prevTab = useCallback(() => {
        setActiveTab(current => {
            const idx = TABS.indexOf(current);
            return TABS[(idx - 1 + TABS.length) % TABS.length];
        });
    }, []);
    return {
        isOpen,
        activeTab,
        open,
        close,
        setTab,
        nextTab,
        prevTab
    };
}
export default useHelpPanel;
//# sourceMappingURL=useHelpPanel.js.map