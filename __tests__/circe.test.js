import circe from '../src';

describe('circe() API', () => {
  test('Should create a new circe instance', () => {
    expect(circe.createProducer).toBeDefined();
    expect(typeof circe.createProducer).toBe('function');

    expect(circe.createConsumer).toBeDefined();
    expect(typeof circe.createConsumer).toBe('function');
  });
});
