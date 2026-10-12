export const orderConstant = {
    delivery: {
        fast: 'FAST',
        gojeck: 'GO_JEK'
    },
    payment: {
        later_money: 'Thanh toán tiền mặt khi nhận hàng',
        paypal: 'Thanh toán qua Paypal',
        vietqr: 'Chuyển khoản VietQR (Quét mã 24/7)',
        vnpay: 'Thanh toán trực tuyến VNPAY (ATM / Visa / QR)',
    }
};

// Hỗ trợ tương thích ngược với mã nguồn cũ
export const orderContant = orderConstant;
