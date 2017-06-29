/* eslint-disable no-underscore-dangle */

import producerFactory from '../src/producer';
import testPlugin from './fixtures/testPlugin';
import basePluginCfgs from './fixtures/basePluginCfgs';

beforeAll(() => {
  jest.clearAllMocks();
});

describe('producer() API', () => {
  test('Should reject if no configurations are set', async () => {
    await expect(producerFactory()).rejects.toBeDefined();
  });

  test('Should reject if validators is not set', async () => {
    const plugin = testPlugin();

    const producerFactoryCfgs = basePluginCfgs({
      plugin,
      validators: undefined
    });
    const expErr = new Error('"validators" configuration is required');

    await expect(producerFactory(producerFactoryCfgs)).rejects.toEqual(expErr);
  });

  test('Should create a producer', async () => {
    const plugin = testPlugin();

    const producerFactoryCfgs = basePluginCfgs({ plugin });
    const producerClient = await producerFactory(producerFactoryCfgs);

    const mockProducerFn = testPlugin.__mockProducerFn__;
    expect(mockProducerFn).toBeCalledWith(producerFactoryCfgs);

    expect(producerClient.publishEvent).toBeDefined();
    expect(typeof producerClient.publishEvent).toBe('function');

    expect(producerClient.disconnect).toBeDefined();
    expect(typeof producerClient.disconnect).toBe('function');

    expect(producerClient.addListener).toBeDefined();
    expect(typeof producerClient.addListener).toBe('function');

    expect(producerClient.nativeConsumer).toBeDefined();
    expect(typeof producerClient.nativeConsumer).toBe('function');
  });
});

describe('producer().publishEvent', () => {
  test('Should throw when no valid configuration is set', async () => {
    const plugin = testPlugin();

    const producerFactoryCfgs = basePluginCfgs({ plugin });
    const producerClient = await producerFactory(producerFactoryCfgs);

    expect(() => producerClient.publishEvent()).toThrow();
  });

  test('Should throw if event configuration is not set', async () => {
    const plugin = testPlugin();

    const producerFactoryCfgs = basePluginCfgs({ plugin });
    const producerClient = await producerFactory(producerFactoryCfgs);

    const expectedErr = new Error('"event" configuration is required');
    expect(() => producerClient.publishEvent({ message: {} })).toThrow(expectedErr);
  });

  test('Should throw if message configuration is not set', async () => {
    const plugin = testPlugin();

    const producerFactoryCfgs = basePluginCfgs({ plugin });
    const producerClient = await producerFactory(producerFactoryCfgs);

    const expectedErr = new Error('"message" configuration is required');
    expect(() => producerClient.publishEvent({ event: 'TestEvent' })).toThrow(expectedErr);
  });

  test('Should throw if event being configured is not defined', async () => {
    const plugin = testPlugin();

    const producerFactoryCfgs = basePluginCfgs({ plugin });
    const producerClient = await producerFactory(producerFactoryCfgs);

    const expectedErr = new Error('Event "NotDefined" is not defined as a publishable event');

    expect(() => producerClient.publishEvent({ event: 'NotDefined', message: {} })).toThrow(
      expectedErr
    );
  });

  test('Should publish a valid event', async () => {
    const plugin = testPlugin();

    const producerFactoryCfgs = basePluginCfgs({ plugin });
    const producerClient = await producerFactory(producerFactoryCfgs);

    const message = {
      test: 'test'
    };

    const pluginCfgs = {
      test: 'test'
    };

    const publishEventCfgs = {
      event: 'TestEvent',
      message,
      pluginCfgs
    };

    producerClient.publishEvent(publishEventCfgs);

    const expectedCallToBasePluginFn = Object.assign({}, publishEventCfgs, {
      message: {
        change: 'change',
        test: 'test'
      }
    });

    expect(testPlugin.__mockProducer__.publishEvent).toHaveBeenCalledWith(
      expectedCallToBasePluginFn
    );
  });

  test('Should throw if checkMessage() throws', async () => {
    const err = new Error('Test from createMessage');
    const plugin = testPlugin();
    const validators = {
      TestEvent: {
        validateAndCreateMessage() {
          throw err;
        }
      }
    };

    const producerFactoryCfgs = basePluginCfgs({ plugin, validators });
    const producerClient = await producerFactory(producerFactoryCfgs);

    const message = {
      test: 'test'
    };

    const pluginCfgs = {
      test: 'test'
    };

    const publishEventCfgs = {
      event: 'TestEvent',
      message,
      pluginCfgs
    };

    expect(() => producerClient.publishEvent(publishEventCfgs)).toThrow(err);
  });

  test('Should throw if call to base plugin publishEvent throws throws', async () => {
    const err = new Error('Test from publishEvent');
    testPlugin.__mockProducer__.publishEvent = () => {
      throw err;
    };

    const plugin = testPlugin();

    const producerFactoryCfgs = basePluginCfgs({ plugin });
    const producerClient = await producerFactory(producerFactoryCfgs);

    const message = {
      test: 'test'
    };

    const pluginCfgs = {
      test: 'test'
    };

    const publishEventCfgs = {
      event: 'TestEvent',
      message,
      pluginCfgs
    };

    expect(() => producerClient.publishEvent(publishEventCfgs)).toThrow(err);
  });
});
