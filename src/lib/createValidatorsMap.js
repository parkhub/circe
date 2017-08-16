/* @flow */

/* TODOS
 * TODO Enhance the validators so that they can return a status which tells circe wether or not to 
 * continue processing.
*/

type Validate = (message: Message) => void;

export type ValidatorMap = Map<Topic, Validate>;

export type Validator = {|
  topic: Topic,
  validate: Validate
|};

/**
 * Creates a validators map keyed on topics
 *
*/
export default function createValidatorsMap(validators: Validator[]): ValidatorMap {
  return validators.reduce((vMap: ValidatorMap, validator: Validator) => {
    const { topic, validate } = validator;
    vMap.set(topic, validate);

    return vMap;
  }, new Map());
}
