import initiateProducerFromPlugin from '../src/lib/initiateProducerFromPlugin';

test('Should throw if no cfgs are passed', async () => {
  await expect(initiateProducerFromPlugin()).rejects.toBeDefined();
});

