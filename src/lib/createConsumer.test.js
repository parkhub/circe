import kafka from 'node-rdkafka';
import createConsumer from './createConsumer';
// import middleware from '../middleware';

jest.mock('node-rdkafka');
// jest.mock('./createHandler');
// jest.mock('../middleware');

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
  test('Should return the JS object from a JSON string', async () => {
    const topic = 'TEST';
    const expectedTriggerMessage = {
      test: 'test'
    };
    const triggerMsg = {
      topic,
      value: Buffer.from(JSON.stringify(expectedTriggerMessage))
    };
    const middlewareFn = jest.fn(args => args);
    const consumerCfgs = {
      connection: 'kafka:123',
      groupId: 'one',
      baseLibCfg: 'test',
      middlewares: [middlewareFn],
      topicCfgs: {
        topicCfg: 'test-topic-cfg'
      }
    };
    const handler = jest.fn();

    const handlerCfg = {
      topic,
      handler
    };

    const consumer = await createConsumer(consumerCfgs);
    consumer.subscribe([topic], [handlerCfg]);

    kafka.KafkaConsumer.mock.instances[0].triggerEvent(triggerMsg);

    expect(middlewareFn).toHaveBeenCalledWith({ topic, message: expectedTriggerMessage });
    expect(handler).toHaveBeenCalledWith({ topic, message: expectedTriggerMessage });
  });

  test('Should take a handler configuration array', async () => {
    const topic = 'TEST';
    const expectedTriggerMessage = 'value';
    const triggerMsg = {
      topic,
      value: Buffer.from(expectedTriggerMessage)
    };
    const middlewareFn = jest.fn(args => args);
    const consumerCfgs = {
      connection: 'kafka:123',
      groupId: 'one',
      baseLibCfg: 'test',
      middlewares: [middlewareFn],
      topicCfgs: {
        topicCfg: 'test-topic-cfg'
      }
    };
    const handler = jest.fn();

    const handlerCfg = {
      topic,
      handler
    };

    const consumer = await createConsumer(consumerCfgs);
    consumer.subscribe([topic], [handlerCfg]);

    kafka.KafkaConsumer.mock.instances[0].triggerEvent(triggerMsg);

    expect(middlewareFn).toHaveBeenCalledWith({ topic, message: expectedTriggerMessage });
    expect(handler).toHaveBeenCalledWith({ topic, message: expectedTriggerMessage });
  });

  test('Should apply middlewares', async () => {
    const topic = 'TEST';
    const expectedTriggerMessage = 'value';
    const triggerMsg = {
      topic,
      value: Buffer.from(expectedTriggerMessage)
    };
    const middlewareFn = jest.fn(args => args);
    const consumerCfgs = {
      connection: 'kafka:123',
      groupId: 'one',
      baseLibCfg: 'test',
      middlewares: [middlewareFn],
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
    const topics = [topic];

    consumer.subscribe(topics, handler);
    expect(kafka.subscribe).toHaveBeenCalledTimes(1);

    kafka.KafkaConsumer.mock.instances[0].triggerEvent(triggerMsg);

    expect(middlewareFn).toHaveBeenCalledWith({ topic, message: expectedTriggerMessage });
    expect(handler).toHaveBeenCalledWith({ topic, message: expectedTriggerMessage });
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

  test('Should throw if missing topic when subscribing to a topic', async () => {
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
  });

  test('Should throw if missing handler when subscribing to a topic', async () => {
    const consumerCfgs = {
      connection: 'kafka:123',
      groupId: 'one',
      baseLibCfg: 'test',
      topicCfgs: {
        topicCfg: 'test-topic-cfg'
      }
    };

    const consumer = await createConsumer(consumerCfgs);
    const noHandlerCfgs = {
      topic: 'test'
    };

    expect(() => consumer.subscribe(noHandlerCfgs)).toThrow();
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
    const topic = ['TEST'];

    consumer.subscribe(topic, handler);
    expect(kafka.subscribe).toHaveBeenCalledTimes(1);
  });

  test('Should accept an array for topic cfg', async () => {
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
    const multipleTopics = ['TEST_EVENT', 'ANOTHER_ONE'];

    consumer.subscribe(multipleTopics, handler);
    const multipleTopicArgs = kafka.subscribe.mock.calls[0][0];

    expect(multipleTopicArgs).toEqual(multipleTopics);
  });

  test('Should accept a single topic into one for topic cfg', async () => {
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
    const oneTopicArg = kafka.subscribe.mock.calls[0][0];

    expect(oneTopicArg).toEqual([topic]);
  });

  test('Should throw if create handler throws', async () => {
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
    const handlers = 'THROW';

    expect(() => consumer.subscribe(topic, handlers)).toThrow();
  });

  test('Should throw if there is no handler for the topic', async () => {
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
    const handlerCfgs = {
      topic: 'SOME_OTHER_EVENT',
      handler() {}
    };

    consumer.subscribe(topic, [handlerCfgs]);

    const message = 'trigger message';
    const triggerMsg = {
      topic,
      value: Buffer.from(message),
      partition: 1
    };

    expect(() => kafka.KafkaConsumer.mock.instances[0].triggerEvent(topic, triggerMsg)).toThrow();
  });

  test('Should throw if handler throws', async () => {
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
    const handler = () => {
      throw new Error('ERR');
    };

    consumer.subscribe(topic, handler);

    const message = 'trigger message';
    const triggerMsg = {
      topic,
      value: Buffer.from(message),
      partition: 1
    };

    expect(() => kafka.KafkaConsumer.mock.instances[0].triggerEvent(topic, triggerMsg)).toThrow();
  });
});

describe('.disconnect()', () => {
  test('Should call disconnect from base library', async () => {
    const consumerCfgs = {
      connection: 'kafka:123',
      groupId: 'one',
      baseLibCfg: 'test',
      topicCfgs: {
        topicCfg: 'test-topic-cfg'
      }
    };
    const consumer = await createConsumer(consumerCfgs);

    await consumer.disconnect();
    expect(kafka.consumerDisconnect).toHaveBeenCalledTimes(1);
  });
});

describe('.unsubscribe()', () => {
  test('Should call unsubscribe from base library', async () => {
    const consumerCfgs = {
      connection: 'kafka:123',
      groupId: 'one',
      baseLibCfg: 'test',
      topicCfgs: {
        topicCfg: 'test-topic-cfg'
      }
    };
    const consumer = await createConsumer(consumerCfgs);

    consumer.unsubscribe();
    expect(kafka.unsubscribe).toHaveBeenCalledTimes(1);
  });
});

describe('.addListener', () => {
  test('Should add a listener to base library', async () => {
    const consumerCfgs = {
      connection: 'kafka:123',
      groupId: 'one',
      baseLibCfg: 'test',
      topicCfgs: {
        topicCfg: 'test-topic-cfg'
      }
    };
    const consumer = await createConsumer(consumerCfgs);

    const kafkaInstance = kafka.KafkaConsumer.mock.instances[0];
    kafkaInstance.on = jest.fn();
    consumer.addListener('hello', 'hi', { test: 'test' });
    expect(kafkaInstance.on).toHaveBeenCalledWith('hello', 'hi', { test: 'test' });
  });
});
