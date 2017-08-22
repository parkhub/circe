import validators from './';

test('Should return validators factory', () => {
  expect(typeof validators).toBe('function');
});
