/* @flow */

/**
 * Kafka keys are different than keys on a JS object or any data object. These keys can be attached
 * to an message(if its an object) if you pass it in, or if you want one generated for you.
 * 
 * We use uuid/v4 to generated unique IDs.
 *
 * Configurations for key generator middleware. By default, keys WILL NOT be generated for 
 * produced messages. If a key is passed in but no key gen is configured, it will STILL be used 
 * as the key to produce on the Kafka topic.
 *
 * @typedef {Object} keyGenCfg key generator configurations
 * @property {string} topic topic that will use this generator
 * @property {string} [keyProp] optional, if message is an object, the key will be added to the 
 *  message on this key as well.
 * @property {boolean} [overrideKeyProp] (optional, default `false`) if a message already contains
 *  the property in the keyProp, this will override it with the newly generated key. However, the
 *  GENERATED KEY will still be used to key off the kafka message.
 */

/**
 * A validator configuration.
 *
 * @typedef {Object} validator validator configurations
 * @property {string} topic topic that will use this validation
 * @property {Function} validate the validate function which can THROW if validation does not happen
 *  this means that if a validation fails, you have to throw.
 */

/**
 * An object whose keys represent middleware configurations available:
 *  - preValidators
 *  - postValidators
 *  - keyGenerators
 *
 * @typedef {Object} Middleware middleware configurations
 * @property {Validator[]} [preValidators] validators {@link Validator} that willl be executed on a 
 *  message before any other middleware 
 * @property {Validator[]} [postValidators] validators {@link Validator} that will be executed 
 *  AFTER every other middleware
 * @property {keyGenCfg[]} [keyGenerators] key generators {@link KeyGenCfg} that get applied to 
 *  each topic defined. If none are defined, then a key will NOT be generated
 */

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

/**
 * Creates a new producer with the passed in configurations.
 *
 * @param {Object} producerCfgs configurations for producer
 * @param {string} producerCfgs.connection configurations for producer
 * @param {Middleware} [producerCfgs.middleware] middleware {@link Middleware} configuration
 * @returns {Promise<ProducerAPI}
*/
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
