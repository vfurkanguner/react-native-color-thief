# React Native Color Thief

A powerful React Native library for extracting prominent colors from images and SVGs using Skia rendering engine. Extract color palettes, dominant colors, and perform detailed color analysis with high performance and accuracy.

## Features

- 🎨 Extract prominent colors from images and SVGs
- 🚀 High-performance color extraction using React Native Skia
- 🎯 Get dominant colors, complete palettes, or specific color formats
- 📊 Detailed color statistics and analysis
- 🔧 Highly configurable with quality, count, and filtering options
- 📱 Optimized for React Native applications
- 🎪 Support for multiple color formats (HEX, RGB, HSL, CSS keywords)
- 🖼️ Support for various image formats (JPG, PNG, GIF, BMP, WebP, SVG)

## Installation

```bash
npm install react-native-color-thief
# or
yarn add react-native-color-thief
```

### Dependencies

This library requires `@shopify/react-native-skia` as a peer dependency:

```bash
npm install @shopify/react-native-skia
# or
yarn add @shopify/react-native-skia
```

## Version Compatibility

### Supported Versions

**For full feature support (recommended):**
- React: `>=19.0.0`
- React Native: `>=0.79.0`
- React Native Skia: `>=2.0.0`

**Legacy support:**
- React: `>=18.0.0`
- React Native: `>=0.70.0`
- React Native Skia: `>=1.0.0`

### Platform Requirements

- **iOS**: 14.0 or higher
- **Android**: API level 21 (Android 5.0) or higher
- **Android with video support**: API level 26 (Android 8.0) or higher

### Version-Specific Compatibility

#### React Native ≤0.78 with React ≤18

If you're using React Native 0.78 or below with React 18 or below, you **must** use React Native Skia version 1.12.4 or below:

```bash
npm install @shopify/react-native-skia@1.12.4
# or
yarn add @shopify/react-native-skia@1.12.4
```

#### React Native ≥0.79 with React ≥19

For React Native 0.79+ with React 19+, use the latest React Native Skia:

```bash
npm install @shopify/react-native-skia@latest
# or
yarn add @shopify/react-native-skia@latest
```

### Expo Compatibility

This library is fully compatible with Expo projects using:
- Expo SDK 50+ (React Native 0.73+)
- Custom development builds (required for React Native Skia)

**Note**: React Native Skia requires a custom development build and cannot be used with Expo Go.

### Automatic Compatibility Checking

The library automatically checks version compatibility on initialization and will warn you about any issues:

```typescript
import { ReactNativeColorThief } from 'react-native-color-thief';

// Automatic compatibility check on initialization
const colorThief = new ReactNativeColorThief();

// Suppress compatibility warnings (not recommended)
const colorThief = new ReactNativeColorThief({
  suppressCompatibilityWarnings: true
});

// Manual compatibility check
const compatibility = colorThief.checkVersionCompatibility();
if (!compatibility.isCompatible) {
  console.error('Version compatibility issues:', compatibility);
}
```

## Quick Start

```typescript
import { ReactNativeColorThief } from 'react-native-color-thief';

const colorThief = new ReactNativeColorThief();

// Extract prominent colors
const colors = await colorThief.getProminentColors('https://example.com/image.jpg');
console.log(colors[0].formats.hex); // "#FF5733"

// Get dominant color only
const dominant = await colorThief.getDominantColor('https://example.com/image.jpg');
console.log(dominant.formats.rgb); // "rgb(255, 87, 51)"
```

## API Reference

### ReactNativeColorThief Class

#### Constructor

```typescript
const colorThief = new ReactNativeColorThief(config?: ColorThiefConfig);
```

#### Configuration Options

```typescript
interface ColorThiefConfig {
  quality?: number;        // 1-10, higher = better quality but slower (default: 10)
  colorCount?: number;     // Number of colors to extract (default: 5)
  minAlpha?: number;       // Minimum alpha value for pixel inclusion (default: 125)
  excludeWhite?: boolean;  // Exclude near-white colors (default: true)
  whiteThreshold?: number; // White threshold for exclusion (default: 250)
  canvasSize?: number;     // Canvas size for processing (default: 256)
}
```

### Core Methods

#### getProminentColors()

Extract all prominent colors from an image.

```typescript
const colors = await colorThief.getProminentColors(imageURI);
```

**Returns:** `Promise<ColorResult[]>`

#### getDominantColor()

Get only the most prominent color.

```typescript
const dominant = await colorThief.getDominantColor(imageURI);
```

