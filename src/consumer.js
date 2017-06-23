import initiateConsumerFromPlugin from './lib/initiateConsumerFromPlugin';

function checkCfgs(cfgs) {
  const errMsg = configuration =>
    `"${configuration}" configuration is required`;
  const { event, handler } = cfgs;

  if (!event) {
    throw new Error(errMsg('event'));
  }

  if (!handler) {
    throw new Error(errMsg('handler'));
  }
}

export default async function consumer(cfgs = {}) {
  const initializedConsumer = await initiateConsumerFromPlugin(cfgs);
  const { validators } = cfgs;

  if (!validators) {
    throw new Error('"validators" configuration is required');
  }

  const pluginSubscribeToEvent = initializedConsumer.subscribeToEvent;

  initializedConsumer.subscribeToEvent = (
    { event, handler, consumeCfgs = {} } = {}
  ) => {
    checkCfgs({ event, handler });

    const validator = validators[event];

    if (!validator) {
      throw new Error(`Event "${event}" is not defined as a consumable event`);
    }

    const { validateAndCreateMessage } = validator;
    const wrappedHandler = (data) => {
      const message = initializedConsumer.eventMessageParser(data);
      const verifiedMsg = validateAndCreateMessage({ message });

      handler({ message: verifiedMsg, data });
    };

    pluginSubscribeToEvent({
      event,
      handler: wrappedHandler,
      consumeCfgs
    });
  };

  return initializedConsumer;
}
