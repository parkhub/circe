/* @flow */

import cloneDeep from 'lodash.clonedeep';
import createValidatorsMap, { type ValidatorMap, type Validator } from './createValidatorsMap';
import createKeyGeneratorsMap, { type KeyGenerator } from './createKeyGeneratorsMap';

export type MiddlewareCfgs = {|
  preValidators?: Validator[],
  postValidators?: Validator[],
  keyGenerators?: KeyGenerator[]
|};

type ApplyMiddleware = (publishCfgs: PublishCfgs) => PublishCfgs;
type Exact<T> = T & $Shape<T>;

export default function createMiddlewareFlow(middleware: MiddlewareCfgs): ApplyMiddleware {
  const { preValidators = [], postValidators = [], keyGenerators = [] } = middleware;
  const postValidatorsMap: ValidatorMap = createValidatorsMap(postValidators);
  const preValidatorsMap: ValidatorMap = createValidatorsMap(preValidators);
  const keyGeneratorsMap = createKeyGeneratorsMap(keyGenerators);

  return (publishCfgs: PublishCfgs): Exact<PublishCfgs> => {
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
