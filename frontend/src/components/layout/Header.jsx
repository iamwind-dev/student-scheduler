/**
 * HEADER COMPONENT
 * Top navigation bar with user info and controls
 */

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { GraduationIcon } from '../common/Icons';
import './Header.css';

const Header = ({ onToggleSidebar, sidebarOpen }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useApp();

    const handleLogout = async () => {
        if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
            await logout();
        }
    };

    return (
        <header className="header">
            <div className="header-left">
                <button
                    className="sidebar-toggle"
                    onClick={onToggleSidebar}
                    aria-label={sidebarOpen ? 'Đóng menu' : 'Mở menu'}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        {sidebarOpen ? (
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        ) : (
                            <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        )}
                    </svg>
                </button>

                <div className="header-brand">
                    <h1 className="brand-title">
                        <GraduationIcon size={24} /> Student Scheduler
                    </h1>
                    <span className="brand-version"></span>
                </div>
            </div>

            <div className="header-right">
                <button
                    className="theme-toggle"
                    onClick={toggleTheme}
                    aria-label={`Chuyển sang ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                    {theme === 'light' ? (
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                                stroke="currentColor" strokeWidth="2" fill="none" />
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
                            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                        </svg>
                    )}
                </button>

                <div className="user-menu">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.name?.charAt(0) || user?.email?.charAt(0) || '?'}
                        </div>
                        <div className="user-details">
                            <div className="user-name">
                                {user?.name || 'User'}
                            </div>
                            <div className="user-role">
                                {user?.role?.roleName || 'Sinh viên'}
                            </div>
                        </div>
                    </div>

                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                        aria-label="Đăng xuất"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                                stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
