import initiateProducerFromPlugin from '../src/lib/initiateProducerFromPlugin';

test('Should throw if no cfgs are passed', () => {
  expect(() => initiateProducerFromPlugin()).toThrow();
});
