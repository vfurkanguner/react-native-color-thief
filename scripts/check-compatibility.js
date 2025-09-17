#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Compatibility checker for react-native-color-thief
 * Validates React, React Native, and Skia version compatibility
 */

const COLORS = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function getPackageVersion(packageName, projectRoot) {
  try {
    const packageJsonPath = path.join(projectRoot, 'node_modules', packageName, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      return packageJson.version;
    }
  } catch (error) {
    // Package not found or invalid
  }
  return null;
}

function parseVersion(version) {
  if (!version) return null;
  const match = version.match(/(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10)
  };
}

function compareVersions(v1, v2) {
  if (!v1 || !v2) return 0;
  
  if (v1.major !== v2.major) return v1.major - v2.major;
  if (v1.minor !== v2.minor) return v1.minor - v2.minor;
  return v1.patch - v2.patch;
}

function checkVersionCompatibility() {
  const projectRoot = process.cwd();
  let hasErrors = false;
  let hasWarnings = false;

  log('\n🔍 Checking react-native-color-thief compatibility...', 'blue');
  log('=' .repeat(60), 'blue');

  // Get installed versions
  const reactVersion = getPackageVersion('react', projectRoot);
  const reactNativeVersion = getPackageVersion('react-native', projectRoot);
  const skiaVersion = getPackageVersion('@shopify/react-native-skia', projectRoot);

  log(`\n📦 Detected versions:`, 'bold');
  log(`   React: ${reactVersion || 'Not found'}`, reactVersion ? 'green' : 'red');
  log(`   React Native: ${reactNativeVersion || 'Not found'}`, reactNativeVersion ? 'green' : 'red');
  log(`   React Native Skia: ${skiaVersion || 'Not found'}`, skiaVersion ? 'green' : 'red');

  // Parse versions
  const reactParsed = parseVersion(reactVersion);
  const reactNativeParsed = parseVersion(reactNativeVersion);
  const skiaParsed = parseVersion(skiaVersion);

  log(`\n✅ Compatibility Check Results:`, 'bold');

  // Check React version
  if (reactParsed) {
    const isReact19Plus = compareVersions(reactParsed, { major: 19, minor: 0, patch: 0 }) >= 0;
    const isReact18Plus = compareVersions(reactParsed, { major: 18, minor: 0, patch: 0 }) >= 0;
    
    if (isReact19Plus) {
      log(`   ✅ React ${reactVersion} - Fully supported (>=19.0.0)`, 'green');
    } else if (isReact18Plus) {
      log(`   ⚠️  React ${reactVersion} - Legacy support (18.x)`, 'yellow');
      hasWarnings = true;
    } else {
      log(`   ❌ React ${reactVersion} - Unsupported (<18.0.0)`, 'red');
      hasErrors = true;
    }
  } else {
    log(`   ❌ React - Not found or invalid version`, 'red');
    hasErrors = true;
  }

  // Check React Native version
  if (reactNativeParsed) {
    const isRN79Plus = compareVersions(reactNativeParsed, { major: 0, minor: 79, patch: 0 }) >= 0;
    const isRN70Plus = compareVersions(reactNativeParsed, { major: 0, minor: 70, patch: 0 }) >= 0;
    
    if (isRN79Plus) {
      log(`   ✅ React Native ${reactNativeVersion} - Fully supported (>=0.79.0)`, 'green');
    } else if (isRN70Plus) {
      log(`   ⚠️  React Native ${reactNativeVersion} - Legacy support (0.70-0.78)`, 'yellow');
      hasWarnings = true;
    } else {
      log(`   ❌ React Native ${reactNativeVersion} - Unsupported (<0.70.0)`, 'red');
      hasErrors = true;
    }
  } else {
    log(`   ❌ React Native - Not found or invalid version`, 'red');
    hasErrors = true;
  }

  // Check Skia version compatibility
  if (skiaParsed && reactNativeParsed) {
    const isRN78OrBelow = compareVersions(reactNativeParsed, { major: 0, minor: 78, patch: 99 }) <= 0;
    const isSkia1124OrBelow = compareVersions(skiaParsed, { major: 1, minor: 12, patch: 4 }) <= 0;
    const isSkia2Plus = compareVersions(skiaParsed, { major: 2, minor: 0, patch: 0 }) >= 0;

    if (isRN78OrBelow && !isSkia1124OrBelow) {
      log(`   ❌ React Native Skia ${skiaVersion} - Incompatible with RN ${reactNativeVersion}`, 'red');
      log(`      For React Native ≤0.78, use @shopify/react-native-skia ≤1.12.4`, 'red');
      hasErrors = true;
    } else if (isRN78OrBelow && isSkia1124OrBelow) {
      log(`   ✅ React Native Skia ${skiaVersion} - Compatible with RN ${reactNativeVersion}`, 'green');
    } else if (isSkia2Plus) {
      log(`   ✅ React Native Skia ${skiaVersion} - Fully supported (>=2.0.0)`, 'green');
    } else {
      log(`   ⚠️  React Native Skia ${skiaVersion} - May have compatibility issues`, 'yellow');
      hasWarnings = true;
    }
  } else if (!skiaParsed) {
    log(`   ❌ React Native Skia - Not found or invalid version`, 'red');
    hasErrors = true;
  }

  // Platform requirements
  log(`\n📱 Platform Requirements:`, 'bold');
  log(`   iOS: 14.0 or higher required`, 'blue');
  log(`   Android: API level 21 (Android 5.0) or higher required`, 'blue');
  log(`   Android with video support: API level 26 (Android 8.0) or higher required`, 'blue');

  // Summary
  log(`\n📋 Summary:`, 'bold');
  if (hasErrors) {
    log(`   ❌ Compatibility check failed - Please update incompatible versions`, 'red');
    log(`\n💡 Recommended actions:`, 'yellow');
    
    if (!reactParsed || compareVersions(reactParsed, { major: 18, minor: 0, patch: 0 }) < 0) {
      log(`   • Update React to >=18.0.0 (preferably >=19.0.0)`, 'yellow');
    }
    
    if (!reactNativeParsed || compareVersions(reactNativeParsed, { major: 0, minor: 70, patch: 0 }) < 0) {
      log(`   • Update React Native to >=0.70.0 (preferably >=0.79.0)`, 'yellow');
    }
    
    if (!skiaParsed) {
      log(`   • Install @shopify/react-native-skia`, 'yellow');
    } else if (reactNativeParsed && compareVersions(reactNativeParsed, { major: 0, minor: 78, patch: 99 }) <= 0) {
      const isSkia1124OrBelow = compareVersions(skiaParsed, { major: 1, minor: 12, patch: 4 }) <= 0;
      if (!isSkia1124OrBelow) {
        log(`   • Downgrade @shopify/react-native-skia to ≤1.12.4 for RN ≤0.78`, 'yellow');
      }
    }
    
    process.exit(1);
  } else if (hasWarnings) {
    log(`   ⚠️  Compatibility check passed with warnings - Consider upgrading`, 'yellow');
    log(`\n💡 Recommended upgrades:`, 'blue');
    
    if (reactParsed && compareVersions(reactParsed, { major: 19, minor: 0, patch: 0 }) < 0) {
      log(`   • Upgrade React to >=19.0.0 for full feature support`, 'blue');
    }
    
    if (reactNativeParsed && compareVersions(reactNativeParsed, { major: 0, minor: 79, patch: 0 }) < 0) {
      log(`   • Upgrade React Native to >=0.79.0 for full feature support`, 'blue');
    }
  } else {
    log(`   ✅ All compatibility checks passed!`, 'green');
  }

  log(`\n${'='.repeat(60)}`, 'blue');
  log(`🎨 react-native-color-thief is ready to use!`, 'green');
}

// Run compatibility check
if (require.main === module) {
  checkVersionCompatibility();
}

module.exports = { checkVersionCompatibility };
