import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import Login from './pages/Login';
import Courses from './pages/Courses';
import Preferences from './pages/Preferences';
import Recommend from './pages/Recommend';
import './App.css';

function App() {
  const { accounts, instance } = useMsal();
  const [currentPage, setCurrentPage] = useState('login');
  const [studentId, setStudentId] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  // Check nếu user đã đăng nhập (restore session)
  useEffect(() => {
    if (accounts.length > 0) {
      const account = accounts[0];
      setStudentId(account.username || account.localAccountId);
      setUserInfo(account);
      setCurrentPage('courses');
    }
  }, [accounts]);

  const handleLogin = (id, account) => {
    setStudentId(id);
    setUserInfo(account);
    setCurrentPage('courses');
  };

  const handleLogout = async () => {
    try {
      // Logout khỏi Microsoft nếu đang dùng MSAL
      if (accounts.length > 0) {
        await instance.logoutPopup();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setStudentId('');
    setUserInfo(null);
    setCurrentPage('login');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <Login onLogin={handleLogin} />;
      case 'courses':
        return <Courses />;
      case 'preferences':
        return <Preferences studentId={studentId} />;
      case 'recommend':
        return <Recommend studentId={studentId} />;
      default:
        return <Login onLogin={handleLogin} />;
    }
  };

  return (
    <div className="app">
      {currentPage !== 'login' && (
        <nav className="navbar">
          <div className="navbar-brand">
            <h2>🎓 Student Scheduler</h2>
            <span className="student-id">
              {userInfo?.name || studentId}
            </span>
          </div>
          <div className="navbar-menu">
            <button
              className={`nav-button ${currentPage === 'courses' ? 'active' : ''}`}
              onClick={() => setCurrentPage('courses')}
            >
              📚 Danh sách môn học
            </button>
            <button
              className={`nav-button ${currentPage === 'preferences' ? 'active' : ''}`}
              onClick={() => setCurrentPage('preferences')}
            >
              ⚙️ Ràng buộc
            </button>
            <button
              className={`nav-button ${currentPage === 'recommend' ? 'active' : ''}`}
              onClick={() => setCurrentPage('recommend')}
            >
              🎯 Gợi ý TKB
            </button>
            <button className="nav-button logout" onClick={handleLogout}>
              🚪 Đăng xuất
            </button>
          </div>
        </nav>
      )}
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
