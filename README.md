# Student Scheduler - Hệ thống Gợi ý Thời khóa biểu Thông minh

> Đề tài: **Triển khai mô hình Cloud Computing trên Azure**

## 📋 Mô tả dự án

Hệ thống gợi ý thời khóa biểu thông minh cho sinh viên, triển khai trên nền tảng Azure Cloud Computing với kiến trúc hiện đại và khả năng mở rộng cao.

### 🚀 Công nghệ sử dụng

**Frontend:**
- React 19.1.1
- React Router v7.9.4
- Vite 7.1.7
- Microsoft MSAL (Authentication)
- CSS3 với CSS Variables

**Backend:**
- Azure Functions (Node.js 20)
- Azure Functions Core Tools v4
- Azure SQL Database
- Microsoft Entra ID (Authentication)

**Cloud Services:**
- Azure App Service / Static Web Apps
- Azure Functions (Serverless)
- Azure SQL Database
- Microsoft Entra ID

---

## 📁 Cấu trúc Project

### Backend (API)
```
api/
├── src/
│   ├── functions/              # Azure Functions endpoints
│   │   ├── auth/              # Authentication
│   │   ├── courses/           # Course management
│   │   ├── preferences/       # User preferences
│   │   ├── recommend/         # Schedule recommendations
│   │   └── schedules/         # Schedule management
│   ├── services/              # Business logic
│   │   ├── auth-service.js
│   │   ├── course-service.js
│   │   ├── database-service.js
│   │   └── user-service.js
│   ├── utils/                 # Utilities
│   │   ├── logger.js
│   │   ├── response-helper.js
│   │   └── validation-helper.js
│   └── database.js            # Database connection
├── host.json
└── local.settings.json
```

### Frontend
```
frontend/
├── src/
│   ├── pages/                 # Page components
│   │   ├── auth/             # Login pages
│   │   ├── dashboard/        # Dashboard
│   │   ├── courses/          # Course management
│   │   ├── preferences/      # User preferences
│   │   ├── schedule/         # Schedule views
│   │   └── profile/          # User profile
│   ├── components/           # Reusable components
│   │   ├── common/          # Generic components
│   │   ├── layout/          # Layout components
│   │   └── auth/            # Auth components
│   ├── contexts/            # React Context
│   │   ├── AuthContext.jsx
│   │   └── AppContext.jsx
│   ├── hooks/               # Custom hooks
│   │   └── useCourses.js
│   ├── services/            # API services
│   │   └── api/
│   └── styles/              # Global styles
├── index.html
└── vite.config.js
```

### Database
```
database/
├── AZURE_SQL_SETUP.md        # Setup guide
├── schema-new.sql            # Database schema
├── import-new-data.js        # Data import script
└── output_fixed.json         # Sample data
```

---

## 🚀 Hướng dẫn Cài đặt và Chạy

### Yêu cầu hệ thống

- Node.js 18+
- npm hoặc yarn
- Azure Functions Core Tools: `npm install -g azure-functions-core-tools@4`

### 1. Cài đặt Dependencies

```bash
# Backend
cd api
npm install

# Frontend
cd frontend
npm install
```

### 2. Cấu hình Environment Variables

**Frontend** - Tạo file `frontend/.env.local`:
```env
VITE_ENTRA_CLIENT_ID=your-client-id
VITE_ENTRA_TENANT_ID=your-tenant-id
VITE_REDIRECT_URI=http://localhost:5173
VITE_API_URL=http://localhost:7071/api
```

**Backend** - Cập nhật file `api/local.settings.json`:
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "SQL_SERVER": "your-server.database.windows.net",
    "SQL_DATABASE": "student-scheduler-db",
    "SQL_USERNAME": "sqladmin",
    "SQL_PASSWORD": "your-password"
  }
}
```

### 3. Chạy ứng dụng

**Terminal 1 - Backend:**
```bash
cd api
npm start
# hoặc: func start
```
Backend chạy tại: `http://localhost:7071`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend chạy tại: `http://localhost:5173`

