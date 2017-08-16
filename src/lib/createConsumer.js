/* @flow */

import kafka from 'node-rdkafka';
import pEvent from 'p-event';

type ConsumerCfgs = {|
  connection: string,
  groupId: string,
  [rdkafkaConsumerCfg: any]: any // Any other property, should we outline them?
|};

type SubscribeCfgs = {|
  event: string | string[],
  handler: Message => void
|};

type ConsumerAPI = {|
  subscribeToEvent: SubscribeCfgs => void
|};

export default async function createconsumer({
  connection,
  groupId,
  topicCfgs = {},
  ...consumerCfgs
}: ConsumerCfgs): Promise<ConsumerAPI> {
  if (!connection) {
    throw new Error('"connection" configuration is required');
  }

  if (!groupId) {
    throw new Error('"groupId" configuration is required');
  }

  const baseCfgs = {
    'metadata.broker.list': connection,
    'group.id': groupId
  };

  const consumer = new kafka.KafkaConsumer({ ...baseCfgs, ...consumerCfgs }, topicCfgs);

  consumer.connect();

  await pEvent(consumer, 'ready');

  return {
    subscribeToEvent({ event, handler }: SubscribeCfgs): void {
      if (!event || !handler) {
        throw new Error('Missing configuration when subscring to an event');
      }

      const wrappedEvent = Array.isArray(event) ? event : [event];
      consumer.subscribe(wrappedEvent, handler);
    }
  };
}
