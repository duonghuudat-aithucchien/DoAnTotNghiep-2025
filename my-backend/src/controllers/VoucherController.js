const VoucherService = require('../services/VoucherService');

const createVoucher = async (req, res) => {
  try {
    const { code, name, discountValue, endDate } = req.body;
    if (!code || !name || discountValue === undefined || !endDate) {
      return res.status(200).json({
        status: 'ERR',
        message: 'Vui lòng điền đầy đủ các thông tin bắt buộc (mã, tên, giá trị giảm, hạn sử dụng)',
      });
    }

    const response = await VoucherService.createVoucher(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e.message || e,
    });
  }
};

const updateVoucher = async (req, res) => {
  try {
    const voucherId = req.params.id;
    if (!voucherId) {
      return res.status(200).json({
        status: 'ERR',
        message: 'Thiếu voucherId',
      });
    }

    const response = await VoucherService.updateVoucher(voucherId, req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e.message || e,
    });
  }
};

const deleteVoucher = async (req, res) => {
  try {
    const voucherId = req.params.id;
    if (!voucherId) {
      return res.status(200).json({
        status: 'ERR',
        message: 'Thiếu voucherId',
      });
    }

    const response = await VoucherService.deleteVoucher(voucherId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e.message || e,
    });
  }
};

const getAllVouchers = async (req, res) => {
  try {
    const { limit, page, sort } = req.query;
    const response = await VoucherService.getAllVouchers(limit, page, sort);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e.message || e,
    });
  }
};

const getAvailableVouchers = async (req, res) => {
  try {
    const response = await VoucherService.getAvailableVouchers();
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e.message || e,
    });
  }
};

const applyVoucher = async (req, res) => {
  try {
    const { code, itemsPrice } = req.body;
    const response = await VoucherService.applyVoucher(code, itemsPrice);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e.message || e,
    });
  }
};

module.exports = {
  createVoucher,
  updateVoucher,
  deleteVoucher,
  getAllVouchers,
  getAvailableVouchers,
  applyVoucher,
};
