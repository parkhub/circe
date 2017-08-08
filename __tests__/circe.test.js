import kafka from 'node-rdkafka';
import circe from '../src';

jest.mock('node-rdkafka');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('circe() API', () => {
  test('Should create a new circe instance', () => {
    expect(circe.createProducer).toBeDefined();
    expect(typeof circe.createProducer).toBe('function');

    expect(circe.createConsumer).toBeDefined();
    expect(typeof circe.createConsumer).toBe('function');
  });
});

describe('Producer', () => {
  test('Should reject if connection is not passed in', async () => {
    const expectedErrMsg = '"connection" configuration is required';

    await expect(circe.createProducer()).rejects.toEqual(new Error(expectedErrMsg));
  });

  test('Should create a new producer', async () => {
    const producer = await circe.createProducer({ connection: 'fake:123' });

    expect(producer.publishEvent).toBeDefined();
    expect(typeof producer.publishEvent).toBe('function');
  });

  test('Should publish an event', async () => {
    const testTopic = 'TestTopic';
    const testMsgString = 'test msg string';
    const testMsgObj = {
      test: 'string'
    };
    const producer = await circe.createProducer({ connection: 'fake:123' });

    producer.publishEvent({ topic: testTopic, message: testMsgString });
    producer.publishEvent({ topic: testTopic, message: testMsgObj });

    expect(kafka.produce).toHaveBeenCalledTimes(2);
    const msgStringCall = kafka.produce.mock.calls[0];
    const testMsgObjCall = kafka.produce.mock.calls[1];
    // const [topic, partition, msgBuf, key, timestamp, token] = kafka.produce.mock.calls[0];

    expect(msgStringCall[0]).toBe(testTopic);
    expect(msgStringCall[1]).toBeUndefined();
    expect(msgStringCall[2].toString()).toEqual(testMsgString);
    expect(msgStringCall[3]).toBeUndefined();
    expect(msgStringCall[4]).toBeDefined();
    expect(msgStringCall[5]).toBeUndefined();

    expect(testMsgObjCall[0]).toBe(testTopic);
    expect(testMsgObjCall[1]).toBeUndefined();
    expect(JSON.parse(testMsgObjCall[2].toString())).toEqual(testMsgObj);
    expect(testMsgObjCall[3]).toBeUndefined();
    expect(testMsgObjCall[4]).toBeDefined();
    expect(testMsgObjCall[5]).toBeUndefined();
  });

  test('Should validate message with custom validator', async () => {
    const testTopic = 'TestTopic';
    const testMsgString = 'test msg string';

    const validate = jest.fn();
    const middleware = {
      validators: {
        TestTopic: validate
      }
    };

    const producer = await circe.createProducer({ connection: 'fake:123', middleware });

    producer.publishEvent({ topic: testTopic, message: testMsgString });

    expect(validate).toHaveBeenCalledTimes(1);
    expect(validate).toHaveBeenCalledWith(testMsgString);
  });

  // test('Should auto-generate a UUID as a key and attach it to message', async () => {
  //   const testTopic = 'TestTopic';
  //   const testMsgString = 'test msg string';
  //   const testMsgObj = {
  //     test: 'string'
  //   };
  //
  //   const middleware = {
  //     keyGenerators: {
  //       TestTopic: {
  //         type: 'auto',
  //         onProp: 'topicKey'
  //       }
  //     }
  //   };
  //
  //   const producer = await circe.createProducer({ connection: 'fake:123', middleware });
  //
  //   producer.publishEvent({ topic: testTopic, message: testMsgString });
  //   producer.publishEvent({ topic: testTopic, message: testMsgObj });
  //
  //   expect(kafka.produce).toHaveBeenCalledTimes(2);
  //   const msgStringCall = kafka.produce.mock.calls[0];
  //   const testMsgObjCall = kafka.produce.mock.calls[1];
  //   // const [topic, partition, msgBuf, key, timestamp, token] = kafka.produce.mock.calls[0];
  //
  //   expect(msgStringCall[3]).toBeDefined();
  //   const modifiedMsg = JSON.parse(testMsgObjCall[2].toString());
  //
  //   expect(modifiedMsg.topicKey).toBeDefined();
  // });

  test('Should throw if topic or message are missing when publishing', async () => {
    const producer = await circe.createProducer({ connection: 'fake:123' });

    expect(() => producer.publishEvent()).toThrow();
    expect(() => producer.publishEvent({ topic: 'TestTopic' })).toThrow();
  });
});
