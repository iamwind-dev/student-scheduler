/**
 * PROTECTED ROUTE COMPONENT
 * Route protection with authentication check
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, roles = [], fallback = '/login' }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <LoadingSpinner
                fullscreen
                message="Đang kiểm tra quyền truy cập..."
            />
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
        return (
            <Navigate
                to={fallback}
                state={{ from: location }}
                replace
            />
        );
    }

    // Check role-based access if roles are specified
    if (roles.length > 0 && user.roles) {
        const hasRequiredRole = roles.some(role =>
            user.roles.includes(role)
        );

        if (!hasRequiredRole) {
            return (
                <Navigate
                    to="/unauthorized"
                    state={{ from: location }}
                    replace
                />
            );
        }
    }

    // Render protected content
    return children;
};

export default ProtectedRoute;
