/* @flow */

import createUUID from './createUUID';

type ModifyMessageParams = {
  message: Message,
  keyProp?: string,
  key?: string
};

function modifyMessage({ keyProp, key, message }: ModifyMessageParams): Message {
  if (keyProp && typeof message === 'object') {
    const keyObj = {
      [keyProp]: key
    };

    return { ...message, ...keyObj };
  }

  return message;
}

export default function cfgTypeKeyGen(cfgs: KeyGenCfgType): KeyGenerator {
  return ({ key, message }) => {
    const generatedKey: string = key || createUUID();

    return {
      key: generatedKey,
      message: modifyMessage({ key: generatedKey, message, ...cfgs })
    };
  };
}
