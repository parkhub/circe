/**
 * Circe overrides a consumers subscribeToEvent method and a producers publishEvent method from it's
 * plugin to provide custom validation mechanics. Each overriden method requires "validators" to
 * use by matching the Kafka topic it's publishing/consuming to the object's key and calling a
 * validateAndCreateMessage for it.
 *
 * @module @parkhub/circe
 * @author Daniel Olivares
 */
import producer from './producer';
import consumer from './consumer';

/**
 * @typedef {Object} CirceInstance
 * @property {Function} createProducer Producer factory to create producers from eventCfgs
 * @property {Function} createConsumer Consumer factory to create consumers from eventCfgs
*/

/* TODOS
 * TODO UPDATE DOCS
 * TODO Define what a producerCfG looks like
 * TODO Define Plugin interface
 * TODO Error handling for arguments can be cleaner
 * TODO Improve DOCS by adding examples etc
*/

/**
 * Check Configurations
 *
 * @function checkCfgs
 * @private
 */
function checkCfgs(cfgs) {
  const { plugin, connection } = cfgs;

  if (!connection) {
    throw new Error('"connection" configuration is required');
  }

  if (!plugin) {
    throw new Error('"plugin" configuration is required');
  }
}

/**
 *  Circe factory function
 *
 * @function circe
 * @param {Object} cfgs configurations for factory
 * @param {Object} cfgs.plugin Plugin definition that matches the Plugin interface
 * @param {Object} cfgs.connection Configurations for creating and publishing an Event
 * @returns {CirceInstance} circe methods
 */
export default function circe(cfgs) {
  checkCfgs(cfgs);

  const { plugin, connection } = cfgs;

  const eventStoreProto = {
    createProducer(producerCfgs = {}) {
      return producer({ plugin, connection, ...producerCfgs });
    },
    createConsumer(consumerCfgs = {}) {
      return consumer({ plugin, connection, ...consumerCfgs });
    }
  };

  return eventStoreProto;
}
