import kafka from 'node-rdkafka';
import createConsumer from '../src/lib/createConsumer';

jest.mock('node-rdkafka');

beforeEach(() => {
  jest.clearAllMocks();
});

test('Should throw if connection is not passed', async () => {
  const err = new Error('"connection" configuration is required');
  await expect(createConsumer({ groupId: '12' })).rejects.toEqual(err);
});

test('Should throw if groupId is not passed', async () => {
  const err = new Error('"groupId" configuration is required');
  await expect(createConsumer({ connection: 'test' })).rejects.toEqual(err);
});

test('Should create a new consumer', async () => {
  const consumer = await createConsumer({ connection: 'fake123', groupId: 'one' });

  expect(consumer.subscribeToEvent).toBeDefined();
  expect(typeof consumer.subscribeToEvent).toBe('function');
});

test('Should subscribe to a topic', async () => {
  const consumerCfgs = {
    connection: 'kafka:123',
    groupId: 'one',
    baseLibCfg: 'test',
    topicCfgs: {
      topicCfg: 'test-topic-cfg'
    }
  };
  const handler = jest.fn();

  const consumer = await createConsumer(consumerCfgs);
  const expectedConsCfgs = {
    'metadata.broker.list': 'kafka:123',
    'group.id': 'one',
    baseLibCfg: 'test'
  };
  const expectedTopicCfgs = {
    topicCfg: 'test-topic-cfg'
  };

  expect(kafka.KafkaConsumer).toHaveBeenCalledWith(expectedConsCfgs, expectedTopicCfgs);
  const subscribeCfgs = {
    event: ['TEST'],
    handler
  };

  consumer.subscribeToEvent(subscribeCfgs);
  expect(kafka.subscribe).toHaveBeenCalledWith(['TEST'], handler);
});

test('Should throw if missing event or handler to subscribe to an event', async () => {
  const consumerCfgs = {
    connection: 'kafka:123',
    groupId: 'one',
    baseLibCfg: 'test',
    topicCfgs: {
      topicCfg: 'test-topic-cfg'
    }
  };
  const handler = jest.fn();

  const consumer = await createConsumer(consumerCfgs);
  const noTopicCfgs = {
    handler
  };

  expect(() => consumer.subscribeToEvent(noTopicCfgs)).toThrow();

  const noHandlerCfgs = {
    topic: 'test'
  };

  expect(() => consumer.subscribeToEvent(noHandlerCfgs)).toThrow();
});

test('Should accept an Array or convert a single event into one', async () => {
  const consumerCfgs = {
    connection: 'kafka:123',
    groupId: 'one',
    baseLibCfg: 'test',
    topicCfgs: {
      topicCfg: 'test-topic-cfg'
    }
  };
  const handler = jest.fn();

  const consumer = await createConsumer(consumerCfgs);
  const singleEvent = {
    event: 'TEST_EVENT',
    handler
  };

  consumer.subscribeToEvent(singleEvent);

  expect(kafka.subscribe).toHaveBeenCalledWith(['TEST_EVENT'], handler);

  const multipleEvents = {
    event: ['TEST_EVENT', 'ANOTHER_ONE'],
    handler
  };

  consumer.subscribeToEvent(multipleEvents);

  expect(kafka.subscribe).toHaveBeenCalledWith(['TEST_EVENT', 'ANOTHER_ONE'], handler);
});
