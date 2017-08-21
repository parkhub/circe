/* @flow */

/**
 *
 * @module @parkhub/circe
 * @author Daniel Olivares
 */

import producer from './lib/producer';
import consumer from './lib/consumer';

/* TODOS
 * TODO UPDATE DOCS
 * TODO Define what a producerCfG looks like
 * TODO Improve DOCS by adding examples etc
*/

type CirceAPI = {|
  createProducer: ProducerCfgs => Promise<ProducerAPI>,
  createConsumer: ConsumerCfgs => Promise<ConsumerAPI>
|};

const circe: CirceAPI = {
  createProducer: producer.create,
  createConsumer: consumer.create
};

export default circe;
