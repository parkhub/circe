import createUUID from './createUUID';

test('Should create a UUID string', () => {
  const uuid = createUUID();

  expect(uuid).toBeDefined();
  expect(typeof uuid).toBe('string');
});
