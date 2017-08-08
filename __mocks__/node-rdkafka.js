/* eslint-disable import/no-extraneous-dependencies */

import event from 'events';
import util from 'util';
import delay from 'delay';

const produce = jest.fn();

const disconnect = jest.fn();

function Producer() {}
const emitter = event.EventEmitter;

Producer.prototype.isNative = true;
Producer.prototype.disconnect = disconnect;
Producer.prototype.connect = function connect() {
  delay(200).then(() => this.emit('ready'));
};

Producer.prototype.produce = produce;

util.inherits(Producer, event.EventEmitter);
// const unsubscribe = jest.fn();
// const subscribe = jest.fn();
// const KafkaConsumer = jest.fn();
// const consume = jest.fn();
//
// KafkaConsumer.prototype.isNative = true;
// KafkaConsumer.prototype.consume = consume;
// KafkaConsumer.prototype.disconnect = disconnect;
// KafkaConsumer.prototype.unsubscribe = unsubscribe;
// KafkaConsumer.prototype.subscribe = subscribe;
// KafkaConsumer.prototype.connect = connect;
// KafkaConsumer.prototype.on = event.on;

const nodeRdkafka = {
  produce,
  // unsubscribe,
  // subscribe,
  disconnect,
  Producer,
  // KafkaConsumer,
  // consume,
  emitter
};

export default nodeRdkafka;
