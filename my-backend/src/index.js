const express = require("express");
const dotenv = require('dotenv');
const routes = require("./routes");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { startOrderExpirationJob } = require('./jobs/expireOrders');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim());

// Middleware
app.disable('x-powered-by');
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
}));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
app.use(bodyParser.json({ limit: "2mb" }));
app.use(bodyParser.urlencoded({ limit: "2mb", extended: true }));
app.use(cookieParser());

app.get('/api/health', (req, res) => res.status(200).json({ status: 'OK', message: 'Service is healthy' }));

// Connect Database
connectDB()
  .then(() => startOrderExpirationJob())
  .catch(() => console.error('Không khởi động job hết hạn đơn vì chưa kết nối được MongoDB'));

// API Routes
routes(app);

// Serve Static Frontend Build (if present)
const buildPath = path.join(__dirname, '../../my-frontend/build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ status: 'ERR', message: 'API route not found' });
    }
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`🚀 Backend Server is running on port: ${port}`);
});
