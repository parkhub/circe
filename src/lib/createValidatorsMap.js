/* TODOS
 * TODO Enhance the validators so that they can return a status which tells circe wether or not to 
 * continue processing.
*/
export default function createValidatorsMap(validators) {
  return validators.reduce((vMap, validator) => {
    const { topic, validate } = validator;
    vMap.set(topic, validate);

    return vMap;
  }, new Map());
}
