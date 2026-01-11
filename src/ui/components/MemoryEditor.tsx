/**
 * MemoryEditor Component
 * Interactive CLAUDE.md file selector
 */

import React from 'react';
import { Box, Text, useInput } from 'ink';
import type { MemoryFile } from '../hooks/useMemoryEditor.js';

export interface MemoryEditorProps {
  /** Discovered memory files */
  files: MemoryFile[];
  /** Currently selected index */
  selectedIndex: number;
  /** Callback when navigating down */
  onSelectNext: () => void;
  /** Callback when navigating up */
  onSelectPrev: () => void;
  /** Callback when file is selected for editing */
  onEdit: (file: MemoryFile) => void;
  /** Callback when closed */
  onClose: () => void;
}

const SOURCE_LABELS: Record<string, string> = {
  user: 'User-level',
  project: 'Project-level',
  local: 'Local .claude'
};

const SOURCE_DESCRIPTIONS: Record<string, string> = {
  user: 'Global memory (~/.claude/CLAUDE.md)',
  project: 'Project root (./CLAUDE.md)',
  local: 'Hidden local (./.claude/CLAUDE.md)'
};

/**
 * MemoryEditor displays a list of CLAUDE.md files for editing
 */
export const MemoryEditor: React.FC<MemoryEditorProps> = ({
  files,
  selectedIndex,
  onSelectNext,
  onSelectPrev,
  onEdit,
  onClose
}) => {
  // Keyboard handling
  useInput((input, key) => {
    if (key.escape) {
      onClose();
    } else if (key.upArrow) {
      onSelectPrev();
    } else if (key.downArrow) {
      onSelectNext();
    } else if (key.return) {
      const selected = files[selectedIndex];
      if (selected) {
        onEdit(selected);
      }
    }
  });

  // Handle empty state
  if (files.length === 0) {
    return (
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="gray"
        paddingX={1}
      >
        <Text bold color="cyan">Memory Files</Text>
        <Box marginTop={1}>
          <Text dimColor italic>No memory files found</Text>
        </Box>
        <Box marginTop={1}>
          <Text dimColor>Press Esc to close</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      paddingX={1}
    >
      {/* Header */}
      <Box marginBottom={1}>
        <Text bold color="cyan">Memory Files (CLAUDE.md)</Text>
      </Box>

      {/* File list */}
      {files.map((file, index) => {
        const isSelected = index === selectedIndex;
        const indicator = isSelected ? '\u25b8 ' : '  ';
        const sourceLabel = SOURCE_LABELS[file.source] || file.source;
        const sourceDesc = SOURCE_DESCRIPTIONS[file.source] || '';

        return (
          <Box key={file.path} flexDirection="column" marginY={0}>
            <Box>
              <Text color={isSelected ? 'cyan' : 'white'} bold={isSelected}>
                {indicator}
              </Text>
              <Text color={isSelected ? 'cyan' : 'white'} bold={isSelected}>
                {sourceLabel}
              </Text>
              {file.exists ? (
                <Text color="green"> [exists]</Text>
              ) : (
                <Text color="yellow"> [create new]</Text>
              )}
            </Box>
            <Box marginLeft={4}>
              <Text dimColor>{sourceDesc}</Text>
            </Box>
          </Box>
        );
      })}

      {/* Help text */}
      <Box marginTop={1}>
        <Text dimColor>
          {'\u2191\u2193'} Navigate | Enter: Edit | Esc: Cancel
        </Text>
      </Box>
    </Box>
  );
};

export default MemoryEditor;
