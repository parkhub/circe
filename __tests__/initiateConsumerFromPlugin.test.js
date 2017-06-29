import initiateConsumerFromPlugin from '../src/lib/initiateConsumerFromPlugin';

test('Should throw if no cfgs are passed', () => {
  expect(() => initiateConsumerFromPlugin()).toThrow();
});
