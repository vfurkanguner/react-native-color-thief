/**
 * Version compatibility utilities for react-native-color-thief
 * Handles version checking and compatibility warnings for React, React Native, and Skia
 */
export interface VersionInfo {
    major: number;
    minor: number;
    patch: number;
}
export interface CompatibilityResult {
    isSupported: boolean;
    isLegacy: boolean;
    warnings: string[];
    errors: string[];
}
export interface FullCompatibilityResult {
    isCompatible: boolean;
    hasWarnings: boolean;
    react: CompatibilityResult;
    reactNative: CompatibilityResult;
    skia: CompatibilityResult;
    platformRequirements: string[];
}
/**
 * Parse a semantic version string into components
 */
declare function parseVersion(version: string): VersionInfo | null;
/**
 * Compare two version objects
 * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
declare function compareVersions(v1: VersionInfo, v2: VersionInfo): number;
/**
 * Get package version from node_modules or package.json
 */
declare function getPackageVersion(packageName: string): string | null;
/**
 * Comprehensive compatibility check for all dependencies
 */
export declare function checkCompatibility(): FullCompatibilityResult;
/**
 * Log compatibility warnings and errors to console
 */
export declare function logCompatibilityStatus(silent?: boolean): boolean;
/**
 * Get recommended Skia version based on React Native version
 */
export declare function getRecommendedSkiaVersion(reactNativeVersion?: string): string;
/**
 * Check if current environment supports video features (Android API 26+)
 */
export declare function supportsVideoFeatures(): boolean;
export { parseVersion, compareVersions, getPackageVersion };
