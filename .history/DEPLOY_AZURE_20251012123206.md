# HƯỚNG DẪN DEPLOY LÊN AZURE

## Phần 1: Deploy Frontend lên Azure App Service

### Bước 1: Build Frontend
```bash
cd frontend
npm run build
```

File `package.json` sẽ tự động được copy vào thư mục `dist/` với cấu hình để chạy static server.

### Bước 2: Tạo file zip để deploy
```bash
cd dist
zip -r ../frontend-deploy.zip .
cd ..
```

### Bước 3: Deploy bằng Azure CLI

**Cài Azure CLI (nếu chưa có):**
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

**Đăng nhập Azure:**
```bash
az login
```

**Deploy lên App Service:**
```bash
az webapp deploy \
  --resource-group <your-resource-group> \
  --name <your-app-name> \
  --src-path frontend-deploy.zip \
  --type zip
```

### Bước 4: Cấu hình App Service

Sau khi deploy, cần cấu hình App Service:

**1. Đặt Node version:**
```bash
az webapp config appsettings set \
  --resource-group <your-resource-group> \
  --name <your-app-name> \
  --settings WEBSITE_NODE_DEFAULT_VERSION="~20"
```

**2. Đặt startup command:**
```bash
az webapp config set \
  --resource-group <your-resource-group> \
  --name <your-app-name> \
  --startup-file "npm start"
```

### Bước 5: Restart App Service
```bash
az webapp restart \
  --resource-group <your-resource-group> \
  --name <your-app-name>
```

---

## Phần 2: Deploy Backend (Azure Functions) lên Azure

### Bước 1: Cài Azure Functions Core Tools (nếu chưa có)
```bash
npm install -g azure-functions-core-tools@4
```

### Bước 2: Login Azure Functions
```bash
az login
```

### Bước 3: Tạo Function App trên Azure Portal

1. Vào Azure Portal: https://portal.azure.com
2. Tạo **Function App** với các cấu hình:
   - Runtime: Node.js
   - Version: 20
   - Region: Chọn region gần nhất
   - Plan: Consumption (Serverless)

### Bước 4: Deploy Functions
```bash
cd api
func azure functionapp publish <function-app-name>
```

### Bước 5: Cấu hình CORS

Để frontend có thể gọi API, cần cấu hình CORS:

```bash
az functionapp cors add \
  --resource-group <your-resource-group> \
  --name <function-app-name> \
  --allowed-origins "https://<frontend-app-name>.azurewebsites.net"
```

Hoặc cho phép tất cả (chỉ dùng cho development):
```bash
az functionapp cors add \
  --resource-group <your-resource-group> \
  --name <function-app-name> \
  --allowed-origins "*"
```

---

## Phần 3: Cấu hình Frontend gọi API Backend

### Cập nhật API URL trong Frontend

Sau khi deploy backend, bạn sẽ có URL function app (ví dụ: `https://your-function-app.azurewebsites.net`)

**Cách 1: Dùng biến môi trường**

Tạo file `.env.production` trong thư mục `frontend`:
```env
VITE_API_URL=https://your-function-app.azurewebsites.net
```

Cập nhật code để dùng biến này:
```javascript
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Thay vì
fetch('/api/courses')

// Dùng
fetch(`${API_URL}/api/courses`)
```

**Cách 2: Dùng Azure App Service Proxy**

Cấu hình trong Azure Portal:
- Vào App Service > Configuration > Application settings
- Thêm setting mới:
  - Name: `API_URL`
  - Value: `https://your-function-app.azurewebsites.net`

---

## Phần 4: Deploy tự động với GitHub Actions

### Tạo workflow file

Tạo file `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [ main ]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Build
        run: |
          cd frontend
          npm run build
      
      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v2
        with:
          app-name: <your-app-name>
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: frontend/dist
  
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: |
          cd api
          npm ci
      
      - name: Deploy to Azure Functions
        uses: Azure/functions-action@v1
        with:
          app-name: <function-app-name>
          package: api
          publish-profile: ${{ secrets.AZURE_FUNCTIONAPP_PUBLISH_PROFILE }}
```

### Lấy Publish Profile

1. Vào Azure Portal
2. Mở App Service / Function App
3. Click **Get publish profile**
4. Copy toàn bộ nội dung XML
5. Vào GitHub repo > Settings > Secrets and variables > Actions
6. Tạo secret mới:
   - `AZURE_WEBAPP_PUBLISH_PROFILE` (cho frontend)
   - `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` (cho backend)
7. Paste nội dung XML vào

---

## Troubleshooting

### 1. Trang web hiển thị "Your web app is running and waiting for your content"

**Nguyên nhân:** Azure không tìm thấy file `package.json` hoặc không biết cách chạy app.

**Giải pháp:**
- Đảm bảo file `package.json` có trong thư mục deploy
- Cấu hình startup command: `npm start`
- Kiểm tra log: Azure Portal > App Service > Log Stream

### 2. API không kết nối được

**Nguyên nhân:** CORS chưa được cấu hình.

**Giải pháp:**
```bash
az functionapp cors add \
  --resource-group <your-resource-group> \
  --name <function-app-name> \
  --allowed-origins "*"
```

### 3. Kiểm tra logs

**Frontend logs:**
```bash
az webapp log tail \
  --resource-group <your-resource-group> \
  --name <your-app-name>
```

**Backend logs:**
```bash
func azure functionapp logstream <function-app-name>
```

---

## Checklist Deploy

### Frontend:
- [ ] `npm run build` thành công
- [ ] File `package.json` có trong thư mục `dist/`
- [ ] Deploy lên Azure App Service
- [ ] Cấu hình startup command: `npm start`
- [ ] Restart app service

### Backend:
- [ ] Test local với `func start`
- [ ] Tạo Function App trên Azure
- [ ] Deploy với `func azure functionapp publish`
- [ ] Cấu hình CORS
- [ ] Test các API endpoints

### Kết nối:
- [ ] Cập nhật API URL trong frontend
- [ ] Test gọi API từ frontend
- [ ] Kiểm tra CORS policy

---

## URL sau khi deploy thành công

- **Frontend:** `https://<your-app-name>.azurewebsites.net`
- **Backend:** `https://<function-app-name>.azurewebsites.net`
- **API Endpoints:**
  - `GET https://<function-app-name>.azurewebsites.net/api/courses?semester=2025A`
  - `POST https://<function-app-name>.azurewebsites.net/api/preferences`
  - `POST https://<function-app-name>.azurewebsites.net/api/recommend`
