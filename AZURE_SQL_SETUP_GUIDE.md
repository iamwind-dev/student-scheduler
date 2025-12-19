# 📘 HƯỚNG DẪN TẠO AZURE SQL DATABASE

## 🎯 Mục tiêu
Tạo Azure SQL Database để lưu trữ:
- Thông tin Users (sinh viên)
- Thời khóa biểu (Schedules)
- Chi tiết môn học đã chọn (ScheduleDetails)

---

## 📋 BƯỚC 1: Tạo SQL Database trên Azure Portal

### 1.1. Truy cập Azure Portal
1. Vào https://portal.azure.com
2. Đăng nhập bằng tài khoản Azure của bạn

### 1.2. Tạo SQL Database
1. Trong Azure Portal, click **"Create a resource"** (+ Create a resource)
2. Search **"SQL Database"** và chọn **SQL Database**
3. Click **"Create"**

### 1.3. Cấu hình Database

#### **Basics Tab:**

**Project Details:**
- **Subscription**: Chọn subscription của bạn
- **Resource Group**: 
  - Chọn existing hoặc tạo mới (ví dụ: `rg-student-scheduler`)

**Database Details:**
- **Database name**: `student-scheduler-db`
- **Server**: Click **"Create new"**

#### **Tạo SQL Server mới:**
```
Server name: student-scheduler-server (hoặc tên bạn muốn)
Location: East Asia (hoặc gần bạn nhất)
Authentication method: Use SQL authentication
Server admin login: sqladmin
Password: [Tạo password mạnh - ít nhất 8 ký tự]
Confirm password: [Nhập lại password]
```
✅ Click **OK**

**Compute + Storage:**
- Click **"Configure database"**
- Chọn **"Basic"** hoặc **"Standard"** (để tiết kiệm chi phí)
  - Basic: 5 DTUs (~$5/tháng)
  - Standard S0: 10 DTUs (~$15/tháng)
- Click **Apply**

**Backup storage redundancy:**
- Chọn **"Locally-redundant backup storage"** (rẻ nhất)

---

## 📋 BƯỚC 2: Cấu hình Firewall

1. Sau khi tạo database xong, vào **SQL Server** (không phải database)
2. Trong menu bên trái, chọn **"Networking"** (hoặc "Firewalls and virtual networks")
3. Trong **Firewall rules**:
   
   ✅ **Quan trọng**: Bật **"Allow Azure services and resources to access this server"** = YES

4. Thêm IP máy tính của bạn:
   ```
   Rule name: MyComputer
   Start IP: [IP máy bạn]
   End IP: [IP máy bạn]
   ```
   
   💡 Tip: Azure sẽ tự detect IP của bạn, click **"Add your client IPv4 address"**

5. (Optional) Cho phép tất cả IP để test:
   ```
   Rule name: AllowAll
   Start IP: 0.0.0.0
   End IP: 255.255.255.255
   ```
   ⚠️ **Chú ý**: Chỉ dùng cho môi trường dev/test!

6. Click **Save**

---

## 📋 BƯỚC 3: Lấy Connection String

1. Vào **SQL Database** (student-scheduler-db)
2. Trong menu bên trái, chọn **"Connection strings"**
3. Copy **ADO.NET (SQL authentication)** connection string:

```
Server=tcp:student-scheduler-server.database.windows.net,1433;Initial Catalog=student-scheduler-db;Persist Security Info=False;User ID=sqladmin;Password={your_password};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

4. Thay `{your_password}` bằng password thật của bạn

---

## 📋 BƯỚC 4: Tạo Tables trong Database

### 4.1. Sử dụng Query Editor trên Azure Portal

1. Vào **SQL Database** (student-scheduler-db)
2. Chọn **"Query editor"** trong menu bên trái
3. Đăng nhập:
   - **Login**: `sqladmin`
   - **Password**: [password bạn đã tạo]

### 4.2. Chạy các lệnh SQL sau:

#### **Table 1: Users**
```sql
CREATE TABLE Users (
    UserId NVARCHAR(100) PRIMARY KEY,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    Name NVARCHAR(255),
    Role NVARCHAR(50) DEFAULT 'Student',
    CreatedAt DATETIME DEFAULT GETDATE(),
    LastLoginAt DATETIME DEFAULT GETDATE()
);
```

#### **Table 2: Schedules**
```sql
CREATE TABLE Schedules (
    ScheduleId INT IDENTITY(1,1) PRIMARY KEY,
    UserId NVARCHAR(100) NOT NULL,
    CoursesData NVARCHAR(MAX) NOT NULL,
    TotalCredits INT,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);
