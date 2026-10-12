import { convertPrice, isJsonString } from './utils';

test('recognizes valid serialized access tokens', () => {
  expect(isJsonString('"token"')).toBe(true);
  expect(isJsonString('not-json')).toBe(false);
});

test('formats Vietnamese currency consistently', () => {
  expect(convertPrice(125000)).toBe('125.000 VND');
});
