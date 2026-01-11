/**
 * Config Panel Hook
 * Manages state for the /config tabbed UI panel
 */
import { useState, useCallback } from 'react';
import { useBranding } from '../context/BrandingContext.js';
import { DEFAULT_MODEL, ULTRATHINK_TOKENS } from '../../constants.js';
const TABS = ['status', 'config', 'usage'];
export function useConfigPanel(options = {}) {
    const { cwd = process.cwd(), sessionId, model = 'opus', thinkingEnabled = false, verbose = false, permissionMode = 'default', contextPercent = 0 } = options;
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('status');
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
    return {
        isOpen,
        activeTab,
        status,
        settings,
        usage,
        open,
        close,
        setTab,
        nextTab,
        prevTab
    };
}
export default useConfigPanel;
//# sourceMappingURL=useConfigPanel.js.map