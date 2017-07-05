import initiateConsumerFromPlugin from './lib/initiateConsumerFromPlugin';

function checkCfgs(cfgs) {
  const errMsg = configuration => `"${configuration}" configuration is required`;
  const { event, handler } = cfgs;

  if (!event) {
    throw new Error(errMsg('event'));
  }

  if (!handler) {
    throw new Error(errMsg('handler'));
  }
}

/**
 * Consumer factory that overrides the plugins subscribeToEvent method and injects the validator
 * logic.
 *
 * @function consumer
 * @param {Object} cfgs configuration for consumer
 * @param {Object} cfgs.plugin Plugin which provides actual logic for Kafka whose method will
 * be overriden
 * @param {Object} cfgs.validators A key-value map of events being consumed whose value is an
 * object with a validateAndCreateMessage method
 * @param {Object} [cfgs.pluginCfgs] Configurations that are specific to the plugin
 * @returns {Promise<Object, Error>} A promise that fulfills with an instance of a producer from
 * plugin
 */
export default async function consumer(cfgs) {
  const initializedConsumer = await initiateConsumerFromPlugin(cfgs);
  const { validators } = cfgs;

  if (!validators) {
    throw new Error('"validators" configuration is required');
  }

  // Override the subscribeToEvent with out own
  const pluginSubscribeToEvent = initializedConsumer.subscribeToEvent;

  initializedConsumer.subscribeToEvent = ({ event, handler, pluginCfgs = {} } = {}) => {
    checkCfgs({ event, handler });

    const validator = validators[event];

    if (!validator) {
      throw new Error(`Event "${event}" is not defined as a consumable event`);
    }

    const { validateAndCreateMessage } = validator;

    // Wrap the handler for this consumer for the topic to execute the extraction outside of handler
    const wrappedHandler = (data) => {
      const message = initializedConsumer.eventMessageParser(data);
      const verifiedMsg = validateAndCreateMessage({ message });

      handler({ message: verifiedMsg, data });
    };

    // Call the original method from the plugin
    pluginSubscribeToEvent({
      event,
      handler: wrappedHandler,
      pluginCfgs
    });
  };

  return initializedConsumer;
}
