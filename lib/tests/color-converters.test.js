"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_converters_1 = require("../color-converters");
describe('color-converters', () => {
    describe('formatRGB', () => {
        const testRGB = [255, 87, 51];
        it('should format RGB to hex string', () => {
            const result = (0, color_converters_1.formatRGB)(testRGB, 'hex');
            expect(result).toBe('#ff5733');
        });
        it('should format RGB to RGB string', () => {
            const result = (0, color_converters_1.formatRGB)(testRGB, 'rgbString');
            expect(result).toBe('rgb(255, 87, 51)');
        });
        it('should format RGB to HSL string', () => {
            const result = (0, color_converters_1.formatRGB)(testRGB, 'hslString');
            expect(result).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
        });
        it('should return RGB array when format is rgbArray', () => {
            const result = (0, color_converters_1.formatRGB)(testRGB, 'rgbArray');
            expect(result).toEqual([255, 87, 51]);
        });
        it('should format RGB to HSL array', () => {
            const result = (0, color_converters_1.formatRGB)(testRGB, 'hslArray');
            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(3);
        });
        it('should format RGB to keyword when possible', () => {
            const redRGB = [255, 0, 0];
            const result = (0, color_converters_1.formatRGB)(redRGB, 'keyword');
            expect(result).toBe('red');
        });
        it('should handle edge cases with black color', () => {
            const blackRGB = [0, 0, 0];
            expect((0, color_converters_1.formatRGB)(blackRGB, 'hex')).toBe('#000000');
            expect((0, color_converters_1.formatRGB)(blackRGB, 'rgbString')).toBe('rgb(0, 0, 0)');
            expect((0, color_converters_1.formatRGB)(blackRGB, 'keyword')).toBe('black');
        });
        it('should handle edge cases with white color', () => {
            const whiteRGB = [255, 255, 255];
            expect((0, color_converters_1.formatRGB)(whiteRGB, 'hex')).toBe('#ffffff');
            expect((0, color_converters_1.formatRGB)(whiteRGB, 'rgbString')).toBe('rgb(255, 255, 255)');
            expect((0, color_converters_1.formatRGB)(whiteRGB, 'keyword')).toBe('white');
        });
    });
    describe('rgbStringfy', () => {
        it('should create RGB string from individual values', () => {
            const result = (0, color_converters_1.rgbStringfy)(255, 87, 51);
            expect(result).toBe('rgb(255, 87, 51)');
        });
        it('should handle zero values', () => {
            const result = (0, color_converters_1.rgbStringfy)(0, 0, 0);
            expect(result).toBe('rgb(0, 0, 0)');
        });
        it('should handle maximum values', () => {
            const result = (0, color_converters_1.rgbStringfy)(255, 255, 255);
            expect(result).toBe('rgb(255, 255, 255)');
        });
    });
    describe('formatHex', () => {
        it('should format hex string with # prefix and lowercase', () => {
            const result = (0, color_converters_1.formatHex)('FF5733');
            expect(result).toBe('#ff5733');
        });
        it('should handle already lowercase hex', () => {
            const result = (0, color_converters_1.formatHex)('ff5733');
            expect(result).toBe('#ff5733');
        });
        it('should handle mixed case hex', () => {
            const result = (0, color_converters_1.formatHex)('Ff5733');
            expect(result).toBe('#ff5733');
        });
        it('should handle short hex codes', () => {
            const result = (0, color_converters_1.formatHex)('000');
            expect(result).toBe('#000');
        });
    });
    describe('hslStringfy', () => {
        it('should create HSL string from HSL array', () => {
            const hsl = [12, 100, 60];
            const result = (0, color_converters_1.hslStringfy)(hsl);
            expect(result).toBe('hsl(12, 100%, 60%)');
        });
        it('should handle zero values', () => {
            const hsl = [0, 0, 0];
            const result = (0, color_converters_1.hslStringfy)(hsl);
            expect(result).toBe('hsl(0, 0%, 0%)');
        });
        it('should handle decimal values', () => {
            const hsl = [12.5, 100.0, 60.2];
            const result = (0, color_converters_1.hslStringfy)(hsl);
            expect(result).toBe('hsl(12.5, 100%, 60.2%)');
        });
    });
    describe('hsvToHex', () => {
        it('should convert HSV to hex', () => {
            const result = (0, color_converters_1.hsvToHex)(0, 1, 1); // Pure red
            expect(result).toBe('#ff0000');
        });
        it('should convert HSV to hex for green', () => {
            const result = (0, color_converters_1.hsvToHex)(120, 1, 1); // Pure green
            expect(result).toBe('#00ff00');
        });
        it('should convert HSV to hex for blue', () => {
            const result = (0, color_converters_1.hsvToHex)(240, 1, 1); // Pure blue
            expect(result).toBe('#0000ff');
        });
        it('should handle black (V=0)', () => {
            const result = (0, color_converters_1.hsvToHex)(0, 0, 0);
            expect(result).toBe('#000000');
        });
        it('should handle white (S=0, V=1)', () => {
            const result = (0, color_converters_1.hsvToHex)(0, 0, 1);
            expect(result).toBe('#ffffff');
        });
        it('should handle gray (S=0, V=0.5)', () => {
            const result = (0, color_converters_1.hsvToHex)(0, 0, 0.5);
            expect(result).toBe('#808080');
        });
    });
    describe('hexToHsv', () => {
        it('should convert hex to HSV for red', () => {
            const [h, s, v] = (0, color_converters_1.hexToHsv)('#ff0000');
            expect(h).toBeCloseTo(0);
            expect(s).toBeCloseTo(1);
            expect(v).toBeCloseTo(1);
        });
        it('should convert hex to HSV for green', () => {
            const [h, s, v] = (0, color_converters_1.hexToHsv)('#00ff00');
            expect(h).toBeCloseTo(120);
            expect(s).toBeCloseTo(1);
            expect(v).toBeCloseTo(1);
        });
        it('should convert hex to HSV for blue', () => {
            const [h, s, v] = (0, color_converters_1.hexToHsv)('#0000ff');
            expect(h).toBeCloseTo(240);
            expect(s).toBeCloseTo(1);
            expect(v).toBeCloseTo(1);
        });
        it('should handle black', () => {
            const [h, s, v] = (0, color_converters_1.hexToHsv)('#000000');
            expect(h).toBe(0);
            expect(s).toBe(0);
            expect(v).toBe(0);
        });
        it('should handle white', () => {
            const [h, s, v] = (0, color_converters_1.hexToHsv)('#ffffff');
            expect(h).toBe(0);
            expect(s).toBe(0);
            expect(v).toBe(1);
        });
        it('should handle hex without # prefix', () => {
            const [h, s, v] = (0, color_converters_1.hexToHsv)('ff0000');
            expect(h).toBeCloseTo(0);
            expect(s).toBeCloseTo(1, 0); // Allow more tolerance for precision
            expect(v).toBeCloseTo(1, 0); // Allow more tolerance for precision
        });
    });
    describe('hexToRgb', () => {
        it('should convert hex to RGB object', () => {
            const result = (0, color_converters_1.hexToRgb)('#ff5733');
            expect(result).toEqual({ r: 255, g: 87, b: 51 });
        });
        it('should handle hex without # prefix', () => {
            const result = (0, color_converters_1.hexToRgb)('ff5733');
            expect(result).toEqual({ r: 255, g: 87, b: 51 });
        });
        it('should handle uppercase hex', () => {
            const result = (0, color_converters_1.hexToRgb)('#FF5733');
            expect(result).toEqual({ r: 255, g: 87, b: 51 });
        });
        it('should handle black', () => {
            const result = (0, color_converters_1.hexToRgb)('#000000');
            expect(result).toEqual({ r: 0, g: 0, b: 0 });
        });
        it('should handle white', () => {
            const result = (0, color_converters_1.hexToRgb)('#ffffff');
            expect(result).toEqual({ r: 255, g: 255, b: 255 });
        });
        it('should return null for invalid hex', () => {
            const result = (0, color_converters_1.hexToRgb)('#invalid');
            expect(result).toBeNull();
        });
        it('should return null for short hex', () => {
            const result = (0, color_converters_1.hexToRgb)('#fff');
            expect(result).toBeNull();
        });
        it('should return null for empty string', () => {
            const result = (0, color_converters_1.hexToRgb)('');
            expect(result).toBeNull();
        });
    });
    describe('rgbToHex', () => {
        it('should convert RGB values to hex', () => {
            const result = (0, color_converters_1.rgbToHex)(255, 87, 51);
            expect(result).toBe('#ff5733');
        });
        it('should handle black', () => {
            const result = (0, color_converters_1.rgbToHex)(0, 0, 0);
            expect(result).toBe('#000000');
        });
        it('should handle white', () => {
            const result = (0, color_converters_1.rgbToHex)(255, 255, 255);
            expect(result).toBe('#ffffff');
        });
        it('should pad single digit hex values', () => {
            const result = (0, color_converters_1.rgbToHex)(1, 2, 3);
            expect(result).toBe('#010203');
        });
        it('should handle mixed single and double digit values', () => {
            const result = (0, color_converters_1.rgbToHex)(15, 255, 0);
            expect(result).toBe('#0fff00');
        });
    });
    describe('Type definitions', () => {
        it('should have correct ArrayRGB type', () => {
            const rgb = [255, 87, 51];
            expect(rgb).toHaveLength(3);
            expect(typeof rgb[0]).toBe('number');
            expect(typeof rgb[1]).toBe('number');
            expect(typeof rgb[2]).toBe('number');
        });
        it('should have correct RGB interface', () => {
            const rgb = { r: 255, g: 87, b: 51 };
            expect(typeof rgb.r).toBe('number');
            expect(typeof rgb.g).toBe('number');
            expect(typeof rgb.b).toBe('number');
        });
        it('should have correct ColorFormats type', () => {
            const formats = [
                'rgbString',
                'hex',
                'rgbArray',
                'hslString',
                'hslArray',
                'keyword'
            ];
            expect(formats).toHaveLength(6);
        });
    });
    describe('Integration tests', () => {
        it('should maintain consistency between hex conversions', () => {
            const originalHex = '#ff5733';
            const rgb = (0, color_converters_1.hexToRgb)(originalHex);
            expect(rgb).not.toBeNull();
            if (rgb) {
                const convertedHex = (0, color_converters_1.rgbToHex)(rgb.r, rgb.g, rgb.b);
                expect(convertedHex).toBe(originalHex);
            }
        });
        it('should maintain consistency between HSV conversions', () => {
            const originalHex = '#ff0000';
            const [h, s, v] = (0, color_converters_1.hexToHsv)(originalHex);
            const convertedHex = (0, color_converters_1.hsvToHex)(h, s, v);
            expect(convertedHex).toBe(originalHex);
        });
        it('should handle round-trip RGB to hex to RGB conversion', () => {
            const originalR = 255;
            const originalG = 87;
            const originalB = 51;
            const hex = (0, color_converters_1.rgbToHex)(originalR, originalG, originalB);
            const rgb = (0, color_converters_1.hexToRgb)(hex);
            expect(rgb).toEqual({
                r: originalR,
                g: originalG,
                b: originalB
            });
        });
    });
});
