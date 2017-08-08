import kafka from 'node-rdkafka';
import pEvent from 'p-event';
// import uuid from 'uuid/v4';

function formatKafkaMessage(message) {
  let newMessage = message;

  if (message !== null && typeof message === 'object') {
    newMessage = JSON.stringify(message);
  }

  return Buffer.from(newMessage);
}

function identity(data) {
  return data;
}

export default async function createProducer(cfgs = {}) {
  const { connection, middleware = {}, ...producerCfgs } = cfgs;

  if (!connection) {
    throw new Error('"connection" configuration is required');
  }

  const validators = middleware.validators || {};
  // const keyGenerators = middleware.keyGenerators || {};
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
      const { topic, partition, message, key, timeStamp, opaqueToken } = publishCfgs;

      if (!topic) {
        throw new Error('"topic" is required');
      }

      if (!message) {
        throw new Error('"message" is required');
      }

      const finalMessage = message;
      const finalKey = key;

      // const keyGen = keyGenerators[topic];
      // if (keyGen && keyGen.type === 'auto') {
      //   if (message !== null && typeof message === 'object') {
      //     const { onProp } = keyGen;
      //     const messageKeyProp = message[onProp];
      //
      //     if (!messageKeyProp) {
      //       finalMessage = Object.assign({}, message, {
      //         [onProp]: uuid()
      //       });
      //     }
      //   } else if (typeof message === 'string') {
      //     finalKey = uuid();
      //   }
      // }

      const validator = validators[topic] || identity;

      validator(finalMessage);

      const formattedMessage = formatKafkaMessage(finalMessage);
      const ts = timeStamp || Date.now();

      producer.produce(topic, partition, formattedMessage, finalKey, ts, opaqueToken);
    }
  };
}
