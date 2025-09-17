/**
 * React Native Color Thief - Main Export File
 *
 * A powerful React Native library for extracting prominent colors from images and SVGs
 * using the Skia rendering engine with full version compatibility support.
 */
export { ReactNativeColorThief, ColorThiefConfig, ColorResult, PaletteResult } from './react-native-color-thief';
export { createColorThief, defaultColorThief, getProminentColors } from './react-native-color-thief';
export { checkCompatibility, logCompatibilityStatus, getRecommendedSkiaVersion, supportsVideoFeatures, parseVersion, compareVersions, getPackageVersion, VersionInfo, CompatibilityResult, FullCompatibilityResult } from './version-compatibility';
export { ArrayRGB, ColorFormats, formatRGB } from './color-converters';
export { ReactNativeColorThief as default } from './react-native-color-thief';
