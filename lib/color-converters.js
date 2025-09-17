"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rgbToHex = exports.hexToRgb = exports.hexToHsv = exports.hsvToHex = void 0;
exports.formatRGB = formatRGB;
exports.rgbStringfy = rgbStringfy;
exports.formatHex = formatHex;
exports.hslStringfy = hslStringfy;
const color_convert_1 = __importDefault(require("color-convert"));
function formatRGB(arrayRGB, format) {
    const responses = {
        rgbString: () => rgbStringfy(...arrayRGB),
        hex: () => formatHex(color_convert_1.default.rgb.hex(...arrayRGB)),
        rgbArray: () => arrayRGB,
        hslString: () => hslStringfy(color_convert_1.default.rgb.hsl(...arrayRGB)),
        hslArray: () => color_convert_1.default.rgb.hsl(...arrayRGB),
        keyword: () => color_convert_1.default.rgb.keyword(...arrayRGB),
    };
    return responses[format]();
}
function rgbStringfy(r, g, b) {
    return `rgb(${r}, ${g}, ${b})`;
}
/**
 * Formats a hex into something consumable by css
 */
function formatHex(hex) {
    return `#${hex.toLowerCase()}`;
}
/**
 * Put HSL into a string
 */
function hslStringfy(hsl) {
    return `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
}
// Helper function to convert HSV to HEX
const hsvToHex = (h, s, v) => {
    const f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    const rgb = [f(5), f(3), f(1)].map((x) => Math.round(x * 255));
    return `#${rgb.map((x) => x.toString(16).padStart(2, "0")).join("")}`;
};
exports.hsvToHex = hsvToHex;
// Helper function to convert HEX to HSV
const hexToHsv = (hex) => {
    const r = Number.parseInt(hex.slice(1, 3), 16) / 255;
    const g = Number.parseInt(hex.slice(3, 5), 16) / 255;
    const b = Number.parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    // biome-ignore lint/style/useConst: <explanation>
    let s = 0;
    // biome-ignore lint/style/useConst: <explanation>
    let v = 0;
    if (max === min) {
        h = 0;
    }
    else {
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    s = max === 0 ? 0 : d / max;
    v = max;
    return [h * 360, s, v];
};
exports.hexToHsv = hexToHsv;
const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: Number.parseInt(result[1], 16),
            g: Number.parseInt(result[2], 16),
            b: Number.parseInt(result[3], 16),
        }
        : null;
};
exports.hexToRgb = hexToRgb;
const rgbToHex = (r, g, b) => {
    return `#${[r, g, b]
        .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
    })
        .join("")}`;
};
exports.rgbToHex = rgbToHex;