---

## 📱 Tính năng

### ✅ Đã hoàn thành
- ✅ Xác thực với Microsoft Entra ID
- ✅ Quản lý danh sách môn học
- ✅ Hiển thị thông tin chi tiết môn học
- ✅ Responsive design (Mobile, Tablet, Desktop)
- ✅ Error handling & Loading states
- ✅ Kết nối Azure SQL Database

### 🚧 Đang phát triển
- ⏳ Thiết lập ràng buộc (Preferences)
- ⏳ Thuật toán gợi ý thời khóa biểu
- ⏳ Lưu và quản lý nhiều phương án TKB
- ⏳ Export TKB ra PDF/Excel
- ⏳ Thông báo & Reminders

---

## 🔐 Setup Microsoft Entra ID (Azure AD)

### Bước 1: Tạo App Registration
1. Vào https://portal.azure.com
2. Tìm **Microsoft Entra ID** → **App registrations** → **New registration**
3. Điền thông tin:
   - **Name**: Student Scheduler
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: 
     - Platform: Single-page application (SPA)
     - URI: `http://localhost:5173`

### Bước 2: Lấy Client ID & Tenant ID
- **Application (client) ID** → Copy vào `VITE_ENTRA_CLIENT_ID`
- **Directory (tenant) ID** → Copy vào `VITE_ENTRA_TENANT_ID`

### Bước 3: Thêm API Permissions
1. Vào **API permissions** → **Add a permission**
2. Chọn **Microsoft Graph** → **Delegated permissions**
3. Chọn: `User.Read`, `profile`, `openid`, `email`
4. Click **Grant admin consent**

### Bước 4: Test Login
```bash
cd frontend
npm run dev
```
Truy cập http://localhost:5173 và thử đăng nhập với Microsoft Account

---

## 🗄️ Setup Azure SQL Database

### Bước 1: Tạo Database
1. Vào https://portal.azure.com
2. Tìm **SQL databases** → **Create**
3. Điền thông tin:
   - **Database name**: student-scheduler-db
   - **Server**: Tạo mới server
   - **Server name**: student-scheduler-server
   - **Admin login**: sqladmin
   - **Password**: [Mật khẩu mạnh]
   - **Location**: Southeast Asia
   - **Service tier**: Basic (5 DTU, 2GB)

### Bước 2: Cấu hình Firewall
1. Vào **SQL servers** → **student-scheduler-server**
2. Chọn **Networking** → **Firewall rules**
3. ✅ Allow Azure services and resources to access this server
4. ✅ Add current client IP address

### Bước 3: Import Data
```bash
cd database
node import-new-data.js
```

### Bước 4: Test Connection
```bash
cd api
npm start
curl http://localhost:7071/api/courses
```

---

## 🚀 Deploy lên Azure

### Deploy Frontend (Azure Static Web Apps)

```bash
# Build frontend
cd frontend
npm run build

# Deploy với Azure CLI
az login
az staticwebapp create \
  --name student-scheduler \
  --resource-group student-scheduler-rg \
  --source ./dist \
  --location "Southeast Asia" \
  --branch main \
  --app-location "/frontend" \
  --output-location "dist"
```

### Deploy Backend (Azure Functions)

```bash
# Deploy functions
cd api
func azure functionapp publish student-scheduler-api

# Cấu hình CORS
az functionapp cors add \
  --resource-group student-scheduler-rg \
  --name student-scheduler-api \
  --allowed-origins "https://your-app.azurestaticapps.net"
```

### Cấu hình Production Environment

**Frontend - Add to Static Web App Configuration:**
```
VITE_ENTRA_CLIENT_ID=your-client-id
VITE_ENTRA_TENANT_ID=your-tenant-id
VITE_REDIRECT_URI=https://your-app.azurestaticapps.net
VITE_API_URL=https://student-scheduler-api.azurewebsites.net
```

