const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

const authMiddleware = (req, res, next) => {
    const token = req.headers.token.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
        if (err) {
            return res.status(404).json({
                message: 'The authemtication',
                status: 'ERROR'
            })
        }

        if(user?.isAdmin) {
            next()
        }else {
            return res.status(404).json({
                message: 'The authemtication',
                status: 'ERROR'
            })
        }
        
    });

    
}

const authUserMiddleware = (req, res, next) => {
    const token = req.headers.token.split(' ')[1]
    const userId = req.params.id
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
        if (err) {
            return res.status(404).json({
                message: 'The authemtication',
                status: 'ERROR'
            })
        }

        if(user?.isAdmin || user?.id === userId) {
            next()
        }else {
            return res.status(404).json({
                message: 'The authemtication',
                status: 'ERROR'
            })
        }
        
    });
  
}

const authReviewMiddleware = (req, res, next) => {
    try {
        console.log('Using ACCESS_TOKEN:', process.env.ACCESS_TOKEN);
        const token = req.headers.token?.split(' ')[1];
        console.log('Received token:', token);
        if (!token) {
            return res.status(401).json({
                message: 'Authentication token is required',
                status: 'ERROR',
            });
        }

        jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
            console.log('JWT verify result:', { err, user });
            if (err) {
                return res.status(403).json({
                    message: 'Invalid or expired token',
                    status: 'ERROR',
                    errorDetails: err.message,
                });
            }
            if (!user?.id) {
                return res.status(403).json({
                    message: 'Token does not contain user ID',
                    status: 'ERROR',
                });
            }
            req.user = { id: user.id, isAdmin: user.isAdmin }; // Chuẩn hóa req.user
            next();
        });
    } catch (e) {
        console.error('Error in authReviewMiddleware:', {
            error: e.message,
            stack: e.stack,
            token: req.headers.token,
        });
        return res.status(500).json({
            status: 'ERR',
            message: 'Authentication error',
            errorDetails: e.message,
        });
    }
};



module.exports = {
    authMiddleware,
    authUserMiddleware,
    authReviewMiddleware
}