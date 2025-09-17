"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackageVersion = exports.compareVersions = exports.parseVersion = exports.supportsVideoFeatures = exports.getRecommendedSkiaVersion = exports.logCompatibilityStatus = exports.checkCompatibility = exports.getProminentColors = exports.defaultColorThief = exports.createColorThief = exports.ReactNativeColorThief = void 0;
const react_native_skia_1 = require("@shopify/react-native-skia");
const quantize_1 = __importDefault(require("quantize"));
const color_converters_1 = require("./color-converters");
const version_compatibility_1 = require("./version-compatibility");
/**
 * React Native Color Thief - OOP implementation for extracting prominent colors from images
 *
 * This class provides methods to extract color palettes from images and SVGs using
 * React Native Skia for rendering and quantize.js for color quantization.
 *
 * @example
 * ```typescript
 * // Basic usage
 * const colorThief = new ReactNativeColorThief();
 * const colors = await colorThief.getProminentColors('https://example.com/image.jpg');
 *
 * // Custom configuration
 * const customColorThief = new ReactNativeColorThief({
 *   quality: 8,
 *   colorCount: 6,
 *   excludeWhite: false
 * });
 * const palette = await customColorThief.getPalette('https://example.com/image.jpg');
 * ```
 *
 * @class ReactNativeColorThief
 */
