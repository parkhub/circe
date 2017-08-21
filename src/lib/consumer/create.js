/* @flow */

import kafka from 'node-rdkafka';
import pEvent from 'p-event';
import createHandler from './createHandler';
import loadMiddleware from '../middleware';

export default async function create({
  connection,
  groupId,
  middleware = {},
  topicCfgs = {},
  ...consumerCfgs
}: ConsumerCfgs): Promise<ConsumerAPI> {
  if (!connection || !groupId) {
    const missingProp = !connection ? 'connection' : 'groupId';

    throw new Error(`${missingProp} is required`);
  }

  const baseCfgs = {
    'metadata.broker.list': connection,
    'group.id': groupId
  };

  const consumer = new kafka.KafkaConsumer({ ...baseCfgs, ...consumerCfgs }, topicCfgs);

  consumer.connect();

  await pEvent(consumer, 'ready');

  const applyMiddleware = loadMiddleware(middleware);

  return {
    subscribe(topic: string, handler: TopicHandler): void {
      if (!topic || !handler) {
        const missingProp = !topic ? 'topic' : 'handler';

        throw new Error(`${missingProp} is required`);
      }

      const wrappedEvent = Array.isArray(topic) ? topic : [topic];
      const wrappedHandler = createHandler(handler, applyMiddleware);

      consumer.subscribe(wrappedEvent, wrappedHandler);
    }
  };
}