```

#### **Table 3: ScheduleDetails**
```sql
CREATE TABLE ScheduleDetails (
    DetailId INT IDENTITY(1,1) PRIMARY KEY,
    UserId NVARCHAR(100) NOT NULL,
    CourseId INT NOT NULL,
    CourseName NVARCHAR(500),
    CourseCode NVARCHAR(50),
    Credits INT,
    Lecturer NVARCHAR(255),
    Time NVARCHAR(100),
    Room NVARCHAR(100),
    Weeks NVARCHAR(100),
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);
```

#### **Table 4: Courses (nếu chưa có)**
```sql
-- Kiểm tra xem table Courses đã tồn tại chưa
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Courses' AND xtype='U')
BEGIN
    CREATE TABLE Courses (
        ID INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(500),
        Credits INT DEFAULT 2,
        Lecturer NVARCHAR(255),
        Time NVARCHAR(100),
        Room NVARCHAR(100),
        Weeks NVARCHAR(100),
        Quantity INT DEFAULT 0
    );
END
```

---

## 📋 BƯỚC 5: Cập nhật Connection String trong Code

### 5.1. Cập nhật file `.env` trong API project

Tạo/sửa file `/home/phanhoailang/LangPhan/Azure/final_project/student-scheduler-api/.env`:

```env
# Azure SQL Database Configuration
DB_USER=sqladmin
DB_PASSWORD=YourPasswordHere
DB_SERVER=student-scheduler-server.database.windows.net
DB_DATABASE=student-scheduler-db
DB_PORT=1433

# API Configuration
PORT=7071
NODE_ENV=development
```

### 5.2. Kiểm tra file `server.js`

Đảm bảo config trong file `server.js` đúng:

```javascript
const dbConfig = {
    user: process.env.DB_USER || 'sqladmin',
    password: process.env.DB_PASSWORD || 'YourPasswordHere',
    server: process.env.DB_SERVER || 'student-scheduler-server.database.windows.net',
    database: process.env.DB_DATABASE || 'student-scheduler-db',
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: true,
        trustServerCertificate: false,
        enableArithAbort: true
    }
};
```

---

## 📋 BƯỚC 6: Test Connection

### 6.1. Restart API Server

```bash
cd /home/phanhoailang/LangPhan/Azure/fe/student-scheduler
bash stop-all.sh
sleep 2
bash start-all.sh
```

### 6.2. Kiểm tra logs

Trong terminal, bạn sẽ thấy:
```
✅ Connected to Azure SQL Database
[API] Loaded XXX courses from Azure SQL
```

### 6.3. Test bằng browser

1. Truy cập: http://localhost:7071/api/health
2. Kết quả:
```json
{
  "status": "OK",
  "database": "Connected",
  "timestamp": "2025-12-19T00:49:00.000Z"
}
```

---

## 📋 BƯỚC 7: Test Lưu Thời Khóa Biểu

1. Vào frontend: http://localhost:5173
2. Login (sẽ tự động login với demo user)
3. Vào **"Thời khóa biểu"**
4. Chọn môn học (hoặc click "AI gợi ý")
5. Click **"💾 Lưu lịch"**
6. Bạn sẽ thấy thông báo thành công với chi tiết môn học đã lưu

---

## 🔍 BƯỚC 8: Kiểm tra dữ liệu trong Database

### 8.1. Sử dụng Query Editor

1. Vào Azure Portal > SQL Database > Query editor
2. Chạy các query sau:

```sql
-- Xem users đã lưu
SELECT * FROM Users;

