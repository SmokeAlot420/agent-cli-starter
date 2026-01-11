/**
 * Memory Editor Hook
 * Manages state for the /memory interactive editor
 */
import { useState, useCallback, useMemo } from 'react';
import * as fs from 'fs';
import * as path from 'path';
/**
 * Discover CLAUDE.md files in standard locations
 */
function discoverMemoryFiles(cwd) {
    const files = [];
    // User-level CLAUDE.md (~/.claude/CLAUDE.md)
    const userHome = process.env.HOME || process.env.USERPROFILE || '';
    const userPath = path.join(userHome, '.claude', 'CLAUDE.md');
    files.push({
        path: userPath,
        name: 'User CLAUDE.md',
        source: 'user',
        exists: fs.existsSync(userPath)
    });
    // Project-level CLAUDE.md (cwd/CLAUDE.md)
    const projectPath = path.join(cwd, 'CLAUDE.md');
    files.push({
        path: projectPath,
        name: 'Project CLAUDE.md',
        source: 'project',
        exists: fs.existsSync(projectPath)
    });
    // Local .claude/CLAUDE.md (cwd/.claude/CLAUDE.md)
    const localPath = path.join(cwd, '.claude', 'CLAUDE.md');
    files.push({
        path: localPath,
        name: 'Local .claude/CLAUDE.md',
        source: 'local',
        exists: fs.existsSync(localPath)
    });
    return files;
}
export function useMemoryEditor(options = {}) {
    const { cwd = process.cwd() } = options;
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    // Discover files when opening
    const files = useMemo(() => {
        if (!isOpen)
            return [];
        return discoverMemoryFiles(cwd);
    }, [isOpen, cwd]);
    const open = useCallback(() => {
        setIsOpen(true);
        setSelectedIndex(0);
    }, []);
    const close = useCallback(() => {
        setIsOpen(false);
        setSelectedIndex(0);
    }, []);
    const selectNext = useCallback(() => {
        setSelectedIndex(prev => Math.min(prev + 1, Math.max(0, files.length - 1)));
    }, [files.length]);
    const selectPrev = useCallback(() => {
        setSelectedIndex(prev => Math.max(prev - 1, 0));
    }, []);
    const getSelected = useCallback(() => {
        if (files.length === 0)
            return null;
        return files[selectedIndex] ?? null;
    }, [files, selectedIndex]);
    return {
        isOpen,
        files,
        selectedIndex,
        open,
        close,
        selectNext,
        selectPrev,
        getSelected
    };
}
export default useMemoryEditor;
//# sourceMappingURL=useMemoryEditor.js.map