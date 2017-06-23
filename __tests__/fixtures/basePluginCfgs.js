const basePluginCfgs = (overrides) => {
  const connection = 'localhost:1234';
  const testEvent = 'TestEvent';
  const groupId = 123;
  const topicCfgs = {
    test: 'test'
  };

  const validators = {
    [testEvent]: {
      validateAndCreateMessage({ message }) {
        return Object.assign({}, message, { change: 'change' });
      }
    }
  };

  const consumerCfgs = {
    test: 'test'
  };

  const producerCfgs = {
    test: 'test'
  };

  return Object.assign(
    {},
    {
      validators,
      groupId,
      connection,
      consumerCfgs,
      producerCfgs,
      topicCfgs
    },
    overrides
  );
};

export default basePluginCfgs;
