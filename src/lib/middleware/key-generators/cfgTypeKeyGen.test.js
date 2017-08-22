import cfgTypeKeyGen from './cfgTypeKeyGen';
import createUUID from './createUUID';

jest.mock('./createUUID');

test('Should return a function', () => {
  const keyGen = cfgTypeKeyGen({});

  expect(typeof keyGen).toBe('function');
});

test('Should use key argument instead generating a key', () => {
  const cfgs = {
    keyProp: 'testKeyProp'
  };
  const message = {
    test: 'test',
    testKeyProp: 'original key'
  };

  const key = 'another key';

  const expectedFinalMessage = {
    test: 'test',
    testKeyProp: 'another key'
  };

  const keyGenModifier = cfgTypeKeyGen(cfgs);
  const keyResult = keyGenModifier({ key, message });
  const finalMessage = keyResult.message;
  const finalKey = keyResult.key;

  expect(finalMessage).toEqual(expectedFinalMessage);
  expect(finalKey).toEqual(key);
  expect(createUUID).not.toHaveBeenCalled();
});

test('Should generate a new key and override keyProp', () => {
  const originalKeyValue = 'original key';
  const cfgs = {
    keyProp: 'testKeyProp'
  };
  const message = {
    test: 'test',
    testKeyProp: originalKeyValue
  };

  const keyGenModifier = cfgTypeKeyGen(cfgs);
  const keyResult = keyGenModifier({ message });
  const finalMessage = keyResult.message;
  const finalKey = keyResult.key;

  expect(finalMessage.testKeyProp).not.toBe(originalKeyValue);
  expect(finalKey).not.toBe(originalKeyValue);
  expect(finalKey).toBe('random string');
});

test('Should return the string message', () => {
  const cfgs = {
    keyProp: 'testKeyProp'
  };
  const message = 'this is a message';

  const keyGenModifier = cfgTypeKeyGen(cfgs);
  const keyResult = keyGenModifier({ message });
  const finalMessage = keyResult.message;
  const finalKey = keyResult.key;

  expect(finalMessage).toBe(message);
  expect(finalKey).toBe('random string');
});
