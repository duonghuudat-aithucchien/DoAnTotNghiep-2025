const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
    {
        orderItems: [
            {
                name: {type: String, required: true},
                amount: {type: Number, required: true, min: 1},
                image: {type: String, required: true},
                price: {type: Number, required: true, min: 0},
                discount: { type: Number},
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                variantId: { type: mongoose.Schema.Types.ObjectId },
                sku: { type: String, default: '' },
                size: { type: String, default: '' },
                color: { type: String, default: '' },
                sizes: { type: [String], required: true, default: [] },
                colors: { type: [String], required: true, default: [] },

            },
        ],

        shippingAddress: {
            fullName: {type: String, required: true},
            address: {type: String, required: true},
            city: {type: String, required: true},
            phone: {type: String, required: true},
        },
        paymentMethod: {type: String, required: true, enum: ['later_money', 'COD', 'vietqr', 'vnpay', 'paypal']},
        itemsPrice: {type: Number, required: true, min: 0},
        shippingPrice: {type: Number, required: true, min: 0},
        discountPrice: {type: Number, default: 0},
        voucherCode: {type: String, default: ''},
        voucherDiscount: {type: Number, default: 0},
        totalPrice: {type: Number, required: true, min: 0},
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        isPaid: {type: Boolean, default: false},
        paidAt: {type: Date},
        paymentTransactionId: {type: String, unique: true, sparse: true},
        paymentCaptureId: { type: String, unique: true, sparse: true },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded', 'paid_after_expiry'],
            default: 'pending',
        },
        paymentExpiresAt: { type: Date, index: true },
        refundedAmount: { type: Number, default: 0, min: 0 },
        refundStatus: { type: String, enum: ['none', 'requested', 'processing', 'partial', 'refunded', 'rejected'], default: 'none' },
        paymentMetadata: { type: mongoose.Schema.Types.Mixed, default: {} },
        isDelivered: {type: Boolean, default: false},
        deliveredAt: {type: Date},
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled', 'expired', 'payment_review'],
            default: 'pending',
        },
        trackingNumber: { type: String, default: '' },
        carrier: { type: String, default: '' },
        estimatedDeliveryAt: { type: Date },
        trackingHistory: [{
            status: { type: String, required: true },
            title: { type: String, required: true },
            description: { type: String, default: '' },
            location: { type: String, default: '' },
            createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            createdAt: { type: Date, default: Date.now },
        }],
    },
    {
        timestamps: true,
    }
);
const Order = mongoose.model('Order', orderSchema);
module.exports = Order
