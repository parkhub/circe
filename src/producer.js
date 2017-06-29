import initiateProducerFromPlugin from './lib/initiateProducerFromPlugin';

/**
 * Check Configurations
 *
 * @function checkPublishCfgs
 * @private
 */
function checkPublishCfgs(cfgs) {
  const errMsg = configuration => `"${configuration}" configuration is required`;
  const { message, event } = cfgs;

  if (!message) {
    throw new Error(errMsg('message'));
  }

  if (!event) {
    throw new Error(errMsg('event'));
  }
}

/**
 * Producer factory that overrides the plugins publishEvent method and injects the validator logic.
 *
 * @function producer
 * @param {Object} cfgs configuration for producer
 * @param {Object} cfgs.plugin Plugin which provides actual logic for Kafka whose method will
 * be overriden
 * @param {Object} cfgs.validators A key-value map of events being published whose value is an
 * object with a validateAndCreateMessage method
 * @param {Object} cfgs.pluginCfgs Configurations that are specific to the plugin
 * @returns {Promise<Object, Error>} A promise that fulfills with an instance of a producer from
 * plugin
 */
export default async function producer(cfgs = {}) {
  const initializedProducer = await initiateProducerFromPlugin(cfgs);
  const { validators } = cfgs;

  if (!validators) {
    throw new Error('"validators" configuration is required');
  }

  const pluginPublishEvent = initializedProducer.publishEvent;

  initializedProducer.publishEvent = ({ message, event, pluginCfgs = {} } = {}) => {
    checkPublishCfgs({ message, event });

    const validator = validators[event];

    if (!validator) {
      throw new Error(`Event "${event}" is not defined as a publishable event`);
    }

    const { validateAndCreateMessage } = validator;
    const verifiedMsg = validateAndCreateMessage({ message });

    // Call the original method from the plugin
    pluginPublishEvent({
      event,
      message: verifiedMsg,
      pluginCfgs
    });
  };

  return initializedProducer;
}
