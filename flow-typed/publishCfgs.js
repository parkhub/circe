/* @flow */
/* eslint-disable no-unused-vars */

// This should really be an exact type but flow is not treating spread too well
type PublishCfgs = {
  topic: Topic,
  partition?: number,
  message: Message,
  key?: string,
  timeStamp?: number,
  opaqueToken?: string
};
