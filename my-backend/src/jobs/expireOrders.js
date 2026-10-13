const OrderService = require('../services/OrderService');

function startOrderExpirationJob() {
  const intervalMs = Math.max(15_000, Number(process.env.ORDER_EXPIRY_JOB_INTERVAL_MS || 60_000));
  let running = false;

  const run = async () => {
    if (running) return;
    running = true;
    try {
      const count = await OrderService.expireUnpaidOrders();
      if (count > 0) console.log(`Đã hết hạn ${count} đơn chưa thanh toán`);
    } catch (error) {
      console.error('Lỗi job hết hạn đơn hàng:', error.message);
    } finally {
      running = false;
    }
  };

  const firstRun = setTimeout(run, 5_000);
  const timer = setInterval(run, intervalMs);
  firstRun.unref();
  timer.unref();
  return timer;
}

module.exports = { startOrderExpirationJob };
