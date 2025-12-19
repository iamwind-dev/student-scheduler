/**
 * SIDEBAR COMPONENT
 * Navigation sidebar with menu items
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose, currentPath }) => {
    const location = useLocation();

    const menuItems = [
        {
            path: '/',
            label: 'Dashboard',
            icon: '📊',
            description: 'Tổng quan hệ thống'
        },
        {
            path: '/courses',
            label: 'Môn học',
            icon: '📚',
            description: 'Quản lý môn học và tín chỉ'
        },
        // {
        //     path: '/preferences',
        //     label: 'Ràng buộc',
        //     icon: '⚙️',
        //     description: 'Đang phát triển',
        //     disabled: true
        // },
        {
            path: '/schedule',
            label: 'Thời khóa biểu',
            icon: '📅',
            description: 'Tự tạo & AI đề xuất'
        },
        {
            path: '/profile',
            label: 'Hồ sơ',
            icon: '👤',
            description: 'Hồ sơ cá nhân'
        }
    ];

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    const handleItemClick = (e, item) => {
        if (item.disabled) {
            e.preventDefault();
            return;
        }
        if (window.innerWidth <= 768) {
            onClose();
        }
    };

    return (
        <>
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <nav className="sidebar-nav">
                    <ul className="nav-list">
                        {menuItems.map((item) => (
                            <li key={item.path} className="nav-item">
                                <Link
                                    to={item.disabled ? '#' : item.path}
                                    className={`nav-link ${isActive(item.path) ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
                                    onClick={(e) => handleItemClick(e, item)}
                                    aria-current={isActive(item.path) ? 'page' : undefined}
                                    aria-disabled={item.disabled}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <div className="nav-content">
                                        <span className="nav-label">{item.label}</span>
                                        <span className="nav-description">{item.description}</span>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <div className="app-info">
                        <div className="app-version">
                            Version 2.0
                        </div>
                        <div className="app-build">
                            Build {new Date().getFullYear()}
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
