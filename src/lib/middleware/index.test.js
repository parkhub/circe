import api from './';

test('Should expost middleware API', () => {
  expect(api.loadMiddleware).toBeDefined();
  expect(typeof api.loadMiddleware).toBe('function');
});