**Returns:** `Promise<ColorResult>`

#### getPalette()

Get a complete palette with dominant and secondary colors.

```typescript
const palette = await colorThief.getPalette(imageURI);
```

**Returns:** `Promise<PaletteResult>`

#### getColorsInFormat()

Get colors in a specific string format.

```typescript
const hexColors = await colorThief.getColorsInFormat(imageURI, 'hex');
const rgbColors = await colorThief.getColorsInFormat(imageURI, 'rgbString');
```

**Returns:** `Promise<string[]>`

### Utility Methods

#### getColorStatistics()

Get detailed color statistics and analysis.

```typescript
const stats = await colorThief.getColorStatistics(imageURI);
// Returns: { totalColors, averageBrightness, colorDistribution }
```

#### isSupportedFormat()

Check if an image format is supported.

```typescript
const isSupported = colorThief.isSupportedFormat('image.jpg'); // true
```

#### updateConfig() / getConfig() / resetConfig()

Manage configuration dynamically.

```typescript
colorThief.updateConfig({ quality: 5, colorCount: 8 });
const config = colorThief.getConfig();
colorThief.resetConfig(); // Reset to defaults
```

## Usage Examples

### Basic Usage

```typescript
import { ReactNativeColorThief } from 'react-native-color-thief';

const extractColors = async (imageURI: string) => {
  const colorThief = new ReactNativeColorThief();
  
  try {
    const colors = await colorThief.getProminentColors(imageURI);
    
    colors.forEach((color, index) => {
      console.log(`Color ${index + 1}:`, {
        hex: color.formats.hex,
        rgb: color.formats.rgb,
        hsl: color.formats.hsl,
        keyword: color.formats.keyword
      });
    });
    
    return colors;
  } catch (error) {
    console.error('Color extraction failed:', error);
    return [];
  }
};
```

### Custom Configuration

```typescript
const colorThief = new ReactNativeColorThief({
  quality: 5,           // Faster processing
  colorCount: 8,        // Extract 8 colors
  minAlpha: 100,        // Lower alpha threshold
  excludeWhite: false,  // Include white colors
  canvasSize: 512,      // Higher quality processing
});

const palette = await colorThief.getPalette(imageURI);
```

### React Native Component Integration

```typescript
import React, { useState, useEffect } from 'react';
import { View, Image, Text } from 'react-native';
import { ReactNativeColorThief } from 'react-native-color-thief';

const ColorfulImageCard = ({ imageURI }) => {
  const [colors, setColors] = useState(null);
  const colorThief = new ReactNativeColorThief();

  useEffect(() => {
    const extractColors = async () => {
      try {
        const palette = await colorThief.getPalette(imageURI);
        setColors({
          primary: palette.dominant.formats.hex,
          secondary: palette.secondary[0]?.formats.hex,
          textColor: getContrastColor(palette.dominant.rgb),
        });
      } catch (error) {
        console.error('Failed to extract colors:', error);
      }
    };

    extractColors();
  }, [imageURI]);

  const getContrastColor = (rgb) => {
    const brightness = (rgb[0] + rgb[1] + rgb[2]) / 3;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  return (
    <View style={{ backgroundColor: colors?.primary }}>
      <Image source={{ uri: imageURI }} style={{ width: 200, height: 200 }} />
      <Text style={{ color: colors?.textColor }}>
        Themed with extracted colors!
      </Text>
    </View>
  );
};
```

### Batch Processing

```typescript
const procesMultipleImages = async (imageURIs: string[]) => {
  const colorThief = new ReactNativeColorThief();
  const results = [];

  for (const uri of imageURIs) {
    try {
      const colors = await colorThief.getProminentColors(uri);
      results.push({ uri, colors, success: true });
    } catch (error) {
      results.push({ uri, error: error.message, success: false });
    }
  }

  return results;
};
```

### Performance Optimization

```typescript
// Reuse instance for multiple operations
const colorThief = new ReactNativeColorThief({
  quality: 5, // Lower quality for faster processing
});

// Parallel processing for multiple operations on same image
const analyzeImage = async (imageURI: string) => {
  const [colors, stats, dominant] = await Promise.all([
    colorThief.getProminentColors(imageURI),
    colorThief.getColorStatistics(imageURI),
    colorThief.getDominantColor(imageURI),
  ]);

  return { colors, stats, dominant };
};
```

### Error Handling

