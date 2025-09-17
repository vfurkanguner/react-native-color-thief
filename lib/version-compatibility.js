"use strict";
/**
 * Version compatibility utilities for react-native-color-thief
 * Handles version checking and compatibility warnings for React, React Native, and Skia
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCompatibility = checkCompatibility;
exports.logCompatibilityStatus = logCompatibilityStatus;
exports.getRecommendedSkiaVersion = getRecommendedSkiaVersion;
exports.supportsVideoFeatures = supportsVideoFeatures;
exports.parseVersion = parseVersion;
exports.compareVersions = compareVersions;
exports.getPackageVersion = getPackageVersion;
/**
 * Parse a semantic version string into components
 */
function parseVersion(version) {
    const match = version.match(/(\d+)\.(\d+)\.(\d+)/);
    if (!match)
        return null;
    return {
        major: parseInt(match[1], 10),
        minor: parseInt(match[2], 10),
        patch: parseInt(match[3], 10)
    };
}
/**
 * Compare two version objects
 * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
function compareVersions(v1, v2) {
    if (v1.major !== v2.major)
        return v1.major - v2.major;
    if (v1.minor !== v2.minor)
        return v1.minor - v2.minor;
    return v1.patch - v2.patch;
}
/**
 * Get package version from node_modules or package.json
 */
function getPackageVersion(packageName) {
    try {
        // Try to require the package to get its version
        const pkg = require(`${packageName}/package.json`);
        return pkg.version;
    }
    catch (error) {
        // Fallback: try to get from current project's dependencies
        try {
            const projectPkg = require('../package.json');
            return (projectPkg.dependencies?.[packageName] ||
                projectPkg.devDependencies?.[packageName] ||
                projectPkg.peerDependencies?.[packageName])?.replace(/[\^~>=<]/, '') || null;
        }
        catch {
            return null;
        }
    }
}
/**
 * Check React version compatibility
 */
function checkReactCompatibility(version) {
    const result = {
        isSupported: false,
        isLegacy: false,
        warnings: [],
        errors: []
    };
    if (!version) {
        result.errors.push('React not found. Please install React >=18.0.0 (preferably >=19.0.0)');
        return result;
    }
    const parsed = parseVersion(version);
    if (!parsed) {
        result.errors.push(`Invalid React version format: ${version}`);
        return result;
    }
    const react19 = { major: 19, minor: 0, patch: 0 };
    const react18 = { major: 18, minor: 0, patch: 0 };
    if (compareVersions(parsed, react19) >= 0) {
        result.isSupported = true;
    }
    else if (compareVersions(parsed, react18) >= 0) {
        result.isSupported = true;
        result.isLegacy = true;
        result.warnings.push(`React ${version} is in legacy support mode. Consider upgrading to React >=19.0.0 for full feature support.`);
    }
    else {
        result.errors.push(`React ${version} is not supported. Please upgrade to React >=18.0.0 (preferably >=19.0.0)`);
    }
    return result;
}
/**
 * Check React Native version compatibility
 */
function checkReactNativeCompatibility(version) {
    const result = {
        isSupported: false,
        isLegacy: false,
        warnings: [],
        errors: []
    };
    if (!version) {
        result.errors.push('React Native not found. Please install React Native >=0.70.0 (preferably >=0.79.0)');
        return result;
    }
    const parsed = parseVersion(version);
    if (!parsed) {
        result.errors.push(`Invalid React Native version format: ${version}`);
        return result;
    }
    const rn79 = { major: 0, minor: 79, patch: 0 };
    const rn70 = { major: 0, minor: 70, patch: 0 };
    if (compareVersions(parsed, rn79) >= 0) {
        result.isSupported = true;
    }
    else if (compareVersions(parsed, rn70) >= 0) {
        result.isSupported = true;
        result.isLegacy = true;
        result.warnings.push(`React Native ${version} is in legacy support mode. Consider upgrading to React Native >=0.79.0 for full feature support.`);
    }
    else {
        result.errors.push(`React Native ${version} is not supported. Please upgrade to React Native >=0.70.0 (preferably >=0.79.0)`);
    }
    return result;
}
/**
 * Check React Native Skia version compatibility
 */
