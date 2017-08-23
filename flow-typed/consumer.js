/* @flow */
/* eslint-disable no-unused-vars */

type ConsumerCfgs = {|
  connection: string,
  groupId: string,
  topicCfgs: Object,
  middleware?: Middleware,
  [rdkafkaConsumerCfg: any]: any // Any other property, should we outline them?
|};

type MessageData = {|
  value: Buffer,
  size: number,
  topic: string,
  offset: number,
  partition: 1,
  key?: string
|};

type Handler = Message => void;

type TopicHandlerCfg = {|
  topic: string,
  handler: Handler
|};

type HandlersMap = Map<Topic, Handler>;

type HandlerWrapper = Object => void;

type TopicHandler = Array<TopicHandlerCfg> | Handler;

type ConsumerAPI = {|
  subscribe: (topic: string, handler: TopicHandler) => void,
  disconnect: () => Promise<void>
|};
