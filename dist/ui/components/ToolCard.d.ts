/**
 * ToolCard Component
 * Display tool usage in a styled card
 */
import React from 'react';
export interface ToolCardProps {
    /** Name of the tool being used */
    tool: string;
    /** Tool input parameters */
    input: unknown;
    /** Whether to show detailed input */
    verbose: boolean;
    /** Elapsed time in seconds */
    elapsed?: number;
}
/**
 * ToolCard component for displaying tool usage
 */
export declare const ToolCard: React.FC<ToolCardProps>;
export default ToolCard;
//# sourceMappingURL=ToolCard.d.ts.map