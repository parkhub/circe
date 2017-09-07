/* @flow */

import kafka from 'node-rdkafka';
import pEvent from 'p-event';
import middleware from '@parkhub/circe-middleware';

function formatKafkaMessage(message: Message): Buffer {
  if (message !== null && typeof message === 'object') {
    return Buffer.from(JSON.stringify(message));
  }

  return Buffer.from(message);
}

export default async function createProducer({ connection, middlewares = [], ...producerCfgs }) {
  if (!connection) {
    throw new Error('connection is required');
  }

  const defaultCfgs = {
    'metadata.broker.list': connection,
    'broker.version.fallback': '0.10.0', // If kafka node doesn't have API, use this instead
    'api.version.request': true // Request the api version of Kafka node
  };

  const producer = new kafka.Producer({ ...defaultCfgs, ...producerCfgs });

  producer.connect();

  await pEvent(producer, 'ready');

  const publishToKafka = ({
    topic, message, partition, timeStamp, opaqueToken, key
  }) => {
    if (!topic || !message) {
      const missingProp = !topic ? 'topic' : 'message';

      throw new Error(`${missingProp} is required`);
    }

    const formattedMessage: Buffer = formatKafkaMessage(message);
    const ts: number = timeStamp || Date.now();

    producer.produce(topic, partition, formattedMessage, key, ts, opaqueToken);
  };

  const applyMiddlewareAndPublish = middleware([...middlewares, publishToKafka]);

  return {
    publishEvent(publishCfgs) {
      return applyMiddlewareAndPublish(publishCfgs);
    },
    disconnect() {
      producer.disconnect();

      return pEvent(producer, 'disconnected');
    },
    addListener(...args) {
      producer.on(...args);
    }
  };
}
