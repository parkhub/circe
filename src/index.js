/* @flow */

/**
 *
 * @module @parkhub/circe
 * @author Daniel Olivares
 */

import createProducer, { type ProducerAPI, type ProducerCfgs } from './lib/createProducer';

/* TODOS
 * TODO UPDATE DOCS
 * TODO Define what a producerCfG looks like
 * TODO Improve DOCS by adding examples etc
*/

type CirceAPI = {
  createProducer: ProducerCfgs => Promise<ProducerAPI>
};

const circe: CirceAPI = {
  createProducer,
  createConsumer() {}
};

export default circe;
