export default function createValidatorsMap(validators) {
  return validators.reduce((vMap, validator) => {
    const { topic, validate } = validator;
    vMap.set(topic, validate);

    return vMap;
  }, new Map());
}
