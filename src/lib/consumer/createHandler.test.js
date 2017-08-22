import createHandler from './createHandler';
import coreHandler from './coreHandler';
import loadHandlers from './loadHandlers';

jest.mock('./coreHandler');
jest.mock('./loadHandlers');

test('Should return a handler fn that takes message data for a topic and applies handler', () => {
  const topic = 'TEST_TOPIC';
  const handler = jest.fn();
  const applyMiddleware = jest.fn();

  const topicHandler = createHandler(handler, applyMiddleware);

  const messageData = {
    topic,
    test: 'value'
  };

  topicHandler(messageData);
  expect(coreHandler).toHaveBeenCalledWith(handler, applyMiddleware, messageData);
});

test('Should use the array of handler config types', () => {
  const topic = 'TEST_TOPIC';
  const handler = jest.fn();
  const handlers = [
    {
      topic,
      handler
    }
  ];
  const messageData = {
    topic,
    test: 'value'
  };

  const applyMiddleware = jest.fn();

  const topicHandler = createHandler(handlers, applyMiddleware);
  expect(loadHandlers).toHaveBeenCalledWith(handlers);

  topicHandler(messageData);

  expect(coreHandler).toHaveBeenCalledWith(handler, applyMiddleware, messageData);
});

test('Should throw if there is no handler for that particular topic', () => {
  const topic = 'TEST_TOPIC';
  const handler = jest.fn();
  const handlers = [
    {
      topic,
      handler
    }
  ];
  const messageData = {
    topic: 'NOT_MY_TOPIC',
    test: 'value'
  };

  const applyMiddleware = jest.fn();

  const topicHandler = createHandler(handlers, applyMiddleware);
  expect(loadHandlers).toHaveBeenCalledWith(handlers);

  expect(() => topicHandler(messageData)).toThrow();
});

test('Should throw if handler is not an array or a function', () => {
  const handler = {};
  const applyMiddleware = jest.fn();

  expect(() => createHandler(handler, applyMiddleware)).toThrow();
});
