/**
 * Branding Context
 * Allows downstream projects to override branding configuration
 */
import React, { type ReactNode } from 'react';
import { type BrandingConfig } from '../../branding.js';
declare const BrandingContext: React.Context<BrandingConfig>;
/**
 * Hook to access branding configuration
 * Components use this instead of importing BRANDING directly
 */
export declare function useBranding(): BrandingConfig;
/**
 * Provider props
 */
export interface BrandingProviderProps {
    children: ReactNode;
    /** Custom branding config (defaults to template BRANDING) */
    branding?: BrandingConfig;
}
/**
 * Provider component - wrap your App with this to inject custom branding
 */
export declare const BrandingProvider: React.FC<BrandingProviderProps>;
export { BrandingContext };
//# sourceMappingURL=BrandingContext.d.ts.map