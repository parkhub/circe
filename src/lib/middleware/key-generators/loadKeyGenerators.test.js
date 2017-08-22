import loadKeyGenerators from './loadKeyGenerators';
import cfgTypeKeyGen from './cfgTypeKeyGen';
import stringTypeKeyGen from './stringTypeKeyGen';

jest.mock('./cfgTypeKeyGen');
jest.mock('./stringTypeKeyGen');

test('Should load key generators from object generator configs', () => {
  const cfgType = {
    topic: 'TEST_TOPIC',
    keyProp: 'keyProp'
  };
  const cfgs = [cfgType];

  const genMap = loadKeyGenerators(cfgs);

  expect(stringTypeKeyGen).toHaveBeenCalled();
  expect(cfgTypeKeyGen).toHaveBeenCalledWith(cfgType);
  const kGenerator = genMap.get('TEST_TOPIC');

  expect(kGenerator).toEqual(cfgTypeKeyGen.baseGen);
});

test('Should load key generators from string type generator configs', () => {
  const cfgs = ['TEST_TOPIC'];

  const genMap = loadKeyGenerators(cfgs);

  expect(stringTypeKeyGen).toHaveBeenCalled();
  const kGenerator = genMap.get('TEST_TOPIC');

  expect(kGenerator).toEqual(stringTypeKeyGen.baseGen);
});

test('Should handle a mix of string type and cfg type', () => {
  const cfgType = {
    topic: 'TEST_TOPIC',
    keyProp: 'keyProp'
  };
  const cfgs = [cfgType, 'STRING_TYPE_TOPIC'];

  const genMap = loadKeyGenerators(cfgs);

  expect(stringTypeKeyGen).toHaveBeenCalled();
  expect(cfgTypeKeyGen).toHaveBeenCalledWith(cfgType);
  const kGenerator = genMap.get('TEST_TOPIC');

  expect(kGenerator).toEqual(cfgTypeKeyGen.baseGen);

  expect(stringTypeKeyGen).toHaveBeenCalled();
  const stringKGenerator = genMap.get('STRING_TYPE_TOPIC');

  expect(stringKGenerator).toEqual(stringTypeKeyGen.baseGen);
});
