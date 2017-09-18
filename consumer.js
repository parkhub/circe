const kafka = require('node-rdkafka');
const delay = require('delay');

const consumer = new kafka.KafkaConsumer({
  'group.id': 'consumer',
  'metadata.broker.list': 'kafka:9092',
  'broker.version.fallback': '0.10.0', // If kafka node doesn't have API, use this instead
  'api.version.request': true, // Request the api version of Kafka node
  event_cb: true
});

consumer.on('error', error => console.log('errorz', error));
consumer.on('event.log', log => console.log('event log'));
consumer.on('error', log => console.log('error'));
consumer.on('unsubscribed', log => console.log('unsubscribed'));
consumer.connect();

function subscribeTestTopic(zconsumer) {
  zconsumer.subscribe(['TEST_TOPIC_TWO']);
  zconsumer.consume();
  // zconsumer.on('data', (data) => {
  //   console.log('DATA RECEIVED TEST', data);
  //   const dataMsg = JSON.parse(data.value.toString());
  //   console.log('parsed data', dataMsg);
  // });
}

function subscribeTestInternalTopic(zconsumer) {
  zconsumer.subscribe(['TEST_TOPIC_INTERNAL']);
  zconsumer.consume();
  zconsumer.on('data', (data) => {
    console.log('DATA RECEIVED Internal', data);
    const dataMsg = JSON.parse(data.value.toString());
    console.log('parsed data', dataMsg);
  });
}

consumer.unsubscribe();
consumer.on('ready', () => {
  console.log('consumer is ready');
  subscribeTestTopic(consumer);
  // consumer.unsubscribe();
  // consumer.removeListener('data', (data) => {
  //   console.log('DATA RECEIVED Internal', data);
  //   const dataMsg = JSON.parse(data.value.toString());
  //   console.log('parsed data', dataMsg);
  // });

  subscribeTestInternalTopic(consumer);
  const producer = new kafka.Producer({
    'metadata.broker.list': 'kafka:9092',
    'broker.version.fallback': '0.10.0', // If kafka node doesn't have API, use this instead
    'api.version.request': true // Request the api version of Kafka node
  });

  producer.connect();
  producer.on('ready', () => {
    console.log('producer is ready');
    try {
      delay(8000).then(() => {
        console.log('producing');
        producer.produce(
          'TEST_TOPIC_INTERNAL',
          null,
          Buffer.from(JSON.stringify({ test: 'test' }))
        );
        producer.produce('TEST_TOPIC_TWO', null, Buffer.from(JSON.stringify({ test: 'test' })));
      });
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
