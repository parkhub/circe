/* @flow */

import kafka from 'node-rdkafka';
import pEvent from 'p-event';
import loadMiddleware from '../middleware';
import formatKafkaMessage from './formatKafkaMessage';

/**
 * Creates a new producer with the passed in configurations.
 *
 * @param {Object} producerCfgs configurations for producer
 * @param {string} producerCfgs.connection configurations for producer
 * @param {Middleware} [producerCfgs.middleware] middleware {@link Middleware} configuration
 * @returns {Promise<ProducerAPI}
*/
export default async function create({
  connection,
  middleware = {},
  ...producerCfgs
}: ProducerCfgs): Promise<ProducerAPI> {
  if (!connection) {
    throw new Error('connection is required');
  }

  const applyMiddleware: ApplyMiddleware = loadMiddleware(middleware);
  const defaultCfgs = {
    'metadata.broker.list': connection,
    'broker.version.fallback': '0.10.0', // If kafka node doesn't have API, use this instead
    'api.version.request': true // Request the api version of Kafka node
  };

  const producer = new kafka.Producer({ ...defaultCfgs, ...producerCfgs });

  producer.connect();

  await pEvent(producer, 'ready');

  return {
    publishEvent({ topic, message, partition, timeStamp, opaqueToken, key }: PublishCfgs): void {
      // const { topic, message, partition, timeStamp, opaqueToken, key } = publishCfgs;

      if (!topic || !message) {
        const missingProp = !topic ? 'topic' : 'message';

        throw new Error(`${missingProp} is required`);
      }

      const { message: newMessage, key: newKey } = applyMiddleware({ topic, message, key });

      const formattedMessage: Buffer = formatKafkaMessage(newMessage);
      const ts: number = timeStamp || Date.now();

      producer.produce(topic, partition, formattedMessage, newKey, ts, opaqueToken);
    }
  };
}
