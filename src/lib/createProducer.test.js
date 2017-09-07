import kafka from 'node-rdkafka';
import createProducer from './createProducer';
// import middleware from '@parkhub/circe-middleware';

jest.mock('node-rdkafka');
// jest.mock('@parkhub/circe-middleware');

// const applyMidware = jest.fn(data => data);
// middleware.mockImplementation(() => applyMidware);

beforeEach(() => {
  jest.clearAllMocks();
});

test('Should reject if no configs are passed in', async () => {
  await expect(createProducer()).rejects.toBeDefined();
});

test('Should reject if connection is not passed in', async () => {
  const expectedErrMsg = 'connection is required';

  await expect(createProducer({})).rejects.toEqual(new Error(expectedErrMsg));
});

test('Should create a new producer', async () => {
  const producer = await createProducer({ connection: 'fake:123' });

  expect(producer.publishEvent).toBeDefined();
  expect(typeof producer.publishEvent).toBe('function');
});

test('Should publish an event', async () => {
  const testTopic = 'TestTopic';
  const testMsgString = 'test msg string';
  const testKey = 'test-key';
  const testMsgObj = {
    test: 'string'
  };
  const producer = await createProducer({ connection: 'fake:123' });

  producer.publishEvent({ topic: testTopic, message: testMsgString, key: testKey });
  producer.publishEvent({ topic: testTopic, message: testMsgObj });

  expect(kafka.produce).toHaveBeenCalledTimes(2);
  const msgStringCall = kafka.produce.mock.calls[0];
  const testMsgObjCall = kafka.produce.mock.calls[1];
  // const [topic, partition, msgBuf, key, timestamp, token] = kafka.produce.mock.calls[0];

  expect(msgStringCall[0]).toBe(testTopic);
  expect(msgStringCall[1]).toBeUndefined();
  expect(msgStringCall[2].toString()).toEqual(testMsgString);
  expect(msgStringCall[3]).toBe(testKey);
  expect(msgStringCall[4]).toBeDefined();
  expect(msgStringCall[5]).toBeUndefined();

  expect(testMsgObjCall[0]).toBe(testTopic);
  expect(testMsgObjCall[1]).toBeUndefined();
  expect(JSON.parse(testMsgObjCall[2].toString())).toEqual(testMsgObj);
  expect(testMsgObjCall[3]).toBeUndefined();
  expect(testMsgObjCall[4]).toBeDefined();
  expect(testMsgObjCall[5]).toBeUndefined();
});

// test('Should create middleware function', async () => {
//   const testTopic = 'TestTopic';
//   const testMsgString = 'TESTFORMATRETURN';
//   const testKey = 'test-key';
//   const middlewareCfgs = {
//     test: 'test'
//   };
//
//   const producer = await createProducer({
//     connection: 'fake:123',
//     middleware: middlewareCfgs
//   });
//
//   producer.publishEvent({ topic: testTopic, message: testMsgString, key: testKey });
//
//   expect(middleware).toHaveBeenCalledWith(middlewareCfgs);
//   expect(applyMidware).toHaveBeenCalledWith({
//     topic: testTopic,
//     message: testMsgString,
//     key: testKey
//   });
//   expect(formatKafkaMessage).toHaveBeenCalledWith(testMsgString);
//   const kafkaProduceCall = kafka.produce.mock.calls[0];
//   expect(kafkaProduceCall[0]).toBe(testTopic);
//   expect(kafkaProduceCall[1]).toBeUndefined();
//   expect(JSON.parse(kafkaProduceCall[2].toString())).toEqual({ test: 'TESTFORMATRETURN' });
//   expect(kafkaProduceCall[3]).toBe(testKey);
//   expect(kafkaProduceCall[4]).toBeDefined();
//   expect(kafkaProduceCall[5]).toBeUndefined();
// });

test('Should throw if topic is missing when publishing', async () => {
  const producer = await createProducer({ connection: 'fake:123' });

  expect(() => producer.publishEvent()).toThrow();
  expect(() => producer.publishEvent({ topic: 'TestTopic' })).toThrow();
});

test('Should throw if message is missing when publishing', async () => {
  const producer = await createProducer({ connection: 'fake:123' });

  expect(() => producer.publishEvent()).toThrow();
  expect(() => producer.publishEvent({ message: 'TestTopic' })).toThrow();
});

describe('.disconnect()', () => {
  test('Should call disconnect from base library', async () => {
    const producerCfgs = {
      connection: 'kafka:123',
      groupId: 'one',
      baseLibCfg: 'test',
      topicCfgs: {
        topicCfg: 'test-topic-cfg'
      }
    };
    const producer = await createProducer(producerCfgs);

    await producer.disconnect();
    expect(kafka.producerDisconnect).toHaveBeenCalledTimes(1);
  });
});

describe('.addListener', () => {
  test('Should add a listener to base library', async () => {
    const producerCfgs = {
      connection: 'kafka:123',
      groupId: 'one',
      baseLibCfg: 'test',
      topicCfgs: {
        topicCfg: 'test-topic-cfg'
      }
    };
    const producer = await createProducer(producerCfgs);

    const kafkaInstance = kafka.Producer.mock.instances[0];
    kafkaInstance.on = jest.fn();
    producer.addListener('hello', 'hi', { test: 'test' });
    expect(kafkaInstance.on).toHaveBeenCalledWith('hello', 'hi', { test: 'test' });
  });
});
