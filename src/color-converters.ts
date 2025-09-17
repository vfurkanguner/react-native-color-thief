import convert from "color-convert";

export type ArrayRGB = [number, number, number];

export type ColorFormats =
  | "rgbString"
  | "hex"
  | "rgbArray"
  | "hslString"
  | "hslArray"
  | "keyword";

export function formatRGB<T extends ColorFormats>(
  arrayRGB: ArrayRGB,
  format: T
): T extends "rgbArray" ? ArrayRGB : string {
  const responses: { [key in ColorFormats]: () => any } = {
    rgbString: () => rgbStringfy(...arrayRGB),
    hex: () => formatHex(convert.rgb.hex(...arrayRGB)),
    rgbArray: () => arrayRGB,
    hslString: () => hslStringfy(convert.rgb.hsl(...arrayRGB)),
    hslArray: () => convert.rgb.hsl(...arrayRGB),
    keyword: () => convert.rgb.keyword(...arrayRGB),
  };

  return responses[format]();
}

export function rgbStringfy(r: number, g: number, b: number): string {
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Formats a hex into something consumable by css
 */
export function formatHex(hex: string): string {
  return `#${hex.toLowerCase()}`;
}

/**
 * Put HSL into a string
 */
export function hslStringfy(hsl: number[]): string {
  return `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

// Helper function to convert HSV to HEX
export const hsvToHex = (h: number, s: number, v: number): string => {
  const f = (n: number, k = (n + h / 60) % 6) =>
    v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  const rgb = [f(5), f(3), f(1)].map((x) => Math.round(x * 255));
  return `#${rgb.map((x) => x.toString(16).padStart(2, "0")).join("")}`;
};

// Helper function to convert HEX to HSV
export const hexToHsv = (hex: string): [number, number, number] => {
  const r = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const g = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const b = Number.parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h: number = 0;
  // biome-ignore lint/style/useConst: <explanation>
  let s: number = 0;
  // biome-ignore lint/style/useConst: <explanation>
  let v: number = 0;

  if (max === min) {
    h = 0;
  } else {
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

export const hexToRgb = (hex: string): RGB | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${[r, g, b]
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    })
    .join("")}`;
};
