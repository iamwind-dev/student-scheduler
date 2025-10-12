# Student Scheduler - Website Gợi ý Thời gian biểu cho Sinh viên

Đề tài: **Triển khai mô hình Cloud Computing trên Azure**

## 📋 Mô tả dự án

Hệ thống gợi ý thời gian biểu thông minh cho sinh viên, triển khai trên nền tảng Azure Cloud Computing.

### Công nghệ sử dụng

**Frontend:**
- React 19.1.1
- Vite 7.1.7
- CSS3

**Backend:**
- Azure Functions (Node.js)
- Azure Functions Core Tools v4

## 🚀 Hướng dẫn cài đặt và chạy

### Yêu cầu hệ thống

- Node.js 18+ 
- npm hoặc yarn
- Azure Functions Core Tools (`npm install -g azure-functions-core-tools@4`)

### Cài đặt Frontend

```bash
cd frontend
npm install
```

### Cài đặt Backend

```bash
cd api
npm install
```

## ▶️ Chạy ứng dụng

### 1. Chạy Backend (Azure Functions)

Mở terminal tại thư mục `api`:

```bash
cd api
npm start
# hoặc
func start
```

Backend sẽ chạy tại: `http://localhost:7071`

Các API endpoints:
- `GET http://localhost:7071/api/courses?semester=2025A` - Lấy danh sách môn học
- `POST http://localhost:7071/api/preferences` - Lưu ràng buộc sinh viên
- `POST http://localhost:7071/api/recommend` - Tạo gợi ý thời gian biểu

### 2. Chạy Frontend (React + Vite)

Mở terminal mới tại thư mục `frontend`:

```bash
cd frontend
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

> **Lưu ý:** Vite đã được cấu hình proxy để chuyển tiếp các request `/api/*` tới `http://localhost:7071`

## 📱 Các tính năng

### 1. Trang Login (`/`)
- Đăng nhập giả lập bằng mã số sinh viên
- Sau này sẽ tích hợp Microsoft Entra ID

### 2. Trang Danh sách môn học
- Hiển thị các môn học theo học kỳ
- Xem thông tin chi tiết: mã môn, tên, giảng viên, lớp học, thời gian

### 3. Trang Thiết lập ràng buộc
- Nhập số tín chỉ tối đa
- Chọn khu vực học (Cơ sở A/B/Tất cả)
- Chọn thời gian rảnh (không muốn học)
- Các ràng buộc khác: tránh học sáng sớm, tránh học tối muộn

### 4. Trang Gợi ý thời gian biểu
- Tạo nhiều phương án TKB khác nhau
- Xem dạng danh sách hoặc dạng bảng
- Thống kê tổng số tín chỉ và môn học

## 📂 Cấu trúc dự án

```
student-scheduler/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Login.css
│   │   │   ├── Courses.jsx
│   │   │   ├── Courses.css
│   │   │   ├── Preferences.jsx
│   │   │   ├── Preferences.css
│   │   │   ├── Recommend.jsx
│   │   │   └── Recommend.css
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── api/
│   ├── src/
│   │   └── functions/
│   │       ├── courses.js
│   │       ├── preferences.js
│   │       └── recommend.js
│   ├── host.json
│   ├── local.settings.json
│   └── package.json
└── README.md
```

## 🔧 API Documentation

### GET /api/courses
Lấy danh sách môn học theo học kỳ

**Query Parameters:**
- `semester` (string): Mã học kỳ (ví dụ: "2025A")

**Response:**
```json
[
  {
    "id": 1,
    "code": "CS101",
    "name": "Lập trình căn bản",
    "semester": "2025A",
    "credits": 3,
    "lecturer": "TS. Nguyễn Văn A",
    "slots": [
      {
        "day": "Thứ 2",
        "time": "Sáng (7h-11h)",
        "room": "A101",
        "campus": "Cơ sở A"
      }
    ]
  }
]
```

### POST /api/preferences
Lưu ràng buộc của sinh viên

**Request Body:**
```json
{
  "studentId": "SV001",
  "preferences": {
    "maxCredits": 18,
    "freeTime": ["Thứ 2 - Sáng (7h-11h)"],
    "campus": "all",
    "avoidMorning": false,
    "avoidEvening": false
  }
}
```

**Response:**
```json
{
  "message": "Preferences saved successfully",
  "studentId": "SV001",
  "prefs": { ... },
  "savedAt": "2025-10-12T10:30:00.000Z"
}
```

### POST /api/recommend
Tạo gợi ý thời gian biểu

**Request Body:**
```json
{
  "studentId": "SV001",
  "preferences": { ... }
}
```

**Response:**
```json
{
  "message": "Schedule recommendations generated successfully",
  "studentId": "SV001",
  "recommendations": [
    {
      "totalCredits": 15,
      "courses": [
        {
          "courseCode": "CS101",
          "courseName": "Lập trình căn bản",
          "slot": {
            "day": "Thứ 2",
            "time": "Sáng (7h-11h)",
            "room": "A101",
            "campus": "Cơ sở A"
          }
        }
      ]
    }
  ],
  "generatedAt": "2025-10-12T10:30:00.000Z"
}
```

## 🎯 Các bước phát triển tiếp theo

1. ✅ Hoàn thành giao diện cơ bản
2. ✅ Tạo các API endpoints
3. ⏳ Tích hợp Microsoft Entra ID để xác thực
4. ⏳ Kết nối Azure Cosmos DB để lưu trữ dữ liệu
5. ⏳ Triển khai thuật toán gợi ý TKB thông minh
6. ⏳ Deploy lên Azure App Service / Azure Static Web Apps
7. ⏳ Tối ưu hóa hiệu suất và bảo mật

## 📝 Ghi chú

- Hiện tại đang sử dụng dữ liệu demo, chưa kết nối database
- Đăng nhập đang ở chế độ giả lập
- Thuật toán gợi ý TKB đang trả về dữ liệu demo

## 👥 Tác giả

[Tên sinh viên - MSSV]

## 📄 License

Đề tài nghiên cứu - Không sử dụng cho mục đích thương mại
