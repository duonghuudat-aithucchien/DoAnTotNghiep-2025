const dashboardService = require('../services/DashboardService')

const getDashboard = async (req, res) => {
    try {
        const data = await dashboardService.getDashboardStats()
        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu dashboard' })
    }
}

module.exports = { getDashboard }
