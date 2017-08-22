const loadHandlers = jest.fn((cfgs) => {
  const { topic, handler } = cfgs[0];
  const handlersMap = new Map();

  handlersMap.set(topic, handler);

  return handlersMap;
});

export default loadHandlers;
