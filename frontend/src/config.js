// API Configuration
const API_BASE_URL = import.meta.env.PROD 
  ? "https://student-api-func.azurewebsites.net/api"
  : "http://localhost:7071/api";

export default API_BASE_URL;
