import uuid from 'uuid/v4';
import identity from './identity';

function isNullOrUndefined(value) {
  return value === null || typeof value === 'undefined';
}

function doesKeyPropertyExist(keyProp, message) {
  const exisingKeyValue = message[keyProp];

  return !isNullOrUndefined(exisingKeyValue);
}

function stringTypeKeyGen({ key }) {
  const newKey = key || uuid();

  return {
    key: newKey,
    modifyMessage: identity
  };
}

function cfgTypeKeyGen(kGen) {
  const { keyProp, overrideKeyProp = false } = kGen;

  return ({ key }) => {
    let newKey = key;
    let newModifyMessage = identity;

    if (isNullOrUndefined(newKey)) {
      newKey = uuid();
    }

    if (keyProp) {
      newModifyMessage = (message) => {
        // Check to make sure that key does not already exist
        if (doesKeyPropertyExist(keyProp, message) && !overrideKeyProp) {
          return message;
        }

        const keyObj = {
          [keyProp]: newKey
        };

        return { ...message, ...keyObj };
      };
    }

    return {
      key: newKey,
      modifyMessage: newModifyMessage
    };
  };
}

export default function createKeyGeneratorsMap(keyGenerators) {
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
