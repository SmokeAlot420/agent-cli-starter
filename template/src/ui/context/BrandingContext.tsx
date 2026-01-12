/**
 * Branding Context
 * Allows downstream projects to override branding configuration
 */

import React, { createContext, useContext, type ReactNode } from 'react';
import { BRANDING, type BrandingConfig } from '../../branding.js';

// Context with default branding
const BrandingContext = createContext<BrandingConfig>(BRANDING);

/**
 * Hook to access branding configuration
 * Components use this instead of importing BRANDING directly
 */
export function useBranding(): BrandingConfig {
  return useContext(BrandingContext);
}

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
export const BrandingProvider: React.FC<BrandingProviderProps> = ({
  children,
  branding = BRANDING
}) => {
  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
};

export { BrandingContext };
