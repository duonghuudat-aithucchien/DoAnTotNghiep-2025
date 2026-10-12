const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/UserModel');
const Order = require('../src/models/OrderProduct');
const Product = require('../src/models/ProductModel');
const cloudinary = require('../src/config/cloudinary');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI không được tìm thấy trong .env');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

const uploadToCloudinary = async (base64, folder = 'uploads') => {
  const result = await cloudinary.uploader.upload(base64, { folder });
  return result.secure_url;
};

const migrateProductImages = async () => {
  const products = await Product.find({ image: { $regex: '^data:image/' } });
  console.log(`🔍 Tìm thấy ${products.length} sản phẩm cần migrate ảnh...`);

  for (const product of products) {
    try {
      console.log(`🔄 Đang xử lý: ${product.name}`);
      const mainUrl = await uploadToCloudinary(product.image, 'products');
      product.image = mainUrl;

      const newSubImages = [];
      for (const subImg of product.subImages || []) {
        if (subImg.startsWith('data:image/')) {
          const subUrl = await uploadToCloudinary(subImg, 'products/subImages');
          newSubImages.push(subUrl);
        } else {
          newSubImages.push(subImg);
        }
      }
      product.subImages = newSubImages;
      await product.save();
      console.log(`✅ Đã cập nhật sản phẩm: ${product.name}`);
    } catch (err) {
      console.error(`❌ Lỗi sản phẩm ${product.name}:`, err.message);
    }
  }
};

const migrateUserAvatars = async () => {
  const users = await User.find({ avatar: { $regex: '^data:image/' } });
  console.log(`🔍 Tìm thấy ${users.length} user cần migrate avatar...`);

  for (const user of users) {
    try {
      const uploaded = await uploadToCloudinary(user.avatar, 'avatars');
      user.avatar = uploaded;
      await user.save();
      console.log(`✅ Đã cập nhật avatar: ${user.name}`);
    } catch (err) {
      console.error(`❌ Lỗi user ${user.name}:`, err.message);
    }
  }
};

const migrateOrderImages = async () => {
  const orders = await Order.find({ 'orderItems.image': { $regex: '^data:image/' } });
  console.log(`🔍 Tìm thấy ${orders.length} đơn hàng cần migrate ảnh...`);

  for (const order of orders) {
    let updated = false;
    for (let item of order.orderItems) {
      if (item.image && item.image.startsWith('data:image/')) {
        try {
          const uploaded = await uploadToCloudinary(item.image, 'orders');
          item.image = uploaded;
          updated = true;
        } catch (err) {
          console.error(`❌ Lỗi item trong order:`, err.message);
        }
      }
    }
    if (updated) {
      await order.save();
      console.log(`✅ Đã cập nhật order ${order._id}`);
    }
  }
};

const run = async () => {
  try {
    await migrateProductImages();
    await migrateUserAvatars();
    await migrateOrderImages();
    console.log('🎉 Toàn bộ migration hoàn tất!');
  } catch (error) {
    console.error('❌ Migration thất bại:', error);
  } finally {
    process.exit();
  }
};

run();
