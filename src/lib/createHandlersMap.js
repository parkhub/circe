/* @flow */

import isJSON from 'is-json';

type TopicHandler = Message => void;

type TopicHandlerCfg = {|
  topic: string,
  handler: TopicHandler
|};

type HandlersMap = Map<Topic, TopicHandler>;

type HandlerWrapper = Object => void;

export type TopicHandlerArg = Array<TopicHandlerCfg> | TopicHandler;

function createHandlersMap(handler: Array<TopicHandlerCfg>): HandlersMap {
  return handler.reduce((map, handlerCfgs) => {
    const { topic, handler: handlerFn } = handlerCfgs;

    map.set(topic, handlerFn);

    return map;
  }, new Map());
}

function convertMessageValue(value: Buffer): string | Object {
  // We expect value to be a buffer
  const stringValue = value.toString();

  return isJSON(stringValue) ? JSON.parse(stringValue) : stringValue;
}

export default function createHandler(handler: TopicHandlerArg): HandlerWrapper {
  if (typeof handler === 'function') {
    return handler;
  }

  const handlersMap = createHandlersMap(handler);

  return (messageMeta) => {
    const { value, topic, ...meta } = messageMeta;

    const topicHandler = handlersMap.get(topic);

    if (!topicHandler) {
      throw new Error(`No handler for topic ${topic}`);
    }

    const message = convertMessageValue(value);

    topicHandler({ message, ...meta });
  };
}
