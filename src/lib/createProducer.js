import kafka from 'node-rdkafka';
import pEvent from 'p-event';
import formatKafkaMessage from './formatKafkaMessage';
import createMiddlewareFlow from './createMiddlewareFlow';

export default async function createProducer(cfgs = {}) {
  const { connection, middleware = {}, ...producerCfgs } = cfgs;

  if (!connection) {
    throw new Error('"connection" configuration is required');
  }

  const applyMiddleware = createMiddlewareFlow(middleware);
  const defaultCfgs = {
    'metadata.broker.list': connection,
    'broker.version.fallback': '0.10.0', // If kafka node doesn't have API, use this instead
    'api.version.request': true // Request the api version of Kafka node
  };

  const producer = new kafka.Producer({ ...defaultCfgs, ...producerCfgs });

  producer.connect();

  await pEvent(producer, 'ready');

  return {
    publishEvent(publishCfgs = {}) {
      const { topic, message } = publishCfgs;

      if (!topic) {
        throw new Error('"topic" is required');
      }

      if (!message) {
        throw new Error('"message" is required');
      }

      const { partition, message: newMessage, key, timeStamp, opaqueToken } = applyMiddleware(
        publishCfgs
      );

      const formattedMessage = formatKafkaMessage(newMessage);
      const ts = timeStamp || Date.now();

      producer.produce(topic, partition, formattedMessage, key, ts, opaqueToken);
    }
  };
}