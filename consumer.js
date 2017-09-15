const kafka = require('node-rdkafka');

const consumer = new kafka.KafkaConsumer({
  'group.id': 'consumer',
  'metadata.broker.list': 'kafka:9092',
  'broker.version.fallback': '0.10.0', // If kafka node doesn't have API, use this instead
  'api.version.request': true, // Request the api version of Kafka node
  event_cb: true
});

consumer.on('error', error => console.log('errorz', error));
consumer.on('event.log', log => console.log(log));
consumer.connect();

consumer.on('ready', () => {
  console.log('consumer is ready');
  consumer.subscribe(['TEST_TOPIC_INTERNAL']);
  consumer.subscribe(['TEST_TOPIC_TWO']);

  consumer.consume();
  consumer.on('data', (data) => {
    console.log('DATA RECEIVED', data);
    const dataMsg = JSON.parse(data.value.toString());
    console.log('parsed data', dataMsg);
  });
  const producer = new kafka.Producer({
    'metadata.broker.list': 'kafka:9092',
    'broker.version.fallback': '0.10.0', // If kafka node doesn't have API, use this instead
    'api.version.request': true // Request the api version of Kafka node
  });

  producer.connect();
  producer.on('ready', () => {
    console.log('producer is ready');
    try {
      producer.produce('TEST_TOPIC_INTERNAL', null, Buffer.from(JSON.stringify({ test: 'test' })));
      // producer.produce('TEST_TOPIC_TWO', null, Buffer.from(JSON.stringify({ test: 'test' })));
    } catch (e) {
      console.error(e);
    }
  });
  // consumer.seek(
  //   {
  //     topic: 'TEST_TOPIC',
  //     partition: 0,
  //     offset: 0
  //   },
  //   1000,
  //   (err) => {
  //     console.log('seek', err);
  //     console.log('consumer is subscribed');
  //   }
  // );
});
