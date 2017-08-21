/* @flow */

import parseMessage from './parseMessage';

export default function coreHandler(
  handler: Handler,
  applyMiddleware: ApplyMiddleware,
  messageData: MessageData
) {
  const { value, ...meta } = messageData;

  const message = parseMessage(value);
  const middlewareResult = applyMiddleware({ message, ...meta });

  handler({ ...meta, ...middlewareResult });
}
