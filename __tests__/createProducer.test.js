import kafka from 'node-rdkafka';
import createProducer from '../src/lib/createProducer';

jest.mock('node-rdkafka');

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

describe('Middlewares', () => {
  describe('preValidators', () => {
    test('Should validate message with a preValidator', async () => {
      const testTopic = 'TestTopic';
      const testMsgString = 'test msg string';

      const validate = jest.fn();
      const middleware = {
        preValidators: [
          {
            topic: testTopic,
            validate
          }
        ]
      };

      const producer = await createProducer({ connection: 'fake:123', middleware });

      producer.publishEvent({ topic: testTopic, message: testMsgString });

      expect(validate).toHaveBeenCalledTimes(1);
      expect(validate).toHaveBeenCalledWith(testMsgString);
    });

    test('Should throw if a preValidator throws', async () => {
      const testTopic = 'TestTopic';
      const testMsgString = 'test msg string';

      const error = new Error('Test throw...');
      const validate = () => {
        throw error;
      };
      const middleware = {
        preValidators: [
          {
            topic: testTopic,
            validate
          }
        ]
      };

      const producer = await createProducer({ connection: 'fake:123', middleware });

      expect(() => producer.publishEvent({ topic: testTopic, message: testMsgString })).toThrow(
        error
      );
    });
  });

  describe('postValidators', () => {
    test('Should validate message with a postValidator', async () => {
      const testTopic = 'TestTopic';
      const testMsgString = 'test msg string';

      const validate = jest.fn();
      const middleware = {
        postValidators: [
          {
            topic: testTopic,
            validate
          }
        ]
      };

      const producer = await createProducer({ connection: 'fake:123', middleware });

      producer.publishEvent({ topic: testTopic, message: testMsgString });

      expect(validate).toHaveBeenCalledTimes(1);
      expect(validate).toHaveBeenCalledWith(testMsgString);
    });

    test('Should throw if postValidator throws', async () => {
      const testTopic = 'TestTopic';
      const testMsgString = 'test msg string';

      const error = new Error('Test throw...');
      const validate = () => {
        throw error;
      };
      const middleware = {
        postValidators: [
          {
            topic: testTopic,
            validate
          }
        ]
      };

      const producer = await createProducer({ connection: 'fake:123', middleware });

      expect(() => producer.publishEvent({ topic: testTopic, message: testMsgString })).toThrow(
        error
      );
    });
  });

  describe('keyGenerators', () => {
    test('Should auto-generate a UUID, should take an object', async () => {
      const testTopic = 'TestTopic';
      const testMsgString = 'test msg string';

      const middleware = {
        keyGenerators: [
          {
            topic: testTopic
          }
        ]
      };

      const producer = await createProducer({ connection: 'fake:123', middleware });

      producer.publishEvent({ topic: testTopic, message: testMsgString });

      expect(kafka.produce).toHaveBeenCalledTimes(1);
      const msgStringCall = kafka.produce.mock.calls[0];
      // const [topic, partition, msgBuf, key, timestamp, token] = kafka.produce.mock.calls[0];

      expect(msgStringCall[3]).toBeDefined();
    });

    test('Should auto-generate a UUID, should take a string', async () => {
      const testTopic = 'TestTopic';
      const testMsgString = 'test msg string';

      const middleware = {
        keyGenerators: ['TestTopic']
      };

      const producer = await createProducer({ connection: 'fake:123', middleware });

      producer.publishEvent({ topic: testTopic, message: testMsgString });

      expect(kafka.produce).toHaveBeenCalledTimes(1);
      const msgStringCall = kafka.produce.mock.calls[0];

      expect(msgStringCall[3]).toBeDefined();
    });

    test('Should not auto-generate a UUID as default', async () => {
      const testTopic = 'TestTopic';
      const testMsgString = 'test msg string';

      const producer = await createProducer({ connection: 'fake:123' });

      producer.publishEvent({ topic: testTopic, message: testMsgString });

      expect(kafka.produce).toHaveBeenCalledTimes(1);
      const msgStringCall = kafka.produce.mock.calls[0];

      expect(msgStringCall[3]).toBeUndefined();
    });

    test('Should use key arg instead of generated one, but not override key prop', async () => {
      const testTopic = 'TestTopic';
      const key = 'test-key-to-not-override';
      const testMsgObj = {
        test: 'string',
        keyProp: 'existing key yo'
      };

      const middleware = {
        keyGenerators: [
          {
            topic: testTopic,
            keyProp: 'keyProp'
          }
        ]
      };

      const producer = await createProducer({ connection: 'fake:123', middleware });

      producer.publishEvent({ topic: testTopic, message: testMsgObj, key });

      expect(kafka.produce).toHaveBeenCalledTimes(1);
      const testMsgObjCall = kafka.produce.mock.calls[0];
      // const [topic, partition, msgBuf, key, timestamp, token] = kafka.produce.mock.calls[0];

      const testObjKey = testMsgObjCall[3];
      expect(testObjKey).toBe(key);

      const finalMessage = JSON.parse(testMsgObjCall[2].toString());

      expect(finalMessage).toEqual(testMsgObj);
    });

    test('Should use key arg instead of generated one and override key prop', async () => {
      const testTopic = 'TestTopic';
      const key = 'test-key-to-not-override';
      const testMsgObj = {
        test: 'string',
        keyProp: 'existing key yo'
      };

      const middleware = {
        keyGenerators: [
          {
            topic: testTopic,
            keyProp: 'keyProp',
            overrideKeyProp: true
          }
        ]
      };

      const producer = await createProducer({ connection: 'fake:123', middleware });

      producer.publishEvent({ topic: testTopic, message: testMsgObj, key });

      expect(kafka.produce).toHaveBeenCalledTimes(1);
      const testMsgObjCall = kafka.produce.mock.calls[0];
      // const [topic, partition, msgBuf, key, timestamp, token] = kafka.produce.mock.calls[0];

      const testObjKey = testMsgObjCall[3];
      expect(testObjKey).toBe(key);

      const finalMessage = JSON.parse(testMsgObjCall[2].toString());

      expect(finalMessage).toEqual(
        Object.assign({}, testMsgObj, {
          keyProp: key
        })
      );
    });

    test('Should override existing property key if it exists', async () => {
      const testTopic = 'TestTopic';
      const testMsgObj = {
        test: 'string',
        keyProp: 'existing key yo'
      };

      const middleware = {
        keyGenerators: [
          {
            topic: testTopic,
            keyProp: 'keyProp',
            overrideKeyProp: true
          }
        ]
      };

      const producer = await createProducer({ connection: 'fake:123', middleware });

      producer.publishEvent({ topic: testTopic, message: testMsgObj });

      expect(kafka.produce).toHaveBeenCalledTimes(1);
      const testMsgObjCall = kafka.produce.mock.calls[0];
      // const [topic, partition, msgBuf, key, timestamp, token] = kafka.produce.mock.calls[0];

      const key = testMsgObjCall[3];
      expect(key).toBeDefined();

      const finalMessage = JSON.parse(testMsgObjCall[2].toString());
      const finalKeyProp = finalMessage.keyProp;

      expect(finalKeyProp).toBeDefined();
      expect(finalKeyProp).not.toBe(testMsgObj.keyProp);
    });

    test('Should not override existing property key if it exists', async () => {
      const testTopic = 'TestTopic';
      const testMsgObj = {
        test: 'string',
        keyProp: 'existing key yo'
      };

      const middleware = {
        keyGenerators: [
          {
            topic: testTopic,
            keyProp: 'keyProp'
          }
        ]
      };

      const producer = await createProducer({ connection: 'fake:123', middleware });

      producer.publishEvent({ topic: testTopic, message: testMsgObj });

      expect(kafka.produce).toHaveBeenCalledTimes(1);
      const testMsgObjCall = kafka.produce.mock.calls[0];
      // const [topic, partition, msgBuf, key, timestamp, token] = kafka.produce.mock.calls[0];

      const key = testMsgObjCall[3];
      expect(key).toBeDefined();

      const finalMessage = JSON.parse(testMsgObjCall[2].toString());
      expect(finalMessage).toEqual(testMsgObj);
    });

    test('Should auto-generate a UUID and attach it to object', async () => {
      const testTopic = 'TestTopic';
      const testMsgObj = {
        test: 'string'
      };

      const middleware = {
        keyGenerators: [
          {
            topic: testTopic,
            keyProp: 'keyProp'
          }
        ]
      };

      const producer = await createProducer({ connection: 'fake:123', middleware });

      producer.publishEvent({ topic: testTopic, message: testMsgObj });

      expect(kafka.produce).toHaveBeenCalledTimes(1);
      const testMsgObjCall = kafka.produce.mock.calls[0];
      // const [topic, partition, msgBuf, key, timestamp, token] = kafka.produce.mock.calls[0];

      const key = testMsgObjCall[3];
      expect(key).toBeDefined();

      const finalMessage = JSON.parse(testMsgObjCall[2].toString());

      const keyProp = finalMessage.keyProp;
      expect(finalMessage.keyProp).toBeDefined();
      expect(keyProp).toBe(key);
    });

    test('Should auto-generate a UUID but just return a non-object message', async () => {
      const testTopic = 'TestTopic';
      const testMsg = 'This is a test';

      const middleware = {
        keyGenerators: [
          {
            topic: testTopic,
            keyProp: 'keyProp'
          }
        ]
      };

      const producer = await createProducer({ connection: 'fake:123', middleware });

      producer.publishEvent({ topic: testTopic, message: testMsg });

      expect(kafka.produce).toHaveBeenCalledTimes(1);
      const testMsgCall = kafka.produce.mock.calls[0];
      // const [topic, partition, msgBuf, key, timestamp, token] = kafka.produce.mock.calls[0];

      const key = testMsgCall[3];
      expect(key).toBeDefined();

      const finalMessage = testMsgCall[2].toString();

      expect(finalMessage).toBe(testMsg);
    });
  });
});

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
