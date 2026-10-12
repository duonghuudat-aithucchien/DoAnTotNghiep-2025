const Voucher = require('../models/VoucherModel');

const createVoucher = (newVoucher) => {
  return new Promise(async (resolve, reject) => {
    const {
      code,
      name,
      discountType,
      discountValue,
      maxDiscountAmount,
      minOrderValue,
      startDate,
      endDate,
      usageLimit,
    } = newVoucher;

    try {
      const checkVoucher = await Voucher.findOne({ code: code?.toUpperCase() });
      if (checkVoucher !== null) {
        return resolve({
          status: 'ERR',
          message: 'Mã voucher này đã tồn tại trong hệ thống',
        });
      }

      const createdVoucher = await Voucher.create({
        code: code?.toUpperCase(),
        name,
        discountType: discountType || 'fixed',
        discountValue: Number(discountValue),
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: new Date(endDate),
        usageLimit: usageLimit ? Number(usageLimit) : 100,
        isActive: true,
      });

      resolve({
        status: 'OK',
        message: 'Tạo mã voucher thành công',
        data: createdVoucher,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const updateVoucher = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkVoucher = await Voucher.findById(id);
      if (!checkVoucher) {
        return resolve({
          status: 'ERR',
          message: 'Không tìm thấy voucher',
        });
      }

      if (data.code && data.code.toUpperCase() !== checkVoucher.code) {
        const exist = await Voucher.findOne({ code: data.code.toUpperCase() });
        if (exist) {
          return resolve({
            status: 'ERR',
            message: 'Mã voucher đã tồn tại',
          });
        }
        data.code = data.code.toUpperCase();
      }

      const updatedVoucher = await Voucher.findByIdAndUpdate(id, data, { new: true });
      resolve({
        status: 'OK',
        message: 'Cập nhật voucher thành công',
        data: updatedVoucher,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deleteVoucher = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkVoucher = await Voucher.findById(id);
      if (!checkVoucher) {
        return resolve({
          status: 'ERR',
          message: 'Không tìm thấy voucher',
        });
      }

      await Voucher.findByIdAndDelete(id);
      resolve({
        status: 'OK',
        message: 'Xóa voucher thành công',
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getAllVouchers = (limit = 50, page = 0, sort = 'desc') => {
  return new Promise(async (resolve, reject) => {
    try {
      const totalVoucher = await Voucher.countDocuments();
      const allVoucher = await Voucher.find()
        .limit(Number(limit))
        .skip(Number(page) * Number(limit))
        .sort({ createdAt: sort === 'asc' ? 1 : -1 });

      resolve({
        status: 'OK',
        message: 'Lấy danh sách voucher thành công',
        data: allVoucher,
        total: totalVoucher,
        pageCurrent: Number(page) + 1,
        totalPage: Math.ceil(totalVoucher / limit),
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getAvailableVouchers = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const now = new Date();
      const availableVouchers = await Voucher.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
        $expr: { $lt: ['$usedCount', '$usageLimit'] },
      }).sort({ discountValue: -1 });

      resolve({
        status: 'OK',
        message: 'Lấy danh sách voucher khả dụng thành công',
        data: availableVouchers,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const applyVoucher = (code, itemsPrice) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!code) {
        return resolve({
          status: 'ERR',
          message: 'Vui lòng nhập mã voucher',
        });
      }

      const voucher = await Voucher.findOne({
        code: code.trim().toUpperCase(),
      });

      if (!voucher) {
        return resolve({
          status: 'ERR',
          message: 'Mã giảm giá không tồn tại',
        });
      }

      if (!voucher.isActive) {
        return resolve({
          status: 'ERR',
          message: 'Mã giảm giá đã bị tạm ngừng kích hoạt',
        });
      }

      const now = new Date();
      if (now < voucher.startDate) {
        return resolve({
          status: 'ERR',
          message: 'Mã giảm giá chưa đến ngày bắt đầu sử dụng',
        });
      }

      if (now > voucher.endDate) {
        return resolve({
          status: 'ERR',
          message: 'Mã giảm giá đã hết hạn sử dụng',
        });
      }

      if (voucher.usedCount >= voucher.usageLimit) {
        return resolve({
          status: 'ERR',
          message: 'Mã giảm giá đã hết số lượt sử dụng',
        });
      }

      const price = Number(itemsPrice) || 0;
      if (price < voucher.minOrderValue) {
        return resolve({
          status: 'ERR',
          message: `Đơn hàng tối thiểu phải từ ${voucher.minOrderValue.toLocaleString('vi-VN')} VND để sử dụng mã này`,
        });
      }

      // Tính số tiền giảm giá
      let discountAmount = 0;
      if (voucher.discountType === 'percent') {
        discountAmount = (price * voucher.discountValue) / 100;
        if (voucher.maxDiscountAmount && discountAmount > voucher.maxDiscountAmount) {
          discountAmount = voucher.maxDiscountAmount;
        }
      } else {
        discountAmount = voucher.discountValue;
      }

      if (discountAmount > price) {
        discountAmount = price;
      }

      discountAmount = Math.round(discountAmount);

      resolve({
        status: 'OK',
        message: 'Áp dụng mã giảm giá thành công',
        data: {
          voucherId: voucher._id,
          code: voucher.code,
          name: voucher.name,
          discountType: voucher.discountType,
          discountValue: voucher.discountValue,
          discountAmount: discountAmount,
          finalItemsPrice: price - discountAmount,
        },
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createVoucher,
  updateVoucher,
  deleteVoucher,
  getAllVouchers,
  getAvailableVouchers,
  applyVoucher,
};
