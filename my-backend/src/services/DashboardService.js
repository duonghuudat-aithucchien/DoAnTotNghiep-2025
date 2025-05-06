const Order = require('../models/OrderProduct');
const User = require('../models/UserModel');
const Product = require('../models/ProductModel');
const moment = require('moment');

const getDashboardStats = async () => {
  const totalUsers = await User.countDocuments();
  const totalOrders = await Order.countDocuments();
  const totalSalesResult = await Order.aggregate([
    { $group: { _id: null, total: { $sum: "$totalPrice" } } }
  ]);
  const totalSales = totalSalesResult[0]?.total || 0;
  const totalPending = await Order.countDocuments({ isPaid: false });

  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit()
    .populate('user', 'name');

  const topProducts = await Product.find()
    .sort({ selled: -1 })
    .limit(5);

  // Doanh thu theo tuần (7 ngày gần nhất)
  const last7Days = [...Array(7)].map((_, i) =>
    moment.utc().subtract(i, 'days').startOf('day')
  ).reverse();

  const weeklyRevenue = await Promise.all(last7Days.map(async (day) => {
    const nextDay = moment.utc(day).add(1, 'days');
    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: day.toDate(), $lt: nextDay.toDate() },
          $or: [{ isPaid: true }, { isDelivered: true }],
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);
    return {
      date: day.format('DD/MM'),
      revenue: result[0]?.total || 0
    };
  }));

  // Doanh thu theo tháng (12 tháng gần nhất)
  const monthlyRevenue = await Promise.all([...Array(12)].map(async (_, i) => {
    const start = moment.utc().subtract(i, 'months').startOf('month');
    const end = moment.utc(start).endOf('month');
    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start.toDate(), $lt: end.toDate() },
          $or: [{ isPaid: true }, { isDelivered: true }],
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);
    return {
      month: start.format('MM/YYYY'),
      revenue: result[0]?.total || 0
    };
  }));

  // Doanh thu theo năm (5 năm gần nhất)
  const yearlyRevenue = await Promise.all([...Array(5)].map(async (_, i) => {
    const year = moment.utc().subtract(i, 'years').year();
    const result = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00Z`),
            $lt: new Date(`${year + 1}-01-01T00:00:00Z`)
          },
          $or: [{ isPaid: true }, { isDelivered: true }],
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);
    return {
      year: `${year}`,
      revenue: result[0]?.total || 0
    };
  }));

  return {
    totalUsers,
    totalOrders,
    totalSales,
    totalPending,
    recentOrders,
    topProducts,
    weeklyRevenue,
    monthlyRevenue: monthlyRevenue.reverse(),
    yearlyRevenue: yearlyRevenue.reverse()
  };
};

module.exports = { getDashboardStats };
