/**
 * Header Component
 * Displays branding with ASCII art, working directory, and mode
 */
import React from 'react';
export interface HeaderProps {
    /** Current working directory */
    cwd: string;
    /** Operating mode */
    mode: 'interactive' | 'oneshot';
    /** Whether verbose output is enabled */
    verbose: boolean;
    /** Whether to show the ASCII art logo (default: true) */
    showLogo?: boolean;
}
/**
 * Header component with customizable branding and ASCII art
 */
export declare const Header: React.FC<HeaderProps>;
export default Header;
//# sourceMappingURL=Header.d.ts.map