**Backend - Add to Function App Settings:**
```
SQL_SERVER=your-server.database.windows.net
SQL_DATABASE=student-scheduler-db
SQL_USERNAME=sqladmin
SQL_PASSWORD=your-password
```

---

## 🔧 API Documentation

### Authentication

#### POST /api/auth/login
Microsoft authentication endpoint

**Request:**
```json
{
  "token": "microsoft-access-token"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### Courses

#### GET /api/courses
Lấy danh sách môn học

**Query Parameters:**
- `semester` (string): Mã học kỳ (ví dụ: "2025A")

**Response:**
```json
[
  {
    "id": 1,
    "name": "Lập trình căn bản",
    "credits": 3,
    "lecturer": "TS. Nguyễn Văn A",
    "time": "Thứ 2 | Tiết 1->3",
    "room": "A.101",
    "weeks": "1->16"
  }
]
```

### Preferences

#### POST /api/preferences
Lưu ràng buộc sinh viên

**Request:**
```json
{
  "studentId": "SV001",
  "maxCredits": 18,
  "campus": "all",
  "freeTime": ["Thứ 2 - Sáng"],
  "avoidMorning": false,
  "avoidEvening": false
}
```

### Recommendations

#### POST /api/recommend
Tạo gợi ý thời khóa biểu

**Request:**
```json
{
  "studentId": "SV001",
  "preferences": { ... }
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "totalCredits": 15,
      "courses": [...]
    }
  ]
}
```

---

## 🧪 Testing

### Test Frontend
```bash
cd frontend
npm run test
```

### Test Backend
```bash
cd api
npm run test
```

### Test API với curl
```bash
# Get courses
curl http://localhost:7071/api/courses?semester=2025A

# Post preferences
curl -X POST http://localhost:7071/api/preferences \
  -H "Content-Type: application/json" \
  -d '{"studentId":"SV001","maxCredits":18}'
```

---

## 🐛 Troubleshooting

### Lỗi: Port already in use
```bash
# Tìm và kill process
lsof -i :7071  # hoặc :5173
kill -9 <PID>
```

### Lỗi: Cannot connect to database
- ✅ Kiểm tra credentials trong `local.settings.json`
- ✅ Kiểm tra firewall rules trong Azure Portal
- ✅ Kiểm tra database online status

### Lỗi: Microsoft login failed
- ✅ Kiểm tra Client ID & Tenant ID đúng
- ✅ Kiểm tra Redirect URI trong Azure Portal
- ✅ Clear browser cache: `localStorage.clear()`

### Lỗi: CORS issues
- ✅ Kiểm tra CORS configuration trong Azure Functions
- ✅ Kiểm tra API URL trong frontend .env

---

## 📚 Tài liệu tham khảo

- [Azure Functions Documentation](https://learn.microsoft.com/en-us/azure/azure-functions/)
- [React Documentation](https://react.dev/)
- [Microsoft Entra ID (Azure AD)](https://learn.microsoft.com/en-us/azure/active-directory/)
- [Azure SQL Database](https://learn.microsoft.com/en-us/azure/azure-sql/)
- [Vite Documentation](https://vitejs.dev/)

---

## 📊 Chi phí ước tính (Azure)

| Service | Tier | Cost/Month |
|---------|------|------------|
| Azure Static Web Apps | Free | $0 |
| Azure Functions | Consumption | ~$0-5 |
| Azure SQL Database | Basic (5 DTU) | ~$5 |
| Microsoft Entra ID | Free | $0 |
| **TOTAL** | | **~$5-10/month** |

---

## 👥 Team

- **Developer**: [Tên của bạn]
- **MSSV**: [Mã số sinh viên]
- **Institution**: [Tên trường]

---

## 📄 License

Đề tài nghiên cứu - Không sử dụng cho mục đích thương mại

---

## 📞 Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra phần **Troubleshooting** ở trên
2. Xem logs trong Azure Portal
3. Kiểm tra browser console (F12)
4. Tạo issue trên GitHub repository
