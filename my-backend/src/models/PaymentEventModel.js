const mongoose = require('mongoose');

const paymentEventSchema = new mongoose.Schema({
  provider: { type: String, enum: ['paypal', 'vnpay'], required: true },
  eventId: { type: String, required: true },
  eventType: { type: String, required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  status: { type: String, enum: ['processing', 'processed', 'ignored', 'failed'], default: 'processing' },
  payload: { type: mongoose.Schema.Types.Mixed },
  errorMessage: { type: String, default: '' },
  processedAt: { type: Date },
}, { timestamps: true });

paymentEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('PaymentEvent', paymentEventSchema);
