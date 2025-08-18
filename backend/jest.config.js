module.exports = {
  testEnvironment: 'node',
  verbose: true,
  testMatch: ['<rootDir>/dist/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/src/'],
};
