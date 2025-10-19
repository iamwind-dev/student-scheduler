/**
 * MAIN LAYOUT COMPONENT
 * Application layout with header, sidebar, and main content area
 */

import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div className={`layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <Header
                onToggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
            />

            <Sidebar
                isOpen={sidebarOpen}
                onClose={closeSidebar}
                currentPath={location.pathname}
            />

            <main className="main-content">
                <div className="content-wrapper">
                    <Outlet />
                </div>
            </main>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={closeSidebar}
                    aria-label="Đóng menu"
                />
            )}
        </div>
    );
};

export default Layout;
