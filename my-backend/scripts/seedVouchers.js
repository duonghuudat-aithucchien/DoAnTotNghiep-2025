const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../src/config/db');
const Voucher = require('../src/models/VoucherModel');

const seedVouchers = async () => {
  try {
    await connectDB();

    const sampleVouchers = [
      {
        code: 'FASHION10',
        name: 'Giảm 10% tối đa 50K cho đơn từ 200K',
        discountType: 'percent',
        discountValue: 10,
        maxDiscountAmount: 50000,
        minOrderValue: 200000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 ngày sau
        usageLimit: 500,
        usedCount: 0,
        isActive: true,
      },
      {
        code: 'FREESHIP',
        name: 'Giảm 20.000đ phí giao hàng cho đơn từ 150K',
        discountType: 'fixed',
        discountValue: 20000,
        maxDiscountAmount: null,
        minOrderValue: 150000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        usageLimit: 300,
        usedCount: 0,
        isActive: true,
      },
      {
        code: 'SALE50K',
        name: 'Giảm trực tiếp 50.000đ cho đơn từ 300K',
        discountType: 'fixed',
        discountValue: 50000,
        maxDiscountAmount: null,
        minOrderValue: 300000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        usageLimit: 200,
        usedCount: 0,
        isActive: true,
      },
      {
        code: 'VIP100K',
        name: 'Giảm sốc 100.000đ cho đơn hàng từ 500K',
        discountType: 'fixed',
        discountValue: 100000,
        maxDiscountAmount: null,
        minOrderValue: 500000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        usedCount: 0,
        isActive: true,
      },
    ];

    for (const v of sampleVouchers) {
      await Voucher.findOneAndUpdate({ code: v.code }, v, { upsert: true, new: true });
      console.log(`✅ Seeded voucher: ${v.code}`);
    }

    console.log('🎉 Seed vouchers hoàn tất!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi seed voucher:', error);
    process.exit(1);
  }
};

seedVouchers();
