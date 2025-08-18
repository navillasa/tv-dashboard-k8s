module.exports = {
  testEnvironment: 'node',
  verbose: true,
  testMatch: ['<rootDir>/dist/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/src/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
