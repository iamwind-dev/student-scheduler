# 📁 CẤU TRÚC PROJECT - Student Scheduler

> Tài liệu mô tả cấu trúc project sau khi tái cấu trúc (Restructured on Oct 19, 2025)

## 🎯 Nguyên tắc tổ chức

- **Modular Structure**: Mỗi feature/module trong folder riêng
- **Co-location**: File CSS và component ở cùng folder
- **Clear Separation**: Tách biệt rõ ràng giữa pages, components, services
- **No Duplicates**: Không có file trùng lặp

---

## 📂 Backend Structure (API)

```
api/
├── host.json                    # Azure Functions configuration
├── local.settings.json          # Local environment settings
├── package.json                 # Dependencies
└── src/
    ├── api-specification.js     # API documentation/specs
    ├── database.js              # Database connection & queries
    ├── data/
    │   └── data.json           # Sample/mock data
    ├── functions/               # Azure Functions (HTTP triggers)
    │   ├── auth/
    │   │   ├── auth.js         # Authentication endpoints
    │   │   └── index.js        # Export wrapper
    │   ├── courses/
    │   │   ├── courses.js      # Courses CRUD endpoints
    │   │   └── index.js
    │   ├── preferences/
    │   │   └── preferences.js.disabled
    │   ├── recommend/
    │   │   └── recommend.js.disabled
    │   ├── schedules/
    │   │   └── schedules.js.disabled
    │   └── users/
    │       └── users.js.disabled
    ├── services/                # Business logic layer
    │   ├── auth-service.js     # Authentication logic
    │   ├── course-service.js   # Course business logic
    │   ├── database-service.js # Database abstraction
    │   ├── preference-service.js
    │   └── user-service.js
    └── utils/                   # Helper utilities
        ├── logger.js           # Logging utility
        ├── response-helper.js  # HTTP response helpers
        └── validation-helper.js # Input validation
```

### 🔑 Backend Key Files

| File | Mô tả |
|------|-------|
| `functions/auth/auth.js` | Microsoft Entra ID authentication, token validation |
| `functions/courses/courses.js` | GET /api/courses - Lấy danh sách môn học |
| `database.js` | Azure SQL connection pool & query methods |
| `services/*.js` | Business logic, không trực tiếp handle HTTP |

---

## 📂 Frontend Structure

```
frontend/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── App.jsx                  # Root component with routing
    ├── App.css
    ├── main.jsx                 # Entry point
    ├── index.css
    ├── authConfig.js            # Microsoft Entra ID config
    ├── config.js                # App configuration
    │
    ├── assets/                  # Static assets
    │   └── react.svg
    │
    ├── components/              # Reusable UI components
    │   ├── auth/
    │   │   └── ProtectedRoute.jsx
    │   ├── common/              # Shared components
    │   │   ├── ErrorFallback.jsx
    │   │   ├── ErrorFallback.css
    │   │   ├── LoadingSpinner.jsx
    │   │   ├── LoadingSpinner.css
    │   │   ├── Toast.jsx
    │   │   └── Toast.css
    │   ├── layout/              # Layout components
    │   │   ├── Layout.jsx
    │   │   ├── Layout.css
    │   │   ├── Header.jsx
    │   │   ├── Header.css
    │   │   ├── Sidebar.jsx
    │   │   └── Sidebar.css
    │   └── profile/
    │       └── ProfileData.jsx
    │
    ├── contexts/                # React Context providers
    │   ├── AuthContext.jsx      # Authentication state
    │   └── AppContext.jsx       # Application state
    │
    ├── hooks/                   # Custom React hooks
    │   └── useCourses.js
    │
    ├── pages/                   # Page components (Routes)
    │   ├── auth/
    │   │   ├── LoginPage.jsx
    │   │   └── LoginPage.css
    │   ├── courses/
    │   │   ├── CoursesPage.jsx
    │   │   ├── CoursesPage.css
    │   │   └── CourseDetailsPage.jsx
    │   ├── dashboard/
    │   │   └── DashboardPage.jsx
    │   ├── error/
    │   │   └── NotFoundPage.jsx
    │   ├── preferences/
    │   │   ├── PreferencesPage.jsx
    │   │   └── PreferencesPage.css
    │   ├── profile/
    │   │   └── ProfilePage.jsx
    │   └── schedule/
    │       ├── RecommendPage.jsx
    │       ├── RecommendPage.css
    │       ├── SchedulePage.jsx
    │       └── ScheduleDetailsPage.jsx
    │
    ├── services/                # API client services
    │   └── api/
    │       └── apiService.js
    │
    ├── styles/                  # Global styles
    │   └── globals.css
    │
    └── __tests__/               # Unit & integration tests
        ├── appContext.test.jsx
        ├── authContext.test.jsx
        ├── integration.test.js
        └── loginPage.test.jsx
```

