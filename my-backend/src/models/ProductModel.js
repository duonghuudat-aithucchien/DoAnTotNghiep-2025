const mongoose = require('mongoose')

const productSchema = new mongoose.Schema (
    {
        name: { type: String, required: true, unique: true },
        image: { type: String, required: true },
        subImages: { type: [String], default: [] },
        type: { type: String, required: true },
        price: { type: Number, required: true },
        countInStock: { type: Number, required: true} ,
        rating: { type: Number, required: true},
        description: { type: String},
        discount: { type: Number},
        selled: { type: Number},
        sizes: { type: [String], required: true, default: [] },
        colors: { type: [String], required: true, default: [] },
        reviews: [
            {
              user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User', // Liên kết với bảng User
                required: true,
              },
              rating: { type: Number, required: true },
              comment: { type: String, required: true },
              createdAt: { type: Date, default: Date.now },
            },
          ],
    
    },
    {
        timestamps: true,
    }
);
const Product = mongoose.model('Product', productSchema);

module.exports = Product;