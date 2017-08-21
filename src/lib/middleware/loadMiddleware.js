/* @flow */

import cloneDeep from 'lodash.clonedeep';
import keyGener from './key-generators';
import validators from './validators';

/**
 * Creates a function that applies all the middleware for each message on a topic.
 * @private
*/
export default function loadMiddleware({
  preValidators = [],
  postValidators = [],
  keyGenerators = []
}: Middleware): ApplyMiddleware {
  const keyGeneratorsMap = keyGener.load(keyGenerators);
  const preValidatorsMap = validators.load(preValidators);
  const postValidatorsMap = validators.load(postValidators);

  return ({ topic, message, key }) => {
    const keyGen = keyGeneratorsMap.get(topic);
    const postValidator = postValidatorsMap.get(topic);
    const preValidator = preValidatorsMap.get(topic);

    if (preValidator) {
      preValidator(message);
    }

    let tmpMessage;
    let tmpKey;

    if (keyGen) {
      const generatorResult = keyGen({ key, message: cloneDeep(message) });

      tmpKey = generatorResult.key;
      tmpMessage = generatorResult.message;
    }

    const finalMessage = tmpMessage || message;
    const finalKey = tmpKey || key;

    if (postValidator) {
      postValidator(finalMessage);
    }

    const finalKeyObj = finalKey ? { key: finalKey } : {};

    return {
      message: finalMessage,
      ...finalKeyObj
    };
  };
}
