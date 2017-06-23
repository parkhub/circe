/* eslint-disable no-underscore-dangle */

const mockProducer = {
  publishEvent: jest.fn(),
  addListener: jest.fn(),
  disconnect: jest.fn(),
  nativeConsumer: jest.fn()
};

const mockConsumer = {
  subscribeToEvent: jest.fn(),
  eventMessageParser: jest.fn(data => data.message),
  unsubscribeFromEvents: jest.fn(),
  addListener: jest.fn(),
  disconnect: jest.fn(),
  nativeConsumer: jest.fn()
};

const consumer = jest.fn(
  () =>
    new Promise((resolve) => {
      process.nextTick(() => {
        resolve(Object.create(mockConsumer));
      });
    })
);

const producer = jest.fn(
  () =>
    new Promise((resolve) => {
      process.nextTick(() => {
        resolve(Object.create(mockProducer));
      });
    })
);

function testPlugin() {
  return () => ({
    consumer,
    producer
  });
}

testPlugin.__mockConsumer__ = mockConsumer;
testPlugin.__mockConsumerFn__ = consumer;

testPlugin.__mockProducer__ = mockProducer;
testPlugin.__mockProducerFn__ = producer;

export default testPlugin;

