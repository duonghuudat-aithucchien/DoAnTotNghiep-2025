const UserRouter = require('./UserRouter')
const ProductRouter = require('./ProductRouter')
const OrderRouter = require('./OrderRouter')
const PaymentRouter = require('./PaymentRouter')
const EmailRouter = require('./EmailRouter')
const FilterRouter = require('./FilterRouter')
const DashboardRouter = require('./DashboardRouter')

const routes = (app) => {
    app.use('/api/user', UserRouter)
    app.use('/api/product', ProductRouter)
    app.use('/api/order', OrderRouter)
    app.use('/api/payment', PaymentRouter)
    app.use('/api/email', EmailRouter)
    app.use('/api/filter', FilterRouter)
    app.use('/api/dashboard', DashboardRouter)
};

module.exports = routes;
