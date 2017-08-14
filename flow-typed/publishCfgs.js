/* @flow */
/* eslint-disable no-unused-vars */

type PublishCfgs = {|
  topic: Topic,
  partition?: number,
  message: Message,
  key?: string,
  timeStamp?: number,
  opaqueToken?: string
|};
