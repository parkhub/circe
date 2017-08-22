import loadHandlers from './loadHandlers';

test('Should create a map of handlers from an array of handler cfgs', () => {
  const topic = 'TEST_TOPIC';
  const handler = jest.fn();

  const topicTwo = 'TEST_TWO_TOPIC';
  const handlerTwo = jest.fn();

  const cfgs = [
    {
      topic,
      handler
    },
    {
      topic: topicTwo,
      handler: handlerTwo
    }
  ];

  const handlersMap = loadHandlers(cfgs);

  const topics = handlersMap.keys();

  expect(Array.from(topics)).toEqual([topic, topicTwo]);
  expect(handlersMap.get(topic)).toEqual(handler);
  expect(handlersMap.get(topicTwo)).toEqual(handlerTwo);
});
