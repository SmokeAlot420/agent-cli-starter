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
    /** Currently selected setting index in Config tab */
    selectedSettingIndex?: number;
    onClose: () => void;
    onNextTab: () => void;
    onPrevTab: () => void;
    onSetTab: (tab: ConfigTab) => void;
    /** Navigate to next setting in Config tab */
    onSelectNextSetting?: () => void;
    /** Navigate to previous setting in Config tab */
    onSelectPrevSetting?: () => void;
    /** Activate the selected setting */
    onActivateSetting?: () => void;
}
export declare const ConfigPanel: React.FC<ConfigPanelProps>;
export default ConfigPanel;
//# sourceMappingURL=ConfigPanel.d.ts.map