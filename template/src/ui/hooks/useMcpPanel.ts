/**
 * MCP Panel Hook
 * Manages state for the /mcp interactive panel
 */

import { useState, useCallback } from 'react';
import type { McpServersConfig } from '../../features/mcp.js';

export interface UseMcpPanelOptions {
  /** Initial servers config */
  servers?: McpServersConfig;
}

export interface UseMcpPanelReturn {
  /** Whether panel is open */
  isOpen: boolean;
  /** Current servers config */
  servers: McpServersConfig;
  /** Open the panel with servers */
  open: (servers: McpServersConfig) => void;
  /** Close the panel */
  close: () => void;
}

export function useMcpPanel(
  options: UseMcpPanelOptions = {}
): UseMcpPanelReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [servers, setServers] = useState<McpServersConfig>(options.servers || {});

  const open = useCallback((newServers: McpServersConfig) => {
    setServers(newServers);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    servers,
    open,
    close
  };
}

export default useMcpPanel;
