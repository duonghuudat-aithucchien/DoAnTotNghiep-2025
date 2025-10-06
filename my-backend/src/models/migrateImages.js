// const mongoose = require('mongoose');
// const Product = require('./ProductModel'); // sửa lại đường dẫn nếu khác
// const cloudinary = require('../config/cloudinary');

// const MONGO_URI = 'mongodb+srv://duongdat667:3rxpSuUkVA9St5Cs@cluster.z1r1o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster'; // Hoặc Mongo Atlas URI

// mongoose.connect(MONGO_URI)
//   .then(() => console.log('✅ Connected to MongoDB'))
//   .catch(err => console.error('❌ MongoDB connection error:', err));

// const runMigration = async () => {
//   const products = await Product.find({
//     image: { $regex: '^data:image/' }
//   });

//   for (const product of products) {
//     try {
//       console.log(`🔄 Đang xử lý: ${product.name}`);

//       // Upload ảnh chính
//       const main = await cloudinary.uploader.upload(product.image, {
//         folder: 'products'
//       });
//       product.image = main.secure_url;

//       // Upload subImages nếu có
//       const newSubImages = [];
//       for (const subImg of product.subImages || []) {
//         if (subImg.startsWith('data:image/')) {
//           const subRes = await cloudinary.uploader.upload(subImg, {
//             folder: 'products/subImages'
//           });
//           newSubImages.push(subRes.secure_url);
//         } else {
//           newSubImages.push(subImg);
//         }
//       }

//       product.subImages = newSubImages;

//       await product.save();
//       console.log(`✅ Đã cập nhật: ${product.name}`);
//     } catch (err) {
//       console.error(`❌ Lỗi với ${product.name}:`, err.message);
//     }
//   }

//   console.log('🎉 Migrate ảnh hoàn tất!');
//   process.exit();
// };

// runMigration();

const mongoose = require('mongoose');
const User = require('./UserModel');
const Order = require('./OrderProduct');
const cloudinary = require('../config/cloudinary');

const MONGO_URI = 'mongodb+srv://duongdat667:3rxpSuUkVA9St5Cs@cluster.z1r1o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster'; // Hoặc Mongo Atlas URI

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const uploadToCloudinary = async (base64, folder = 'uploads') => {
  const result = await cloudinary.uploader.upload(base64, { folder });
  return result.secure_url;
};

const migrateUserAvatars = async () => {
  const users = await User.find({ avatar: { $regex: '^data:image/' } });

  for (const user of users) {
    try {
      const uploaded = await uploadToCloudinary(user.avatar, 'avatars');
      user.avatar = uploaded;
      await user.save();
      console.log(`✅ Updated avatar for user: ${user.name}`);
    } catch (err) {
      console.error(`❌ Failed avatar for ${user.name}:`, err.message);
    }
  }
};

const migrateOrderImages = async () => {
  const orders = await Order.find({ 'orderItems.image': { $regex: '^data:image/' } });

  for (const order of orders) {
    let updated = false;

    for (let item of order.orderItems) {
      if (item.image && item.image.startsWith('data:image/')) {
        try {
          const uploaded = await uploadToCloudinary(item.image, 'orders');
          item.image = uploaded;
          updated = true;
        } catch (err) {
          console.error(`❌ Error in order item:`, err.message);
        }
      }
    }

    if (updated) {
      await order.save();
      console.log(`✅ Updated order ${order._id}`);
    }
  }
};

const run = async () => {
  await migrateUserAvatars();
  await migrateOrderImages();
  console.log('🎉 Migration hoàn tất!');
  process.exit();
};

run();
