import { getCartItemId, mergeCarts, normalizeCartItem } from './cart';

test('uses variant identity so product variants stay separate', () => {
  expect(getCartItemId({ product: 'p1', variantId: 'v1' })).toBe('p1:v1');
  expect(getCartItemId({ product: 'p1', variantId: 'v2' })).toBe('p1:v2');
});

test('migrates legacy size and color fields', () => {
  expect(normalizeCartItem({ product: 'p1', sizes: 'M', colors: 'Đen' })).toMatchObject({
    size: 'M', color: 'Đen', cartItemId: 'p1:M:Đen',
  });
});

test('merges guest and account carts without exceeding stock', () => {
  const merged = mergeCarts(
    [{ product: 'p1', variantId: 'v1', amount: 3, countInStock: 5 }],
    [{ product: 'p1', variantId: 'v1', amount: 4, countInStock: 5 }]
  );
  expect(merged).toHaveLength(1);
  expect(merged[0].amount).toBe(5);
});
