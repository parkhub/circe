const kafka = require('node-rdkafka');
const SegfaultHandler = require('segfault-handler');
//
//
SegfaultHandler.registerHandler('crash.log'); // With no argument, SegfaultHandler will generate a generic log file name

const consumer = new kafka.KafkaConsumer({
  'group.id': 'consumer',
  'metadata.broker.list': 'localhost:9092',
  event_cb: true
});

consumer.on('error', error => console.log('errorz', error));
consumer.on('event.log', log => console.log(log));
consumer.connect();

consumer.on('ready', () => {
  console.log('consumer is ready');
  consumer.subscribe(['TEST_TOPIC']);

  consumer.seek(
    {
      topic: 'TEST_TOPIC',
      partition: 0,
      offset: 0
    },
    1000,
    (err) => {
      console.log('seek', err);
      console.log('consumer is subscribed');
      consumer.consume();
      consumer.on('data', (data) => {
        console.log('DATA RECEIVED', data);
        const dataMsg = JSON.parse(data.value.toString());
        console.log('parsed data', dataMsg);
      });
    }
  );
});
