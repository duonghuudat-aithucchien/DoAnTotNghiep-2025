# 🛍️ FashionStyle — Hệ Thống Bán Lẻ Thời Trang & Trợ Lý Ảo Chatbot AI
> **Đồ án tốt nghiệp:** Xây dựng hệ thống thương mại điện tử thời trang tích hợp trợ lý ảo tư vấn thông minh (Gemini AI + FAISS).

---

## 📌 1. Giới thiệu tổng quan

**FashionStyle** là hệ thống thương mại điện tử hoàn chỉnh gồm 3 thành phần chính:
1. **Frontend (`my-frontend`)**: Giao diện người dùng và trang quản trị Admin xây dựng bằng **React 19**, **Ant Design**, **Redux Toolkit**, và **Styled-Components**.
2. **Backend (`my-backend`)**: RESTful API server xây dựng bằng **Node.js / Express**, lưu trữ dữ liệu trên **MongoDB Atlas Cloud**, tích hợp **PayPal**, **Cloudinary**, và **Nodemailer**.
3. **Chatbot AI (`chatbot`)**: Dịch vụ trợ lý ảo hỗ trợ tư vấn sản phẩm thông minh bằng **Python / Flask**, **Google Gemini AI**, và tìm kiếm ngữ nghĩa thời gian thực qua **FAISS & Sentence Transformers (BERT)**.

---

## 🏗️ 2. Cấu trúc thư mục dự án

