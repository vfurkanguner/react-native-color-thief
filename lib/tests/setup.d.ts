import 'jest';
declare global {
    namespace jest {
        interface Matchers<R> {
            toBeValidHexColor(): R;
            toBeValidRgbString(): R;
            toBeValidHslString(): R;
        }
    }
}
export declare const createMockPixelData: (colors: number[][]) => Uint8Array;
export declare const createMockSkiaImage: (pixelData: Uint8Array, width?: number, height?: number) => {
    getImageInfo: jest.Mock<any, any, any>;
    readPixels: jest.Mock<any, any, any>;
};
export declare const createMockSkiaCanvas: () => {
    drawImage: jest.Mock<any, any, any>;
    drawSvg: jest.Mock<any, any, any>;
};
export declare const createMockSkiaSurface: (canvas: any, image: any) => {
    getCanvas: jest.Mock<any, any, any>;
    flush: jest.Mock<any, any, any>;
    makeImageSnapshot: jest.Mock<any, any, any>;
};
export declare const TEST_COLORS: {
    RED: [number, number, number];
    GREEN: [number, number, number];
    BLUE: [number, number, number];
    WHITE: [number, number, number];
    BLACK: [number, number, number];
    ORANGE: [number, number, number];
    CYAN: [number, number, number];
    MAGENTA: [number, number, number];
};
export declare const TEST_URLS: {
    JPG: string;
    PNG: string;
    SVG: string;
    GIF: string;
    WEBP: string;
    INVALID: string;
};
