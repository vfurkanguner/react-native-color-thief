export type ArrayRGB = [number, number, number];
export type ColorFormats = "rgbString" | "hex" | "rgbArray" | "hslString" | "hslArray" | "keyword";
export declare function formatRGB<T extends ColorFormats>(arrayRGB: ArrayRGB, format: T): T extends "rgbArray" ? ArrayRGB : string;
export declare function rgbStringfy(r: number, g: number, b: number): string;
/**
 * Formats a hex into something consumable by css
 */
export declare function formatHex(hex: string): string;
/**
 * Put HSL into a string
 */
export declare function hslStringfy(hsl: number[]): string;
export interface RGB {
    r: number;
    g: number;
    b: number;
}
export declare const hsvToHex: (h: number, s: number, v: number) => string;
export declare const hexToHsv: (hex: string) => [number, number, number];
export declare const hexToRgb: (hex: string) => RGB | null;
export declare const rgbToHex: (r: number, g: number, b: number) => string;
