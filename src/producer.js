import initiateProducerFromPlugin from './lib/initiateProducerFromPlugin';

function checkPublishCfgs(cfgs) {
  const errMsg = configuration =>
    `"${configuration}" configuration is required`;
  const { message, event } = cfgs;

  if (!message) {
    throw new Error(errMsg('message'));
  }

  if (!event) {
    throw new Error(errMsg('event'));
  }
}

export default async function producer(cfgs = {}) {
  const initializedProducer = await initiateProducerFromPlugin(cfgs);
  const { validators } = cfgs;

  if (!validators) {
    throw new Error('"validators" configuration is required');
  }

  const pluginPublishEvent = initializedProducer.publishEvent;

  initializedProducer.publishEvent = (
    { message, event, publishCfgs = {} } = {}
  ) => {
    checkPublishCfgs({ message, event });

    const validator = validators[event];

    if (!validator) {
      throw new Error(`Event "${event}" is not defined as a publishable event`);
    }

    const { validateAndCreateMessage } = validator;
    const verifiedMsg = validateAndCreateMessage({ message });

    pluginPublishEvent({
      event,
      message: verifiedMsg,
      publishCfgs
    });
  };

  return initializedProducer;
}
