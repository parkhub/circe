/* @flow */

import kafka from 'node-rdkafka';
import pEvent from 'p-event';
import createHandler, { type TopicHandlerArg } from './createHandlersMap';

type ConsumerCfgs = {|
  connection: string,
  groupId: string,
  topicCfgs: Object,
  [rdkafkaConsumerCfg: any]: any // Any other property, should we outline them?
|};

type ConsumerAPI = {|
  subscribe: (topic: string, handler: TopicHandlerArg) => void
|};

export default async function createconsumer({
  connection,
  groupId,
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

  return {
    subscribe(topic: string, handler: TopicHandlerArg): void {
      if (!topic || !handler) {
        const missingProp = !topic ? 'topic' : 'handler';

        throw new Error(`${missingProp} is required`);
      }

      const wrappedEvent = Array.isArray(topic) ? topic : [topic];
      const wrappedHandler = createHandler(handler);

      consumer.subscribe(wrappedEvent, wrappedHandler);
    }
  };
}
