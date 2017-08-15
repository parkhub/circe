/* @flow */

export default function formatKafkaMessage(message: Message): Buffer {
  if (message !== null && typeof message === 'object') {
    return Buffer.from(JSON.stringify(message));
  }

  return Buffer.from(message);
}
