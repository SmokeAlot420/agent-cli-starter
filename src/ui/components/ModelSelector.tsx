/**
 * ModelSelector Component
 * Interactive model selection panel
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { MODELS, getModelDisplayName } from '../../features/models.js';

export interface ModelSelectorProps {
  /** Currently selected model */
  currentModel: string;
  /** Callback when model is selected */
  onSelect: (model: string) => void;
  /** Callback when closed */
  onClose: () => void;
}

interface ModelOption {
  alias: string;
  model: string;
  description: string;
}

const MODEL_OPTIONS: ModelOption[] = [
  { alias: 'opus', model: MODELS.OPUS, description: 'Most capable, extended thinking' },
  { alias: 'sonnet', model: MODELS.SONNET, description: 'Fast and capable' },
  { alias: 'haiku', model: MODELS.HAIKU, description: 'Fastest, most economical' }
];

/**
 * ModelSelector displays a list of available models for selection
 */
export const ModelSelector: React.FC<ModelSelectorProps> = ({
  currentModel,
  onSelect,
  onClose
}) => {
  // Find current model index for initial selection
  const initialIndex = MODEL_OPTIONS.findIndex(opt => opt.model === currentModel);
  const [selectedIndex, setSelectedIndex] = useState(initialIndex >= 0 ? initialIndex : 0);

  // Keyboard handling
  useInput((input, key) => {
    if (key.escape) {
      onClose();
    } else if (key.upArrow) {
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (key.downArrow) {
      setSelectedIndex(prev => Math.min(prev + 1, MODEL_OPTIONS.length - 1));
    } else if (key.return) {
      const selected = MODEL_OPTIONS[selectedIndex];
      if (selected) {
        onSelect(selected.model);
      }
    }
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      paddingX={1}
    >
      {/* Header */}
      <Box marginBottom={1}>
        <Text bold color="cyan">Select Model</Text>
      </Box>

      {/* Model list */}
      {MODEL_OPTIONS.map((option, index) => {
        const isSelected = index === selectedIndex;
        const isCurrent = option.model === currentModel;
        const indicator = isSelected ? '\u25b8 ' : '  ';

        return (
          <Box key={option.alias} flexDirection="column" marginY={0}>
            <Box>
              <Text color={isSelected ? 'cyan' : 'white'} bold={isSelected}>
                {indicator}
              </Text>
              <Text color={isSelected ? 'cyan' : 'white'} bold={isSelected}>
                {option.alias}
              </Text>
              {isCurrent && (
                <Text color="green"> (current)</Text>
              )}
            </Box>
            <Box marginLeft={4}>
              <Text dimColor>
                {getModelDisplayName(option.model)} - {option.description}
              </Text>
            </Box>
          </Box>
        );
      })}

      {/* Help text */}
      <Box marginTop={1}>
        <Text dimColor>
          {'\u2191\u2193'} Navigate | Enter: Select | Esc: Cancel
        </Text>
      </Box>
    </Box>
  );
};

export default ModelSelector;
