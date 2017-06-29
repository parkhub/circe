/**
 * Initiate the consumer from the plugin itself and pass it any configurations
 *
 * @function initiateConsumerFromPlugin
 * @private
 *
 * @param {Object} cfgs configuration for producer
 * @param {Object} cfgs.plugin Plugin factory method to create a new plugin
 * @returns {Promise<Object, Error>} A promise that fulfills with an instance of a producer from
 * plugin's consumer
 */
export default function initiateConsumerFromPlugin(cfgs) {
  const { plugin } = cfgs;

  return plugin().consumer(cfgs);
}
