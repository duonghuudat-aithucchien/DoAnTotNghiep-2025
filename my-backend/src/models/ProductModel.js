const mongoose = require('mongoose')

const productSchema = new mongoose.Schema (
    {
        name: { type: String, required: true, unique: true },
        image: { type: String, required: true },
        subImages: { type: [String], default: [] },
        type: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        countInStock: { type: Number, required: true, min: 0} ,
        rating: { type: Number, required: true, min: 0, max: 5},
        description: { type: String},
        discount: { type: Number, min: 0, max: 100, default: 0},
        selled: { type: Number, min: 0, default: 0},
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
