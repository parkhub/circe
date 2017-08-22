import keyGen from './';

test('Should expose key-generator factory', () => {
  expect(typeof keyGen).toBe('function');
});
