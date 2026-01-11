/**
 * Config Panel Hook
 * Manages state for the /config tabbed UI panel
 */
import { useState, useCallback } from 'react';
import { useBranding } from '../context/BrandingContext.js';
import { DEFAULT_MODEL, ULTRATHINK_TOKENS } from '../../constants.js';
const TABS = ['status', 'config', 'usage'];
// Settings in Config tab (for navigation)
const CONFIG_SETTINGS = ['model', 'thinking', 'permission', 'verbose'];
export function useConfigPanel(options = {}) {
    const { cwd = process.cwd(), sessionId, model = 'opus', thinkingEnabled = false, verbose = false, permissionMode = 'default', contextPercent = 0, onChangeModel, onToggleThinking, onCyclePermission, onToggleVerbose } = options;
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('status');
    const [selectedSettingIndex, setSelectedSettingIndex] = useState(0);
    // Get branding from context
    const branding = useBranding();
    // Build status info
    const status = {
        version: '1.0.0',
        productName: branding.productName,
        sessionId,
        cwd,
        model,
        modelId: DEFAULT_MODEL,
        thinkingTokens: ULTRATHINK_TOKENS
    };
    // Build settings info
    const settings = {
        thinkingMode: thinkingEnabled,
        verboseOutput: verbose,
        permissionMode
    };
    // Build usage info
    const usage = {
        contextPercent
    };
    const open = useCallback(() => {
        setIsOpen(true);
        setActiveTab('status');
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
    const selectNextSetting = useCallback(() => {
        setSelectedSettingIndex(prev => Math.min(prev + 1, CONFIG_SETTINGS.length - 1));
    }, []);
    const selectPrevSetting = useCallback(() => {
        setSelectedSettingIndex(prev => Math.max(prev - 1, 0));
    }, []);
    const activateSetting = useCallback(() => {
        const setting = CONFIG_SETTINGS[selectedSettingIndex];
        switch (setting) {
            case 'model':
                onChangeModel?.();
                break;
            case 'thinking':
                onToggleThinking?.();
                break;
            case 'permission':
                onCyclePermission?.();
                break;
            case 'verbose':
                onToggleVerbose?.();
                break;
        }
    }, [selectedSettingIndex, onChangeModel, onToggleThinking, onCyclePermission, onToggleVerbose]);
    return {
        isOpen,
        activeTab,
        status,
        settings,
        usage,
        selectedSettingIndex,
        open,
        close,
        setTab,
        nextTab,
        prevTab,
        selectNextSetting,
        selectPrevSetting,
        activateSetting
    };
}
export default useConfigPanel;
//# sourceMappingURL=useConfigPanel.js.map