-- Xem schedules summary
SELECT * FROM Schedules;

-- Xem chi tiết môn học từng user
SELECT 
    u.Name as UserName,
    sd.CourseName,
    sd.Lecturer,
    sd.Credits,
    sd.Time,
    sd.Room
FROM ScheduleDetails sd
JOIN Users u ON sd.UserId = u.UserId
ORDER BY u.Name, sd.CourseName;

-- Đếm số môn của mỗi user
SELECT 
    u.Name,
    u.Email,
    COUNT(sd.DetailId) as TotalCourses,
    SUM(sd.Credits) as TotalCredits
FROM Users u
LEFT JOIN ScheduleDetails sd ON u.UserId = sd.UserId
GROUP BY u.Name, u.Email;
```

---

## 📊 Database Schema Diagram

```
┌─────────────────┐
│     Users       │
├─────────────────┤
│ UserId (PK)     │────┐
│ Email           │    │
│ Name            │    │
│ Role            │    │
│ CreatedAt       │    │
│ LastLoginAt     │    │
└─────────────────┘    │
                       │
                       │ FK
    ┌──────────────────┼──────────────────┐
    │                  │                  │
    ▼                  ▼                  │
┌─────────────────┐ ┌──────────────────┐ │
│   Schedules     │ │ ScheduleDetails  │ │
├─────────────────┤ ├──────────────────┤ │
│ ScheduleId (PK) │ │ DetailId (PK)    │ │
│ UserId (FK)     │ │ UserId (FK)      │─┘
│ CoursesData     │ │ CourseId         │
│ TotalCredits    │ │ CourseName       │
│ CreatedAt       │ │ Lecturer         │
│ UpdatedAt       │ │ Credits          │
└─────────────────┘ │ Time             │
                    │ Room             │
                    │ Weeks            │
                    └──────────────────┘
```

---

## 💰 Chi phí ước tính

### Basic Tier (Recommended cho Dev/Test):
- 5 DTUs
- 2GB storage
- **~$5 USD/tháng**

### Standard S0:
- 10 DTUs  
- 250GB storage
- **~$15 USD/tháng**

### Free Tier:
- Tài khoản Azure mới có **$200 credit** sử dụng trong 30 ngày đầu
- Hoặc dùng Azure for Students ($100 credit)

---

## 🐛 Troubleshooting

### Lỗi: "Cannot open server"
✅ **Giải pháp**: Kiểm tra Firewall rules, thêm IP của bạn

### Lỗi: "Login failed for user"
✅ **Giải pháp**: Kiểm tra username/password trong connection string

### Lỗi: "Timeout"
✅ **Giải pháp**: 
- Kiểm tra server name đúng chưa
- Enable "Allow Azure services" trong Firewall

### Database không kết nối được
✅ **Giải pháp**:
```bash
# Test connection bằng code
cd /home/phanhoailang/LangPhan/Azure/final_project/student-scheduler-api
node -e "
const sql = require('mssql');
const config = {
  user: 'sqladmin',
  password: 'YourPassword',
  server: 'student-scheduler-server.database.windows.net',
  database: 'student-scheduler-db',
  options: { encrypt: true }
};
sql.connect(config).then(() => console.log('✅ Connected!')).catch(err => console.error('❌', err));
"
```

---

## 📞 Support

- Azure Documentation: https://docs.microsoft.com/azure/sql-database
- Stack Overflow: https://stackoverflow.com/questions/tagged/azure-sql-database

---

## ✅ Checklist

- [ ] Tạo SQL Server trên Azure
- [ ] Tạo SQL Database
- [ ] Cấu hình Firewall rules
- [ ] Tạo các tables (Users, Schedules, ScheduleDetails)
- [ ] Cập nhật .env file với connection string
- [ ] Test connection từ API
- [ ] Test lưu thời khóa biểu từ frontend
- [ ] Kiểm tra dữ liệu trong database

---

**🎉 Chúc bạn setup thành công!**
