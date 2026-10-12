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
        isDelivered: {type: Boolean, default: false},
        deliveredAt: {type: Date},
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);
const Order = mongoose.model('Order', orderSchema);
module.exports = Order
