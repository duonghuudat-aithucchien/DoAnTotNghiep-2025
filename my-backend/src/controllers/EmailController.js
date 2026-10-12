const { sendEmailSubscribe } = require('../services/EmailService');

const subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        status: 'ERR',
        message: 'Email là bắt buộc'
      });
    }

    await sendEmailSubscribe(email);
    return res.status(200).json({
      status: 'OK',
      message: 'Đăng ký nhận tin thành công'
    });
  } catch (error) {
    console.error('Lỗi gửi email subscribe:', error);
    return res.status(500).json({
      status: 'ERR',
      message: 'Gửi email thất bại'
    });
  }
};

module.exports = {
  subscribe
};
