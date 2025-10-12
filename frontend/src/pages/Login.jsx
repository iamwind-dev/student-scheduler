import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../authConfig';
import './Login.css';

function Login({ onLogin }) {
  const { instance } = useMsal();

  const handleMicrosoftLogin = async () => {
    try {
      const response = await instance.loginPopup(loginRequest);
      console.log('Login successful:', response);
      
      // Lấy thông tin user
      const account = response.account;
      const studentId = account.username || account.localAccountId;
      
      // Gọi callback để cập nhật state trong App
      onLogin(studentId, account);
    } catch (error) {
      console.error('Login failed:', error);
      alert('Đăng nhập thất bại: ' + error.message);
    }
  };

  const handleDemoLogin = () => {
    // Giữ lại chức năng demo để test
    const demoId = prompt('Nhập mã số sinh viên (demo mode):');
    if (demoId && demoId.trim()) {
      onLogin(demoId.trim(), { name: 'Demo User' });
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🎓 Student Scheduler</h1>
        <h2>Hệ thống gợi ý thời gian biểu</h2>
        <p className="subtitle">Triển khai trên Azure Cloud Computing</p>
        
        <div className="login-form">
          <button onClick={handleMicrosoftLogin} className="login-button microsoft">
            <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="10" height="10" fill="#F25022"/>
              <rect x="11" width="10" height="10" fill="#7FBA00"/>
              <rect y="11" width="10" height="10" fill="#00A4EF"/>
              <rect x="11" y="11" width="10" height="10" fill="#FFB900"/>
            </svg>
            Đăng nhập với Microsoft
          </button>
          
          <div className="divider">
            <span>hoặc</span>
          </div>
          
          <button onClick={handleDemoLogin} className="login-button demo">
            🎭 Đăng nhập Demo
          </button>
          
          <p className="note">
            ✅ Đăng nhập bằng tài khoản Microsoft (Entra ID)<br />
            🎓 Dành cho sinh viên và giảng viên<br />
            🔒 An toàn và bảo mật
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
