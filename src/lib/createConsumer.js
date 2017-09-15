/* @flow */

import kafka from 'node-rdkafka';
import pEvent from 'p-event';
import circeMiddleware from '@parkhub/circe-middleware';
import parseBuffersMiddleware from './middleware/parseBuffersMiddleware';

function arrayify(value) {
  return Array.isArray(value) ? value : [value];
}

export default async function createConsumer({
  connection,
  groupId,
  topicCfgs = {},
  globalConfigs = {}
}) {
  if (!connection || !groupId) {
    const missingProp = !connection ? 'connection' : 'groupId';

    throw new Error(`${missingProp} is required`);
  }

  const baseCfgs = {
    'metadata.broker.list': connection,
    'group.id': groupId
  };

  const consumer = new kafka.KafkaConsumer({ ...baseCfgs, ...globalConfigs }, topicCfgs);

  consumer.connect();

  await pEvent(consumer, 'ready');

  const consumerMiddleware = circeMiddleware([parseBuffersMiddleware]);

  return {
    subscribe({ topic, handler, middleware = [] }): void {
      if (!topic || !handler) {
        const missingProp = !topic ? 'topic' : 'handler';

        throw new Error(`${missingProp} is required`);
      }

      consumer.subscribe(arrayify(topic));
      consumer.consume();

      middleware.forEach(ware => consumerMiddleware.use(ware));
      consumer.on('data', data => consumerMiddleware.run(data, handler));
    },
    disconnect() {
      consumer.disconnect();

      return pEvent(consumer, 'disconnected');
    },
    unsubscribe() {
      consumer.unsubscribe();
    },
    addListener(...args) {
      consumer.on(...args);
    }
  };
}
