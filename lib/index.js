"use strict";
/**
 * React Native Color Thief - Main Export File
 *
 * A powerful React Native library for extracting prominent colors from images and SVGs
 * using the Skia rendering engine with full version compatibility support.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.formatRGB = exports.getPackageVersion = exports.compareVersions = exports.parseVersion = exports.supportsVideoFeatures = exports.getRecommendedSkiaVersion = exports.logCompatibilityStatus = exports.checkCompatibility = exports.getProminentColors = exports.defaultColorThief = exports.createColorThief = exports.ReactNativeColorThief = void 0;
// Main class and types
var react_native_color_thief_1 = require("./react-native-color-thief");
Object.defineProperty(exports, "ReactNativeColorThief", { enumerable: true, get: function () { return react_native_color_thief_1.ReactNativeColorThief; } });
// Convenience functions
var react_native_color_thief_2 = require("./react-native-color-thief");
Object.defineProperty(exports, "createColorThief", { enumerable: true, get: function () { return react_native_color_thief_2.createColorThief; } });
Object.defineProperty(exports, "defaultColorThief", { enumerable: true, get: function () { return react_native_color_thief_2.defaultColorThief; } });
Object.defineProperty(exports, "getProminentColors", { enumerable: true, get: function () { return react_native_color_thief_2.getProminentColors; } });
// Version compatibility utilities
var version_compatibility_1 = require("./version-compatibility");
Object.defineProperty(exports, "checkCompatibility", { enumerable: true, get: function () { return version_compatibility_1.checkCompatibility; } });
Object.defineProperty(exports, "logCompatibilityStatus", { enumerable: true, get: function () { return version_compatibility_1.logCompatibilityStatus; } });
Object.defineProperty(exports, "getRecommendedSkiaVersion", { enumerable: true, get: function () { return version_compatibility_1.getRecommendedSkiaVersion; } });
Object.defineProperty(exports, "supportsVideoFeatures", { enumerable: true, get: function () { return version_compatibility_1.supportsVideoFeatures; } });
Object.defineProperty(exports, "parseVersion", { enumerable: true, get: function () { return version_compatibility_1.parseVersion; } });
Object.defineProperty(exports, "compareVersions", { enumerable: true, get: function () { return version_compatibility_1.compareVersions; } });
Object.defineProperty(exports, "getPackageVersion", { enumerable: true, get: function () { return version_compatibility_1.getPackageVersion; } });
// Color conversion utilities
var color_converters_1 = require("./color-converters");
Object.defineProperty(exports, "formatRGB", { enumerable: true, get: function () { return color_converters_1.formatRGB; } });
// Default export
var react_native_color_thief_3 = require("./react-native-color-thief");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return react_native_color_thief_3.ReactNativeColorThief; } });
