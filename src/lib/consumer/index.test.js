import consumer from './';

test('Should export function to create consumer', () => {
  expect(typeof consumer).toBe('function');
});
