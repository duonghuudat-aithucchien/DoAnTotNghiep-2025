const Product = require('../models/ProductModel');

async function restoreItems(items, session, { adjustSold = true } = {}) {
  for (const item of items) {
    const increment = {
      countInStock: Number(item.amount || item.quantity),
      ...(adjustSold ? { selled: -Number(item.amount || item.quantity) } : {}),
    };
    if (item.variantId) increment['variants.$.stock'] = Number(item.amount || item.quantity);
    const query = item.variantId
      ? { _id: item.product, 'variants._id': item.variantId }
      : { _id: item.product };
    await Product.updateOne(query, { $inc: increment }, { session });
  }
}

module.exports = { restoreItems };
