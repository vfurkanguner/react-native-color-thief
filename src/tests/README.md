# Test Suite for React Native Color Thief

This directory contains comprehensive unit and integration tests for the React Native Color Thief library.

## Test Structure

### Core Test Files

- **`color-converters.test.ts`** - Tests for color conversion utilities
- **`react-native-color-thief.test.ts`** - Main class functionality tests
- **`integration.test.ts`** - End-to-end integration tests
- **`edge-cases.test.ts`** - Edge cases and error scenarios
- **`setup.ts`** - Test configuration and utilities

## Test Categories

### Unit Tests

#### Color Converters (`color-converters.test.ts`)
- RGB to various format conversions (hex, HSL, etc.)
- Color format validation
- Edge cases (black, white, invalid inputs)
- Round-trip conversion consistency

#### ReactNativeColorThief Class (`react-native-color-thief.test.ts`)
- Constructor and configuration
- Color extraction methods
- Error handling
- Canvas management
- Pixel filtering logic

### Integration Tests (`integration.test.ts`)

#### End-to-End Workflows
- Complete color extraction pipeline
- Consistency across different methods
- Multiple image format support
- Configuration changes impact

#### Performance & Memory
- Sequential and concurrent operations
- Memory leak prevention
- Resource cleanup

#### Real-world Scenarios
- Web URL handling
- UI theming use cases
- Performance tuning with quality settings

### Edge Cases (`edge-cases.test.ts`)

#### Data Edge Cases
- Empty images
- Single pixel images
- Transparent images
- All-white images

#### Configuration Extremes
- Minimum/maximum quality values
- Extreme color counts
- Alpha thresholds
- Canvas size limits

#### Error Scenarios
- Network failures
- Malformed data
- Resource exhaustion
- Quantization failures

## Test Utilities

### Custom Matchers
- `toBeValidHexColor()` - Validates hex color format
- `toBeValidRgbString()` - Validates RGB string format
- `toBeValidHslString()` - Validates HSL string format

### Mock Helpers
- `createMockPixelData()` - Generate test pixel arrays
- `createMockSkiaImage()` - Mock Skia image objects
- `createMockSkiaCanvas()` - Mock Skia canvas objects
- `createMockSkiaSurface()` - Mock Skia surface objects

### Test Constants
- `TEST_COLORS` - Predefined color values
- `TEST_URLS` - Sample image URLs for testing

## Running Tests

### Basic Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Specific Test Files

```bash
# Run only color converter tests
npx jest color-converters.test.ts

# Run only main class tests
npx jest react-native-color-thief.test.ts

# Run only integration tests
npx jest integration.test.ts

# Run only edge case tests
npx jest edge-cases.test.ts
```

### Test Patterns

```bash
# Run tests matching a pattern
npx jest --testNamePattern="should extract colors"

# Run tests for specific functionality
npx jest --testNamePattern="Configuration"
```

## Coverage Goals

The test suite aims for:
- **80%+ line coverage** across all source files
- **80%+ branch coverage** for conditional logic
- **80%+ function coverage** for all public methods
- **80%+ statement coverage** for complete code paths

## Mocking Strategy

### External Dependencies
- **@shopify/react-native-skia** - Fully mocked with realistic behavior
- **quantize** - Mocked with configurable return values
- **color-convert** - Uses real implementation for accuracy

### Mock Behavior
- Skia mocks simulate realistic image processing
- Quantize mocks return predictable color palettes
- Error scenarios are simulated through mock failures

## Test Data

### Sample Colors
Tests use predefined colors for consistency:
- Primary colors (red, green, blue)
- Grayscale values (black, white, gray)
- Complex colors (orange, cyan, magenta)

### Sample Images
Mock images simulate various scenarios:
- Different dimensions (1x1 to 100x100)
- Various pixel densities
- Different alpha channel values
- Edge case content (empty, transparent, monochrome)

## Debugging Tests

### Verbose Output
```bash
npx jest --verbose
```

### Debug Specific Test
```bash
npx jest --testNamePattern="specific test name" --verbose
```

### Coverage Reports
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Contributing to Tests

### Adding New Tests
1. Follow existing naming conventions
2. Use descriptive test names
3. Include both positive and negative test cases
4. Add appropriate mocks for external dependencies

### Test Organization
- Group related tests in `describe` blocks
- Use `beforeEach` for common setup
- Clean up mocks between tests
- Use meaningful assertions

### Mock Guidelines
- Mock external dependencies completely
- Simulate realistic behavior
- Test both success and failure scenarios
- Verify mock interactions when relevant

## Continuous Integration

Tests are designed to run in CI environments:
- No external network dependencies
- Deterministic results
- Fast execution
- Comprehensive error reporting

The test suite provides confidence in code quality and helps prevent regressions during development.
