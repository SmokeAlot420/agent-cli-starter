/**
 * ConfigPanel Component
 * Claude Code-style tabbed configuration panel
 */
import React from 'react';
import type { ConfigTab, ConfigStatus, ConfigSettings, ConfigUsage } from '../hooks/useConfigPanel.js';
export interface ConfigPanelProps {
    activeTab: ConfigTab;
    status: ConfigStatus;
    settings: ConfigSettings;
    usage: ConfigUsage;
    mcpServers?: Record<string, {
        connected: boolean;
    }>;
    onClose: () => void;
    onNextTab: () => void;
    onPrevTab: () => void;
    onSetTab: (tab: ConfigTab) => void;
}
export declare const ConfigPanel: React.FC<ConfigPanelProps>;
declare const ConfigTab: React.FC<{
    settings: ConfigSettings;
}>;
export default ConfigPanel;
//# sourceMappingURL=ConfigPanel.d.ts.map