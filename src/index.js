/**
 * Circe overrides a consumers subscribeToEvent method and a producers publishEvent method from it's
 * plugin to provide custom validation mechanics. Each overriden method requires "validators" to
 * use by matching the Kafka topic it's publishing/consuming to the object's key and calling a
 * validateAndCreateMessage for it.
 *
 * @module @parkhub/circe
 * @author Daniel Olivares
 */

import createProducer from './lib/createProducer';

/* TODOS
 * TODO UPDATE DOCS
 * TODO Define what a producerCfG looks like
 * TODO Define Plugin interface
 * TODO Error handling for arguments can be cleaner
 * TODO Improve DOCS by adding examples etc
*/

const circe = {
  createProducer,
  createConsumer() {}
};

export default circe;
