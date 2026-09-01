# Study Note Hub

Study Note Hub là ứng dụng quản lý học tập cá nhân, giúp sinh viên lưu trữ ghi chú, theo dõi thời khóa biểu, tạo và làm đề ôn luyện, đồng thời tùy chỉnh giao diện và thay đổi mật khẩu tài khoản.

Dự án gồm 2 phần chính:
- Frontend: React + React Router + Axios
- Backend: Node.js + Express + MongoDB + Mongoose

---

## 1. Tổng quan dự án

Ứng dụng cung cấp các tính năng chính sau:

- Đăng ký / đăng nhập / xác thực người dùng bằng JWT
- Ghi chú học tập: tạo, sửa, xóa, ghim, tìm kiếm
- Lịch học: thêm, sửa, xóa môn học theo ngày và buổi học
- Đề ôn luyện: tạo bộ câu hỏi, sửa, xóa, làm bài trắc nghiệm
- Cài đặt: đổi mật khẩu và chuyển tối / sáng giao diện
- Quản lý dữ liệu người dùng theo từng tài khoản riêng biệt

---

## 2. Công nghệ sử dụng

### Frontend
- React 18
- React Router DOM
- Axios
- React Hot Toast
- React Icons
- react-scripts

### Backend
- Node.js
- Express.js
- MongoDB Atlas / MongoDB local
- Mongoose
- JWT
- bcryptjs
- express-validator
- dotenv
- CORS

---

## 3. Cấu trúc thư mục

```text
student-app/
├─ backend/
│  ├─ middleware/
│  │  └─ auth.js
│  ├─ models/
│  │  ├─ User.js
│  │  ├─ Note.js
│  │  ├─ Schedule.js
│  │  ├─ QuestionSet.js
│  │  └─ StudyRecord.js
│  ├─ routes/
│  │  ├─ auth.js
│  │  ├─ notes.js
│  │  ├─ schedules.js
│  │  ├─ questionSets.js
│  │  └─ studyRecords.js
│  ├─ .env.example (nếu có thêm sau khi cấu hình)
│  ├─ package.json
│  └─ server.js
│
├─ frontend/
│  ├─ public/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ context/
│  │  ├─ styles/
│  │  ├─ App.js
│  │  ├─ index.js
│  │  └─ index.css
│  ├─ package.json
│  └─ public/
│
├─ .gitignore
├─ README.md
└─ package-lock.json (nếu có)
```

---

## 4. Yêu cầu môi trường

Trước khi chạy dự án, hãy đảm bảo máy bạn đã cài:

- Node.js >= 18
- npm hoặc yarn
- MongoDB local đang chạy hoặc MongoDB Atlas được cấu hình sẵn
- Git (nếu clone từ repository)

Nếu bạn chưa cài MongoDB, bạn có thể cài MongoDB Community Server hoặc dùng MongoDB Atlas.

---

## 5. Cài đặt dự án

### Bước 1: Clone repository

```bash
git clone <repo-url>
cd student-app
```

### Bước 2: Cài đặt dependencies cho Backend

```bash
cd backend
npm install
```

### Bước 3: Cài đặt dependencies cho Frontend

```bash
cd ../frontend
npm install
```

---

## 6. Cấu hình biến môi trường

### Backend
Tạo file `.env` trong thư mục `backend`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/study_note_hub
JWT_SECRET=your_super_secret_key_here
```

Giải thích:
- `PORT`: cổng chạy API backend
- `MONGODB_URI`: đường dẫn MongoDB
- `JWT_SECRET`: khóa bí mật để ký JWT

> Nếu không tạo `.env`, backend sẽ dùng mặc định:
> - `PORT=5000`
> - `MONGODB_URI=mongodb://localhost:27017/study_note_hub`
> - `JWT_SECRET=your-secret-key`

### Frontend
Tạo file `.env` trong thư mục `frontend`:

```env
REACT_APP_API_URL=http://localhost:5000
```

Dòng này giúp frontend biết địa chỉ backend để gọi API.

---

## 7. Chạy dự án

### Chạy backend

```bash
cd backend
npm run dev
```

Hoặc chạy production:

```bash
cd backend
npm start
```

Backend sẽ khởi động tại:

```text
http://localhost:5000
```

Bạn sẽ thấy log tương tự:

```text
✅ MongoDB connected successfully
🚀 Server running on port 5000
📍 http://localhost:5000
```

### Chạy frontend

Mở terminal mới:

```bash
cd frontend
npm start
```

Frontend sẽ chạy ở:

```text
http://localhost:3000
```

---

## 8. Luồng hoạt động của ứng dụng

### 8.1 Đăng ký và đăng nhập
- Người dùng truy cập giao diện đăng nhập / đăng ký
- Frontend gửi request đến API `/api/auth/login` hoặc `/api/auth/register`
- Backend kiểm tra dữ liệu, hash mật khẩu bằng bcrypt, sinh JWT
- JWT được lưu ở `localStorage` và được dùng cho các request sau này

### 8.2 Quản lý ghi chú
- Giao diện Trang chủ cho phép:
  - Tạo ghi chú mới
  - Chỉnh sửa ghi chú
  - Xóa ghi chú
  - Ghim ghi chú lên đầu
  - Tìm kiếm theo tiêu đề hoặc nội dung
- Các API liên quan:
  - `GET /api/notes`
  - `POST /api/notes`
  - `PUT /api/notes/:id`
  - `DELETE /api/notes/:id`

### 8.3 Lịch học
- Người dùng có thể thêm môn học theo:
  - Ngày trong tuần
  - Buổi học: sáng / chiều / tối
  - Giờ bắt đầu / kết thúc
  - Phòng học
  - Màu hiển thị
