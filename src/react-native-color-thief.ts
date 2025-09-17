import { SkCanvas, SkSurface, Skia } from "@shopify/react-native-skia";
import quantize from "quantize";
import { ArrayRGB, ColorFormats, formatRGB } from "./color-converters";

/**
 * Configuration options for the ColorThief class
 *
 * @interface ColorThiefConfig
 */
export interface ColorThiefConfig {
  /**
   * Quality of color extraction (1-10, higher = better quality but slower)
   * @default 10
   */
  quality?: number;
  /**
   * Number of colors to extract from the image
   * @default 5
   */
  colorCount?: number;
  /**
   * Minimum alpha value for pixel inclusion (0-255)
   * Pixels with alpha below this value will be ignored
   * @default 125
   */
  minAlpha?: number;
  /**
   * Whether to exclude near-white colors from the palette
   * @default true
   */
  excludeWhite?: boolean;
  /**
   * White threshold for exclusion (0-255)
   * Colors with RGB values above this threshold will be considered white
   * @default 250
   */
  whiteThreshold?: number;
  /**
   * Canvas size for processing images (width and height)
   * Larger canvas provides better quality but uses more memory
   * @default 256
   */
  canvasSize?: number;
}

/**
 * Color analysis result containing RGB values and formatted color strings
 *
 * @interface ColorResult
 */
export interface ColorResult {
  /** RGB color array [red, green, blue] with values 0-255 */
  rgb: ArrayRGB;
  /** Color in various string formats for easy use in styling */
  formats: {
    /** Hexadecimal color string (e.g., "#FF5733") */
    hex: string;
    /** RGB color string (e.g., "rgb(255, 87, 51)") */
    rgb: string;
    /** HSL color string (e.g., "hsl(12, 100%, 60%)") */
    hsl: string;
    /** CSS color keyword if available (e.g., "red", "blue") */
    keyword: string;
  };
  /**
   * Color frequency/weight in the image (optional)
   * Higher values indicate the color appears more frequently
   */
  weight?: number;
}

/**
 * Complete palette extraction result with dominant and secondary colors
 *
 * @interface PaletteResult
 */
export interface PaletteResult {
  /** Array of all extracted colors sorted by prominence */
  colors: ColorResult[];
  /** The most prominent/dominant color in the image */
  dominant: ColorResult;
  /** Secondary colors (all colors except the dominant one) */
  secondary: ColorResult[];
  /** Total number of pixels analyzed during color extraction */
  pixelCount: number;
}

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
export class ReactNativeColorThief {
  /** Current configuration settings */
  private config: Required<ColorThiefConfig>;
  /** Offscreen surface for image processing */
  private offScreen: SkSurface | null = null;
  /** Canvas for drawing operations */
  private canvas: SkCanvas | null = null;

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
  constructor(config: ColorThiefConfig = {}) {
    this.config = {
      quality: config.quality ?? 10,
      colorCount: config.colorCount ?? 5,
      minAlpha: config.minAlpha ?? 125,
      excludeWhite: config.excludeWhite ?? true,
      whiteThreshold: config.whiteThreshold ?? 250,
      canvasSize: config.canvasSize ?? 256,
    };
  }

