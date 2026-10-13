const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeVariants, resolveProductSelection, totalVariantStock } = require('../src/utils/productVariants');

test('normalizes variants and calculates total stock', () => {
  const variants = normalizeVariants([
    { sku: ' shirt-red-m ', size: 'M', color: 'Red', price: '', stock: 2 },
    { sku: 'SHIRT-RED-L', size: 'L', color: 'Red', price: 120000, stock: 3 },
  ], 100000);
  assert.equal(variants[0].sku, 'SHIRT-RED-M');
  assert.equal(variants[0].price, 100000);
  assert.equal(totalVariantStock(variants), 5);
});

test('rejects duplicate SKU', () => {
  assert.throws(() => normalizeVariants([
    { sku: 'ONE', size: 'M', color: 'Red', stock: 1 },
    { sku: 'one', size: 'L', color: 'Blue', stock: 1 },
  ], 10), /SKU ONE/);
});

test('resolves server canonical variant values', () => {
  const product = {
    name: 'Áo', price: 999, image: 'base.jpg',
    variants: [{ _id: 'variant-1', sku: 'AO-M-DEN', size: 'M', color: 'Đen', price: 200, stock: 4, image: 'm.jpg' }],
  };
  const result = resolveProductSelection(product, { variantId: 'variant-1', price: 1, countInStock: 999 });
  assert.deepEqual(result, {
    variantId: 'variant-1', sku: 'AO-M-DEN', size: 'M', color: 'Đen', price: 200, stock: 4, image: 'm.jpg',
  });
});
