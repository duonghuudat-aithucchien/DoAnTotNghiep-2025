const mongoose = require('mongoose');
const { RETURN_TYPES, RETURN_STATUSES } = require('../utils/orderLifecycle');

const returnItemSchema = new mongoose.Schema({
  orderItemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId },
  name: { type: String, required: true },
  sku: { type: String, default: '' },
  size: { type: String, default: '' },
  color: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const historySchema = new mongoose.Schema({
  status: { type: String, required: true },
  note: { type: String, default: '' },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const returnRequestSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: RETURN_TYPES, required: true },
  items: { type: [returnItemSchema], required: true },
  reason: { type: String, required: true, trim: true, maxlength: 300 },
  description: { type: String, default: '', trim: true, maxlength: 2000 },
  evidenceUrls: { type: [String], default: [] },
  status: { type: String, enum: RETURN_STATUSES, default: 'requested', index: true },
  refundAmount: { type: Number, required: true, min: 0 },
  refundMethod: { type: String, default: '' },
  refundTransactionId: { type: String, default: '' },
  adminNote: { type: String, default: '' },
  inventoryRestored: { type: Boolean, default: false },
  history: { type: [historySchema], default: [] },
}, { timestamps: true });

returnRequestSchema.index({ order: 1, status: 1 });

module.exports = mongoose.model('ReturnRequest', returnRequestSchema);
