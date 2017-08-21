const createHandler = jest.fn((handler) => {
  if (handler === 'THROW') {
    throw new Error('ERR');
  }

  return handler;
});

export default createHandler;
