const kafka = require('node-rdkafka');

const producer = new kafka.Producer({
  'metadata.broker.list': 'kafka:9092',
  'broker.version.fallback': '0.10.0', // If kafka node doesn't have API, use this instead
  'api.version.request': true // Request the api version of Kafka node
});

producer.connect();
producer.on('ready', () => {
  console.log('producer is ready');
  try {
    producer.produce('TEST_TOPIC', null, Buffer.from(JSON.stringify({ test: 'test' })));
  } catch (e) {
    console.error(e);
  }
});
