import formatKafkaMessage from './formatKafkaMessage';

test('Should return a buffer of a stringified JS object if passed in an object', () => {
  const testMessage = {
    test: 'test'
  };

  const formattedMessage = formatKafkaMessage(testMessage);

  expect(JSON.parse(formattedMessage.toString())).toEqual(testMessage);
});

test('Should return a buffer of anything that is not an object(like a string)', () => {
  const testMessage = 'test message';

  const formattedMessage = formatKafkaMessage(testMessage);

  expect(formattedMessage.toString()).toEqual(testMessage);
});
