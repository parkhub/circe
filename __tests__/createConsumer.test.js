import kafka from 'node-rdkafka';
import createConsumer from '../src/lib/createConsumer';

jest.mock('node-rdkafka');

beforeEach(() => {
  jest.clearAllMocks();
});

test('Should throw if connection is not passed', async () => {
  const err = new Error('connection is required');
  await expect(createConsumer({ groupId: '12' })).rejects.toEqual(err);
});

test('Should throw if groupId is not passed', async () => {
  const err = new Error('groupId is required');
  await expect(createConsumer({ connection: 'test' })).rejects.toEqual(err);
});

test('Should create a new consumer', async () => {
  const consumer = await createConsumer({ connection: 'fake123', groupId: 'one' });

  expect(consumer.subscribe).toBeDefined();
  expect(typeof consumer.subscribe).toBe('function');
});

describe('.subscribe', () => {
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
    const topic = ['TEST'];

    consumer.subscribe(topic, handler);
    expect(kafka.subscribe).toHaveBeenCalledWith(['TEST'], handler);
  });

  test('Should throw if no configs are passed to subscribe', async () => {
    const consumerCfgs = {
      connection: 'kafka:123',
      groupId: 'one',
      baseLibCfg: 'test',
      topicCfgs: {
        topicCfg: 'test-topic-cfg'
      }
    };
    const consumer = await createConsumer(consumerCfgs);

    expect(() => consumer.subscribe()).toThrow();
  });

  test('Should throw if missing topic or handler to subscribe to an topic', async () => {
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

    expect(() => consumer.subscribe(noTopicCfgs)).toThrow();

    const noHandlerCfgs = {
      topic: 'test'
    };

    expect(() => consumer.subscribe(noHandlerCfgs)).toThrow();
  });

  test('Should accept a an array of event handler types and multiple events', async () => {
    const consumerCfgs = {
      connection: 'kafka:123',
      groupId: 'one',
      baseLibCfg: 'test',
      topicCfgs: {
        topicCfg: 'test-topic-cfg'
      }
    };
    const consumer = await createConsumer(consumerCfgs);

    const topics = ['TEST_EVENT', 'TEST_EVENT_TWO'];
    const handler = jest.fn();
    const handlerTwo = jest.fn();
    const handlers = [
      {
        topic: 'TEST_EVENT',
        handler
      },
      {
        topic: 'TEST_EVENT_TWO',
        handler: handlerTwo
      }
    ];

    consumer.subscribe(topics, handlers);

    const message = 'trigger message';
    const triggerMsg = {
      topic: 'TEST_EVENT',
      value: Buffer.from(message),
      partition: 1
    };

    const messageTwo = 'trigger two message';
    const triggerMsgTwo = {
      topic: 'TEST_EVENT_TWO',
      value: Buffer.from(messageTwo),
      partition: 2
    };

    kafka.KafkaConsumer.mock.instances[0].triggerEvent('TEST_EVENT', triggerMsg);
    kafka.KafkaConsumer.mock.instances[0].triggerEvent('TEST_EVENT_TWO', triggerMsgTwo);

    expect(handler).toHaveBeenCalledWith({ message, partition: 1 });
    expect(handlerTwo).toHaveBeenCalledWith({ message: messageTwo, partition: 2 });
  });

  test('Should accept a handler function or an array of event handler types', async () => {
    const consumerCfgs = {
      connection: 'kafka:123',
      groupId: 'one',
      baseLibCfg: 'test',
      topicCfgs: {
        topicCfg: 'test-topic-cfg'
      }
    };
    const consumer = await createConsumer(consumerCfgs);

    const topic = 'TEST_EVENT';
    const handler = jest.fn();
    const handlers = [
      {
        topic,
        handler
      }
    ];

    consumer.subscribe(topic, handlers);

    const message = 'trigger message';
    const triggerMsg = {
      topic,
      value: Buffer.from(message),
      partition: 1
    };

    kafka.KafkaConsumer.mock.instances[0].triggerEvent(topic, triggerMsg);

    expect(handler).toHaveBeenCalledWith({ message, partition: 1 });
  });

  test('Should accept an Array or convert a single topic into one for topic cfg', async () => {
    const consumerCfgs = {
      connection: 'kafka:123',
      groupId: 'one',
      baseLibCfg: 'test',
      topicCfgs: {
        topicCfg: 'test-topic-cfg'
      }
    };
    const topic = 'TEST_EVENT';
    const handler = jest.fn();

    const consumer = await createConsumer(consumerCfgs);

    consumer.subscribe(topic, handler);

    expect(kafka.subscribe).toHaveBeenCalledWith([topic], handler);

    const multipleTopics = ['TEST_EVENT', 'ANOTHER_ONE'];

    consumer.subscribe(multipleTopics, handler);

    expect(kafka.subscribe).toHaveBeenCalledWith(multipleTopics, handler);
  });

  test('Should throw if a handler is not defined for a specific topic', async () => {
    const consumerCfgs = {
      connection: 'kafka:123',
      groupId: 'one',
      baseLibCfg: 'test',
      topicCfgs: {
        topicCfg: 'test-topic-cfg'
      }
    };
    const consumer = await createConsumer(consumerCfgs);

    const topic = 'TEST_EVENT';
    const handlers = [
      {
        topic
      }
    ];

    consumer.subscribe(topic, handlers);

    const message = 'trigger message';
    const triggerMsg = {
      topic,
      value: Buffer.from(message),
      partition: 1
    };

    expect(() => kafka.KafkaConsumer.mock.instances[0].triggerEvent(topic, triggerMsg)).toThrow();
  });

  test('Should give a JS object if message is JSON', async () => {
    const consumerCfgs = {
      connection: 'kafka:123',
      groupId: 'one',
      baseLibCfg: 'test',
      topicCfgs: {
        topicCfg: 'test-topic-cfg'
      }
    };
    const consumer = await createConsumer(consumerCfgs);

    const topic = 'TEST_EVENT';
    const handler = jest.fn();
    const handlers = [
      {
        topic,
        handler
      }
    ];

    consumer.subscribe(topic, handlers);

    const message = {
      test: 'test message'
    };

    const triggerMsg = {
      topic,
      value: Buffer.from(JSON.stringify(message)),
      partition: 1
    };

    kafka.KafkaConsumer.mock.instances[0].triggerEvent(topic, triggerMsg);

    expect(handler).toHaveBeenCalledWith({ message, partition: 1 });
  });
});
