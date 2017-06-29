import consumer from '../src/consumer';
import producer from '../src/producer';
import circe from '../src';

beforeEach(() => {
  jest.clearAllMocks();
});

jest.mock('../src/consumer', () =>
  jest.fn(
    cfgs =>
      new Promise((resolve, reject) => {
        if (!cfgs.validators) {
          return reject('error');
        }

        return resolve();
      })
  )
);

jest.mock('../src/producer', () =>
  jest.fn(
    cfgs =>
      new Promise((resolve, reject) => {
        if (!cfgs.validators) {
          return reject('error');
        }

        return resolve();
      })
  )
);

describe('circe() API', () => {
  test('Should reject if no configurations are passed', () => {
    expect(() => circe()).toThrow();
  });

  test('Should reject if connection is not passed in', () => {
    const expectedErrMsg = '"connection" configuration is required';

    expect(() => circe({ plugin: {} })).toThrow(new Error(expectedErrMsg));
  });

  test('Should reject if plugin is not passed in', () => {
    const expectedErrMsg = '"plugin" configuration is required';

    expect(() => circe({ connection: 'conn' })).toThrow(new Error(expectedErrMsg));
  });

  test('Should return create methods', () => {
    const cfgs = {
      plugin() {},
      connection: 'test'
    };

    const store = circe(cfgs);

    expect(store.createProducer).toBeDefined();
    expect(typeof store.createProducer).toBe('function');

    expect(store.createConsumer).toBeDefined();
    expect(typeof store.createConsumer).toBe('function');
  });
});

describe('circe().createProducer', () => {
  test('Should reject if producer from plugin rejects', async () => {
    const cfgs = {
      plugin() {},
      connection: 'test'
    };

    const store = circe(cfgs);
    expect(store.createProducer()).rejects.toBeDefined();
  });

  test('Should create a producer from plugin w/o producerCfgs', async () => {
    const cfgs = {
      plugin() {},
      connection: 'test'
    };

    const store = circe(cfgs);

    const producerCfgs = {
      validators: {}
    };

    await store.createProducer(producerCfgs);

    expect(producer).toHaveBeenCalledWith({ ...cfgs, ...producerCfgs });
  });

  test('Should create a producer from plugin', async () => {
    const cfgs = {
      plugin() {},
      connection: 'test'
    };

    const store = circe(cfgs);

    const producerCfgs = {
      validators: {},
      pluginCfgs: {
        test: 'test'
      }
    };

    await store.createProducer(producerCfgs);

    expect(producer).toHaveBeenCalledWith({ ...cfgs, ...producerCfgs });
  });
});

describe('circe().createConsumer', () => {
  test('Should reject if consumer from plugin rejects', async () => {
    const cfgs = {
      plugin() {},
      connection: 'test'
    };

    const store = circe(cfgs);
    expect(store.createConsumer()).rejects.toBeDefined();
  });

  test('Should create a consumer from plugin w/o consumerCfgs', async () => {
    const cfgs = {
      plugin() {},
      connection: 'test'
    };

    const store = circe(cfgs);

    const consumerCfgs = {
      validators: {}
    };

    await store.createConsumer(consumerCfgs);

    expect(consumer).toHaveBeenCalledWith({ ...cfgs, ...consumerCfgs });
  });

  test('Should create a consumer from plugin', async () => {
    const cfgs = {
      plugin() {},
      connection: 'test'
    };

    const store = circe(cfgs);
    const consumerCfgs = {
      validators: {},
      pluginCfgs: {
        test: 'test'
      }
    };

    await store.createConsumer(consumerCfgs);

    expect(consumer).toHaveBeenCalledWith({ ...cfgs, ...consumerCfgs });
  });
});
