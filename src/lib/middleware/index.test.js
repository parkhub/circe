import middleware from './';

test('Should expose middleware factory', () => {
  expect(typeof middleware).toBe('function');
});
