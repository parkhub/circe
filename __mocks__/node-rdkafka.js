/* eslint-disable import/no-extraneous-dependencies */

import event from 'events';
import util from 'util';
import delay from 'delay';

const produce = jest.fn();
const producerDisconnect = jest.fn();
const producerConnect = jest.fn(function connect() {
  delay(200).then(() => this.emit('ready'));
});

function Producer() {}

Producer.prototype.disconnect = producerDisconnect;
Producer.prototype.connect = producerConnect;

Producer.prototype.produce = produce;

util.inherits(Producer, event.EventEmitter);

const consume = jest.fn();
const consumerDisconnect = jest.fn();
const subscribe = jest.fn(function subscribe(eventsToSubscribeto, handler) {
  const events = this.events || {};

  eventsToSubscribeto.forEach((e) => {
    events[e] = handler;
  });

  this.events = events;
});

const unsubscribe = jest.fn();
const consumerConnect = jest.fn(function connect() {
  delay(200).then(() => this.emit('ready'));
});

const KafkaConsumer = jest.fn();

KafkaConsumer.prototype.disconnect = consumerDisconnect;
KafkaConsumer.prototype.connect = consumerConnect;

KafkaConsumer.prototype.consume = consume;
KafkaConsumer.prototype.subscribe = subscribe;
KafkaConsumer.prototype.unsubscribe = unsubscribe;
KafkaConsumer.prototype.triggerEvent = jest.fn(function triggerEvent(
  eventToTrigger,
  argsForHandler
) {
  const eventHandler = this.events[eventToTrigger];

  eventHandler(argsForHandler);
});

util.inherits(KafkaConsumer, event.EventEmitter);

const nodeRdkafka = {
  produce,
  unsubscribe,
  subscribe,
  Producer,
  KafkaConsumer,
  consumerConnect,
  producerConnect,
  // KafkaConsumer,
  consume
};

export default nodeRdkafka;
