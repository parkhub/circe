import cloneDeep from 'lodash.clonedeep';
import createValidatorsMap from './createValidatorsMap';
import createKeyGeneratorsMap from './createKeyGeneratorsMap';

export default function createMiddlewareFlow(middleware) {
  const { preValidators = [], postValidators = [], keyGenerators = [] } = middleware;
  const postValidatorsMap = createValidatorsMap(postValidators);
  const preValidatorsMap = createValidatorsMap(preValidators);
  const keyGeneratorsMap = createKeyGeneratorsMap(keyGenerators);

  return (publishCfgs) => {
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
