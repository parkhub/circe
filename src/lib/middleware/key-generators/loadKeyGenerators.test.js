import loadKeyGenerators from './loadKeyGenerators';

test('Should load key generators from object generator configs', () => {
  const cfgs = [
    {
      topic: 'TEST_TOPIC',
      keyProp: 'keyProp'
    }
  ];

  const genMap = loadKeyGenerators(cfgs);

  const kGenerator = genMap.get('TEST_TOPIC');

  expect(typeof kGenerator).toBe('function');
});

test('Should load key generators from string type generator configs', () => {
  const cfgs = ['TEST_TOPIC'];

  const genMap = loadKeyGenerators(cfgs);

  const kGenerator = genMap.get('TEST_TOPIC');

  expect(typeof kGenerator).toBe('function');
});
