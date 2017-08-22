import stringTypeKeyGen from './stringTypeKeyGen';
import createUUID from './createUUID';

jest.mock('./createUUID');

test('Should return the same key passed in without affecting message', () => {
  const originalKey = '1234';
  const message = {
    test: 'testMessage'
  };

  const keyModifier = stringTypeKeyGen();
  const result = keyModifier({ key: originalKey, message });

  const finalMessage = result.message;
  const finalKey = result.key;

  expect(finalMessage).toEqual(message);
  expect(finalKey).toEqual(originalKey);
  expect(createUUID).not.toHaveBeenCalled();
});

test('Should generate a key without affecting message', () => {
  const message = {
    test: 'testMessage'
  };

  const keyModifier = stringTypeKeyGen();
  const result = keyModifier({ message });

  const finalMessage = result.message;
  const finalKey = result.key;

  expect(createUUID).toHaveBeenCalled();
  expect(finalMessage).toEqual(message);
  expect(finalKey).toBe('random string');
});
