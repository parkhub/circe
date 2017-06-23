/**
 * Event store that publishes events to Parkhub's instance using plugins defined by the plugin
 * interface.
 *
 * @module @parkhub/canonical-event-store
 * @author Daniel Olivares
 */
import producer from './producer';
import consumer from './consumer';

/**
 * @typedef {Object} EventStore
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
 * eventStore factory function
 *
 * @function eventStore
 * @param {Object} cfgs Configuratoins for factory
 * @param {Object} cfgs.plugin Plugin definition that matches the Plugin interface
 * @param {Object} cfgs.eventCfgs Configurations for creating and publishing an Event
 * @param {Object} cfgs.connection A URL to connect to event store running in our services.
 * @returns {Promise} eventStore instance
 */
export default async function eventStore(cfgs = {}) {
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

  return Object.create(eventStoreProto);
}