```typescript
const safeColorExtraction = async (imageURI: string) => {
  const colorThief = new ReactNativeColorThief();

  try {
    // Validate format
    if (!colorThief.isSupportedFormat(imageURI)) {
      throw new Error('Unsupported image format');
    }

    const colors = await colorThief.getProminentColors(imageURI);
    
    if (colors.length === 0) {
      console.warn('No colors found in image');
      return getDefaultColors();
    }

    return colors;
  } catch (error) {
    console.error('Color extraction failed:', error);
    return getDefaultColors();
  }
};

const getDefaultColors = () => [
  {
    rgb: [128, 128, 128],
    formats: {
      hex: '#808080',
      rgb: 'rgb(128, 128, 128)',
      hsl: 'hsl(0, 0%, 50%)',
      keyword: 'gray',
    },
  },
];
```

## Data Types

### ColorResult

```typescript
interface ColorResult {
  rgb: [number, number, number];  // RGB values [0-255]
  formats: {
    hex: string;      // "#FF5733"
    rgb: string;      // "rgb(255, 87, 51)"
    hsl: string;      // "hsl(12, 100%, 60%)"
    keyword: string;  // "red" (CSS keyword if available)
  };
  weight?: number;    // Color frequency in image
}
```

### PaletteResult

```typescript
interface PaletteResult {
  colors: ColorResult[];     // All extracted colors
  dominant: ColorResult;     // Most prominent color
  secondary: ColorResult[];  // Secondary colors
  pixelCount: number;        // Total pixels analyzed
}
```

## Convenience Functions

### Factory Function

```typescript
import { createColorThief } from 'react-native-color-thief';

const colorThief = createColorThief({
  quality: 8,
  colorCount: 6,
});
```

### Default Instance

```typescript
import { defaultColorThief } from 'react-native-color-thief';

const colors = await defaultColorThief.getProminentColors(imageURI);
```

### Legacy Function (Deprecated)

```typescript
import { getProminentColors } from 'react-native-color-thief';

// Returns hex strings only
const hexColors = await getProminentColors(imageURI);
```

## Supported Formats

- **Images:** JPG, JPEG, PNG, GIF, BMP, WebP
- **Vector:** SVG
- **Sources:** URLs, local files, base64 data URIs

## Performance Tips

1. **Adjust Quality:** Lower quality (1-5) for faster processing
2. **Reduce Color Count:** Extract fewer colors for better performance
3. **Reuse Instances:** Create one instance and reuse for multiple operations
4. **Optimize Canvas Size:** Use smaller canvas for faster processing
5. **Batch Operations:** Use Promise.all for parallel processing

## Error Handling

The library throws descriptive errors for various scenarios:

- Invalid image URIs
- Unsupported image formats
- Network failures
- Canvas initialization failures
- Empty or corrupted images

Always wrap calls in try-catch blocks for production use.

## Troubleshooting

### Version Compatibility Issues

If you encounter compatibility warnings or errors, follow these steps:

1. **Check your versions:**
   ```bash
   npm list react react-native @shopify/react-native-skia
   ```

2. **For React Native ≤0.78 projects:**
   ```bash
   npm install @shopify/react-native-skia@1.12.4
   ```

3. **For React Native ≥0.79 projects:**
   ```bash
   npm install @shopify/react-native-skia@latest
   ```

4. **Run the compatibility checker:**
   ```bash
   npx react-native-color-thief-check
   ```

### Common Issues

#### "Skia not found" Error
- Ensure `@shopify/react-native-skia` is installed
- For Expo projects, make sure you're using a custom development build
- Rebuild your project after installing Skia

#### "Incompatible Skia version" Warning
- Check your React Native version
- Install the appropriate Skia version (see compatibility table above)
- Clear your cache: `npx react-native start --reset-cache`

#### Metro bundler issues
- Add to your `metro.config.js`:
  ```javascript
  module.exports = {
    resolver: {
      alias: {
        'react-native-color-thief': require.resolve('react-native-color-thief'),
      },
    },
  };
  ```

### Platform-Specific Issues

#### iOS Build Errors
- Ensure iOS deployment target is set to 14.0 or higher in Xcode
- Run `cd ios && pod install` after installing dependencies

#### Android Build Errors
- Set `minSdkVersion` to 21 or higher in `android/build.gradle`
- For video support, set `minSdkVersion` to 26 or higher

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC License

## Dependencies

- [@shopify/react-native-skia](https://github.com/Shopify/react-native-skia) - For image rendering and processing
- [quantize](https://github.com/olivierlesnicki/quantize) - For color quantization algorithms
- [color-convert](https://github.com/Qix-/color-convert) - For color format conversions
