const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config()

const sendEmailCreateOrder = async (email, orderItems) => {
    try {
        if (!process.env.MAIL_ACCOUNT || process.env.MAIL_ACCOUNT.includes('YOUR_GMAIL') || !process.env.MAIL_PASSWORD || process.env.MAIL_PASSWORD.includes('YOUR_GMAIL')) {
            console.log('Chưa cấu hình tài khoản Gmail hợp lệ, bỏ qua gửi email đơn hàng.');
            return;
        }

        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAIL_ACCOUNT,
                pass: process.env.MAIL_PASSWORD,
            },
        });

        let listItem = '';
        const attachImage = [];
        orderItems.forEach((order) => {
            listItem += `<div>
            <div>Bạn đã đặt sản phẩm <b>${order.name}</b> với số lượng: <b>${order.amount}</b> và giá là : <b>${order.price} VND</b>
            Nếu có bất kỳ thắc mắc nào về đơn hàng hãy liên hệ với chúng tôi qua số điện thoại 0334400884</div>
            </div>`;
            if (order.image) {
                attachImage.push({ path: order.image });
            }
        });

        await transporter.sendMail({
            from: process.env.MAIL_ACCOUNT,
            to: email,
            subject: "Bạn đã đặt hàng thành công tại FashionStyle",
            text: "🛍️ Xác nhận đơn hàng từ FashionStyle",
            html: `<div><b>Bạn đã đặt hàng thành công tại shop</b></div>${listItem}`,
            attachments: attachImage,
        });
    } catch (err) {
        console.error('Lỗi khi gửi email xác nhận đặt hàng (được bỏ qua):', err.message);
    }
}

const sendEmailSubscribe = async (subscriberEmail) => {
    const notificationEmail = process.env.SUBSCRIBE_NOTIFICATION_EMAIL || process.env.MAIL_ACCOUNT;
    if (!notificationEmail) throw new Error('Chưa cấu hình email nhận đăng ký');
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_ACCOUNT,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  
    await transporter.sendMail({
      from: process.env.MAIL_ACCOUNT,
      to: notificationEmail,
      subject: "Đăng ký nhận tin mới từ khách hàng",
      html: `<div>
        <p>Khách hàng vừa đăng ký nhận thông tin với email:</p>
        <h3>${String(subscriberEmail).replace(/[<>&"']/g, '')}</h3>
      </div>`,
    });
  };

module.exports = {
    sendEmailCreateOrder,
    sendEmailSubscribe
}