class ReactNativeColorThief {
    /**
     * Creates an instance of ReactNativeColorThief
     *
     * @param {ColorThiefConfig} [config={}] - Configuration options for color extraction
     * @example
     * ```typescript
     * // Default configuration
     * const colorThief = new ReactNativeColorThief();
     *
     * // Custom configuration
     * const colorThief = new ReactNativeColorThief({
     *   quality: 5,
     *   colorCount: 8,
     *   minAlpha: 100,
     *   excludeWhite: false,
     *   whiteThreshold: 200,
     *   canvasSize: 512
     * });
     * ```
     */
    constructor(config = {}) {
        /** Offscreen surface for image processing */
        this.offScreen = null;
        /** Canvas for drawing operations */
        this.canvas = null;
        this.config = {
            quality: config.quality ?? 10,
            colorCount: config.colorCount ?? 5,
            minAlpha: config.minAlpha ?? 125,
            excludeWhite: config.excludeWhite ?? true,
            whiteThreshold: config.whiteThreshold ?? 250,
            canvasSize: config.canvasSize ?? 256,
            suppressCompatibilityWarnings: config.suppressCompatibilityWarnings ?? false,
        };
        // Check version compatibility on initialization
        if (!this.config.suppressCompatibilityWarnings) {
            const isCompatible = (0, version_compatibility_1.logCompatibilityStatus)();
            if (!isCompatible) {
                console.warn('🎨 react-native-color-thief may not work correctly with incompatible versions. ' +
                    'Please update your dependencies or set suppressCompatibilityWarnings: true to hide this warning.');
            }
        }
    }
    /**
     * Initialize the canvas and offscreen surface for image processing
     *
     * @private
     * @throws {Error} When offscreen surface creation fails
     * @returns {void}
     */
    initializeCanvas() {
        this.offScreen = react_native_skia_1.Skia.Surface.MakeOffscreen(this.config.canvasSize, this.config.canvasSize);
        if (!this.offScreen) {
            throw new Error("Failed to create offscreen surface");
        }
        this.canvas = this.offScreen.getCanvas();
    }
    /**
     * Clean up resources and reset internal state
     *
     * @private
     * @returns {void}
     */
    cleanup() {
        this.offScreen = null;
        this.canvas = null;
    }
    /**
     * Check if the provided URL ends with SVG extension
     *
     * @private
     * @param {string} url - URL to check
     * @returns {boolean} True if URL ends with .svg (case insensitive)
     */
    isURLEndsWithSVG(url) {
        return url.toLowerCase().endsWith(".svg");
    }
    /**
     * Create pixel array from image data with filtering applied
     *
     * @private
     * @param {Uint8Array<ArrayBufferLike> | Float32Array<ArrayBufferLike>} imgData - Raw image pixel data
     * @param {number} pixelCount - Total number of pixels in the image
     * @returns {number[][]} Array of RGB pixel values after filtering
     */
    createPixelArray(imgData, pixelCount) {
        const pixelArray = [];
        for (let i = 0; i < pixelCount; i += this.config.quality) {
            const offset = i * 4;
            const [r, g, b, a] = imgData.slice(offset, offset + 4);
            // Check alpha threshold
            if (typeof a === "undefined" || a >= this.config.minAlpha) {
                // Check white exclusion
                if (!this.config.excludeWhite ||
                    !(r > this.config.whiteThreshold &&
                        g > this.config.whiteThreshold &&
                        b > this.config.whiteThreshold)) {
                    pixelArray.push([r, g, b]);
                }
            }
        }
        return pixelArray;
    }
    /**
     * Process SVG image and extract pixel data
     *
     * @private
     * @param {string} sourceURI - URI of the SVG file
     * @returns {Promise<number[][]>} Array of RGB pixel values
     * @throws {Error} When canvas is not initialized or SVG processing fails
     */
    async processSVG(sourceURI) {
        if (!this.canvas || !this.offScreen) {
            throw new Error("Canvas not initialized");
        }
        const svgURI = await react_native_skia_1.Skia.Data.fromURI(sourceURI);
        const svgFactory = react_native_skia_1.Skia.SVG.MakeFromData.bind(react_native_skia_1.Skia.SVG);
        const svg = svgFactory(svgURI);
        if (!svg) {
            throw new Error("Failed to load SVG");
        }
        this.canvas.drawSvg(svg);
        this.offScreen.flush();
        const image = this.offScreen.makeImageSnapshot();
        const { width, height } = image.getImageInfo();
        const pixels = image.readPixels();
        const pixelCount = width * height;
        if (!pixels) {
            throw new Error("Failed to read pixels from SVG");
        }
        return this.createPixelArray(pixels, pixelCount);
    }
    /**
     * Process regular image (JPG, PNG, etc.) and extract pixel data
     *
     * @private
     * @param {string} sourceURI - URI of the image file
     * @returns {Promise<number[][]>} Array of RGB pixel values
     * @throws {Error} When canvas is not initialized or image processing fails
     */
    async processImage(sourceURI) {
        if (!this.canvas || !this.offScreen) {
            throw new Error("Canvas not initialized");
        }
        const imageURI = await react_native_skia_1.Skia.Data.fromURI(sourceURI);
        const imgFactory = react_native_skia_1.Skia.Image.MakeImageFromEncoded.bind(react_native_skia_1.Skia.Image);
        const image = imgFactory(imageURI);
        if (!image) {
            throw new Error("Failed to load image");
        }
        this.canvas.drawImage(image, 0, 0);
        this.offScreen.flush();
        const { width, height } = image.getImageInfo();
        const pixels = image.readPixels();
        const pixelCount = width * height;
        if (!pixels) {
            throw new Error("Failed to read pixels from image");
        }
        return this.createPixelArray(pixels, pixelCount);
    }
    /**
     * Quantize colors using the quantize library to reduce color palette
     *
     * @private
     * @param {number[][]} pixelArray - Array of RGB pixel values
     * @returns {quantize.RgbPixel[] | null} Quantized color palette or null if empty
     */
    quantizeColors(pixelArray) {
        if (pixelArray.length === 0) {
            return null;
        }
        const cmap = (0, quantize_1.default)(pixelArray, this.config.colorCount);
        return cmap ? cmap.palette() : null;
    }
    /**
     * Convert RGB array to ColorResult with formatted color strings
     *
     * @private
     * @param {ArrayRGB} rgb - RGB color array [red, green, blue]
     * @param {number} [weight] - Optional weight/frequency of the color
     * @returns {ColorResult} Complete color result with formatted strings
     */
    createColorResult(rgb, weight) {
        return {
            rgb,
            formats: {
                hex: (0, color_converters_1.formatRGB)(rgb, "hex"),
                rgb: (0, color_converters_1.formatRGB)(rgb, "rgbString"),
                hsl: (0, color_converters_1.formatRGB)(rgb, "hslString"),
                keyword: (0, color_converters_1.formatRGB)(rgb, "keyword"),
            },
            weight,
        };
    }
    /**
     * Get prominent colors from an image or SVG
     *
     * Extracts the most prominent colors from the provided image URI using the current configuration.
     * Supports both regular images (JPG, PNG, GIF, BMP, WebP) and SVG files.
     *
     * @param {string} sourceURI - URI of the image or SVG file
     * @returns {Promise<ColorResult[]>} Array of prominent colors sorted by prominence
     * @throws {Error} When image processing fails or no colors are found
     *
     * @example
     * ```typescript
     * const colorThief = new ReactNativeColorThief();
     * const colors = await colorThief.getProminentColors('https://example.com/image.jpg');
     * console.log(colors[0].formats.hex); // "#FF5733"
     * ```
     */
    async getProminentColors(sourceURI) {
        try {
            this.initializeCanvas();
            const sourceType = this.isURLEndsWithSVG(sourceURI) ? "svg" : "image";
            let pixelArray;
            if (sourceType === "svg") {
                pixelArray = await this.processSVG(sourceURI);
            }
            else {
                pixelArray = await this.processImage(sourceURI);
            }
            const palette = this.quantizeColors(pixelArray);
            if (!palette || palette.length === 0) {
                return [];
            }
            return palette.map((color) => this.createColorResult(color));
        }
        catch (error) {
            throw new Error(`Failed to extract colors: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
        finally {
            this.cleanup();
        }
    }
    /**
     * Get a complete palette with dominant and secondary colors
     *
     * Extracts all prominent colors and organizes them into a structured palette result
     * with dominant color, secondary colors, and metadata.
     *
     * @param {string} sourceURI - URI of the image or SVG file
     * @returns {Promise<PaletteResult>} Complete palette analysis with dominant and secondary colors
     * @throws {Error} When image processing fails or no colors are found
     *
     * @example
     * ```typescript
     * const colorThief = new ReactNativeColorThief();
     * const palette = await colorThief.getPalette('https://example.com/image.jpg');
     * console.log('Dominant color:', palette.dominant.formats.hex);
     * console.log('Secondary colors:', palette.secondary.length);
     * ```
     */
    async getPalette(sourceURI) {
        try {
            const colors = await this.getProminentColors(sourceURI);
            if (colors.length === 0) {
                throw new Error("No colors found in image");
            }
            const dominant = colors[0];
            const secondary = colors.slice(1);
            return {
                colors,
                dominant,
                secondary,
                pixelCount: colors.length * this.config.quality,
            };
        }
        catch (error) {
            throw new Error(`Failed to get palette: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * Get only the dominant (most prominent) color from an image
     *
     * A convenience method that returns only the most prominent color from the image.
     * This is useful when you only need the primary color for UI theming.
     *
     * @param {string} sourceURI - URI of the image or SVG file
     * @returns {Promise<ColorResult>} The most prominent color in the image
     * @throws {Error} When image processing fails or no colors are found
     *
     * @example
     * ```typescript
     * const colorThief = new ReactNativeColorThief();
     * const dominant = await colorThief.getDominantColor('https://example.com/image.jpg');
     * console.log('Primary color:', dominant.formats.hex); // "#FF5733"
     * ```
     */
    async getDominantColor(sourceURI) {
        try {
            const colors = await this.getProminentColors(sourceURI);
            if (colors.length === 0) {
                throw new Error("No colors found in image");
            }
            return colors[0];
        }
        catch (error) {
            throw new Error(`Failed to get dominant color: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * Get colors in a specific string format
     *
     * Extracts prominent colors and returns them as an array of strings in the specified format.
     * Useful when you need colors in a specific format for styling or display purposes.
     *
     * @param {string} sourceURI - URI of the image or SVG file
     * @param {ColorFormats} format - Desired color format (hex, rgbString, hslString, keyword)
     * @returns {Promise<string[]>} Array of colors in the specified format
     * @throws {Error} When image processing fails or format is invalid
     *
     * @example
     * ```typescript
     * const colorThief = new ReactNativeColorThief();
     * const hexColors = await colorThief.getColorsInFormat('https://example.com/image.jpg', 'hex');
     * console.log(hexColors); // ["#FF5733", "#33FF57", "#5733FF"]
     *
     * const rgbColors = await colorThief.getColorsInFormat('https://example.com/image.jpg', 'rgbString');
     * console.log(rgbColors); // ["rgb(255, 87, 51)", "rgb(51, 255, 87)", "rgb(87, 51, 255)"]
     * ```
     */
    async getColorsInFormat(sourceURI, format) {
        try {
            const colors = await this.getProminentColors(sourceURI);
            return colors.map((color) => (0, color_converters_1.formatRGB)(color.rgb, format));
        }
        catch (error) {
            throw new Error(`Failed to get colors in format: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * Update configuration with new settings
     *
     * Allows dynamic updating of configuration options without creating a new instance.
     * Only the provided options will be updated, others will remain unchanged.
     *
     * @param {Partial<ColorThiefConfig>} newConfig - Partial configuration object with new settings
     * @returns {void}
     *
     * @example
     * ```typescript
     * const colorThief = new ReactNativeColorThief();
     * colorThief.updateConfig({ quality: 5, colorCount: 8 });
     * ```
     */
    updateConfig(newConfig) {
        this.config = {
            ...this.config,
            ...newConfig,
        };
    }
    /**
     * Get current configuration settings
     *
     * Returns a copy of the current configuration object. Useful for debugging
     * or when you need to check the current settings.
     *
     * @returns {ColorThiefConfig} Copy of current configuration
     *
     * @example
     * ```typescript
     * const colorThief = new ReactNativeColorThief();
     * const config = colorThief.getConfig();
     * console.log('Current quality:', config.quality);
     * ```
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Reset configuration to default values
     *
     * Restores all configuration options to their default values.
     * Useful when you want to start fresh with default settings.
     *
     * @returns {void}
     *
     * @example
     * ```typescript
     * const colorThief = new ReactNativeColorThief({ quality: 3 });
     * colorThief.resetConfig(); // Back to quality: 10
     * ```
     */
    resetConfig() {
        this.config = {
            quality: 10,
            colorCount: 5,
            minAlpha: 125,
            excludeWhite: true,
            whiteThreshold: 250,
            canvasSize: 256,
            suppressCompatibilityWarnings: false,
        };
    }
    /**
     * Validate if the source URI is supported
     *
     * Checks if the provided URI points to a supported image format.
     * Supported formats include: JPG, JPEG, PNG, GIF, BMP, WebP, and SVG.
     *
     * @param {string} sourceURI - URI to validate
     * @returns {boolean} True if the URI points to a supported format
     *
     * @example
     * ```typescript
     * const colorThief = new ReactNativeColorThief();
     * if (colorThief.isSupportedFormat('https://example.com/image.jpg')) {
     *   const colors = await colorThief.getProminentColors('https://example.com/image.jpg');
     * }
     * ```
     */
    isSupportedFormat(sourceURI) {
        const supportedExtensions = [
            ".jpg",
            ".jpeg",
            ".png",
            ".gif",
            ".bmp",
            ".webp",
            ".svg",
        ];
        const lowerURI = sourceURI.toLowerCase();
        return supportedExtensions.some((ext) => lowerURI.endsWith(ext));
    }
    /**
     * Check version compatibility for React, React Native, and Skia
     *
     * Validates that the current environment has compatible versions of all required dependencies.
     * Returns detailed compatibility information including warnings and errors.
     *
     * @returns {object} Compatibility check results
     * @returns {boolean} isCompatible - Whether all dependencies are compatible
     * @returns {boolean} hasWarnings - Whether there are any compatibility warnings
     * @returns {object} react - React compatibility details
     * @returns {object} reactNative - React Native compatibility details
     * @returns {object} skia - React Native Skia compatibility details
     * @returns {string[]} platformRequirements - Platform version requirements
     *
     * @example
     * ```typescript
     * const colorThief = new ReactNativeColorThief();
     * const compatibility = colorThief.checkVersionCompatibility();
     *
     * if (!compatibility.isCompatible) {
     *   console.error('Incompatible versions detected:', compatibility);
     * }
     *
     * if (compatibility.hasWarnings) {
     *   console.warn('Version warnings:', compatibility);
     * }
     * ```
     */
    checkVersionCompatibility() {
        return (0, version_compatibility_1.checkCompatibility)();
    }
    /**
     * Get detailed color statistics from an image
     *
     * Analyzes the extracted colors and provides statistical information including
     * total color count, average brightness, and color distribution weights.
     *
     * @param {string} sourceURI - URI of the image or SVG file
     * @returns {Promise<object>} Object containing color statistics
     * @returns {number} totalColors - Total number of colors found
     * @returns {number} averageBrightness - Average brightness across all colors (0-255)
     * @returns {Object} colorDistribution - Weighted distribution of colors by hex value
     * @throws {Error} When image processing fails
     *
     * @example
     * ```typescript
     * const colorThief = new ReactNativeColorThief();
     * const stats = await colorThief.getColorStatistics('https://example.com/image.jpg');
     * console.log('Total colors:', stats.totalColors);
     * console.log('Average brightness:', stats.averageBrightness);
     * console.log('Color distribution:', stats.colorDistribution);
     * ```
     */
    async getColorStatistics(sourceURI) {
        try {
            const palette = await this.getPalette(sourceURI);
            const averageBrightness = palette.colors.reduce((sum, color) => {
                const [r, g, b] = color.rgb;
                return sum + (r + g + b) / 3;
            }, 0) / palette.colors.length;
            const colorDistribution = {};
            palette.colors.forEach((color, index) => {
                colorDistribution[color.formats.hex] =
                    (palette.colors.length - index) / palette.colors.length;
            });
            return {
                totalColors: palette.colors.length,
                averageBrightness,
                colorDistribution,
            };
        }
        catch (error) {
            throw new Error(`Failed to get color statistics: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
}
exports.ReactNativeColorThief = ReactNativeColorThief;
/**
 * Factory function to create a ColorThief instance
 *
 * A convenience function that creates a new ReactNativeColorThief instance with optional configuration.
 * This is useful when you prefer functional programming style or want to create instances dynamically.
 *
 * @param {ColorThiefConfig} [config] - Optional configuration options
 * @returns {ReactNativeColorThief} New ColorThief instance
 *
 * @example
 * ```typescript
 * // Create with default configuration
 * const colorThief = createColorThief();
 *
 * // Create with custom configuration
 * const colorThief = createColorThief({
 *   quality: 8,
 *   colorCount: 6,
 *   excludeWhite: false
 * });
 * ```
 */
const createColorThief = (config) => {
    return new ReactNativeColorThief(config);
};
exports.createColorThief = createColorThief;
/**
 * Default ColorThief instance with default configuration
 *
 * A pre-configured instance that can be used immediately without creating a new instance.
 * Useful for simple use cases or when you want to share a single instance across your application.
 *
 * @constant {ReactNativeColorThief}
 *
 * @example
 * ```typescript
 * // Use the default instance directly
 * const colors = await defaultColorThief.getProminentColors('https://example.com/image.jpg');
 * ```
 */
exports.defaultColorThief = new ReactNativeColorThief();
/**
 * Legacy function for backward compatibility
 *
 * This function maintains backward compatibility with the original color-thief implementation.
 * It returns colors as hex strings only, unlike the new class-based approach.
 *
 * @deprecated Use ReactNativeColorThief class instead for better functionality and type safety
 * @param {string} sourceURI - URI of the image or SVG file
 * @returns {Promise<string[]>} Array of hex color strings
 *
 * @example
 * ```typescript
 * // Legacy usage (deprecated)
 * const hexColors = await getProminentColors('https://example.com/image.jpg');
 *
 * // Recommended usage
 * const colorThief = new ReactNativeColorThief();
 * const colors = await colorThief.getProminentColors('https://example.com/image.jpg');
 * const hexColors = colors.map(color => color.formats.hex);
 * ```
 */
const getProminentColors = async (sourceURI) => {
    const colorThief = new ReactNativeColorThief();
    const colors = await colorThief.getProminentColors(sourceURI);
    return colors.map((color) => color.formats.hex);
};
exports.getProminentColors = getProminentColors;
// Export version compatibility utilities
var version_compatibility_2 = require("./version-compatibility");
Object.defineProperty(exports, "checkCompatibility", { enumerable: true, get: function () { return version_compatibility_2.checkCompatibility; } });
Object.defineProperty(exports, "logCompatibilityStatus", { enumerable: true, get: function () { return version_compatibility_2.logCompatibilityStatus; } });
Object.defineProperty(exports, "getRecommendedSkiaVersion", { enumerable: true, get: function () { return version_compatibility_2.getRecommendedSkiaVersion; } });
Object.defineProperty(exports, "supportsVideoFeatures", { enumerable: true, get: function () { return version_compatibility_2.supportsVideoFeatures; } });
Object.defineProperty(exports, "parseVersion", { enumerable: true, get: function () { return version_compatibility_2.parseVersion; } });
Object.defineProperty(exports, "compareVersions", { enumerable: true, get: function () { return version_compatibility_2.compareVersions; } });
Object.defineProperty(exports, "getPackageVersion", { enumerable: true, get: function () { return version_compatibility_2.getPackageVersion; } });