- Các API liên quan:
  - `GET /api/schedules`
  - `POST /api/schedules`
  - `PUT /api/schedules/:id`
  - `DELETE /api/schedules/:id`

### 8.4 Đề ôn luyện
- Người dùng tạo bộ câu hỏi với tối đa 80 câu
- Mỗi câu hỏi gồm:
  - Nội dung câu hỏi
  - 4 lựa chọn
  - Đáp án đúng
- Có chức năng làm bài trắc nghiệm và xem lại kết quả
- API liên quan:
  - `GET /api/questionsets`
  - `POST /api/questionsets`
  - `PUT /api/questionsets/:id`
  - `DELETE /api/questionsets/:id`

### 8.5 Cài đặt tài khoản
- Đổi mật khẩu
- Chuyển giao diện sáng / tối
- API liên quan:
  - `PUT /api/auth/password`
  - `PUT /api/auth/theme`

---

## 9. API chính của backend

### Auth
```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
PUT /api/auth/theme
PUT /api/auth/password
```

### Notes
```http
GET /api/notes
GET /api/notes/:id
POST /api/notes
PUT /api/notes/:id
DELETE /api/notes/:id
PUT /api/notes/:id/pin
```

### Schedules
```http
GET /api/schedules
POST /api/schedules
PUT /api/schedules/:id
DELETE /api/schedules/:id
```

### Question Sets
```http
GET /api/questionsets
GET /api/questionsets/:id
POST /api/questionsets
PUT /api/questionsets/:id
DELETE /api/questionsets/:id
```

### Study Records
```http
GET /api/studyrecords
GET /api/studyrecords/set/:questionSetId
GET /api/studyrecords/stats/:questionSetId
POST /api/studyrecords
DELETE /api/studyrecords/:id
```

> Tất cả API trừ `register` và `login` đều yêu cầu xác thực bằng JWT trong header Authorization.

---

## 10. Cách dùng ứng dụng

### Đăng ký tài khoản
1. Vào `http://localhost:3000/register`
2. Nhập username, email, password
3. Xác nhận mật khẩu
4. Đăng ký thành công và tự động đăng nhập

### Đăng nhập
1. Vào `http://localhost:3000/login`
2. Nhập username và password
3. Hệ thống sẽ lưu token vào localStorage

### Ghi chú học tập
- Chọn nút “Tạo ghi chú”
- Nhập tiêu đề và nội dung
- Save / cập nhật
- Có thể ghim hoặc xóa ghi chú

### Lịch học
- Chọn tab “Lịch học”
- Click vào ô lịch tương ứng để tạo hoặc chỉnh sửa môn học
- Có thể chọn màu, phòng học, giờ, buổi học

### Đề ôn luyện
- Chọn tab “Ôn tập”
- Tạo đề mới
- Thêm câu hỏi, đáp án, chọn đáp án đúng
- Bắt đầu làm bài và xem lại kết quả

### Cài đặt
- Chuyển giao diện sáng / tối
- Đổi mật khẩu bằng form bên trong tab Cài đặt

---

## 11. Xử lý lỗi thường gặp

### 1) Không kết nối được MongoDB
Kiểm tra:
- MongoDB đang chạy
- Chuỗi `MONGODB_URI` đúng
- Nếu dùng MongoDB local thì đảm bảo `mongod` đã được bật

### 2) Frontend không gọi được backend
Kiểm tra:
- `frontend/.env` có `REACT_APP_API_URL=http://localhost:5000`
- Backend đang chạy trên port 5000
- Không bị lỗi CORS

### 3) Token không hợp lệ
Kiểm tra:
- `JWT_SECRET` ở backend có khớp với các request
- Token còn sống trong localStorage
- Header Authorization phải đúng format:

```http
Authorization: Bearer <token>
```

### 4) Lỗi 404 hoặc route không tồn tại
- Kiểm tra URL và route backend
- Đảm bảo backend đã chạy và route đúng tên `/api/...`

### 5) Mật khẩu không đổi / đăng nhập lỗi
- Kiểm tra database user
- Kiểm tra `bcrypt` hash và `comparePassword`
- Kiểm tra `JWT_SECRET`

---

## 12. Mẹo phát triển

- Khi đang phát triển, nên chạy backend và frontend trên 2 terminal riêng
- Dùng `npm run dev` ở backend để auto-reload khi có thay đổi
- Dùng `npm start` ở frontend để auto-reload React
- Nên tạo `.env` riêng cho từng môi trường (local, dev, prod)

---

## 13. Gợi ý nâng cấp trong tương lai

- Thêm chức năng lưu trữ cloud bằng MongoDB Atlas
- Tạo Dashboard thống kê học tập theo tuần / tháng
- Thêm timer Pomodoro thực tế
- Quản lý bài tập và deadline theo To-do List
- Tích hợp export/import dữ liệu người dùng
- Tạo phần mềm mobile hoặc PWA

---

## 14. Kết luận

Study Note Hub là một project quản lý học tập toàn diện với các module chính như ghi chú, lịch học và ôn tập. Dự án này phù hợp để học về:

- React frontend
- Express API
- JWT authentication
- MongoDB + Mongoose
- Phân tách dữ liệu theo user
- Xây dựng ứng dụng học tập thực tế

Nếu bạn muốn, tôi có thể tiếp tục hỗ trợ bạn với một trong các bước sau:
1. Viết file `.env.example` cho backend và frontend
2. Tạo script khởi động nhanh cho cả frontend và backend
3. Cải thiện README theo kiểu chuyên nghiệp hơn cho GitHub
4. Giải thích từng file code trong dự án chi tiết