  /**
   * Initialize the canvas and offscreen surface for image processing
   *
   * @private
   * @throws {Error} When offscreen surface creation fails
   * @returns {void}
   */
  private initializeCanvas(): void {
    this.offScreen = Skia.Surface.MakeOffscreen(
      this.config.canvasSize,
      this.config.canvasSize
    );

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
  private cleanup(): void {
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
  private isURLEndsWithSVG(url: string): boolean {
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
  private createPixelArray(
    imgData: Uint8Array<ArrayBufferLike> | Float32Array<ArrayBufferLike>,
    pixelCount: number
  ): number[][] {
    const pixelArray: number[][] = [];

    for (let i = 0; i < pixelCount; i += this.config.quality) {
      const offset = i * 4;
      const [r, g, b, a] = imgData.slice(offset, offset + 4);

      // Check alpha threshold
      if (typeof a === "undefined" || a >= this.config.minAlpha) {
        // Check white exclusion
        if (
          !this.config.excludeWhite ||
          !(
            r > this.config.whiteThreshold &&
            g > this.config.whiteThreshold &&
            b > this.config.whiteThreshold
          )
        ) {
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
  private async processSVG(sourceURI: string): Promise<number[][]> {
    if (!this.canvas || !this.offScreen) {
      throw new Error("Canvas not initialized");
    }

    const svgURI = await Skia.Data.fromURI(sourceURI);
    const svgFactory = Skia.SVG.MakeFromData.bind(Skia.SVG);
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
  private async processImage(sourceURI: string): Promise<number[][]> {
    if (!this.canvas || !this.offScreen) {
      throw new Error("Canvas not initialized");
    }

    const imageURI = await Skia.Data.fromURI(sourceURI);
    const imgFactory = Skia.Image.MakeImageFromEncoded.bind(Skia.Image);
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
  private quantizeColors(pixelArray: number[][]): quantize.RgbPixel[] | null {
    if (pixelArray.length === 0) {
      return null;
    }

    const cmap = quantize(
      pixelArray as [number, number, number][],
      this.config.colorCount
    );
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
  private createColorResult(rgb: ArrayRGB, weight?: number): ColorResult {
    return {
      rgb,
      formats: {
        hex: formatRGB(rgb, "hex"),
        rgb: formatRGB(rgb, "rgbString"),
        hsl: formatRGB(rgb, "hslString"),
        keyword: formatRGB(rgb, "keyword"),
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
  public async getProminentColors(sourceURI: string): Promise<ColorResult[]> {
    try {
      this.initializeCanvas();

      const sourceType = this.isURLEndsWithSVG(sourceURI) ? "svg" : "image";
      let pixelArray: number[][];

      if (sourceType === "svg") {
        pixelArray = await this.processSVG(sourceURI);
      } else {
        pixelArray = await this.processImage(sourceURI);
      }

      const palette = this.quantizeColors(pixelArray);

      if (!palette || palette.length === 0) {
        return [];
      }

      return palette.map((color) => this.createColorResult(color));
    } catch (error) {
      throw new Error(
        `Failed to extract colors: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
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
  public async getPalette(sourceURI: string): Promise<PaletteResult> {
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
    } catch (error) {
      throw new Error(
        `Failed to get palette: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
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
  public async getDominantColor(sourceURI: string): Promise<ColorResult> {
    try {
      const colors = await this.getProminentColors(sourceURI);

      if (colors.length === 0) {
        throw new Error("No colors found in image");
      }

      return colors[0];
    } catch (error) {
      throw new Error(
        `Failed to get dominant color: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
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
  public async getColorsInFormat(
    sourceURI: string,
    format: ColorFormats
  ): Promise<string[]> {
    try {
      const colors = await this.getProminentColors(sourceURI);
      return colors.map((color) => formatRGB(color.rgb, format) as string);
    } catch (error) {
      throw new Error(
        `Failed to get colors in format: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
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
  public updateConfig(newConfig: Partial<ColorThiefConfig>): void {
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
  public getConfig(): ColorThiefConfig {
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
  public resetConfig(): void {
    this.config = {
      quality: 10,
      colorCount: 5,
      minAlpha: 125,
      excludeWhite: true,
      whiteThreshold: 250,
      canvasSize: 256,
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
  public isSupportedFormat(sourceURI: string): boolean {
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
  public async getColorStatistics(sourceURI: string): Promise<{
    totalColors: number;
    averageBrightness: number;
    colorDistribution: { [key: string]: number };
  }> {
    try {
      const palette = await this.getPalette(sourceURI);

      const averageBrightness =
        palette.colors.reduce((sum, color) => {
          const [r, g, b] = color.rgb;
          return sum + (r + g + b) / 3;
        }, 0) / palette.colors.length;

      const colorDistribution: { [key: string]: number } = {};
      palette.colors.forEach((color, index) => {
        colorDistribution[color.formats.hex] =
          (palette.colors.length - index) / palette.colors.length;
      });

      return {
        totalColors: palette.colors.length,
        averageBrightness,
        colorDistribution,
      };
    } catch (error) {
      throw new Error(
        `Failed to get color statistics: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

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
export const createColorThief = (
  config?: ColorThiefConfig
): ReactNativeColorThief => {
  return new ReactNativeColorThief(config);
};

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
export const defaultColorThief = new ReactNativeColorThief();

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
export const getProminentColors = async (
  sourceURI: string
): Promise<string[]> => {
  const colorThief = new ReactNativeColorThief();
  const colors = await colorThief.getProminentColors(sourceURI);
  return colors.map((color) => color.formats.hex);
};
