const basePluginCfgs = (overrides) => {
  const connection = 'localhost:1234';
  const testEvent = 'TestEvent';
  const groupId = 123;

  const validators = {
    [testEvent]: {
      validateAndCreateMessage({ message }) {
        return Object.assign({}, message, { change: 'change' });
      }
    }
  };

  const pluginCfgs = {
    test: 'test'
  };

  return Object.assign(
    {},
    {
      validators,
      groupId,
      connection,
      pluginCfgs
    },
    overrides
  );
};

export default basePluginCfgs;
