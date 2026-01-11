/**
 * Config Panel Hook
 * Manages state for the /config tabbed UI panel
 */
export type ConfigTab = 'status' | 'config' | 'usage';
export interface ConfigStatus {
    version: string;
    productName: string;
    sessionId?: string;
    cwd: string;
    model: string;
    modelId: string;
    thinkingTokens: number;
}
export interface ConfigSettings {
    thinkingMode: boolean;
    verboseOutput: boolean;
    permissionMode: string;
}
export interface ConfigUsage {
    contextPercent: number;
}
export interface UseConfigPanelOptions {
    cwd?: string;
    sessionId?: string;
    model?: string;
    thinkingEnabled?: boolean;
    verbose?: boolean;
    permissionMode?: string;
    contextPercent?: number;
}
export interface UseConfigPanelReturn {
    isOpen: boolean;
    activeTab: ConfigTab;
    status: ConfigStatus;
    settings: ConfigSettings;
    usage: ConfigUsage;
    open: () => void;
    close: () => void;
    setTab: (tab: ConfigTab) => void;
    nextTab: () => void;
    prevTab: () => void;
}
export declare function useConfigPanel(options?: UseConfigPanelOptions): UseConfigPanelReturn;
export default useConfigPanel;
//# sourceMappingURL=useConfigPanel.d.ts.map