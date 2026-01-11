/**
 * HelpPanel Component
 * Interactive tabbed help panel
 */
import React from 'react';
import type { HelpTab } from '../hooks/useHelpPanel.js';
export interface HelpPanelProps {
    /** Currently active tab */
    activeTab: HelpTab;
    /** Callback when panel should close */
    onClose: () => void;
    /** Callback to go to next tab */
    onNextTab: () => void;
    /** Callback to go to previous tab */
    onPrevTab: () => void;
}
export declare const HelpPanel: React.FC<HelpPanelProps>;
export default HelpPanel;
//# sourceMappingURL=HelpPanel.d.ts.map