# Installation Guide - React Native Color Thief

This guide provides detailed installation instructions for different React Native and Expo setups with proper version compatibility.

## Quick Installation

### For React Native ≥0.79 with React ≥19 (Recommended)

```bash
# Install the library
npm install react-native-color-thief

# Install peer dependencies
npm install @shopify/react-native-skia@latest

# For iOS projects
cd ios && pod install && cd ..

# Check compatibility
npx react-native-color-thief-check
```

### For React Native ≤0.78 with React ≤18 (Legacy)

```bash
# Install the library
npm install react-native-color-thief

# Install compatible Skia version
npm install @shopify/react-native-skia@1.12.4

# For iOS projects
cd ios && pod install && cd ..

# Check compatibility
npx react-native-color-thief-check
```

## Detailed Installation by Environment

### React Native CLI Projects

#### New Projects (React Native ≥0.79)

1. **Create a new React Native project:**
   ```bash
   npx react-native@latest init MyColorApp
   cd MyColorApp
   ```

2. **Install dependencies:**
   ```bash
   npm install react-native-color-thief @shopify/react-native-skia@latest
   ```

3. **iOS Setup:**
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Android Setup:**
   Update `android/build.gradle`:
   ```gradle
   buildscript {
       ext {
           minSdkVersion = 21  // Required minimum
           compileSdkVersion = 34
           targetSdkVersion = 34
       }
   }
   ```

5. **Verify installation:**
   ```bash
   npx react-native-color-thief-check
   ```

#### Existing Projects (React Native ≤0.78)

1. **Check your React Native version:**
   ```bash
   npx react-native --version
   ```

2. **Install compatible versions:**
   ```bash
   npm install react-native-color-thief @shopify/react-native-skia@1.12.4
   ```

3. **Update platform requirements:**
   - iOS: Set deployment target to 14.0+ in Xcode
   - Android: Set minSdkVersion to 21+ in `android/build.gradle`

4. **Install iOS dependencies:**
   ```bash
   cd ios && pod install && cd ..
   ```

### Expo Projects

#### Expo SDK 50+ (Recommended)

1. **Create or update Expo project:**
   ```bash
   npx create-expo-app@latest MyColorApp
   cd MyColorApp
   ```

2. **Install dependencies:**
   ```bash
   npx expo install react-native-color-thief @shopify/react-native-skia
   ```

3. **Create development build:**
   ```bash
   npx expo install expo-dev-client
   npx expo run:ios  # or npx expo run:android
   ```

   **Note**: React Native Skia requires a custom development build and cannot be used with Expo Go.

4. **Update app.json/app.config.js:**
   ```json
   {
     "expo": {
       "name": "MyColorApp",
       "platforms": ["ios", "android"],
       "ios": {
         "deploymentTarget": "14.0"
       },
       "android": {
         "minSdkVersion": 21
       }
     }
   }
   ```

#### Expo SDK 49 and Below (Legacy)

1. **Install compatible versions:**
   ```bash
   npx expo install react-native-color-thief @shopify/react-native-skia@1.12.4
   ```

2. **Follow the same development build process as above**

### Bare React Native Projects

For projects ejected from Expo or created with `react-native init`:

1. **Follow React Native CLI instructions above**

2. **Additional Metro configuration** (if needed):
   Create or update `metro.config.js`:
   ```javascript
   const { getDefaultConfig } = require('expo/metro-config');
   
   const config = getDefaultConfig(__dirname);
   
   config.resolver.alias = {
     'react-native-color-thief': require.resolve('react-native-color-thief'),
   };
   
   module.exports = config;
   ```

## Platform-Specific Setup

### iOS Configuration

1. **Minimum deployment target:**
   In Xcode, set iOS Deployment Target to 14.0 or higher.

2. **Podfile configuration:**
   Ensure your `ios/Podfile` has:
   ```ruby
   platform :ios, '14.0'
   ```

3. **Install pods:**
   ```bash
   cd ios && pod install && cd ..
   ```

### Android Configuration

1. **Minimum SDK version:**
   In `android/build.gradle`:
   ```gradle
   buildscript {
       ext {
           minSdkVersion = 21
           compileSdkVersion = 34
           targetSdkVersion = 34
       }
   }
   ```

2. **For video support (optional):**
   Set minSdkVersion to 26 or higher:
   ```gradle
   minSdkVersion = 26
   ```

3. **ProGuard configuration** (if using ProGuard):
   Add to `android/app/proguard-rules.pro`:
   ```
   -keep class com.shopify.reactnative.skia.** { *; }
   ```

## Verification

### Compatibility Check

Run the built-in compatibility checker:
```bash
npx react-native-color-thief-check
```

### Test Installation

Create a simple test file:
```typescript
// TestColorThief.tsx
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { ReactNativeColorThief } from 'react-native-color-thief';

export default function TestColorThief() {
  useEffect(() => {
    const testLibrary = async () => {
      try {
        const colorThief = new ReactNativeColorThief();
        
        // Check compatibility
        const compatibility = colorThief.checkVersionCompatibility();
        console.log('Compatibility:', compatibility);
        
        // Test with a simple image (replace with your image URL)
        const colors = await colorThief.getProminentColors('https://via.placeholder.com/100x100/ff0000/ffffff');
        console.log('Extracted colors:', colors);
      } catch (error) {
        console.error('Test failed:', error);
      }
    };
    
    testLibrary();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Check console for test results</Text>
    </View>
  );
}
```

## Troubleshooting Installation

### Common Issues

1. **"Cannot resolve module" error:**
   - Clear Metro cache: `npx react-native start --reset-cache`
   - Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

2. **iOS build failures:**
   - Clean build folder in Xcode (Product → Clean Build Folder)
   - Delete `ios/Pods` and `ios/Podfile.lock`, then run `pod install`
   - Ensure iOS deployment target is 14.0+

3. **Android build failures:**
   - Clean project: `cd android && ./gradlew clean && cd ..`
   - Ensure minSdkVersion is 21+
   - Check that Android SDK and build tools are up to date

4. **Expo compatibility issues:**
   - Ensure you're using a custom development build, not Expo Go
   - Check that all dependencies are compatible with your Expo SDK version

### Getting Help

If you encounter issues:

1. Run the compatibility checker: `npx react-native-color-thief-check`
2. Check the [troubleshooting section](README.md#troubleshooting) in the main README
3. Create an issue on GitHub with your environment details

## Version Migration

### Upgrading from Legacy Versions

If you're upgrading React Native from ≤0.78 to ≥0.79:

1. **Update React Native:**
   ```bash
   npx react-native upgrade
   ```

2. **Update React:**
   ```bash
   npm install react@latest
   ```

3. **Update Skia:**
   ```bash
   npm install @shopify/react-native-skia@latest
   ```

4. **Verify compatibility:**
   ```bash
   npx react-native-color-thief-check
   ```

### Downgrading for Legacy Projects

If you need to use legacy versions:

1. **Install specific Skia version:**
   ```bash
   npm install @shopify/react-native-skia@1.12.4
   ```

2. **Verify compatibility:**
   ```bash
   npx react-native-color-thief-check
   ```

## Next Steps

After successful installation:

1. Read the [main README](README.md) for usage examples
2. Check out the [API documentation](README.md#api-reference)
3. Review [performance tips](README.md#performance-tips)
4. Explore the [example implementations](README.md#usage-examples)
