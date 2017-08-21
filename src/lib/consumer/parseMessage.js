/* @flow */

import isJSON from 'is-json';

export default function parseMessage(value: Buffer): string | Object {
  // We expect value to be a buffer
  const stringValue = value.toString();

  return isJSON(stringValue) ? JSON.parse(stringValue) : stringValue;
}
