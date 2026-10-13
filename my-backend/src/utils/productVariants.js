function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeVariants(variants = [], basePrice = 0) {
  if (!Array.isArray(variants)) return [];
  const normalized = variants.filter(Boolean).map((variant) => ({
    ...(variant._id ? { _id: variant._id } : {}),
    sku: cleanText(variant.sku).toUpperCase(),
    size: cleanText(variant.size),
    color: cleanText(variant.color),
    price: variant.price === '' || variant.price == null ? Number(basePrice) : Number(variant.price),
    stock: Number(variant.stock ?? 0),
    image: cleanText(variant.image),
    isActive: variant.isActive !== false,
  }));

  const skuSet = new Set();
  const optionSet = new Set();
  for (const variant of normalized) {
    if (!variant.sku) throw new Error('Mỗi biến thể phải có SKU');
    if (!variant.size || !variant.color) throw new Error('Mỗi biến thể phải có size và màu');
    if (!Number.isFinite(variant.price) || variant.price < 0) throw new Error(`Giá của SKU ${variant.sku} không hợp lệ`);
    if (!Number.isInteger(variant.stock) || variant.stock < 0) throw new Error(`Tồn kho của SKU ${variant.sku} không hợp lệ`);
    if (skuSet.has(variant.sku)) throw new Error(`SKU ${variant.sku} bị trùng`);
    const optionKey = `${variant.size.toLocaleLowerCase()}::${variant.color.toLocaleLowerCase()}`;
    if (optionSet.has(optionKey)) throw new Error(`Biến thể ${variant.size}/${variant.color} bị trùng`);
    skuSet.add(variant.sku);
    optionSet.add(optionKey);
  }
  return normalized;
}

function requestedOption(item = {}) {
  const first = (value) => Array.isArray(value) ? value[0] : value;
  return {
    variantId: cleanText(item.variantId),
    size: cleanText(item.size || first(item.sizes)),
    color: cleanText(item.color || first(item.colors)),
  };
}

function resolveProductSelection(product, requestedItem) {
  const selection = requestedOption(requestedItem);
  const variants = Array.isArray(product.variants) ? product.variants : [];
  if (variants.length) {
    const variant = variants.find((candidate) => selection.variantId
      ? String(candidate._id) === selection.variantId
      : cleanText(candidate.size).toLocaleLowerCase() === selection.size.toLocaleLowerCase()
        && cleanText(candidate.color).toLocaleLowerCase() === selection.color.toLocaleLowerCase());
    if (!variant || variant.isActive === false) throw new Error(`Biến thể của ${product.name} không tồn tại`);
    return {
      variantId: variant._id, sku: variant.sku, size: variant.size, color: variant.color,
      price: Number(variant.price ?? product.price), stock: Number(variant.stock),
      image: variant.image || product.image,
    };
  }

  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const colors = Array.isArray(product.colors) ? product.colors : [];
  if (sizes.length && !sizes.includes(selection.size)) throw new Error(`Size của ${product.name} không hợp lệ`);
  if (colors.length && !colors.includes(selection.color)) throw new Error(`Màu của ${product.name} không hợp lệ`);
  return {
    variantId: undefined, sku: '', size: selection.size, color: selection.color,
    price: Number(product.price), stock: Number(product.countInStock), image: product.image,
  };
}

function totalVariantStock(variants = []) {
  return variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0);
}

module.exports = { normalizeVariants, requestedOption, resolveProductSelection, totalVariantStock };