function checkSkiaCompatibility(skiaVersion, reactNativeVersion) {
    const result = {
        isSupported: false,
        isLegacy: false,
        warnings: [],
        errors: []
    };
    if (!skiaVersion) {
        result.errors.push('@shopify/react-native-skia not found. Please install @shopify/react-native-skia');
        return result;
    }
    const skiaParsed = parseVersion(skiaVersion);
    if (!skiaParsed) {
        result.errors.push(`Invalid React Native Skia version format: ${skiaVersion}`);
        return result;
    }
    // Check React Native compatibility if available
    if (reactNativeVersion) {
        const rnParsed = parseVersion(reactNativeVersion);
        if (rnParsed) {
            const rn78 = { major: 0, minor: 78, patch: 99 };
            const skia1124 = { major: 1, minor: 12, patch: 4 };
            const isRN78OrBelow = compareVersions(rnParsed, rn78) <= 0;
            const isSkia1124OrBelow = compareVersions(skiaParsed, skia1124) <= 0;
            if (isRN78OrBelow && !isSkia1124OrBelow) {
                result.errors.push(`React Native Skia ${skiaVersion} is incompatible with React Native ${reactNativeVersion}. ` +
                    'For React Native ≤0.78, please use @shopify/react-native-skia ≤1.12.4');
                return result;
            }
        }
    }
    const skia2 = { major: 2, minor: 0, patch: 0 };
    const skia1 = { major: 1, minor: 0, patch: 0 };
    if (compareVersions(skiaParsed, skia2) >= 0) {
        result.isSupported = true;
    }
    else if (compareVersions(skiaParsed, skia1) >= 0) {
        result.isSupported = true;
        result.isLegacy = true;
        result.warnings.push(`React Native Skia ${skiaVersion} is in legacy support mode. Consider upgrading to >=2.0.0 for full feature support.`);
    }
    else {
        result.errors.push(`React Native Skia ${skiaVersion} is not supported. Please upgrade to @shopify/react-native-skia >=1.0.0`);
    }
    return result;
}
/**
 * Comprehensive compatibility check for all dependencies
 */
function checkCompatibility() {
    const reactVersion = getPackageVersion('react');
    const reactNativeVersion = getPackageVersion('react-native');
    const skiaVersion = getPackageVersion('@shopify/react-native-skia');
    const react = checkReactCompatibility(reactVersion);
    const reactNative = checkReactNativeCompatibility(reactNativeVersion);
    const skia = checkSkiaCompatibility(skiaVersion, reactNativeVersion);
    const isCompatible = react.isSupported && reactNative.isSupported && skia.isSupported;
    const hasWarnings = react.warnings.length > 0 || reactNative.warnings.length > 0 || skia.warnings.length > 0;
    return {
        isCompatible,
        hasWarnings,
        react,
        reactNative,
        skia,
        platformRequirements: [
            'iOS 14.0 or higher required',
            'Android API level 21 (Android 5.0) or higher required',
            'Android with video support: API level 26 (Android 8.0) or higher required'
        ]
    };
}
/**
 * Log compatibility warnings and errors to console
 */
function logCompatibilityStatus(silent = false) {
    if (silent)
        return true;
    const compatibility = checkCompatibility();
    if (!compatibility.isCompatible) {
        console.warn('⚠️ react-native-color-thief compatibility issues detected:');
        [compatibility.react, compatibility.reactNative, compatibility.skia].forEach(result => {
            result.errors.forEach(error => console.error(`❌ ${error}`));
        });
        console.warn('\n💡 Please update your dependencies to ensure compatibility.');
        return false;
    }
    if (compatibility.hasWarnings) {
        console.info('ℹ️ react-native-color-thief compatibility notes:');
        [compatibility.react, compatibility.reactNative, compatibility.skia].forEach(result => {
            result.warnings.forEach(warning => console.warn(`⚠️ ${warning}`));
        });
    }
    return true;
}
/**
 * Get recommended Skia version based on React Native version
 */
function getRecommendedSkiaVersion(reactNativeVersion) {
    if (!reactNativeVersion) {
        return '>=2.0.0';
    }
    const parsed = parseVersion(reactNativeVersion);
    if (!parsed) {
        return '>=2.0.0';
    }
    const rn78 = { major: 0, minor: 78, patch: 99 };
    if (compareVersions(parsed, rn78) <= 0) {
        return '<=1.12.4';
    }
    return '>=2.0.0';
}
/**
 * Check if current environment supports video features (Android API 26+)
 */
function supportsVideoFeatures() {
    // This would need to be implemented with platform-specific checks
    // For now, we assume support is available
    return true;
}
