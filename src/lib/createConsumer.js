/* @flow */

import kafka from 'node-rdkafka';
import pEvent from 'p-event';
import isJSON from 'is-json';
import middleware from '@parkhub/circe-middleware';

function parseMessage(value: Buffer): string | Object {
  // We expect value to be a buffer
  const stringValue = value.toString();

  return isJSON(stringValue) ? JSON.parse(stringValue) : stringValue;
}

function loadHandlers(handler: Array<TopicHandlerCfg>): HandlersMap {
  return handler.reduce((map, handlerCfgs) => {
    const { topic, handler: handlerFn } = handlerCfgs;

    map.set(topic, handlerFn);

    return map;
  }, new Map());
}

function createHandler(handler, applyMiddleware) {
  const isArray = Array.isArray(handler);
  const isFunction = typeof handler === 'function';

  if (!isArray && !isFunction) {
    throw new Error('handler should be an array of handler configuration type or a function');
  }

  let fetchTopicHandler;

  if (isFunction) {
    fetchTopicHandler = () => handler;
  }

  if (isArray) {
    // $FlowFixMe can't get here unless handler is an array
    const handlersMap = loadHandlers(handler);

    fetchTopicHandler = topic => handlersMap.get(topic);
  }

  return (messageData: MessageData) => {
    const { topic } = messageData;

    // $FlowFixMe unusused argument is because the fetcher might not need it
    const topicHandler = fetchTopicHandler(topic);

    if (!topicHandler) {
      throw new Error(`No handler for topic ${topic}`);
    }

    applyMiddleware.addMiddleware(topicHandler);

    const { value, ...meta } = messageData;

    const message = parseMessage(value);

    applyMiddleware({ ...meta, message });
  };
}

export default async function createConsumer({
  connection,
  groupId,
  middlewares = [],
  topicCfgs = {},
  ...consumerCfgs
}) {
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

  const applyMiddleware = middleware(middlewares);

  return {
    subscribe(topic: string | string[], handler: TopicHandler): void {
      if (!topic || !handler) {
        const missingProp = !topic ? 'topic' : 'handler';

        throw new Error(`${missingProp} is required`);
      }

      const wrappedEvent = Array.isArray(topic) ? topic : [topic];
      const wrappedHandler = createHandler(handler, applyMiddleware);

      consumer.subscribe(wrappedEvent);
      consumer.consume();

      consumer.on('data', wrappedHandler);
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
