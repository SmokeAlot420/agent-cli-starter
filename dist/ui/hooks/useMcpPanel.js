/**
 * MCP Panel Hook
 * Manages state for the /mcp interactive panel
 */
import { useState, useCallback } from 'react';
export function useMcpPanel(options = {}) {
    const [isOpen, setIsOpen] = useState(false);
    const [servers, setServers] = useState(options.servers || {});
    const open = useCallback((newServers) => {
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
//# sourceMappingURL=useMcpPanel.js.map