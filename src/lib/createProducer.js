/* @flow */

import kafka from 'node-rdkafka';
import pEvent from 'p-event';
import formatKafkaMessage from './formatKafkaMessage';
import createMiddlewareFlow, {
  type MiddlewareCfgs,
  type ApplyMiddleware
} from './createMiddlewareFlow';

export type ProducerCfgs = {
  connection: string,
  middleware?: MiddlewareCfgs,
  [rdkafkaProducerCfg: any]: any // Any other property, should we outline them?
};

export type PublishCfgs = {|
  topic: Topic,
  partition?: number,
  message: Message,
  key?: string,
  timeStamp?: number,
  opaqueToken?: string
|};

export type ProducerAPI = {|
  publishEvent: PublishCfgs => void
|};

export default async function createProducer({
  connection,
  middleware = {},
  ...producerCfgs
}: ProducerCfgs): Promise<ProducerAPI> {
  if (!connection) {
    throw new Error('"connection" configuration is required');
  }

  const applyMiddleware: ApplyMiddleware = createMiddlewareFlow(middleware);
  const defaultCfgs = {
    'metadata.broker.list': connection,
    'broker.version.fallback': '0.10.0', // If kafka node doesn't have API, use this instead
    'api.version.request': true // Request the api version of Kafka node
  };

  const producer = new kafka.Producer({ ...defaultCfgs, ...producerCfgs });

  producer.connect();

  await pEvent(producer, 'ready');

  return {
    publishEvent(publishCfgs: PublishCfgs): void {
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

      const formattedMessage: Buffer = formatKafkaMessage(newMessage);
      const ts: number = timeStamp || Date.now();

      producer.produce(topic, partition, formattedMessage, key, ts, opaqueToken);
    }
  };
}
