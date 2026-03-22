// Test setup file
// This file runs before each test file

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.OPAL_TEST_MODE = '1';

// Increase timeout for async operations
jest.setTimeout(30000);

// Suppress console output during tests unless verbose mode
if (!process.env.VERBOSE_TESTS) {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: console.error, // Keep error logging
  };
}

// Cleanup function to run after all tests
afterAll(async () => {
  // Add any global cleanup here
  await new Promise(resolve => setTimeout(resolve, 100));
});
