/* eslint-disable no-underscore-dangle */

import consumerFactory from '../src/consumer';
import testPlugin from './fixtures/testPlugin';
import basePluginCfgs from './fixtures/basePluginCfgs';

beforeAll(() => {
  jest.clearAllMocks();
});

describe('consumer() API', () => {
  test('Should throw if no configurations are set', async () => {
    await expect(consumerFactory()).rejects.toBeDefined();
  });

  test('Should throw if validators configuration is not', async () => {
    const plugin = testPlugin();

    const consumerFactoryCfgs = basePluginCfgs({
      plugin,
      validators: undefined
    });

    const expErr = new Error('"validators" configuration is required');

    await expect(consumerFactory(consumerFactoryCfgs)).rejects.toEqual(expErr);
  });

  test('Should create a consumer and inherit methods from plugin', async () => {
    const plugin = testPlugin();

    const consumerFactoryCfgs = basePluginCfgs({ plugin });
    const consumerClient = await consumerFactory(consumerFactoryCfgs);

    const mockConsumerFn = testPlugin.__mockConsumerFn__;

    expect(mockConsumerFn).toBeCalledWith(consumerFactoryCfgs);

    expect(consumerClient.subscribeToEvent).toBeDefined();
    expect(typeof consumerClient.subscribeToEvent).toBe('function');

    expect(consumerClient.eventMessageParser).toBeDefined();
    expect(typeof consumerClient.eventMessageParser).toBe('function');

    expect(consumerClient.unsubscribeFromEvents).toBeDefined();
    expect(typeof consumerClient.unsubscribeFromEvents).toBe('function');

    expect(consumerClient.addListener).toBeDefined();
    expect(typeof consumerClient.addListener).toBe('function');

    expect(consumerClient.disconnect).toBeDefined();
    expect(typeof consumerClient.disconnect).toBe('function');

    expect(consumerClient.nativeConsumer).toBeDefined();
    expect(typeof consumerClient.nativeConsumer).toBe('function');
  });
});

describe('consumer().subscribeToEvent', () => {
  test('Should throw when no valid configuration is set', async () => {
    const plugin = testPlugin();
    const consumerFactoryCfgs = basePluginCfgs({ plugin });
    const consumerClient = await consumerFactory(consumerFactoryCfgs);

    expect(() => consumerClient.subscribeToEvent()).toThrow();
  });

  test('Should throw if handler configuration is not set', async () => {
    const plugin = testPlugin();
    const consumerFactoryCfgs = basePluginCfgs({ plugin });
    const consumerClient = await consumerFactory(consumerFactoryCfgs);

    const expectedErr = new Error('"handler" configuration is required');
    expect(() => consumerClient.subscribeToEvent({ event: 'test' })).toThrow(
      expectedErr
    );
  });

  test('Should throw if event configuration is not set', async () => {
    const plugin = testPlugin();
    const consumerFactoryCfgs = basePluginCfgs({ plugin });
    const consumerClient = await consumerFactory(consumerFactoryCfgs);

    const expectedErr = new Error('"event" configuration is required');
    expect(() =>
      consumerClient.subscribeToEvent({ handler: () => ({}) })
    ).toThrow(expectedErr);
  });

  test('Should throw if event to subscribe to is not defined in eventCfgs', async () => {
    const plugin = testPlugin();
    const consumerFactoryCfgs = basePluginCfgs({ plugin });
    const consumerClient = await consumerFactory(consumerFactoryCfgs);

    const expectedErr = new Error(
      'Event "NotDefined" is not defined as a consumable event'
    );

    expect(() =>
      consumerClient.subscribeToEvent({
        event: 'NotDefined',
        handler: () => ({})
      })
    ).toThrow(expectedErr);
  });

  test('Should subscribe to a valid event', async () => {
    const consumerState = {};
    testPlugin.__mockConsumer__.subscribeToEvent = jest.fn((cfgs) => {
      const { event, handler } = cfgs;

      consumerState[event] = handler;
    });

    const plugin = testPlugin();
    const consumerFactoryCfgs = basePluginCfgs({ plugin });
    const consumerClient = await consumerFactory(consumerFactoryCfgs);

    const handler = () => {};
    const consumeCfgs = {
      test: 'test'
    };

    await consumerClient.subscribeToEvent({
      event: 'TestEvent',
      handler,
      consumeCfgs
    });

    expect(testPlugin.__mockConsumer__.subscribeToEvent).toBeCalledWith({
      event: 'TestEvent',
      handler: consumerState.TestEvent,
      consumeCfgs
    });
  });

  test('Should wrap handler and call it when event is received', async () => {
    const consumerState = {};
    testPlugin.__mockConsumer__.subscribeToEvent = jest.fn((cfgs) => {
      const { event, handler } = cfgs;

      consumerState[event] = handler;
    });

    const plugin = testPlugin();
    const consumerFactoryCfgs = basePluginCfgs({ plugin });
    const consumerClient = await consumerFactory(consumerFactoryCfgs);

    const handler = jest.fn();
    const consumeCfgs = {
      test: 'test'
    };

    await consumerClient.subscribeToEvent({
      event: 'TestEvent',
      handler,
      consumeCfgs
    });

    const data = {
      message: {
        test: 'test'
      },
      extraStuff: 'stuff'
    };

    consumerState.TestEvent(data);

    const expectedArgs = {
      message: {
        change: 'change',
        test: 'test'
      },
      data
    };

    expect(testPlugin.__mockConsumer__.eventMessageParser).toHaveBeenCalledWith(
      data
    );
    expect(handler).toHaveBeenCalledWith(expectedArgs);
  });
});
