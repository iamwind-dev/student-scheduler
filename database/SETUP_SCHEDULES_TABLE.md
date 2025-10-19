# 🎯 HƯỚNG DẪN SETUP BẢNG SCHEDULES CHO THỜI KHÓA BIỂU

## ✅ Checklist trước khi bắt đầu:
- [ ] Đã có Azure SQL Database (student-scheduler-db)
- [ ] Đã biết thông tin kết nối (server, username, password)
- [ ] Đã cấu hình firewall cho phép IP của bạn

---

## 📝 BƯỚC 1: Kiểm tra kết nối hiện tại

Bạn đã có database với thông tin:
```
Server: student-scheduler-server.database.windows.net
Database: student-scheduler-db
Username: sqladmin
Password: admin123@
```

### Test kết nối:
```bash
cd /home/phanhoailang/Azure/student-scheduler/database
node test-connection.js
```

Nếu lỗi "ECONNRESET" hoặc "Login failed":
- **Nguyên nhân**: Firewall chưa mở hoặc password sai
- **Giải pháp**: Xem Bước 2 để cấu hình firewall

---

## 🛡️ BƯỚC 2: Cấu hình Firewall trên Azure Portal

### 2.1. Mở Azure Portal
1. Vào: https://portal.azure.com
2. Tìm kiếm "SQL servers" trong thanh tìm kiếm
3. Click vào **student-scheduler-server**

### 2.2. Thêm IP của bạn vào Firewall
1. Ở menu bên trái, click **"Networking"**
2. Trong tab **"Public access"**:
   - Đảm bảo **"Public network access"** = **"Selected networks"** hoặc **"All networks"**
3. Trong phần **"Firewall rules"**:
   - Click **"+ Add your client IPv4 address (X.X.X.X)"**
   - Hoặc thêm rule mới:
     - Rule name: `MyLocalIP`
     - Start IP: [IP của bạn]
     - End IP: [IP của bạn]
4. **Quan trọng**: Đảm bảo checked **"Allow Azure services and resources to access this server"**
5. Click **"Save"** ở trên cùng

### 2.3. Kiểm tra IP của bạn:
```bash
curl -s https://api.ipify.org
# Hoặc
curl -s ifconfig.me
```

> ⏱️ **Lưu ý**: Sau khi save firewall, đợi 2-3 phút để áp dụng

---

## 🗃️ BƯỚC 3: Tạo bảng Schedules

### 3.1. Chạy script tạo bảng tự động:
```bash
cd /home/phanhoailang/Azure/student-scheduler/database
node create-schedules-table.js
```

### 3.2. Nếu script thành công, bạn sẽ thấy:
```
✅ Connected successfully!
✅ Schedules table created successfully!
✅ Verification: Schedules table exists in database
```

### 3.3. Nếu gặp lỗi "Invalid object name 'Schedules'":
- Bảng chưa được tạo
- Chạy lại script create-schedules-table.js
- Hoặc tạo thủ công qua Azure Data Studio (xem Bước 4)

---

## 💻 BƯỚC 4: Tạo bảng thủ công (nếu script lỗi)

### 4.1. Cài đặt Azure Data Studio (nếu chưa có):
- Download: https://docs.microsoft.com/sql/azure-data-studio/download
- Hoặc dùng SQL Server Management Studio (SSMS)

### 4.2. Kết nối đến database:
```
Server: student-scheduler-server.database.windows.net
Authentication: SQL Login
Username: sqladmin
Password: admin123@
Database: student-scheduler-db
```

### 4.3. Chạy SQL script:
```sql
-- Tạo bảng Schedules
CREATE TABLE Schedules (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId NVARCHAR(255) NOT NULL,
    coursesJson NVARCHAR(MAX) NOT NULL,
    totalCredits INT NOT NULL,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE()
);

-- Tạo indexes
CREATE INDEX IX_Schedules_UserId ON Schedules(userId);
CREATE INDEX IX_Schedules_CreatedAt ON Schedules(createdAt);

-- Kiểm tra
SELECT * FROM Schedules;
```

---

## 🔧 BƯỚC 5: Uncomment code API

### 5.1. Mở file schedules.js:
```bash
code /home/phanhoailang/Azure/student-scheduler/api/src/functions/schedules.js
```

### 5.2. Xóa dấu /* và */ để uncomment toàn bộ code

### 5.3. Verify password trong config:
Đảm bảo dòng này đúng password:
```javascript
password: process.env.SQL_PASSWORD || 'admin123@',
```

