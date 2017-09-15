import createConsumer from '../src/lib/createConsumer';
import createProducer from './fixtures/createProducer';

jest.unmock('node-rdkafka');
jest.unmock('@parkhub/circe-middleware');

const runningClients = [];

afterAll(async () => {
  await Promise.all(runningClients.map(client => client.disconnect()));
});

const baseConsumer = () =>
  createConsumer({
    connection: 'kafka:9092',
    groupId: 'integration-isolated-consumer-test'
  });

test('Should disconnect a consumer', async () => {
  const consumer = await baseConsumer();

  await consumer.disconnect();

  expect(() => consumer.subscribe({ topic: 'test', handler: jest.fn() })).toThrow();
});

test(
  'Should unsubscribe a consumer',
  async (done) => {
    expect.assertions(1);

    const consumer = await baseConsumer();
    const producer = await createProducer();

    runningClients.push(consumer);
    runningClients.push(producer);

    const topic = 'TEST_TOPIC_UNSUBSCRIBE';
    const anotherTopic = 'ANOTHER_TEST_TOPIC';
    const testTopicHandler = jest.fn();

    const anotherTopicHandler = jest.fn(() => {
      expect(anotherTopicHandler).toHaveBeenCalledTimes(1);
      expect(testTopicHandler).not.toHaveBeenCalled();

      done();
    });

    consumer.subscribe({ topic, handler: testTopicHandler });

    consumer.unsubscribe();
    consumer.subscribe({ topic: anotherTopic, handler: anotherTopicHandler });

    producer.produce(anotherTopic, null, Buffer.from('test'));
  },
  100000
);

test('Should fail when subscribe is called without a topic', async () => {
  const consumer = await baseConsumer();

  runningClients.push(consumer);

  const expectedErr = new Error('topic is required');
  expect(() => consumer.subscribe({ handler: jest.fn() })).toThrow(expectedErr);
});

test('Should fail when subscribe is called without a handler', async () => {
  const consumer = await baseConsumer();

  runningClients.push(consumer);

  const expectedErr = new Error('handler is required');
  expect(() => consumer.subscribe({ topic: 'test' })).toThrow(expectedErr);
});

test('Should throw if connection is not passed', async () => {
  const err = new Error('connection is required');
  await expect(createConsumer({ groupId: '12' })).rejects.toEqual(err);
});

test('Should throw if groupId is not passed', async () => {
  const err = new Error('groupId is required');
  await expect(createConsumer({ connection: 'test' })).rejects.toEqual(err);
});