```
Fashion_Style_Do_an_tot_nghiep/
├── .gitignore                      # Cấu hình bỏ qua file cho Git (Node, React, Python)
├── README.md                       # Tài liệu hướng dẫn toàn diện hệ thống
│
├── my-backend/                     # 🚀 BACKEND SERVICE (Node.js & Express)
│   ├── .env                        # Biến môi trường Backend (Private)
│   ├── .env.example                # Mẫu biến môi trường Backend
│   ├── package.json
│   ├── scripts/                    # Scripts tiện ích hệ thống
│   │   └── migrateImages.js        # Script chuyển đổi ảnh Base64 lên Cloudinary
│   └── src/
│       ├── index.js                # Điểm khởi chạy Backend Server
│       ├── config/                 # Cấu hình dịch vụ bên ngoài
│       │   ├── db.js               # Kết nối cơ sở dữ liệu MongoDB Atlas
│       │   └── cloudinary.js       # Cấu hình lưu trữ ảnh Cloudinary
│       ├── controllers/            # Tầng điều khiển (Controller layer)
│       │   ├── DashboardController.js
│       │   ├── EmailController.js
│       │   ├── FilterController.js
│       │   ├── OrderController.js
│       │   ├── PaymentController.js
│       │   ├── ProductController.js
│       │   └── UserController.js
│       ├── middleware/             # Middleware xác thực & xử lý lỗi
│       │   ├── authMiddleware.js   # Xác thực JWT Token & phân quyền Admin
│       │   └── errorMiddleware.js  # Bắt lỗi 404 và xử lý ngoại lệ tập trung
│       ├── models/                 # Lược đồ dữ liệu Mongoose (Models)
│       │   ├── OrderProduct.js     # Đơn hàng
│       │   ├── ProductModel.js     # Sản phẩm
│       │   └── UserModel.js        # Người dùng & Tài khoản
│       ├── routes/                 # Định tuyến API (Router layer)
│       │   ├── index.js            # Gom cụm toàn bộ router
│       │   ├── DashboardRouter.js
│       │   ├── EmailRouter.js
│       │   ├── FilterRouter.js
│       │   ├── OrderRouter.js
│       │   ├── PaymentRouter.js
│       │   ├── ProductRouter.js
│       │   └── UserRouter.js
│       └── services/               # Tầng nghiệp vụ (Service layer)
│           ├── DashboardService.js
│           ├── EmailService.js
│           ├── FilterService.js
│           ├── JwtService.js
│           ├── OrderService.js
│           ├── ProductService.js
│           └── UserService.js
│
├── my-frontend/                    # 💻 FRONTEND CLIENT (React.js)
│   ├── .env                        # Biến môi trường Frontend (Private)
│   ├── .env.example                # Mẫu biến môi trường Frontend
│   ├── package.json
│   └── src/
│       ├── index.js                # Điểm khởi chạy React App
│       ├── App.js                  # Component gốc & Router setup
│       ├── assets/                 # Tài nguyên hình ảnh, biểu tượng (SVG/PNG)
│       ├── components/             # Các component dùng chung & widget
│       │   ├── AdminProduct/
│       │   ├── AdminUser/
│       │   ├── CardComponent/
│       │   ├── Chatbot/            # Widget bong bóng Chatbot AI
│       │   ├── FooterComponent/
│       │   ├── HeaderComponent/
│       │   ├── OrderAdmin/
│       │   └── TableComponent/
│       ├── constants/              # Hằng số hệ thống
│       │   ├── index.js
│       │   └── orderConstant.js
│       ├── hooks/                  # Custom React Hooks
│       ├── pages/                  # Các trang giao diện (14 trang)
│       │   ├── AdminPage/
│       │   ├── HomePage/
│       │   ├── OrderPage/
│       │   ├── PaymentPage/
│       │   ├── ProductDetailsPage/
│       │   ├── Profile/
│       │   └── SignInPage/
│       ├── redux/                  # Quản lý trạng thái Redux Toolkit
│       │   ├── store.js
│       │   └── slides/             # Redux slices (user, product, order, notification)
│       ├── routes/                 # Cấu hình danh sách route của web
│       ├── service/                # Giao tiếp HTTP API với Backend (Axios)
│       │   ├── DashboardService.js
│       │   ├── EmailService.js
│       │   ├── FilterService.js
│       │   ├── OrderService.js
│       │   ├── PaymentService.js
│       │   ├── ProductService.js
│       │   └── UserService.js
│       └── utils/                  # Tiện ích bổ trợ (format tiền, chart, giỏ hàng)
│           ├── index.js
│           ├── common.js
│           └── localCart.js
│
└── chatbot/                        # 🤖 AI CHATBOT SERVICE (Python & Flask)
    ├── .env                        # Khóa API Gemini & kết nối MongoDB
    ├── .env.example                # Mẫu biến môi trường Chatbot
    ├── requirements.txt            # Thư viện Python cần thiết
    ├── app.py                      # Flask Server cung cấp API chatbot & RAG
    ├── training.py                 # Huấn luyện mô hình phân loại intent
    ├── intents.json                # Bộ câu hỏi & mẫu phản hồi mẫu
    ├── classes.pkl                 # Danh sách nhãn ý định
    ├── words.pkl                   # Từ điển từ vựng tiền xử lý
    ├── templates/                  # Giao diện web demo chatbot
    └── static/                     # CSS / JS của giao diện demo
```

---

## 🛠️ 3. Công nghệ sử dụng (Tech Stack)

| Hạng mục | Công nghệ |
|---|---|
| **Frontend** | React 19, Redux Toolkit, React-Query, Ant Design 5, Styled-Components, Axios, Recharts |
| **Backend** | Node.js, Express.js, MongoDB Atlas (Mongoose), JSON Web Token (JWT), Nodemailer, Cloudinary, PayPal SDK |
| **AI Chatbot** | Python 3, Flask, Google Gemini AI (Generative AI), FAISS (Vector DB), Sentence-Transformers (BERT), NLTK, TensorFlow |

---

## 🚀 4. Hướng dẫn cài đặt & Khởi chạy

### Yêu cầu tiên quyết:
- **Node.js** >= 18.x
- **Python** >= 3.10
- **MongoDB Atlas** Account

---

### Bước 1: Khởi chạy Backend (`my-backend`)
```bash
cd my-backend
npm install
npm start
```
> Server sẽ chạy tại: `http://localhost:3001`

