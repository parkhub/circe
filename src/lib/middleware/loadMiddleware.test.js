import loadMiddleware from './loadMiddleware';
import keyGen from './key-generators';
import validators from './validators';

jest.mock('./key-generators');
jest.mock('./validators');

const baseGen = jest.fn(params => params);

// We create the mocks of the modules here because of a bug that doesn't let us import dirs
keyGen.mockImplementation(cfgs =>
  cfgs.reduce((map, cfg) => {
    const { topic } = cfg;

    map.set(topic, baseGen);

    return map;
  }, new Map())
);

validators.mockImplementation(cfgs =>
  cfgs.reduce((map, cfg) => {
    const { topic, validate } = cfg;

    map.set(topic, validate);

    return map;
  }, new Map())
);

beforeEach(() => {
  jest.clearAllMocks();
});

test('Should use the modified message and created key', () => {
  keyGen.mockImplementationOnce(cfgs =>
    cfgs.reduce((map, cfg) => {
      const { topic } = cfg;

      map.set(topic, () => ({
        key: 'new key',
        message: 'HELLO'
      }));

      return map;
    }, new Map())
  );

  const topic = 'TEST_TOPIC';

  const cfgs = {
    keyGenerators: [
      {
        topic,
        keyProp: 'keyProp'
      }
    ]
  };

  const applyMiddleware = loadMiddleware(cfgs);

  const testMessage = {
    test: 'test',
    keyProp: 'message key'
  };

  const result = applyMiddleware({ message: testMessage, topic });

  expect(result).toEqual({
    key: 'new key',
    message: 'HELLO'
  });
});

test('Should create a function that applies middleware', () => {
  const preValidate = jest.fn();
  const postValidate = jest.fn();
  const topic = 'TEST_TOPIC';

  const cfgs = {
    keyGenerators: [
      {
        topic,
        keyProp: 'keyProp'
      }
    ],
    preValidators: [
      {
        topic,
        validate: preValidate
      }
    ],
    postValidators: [
      {
        topic,
        validate: postValidate
      }
    ]
  };

  const applyMiddleware = loadMiddleware(cfgs);

  const keyGenCall = keyGen.mock.calls[0][0];
  expect(keyGenCall).toEqual(cfgs.keyGenerators);
  expect(validators).toHaveBeenCalledTimes(2);

  const preValCalls = validators.mock.calls[0][0];
  const postValCalls = validators.mock.calls[1][0];

  expect(preValCalls).toEqual(cfgs.preValidators);
  expect(postValCalls).toEqual(cfgs.postValidators);

  const originalKey = '1324';
  const testMessage = {
    test: 'test',
    keyProp: 'message key'
  };

  applyMiddleware({ message: testMessage, key: originalKey, topic });

  expect(baseGen).toHaveBeenCalledWith({
    key: originalKey,
    message: testMessage
  });

  expect(preValidate).toHaveBeenCalledWith(testMessage);
  expect(postValidate).toHaveBeenCalledWith(testMessage);
});

test('Should throw if any validator throws', () => {
  const preValidate = () => {
    throw new Error('ERROR');
  };

  const postValidate = jest.fn();
  const topic = 'TEST_TOPIC';

  const cfgs = {
    keyGenerators: [
      {
        topic,
        keyProp: 'keyProp'
      }
    ],
    preValidators: [
      {
        topic,
        validate: preValidate
      }
    ],
    postValidators: [
      {
        topic,
        validate: postValidate
      }
    ]
  };

  const applyMiddleware = loadMiddleware(cfgs);

  const originalKey = '1324';
  const testMessage = {
    test: 'test',
    keyProp: 'message key'
  };

  expect(() => applyMiddleware({ message: testMessage, key: originalKey, topic })).toThrow();
});

test('Should return original message if keyGen does not exist', () => {
  const preValidate = jest.fn();
  const postValidate = jest.fn();
  const topic = 'TEST_TOPIC';

  const cfgs = {
    preValidators: [
      {
        topic,
        validate: preValidate
      }
    ],
    postValidators: [
      {
        topic,
        validate: postValidate
      }
    ]
  };

  const applyMiddleware = loadMiddleware(cfgs);

  const originalKey = '1324';
  const testMessage = {
    test: 'test',
    keyProp: 'message key'
  };

  const result = applyMiddleware({ message: testMessage, key: originalKey, topic });

  expect(result).toEqual({
    key: originalKey,
    message: testMessage
  });
});

test('Should return original message if no middleware exists', () => {
  const topic = 'TEST_TOPIC';

  const cfgs = {};

  const applyMiddleware = loadMiddleware(cfgs);

  const originalKey = '1324';
  const testMessage = {
    test: 'test',
    keyProp: 'message key'
  };

  const result = applyMiddleware({ message: testMessage, key: originalKey, topic });

  expect(result).toEqual({
    key: originalKey,
    message: testMessage
  });
});

test('Should not return a key if non is to be generated or passed in', () => {
  const topic = 'TEST_TOPIC';

  const cfgs = {};

  const applyMiddleware = loadMiddleware(cfgs);

  const testMessage = {
    test: 'test',
    keyProp: 'message key'
  };

  const result = applyMiddleware({ message: testMessage, topic });

  expect(result).toEqual({
    message: testMessage
  });
});
