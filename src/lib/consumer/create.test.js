import kafka from 'node-rdkafka';
import create from './create';
import createHandler from './createHandler';
import middleware from '../middleware';

jest.mock('node-rdkafka');
jest.mock('./createHandler');
jest.mock('../middleware');

beforeEach(() => {
  jest.clearAllMocks();
});

test('Should throw if connection is not passed', async () => {
  const err = new Error('connection is required');
  await expect(create({ groupId: '12' })).rejects.toEqual(err);
});

test('Should throw if groupId is not passed', async () => {
  const err = new Error('groupId is required');
  await expect(create({ connection: 'test' })).rejects.toEqual(err);
});

test('Should create a new consumer', async () => {
  const consumer = await create({ connection: 'fake123', groupId: 'one' });

  expect(consumer.subscribe).toBeDefined();
  expect(typeof consumer.subscribe).toBe('function');
  expect(middleware).toHaveBeenCalledTimes(1);
});

describe('.subscribe', () => {
  test('Should throw if no configs are passed to subscribe', async () => {
    const consumerCfgs = {
      connection: 'kafka:123',
      groupId: 'one',
      baseLibCfg: 'test',
      topicCfgs: {
        topicCfg: 'test-topic-cfg'
      }
    };
    const consumer = await create(consumerCfgs);

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

    const consumer = await create(consumerCfgs);
    const noTopicCfgs = {
      handler
    };

    expect(() => consumer.subscribe(noTopicCfgs)).toThrow();

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

    const consumer = await create(consumerCfgs);
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
    expect(middleware).toHaveBeenCalledTimes(1);
    expect(createHandler).toHaveBeenCalledTimes(1);
  });

  // test('Should multiple events', async () => {
  //   const consumerCfgs = {
  //     connection: 'kafka:123',
  //     groupId: 'one',
  //     baseLibCfg: 'test',
  //     topicCfgs: {
  //       topicCfg: 'test-topic-cfg'
  //     }
  //   };
  //   const consumer = await create(consumerCfgs);
  //
  //   const topics = ['TEST_EVENT', 'TEST_EVENT_TWO'];
  //   const handler = jest.fn();
  //   const handlerTwo = jest.fn();
  //   const handlers = [
  //     {
  //       topic: 'TEST_EVENT',
  //       handler
  //     },
  //     {
  //       topic: 'TEST_EVENT_TWO',
  //       handler: handlerTwo
  //     }
  //   ];
  //
  //   consumer.subscribe(topics, handlers);
  //   expect(kafka.subscribe).toHaveBeenCalledWith
  //
  // const message = 'trigger message';
  // const topicOne = 'TEST_EVENT';
  // const topicTwo = 'TEST_EVENT_TWO';
  // const triggerMsg = {
  //   topic: topicOne,
  //   value: Buffer.from(message),
  //   partition: 1
  // };
  //
  // const messageTwo = 'trigger two message';
  // const triggerMsgTwo = {
  //   topic: topicTwo,
  //   value: Buffer.from(messageTwo),
  //   partition: 2
  // };
  //
  // kafka.KafkaConsumer.mock.instances[0].triggerEvent('TEST_EVENT', triggerMsg);
  // kafka.KafkaConsumer.mock.instances[0].triggerEvent('TEST_EVENT_TWO', triggerMsgTwo);
  //
  // expect(handler).toHaveBeenCalledWith({ message, partition: 1, topic: topicOne });
  // expect(handlerTwo).toHaveBeenCalledWith({ message: messageTwo, partition: 2, topic: topicTwo });
  // });

  // test('Should accept a handler function or an array of event handler types', async () => {
  //   const consumerCfgs = {
  //     connection: 'kafka:123',
  //     groupId: 'one',
  //     baseLibCfg: 'test',
  //     topicCfgs: {
  //       topicCfg: 'test-topic-cfg'
  //     }
  //   };
  //   const consumer = await create(consumerCfgs);
  //
  //   const topic = 'TEST_EVENT';
  //   const handler = jest.fn();
  //   const handlers = [
  //     {
  //       topic,
  //       handler
  //     }
  //   ];
  //
  //   consumer.subscribe(topic, handlers);
  //
  //   const message = 'trigger message';
  //   const triggerMsg = {
  //     topic,
  //     value: Buffer.from(message),
  //     partition: 1
  //   };
  //
  //   kafka.KafkaConsumer.mock.instances[0].triggerEvent(topic, triggerMsg);
  //
  //   expect(handler).toHaveBeenCalledWith({ message, partition: 1, topic });
  // });

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

    const consumer = await create(consumerCfgs);

    consumer.subscribe(topic, handler);
    const oneTopicArg = kafka.subscribe.mock.calls[0][0];

    expect(oneTopicArg).toEqual([topic]);

    const multipleTopics = ['TEST_EVENT', 'ANOTHER_ONE'];

    consumer.subscribe(multipleTopics, handler);
    const multipleTopicArgs = kafka.subscribe.mock.calls[1][0];

    expect(multipleTopicArgs).toEqual(multipleTopics);
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
    const consumer = await create(consumerCfgs);

    const topic = 'TEST_EVENT';
    const handlers = 'THROW';

    expect(() => consumer.subscribe(topic, handlers)).toThrow();

    // const message = 'trigger message';
    // const triggerMsg = {
    //   topic,
    //   value: Buffer.from(message),
    //   partition: 1
    // };
    //
    // expect(() => kafka.KafkaConsumer.mock.instances[0].triggerEvent(topic, triggerMsg)).toThrow();
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
    const consumer = await create(consumerCfgs);

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

  // test('Should give a JS object if message is JSON', async () => {
  //   const consumerCfgs = {
  //     connection: 'kafka:123',
  //     groupId: 'one',
  //     baseLibCfg: 'test',
  //     topicCfgs: {
  //       topicCfg: 'test-topic-cfg'
  //     }
  //   };
  //   const consumer = await create(consumerCfgs);
  //
  //   const topic = 'TEST_EVENT';
  //   const handler = jest.fn();
  //   const handlers = [
  //     {
  //       topic,
  //       handler
  //     }
  //   ];
  //
  //   consumer.subscribe(topic, handlers);
  //
  //   const message = {
  //     test: 'test message'
  //   };
  //
  //   const triggerMsg = {
  //     topic,
  //     value: Buffer.from(JSON.stringify(message)),
  //     partition: 1
  //   };
  //
  //   kafka.KafkaConsumer.mock.instances[0].triggerEvent(topic, triggerMsg);
  //
  //   expect(handler).toHaveBeenCalledWith({ message, partition: 1, topic });
  // });
});

// describe('Middleware', () => {
//   test('Should perform a pre-validation before calling handler', async () => {
//     const validate = jest.fn();
//     const consumerCfgs = {
//       connection: 'kafka:123',
//       groupId: 'one',
//       baseLibCfg: 'test',
//       topicCfgs: {
//         topicCfg: 'test-topic-cfg'
//       },
//       middleware: {
//         preValidators: [
//           {
//             topic: 'TEST_EVENT',
//             validate
//           }
//         ]
//       }
//     };
//
//     const consumer = await create(consumerCfgs);
//
//     const topic = 'TEST_EVENT';
//     const handler = jest.fn();
//     const handlers = [
//       {
//         topic,
//         handler
//       }
//     ];
//
//     consumer.subscribe(topic, handlers);
//
//     const message = {
//       test: 'test message'
//     };
//
//     const triggerMsg = {
//       topic,
//       value: Buffer.from(JSON.stringify(message)),
//       partition: 1
//     };
//
//     kafka.KafkaConsumer.mock.instances[0].triggerEvent(topic, triggerMsg);
//
//     expect(validate).toHaveBeenCalledWith(message);
//   });
// });