---

## 🚀 BƯỚC 6: Restart backend và test

### 6.1. Restart backend:
```bash
cd /home/phanhoailang/Azure/student-scheduler/api
pkill -f "func start"
npm start
```

### 6.2. Test API endpoint:
```bash
# Test GET (chưa có data nên sẽ 404)
curl http://localhost:7071/api/schedules/demo-user

# Kết quả mong đợi:
# {"success":false,"message":"Chưa có thời khóa biểu"}
```

### 6.3. Test lưu thời khóa biểu:
1. Vào trang web: http://localhost:5173/schedule
2. Tạo thời khóa biểu (drag & drop hoặc AI suggest)
3. Click **"💾 Lưu lịch"**
4. Kiểm tra trong Azure:
```bash
# Query để xem data
SELECT TOP 10 * FROM Schedules ORDER BY createdAt DESC;
```

---

## ✅ BƯỚC 7: Update frontend để dùng SQL

### 7.1. Uncomment code trong SchedulePage.jsx:
File: `/frontend/src/pages/schedule/SchedulePage.jsx`

Tìm hàm `saveSchedule` và thay thế bằng:
```javascript
const saveSchedule = async () => {
  try {
    const response = await fetch('http://localhost:7071/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'demo-user',
        courses: selectedCourses,
        totalCredits: totalCredits
      })
    });

    const result = await response.json();
    
    if (result.success) {
      // Lưu backup vào localStorage
      localStorage.setItem('savedSchedule', JSON.stringify({
        courses: selectedCourses,
        schedule: schedule,
        totalCredits: totalCredits,
        createdAt: new Date().toISOString()
      }));
      alert('✅ Đã lưu vào SQL Server!');
      window.location.href = '/profile';
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Save error:', error);
    // Fallback to localStorage
    localStorage.setItem('savedSchedule', JSON.stringify({
      courses: selectedCourses,
      schedule: schedule,
      totalCredits: totalCredits,
      createdAt: new Date().toISOString()
    }));
    alert('⚠️ Lưu vào localStorage (SQL lỗi)');
  }
};
```

### 7.2. Update ProfilePage.jsx để load từ SQL:
```javascript
const loadSchedule = async () => {
  try {
    const response = await fetch('http://localhost:7071/api/schedules/demo-user');
    const result = await response.json();
    
    if (result.success) {
      setSavedSchedule({
        courses: result.data.courses,
        schedule: buildScheduleFromCourses(result.data.courses),
        totalCredits: result.data.totalCredits,
        createdAt: result.data.createdAt
      });
    } else {
      // Fallback to localStorage
      const localData = localStorage.getItem('savedSchedule');
      if (localData) setSavedSchedule(JSON.parse(localData));
    }
  } catch (error) {
    const localData = localStorage.getItem('savedSchedule');
    if (localData) setSavedSchedule(JSON.parse(localData));
  }
};
```

---

## 🎉 HOÀN THÀNH!

Sau khi hoàn thành các bước trên, hệ thống sẽ:
- ✅ Lưu thời khóa biểu vào Azure SQL Database
- ✅ Có localStorage làm backup
- ✅ Hiển thị lịch đã lưu trong trang Hồ sơ
- ✅ Có thể xóa và tạo lịch mới

---

## 🆘 Troubleshooting

### Lỗi: "Failed to connect - ECONNRESET"
**Nguyên nhân**: Firewall chưa mở
**Giải pháp**: 
1. Vào Azure Portal → SQL servers → Networking
2. Add your client IP
3. Đợi 2-3 phút và thử lại

### Lỗi: "Login failed for user 'sqladmin'"
**Nguyên nhân**: Password sai
**Giải pháp**:
1. Reset password trong Azure Portal
2. Update password trong code
3. Restart backend

### Lỗi: "Invalid object name 'Schedules'"
**Nguyên nhân**: Bảng chưa tạo
**Giải pháp**:
1. Chạy lại `node create-schedules-table.js`
2. Hoặc tạo thủ công qua Azure Data Studio

### Backend không khởi động
**Nguyên nhân**: Lỗi syntax trong schedules.js
**Giải pháp**:
1. Kiểm tra log: `tail -100 /tmp/backend.log`
2. Fix lỗi và restart

---

## 📞 Cần hỗ trợ?
- Xem log backend: `tail -100 /tmp/backend.log`
- Test kết nối: `node test-connection.js`
- Kiểm tra firewall: Azure Portal → SQL servers → Networking