**Cấu hình file `my-backend/.env`:**
```env
PORT=3001
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
ACCESS_TOKEN=your_jwt_access_token_secret
REFRESH_TOKEN=your_jwt_refresh_token_secret
CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
VNP_TMN_CODE=your_vnpay_terminal_code
VNP_HASH_SECRET=your_vnpay_hash_secret
VNP_RETURN_URL=http://localhost:3000/orderSuccess
MAIL_ACCOUNT=your_email@gmail.com
MAIL_PASSWORD=your_email_app_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

### Bước 2: Khởi chạy Chatbot AI (`chatbot`)
```bash
cd chatbot
pip install -r requirements.txt
python app.py
```
> Server chatbot sẽ chạy tại: `http://127.0.0.1:5000`

**Cấu hình file `chatbot/.env`:**
```env
GOOGLE_API_KEY=your_gemini_api_key
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
ACCESS_TOKEN=your_jwt_access_token_secret
FRONTEND_URL=http://localhost:3000
```

---

### Bước 3: Khởi chạy Frontend (`my-frontend`)
```bash
cd my-frontend
npm install
npm start
```
> Ứng dụng web sẽ chạy tại: `http://localhost:3000`

**Cấu hình file `my-frontend/.env`:**
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_CHATBOT_URL=http://127.0.0.1:5000
```

---

## 📡 5. Danh sách API Endpoints chính

### 👤 User APIs (`/api/user`)
- `POST /api/user/sign-up`: Đăng ký tài khoản mới
- `POST /api/user/sign-in`: Đăng nhập hệ thống (cấp Access & Refresh Token)
- `POST /api/user/log-out`: Đăng xuất
- `GET /api/user/get-details/:id`: Lấy thông tin người dùng
- `PUT /api/user/update-user/:id`: Cập nhật thông tin người dùng

### 👕 Product APIs (`/api/product`)
- `GET /api/product/get-all`: Lấy danh sách sản phẩm (hỗ trợ phân trang, sắp xếp, lọc)
- `GET /api/product/get-all-type`: Lấy danh mục tất cả loại sản phẩm
- `GET /api/product/get-details/:id`: Lấy chi tiết 1 sản phẩm
- `POST /api/product/create`: Tạo sản phẩm mới (Admin)
- `PUT /api/product/update/:id`: Cập nhật thông tin sản phẩm (Admin)
- `DELETE /api/product/delete/:id`: Xóa sản phẩm (Admin)

### 📦 Order APIs (`/api/order`)
- `POST /api/order/create`: Tạo đơn hàng mới
- `GET /api/order/get-all-order/:id`: Lấy toàn bộ đơn hàng của 1 user
- `GET /api/order/get-details-order/:id`: Lấy chi tiết đơn hàng
- `DELETE /api/order/cancel-order/:id`: Hủy đơn hàng

### 💳 Payment & Email APIs
- `GET /api/payment/config`: Cung cấp PayPal Client ID cho client
- `POST /api/email/subscribe`: Đăng ký nhận tin tức khuyến mãi qua email

### 📊 Dashboard & Filter APIs
- `GET /api/dashboard/stats`: Thống kê doanh thu, số lượng đơn hàng, người dùng
- `GET /api/filter/products`: Lọc sản phẩm theo nhiều tiêu chí nâng cao

---

## 6. Kiểm thử

```bash
cd my-backend
npm test

cd ../my-frontend
npm test -- --watchAll=false --runInBand
npm run build
```

GitHub Actions tự động chạy kiểm thử backend, frontend, build production và kiểm tra cú pháp chatbot.

## 7. Chạy bằng Docker

Tạo các file `.env` từ `.env.example`, sau đó chạy tại thư mục gốc:

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Health check: `http://localhost:3001/api/health`
- Chatbot: `http://localhost:5000`

## 8. Lưu ý bảo mật

- Không commit bất kỳ file `.env` nào.
- Giá, voucher, tồn kho và trạng thái thanh toán đều được xác minh ở backend.
- Access token của chatbot phải dùng cùng `ACCESS_TOKEN` với backend.
- Khi một secret từng xuất hiện trong Git, cần thu hồi secret cũ và xóa nó khỏi lịch sử repository trước khi công khai mã nguồn.
