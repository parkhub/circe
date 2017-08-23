import circe from '../src';

jest.unmock('node-rdkafka');

test('Should produce and consume a simple setup', async () => {
  expect.assertions(1);

  const topic = 'SIMPLE_TEST_TOPIC';
  const connection = 'circe-kafka:9092';
  const groupId = 'integration-consumer-test';
  const testMessage = {
    test: 'message'
  };

  const consumer = await circe.createConsumer({
    connection,
    groupId
  });

  const producer = await circe.createProducer({
    connection
  });

  const handler = (data) => {
    console.log('data', data);
    expect(data).toEqual({
      topic,
      message: testMessage
    });
  };

  consumer.subscribe(topic, handler);

  try {
    producer.publishEvent({
      topic,
      message: testMessage
    });
  } catch (e) {
    console.log(e);
  }
});
