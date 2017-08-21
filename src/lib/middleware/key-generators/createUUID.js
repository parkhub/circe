/* @flow */

import uuid from 'uuid/v4';

export default function createUUID(): string {
  return uuid();
}
