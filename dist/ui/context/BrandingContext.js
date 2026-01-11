import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Branding Context
 * Allows downstream projects to override branding configuration
 */
import { createContext, useContext } from 'react';
import { BRANDING } from '../../branding.js';
// Context with default branding
const BrandingContext = createContext(BRANDING);
/**
 * Hook to access branding configuration
 * Components use this instead of importing BRANDING directly
 */
export function useBranding() {
    return useContext(BrandingContext);
}
/**
 * Provider component - wrap your App with this to inject custom branding
 */
export const BrandingProvider = ({ children, branding = BRANDING }) => {
    return (_jsx(BrandingContext.Provider, { value: branding, children: children }));
};
export { BrandingContext };
//# sourceMappingURL=BrandingContext.js.map