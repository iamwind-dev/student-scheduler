/**
 * Microsoft Entra ID (Azure AD) Configuration
 * 
 * HƯỚNG DẪN SETUP:
 * 1. Vào Azure Portal: https://portal.azure.com
 * 2. Tìm "Microsoft Entra ID" (hoặc "Azure Active Directory")
 * 3. Vào "App registrations" > "New registration"
 * 4. Nhập tên: "Student Scheduler"
 * 5. Chọn "Accounts in this organizational directory only"
 * 6. Redirect URI: 
 *    - Type: Single-page application (SPA)
 *    - URI: http://localhost:5173 (dev) và https://your-app.azurewebsites.net (prod)
 * 7. Copy "Application (client) ID" và "Directory (tenant) ID"
 * 8. Paste vào file .env.local
 */

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_ENTRA_CLIENT_ID || "YOUR_CLIENT_ID_HERE",
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_ENTRA_TENANT_ID || "YOUR_TENANT_ID_HERE"}`,
    redirectUri: import.meta.env.VITE_REDIRECT_URI || "http://localhost:5173",
  },
  cache: {
    cacheLocation: "sessionStorage", // "sessionStorage" hoặc "localStorage"
    storeAuthStateInCookie: false, // Set true nếu dùng IE11 hoặc Edge
  },
};

// Scopes yêu cầu khi đăng nhập
export const loginRequest = {
  scopes: ["User.Read", "profile", "openid", "email"]
};

// Graph API endpoint để lấy thông tin user
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
  graphPhotoEndpoint: "https://graph.microsoft.com/v1.0/me/photo/$value"
};
