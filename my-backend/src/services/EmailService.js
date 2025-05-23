const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config()

const sendEmailCreateOrder = async (email, orderItems) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for port 465, false for other ports
        auth: {
          user: process.env.MAIL_ACCOUNT, // generated ethereal user
          pass: process.env.MAIL_PASSWORD, // generated ethereal password
        },
      });

    let listItem = ''
    const attachImage = []
    orderItems.forEach((order) => {
        listItem += `<div>
        <div>Bạn đã đặt sản phẩm <b>${order.name}</b> với số lượng: <b>${order.amount}</b> và giá là : <b>${order.price} VND</b>
        Nếu có bất kỳ thắc mắc nào về đơn hàng hãy liên hệ với chúng tôi qua email này hoặc số điện thoại 0334400884</div>
        </div>
        <div>Hình ảnh sản phẩm</div>
        </div>`
        attachImage.push({path: order.image})
        
    })
    
    let info = await transporter.sendMail({
        from: process.env.MAIL_ACCOUNT, // sender address
        to: "huudatcrypto1607@gmail.com", // list of receivers
        subject: "Bạn đã đặt hàng thành công", // Subject line
        text: "Hello world?", // plain text body
        html: `<div><b>Bạn đã đặt hàng thành công tại shop</b></div>${listItem}`,
        attachments: attachImage,
    });
}

const sendEmailSubscribe = async (subscriberEmail) => {
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
      to: "huudatcrypto1607@gmail.com", // Email admin nhận đăng ký
      subject: "Đăng ký nhận tin mới từ khách hàng",
      html: `<div>
        <p>Khách hàng vừa đăng ký nhận thông tin với email:</p>
        <h3>${subscriberEmail} hãy mau chóng gửi thông tin khuyến mãi cho khách hàng!</h3>
      </div>`,
    });
  };

module.exports = {
    sendEmailCreateOrder,
    sendEmailSubscribe
}