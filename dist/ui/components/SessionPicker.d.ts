/**
 * SessionPicker Component
 * Interactive dropdown for selecting previous sessions
 */
import React from 'react';
import type { SessionListItem } from '../../types/index.js';
/**
 * Props for SessionPicker component
 */
export interface SessionPickerProps {
    /** Sessions to display */
    sessions: SessionListItem[];
    /** Currently selected index */
    selectedIndex: number;
    /** Maximum visible items (default: 8) */
    maxVisible?: number;
    /** Whether picker is in filter mode */
    filter?: string;
}
/**
 * SessionPicker displays a list of previous sessions for selection
 */
export declare const SessionPicker: React.FC<SessionPickerProps>;
export default SessionPicker;
//# sourceMappingURL=SessionPicker.d.ts.map