/**
 * Help Panel Hook
 * Manages state for the /help interactive panel
 */
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
export declare function useHelpPanel(options?: UseHelpPanelOptions): UseHelpPanelReturn;
export default useHelpPanel;
//# sourceMappingURL=useHelpPanel.d.ts.map