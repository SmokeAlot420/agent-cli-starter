/**
 * CommandAutocomplete Component
 * Dropdown menu showing filtered slash commands with selection indicator
 */
import React from 'react';
import type { SlashCommand } from '../../features/commands.js';
/**
 * Props for CommandAutocomplete component
 */
export interface CommandAutocompleteProps {
    /** Filtered commands to display */
    commands: SlashCommand[];
    /** Currently selected index */
    selectedIndex: number;
    /** Maximum number of commands to show (default: 8) */
    maxVisible?: number;
}
/**
 * CommandAutocomplete displays a dropdown of filtered slash commands
 *
 * @example
 * ```tsx
 * <CommandAutocomplete
 *   commands={filteredCommands}
 *   selectedIndex={0}
 *   maxVisible={8}
 * />
 * ```
 */
export declare const CommandAutocomplete: React.FC<CommandAutocompleteProps>;
export default CommandAutocomplete;
//# sourceMappingURL=CommandAutocomplete.d.ts.map