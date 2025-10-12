# HƯỚNG DẪN CHẠY NHANH

## Bước 1: Mở 2 Terminal

### Terminal 1 - Backend (API)
```bash
cd api
npm install
npm start
```

Đợi đến khi thấy thông báo:
```
Azure Functions Core Tools
...
Functions:
    courses: [GET] http://localhost:7071/api/courses
    preferences: [POST] http://localhost:7071/api/preferences  
    recommend: [POST] http://localhost:7071/api/recommend
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm run dev
```

Đợi đến khi thấy:
```
VITE ready in ...
➜  Local:   http://localhost:5173/
```

## Bước 2: Truy cập ứng dụng

Mở trình duyệt và vào: **http://localhost:5173**

## Bước 3: Test các tính năng

1. **Đăng nhập:**
   - Nhập bất kỳ mã sinh viên nào (ví dụ: SV001)
   - Nhấn "Đăng nhập"

2. **Xem danh sách môn học:**
   - Chọn học kỳ từ dropdown
   - Xem các môn học có sẵn

3. **Thiết lập ràng buộc:**
   - Nhấn vào tab "Ràng buộc"
   - Điền số tín chỉ, chọn khu vực, thêm thời gian rảnh
   - Nhấn "Lưu ràng buộc"

4. **Xem gợi ý TKB:**
   - Nhấn vào tab "Gợi ý TKB"
   - Nhấn "Tạo gợi ý thời gian biểu"
   - Xem các phương án ở dạng danh sách hoặc bảng

## Test API trực tiếp (tùy chọn)

Dùng curl hoặc Postman:

```bash
# Test GET courses
curl http://localhost:7071/api/courses?semester=2025A

# Test POST preferences
curl -X POST http://localhost:7071/api/preferences \
  -H "Content-Type: application/json" \
  -d '{"studentId":"SV001","preferences":{"maxCredits":18}}'

# Test POST recommend
curl -X POST http://localhost:7071/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"studentId":"SV001"}'
```

## Lưu ý quan trọng

- ✅ Backend phải chạy trước ở port 7071
- ✅ Frontend sẽ proxy API requests từ /api/* tới backend
- ✅ Nếu thay đổi code backend, cần restart `func start`
- ✅ Nếu thay đổi code frontend, Vite sẽ tự động reload

## Troubleshooting

**Lỗi: Port already in use**
```bash
# Tìm và kill process đang dùng port
lsof -i :7071  # hoặc :5173
kill -9 <PID>
```

**Lỗi: Cannot find module**
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

**Lỗi: API không kết nối được**
- Kiểm tra backend đã chạy chưa
- Kiểm tra proxy trong vite.config.js
- Xem console trong DevTools của browser
