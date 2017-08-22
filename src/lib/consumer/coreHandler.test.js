import coreHandler from './coreHandler';
import parseMessage from './parseMessage';

jest.mock('./parseMessage');

test('Should parse message data, wrap handler with the middleware function, then call handler', () => {
  const value = 'test value';
  const middlewareReturn = {
    middleware: 'prop'
  };
  const handler = jest.fn();
  const applyMiddleware = jest.fn(() => middlewareReturn);
  const messageData = {
    value,
    metaProp: 'metaprop'
  };

  coreHandler(handler, applyMiddleware, messageData);

  expect(parseMessage).toHaveBeenCalledWith(value);
  expect(applyMiddleware).toHaveBeenCalledWith({ message: value, metaProp: 'metaprop' });
  expect(handler).toHaveBeenCalledWith({ metaProp: 'metaprop', ...middlewareReturn });
});
