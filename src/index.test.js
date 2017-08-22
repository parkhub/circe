import circe from './';

test('Should return circe API', () => {
  expect(typeof circe.createProducer).toBe('function');
  expect(typeof circe.createConsumer).toBe('function');
});
