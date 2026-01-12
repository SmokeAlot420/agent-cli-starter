/**
 * InputPrompt Component
 * Rich text input with styled prompt and slash command autocomplete
 */

import React, { useState, useCallback, useRef } from 'react';
import { Box, Text, useInput } from 'ink';
import { ColorizedTextInput } from './ColorizedTextInput.js';
import { useCommandAutocomplete } from '../hooks/useCommandAutocomplete.js';
import { CommandAutocomplete } from './CommandAutocomplete.js';

export interface InputPromptProps {
  /** Callback when user submits input */
  onSubmit: (value: string) => void;
  /** Whether input is disabled (e.g., during processing) */
  disabled: boolean;
  /** Placeholder text when empty */
  placeholder?: string;
}

/**
 * InputPrompt with styled prompt character and slash command autocomplete
 *
 * Features:
 * - Type `/` to open command autocomplete
 * - Filter commands as you type
 * - Up/Down arrows to navigate
 * - Tab/Enter to select command
 * - Escape to close autocomplete
 */
export const InputPrompt: React.FC<InputPromptProps> = ({
  onSubmit,
  disabled,
  placeholder = 'Type your message...'
}) => {
  const [value, setValue] = useState('');
  const autocomplete = useCommandAutocomplete();

  // Ref to skip redundant handleChange when we handle backspace in useInput
  const skipNextChange = useRef(false);

  /**
   * Handle value changes from TextInput
   */
  const handleChange = useCallback((newValue: string) => {
    // Skip if we already handled this via useInput (prevents race condition)
    if (skipNextChange.current) {
      skipNextChange.current = false;
      return;
    }

    setValue(newValue);

    // Check if we should show autocomplete
    // Show when: starts with / AND no space (still typing command name)
    if (newValue.startsWith('/') && !newValue.includes(' ')) {
      const filter = newValue.slice(1); // Remove leading /
      if (autocomplete.isOpen) {
        autocomplete.updateFilter(filter);
      } else {
        autocomplete.open(filter);
      }
    } else {
      // Close if input doesn't start with / or has a space
      if (autocomplete.isOpen) {
        autocomplete.close();
      }
    }
  }, [autocomplete]);

  /**
   * Insert selected command into input
   */
  const insertSelectedCommand = useCallback(() => {
    const selected = autocomplete.getSelected();
    if (selected) {
      // Add trailing space if command has arguments
      const suffix = selected.metadata.argumentHint ? ' ' : '';
      setValue(`/${selected.name}${suffix}`);
      autocomplete.close();
      return true;
    }
    return false;
  }, [autocomplete]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback((input: string) => {
    // If autocomplete is open with selection, select AND submit immediately
    if (autocomplete.isOpen && autocomplete.filteredCommands.length > 0) {
      const selected = autocomplete.getSelected();
      if (selected) {
        const commandStr = `/${selected.name}`;
        autocomplete.close();
        setValue('');
        if (!disabled) {
          onSubmit(commandStr);
        }
        return;
      }
    }

    // Normal submit
    if (input.trim() && !disabled) {
      onSubmit(input.trim());
      setValue('');
      autocomplete.close();
    }
  }, [autocomplete, disabled, onSubmit]);

  /**
   * Handle keyboard input for autocomplete navigation
   * Note: useInput must be called unconditionally (React hooks rules)
   */
  useInput((input, key) => {
    // Disabled check first
    if (disabled) return;

    // Handle backspace explicitly for responsive autocomplete
    if (key.backspace && autocomplete.isOpen) {
      if (value === '/') {
        // Set flag to skip TextInput's onChange (prevents race condition)
        skipNextChange.current = true;
        autocomplete.close();
        setValue('');
        return;
      }
      // Otherwise let TextInput handle it - filter will update via onChange
    }

    // Only handle navigation keys when autocomplete is open
    if (!autocomplete.isOpen) return;

    if (key.upArrow) {
      autocomplete.selectPrev();
    } else if (key.downArrow) {
      autocomplete.selectNext();
    } else if (key.escape) {
      autocomplete.close();
    } else if (key.tab) {
      insertSelectedCommand();
    }
  });

  return (
    <Box flexDirection="column">
      {/* Input line */}
      <Box paddingX={1} marginTop={1}>
        <Text color={disabled ? 'gray' : 'green'} bold>
          {disabled ? '\u25cb ' : '\u276f '}
        </Text>
        {disabled ? (
          <Text dimColor>Processing...</Text>
        ) : (
          <ColorizedTextInput
            value={value}
            onChange={handleChange}
            onSubmit={handleSubmit}
            placeholder={placeholder}
          />
        )}
      </Box>

      {/* Autocomplete dropdown */}
      {!disabled && autocomplete.isOpen && (
        <CommandAutocomplete
          commands={autocomplete.filteredCommands}
          selectedIndex={autocomplete.selectedIndex}
          scrollOffset={autocomplete.scrollOffset}
          maxVisible={8}
        />
      )}
    </Box>
  );
};

export default InputPrompt;
