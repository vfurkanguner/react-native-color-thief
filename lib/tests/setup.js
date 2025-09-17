"use strict";
// Jest setup file for global test configuration
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEST_URLS = exports.TEST_COLORS = exports.createMockSkiaSurface = exports.createMockSkiaCanvas = exports.createMockSkiaImage = exports.createMockPixelData = void 0;
// Mock color-convert to avoid ES module issues
jest.mock('color-convert', () => {
    const mockConvert = {
        rgb: {
            hex: jest.fn().mockImplementation((r, g, b) => {
                return [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
            }),
            hsl: jest.fn().mockImplementation((r, g, b) => {
                // Simple mock HSL conversion
                const max = Math.max(r, g, b) / 255;
                const min = Math.min(r, g, b) / 255;
                const diff = max - min;
                const sum = max + min;
                const l = sum / 2;
                if (diff === 0) {
                    return [0, 0, Math.round(l * 100)];
                }
                const s = l > 0.5 ? diff / (2 - sum) : diff / sum;
                let h = 0;
                switch (max) {
                    case r / 255:
                        h = ((g - b) / 255) / diff + (g < b ? 6 : 0);
                        break;
                    case g / 255:
                        h = ((b - r) / 255) / diff + 2;
                        break;
                    case b / 255:
                        h = ((r - g) / 255) / diff + 4;
                        break;
                }
                return [Math.round(h * 60), Math.round(s * 100), Math.round(l * 100)];
            }),
            keyword: jest.fn().mockImplementation((r, g, b) => {
                if (r === 255 && g === 0 && b === 0)
                    return 'red';
                if (r === 0 && g === 255 && b === 0)
                    return 'green';
                if (r === 0 && g === 0 && b === 255)
                    return 'blue';
                if (r === 255 && g === 255 && b === 255)
                    return 'white';
                if (r === 0 && g === 0 && b === 0)
                    return 'black';
                return `rgb(${r}, ${g}, ${b})`;
            })
        }
    };
    return {
        default: mockConvert,
        ...mockConvert
    };
});
// Extend Jest matchers if needed
require("jest");
// Custom matchers
expect.extend({
    toBeValidHexColor(received) {
        const hexPattern = /^#[0-9a-f]{6}$/i;
        const pass = typeof received === 'string' && hexPattern.test(received);
        if (pass) {
            return {
                message: () => `expected ${received} not to be a valid hex color`,
                pass: true,
            };
        }
        else {
            return {
                message: () => `expected ${received} to be a valid hex color (format: #rrggbb)`,
                pass: false,
            };
        }
    },
    toBeValidRgbString(received) {
        const rgbPattern = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
        const pass = typeof received === 'string' && rgbPattern.test(received);
        if (pass) {
            return {
                message: () => `expected ${received} not to be a valid RGB string`,
                pass: true,
            };
        }
        else {
            return {
                message: () => `expected ${received} to be a valid RGB string (format: rgb(r, g, b))`,
                pass: false,
            };
        }
    },
    toBeValidHslString(received) {
        const hslPattern = /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/;
        const pass = typeof received === 'string' && hslPattern.test(received);
        if (pass) {
            return {
                message: () => `expected ${received} not to be a valid HSL string`,
                pass: true,
            };
        }
        else {
            return {
                message: () => `expected ${received} to be a valid HSL string (format: hsl(h, s%, l%))`,
                pass: false,
            };
        }
    },
});
// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
beforeAll(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
});
afterAll(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
});
// Global test helpers
const createMockPixelData = (colors) => {
    const pixelData = new Uint8Array(colors.length * 4);
    colors.forEach((color, index) => {
        const offset = index * 4;
        pixelData[offset] = color[0]; // R
        pixelData[offset + 1] = color[1]; // G
        pixelData[offset + 2] = color[2]; // B
        pixelData[offset + 3] = 255; // A (full opacity)
    });
    return pixelData;
};
exports.createMockPixelData = createMockPixelData;
const createMockSkiaImage = (pixelData, width = 100, height = 100) => ({
    getImageInfo: jest.fn().mockReturnValue({ width, height }),
    readPixels: jest.fn().mockReturnValue(pixelData),
});
exports.createMockSkiaImage = createMockSkiaImage;
const createMockSkiaCanvas = () => ({
    drawImage: jest.fn(),
    drawSvg: jest.fn(),
});
exports.createMockSkiaCanvas = createMockSkiaCanvas;
const createMockSkiaSurface = (canvas, image) => ({
    getCanvas: jest.fn().mockReturnValue(canvas),
    flush: jest.fn(),
    makeImageSnapshot: jest.fn().mockReturnValue(image),
});
exports.createMockSkiaSurface = createMockSkiaSurface;
// Test data constants
exports.TEST_COLORS = {
    RED: [255, 0, 0],
    GREEN: [0, 255, 0],
    BLUE: [0, 0, 255],
    WHITE: [255, 255, 255],
    BLACK: [0, 0, 0],
    ORANGE: [255, 87, 51],
    CYAN: [51, 255, 255],
    MAGENTA: [255, 51, 255],
};
exports.TEST_URLS = {
    JPG: 'https://example.com/test-image.jpg',
    PNG: 'https://example.com/test-image.png',
    SVG: 'https://example.com/test-image.svg',
    GIF: 'https://example.com/test-image.gif',
    WEBP: 'https://example.com/test-image.webp',
    INVALID: 'https://example.com/test-file.txt',
};
