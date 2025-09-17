/**
 * React Native Color Thief - Main Export File
 * 
 * A powerful React Native library for extracting prominent colors from images and SVGs
 * using the Skia rendering engine with full version compatibility support.
 */

// Main class and types
export {
  ReactNativeColorThief,
  ColorThiefConfig,
  ColorResult,
  PaletteResult
} from './react-native-color-thief';

// Convenience functions
export {
  createColorThief,
  defaultColorThief,
  getProminentColors
} from './react-native-color-thief';

// Version compatibility utilities
export {
  checkCompatibility,
  logCompatibilityStatus,
  getRecommendedSkiaVersion,
  supportsVideoFeatures,
  parseVersion,
  compareVersions,
  getPackageVersion,
  VersionInfo,
  CompatibilityResult,
  FullCompatibilityResult
} from './version-compatibility';

// Color conversion utilities
export {
  ArrayRGB,
  ColorFormats,
  formatRGB
} from './color-converters';

// Default export
export { ReactNativeColorThief as default } from './react-native-color-thief';
