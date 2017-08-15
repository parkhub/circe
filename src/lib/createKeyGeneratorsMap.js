/* @flow */

import uuid from 'uuid/v4';
import identity from './identity';

type KeyGenStringType = string;

type ModifyMessage = Message => Message;
type GeneratedKeyModifier = {|
  key: string,
  modifyMessage: ModifyMessage
|};

type KeyGenCfgType = {|
  topic: Topic,
  keyProp?: string,
  overrideKeyProp?: boolean
|};

export type KeyGenerator = PublishCfgs => GeneratedKeyModifier;
export type KeyGeneratorCfg = KeyGenStringType | KeyGenCfgType;
export type KeyGeneratorMap = Map<Topic, KeyGenerator>;

function isNullOrUndefined<T>(value: T): boolean {
  return value === null || value === undefined;
}

function doesKeyPropertyExist(keyProp: string, object: Object): boolean {
  const exisingKeyValue = object[keyProp];

  return !isNullOrUndefined(exisingKeyValue);
}

function stringTypeKeyGen({ key }: PublishCfgs): GeneratedKeyModifier {
  const newKey: string = key || uuid();

  return {
    key: newKey,
    modifyMessage: identity
  };
}

function cfgTypeKeyGen({ keyProp = '', overrideKeyProp = false }: KeyGenCfgType) {
  return ({ key }: PublishCfgs): GeneratedKeyModifier => {
    const generatedKey: string = key || uuid();

    if (keyProp) {
      const newModifyMessage = (message: Message): Message => {
        if (typeof message !== 'object') {
          return message;
        }

        // Check to make sure that key does not already exist
        if (doesKeyPropertyExist(keyProp, message) && !overrideKeyProp) {
          return message;
        }

        const keyObj = {
          [keyProp]: generatedKey
        };

        return { ...message, ...keyObj };
      };

      return {
        key: generatedKey,
        modifyMessage: newModifyMessage
      };
    }

    return {
      key: generatedKey,
      modifyMessage: identity
    };
  };
}

export default function createKeyGeneratorsMap(keyGenerators: KeyGeneratorCfg[]): KeyGeneratorMap {
  return keyGenerators.reduce((vMap, kGen) => {
    if (typeof kGen === 'string') {
      vMap.set(kGen, stringTypeKeyGen);

      return vMap;
    }

    const { topic } = kGen;

    vMap.set(topic, cfgTypeKeyGen(kGen));

    return vMap;
  }, new Map());
}
