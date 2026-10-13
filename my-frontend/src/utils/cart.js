export const getCartItemId = (item = {}) => {
  if (item.cartItemId) return item.cartItemId;
  const product = String(item.product || '');
  const variant = String(item.variantId || '');
  const size = String(item.size || item.sizes || '');
  const color = String(item.color || item.colors || '');
  return variant ? `${product}:${variant}` : `${product}:${size}:${color}`;
};

export const normalizeCartItem = (item) => ({
  ...item,
  size: item.size || item.sizes || '',
  color: item.color || item.colors || '',
  cartItemId: getCartItemId(item),
});

export const mergeCarts = (first = [], second = []) => {
  const items = new Map();
  [...first, ...second].map(normalizeCartItem).forEach((item) => {
    const current = items.get(item.cartItemId);
    if (!current) return items.set(item.cartItemId, item);
    const stock = Number(item.countInStock ?? current.countInStock ?? Infinity);
    items.set(item.cartItemId, {
      ...current,
      ...item,
      amount: Math.min(Number(current.amount || 0) + Number(item.amount || 0), stock),
    });
  });
  return [...items.values()].filter((item) => item.amount > 0);
};
