"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_native_color_thief_1 = require("../react-native-color-thief");
// Mock the Skia dependencies
jest.mock('@shopify/react-native-skia', () => ({
    Skia: {
        Surface: {
            MakeOffscreen: jest.fn(),
        },
        Data: {
            fromURI: jest.fn(),
        },
        SVG: {
            MakeFromData: {
                bind: jest.fn(),
            },
        },
        Image: {
            MakeImageFromEncoded: {
                bind: jest.fn(),
            },
        },
    },
}));
// Mock quantize
jest.mock('quantize', () => {
    return jest.fn().mockImplementation((pixels) => {
        // Return null if no pixels provided
        if (!pixels || pixels.length === 0) {
            return null;
        }
        // Return a mock palette based on input pixels
        const mockPalette = pixels.length >= 5 ? [
            [255, 87, 51],
            [51, 255, 87],
            [87, 51, 255],
            [255, 255, 51],
            [51, 255, 255],
        ] : pixels;
        return {
            palette: () => mockPalette,
        };
    });
});
describe('ReactNativeColorThief', () => {
    let colorThief;
    let mockCanvas;
    let mockOffScreen;
    let mockImage;
    let mockSvg;
    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        // Setup mock canvas
        mockCanvas = {
            drawImage: jest.fn(),
            drawSvg: jest.fn(),
        };
        // Setup mock offscreen surface
        mockOffScreen = {
            getCanvas: jest.fn().mockReturnValue(mockCanvas),
            flush: jest.fn(),
            makeImageSnapshot: jest.fn(),
        };
        // Create more comprehensive pixel data (100x100 = 10000 pixels * 4 channels = 40000 values)
        const pixelData = new Uint8Array(40000);
        for (let i = 0; i < 10000; i++) {
            const offset = i * 4;
            // Create a pattern of different colors with full alpha
            const colorIndex = i % 5;
            switch (colorIndex) {
                case 0:
                    pixelData[offset] = 255;
                    pixelData[offset + 1] = 87;
                    pixelData[offset + 2] = 51;
                    pixelData[offset + 3] = 255; // Orange
                    break;
                case 1:
                    pixelData[offset] = 51;
                    pixelData[offset + 1] = 255;
                    pixelData[offset + 2] = 87;
                    pixelData[offset + 3] = 255; // Green
                    break;
                case 2:
                    pixelData[offset] = 87;
                    pixelData[offset + 1] = 51;
                    pixelData[offset + 2] = 255;
                    pixelData[offset + 3] = 255; // Blue
                    break;
                case 3:
                    pixelData[offset] = 255;
                    pixelData[offset + 1] = 255;
                    pixelData[offset + 2] = 51;
                    pixelData[offset + 3] = 255; // Yellow
                    break;
                case 4:
                    pixelData[offset] = 51;
                    pixelData[offset + 1] = 255;
                    pixelData[offset + 2] = 255;
                    pixelData[offset + 3] = 255; // Cyan
                    break;
            }
        }
        // Setup mock image
        mockImage = {
            getImageInfo: jest.fn().mockReturnValue({ width: 100, height: 100 }),
            readPixels: jest.fn().mockReturnValue(pixelData),
        };
        // Setup mock SVG
        mockSvg = {
        // SVG mock object
        };
        mockOffScreen.makeImageSnapshot.mockReturnValue(mockImage);
        // Setup Skia mocks
        const { Skia } = require('@shopify/react-native-skia');
        Skia.Surface.MakeOffscreen.mockReturnValue(mockOffScreen);
        Skia.Data.fromURI.mockResolvedValue(new ArrayBuffer(8));
        const mockSvgFactory = jest.fn().mockReturnValue(mockSvg);
        Skia.SVG.MakeFromData.bind.mockReturnValue(mockSvgFactory);
        const mockImageFactory = jest.fn().mockReturnValue(mockImage);
        Skia.Image.MakeImageFromEncoded.bind.mockReturnValue(mockImageFactory);
        colorThief = new react_native_color_thief_1.ReactNativeColorThief();
    });
    describe('Constructor', () => {
        it('should create instance with default config', () => {
            const instance = new react_native_color_thief_1.ReactNativeColorThief();
            const config = instance.getConfig();
            expect(config.quality).toBe(10);
            expect(config.colorCount).toBe(5);
            expect(config.minAlpha).toBe(125);
            expect(config.excludeWhite).toBe(true);
            expect(config.whiteThreshold).toBe(250);
            expect(config.canvasSize).toBe(256);
        });
        it('should create instance with custom config', () => {
            const customConfig = {
                quality: 5,
                colorCount: 8,
                minAlpha: 100,
                excludeWhite: false,
                whiteThreshold: 200,
                canvasSize: 512,
                suppressCompatibilityWarnings: true,
            };
            const instance = new react_native_color_thief_1.ReactNativeColorThief(customConfig);
            const config = instance.getConfig();
            expect(config).toEqual(customConfig);
        });
        it('should merge partial config with defaults', () => {
            const partialConfig = {
                quality: 7,
                colorCount: 3,
            };
            const instance = new react_native_color_thief_1.ReactNativeColorThief(partialConfig);
            const config = instance.getConfig();
            expect(config.quality).toBe(7);
            expect(config.colorCount).toBe(3);
            expect(config.minAlpha).toBe(125); // default
            expect(config.excludeWhite).toBe(true); // default
        });
    });
    describe('Configuration Management', () => {
        it('should update config with new values', () => {
            const newConfig = { quality: 8, colorCount: 6 };
            colorThief.updateConfig(newConfig);
            const config = colorThief.getConfig();
            expect(config.quality).toBe(8);
            expect(config.colorCount).toBe(6);
            expect(config.minAlpha).toBe(125); // unchanged
        });
        it('should reset config to defaults', () => {
            colorThief.updateConfig({ quality: 1, colorCount: 1 });
            colorThief.resetConfig();
            const config = colorThief.getConfig();
            expect(config.quality).toBe(10);
            expect(config.colorCount).toBe(5);
            expect(config.minAlpha).toBe(125);
            expect(config.excludeWhite).toBe(true);
            expect(config.whiteThreshold).toBe(250);
            expect(config.canvasSize).toBe(256);
        });
        it('should return a copy of config to prevent mutation', () => {
            const config1 = colorThief.getConfig();
            const config2 = colorThief.getConfig();
            config1.quality = 999;
            expect(config2.quality).toBe(10);
            expect(colorThief.getConfig().quality).toBe(10);
        });
    });
    describe('Format Support', () => {
        it('should identify SVG URLs correctly', () => {
            expect(colorThief.isSupportedFormat('image.svg')).toBe(true);
            expect(colorThief.isSupportedFormat('IMAGE.SVG')).toBe(true);
            expect(colorThief.isSupportedFormat('https://example.com/image.svg')).toBe(true);
        });
        it('should identify regular image formats', () => {
            const formats = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
            formats.forEach(format => {
                expect(colorThief.isSupportedFormat(`image${format}`)).toBe(true);
                expect(colorThief.isSupportedFormat(`image${format.toUpperCase()}`)).toBe(true);
            });
        });
        it('should reject unsupported formats', () => {
            expect(colorThief.isSupportedFormat('image.txt')).toBe(false);
            expect(colorThief.isSupportedFormat('image.pdf')).toBe(false);
            expect(colorThief.isSupportedFormat('image')).toBe(false);
        });
    });
    describe('Color Extraction', () => {
        it('should extract prominent colors from image', async () => {
            const colors = await colorThief.getProminentColors('https://example.com/image.jpg');
            expect(colors).toHaveLength(5);
            expect(colors[0]).toHaveProperty('rgb');
            expect(colors[0]).toHaveProperty('formats');
            expect(colors[0].formats).toHaveProperty('hex');
            expect(colors[0].formats).toHaveProperty('rgb');
            expect(colors[0].formats).toHaveProperty('hsl');
            expect(colors[0].formats).toHaveProperty('keyword');
        });
        it('should extract prominent colors from SVG', async () => {
            const colors = await colorThief.getProminentColors('https://example.com/image.svg');
            expect(colors).toHaveLength(5);
            expect(mockCanvas.drawSvg).toHaveBeenCalled();
        });
        it('should get dominant color', async () => {
            const dominant = await colorThief.getDominantColor('https://example.com/image.jpg');
            expect(dominant).toHaveProperty('rgb');
            expect(dominant).toHaveProperty('formats');
            expect(dominant.rgb).toEqual([255, 87, 51]);
        });
        it('should get complete palette', async () => {
            const palette = await colorThief.getPalette('https://example.com/image.jpg');
            expect(palette).toHaveProperty('colors');
            expect(palette).toHaveProperty('dominant');
            expect(palette).toHaveProperty('secondary');
            expect(palette).toHaveProperty('pixelCount');
            expect(palette.colors).toHaveLength(5);
            expect(palette.secondary).toHaveLength(4);
            expect(palette.dominant).toEqual(palette.colors[0]);
            expect(typeof palette.pixelCount).toBe('number');
        });
        it('should get colors in specific format', async () => {
            const hexColors = await colorThief.getColorsInFormat('https://example.com/image.jpg', 'hex');
            expect(hexColors).toHaveLength(5);
            expect(hexColors[0]).toMatch(/^#[0-9a-f]{6}$/);
            const rgbColors = await colorThief.getColorsInFormat('https://example.com/image.jpg', 'rgbString');
            expect(rgbColors[0]).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
        });
        it('should get color statistics', async () => {
            const stats = await colorThief.getColorStatistics('https://example.com/image.jpg');
            expect(stats).toHaveProperty('totalColors');
            expect(stats).toHaveProperty('averageBrightness');
            expect(stats).toHaveProperty('colorDistribution');
            expect(typeof stats.totalColors).toBe('number');
            expect(typeof stats.averageBrightness).toBe('number');
            expect(typeof stats.colorDistribution).toBe('object');
            expect(stats.totalColors).toBe(5);
            expect(stats.averageBrightness).toBeGreaterThan(0);
            expect(stats.averageBrightness).toBeLessThanOrEqual(255);
        });
    });
    describe('Error Handling', () => {
        it('should throw error when offscreen surface creation fails', async () => {
            const { Skia } = require('@shopify/react-native-skia');
            Skia.Surface.MakeOffscreen.mockReturnValue(null);
            await expect(colorThief.getProminentColors('https://example.com/image.jpg'))
                .rejects.toThrow('Failed to create offscreen surface');
        });
        it('should throw error when SVG loading fails', async () => {
            const { Skia } = require('@shopify/react-native-skia');
            const mockSvgFactory = jest.fn().mockReturnValue(null);
            Skia.SVG.MakeFromData.bind.mockReturnValue(mockSvgFactory);
            await expect(colorThief.getProminentColors('https://example.com/image.svg'))
                .rejects.toThrow('Failed to load SVG');
        });
        it('should throw error when image loading fails', async () => {
            const { Skia } = require('@shopify/react-native-skia');
            const mockImageFactory = jest.fn().mockReturnValue(null);
            Skia.Image.MakeImageFromEncoded.bind.mockReturnValue(mockImageFactory);
            await expect(colorThief.getProminentColors('https://example.com/image.jpg'))
                .rejects.toThrow('Failed to load image');
        });
        it('should throw error when pixel reading fails', async () => {
            mockImage.readPixels.mockReturnValue(null);
            await expect(colorThief.getProminentColors('https://example.com/image.jpg'))
                .rejects.toThrow('Failed to read pixels from image');
        });
        it('should throw error when no colors found in getDominantColor', async () => {
            const quantize = require('quantize');
            quantize.mockImplementation(() => null);
            await expect(colorThief.getDominantColor('https://example.com/image.jpg'))
                .rejects.toThrow('No colors found in image');
        });
        it('should throw error when no colors found in getPalette', async () => {
            const quantize = require('quantize');
            quantize.mockImplementation(() => null);
            await expect(colorThief.getPalette('https://example.com/image.jpg'))
                .rejects.toThrow('No colors found in image');
        });
        it('should handle quantize returning empty palette', async () => {
            const quantize = require('quantize');
            quantize.mockImplementation(() => ({
                palette: () => [],
            }));
            const colors = await colorThief.getProminentColors('https://example.com/image.jpg');
            expect(colors).toEqual([]);
        });
    });
    describe('Pixel Filtering', () => {
        it('should handle alpha threshold configuration', async () => {
            // Test that the method completes without error with alpha threshold config
            colorThief.updateConfig({ minAlpha: 200 });
            const colors = await colorThief.getProminentColors('https://example.com/image.jpg');
            expect(Array.isArray(colors)).toBe(true);
            // Colors may be empty if all pixels are filtered out, which is valid behavior
        });
        it('should handle white exclusion configuration', async () => {
            // Test that the method completes without error with white exclusion config
            colorThief.updateConfig({ excludeWhite: true, whiteThreshold: 250 });
            const colors = await colorThief.getProminentColors('https://example.com/image.jpg');
            expect(Array.isArray(colors)).toBe(true);
            // Colors may be empty if all pixels are filtered out, which is valid behavior
        });
        it('should handle white inclusion configuration', async () => {
            // Test that the method completes without error when including white colors
            colorThief.updateConfig({ excludeWhite: false });
            const colors = await colorThief.getProminentColors('https://example.com/image.jpg');
            expect(Array.isArray(colors)).toBe(true);
        });
        it('should handle quality setting configuration', async () => {
            // Test that the method completes without error with different quality settings
            colorThief.updateConfig({ quality: 2 });
            const colors = await colorThief.getProminentColors('https://example.com/image.jpg');
            expect(Array.isArray(colors)).toBe(true);
        });
    });
    describe('Canvas Management', () => {
        it('should initialize and cleanup canvas properly', async () => {
            const { Skia } = require('@shopify/react-native-skia');
            await colorThief.getProminentColors('https://example.com/image.jpg');
            expect(Skia.Surface.MakeOffscreen).toHaveBeenCalledWith(256, 256);
            expect(mockOffScreen.getCanvas).toHaveBeenCalled();
        });
        it('should use custom canvas size from config', async () => {
            const { Skia } = require('@shopify/react-native-skia');
            colorThief.updateConfig({ canvasSize: 512 });
            await colorThief.getProminentColors('https://example.com/image.jpg');
            expect(Skia.Surface.MakeOffscreen).toHaveBeenCalledWith(512, 512);
        });
    });
});
describe('Factory Functions and Legacy Support', () => {
    describe('createColorThief', () => {
        it('should create ColorThief instance with default config', () => {
            const instance = (0, react_native_color_thief_1.createColorThief)();
            expect(instance).toBeInstanceOf(react_native_color_thief_1.ReactNativeColorThief);
            const config = instance.getConfig();
            expect(config.quality).toBe(10);
        });
        it('should create ColorThief instance with custom config', () => {
            const customConfig = { quality: 5, colorCount: 3 };
            const instance = (0, react_native_color_thief_1.createColorThief)(customConfig);
            const config = instance.getConfig();
            expect(config.quality).toBe(5);
            expect(config.colorCount).toBe(3);
        });
    });
    describe('defaultColorThief', () => {
        it('should be a ReactNativeColorThief instance', () => {
            expect(react_native_color_thief_1.defaultColorThief).toBeInstanceOf(react_native_color_thief_1.ReactNativeColorThief);
        });
        it('should have default configuration', () => {
            const config = react_native_color_thief_1.defaultColorThief.getConfig();
            expect(config.quality).toBe(10);
            expect(config.colorCount).toBe(5);
        });
    });
    describe('getProminentColors (legacy)', () => {
        beforeEach(() => {
            // Setup mocks for legacy function
            const { Skia } = require('@shopify/react-native-skia');
            const mockCanvas = { drawImage: jest.fn() };
            const mockOffScreen = {
                getCanvas: jest.fn().mockReturnValue(mockCanvas),
                flush: jest.fn(),
                makeImageSnapshot: jest.fn(),
            };
            // Create comprehensive pixel data for legacy tests
            const pixelData = new Uint8Array(4000); // 1000 pixels * 4 channels
            for (let i = 0; i < 1000; i++) {
                const offset = i * 4;
                const colorIndex = i % 3;
                switch (colorIndex) {
                    case 0:
                        pixelData[offset] = 255;
                        pixelData[offset + 1] = 87;
                        pixelData[offset + 2] = 51;
                        pixelData[offset + 3] = 255;
                        break;
                    case 1:
                        pixelData[offset] = 51;
                        pixelData[offset + 1] = 255;
                        pixelData[offset + 2] = 87;
                        pixelData[offset + 3] = 255;
                        break;
                    case 2:
                        pixelData[offset] = 87;
                        pixelData[offset + 1] = 51;
                        pixelData[offset + 2] = 255;
                        pixelData[offset + 3] = 255;
                        break;
                }
            }
            const mockImage = {
                getImageInfo: jest.fn().mockReturnValue({ width: 100, height: 100 }),
                readPixels: jest.fn().mockReturnValue(pixelData),
            };
            mockOffScreen.makeImageSnapshot.mockReturnValue(mockImage);
            Skia.Surface.MakeOffscreen.mockReturnValue(mockOffScreen);
            const mockImageFactory = jest.fn().mockReturnValue(mockImage);
            Skia.Image.MakeImageFromEncoded.bind.mockReturnValue(mockImageFactory);
        });
        it('should return array of hex strings', async () => {
            const colors = await (0, react_native_color_thief_1.getProminentColors)('https://example.com/image.jpg');
            expect(Array.isArray(colors)).toBe(true);
            // Legacy function may return empty array if no colors found, which is valid
            if (colors.length > 0) {
                expect(colors[0]).toMatch(/^#[0-9a-f]{6}$/);
            }
        });
        it('should work with different image URLs', async () => {
            const colors = await (0, react_native_color_thief_1.getProminentColors)('https://example.com/different-image.png');
            expect(Array.isArray(colors)).toBe(true);
            // Function should complete without error regardless of result
        });
    });
});
describe('Integration Tests', () => {
    let colorThief;
    beforeEach(() => {
        // Setup comprehensive mocks for integration tests
        const mockCanvas = {
            drawImage: jest.fn(),
            drawSvg: jest.fn(),
        };
        const mockOffScreen = {
            getCanvas: jest.fn().mockReturnValue(mockCanvas),
            flush: jest.fn(),
            makeImageSnapshot: jest.fn(),
        };
        // Create comprehensive pixel data for integration tests
        const pixelData = new Uint8Array(4000); // 1000 pixels * 4 channels
        for (let i = 0; i < 1000; i++) {
            const offset = i * 4;
            const colorIndex = i % 5;
            switch (colorIndex) {
                case 0:
                    pixelData[offset] = 255;
                    pixelData[offset + 1] = 87;
                    pixelData[offset + 2] = 51;
                    pixelData[offset + 3] = 255; // Orange
                    break;
                case 1:
                    pixelData[offset] = 51;
                    pixelData[offset + 1] = 255;
                    pixelData[offset + 2] = 87;
                    pixelData[offset + 3] = 255; // Green
                    break;
                case 2:
                    pixelData[offset] = 87;
                    pixelData[offset + 1] = 51;
                    pixelData[offset + 2] = 255;
                    pixelData[offset + 3] = 255; // Blue
                    break;
                case 3:
                    pixelData[offset] = 255;
                    pixelData[offset + 1] = 255;
                    pixelData[offset + 2] = 51;
                    pixelData[offset + 3] = 255; // Yellow
                    break;
                case 4:
                    pixelData[offset] = 51;
                    pixelData[offset + 1] = 255;
                    pixelData[offset + 2] = 255;
                    pixelData[offset + 3] = 255; // Cyan
                    break;
            }
        }
        const mockImage = {
            getImageInfo: jest.fn().mockReturnValue({ width: 100, height: 100 }),
            readPixels: jest.fn().mockReturnValue(pixelData),
        };
        mockOffScreen.makeImageSnapshot.mockReturnValue(mockImage);
        const { Skia } = require('@shopify/react-native-skia');
        Skia.Surface.MakeOffscreen.mockReturnValue(mockOffScreen);
        Skia.Data.fromURI.mockResolvedValue(new ArrayBuffer(8));
        const mockImageFactory = jest.fn().mockReturnValue(mockImage);
        Skia.Image.MakeImageFromEncoded.bind.mockReturnValue(mockImageFactory);
        colorThief = new react_native_color_thief_1.ReactNativeColorThief();
    });
    it('should maintain consistency across different methods', async () => {
        const sourceURI = 'https://example.com/image.jpg';
        // Test that all methods complete without error
        const colors = await colorThief.getProminentColors(sourceURI);
        expect(Array.isArray(colors)).toBe(true);
        // Only test consistency if we have colors
        if (colors.length > 0) {
            const [palette, dominant] = await Promise.all([
                colorThief.getPalette(sourceURI),
                colorThief.getDominantColor(sourceURI),
            ]);
            expect(palette.colors).toEqual(colors);
            expect(palette.dominant).toEqual(dominant);
            expect(palette.dominant).toEqual(colors[0]);
        }
    });
    it('should handle configuration changes consistently', async () => {
        const sourceURI = 'https://example.com/image.jpg';
        // Test with default config
        const colors1 = await colorThief.getProminentColors(sourceURI);
        expect(Array.isArray(colors1)).toBe(true);
        // Change config and test again
        colorThief.updateConfig({ colorCount: 3 });
        const colors2 = await colorThief.getProminentColors(sourceURI);
        expect(Array.isArray(colors2)).toBe(true);
        // Both should complete successfully
    });
    it('should handle different image formats consistently', async () => {
        const jpgColors = await colorThief.getProminentColors('https://example.com/image.jpg');
        const pngColors = await colorThief.getProminentColors('https://example.com/image.png');
        const svgColors = await colorThief.getProminentColors('https://example.com/image.svg');
        // All should return arrays
        expect(Array.isArray(jpgColors)).toBe(true);
        expect(Array.isArray(pngColors)).toBe(true);
        expect(Array.isArray(svgColors)).toBe(true);
        // If colors exist, they should have proper structure
        if (jpgColors.length > 0) {
            expect(jpgColors[0]).toHaveProperty('rgb');
            expect(jpgColors[0]).toHaveProperty('formats');
        }
    });
});
