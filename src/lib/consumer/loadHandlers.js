/* @flow */

export default function loadHandlers(handler: Array<TopicHandlerCfg>): HandlersMap {
  return handler.reduce((map, handlerCfgs) => {
    const { topic, handler: handlerFn } = handlerCfgs;

    map.set(topic, handlerFn);

    return map;
  }, new Map());
}
