import validators from './';

test('Should return validators API', () => {
  expect(validators.load).toBeDefined();
  expect(typeof validators.load).toBe('function');
});
