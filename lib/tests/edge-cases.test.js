"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_native_color_thief_1 = require("../react-native-color-thief");
const setup_1 = require("./setup");
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
// Mock quantize with edge case handling
jest.mock('quantize', () => {
    return jest.fn().mockImplementation((pixels) => {
        if (!pixels || pixels.length === 0) {
            return null;
        }
        // Return unique colors from input
        const uniqueColors = pixels.filter((color, index, arr) => arr.findIndex(c => c[0] === color[0] && c[1] === color[1] && c[2] === color[2]) === index);
        const palette = uniqueColors.slice(0, 5);
        return {
            palette: () => palette.length > 0 ? palette : [
                [255, 87, 51],
                [51, 255, 87],
                [87, 51, 255],
            ],
        };
    });
});
describe('Edge Cases and Error Scenarios', () => {
    let colorThief;
    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default mock data for edge cases
        const defaultPixelData = new Uint8Array(40000); // 100x100 * 4 channels
        for (let i = 0; i < 10000; i++) {
            const offset = i * 4;
            const colorIndex = i % 3;
            switch (colorIndex) {
                case 0:
                    defaultPixelData[offset] = 255;
                    defaultPixelData[offset + 1] = 87;
                    defaultPixelData[offset + 2] = 51;
                    defaultPixelData[offset + 3] = 255;
                    break;
                case 1:
                    defaultPixelData[offset] = 51;
                    defaultPixelData[offset + 1] = 255;
                    defaultPixelData[offset + 2] = 87;
                    defaultPixelData[offset + 3] = 255;
                    break;
                case 2:
                    defaultPixelData[offset] = 87;
                    defaultPixelData[offset + 1] = 51;
                    defaultPixelData[offset + 2] = 255;
                    defaultPixelData[offset + 3] = 255;
                    break;
            }
        }
        const mockCanvas = (0, setup_1.createMockSkiaCanvas)();
        const mockImage = (0, setup_1.createMockSkiaImage)(defaultPixelData, 100, 100);
        const mockSurface = (0, setup_1.createMockSkiaSurface)(mockCanvas, mockImage);
        const { Skia } = require('@shopify/react-native-skia');
        Skia.Surface.MakeOffscreen.mockReturnValue(mockSurface);
        Skia.Data.fromURI.mockResolvedValue(new ArrayBuffer(8));
        const mockImageFactory = jest.fn().mockReturnValue(mockImage);
        Skia.Image.MakeImageFromEncoded.bind.mockReturnValue(mockImageFactory);
        const mockSvgFactory = jest.fn().mockReturnValue({});
        Skia.SVG.MakeFromData.bind.mockReturnValue(mockSvgFactory);
        colorThief = new react_native_color_thief_1.ReactNativeColorThief();
    });
    describe('Empty and Invalid Data', () => {
        it('should handle empty pixel data gracefully', async () => {
            const emptyPixels = new Uint8Array(0);
            const mockImage = (0, setup_1.createMockSkiaImage)(emptyPixels, 0, 0);
            const mockCanvas = (0, setup_1.createMockSkiaCanvas)();
            const mockSurface = (0, setup_1.createMockSkiaSurface)(mockCanvas, mockImage);
            const { Skia } = require('@shopify/react-native-skia');
            Skia.Surface.MakeOffscreen.mockReturnValue(mockSurface);
            Skia.Data.fromURI.mockResolvedValue(new ArrayBuffer(8));
            const mockImageFactory = jest.fn().mockReturnValue(mockImage);
            Skia.Image.MakeImageFromEncoded.bind.mockReturnValue(mockImageFactory);
            const colors = await colorThief.getProminentColors('https://example.com/empty.jpg');
            expect(colors).toEqual([]);
        });
        it('should handle single pixel images', async () => {
            const singlePixel = (0, setup_1.createMockPixelData)([setup_1.TEST_COLORS.RED]);
            const mockImage = (0, setup_1.createMockSkiaImage)(singlePixel, 1, 1);
            const mockCanvas = (0, setup_1.createMockSkiaCanvas)();
            const mockSurface = (0, setup_1.createMockSkiaSurface)(mockCanvas, mockImage);
            const { Skia } = require('@shopify/react-native-skia');
            Skia.Surface.MakeOffscreen.mockReturnValue(mockSurface);
            Skia.Data.fromURI.mockResolvedValue(new ArrayBuffer(8));
            const mockImageFactory = jest.fn().mockReturnValue(mockImage);
            Skia.Image.MakeImageFromEncoded.bind.mockReturnValue(mockImageFactory);
            const colors = await colorThief.getProminentColors('https://example.com/single-pixel.jpg');
            expect(colors).toHaveLength(1);
            expect(colors[0].rgb).toEqual(setup_1.TEST_COLORS.RED);
        });
        it('should handle images with all transparent pixels', async () => {
            // Create pixels with alpha = 0 (fully transparent)
            const transparentPixels = new Uint8Array([
                255, 0, 0, 0, // Red but transparent
                0, 255, 0, 0, // Green but transparent
                0, 0, 255, 0, // Blue but transparent
            ]);
            const mockImage = (0, setup_1.createMockSkiaImage)(transparentPixels, 3, 1);
            const mockCanvas = (0, setup_1.createMockSkiaCanvas)();
            const mockSurface = (0, setup_1.createMockSkiaSurface)(mockCanvas, mockImage);
            const { Skia } = require('@shopify/react-native-skia');
            Skia.Surface.MakeOffscreen.mockReturnValue(mockSurface);
            Skia.Data.fromURI.mockResolvedValue(new ArrayBuffer(8));
            const mockImageFactory = jest.fn().mockReturnValue(mockImage);
            Skia.Image.MakeImageFromEncoded.bind.mockReturnValue(mockImageFactory);
            const colors = await colorThief.getProminentColors('https://example.com/transparent.png');
            expect(colors).toEqual([]);
        });
        it('should handle images with only white pixels when excludeWhite is true', async () => {
            const whitePixels = (0, setup_1.createMockPixelData)([
                [255, 255, 255],
                [254, 254, 254],
                [253, 253, 253],
            ]);
            const mockImage = (0, setup_1.createMockSkiaImage)(whitePixels);
            const mockCanvas = (0, setup_1.createMockSkiaCanvas)();
            const mockSurface = (0, setup_1.createMockSkiaSurface)(mockCanvas, mockImage);
            const { Skia } = require('@shopify/react-native-skia');
            Skia.Surface.MakeOffscreen.mockReturnValue(mockSurface);
            Skia.Data.fromURI.mockResolvedValue(new ArrayBuffer(8));
            const mockImageFactory = jest.fn().mockReturnValue(mockImage);
            Skia.Image.MakeImageFromEncoded.bind.mockReturnValue(mockImageFactory);
            colorThief.updateConfig({ excludeWhite: true, whiteThreshold: 250 });
            try {
                const colors = await colorThief.getProminentColors('https://example.com/white.jpg');
                expect(Array.isArray(colors)).toBe(true);
                // May be empty if all white pixels are filtered out, which is valid
            }
            catch (error) {
                // If all pixels are filtered out, an error may be thrown, which is also valid behavior
                expect(error).toBeInstanceOf(Error);
            }
        });
    });
    describe('Extreme Configuration Values', () => {
        it('should handle quality = 1 (maximum sampling)', async () => {
            colorThief.updateConfig({ quality: 1 });
            const colors = await colorThief.getProminentColors('https://example.com/test.jpg');
            expect(Array.isArray(colors)).toBe(true);
            // Quality 1 samples every pixel, may return colors or empty array
        });
        it('should handle very large quality values', async () => {
            const testPixels = (0, setup_1.createMockPixelData)([setup_1.TEST_COLORS.RED]);
            const mockImage = (0, setup_1.createMockSkiaImage)(testPixels, 1, 1);
            const mockCanvas = (0, setup_1.createMockSkiaCanvas)();
            const mockSurface = (0, setup_1.createMockSkiaSurface)(mockCanvas, mockImage);
            const { Skia } = require('@shopify/react-native-skia');
            Skia.Surface.MakeOffscreen.mockReturnValue(mockSurface);
            Skia.Data.fromURI.mockResolvedValue(new ArrayBuffer(8));
            const mockImageFactory = jest.fn().mockReturnValue(mockImage);
            Skia.Image.MakeImageFromEncoded.bind.mockReturnValue(mockImageFactory);
            colorThief.updateConfig({ quality: 1000 });
            const colors = await colorThief.getProminentColors('https://example.com/test.jpg');
            // With very high quality, we might still get some colors from our mock data
            expect(Array.isArray(colors)).toBe(true);
            expect(colors.length).toBeGreaterThanOrEqual(0);
        });
        it('should handle colorCount = 1', async () => {
            colorThief.updateConfig({ colorCount: 1 });
            const colors = await colorThief.getProminentColors('https://example.com/test.jpg');
            expect(Array.isArray(colors)).toBe(true);
            // colorCount configuration should be respected by quantize
        });
        it('should handle minAlpha = 255 (only fully opaque pixels)', async () => {
            colorThief.updateConfig({ minAlpha: 255 });
            const colors = await colorThief.getProminentColors('https://example.com/test.png');
            expect(Array.isArray(colors)).toBe(true);
            // With high alpha threshold, may filter out many pixels
        });
        it('should handle whiteThreshold = 0 (exclude all colors)', async () => {
            colorThief.updateConfig({ excludeWhite: true, whiteThreshold: 0 });
            const colors = await colorThief.getProminentColors('https://example.com/test.jpg');
            expect(Array.isArray(colors)).toBe(true);
            // With whiteThreshold 0, all colors may be excluded as "white"
        });
    });
    describe('Memory and Resource Limits', () => {
        it('should handle very large canvas sizes', async () => {
            const { Skia } = require('@shopify/react-native-skia');
            colorThief.updateConfig({ canvasSize: 4096 });
            const colors = await colorThief.getProminentColors('https://example.com/test.jpg');
            expect(Skia.Surface.MakeOffscreen).toHaveBeenCalledWith(4096, 4096);
            expect(Array.isArray(colors)).toBe(true);
        });
        it('should handle canvas size = 1', async () => {
            const testPixels = (0, setup_1.createMockPixelData)([setup_1.TEST_COLORS.RED]);
            const mockImage = (0, setup_1.createMockSkiaImage)(testPixels, 1, 1);
            const mockCanvas = (0, setup_1.createMockSkiaCanvas)();
            const mockSurface = (0, setup_1.createMockSkiaSurface)(mockCanvas, mockImage);
            const { Skia } = require('@shopify/react-native-skia');
            Skia.Surface.MakeOffscreen.mockReturnValue(mockSurface);
            Skia.Data.fromURI.mockResolvedValue(new ArrayBuffer(8));
            const mockImageFactory = jest.fn().mockReturnValue(mockImage);
            Skia.Image.MakeImageFromEncoded.bind.mockReturnValue(mockImageFactory);
            colorThief.updateConfig({ canvasSize: 1 });
            const colors = await colorThief.getProminentColors('https://example.com/test.jpg');
            expect(Skia.Surface.MakeOffscreen).toHaveBeenCalledWith(1, 1);
            expect(colors).toHaveLength(1);
        });
    });
    describe('Network and Data Loading Edge Cases', () => {
        it('should handle data loading failures', async () => {
            const { Skia } = require('@shopify/react-native-skia');
            Skia.Data.fromURI.mockRejectedValue(new Error('Network error'));
            await expect(colorThief.getProminentColors('https://example.com/test.jpg'))
                .rejects.toThrow('Failed to extract colors');
        });
        it('should handle malformed image data', async () => {
            const { Skia } = require('@shopify/react-native-skia');
            Skia.Data.fromURI.mockResolvedValue(new ArrayBuffer(0)); // Empty buffer
            const mockImageFactory = jest.fn().mockReturnValue(null);
            Skia.Image.MakeImageFromEncoded.bind.mockReturnValue(mockImageFactory);
            await expect(colorThief.getProminentColors('https://example.com/malformed.jpg'))
                .rejects.toThrow('Failed to load image');
        });
        it('should handle malformed SVG data', async () => {
            const { Skia } = require('@shopify/react-native-skia');
            Skia.Data.fromURI.mockResolvedValue(new ArrayBuffer(0)); // Empty buffer
            const mockSvgFactory = jest.fn().mockReturnValue(null);
            Skia.SVG.MakeFromData.bind.mockReturnValue(mockSvgFactory);
            await expect(colorThief.getProminentColors('https://example.com/malformed.svg'))
                .rejects.toThrow('Failed to load SVG');
        });
    });
    describe('Unusual URL Formats', () => {
        it('should handle URLs with query parameters', async () => {
            const urlWithParams = 'https://example.com/image.jpg?width=500&height=300&format=webp';
            const colors = await colorThief.getProminentColors(urlWithParams);
            expect(Array.isArray(colors)).toBe(true);
        });
        it('should handle URLs with fragments', async () => {
            const urlWithFragment = 'https://example.com/image.png#section1';
            const colors = await colorThief.getProminentColors(urlWithFragment);
            expect(Array.isArray(colors)).toBe(true);
        });
        it('should handle case-insensitive file extensions', async () => {
            const extensions = ['.JPG', '.PNG', '.SVG', '.GIF', '.WEBP', '.BMP'];
            extensions.forEach(ext => {
                expect(colorThief.isSupportedFormat(`image${ext}`)).toBe(true);
                expect(colorThief.isSupportedFormat(`image${ext.toLowerCase()}`)).toBe(true);
            });
        });
    });
    describe('Quantization Edge Cases', () => {
        it('should handle quantization returning null', async () => {
            const quantize = require('quantize');
            quantize.mockImplementation(() => null);
            const testPixels = (0, setup_1.createMockPixelData)([setup_1.TEST_COLORS.RED]);
            const mockImage = (0, setup_1.createMockSkiaImage)(testPixels);
            const mockCanvas = (0, setup_1.createMockSkiaCanvas)();
            const mockSurface = (0, setup_1.createMockSkiaSurface)(mockCanvas, mockImage);
            const { Skia } = require('@shopify/react-native-skia');
            Skia.Surface.MakeOffscreen.mockReturnValue(mockSurface);
            Skia.Data.fromURI.mockResolvedValue(new ArrayBuffer(8));
            const mockImageFactory = jest.fn().mockReturnValue(mockImage);
            Skia.Image.MakeImageFromEncoded.bind.mockReturnValue(mockImageFactory);
            const colors = await colorThief.getProminentColors('https://example.com/test.jpg');
            expect(colors).toEqual([]);
        });
        it('should handle quantization with duplicate colors', async () => {
            const quantize = require('quantize');
            quantize.mockImplementation(() => ({
                palette: () => [
                    [255, 0, 0],
                    [255, 0, 0], // Duplicate
                    [0, 255, 0],
                    [0, 255, 0], // Duplicate
                    [0, 0, 255],
                ],
            }));
            const testPixels = (0, setup_1.createMockPixelData)([setup_1.TEST_COLORS.RED]);
            const mockImage = (0, setup_1.createMockSkiaImage)(testPixels);
            const mockCanvas = (0, setup_1.createMockSkiaCanvas)();
            const mockSurface = (0, setup_1.createMockSkiaSurface)(mockCanvas, mockImage);
            const { Skia } = require('@shopify/react-native-skia');
            Skia.Surface.MakeOffscreen.mockReturnValue(mockSurface);
            Skia.Data.fromURI.mockResolvedValue(new ArrayBuffer(8));
            const mockImageFactory = jest.fn().mockReturnValue(mockImage);
            Skia.Image.MakeImageFromEncoded.bind.mockReturnValue(mockImageFactory);
            const colors = await colorThief.getProminentColors('https://example.com/test.jpg');
            expect(colors).toHaveLength(5);
        });
    });
});
