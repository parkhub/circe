/**
 * Initiate the producer from the plugin itself and pass it any configurations
 *
 * @function initiateProducerFromPlugin
 * @private
 *
 * @param {Object} cfgs configuration for producer
 * @param {Object} cfgs.plugin Plugin factory method to create a new plugin
 * @returns {Promise<Object, Error>} A promise that fulfills with an instance of a producer from
 * plugin's producer
 */
export default function initiateProducerFromPlugin(cfgs) {
  const { plugin } = cfgs;

  return plugin().producer(cfgs);
}
