import loadValidators from './loadValidators';

test('Should load validators from configs', () => {
  const validate = jest.fn();
  const cfgs = [
    {
      topic: 'TEST_TOPIC',
      validate
    }
  ];

  const validatorsMap = loadValidators(cfgs);
  const validator = validatorsMap.get('TEST_TOPIC');
  validator();

  expect(validate).toHaveBeenCalled();
});
