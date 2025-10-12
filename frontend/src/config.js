// API Configuration
// Khi deploy production, sử dụng URL Azure Functions
// Khi chạy local development, sử dụng proxy /api
const API_BASE = import.meta.env.PROD 
  ? "https://student-api-func.azurewebsites.net/api"
  : "/api";

export default API_BASE;
