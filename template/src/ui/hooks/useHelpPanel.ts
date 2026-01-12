/**
 * Help Panel Hook
 * Manages state for the /help interactive panel
 */

import { useState, useCallback } from 'react';

export type HelpTab = 'commands' | 'shortcuts' | 'tips';

export interface UseHelpPanelOptions {
  /** Initial tab */
  initialTab?: HelpTab;
}

export interface UseHelpPanelReturn {
  /** Whether panel is open */
  isOpen: boolean;
  /** Currently active tab */
  activeTab: HelpTab;
  /** Open the panel */
  open: () => void;
  /** Close the panel */
  close: () => void;
  /** Set active tab */
  setTab: (tab: HelpTab) => void;
  /** Go to next tab */
  nextTab: () => void;
  /** Go to previous tab */
  prevTab: () => void;
}

const TABS: HelpTab[] = ['commands', 'shortcuts', 'tips'];

export function useHelpPanel(
  options: UseHelpPanelOptions = {}
): UseHelpPanelReturn {
  const { initialTab = 'commands' } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<HelpTab>(initialTab);

  const open = useCallback(() => {
    setIsOpen(true);
    setActiveTab('commands');
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const setTab = useCallback((tab: HelpTab) => {
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
