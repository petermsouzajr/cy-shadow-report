module.exports = {
  transform: {
    // '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(module-that-needs-transpiling)/)', // Add any modules that need to be transpiled by Babel
  ],
  // If you're using ESM, you might need the following options as well:
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'node'],
  collectCoverage: true,
  // coverageReporters: ['json', 'html'], //not required yet, later project update will use json output and send results to google sheet.
  collectCoverageFrom: [
    'src/**/*.mjs',
    'src/**/*.js',
    'scripts/**/*.mjs',
    'scripts/**/*.js',
  ],
  testMatch: [
    '**/__tests__/**/*.mjs',
    '**/?(*.)+(spec|test).mjs',
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js',
  ],
};
