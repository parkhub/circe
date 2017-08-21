/* @flow */

import createUUID from './createUUID';

export default function stringTypeKeyGen(): KeyGenerator {
  return ({ key, message }) => {
    const newKey: string = key || createUUID();

    return {
      key: newKey,
      message
    };
  };
}
