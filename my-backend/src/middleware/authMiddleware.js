const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
    try {
        const headerToken = req.headers.token || req.headers.authorization
        if (!headerToken) {
            return res.status(401).json({
                message: 'Authentication token is required',
                status: 'ERROR'
            })
        }
        const token = headerToken.includes(' ') ? headerToken.split(' ')[1] : headerToken
        jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
            if (err) {
                return res.status(401).json({
                    message: 'The authentication is invalid or expired',
                    status: 'ERROR'
                })
            }

            if (user?.isAdmin === true) {
                req.user = user
                next()
            } else {
                return res.status(403).json({
                    message: 'Admin permission required',
                    status: 'ERROR'
                })
            }
        });
    } catch (e) {
        return res.status(500).json({
            message: 'Server auth error',
            status: 'ERROR'
        })
    }
}

const authUserMiddleware = (req, res, next) => {
    try {
        const headerToken = req.headers.token || req.headers.authorization
        if (!headerToken) {
            return res.status(401).json({
                message: 'Authentication token is required',
                status: 'ERROR'
            })
        }
        const token = headerToken.includes(' ') ? headerToken.split(' ')[1] : headerToken
        jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
            if (err) {
                return res.status(401).json({
                    message: 'The authentication is invalid or expired',
                    status: 'ERROR'
                })
            }

            req.user = user
            if (user?.isAdmin === true) {
                return next()
            }

            // Với route user: req.params.id là userId
            if (req.baseUrl?.includes('user')) {
                if (req.params.id && user?.id === req.params.id) {
                    return next()
                }
                return res.status(403).json({
                    message: 'Permission denied for user resource',
                    status: 'ERROR'
                })
            }

            // Với route order:
            // 1. Tạo đơn: nếu req.body.user được truyền thì phải khớp user.id
            if (req.body?.user && req.body.user !== user?.id) {
                return res.status(403).json({
                    message: 'Cannot place order for another user',
                    status: 'ERROR'
                })
            }

            // 2. Lấy đơn hàng theo user: /get-all-order/:id -> req.params.id phải khớp user.id
            if (req.path?.includes('get-all-order') && req.params.id && req.params.id !== user?.id) {
                return res.status(403).json({
                    message: 'Cannot view orders of another user',
                    status: 'ERROR'
                })
            }

            // 3. Các thao tác khác của order: người dùng đã xác thực hợp lệ
            next()
        });
    } catch (e) {
        return res.status(500).json({
            message: 'Server auth error',
            status: 'ERROR'
        })
    }
}

const authReviewMiddleware = (req, res, next) => {
    try {
        const headerToken = req.headers.token || req.headers.authorization;
        const token = headerToken?.includes(' ') ? headerToken.split(' ')[1] : headerToken;
        if (!token) {
            return res.status(401).json({
                message: 'Authentication token is required',
                status: 'ERROR',
            });
        }

        jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
            if (err) {
                return res.status(401).json({
                    message: 'Invalid or expired token',
                    status: 'ERROR',
                });
            }
            if (!user?.id) {
                return res.status(403).json({
                    message: 'Token does not contain user ID',
                    status: 'ERROR',
                });
            }
            req.user = { id: user.id, isAdmin: user.isAdmin === true };
            next();
        });
    } catch (e) {
        console.error('Authentication error:', e.message);
        return res.status(500).json({
            status: 'ERR',
            message: 'Authentication error',
        });
    }
};



module.exports = {
    authMiddleware,
    authUserMiddleware,
    authReviewMiddleware
}
