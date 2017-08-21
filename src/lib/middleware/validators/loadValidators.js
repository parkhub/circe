/* @flow */

/* TODOS
 * TODO Enhance the validators so that they can return a status which tells circe wether or not to 
 * continue processing.
*/

/**
 * Creates a validators map keyed on topics
 *
*/
export default function loadValidators(validators: Validator[]): ValidatorsMap {
  return validators.reduce((vMap: ValidatorsMap, validator: Validator) => {
    const { topic, validate } = validator;
    vMap.set(topic, validate);

    return vMap;
  }, new Map());
}
