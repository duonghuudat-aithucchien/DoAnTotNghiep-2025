const express = require('express')
const router = express.Router()
const { sendEmailSubscribe } = require('../services/EmailService')

router.post('/subscribe', async (req, res) => {
  const { email } = req.body
  try {
    if (!email) return res.status(400).json({ message: 'Email là bắt buộc' })

    await sendEmailSubscribe(email)
    res.status(200).json({ message: 'Đăng ký thành công' })
  } catch (error) {
    console.error('Lỗi gửi email subscribe:', error)
    res.status(500).json({ message: 'Gửi email thất bại' })
  }
})

module.exports = router
