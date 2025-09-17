# Testing Guide for React Native Color Thief

This guide provides comprehensive information about the test suite for the React Native Color Thief library.

## Quick Start

### Installation

First, install the required dependencies:

```bash
npm install
```

This will install all the testing dependencies including:
- `jest` - Testing framework
- `ts-jest` - TypeScript support for Jest
- `@types/jest` - TypeScript definitions for Jest
- `@types/quantize` - TypeScript definitions for quantize library

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

The test suite is organized into several categories:

### 1. Unit Tests

#### Color Converters (`src/color-converters.test.ts`)
Tests all color conversion utilities:
- RGB to hex, HSL, keyword conversions
- Format validation and edge cases
- Round-trip conversion consistency

#### Main Class (`src/react-native-color-thief.test.ts`)
Tests the core ReactNativeColorThief class:
- Constructor and configuration management
- Color extraction methods
- Error handling and resource cleanup
- Canvas and image processing

### 2. Integration Tests (`src/tests/integration.test.ts`)
End-to-end testing scenarios:
- Complete color extraction workflows
- Cross-method consistency validation
- Performance and memory management
- Real-world usage patterns

### 3. Edge Cases (`src/tests/edge-cases.test.ts`)
Boundary conditions and error scenarios:
- Empty or invalid image data
- Extreme configuration values
- Network and resource failures
- Unusual input formats

## Test Features

### Custom Matchers

The test suite includes custom Jest matchers for color validation:

```typescript
expect('#ff5733').toBeValidHexColor();
expect('rgb(255, 87, 51)').toBeValidRgbString();
expect('hsl(12, 100%, 60%)').toBeValidHslString();
```

### Mock Utilities

Helper functions for creating test data:

```typescript
import { createMockPixelData, TEST_COLORS } from './src/tests/setup';

const pixels = createMockPixelData([
  TEST_COLORS.RED,
  TEST_COLORS.GREEN,
  TEST_COLORS.BLUE
]);
```

### Test Constants

Predefined test data for consistency:

```typescript
import { TEST_COLORS, TEST_URLS } from './src/tests/setup';

// Use predefined colors
const redPixel = TEST_COLORS.RED; // [255, 0, 0]

// Use predefined URLs
const testImage = TEST_URLS.JPG; // 'https://example.com/test-image.jpg'
```

## Mocking Strategy

### External Dependencies

The test suite mocks external dependencies to ensure:
- Tests run without network access
- Consistent, predictable results
- Fast execution
- Isolated testing of our code

#### Skia Mocking
```typescript
jest.mock('@shopify/react-native-skia', () => ({
  Skia: {
    Surface: { MakeOffscreen: jest.fn() },
    Data: { fromURI: jest.fn() },
    // ... other Skia APIs
  },
}));
```

#### Quantize Mocking
```typescript
jest.mock('quantize', () => {
  return jest.fn().mockImplementation(() => ({
    palette: () => [/* mock colors */],
  }));
});
```

## Coverage Goals

The test suite maintains high coverage standards:

- **Lines**: 80%+ coverage of all executable code
- **Branches**: 80%+ coverage of conditional logic
- **Functions**: 80%+ coverage of all methods
- **Statements**: 80%+ coverage of all statements

View coverage reports:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Test Categories Explained

### Unit Tests
- Test individual functions and methods in isolation
- Mock all external dependencies
- Focus on specific functionality
- Fast execution

### Integration Tests
- Test complete workflows end-to-end
- Verify component interactions
- Simulate real-world usage
- Ensure consistency across methods

### Edge Case Tests
- Test boundary conditions
- Verify error handling
- Test with unusual inputs
- Ensure graceful degradation

## Writing New Tests

### Test Structure
```typescript
describe('Feature Name', () => {
  let instance: ReactNativeColorThief;

  beforeEach(() => {
    // Setup mocks and test data
    instance = new ReactNativeColorThief();
  });

  describe('Method Name', () => {
    it('should handle normal case', () => {
      // Test implementation
    });

    it('should handle edge case', () => {
      // Edge case test
    });

    it('should throw error for invalid input', () => {
      // Error case test
    });
  });
});
```

### Best Practices

1. **Descriptive Names**: Use clear, descriptive test names
2. **Single Responsibility**: Each test should verify one specific behavior
3. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
4. **Mock External Dependencies**: Always mock external APIs and libraries
5. **Test Both Success and Failure**: Include positive and negative test cases

### Adding Custom Matchers

```typescript
// In setup.ts
expect.extend({
  toBeValidColor(received: string) {
    const pass = /* validation logic */;
    return {
      message: () => `expected ${received} to be a valid color`,
      pass,
    };
  },
});

// In test files
expect('#ff5733').toBeValidColor();
```

## Debugging Tests

### Running Specific Tests
```bash
# Run tests matching a pattern
npx jest --testNamePattern="should extract colors"

# Run a specific test file
npx jest color-converters.test.ts

# Run tests in a specific directory
npx jest src/tests/
```

### Verbose Output
```bash
npx jest --verbose
```

### Debug Mode
```bash
npx jest --detectOpenHandles --forceExit
```

## Continuous Integration

The test suite is designed for CI environments:

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

### Test Performance
- Tests complete in under 30 seconds
- No external network dependencies
- Deterministic results
- Parallel execution support

## Troubleshooting

### Common Issues

#### TypeScript Errors
Ensure all type definitions are installed:
```bash
npm install --save-dev @types/jest @types/quantize typescript
```

#### Mock Issues
Clear Jest cache if mocks aren't working:
```bash
npx jest --clearCache
```

#### Coverage Issues
Exclude test files from coverage:
```javascript
// jest.config.js
collectCoverageFrom: [
  'src/**/*.ts',
  '!src/**/*.test.ts',
  '!src/**/*.spec.ts'
]
```

### Getting Help

1. Check the test output for specific error messages
2. Review the mock setup in `src/tests/setup.ts`
3. Ensure all dependencies are properly installed
4. Verify TypeScript configuration is correct

## Contributing

When contributing to the test suite:

1. **Add tests for new features**: All new functionality should include comprehensive tests
2. **Update existing tests**: Modify tests when changing existing functionality
3. **Maintain coverage**: Ensure coverage thresholds are maintained
4. **Follow conventions**: Use existing patterns and naming conventions
5. **Document complex tests**: Add comments for complex test logic

The test suite is a critical part of maintaining code quality and preventing regressions. Well-written tests serve as documentation and provide confidence when making changes to the codebase.
