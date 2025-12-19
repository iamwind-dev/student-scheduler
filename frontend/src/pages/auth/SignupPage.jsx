import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './SignupPage.css';

export default function SignupPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        studentId: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error when user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.name || !formData.email || !formData.password) {
            setError('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        try {
            setLoading(true);
            const API_URL = import.meta.env.VITE_API_URL || 'https://func-student-schedule-gbcpezaghachdkfn.eastasia-01.azurewebsites.net/api';
            
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    studentId: formData.studentId,
                    password: formData.password
                })
            });

            const result = await response.json();

            if (result.success) {
                // Normalize: API uses 'userId' but context expects 'id'
                const userData = result.data?.user || result.data;
                const normalizedUser = {
                    ...userData,
                    id: userData.id || userData.userId
                };
                
                alert(`✅ Đăng ký thành công!\nChào mừng ${normalizedUser.name}!`);
                
                // Tự động đăng nhập sau khi đăng ký
                localStorage.setItem('userData', JSON.stringify(normalizedUser));
                localStorage.setItem('sessionToken', 'signup-token-' + Date.now());
                
                // Chuyển đến trang dashboard
                navigate('/dashboard');
            } else {
                setError(result.error || 'Đăng ký thất bại');
            }
        } catch (err) {
            console.error('Signup error:', err);
            setError('Lỗi kết nối đến server. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-page">
            {/* Left Side - Illustration */}
            <div className="signup-illustration">
                <div className="illustration-content">
                    <div className="floating-card card-1">
                        <div className="card-icon">✓</div>
                        <div className="card-lines">
                            <div className="line"></div>
                            <div className="line"></div>
                            <div className="line"></div>
                        </div>
                    </div>
                    <div className="floating-card card-2">
                        <div className="card-icon">👤</div>
                    </div>
                    <div className="floating-card card-3">
                        <div className="card-icon">🔒</div>
                    </div>
                    <div className="decorative-circle circle-1"></div>
                    <div className="decorative-circle circle-2"></div>
                    <div className="decorative-circle circle-3"></div>
                </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="signup-container">
                <div className="signup-header">
                    <div className="logo-section">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                            <rect width="40" height="40" rx="8" fill="url(#logo-gradient)"/>
                            <path d="M20 10L15 15H18V25H22V15H25L20 10Z" fill="white"/>
                            <defs>
                                <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40">
                                    <stop offset="0%" stopColor="#667eea"/>
                                    <stop offset="100%" stopColor="#764ba2"/>
                                </linearGradient>
                            </defs>
                        </svg>
                        <span className="logo-text"></span>
                    </div>
                    <div className="header-right">
                        <span className="header-text">Already have an account?</span>
                        <Link to="/login" className="btn-outline">SIGN IN</Link>
                    </div>
                </div>

                <div className="signup-content">
                    <div className="welcome-section">
                        <h1 className="welcome-title">Welcome to Scheduler Study</h1>
                        <p className="welcome-subtitle">Register your account</p>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="signup-form">
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                className="form-input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="yourmail@gmail.com"
                                className="form-input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="studentId">Student ID (Optional)</label>
                            <input
                                type="text"
                                id="studentId"
                                name="studentId"
                                value={formData.studentId}
                                onChange={handleChange}
                                placeholder="Your student ID"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="8+ characters"
                                    className="form-input"
                                    required
                                />
                                <button type="button" className="password-toggle">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Re-enter password"
                                    className="form-input"
                                    required
                                />
                                <button type="button" className="password-toggle">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="signup-button"
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="social-signup">
                        <p className="social-text">Create account with</p>
                        <div className="social-buttons">
                            <button className="social-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </button>
                            <button className="social-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                            </button>
                            <button className="social-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
