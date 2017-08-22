import producer from './';

test('Should return producer factory', () => {
  expect(typeof producer).toBe('function');
});
