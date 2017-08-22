import parseMessage from './parseMessage';

test('Should parse a JSON string into JS object', () => {
  const testMessage = {
    test: 'test'
  };
  const buffer = Buffer.from(JSON.stringify(testMessage));

  expect(parseMessage(buffer)).toEqual(testMessage);
});

test('Should parse a string that is not JSON ', () => {
  const testMessage = 'test string';
  const buffer = Buffer.from(testMessage);

  expect(parseMessage(buffer)).toBe(testMessage);
});
