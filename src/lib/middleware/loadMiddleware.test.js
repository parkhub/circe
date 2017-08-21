import loadMiddleware from './loadMiddleware';

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

  const originalKey = '1324';
  const testMessage = {
    test: 'test',
    keyProp: 'message key'
  };
  const expectedPostValidate = {
    test: 'test',
    keyProp: originalKey
  };
  const expectedMiddlewareResult = {
    key: originalKey,
    message: expectedPostValidate
  };

  const middlewareResult = applyMiddleware({ message: testMessage, key: originalKey, topic });

  expect(middlewareResult).toEqual(expectedMiddlewareResult);
  const { message, key } = middlewareResult;

  expect(message).toEqual(expectedPostValidate);
  expect(key).toEqual(originalKey);
  expect(preValidate).toHaveBeenCalledWith(testMessage);
  expect(postValidate).toHaveBeenCalledWith(expectedPostValidate);
});

test('Should process validators', () => {
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
  const expectedMiddlewareResult = {
    key: originalKey,
    message: testMessage
  };

  const middlewareResult = applyMiddleware({ message: testMessage, key: originalKey, topic });

  expect(middlewareResult).toEqual(expectedMiddlewareResult);
  const { message, key } = middlewareResult;

  expect(message).toEqual(testMessage);
  expect(key).toEqual(originalKey);
  expect(preValidate).toHaveBeenCalledWith(testMessage);
  expect(postValidate).toHaveBeenCalledWith(testMessage);
});

test('Should create a function that applies key generator middleware', () => {
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

  const originalKey = '1324';
  const testMessage = {
    test: 'test',
    keyProp: 'message key'
  };
  const expectedFinalMessage = {
    test: 'test',
    keyProp: originalKey
  };
  const expectedMiddlewareResult = {
    key: originalKey,
    message: expectedFinalMessage
  };

  const middlewareResult = applyMiddleware({ message: testMessage, key: originalKey, topic });

  expect(middlewareResult).toEqual(expectedMiddlewareResult);
  const { message, key } = middlewareResult;

  expect(message).toEqual(expectedFinalMessage);
  expect(key).toEqual(originalKey);
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
