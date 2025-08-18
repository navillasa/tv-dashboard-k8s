// Jest setup for mocking
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
});
