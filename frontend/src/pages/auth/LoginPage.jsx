/**
 * LOGIN PAGE COMPONENT
 * Authentication page with Microsoft SSO
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './LoginPage.css';

const LoginPage = () => {
    const { user, isAuthenticated, isLoading, loginWithMicrosoft } = useAuth();

    // Redirect if already authenticated
    if (isAuthenticated && user) {
        return <Navigate to="/" replace />;
    }

    if (isLoading) {
        return (
            <LoadingSpinner
                fullscreen
                message="Đang kiểm tra trạng thái đăng nhập..."
            />
        );
    }

    const handleLogin = async () => {
        try {
            await loginWithMicrosoft();
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <div className="login-logo">
                        🎓
                    </div>
                    <h1 className="login-title">
                        Student Scheduler
                    </h1>
                    <p className="login-subtitle">
                        Hệ thống quản lý thời khóa biểu thông minh
                    </p>
                </div>

                <div className="login-content">
                    <div className="login-form">
                        <h2 className="form-title">
                            Đăng nhập để tiếp tục
                        </h2>

                        <button
                            className="login-btn microsoft-btn"
                            onClick={handleLogin}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" fill="currentColor" />
                            </svg>
                            Đăng nhập với Microsoft
                        </button>

                        <div className="login-divider">
                            <span>HOẶC</span>
                        </div>

                        <button
                            className="login-btn demo-btn"
                            onClick={() => window.location.href = '/'}
                        >
                            🎯 Truy cập Demo
                        </button>
                    </div>
                </div>

                <div className="login-footer">
                    <p>
                        © 2025 Student Scheduler.
                        Được phát triển by Phan Hoài Lăng ❤️.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
