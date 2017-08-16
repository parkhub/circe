/* @flow */

import cloneDeep from 'lodash.clonedeep';
import createValidatorsMap, { type ValidatorMap, type Validator } from './createValidatorsMap';
import createKeyGeneratorsMap, {
  type KeyGeneratorCfg,
  type KeyGeneratorMap
} from './createKeyGeneratorsMap';

export type MiddlewareCfgs = {|
  preValidators?: Validator[],
  postValidators?: Validator[],
  keyGenerators?: KeyGeneratorCfg[]
|};

export type ApplyMiddleware = (publishCfgs: PublishCfgs) => PublishCfgs;

/**
 * Creates a function that applies all the middleware for each message on a topic.
 * @param {MiddlewareCfgs} middleware Middleware configurations
 * @private
*/
export default function createMiddlewareFlow({
  preValidators = [],
  postValidators = [],
  keyGenerators = []
}: MiddlewareCfgs): ApplyMiddleware {
  const postValidatorsMap: ValidatorMap = createValidatorsMap(postValidators);
  const preValidatorsMap: ValidatorMap = createValidatorsMap(preValidators);
  const keyGeneratorsMap: KeyGeneratorMap = createKeyGeneratorsMap(keyGenerators);

  return (publishCfgs: PublishCfgs): PublishCfgs => {
    const { topic, message, key } = publishCfgs;

    const keyGen = keyGeneratorsMap.get(topic);
    const postValidator = postValidatorsMap.get(topic);
    const preValidator = preValidatorsMap.get(topic);

    if (preValidator) {
      preValidator(message);
    }

    let tmpMessage;
    let tmpKey;

    if (keyGen) {
      const generatedKey = keyGen(publishCfgs);

      tmpKey = generatedKey.key;
      tmpMessage = generatedKey.modifyMessage(cloneDeep(message));
    }

    const finalMessage = tmpMessage || message;
    const finalKey = tmpKey || key;

    if (postValidator) {
      postValidator(finalMessage);
    }

    const middlewareResult = {
      message: finalMessage,
      key: finalKey
    };

    return { ...publishCfgs, ...middlewareResult };
  };
}
