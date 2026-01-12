/**
 * Config Panel Hook
 * Manages state for the /config tabbed UI panel
 */

import { useState, useCallback } from 'react';
import { useBranding } from '../context/BrandingContext.js';
import { DEFAULT_MODEL, ULTRATHINK_TOKENS } from '../../constants.js';

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
  /** Callback when model setting is activated */
  onChangeModel?: () => void;
  /** Callback when thinking mode is toggled */
  onToggleThinking?: () => void;
  /** Callback when permission mode is cycled */
  onCyclePermission?: () => void;
  /** Callback when verbose is toggled */
  onToggleVerbose?: () => void;
}

export interface UseConfigPanelReturn {
  isOpen: boolean;
  activeTab: ConfigTab;
  status: ConfigStatus;
  settings: ConfigSettings;
  usage: ConfigUsage;
  /** Currently selected setting index in Config tab */
  selectedSettingIndex: number;
  open: () => void;
  close: () => void;
  setTab: (tab: ConfigTab) => void;
  nextTab: () => void;
  prevTab: () => void;
  /** Select next setting in Config tab */
  selectNextSetting: () => void;
  /** Select previous setting in Config tab */
  selectPrevSetting: () => void;
  /** Activate the currently selected setting */
  activateSetting: () => void;
}

const TABS: ConfigTab[] = ['status', 'config', 'usage'];

// Settings in Config tab (for navigation)
const CONFIG_SETTINGS = ['model', 'thinking', 'permission', 'verbose'] as const;

export function useConfigPanel(
  options: UseConfigPanelOptions = {}
): UseConfigPanelReturn {
  const {
    cwd = process.cwd(),
    sessionId,
    model = 'opus',
    thinkingEnabled = false,
    verbose = false,
    permissionMode = 'default',
    contextPercent = 0,
    onChangeModel,
    onToggleThinking,
    onCyclePermission,
    onToggleVerbose
  } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ConfigTab>('status');
  const [selectedSettingIndex, setSelectedSettingIndex] = useState(0);

  // Get branding from context
  const branding = useBranding();

  // Build status info
  const status: ConfigStatus = {
    version: '1.0.0',
    productName: branding.productName,
    sessionId,
    cwd,
    model,
    modelId: DEFAULT_MODEL,
    thinkingTokens: ULTRATHINK_TOKENS
  };

  // Build settings info
  const settings: ConfigSettings = {
    thinkingMode: thinkingEnabled,
    verboseOutput: verbose,
    permissionMode
  };

  // Build usage info
  const usage: ConfigUsage = {
    contextPercent
  };

  const open = useCallback(() => {
    setIsOpen(true);
    setActiveTab('status');
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const setTab = useCallback((tab: ConfigTab) => {
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
