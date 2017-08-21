/* @flow */

import cfgTypeKeyGen from './cfgTypeKeyGen';
import stringTypeKeyGen from './stringTypeKeyGen';

type KeyGeneratorsMap = Map<Topic, KeyGenerator>;

/**
 * Create a map of key generator configurations keyed on a topic
 * @private
*/
export default function loadKeyGenerators(keyGenerators: KeyGeneratorsCfg[]): KeyGeneratorsMap {
  const stringTypeGen = stringTypeKeyGen();

  return keyGenerators.reduce((vMap, kGen) => {
    if (typeof kGen === 'string') {
      vMap.set(kGen, stringTypeGen);

      return vMap;
    }

    const { topic } = kGen;

    vMap.set(topic, cfgTypeKeyGen(kGen));

    return vMap;
  }, new Map());
}
