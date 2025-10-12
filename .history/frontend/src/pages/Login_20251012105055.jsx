import { useState } from 'react';
import './Login.css';

function Login({ onLogin }) {
  const [studentId, setStudentId] = useState('');

  const handleLogin = () => {
    if (studentId.trim()) {
      // Giả lập đăng nhập, sau này sẽ tích hợp Microsoft Entra ID
      onLogin(studentId);
    } else {
      alert('Vui lòng nhập Mã số sinh viên');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🎓 Student Scheduler</h1>
        <h2>Hệ thống gợi ý thời gian biểu</h2>
        <p className="subtitle">Triển khai trên Azure Cloud Computing</p>
        
        <div className="login-form">
          <input
            type="text"
            placeholder="Nhập mã số sinh viên"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="input-field"
          />
          
          <button onClick={handleLogin} className="login-button">
            Đăng nhập
          </button>
          
          <p className="note">
            * Hiện tại đang dùng đăng nhập giả lập<br />
            Sau này sẽ tích hợp Microsoft Entra ID
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
