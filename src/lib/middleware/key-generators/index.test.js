import api from './';

test('Should expose key-generator API', () => {
  expect(api.load).toBeDefined();
  expect(typeof api.load).toBe('function');
});
