/* @flow */
import loadHandlers from './loadHandlers';
import coreHandler from './coreHandler';

export default function createHandler(
  handler: TopicHandler,
  applyMiddleware: ApplyMiddleware
): HandlerWrapper {
  if (Array.isArray(handler)) {
    const handlersMap = loadHandlers(handler);

    return (messageData: MessageData) => {
      const { topic } = messageData;

      const topicHandler = handlersMap.get(topic);

      if (!topicHandler) {
        throw new Error(`No handler for topic ${topic}`);
      }

      coreHandler(topicHandler, applyMiddleware, messageData);
    };
  }

  // TODO this seems awkard, find a way to resolve type conflict but abstract the handler
  return (messageData: MessageData) => {
    if (typeof handler === 'function') {
      coreHandler(handler, applyMiddleware, messageData);
    }
  };
}
