/* @flow */
import loadHandlers from './loadHandlers';
import coreHandler from './coreHandler';

export default function createHandler(
  handler: TopicHandler,
  applyMiddleware: ApplyMiddleware
): HandlerWrapper {
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

    // $FlowFixMe the flow error says that topicHandler might be an array(due to default),
    coreHandler(topicHandler, applyMiddleware, messageData);
  };
}
