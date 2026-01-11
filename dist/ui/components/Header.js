import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { useBranding } from '../context/BrandingContext.js';
/**
 * Header component with customizable branding and ASCII art
 */
export const Header = ({ cwd, mode: _mode, verbose: _verbose, showLogo = true }) => {
    const branding = useBranding();
    return (_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [showLogo && (_jsx(Box, { flexDirection: "column", marginBottom: 0, children: _jsx(Text, { color: branding.logoColor, children: branding.logo }) })), _jsxs(Box, { children: [_jsx(Text, { bold: true, color: branding.logoColor, children: branding.productName }), _jsxs(Text, { dimColor: true, children: [" - ", branding.tagline] })] }), _jsx(Text, { dimColor: true, children: branding.subtitle }), _jsxs(Box, { marginTop: 1, children: [_jsx(Text, { color: "gray", children: "\uD83D\uDCC1 " }), _jsx(Text, { children: cwd })] })] }));
};
export default Header;
//# sourceMappingURL=Header.js.map