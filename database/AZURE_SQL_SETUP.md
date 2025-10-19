# 📋 HƯỚNG DẪN TẠO AZURE SQL DATABASE

## 🚀 Bước 1: Tạo Azure SQL Database qua Azure Portal

### 1.1. Truy cập Azure Portal
- Vào: https://portal.azure.com
- Đăng nhập bằng tài khoản Azure của bạn

### 1.2. Tạo SQL Database
1. **Tìm kiếm "SQL databases"** trong thanh search
2. **Click "Create"** hoặc **"+ Add"**
3. **Điền thông tin cơ bản:**

#### Basic Settings:
```
Subscription: [Chọn subscription của bạn]
Resource Group: 
  - Tạo mới: "student-scheduler-rg"
  - Hoặc dùng existing group

Database name: student-scheduler-db
Server: [Tạo mới server]
```

#### Tạo SQL Server (nếu chưa có):
```
Server name: student-scheduler-server
Location: Southeast Asia (hoặc gần nhất)
Authentication method: Use SQL authentication
Server admin login: sqladmin
Password: [Mật khẩu mạnh - ít nhất 12 ký tự]
Confirm password: [Nhập lại mật khẩu]
```

#### Compute + Storage:
```
Service tier: Basic (5 DTU, 2GB) - cho demo/dev
Hoặc: General Purpose (Serverless) - cho production

Backup storage redundancy: Locally-redundant backup storage
```

### 1.3. Network Settings
```
Connectivity method: Public endpoint
Firewall rules:
  ✅ Allow Azure services and resources to access this server
  ✅ Add current client IP address
```

### 1.4. Security (tùy chọn)
```
Enable Microsoft Defender for SQL: No (để tiết kiệm chi phí)
```

### 1.5. Additional Settings
```
Use existing data: None
Database collation: SQL_Latin1_General_CP1_CI_AS
```

4. **Click "Review + Create"**
5. **Click "Create"** để tạo database

⏱️ **Thời gian:** Khoảng 5-10 phút để tạo xong

---

## 🔑 Bước 2: Lấy Connection String

### 2.1. Sau khi tạo xong:
1. Vào **SQL databases** → **student-scheduler-db**
2. Click **"Connection strings"** ở menu bên trái
3. Copy **"ADO.NET"** connection string:

```
Server=tcp:student-scheduler-server.database.windows.net,1433;Initial Catalog=student-scheduler-db;Persist Security Info=False;User ID=sqladmin;Password={your_password};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

### 2.2. Thay thế {your_password} bằng mật khẩu thật

---

## 🛡️ Bước 3: Cấu hình Firewall

### 3.1. Thêm IP của máy local:
1. Vào **SQL servers** → **student-scheduler-server**
2. Click **"Networking"** ở menu bên trái
3. Trong **Firewall rules**, click **"+ Add client IP"**
4. Click **"Save"**

### 3.2. Cho phép Azure Services:
- Đảm bảo **"Allow Azure services and resources to access this server"** = **ON**

---

## 💡 Thông tin quan trọng cần lưu:

```
Server name: student-scheduler-server.database.windows.net
Database name: student-scheduler-db
Username: sqladmin
Password: [Mật khẩu bạn đã tạo]
Port: 1433
```

---

## 💰 Chi phí ước tính:
- **Basic tier**: ~$5/tháng
- **General Purpose Serverless**: ~$10-30/tháng tùy sử dụng

---

## ⚠️ Lưu ý:
- Lưu mật khẩu SQL admin an toàn
- Ghi nhớ tên server và database
- Đảm bảo firewall đã mở cho IP của bạn
- Connection string sẽ dùng để kết nối từ Node.js