### 🔑 Frontend Key Files

| File | Mô tả |
|------|-------|
| `App.jsx` | Root component, BrowserRouter, lazy loading |
| `main.jsx` | ReactDOM render, entry point |
| `contexts/AuthContext.jsx` | Microsoft Entra authentication state |
| `contexts/AppContext.jsx` | Global app state (courses, preferences) |
| `pages/auth/LoginPage.jsx` | Microsoft login page |
| `pages/courses/CoursesPage.jsx` | Danh sách môn học, filter, search |
| `pages/preferences/PreferencesPage.jsx` | Thiết lập ràng buộc TKB |
| `pages/schedule/RecommendPage.jsx` | Gợi ý thời gian biểu |

---

## 📂 Database Structure

```
database/
├── AZURE_SQL_SETUP.md           # Hướng dẫn setup Azure SQL
├── import-new-data.js           # Script import dữ liệu từ JSON
├── output_fixed.json            # Dữ liệu môn học đã xử lý (185KB)
└── schema-new.sql               # Database schema hiện tại
```

### 🗄️ Database Schema

Sử dụng **Azure SQL Database** với schema đơn giản:

```sql
CREATE TABLE Courses (
    ID INT PRIMARY KEY,
    Name NVARCHAR(500),
    Credits INT,
    Lecturer NVARCHAR(255),
    Time NVARCHAR(100),      -- "Thứ Tư | Tiết 1->3"
    Room NVARCHAR(50),
    Weeks NVARCHAR(50),
    Quantity INT
);
```

---

## 🚀 Import Patterns

### Backend Imports

```javascript
// Functions import services
const authService = require('../../services/auth-service');
const courseService = require('../../services/course-service');
const { validateInput } = require('../../utils/validation-helper');
const { successResponse, errorResponse } = require('../../utils/response-helper');
```

### Frontend Imports

```javascript
// Pages import contexts & components
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Components use relative imports
import './CoursesPage.css';
```

---

## 📝 Naming Conventions

### Files
- **Components**: PascalCase (e.g., `LoadingSpinner.jsx`)
- **Pages**: PascalCase + "Page" suffix (e.g., `CoursesPage.jsx`)
- **Contexts**: PascalCase + "Context" suffix (e.g., `AuthContext.jsx`)
- **Services**: kebab-case + "-service" suffix (e.g., `auth-service.js`)
- **Utils**: kebab-case + "-helper" suffix (e.g., `response-helper.js`)
- **Styles**: Match component name (e.g., `CoursesPage.css`)

### Folders
- **lowercase**: services, utils, hooks
- **lowercase**: pages, components, contexts

---

## 🔄 Recent Changes (Oct 19, 2025)

### ✅ Completed Restructuring

1. **Backend API**
   - Moved all functions into feature folders
   - Created `index.js` exports for cleaner imports
   - Removed duplicate v2 files

2. **Frontend Pages**
   - Consolidated pages into feature folders
   - Removed duplicate Login/Courses files
   - Renamed to *Page.jsx convention

3. **Components**
   - Moved ProfileData into `components/profile/`
   - All components now in feature folders

4. **Contexts**
   - Merged `context/` into `contexts/`
   - Single source of truth

5. **Database**
   - Cleaned up old schema files
   - Kept only active files

### 🗑️ Removed Files

**Database:**
- `schema.sql`, `schema-v2.sql` (old schemas)
- `insert-data.sql` (auto-generated)
- `setup-database.js`, `migrate-data.js`, `check-data.js` (old scripts)
- `convert (1).xlsx` (unknown Excel file)

**API:**
- `courses-v2.js.disabled`
- `preferences-v2.js.disabled`

**Frontend:**
- Duplicate `Login.jsx`, `Courses.jsx` in pages root
- `context/` folder (merged to contexts)

---

## 🎯 Next Steps

1. **Enable disabled functions** khi cần:
   - `preferences.js.disabled`
   - `recommend.js.disabled`
   - `schedules.js.disabled`
   - `users.js.disabled`

2. **Implement missing pages**:
   - `DashboardPage.jsx` (hiện chưa có nội dung)
   - `ProfilePage.jsx` (hiện chưa có nội dung)

3. **Add API service layer** trong frontend:
   - Tách API calls ra khỏi components
   - Sử dụng `services/api/` folder

---

## 📚 Documentation Links

- [README.md](./README.md) - Project overview
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Setup instructions
- [DEPLOY_AZURE.md](./DEPLOY_AZURE.md) - Deployment guide
- [database/AZURE_SQL_SETUP.md](./database/AZURE_SQL_SETUP.md) - Database setup

---

**Last Updated**: October 19, 2025  
**Maintained By**: Development Team
