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
  // Try multiple strategies to find the package
  const searchPaths = [
    // User's project node_modules
    path.join(projectRoot, 'node_modules', packageName, 'package.json'),
    // Parent directory node_modules (if running from within node_modules)
    path.join(projectRoot, '..', '..', packageName, 'package.json'),
    // Go up to find the actual project root and check node_modules there
    path.join(projectRoot, '..', '..', '..', 'node_modules', packageName, 'package.json'),
  ];

  for (const packageJsonPath of searchPaths) {
    try {
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        return packageJson.version;
      }
    } catch (error) {
      // Continue to next path
      continue;
    }
  }

  // Fallback: try to use require.resolve to find the package
  try {
    const resolvedPath = require.resolve(`${packageName}/package.json`, { paths: [projectRoot] });
    const packageJson = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
    return packageJson.version;
  } catch (error) {
    // Package not found
  }

  return null;
}

function getVersionFromPackageJson(packageName, projectRoot) {
  try {
    const packageJsonPath = path.join(projectRoot, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
        ...packageJson.peerDependencies
      };
      
      const version = allDeps[packageName];
      if (version) {
        // Remove version prefixes like ^, ~, >=, etc.
        return version.replace(/^[\^~>=<]+/, '');
      }
    }
  } catch (error) {
    // Package.json not found or invalid
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

function findProjectRoot() {
  // Start from current working directory
  let currentDir = process.cwd();
  
  // If we're running from within node_modules, go up to find the actual project
  if (currentDir.includes('node_modules')) {
    // Find the project root by going up from node_modules
    const nodeModulesIndex = currentDir.indexOf('node_modules');
    currentDir = currentDir.substring(0, nodeModulesIndex - 1); // -1 to remove trailing slash
  }
  
  // Look for package.json to confirm we're in a project root
  let searchDir = currentDir;
  while (searchDir !== path.dirname(searchDir)) {
    const packageJsonPath = path.join(searchDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      // Check if this package.json has react-native or react as dependencies
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
          ...packageJson.peerDependencies
        };
        
        // Skip if this is the rn-color-thief package itself
        if (packageJson.name === 'rn-color-thief') {
          searchDir = path.dirname(searchDir);
          continue;
        }
        
        if (allDeps.react || allDeps['react-native'] || allDeps['@shopify/react-native-skia']) {
          return searchDir;
        }
      } catch (error) {
        // Continue searching
      }
    }
    searchDir = path.dirname(searchDir);
  }
  
  // Fallback to current working directory
  return currentDir;
}

function checkVersionCompatibility(debug = false) {
  const projectRoot = findProjectRoot();
  let hasErrors = false;
  let hasWarnings = false;

  log('\n🔍 Checking react-native-color-thief compatibility...', 'blue');
  log('=' .repeat(60), 'blue');

  if (debug) {
    log(`\n🔧 Debug Info:`, 'yellow');
    log(`   Current working directory: ${process.cwd()}`, 'yellow');
    log(`   Detected project root: ${projectRoot}`, 'yellow');
  }

  // Get installed versions - try node_modules first, then fallback to package.json
  const reactVersion = getPackageVersion('react', projectRoot) || getVersionFromPackageJson('react', projectRoot);
  const reactNativeVersion = getPackageVersion('react-native', projectRoot) || getVersionFromPackageJson('react-native', projectRoot);
  const skiaVersion = getPackageVersion('@shopify/react-native-skia', projectRoot) || getVersionFromPackageJson('@shopify/react-native-skia', projectRoot);

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
  const debug = process.argv.includes('--debug') || process.argv.includes('-d');
  checkVersionCompatibility(debug);
}

module.exports = { checkVersionCompatibility };
